"use server";

import { authOptions } from "@/auth";
import { getConfig } from "@/lib/config";
import { registrarLog } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export async function salvarConfig(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  if (session.user.tipo !== "Coach") {
    redirect(session.user.tipo === "Aluno" ? "/aluno" : "/login");
  }

  const limite = Number(formData.get("limiteAlunos"));
  if (!Number.isInteger(limite) || limite <= 0) {
    redirect("/coach/config?error=invalid");
  }

  const config = await getConfig();
  await prisma.config.update({
    where: { id: config.id },
    data: { limiteAlunos: limite }
  });

  await registrarLog(Number(session.user.id), "ATUALIZAR_CONFIG", `Limite ${limite}`);
  revalidatePath("/coach/config");
  redirect("/coach/config?sucesso=1");
}
