"use server";

import { registrarLog } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/utils/crypto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertCoach } from "@/lib/roles";

export async function criarAluno(formData: FormData) {
  const session = await assertCoach();
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase();
  const senhaInicial = String(formData.get("senhaInicial") || "");

  if (!nome || !email || !senhaInicial || senhaInicial.length < 8) {
    redirect("/coach/alunos?error=invalid");
  }

  const senhaHash = await hashSenha(senhaInicial);
  try {
    const aluno = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        tipo: 'Aluno',
        senhaPrecisaTroca: true
      }
    });
    await registrarLog(Number(session.user.id), "CRIAR_ALUNO", `Aluno ${aluno.id}`);
    revalidatePath("/coach/alunos");
    redirect("/coach/alunos?sucesso=criado");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/coach/alunos?error=email");
    }
    throw error;
  }
}

export async function atualizarAluno(formData: FormData) {
  const session = await assertCoach();
  const id = Number(formData.get("id"));
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase();

  if (!id || !nome || !email) {
    redirect("/coach/alunos?error=invalid");
  }

  try {
    const aluno = await prisma.usuario.update({
      where: { id },
      data: { nome, email }
    });
    await registrarLog(Number(session.user.id), "EDITAR_ALUNO", `Aluno ${aluno.id}`);
    revalidatePath("/coach/alunos");
    redirect("/coach/alunos?sucesso=atualizado");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/coach/alunos?error=email");
    }
    throw error;
  }
}

export async function removerAluno(formData: FormData) {
  const session = await assertCoach();
  const id = Number(formData.get("id"));
  if (!id) {
    redirect("/coach/alunos?error=invalid");
  }

  await prisma.usuario.delete({ where: { id } });
  await registrarLog(Number(session.user.id), "REMOVER_ALUNO", `Aluno ${id}`);
  revalidatePath("/coach/alunos");
  redirect("/coach/alunos?sucesso=removido");
}
