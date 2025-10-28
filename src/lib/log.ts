import { prisma } from "./prisma";

export async function registrarLog(usuarioId: number | null, tipoAcao: string, detalhes?: string) {
  await prisma.logAcao.create({
    data: {
      usuarioId: usuarioId ?? undefined,
      tipoAcao,
      detalhes
    }
  });
}
