"use server";

import { registrarLog } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertCoach } from "@/lib/roles";

function parseDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

export async function criarTreino(formData: FormData) {
  const session = await assertCoach();

  const alunoId = Number(formData.get("alunoId"));
  const dataTreino = String(formData.get("dataTreino") || "");
  const conteudo = String(formData.get("conteudo") || "").trim();
  const videoUrlRaw = String(formData.get("videoUrl") || "").trim();
  const origemTreinoId = formData.get("origemTreinoId") ? Number(formData.get("origemTreinoId")) : null;

  if (!alunoId || !dataTreino || !conteudo) {
    redirect("/coach/treinos?error=invalid");
  }

  const data = parseDate(dataTreino);
  const existente = await prisma.treino.findFirst({
    where: {
      alunoId,
      dataTreino: data,
      ehModelo: false
    }
  });

  if (existente) {
    redirect("/coach/treinos?error=duplicado");
  }

  const treino = await prisma.treino.create({
    data: {
      alunoId,
      dataTreino: data,
      conteudo,
      videoUrl: videoUrlRaw || null,
      ehModelo: false
    }
  });

  await registrarLog(
    Number(session.user.id),
    origemTreinoId ? "DUPLICAR_TREINO" : "CRIAR_TREINO",
    origemTreinoId ? `Base ${origemTreinoId} -> ${treino.id}` : `Treino ${treino.id}`
  );

  revalidatePath("/coach/treinos");
  redirect("/coach/treinos?sucesso=1");
}
