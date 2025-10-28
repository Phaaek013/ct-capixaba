"use server";

import { authOptions } from "@/auth";
import { registrarLog } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { promises as fs } from "fs";
import path from "path";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60) || "documento";
}

async function garantirCoach() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  if (session.user.tipo !== "Coach") {
    redirect(session.user.tipo === "Aluno" ? "/aluno" : "/login");
  }
  return session;
}

export async function uploadPdf(formData: FormData) {
  const session = await garantirCoach();
  const titulo = String(formData.get("titulo") || "").trim();
  const alunosSelecionados = formData
    .getAll("alunosIds")
    .map((valor) => Number(valor))
    .filter((valor) => Number.isInteger(valor));
  const arquivo = formData.get("arquivo") as File | null;

  if (!titulo || alunosSelecionados.length === 0 || !arquivo) {
    redirect("/coach/pdfs?error=invalid");
  }

  if (arquivo.type !== "application/pdf") {
    redirect("/coach/pdfs?error=formato");
  }

  const arrayBuffer = await arquivo.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeName = `${Date.now()}-${slugify(titulo)}.pdf`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, safeName);
  await fs.writeFile(filePath, buffer);

  const documento = await prisma.documentoPDF.create({
    data: {
      titulo,
      filePath: `/uploads/${safeName}`,
      dataEnvio: new Date(),
      alunos: {
        connect: alunosSelecionados.map((id) => ({ id }))
      }
    }
  });

  await registrarLog(
    Number(session.user.id),
    "ENVIAR_PDF",
    `${titulo} (${alunosSelecionados.length} aluno${alunosSelecionados.length === 1 ? "" : "s"})`
  );
  revalidatePath("/coach/pdfs");
  redirect("/coach/pdfs?sucesso=1");
}

export async function removePdf(formData: FormData) {
  const session = await garantirCoach();
  const id = Number(formData.get("id"));
  if (!id) {
    redirect("/coach/pdfs?error=invalid");
  }

  const documento = await prisma.documentoPDF.findUnique({ where: { id } });
  if (documento) {
    const absolutePath = path.join(process.cwd(), "public", documento.filePath.replace(/^\/+/, ""));
    await fs.unlink(absolutePath).catch(() => undefined);
  }

  await prisma.documentoPDF.delete({ where: { id } });
  await registrarLog(Number(session.user.id), "REMOVER_PDF", `id:${id}`);
  revalidatePath("/coach/pdfs");
  redirect("/coach/pdfs?sucesso=2");
}
