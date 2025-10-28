"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { registrarLog } from "@/lib/log";
import { prisma } from "@/lib/prisma";

export type FeedbackActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

const SESSION_ERROR: FeedbackActionState = {
  status: "error",
  message: "Sessão expirada. Faça login novamente."
};

function parseOptionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createFeedback(
  _state: FeedbackActionState,
  formData: FormData
): Promise<FeedbackActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return SESSION_ERROR;
    }

    if (session.user.tipo !== "Aluno") {
      return { status: "error", message: "Acesso não autorizado." };
    }

    const alunoId = Number(session.user.id);
    const treinoId = Number(formData.get("treinoId"));
    const nota = Number(formData.get("nota"));
    const rpe = parseOptionalText(formData.get("rpe"));
    const observacoes = parseOptionalText(formData.get("observacoes"));

    if (!Number.isInteger(treinoId) || treinoId <= 0) {
      return { status: "error", message: "Treino inválido." };
    }

    if (!Number.isInteger(nota) || nota < 1 || nota > 10) {
      return { status: "error", message: "Informe uma nota entre 1 e 10." };
    }

    const treino = await prisma.treino.findFirst({
      where: {
        id: treinoId,
        alunoId,
        ehModelo: false
      }
    });

    if (!treino) {
      return { status: "error", message: "Treino não encontrado." };
    }

    const existente = await prisma.feedback.findUnique({
      where: {
        alunoId_treinoId: {
          alunoId,
          treinoId
        }
      }
    });

    if (existente) {
      return { status: "error", message: "Feedback do dia já enviado." };
    }

    await prisma.feedback.create({
      data: {
        alunoId,
        treinoId,
        nota,
        rpe,
        observacoes,
        enviadoEm: new Date()
      }
    });

    await registrarLog(alunoId, "FEEDBACK", "create");
    await revalidatePath("/aluno");

    return { status: "success", message: "Feedback enviado com sucesso." };
  } catch (error) {
    console.error("Erro ao criar feedback", error);
    return { status: "error", message: "Não foi possível enviar o feedback." };
  }
}

export async function updateFeedback(
  _state: FeedbackActionState,
  formData: FormData
): Promise<FeedbackActionState> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return SESSION_ERROR;
    }

    if (session.user.tipo !== "Aluno") {
      return { status: "error", message: "Acesso não autorizado." };
    }

    const alunoId = Number(session.user.id);
    const feedbackId = Number(formData.get("feedbackId"));
    const treinoId = Number(formData.get("treinoId"));
    const nota = Number(formData.get("nota"));
    const rpe = parseOptionalText(formData.get("rpe"));
    const observacoes = parseOptionalText(formData.get("observacoes"));

    if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
      return { status: "error", message: "Feedback inválido." };
    }

    if (!Number.isInteger(treinoId) || treinoId <= 0) {
      return { status: "error", message: "Treino inválido." };
    }

    if (!Number.isInteger(nota) || nota < 1 || nota > 10) {
      return { status: "error", message: "Informe uma nota entre 1 e 10." };
    }

    const existente = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });

    if (!existente || existente.alunoId !== alunoId || existente.treinoId !== treinoId) {
      return { status: "error", message: "Feedback não encontrado." };
    }

    await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        nota,
        rpe,
        observacoes,
        enviadoEm: new Date()
      }
    });

    await registrarLog(alunoId, "FEEDBACK", "update");
    await revalidatePath("/aluno");

    return { status: "success", message: "Feedback atualizado." };
  } catch (error) {
    console.error("Erro ao atualizar feedback", error);
    return { status: "error", message: "Não foi possível atualizar o feedback." };
  }
}
