"use server";

import { registrarLog } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertCoach } from "@/lib/roles";
import { Prisma } from "@prisma/client";

function parseDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

export async function criarModelo(formData: FormData) {
  const session = await assertCoach();
  const nomeModelo = String(formData.get("nomeModelo") || "").trim();
  const conteudo = String(formData.get("conteudo") || "").trim();
  const videoUrl = String(formData.get("videoUrl") || "").trim();

  if (!nomeModelo || !conteudo) {
    redirect("/coach/modelos?error=invalid");
  }

  const modelo = await prisma.treino.create({
    data: {
      ehModelo: true,
      nomeModelo,
      conteudo,
      videoUrl: videoUrl || null
    }
  });

  await registrarLog(Number(session.user.id), "CRIAR_MODELO", `Modelo ${modelo.id}`);
  revalidatePath("/coach/modelos");
  redirect("/coach/modelos?sucesso=criado");
}

export async function usarModelo(formData: FormData) {
  const session = await assertCoach();
  const modeloId = Number(formData.get("modeloId"));
  const alunoId = Number(formData.get("alunoId"));
  const dataTreino = String(formData.get("dataTreino") || "");

  if (!modeloId || !alunoId || !dataTreino) {
    redirect("/coach/modelos?error=invalid");
  }

  const modelo = await prisma.treino.findFirst({ where: { id: modeloId, ehModelo: true } });
  if (!modelo) {
    redirect("/coach/modelos?error=notfound");
  }

  const data = parseDate(dataTreino);
  const existente = await prisma.treino.findFirst({
    where: { alunoId, dataTreino: data, ehModelo: false }
  });

  if (existente) {
    redirect("/coach/modelos?error=duplicado");
  }

  const treino = await prisma.treino.create({
    data: {
      alunoId,
      dataTreino: data,
      conteudo: modelo.conteudo,
      videoUrl: modelo.videoUrl,
      ehModelo: false
    }
  });

  await registrarLog(Number(session.user.id), "USAR_MODELO", `Modelo ${modeloId} -> Treino ${treino.id}`);
  revalidatePath("/coach/modelos");
  redirect("/coach/modelos?sucesso=usado");
}

export async function removerModelo(formData: FormData) {
  const session = await assertCoach();
  const modeloId = Number(formData.get("modeloId"));

  if (!modeloId) {
    redirect("/coach/modelos?error=invalid");
  }

  try {
    await prisma.treino.delete({ where: { id: modeloId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      redirect("/coach/modelos?error=notfound");
    }
    throw error;
  }

  await registrarLog(Number(session.user.id), "REMOVER_MODELO", `Modelo ${modeloId}`);
  revalidatePath("/coach/modelos");
  redirect("/coach/modelos?sucesso=removido");
}
