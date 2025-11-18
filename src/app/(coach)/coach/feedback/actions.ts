import { prisma } from "@/lib/prisma";
import { assertCoach } from "@/lib/roles";

export async function getFeedbacks() {
  await assertCoach();

  // Busca feedbacks com informações relacionadas
  const feedbacks = await prisma.feedback.findMany({
    include: {
      aluno: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      treino: {
        select: {
          id: true,
          dataTreino: true,
          conteudo: true,
        },
      },
    },
    orderBy: {
      enviadoEm: 'desc',
    },
  });

  return feedbacks;
}