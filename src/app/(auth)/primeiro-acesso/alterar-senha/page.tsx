import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { compararSenha, hashSenha } from "@/utils/crypto";
import { registrarLog } from "@/lib/log";
import { revalidatePath } from "next/cache";

async function alterarSenha(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const senhaAtual = String(formData.get("senhaAtual") || "");
  const novaSenha = String(formData.get("novaSenha") || "");
  const confirmar = String(formData.get("confirmar") || "");

  if (novaSenha.length < 8 || novaSenha !== confirmar) {
    redirect("/primeiro-acesso/alterar-senha?error=invalid");
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(session.user.id) } });
  if (!usuario) {
    redirect("/login");
  }

  const confere = await compararSenha(senhaAtual, usuario!.senhaHash);
  if (!confere) {
    redirect("/primeiro-acesso/alterar-senha?error=senha");
  }

  const novaHash = await hashSenha(novaSenha);

  await prisma.usuario.update({
    where: { id: usuario!.id },
    data: { senhaHash: novaHash, senhaPrecisaTroca: false }
  });

  await registrarLog(usuario!.id, "ALTERAR_SENHA");
  revalidatePath("/");
  if (usuario!.tipo === "Coach") {
    redirect("/coach");
  }
  redirect("/aluno");
}

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function AlterarSenhaPrimeiroAcesso({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Alterar senha</h1>
      <p className="text-sm text-slate-600">
        Defina uma nova senha para continuar usando o sistema.
      </p>
      {mensagemErro === "invalid" && (
        <p className="text-sm text-red-600">As senhas precisam corresponder e ter pelo menos 8 caracteres.</p>
      )}
      {mensagemErro === "senha" && <p className="text-sm text-red-600">Senha atual incorreta.</p>}
      <form action={alterarSenha} className="space-y-4">
        <div>
          <label htmlFor="senhaAtual">Senha atual</label>
          <input id="senhaAtual" name="senhaAtual" type="password" required />
        </div>
        <div>
          <label htmlFor="novaSenha">Nova senha</label>
          <input id="novaSenha" name="novaSenha" type="password" minLength={8} required />
        </div>
        <div>
          <label htmlFor="confirmar">Confirmar nova senha</label>
          <input id="confirmar" name="confirmar" type="password" minLength={8} required />
        </div>
        <button type="submit">Salvar nova senha</button>
      </form>
    </div>
  );
}
