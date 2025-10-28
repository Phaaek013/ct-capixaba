import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LoginForm from "./login-form";
import { TipoUsuario } from "@prisma/client";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    if (session.user.senhaPrecisaTroca) {
      redirect("/primeiro-acesso/alterar-senha");
    }
    if (session.user.tipo === "Coach") {
      redirect("/coach");
    }
    redirect("/aluno");
  }

  const totalCoaches = await prisma.usuario.count({ where: { tipo: TipoUsuario.Coach } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <LoginForm />
      {totalCoaches === 0 && (
        <p className="text-sm text-slate-600">
          Nenhum coach cadastrado ainda. <Link href="/setup">Configurar primeiro coach</Link>.
        </p>
      )}
    </div>
  );
}
