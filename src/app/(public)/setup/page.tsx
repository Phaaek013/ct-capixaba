import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/utils/crypto";
import { TipoUsuario } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function criarPrimeiroCoach(formData: FormData) {
  "use server";

  const nome = (formData.get("nome") as string)?.trim();
  const email = (formData.get("email") as string)?.toLowerCase();
  const senha = formData.get("senha") as string;
  const confirmar = formData.get("confirmar") as string;

  if (!nome || !email || !senha || senha.length < 8 || senha !== confirmar) {
    redirect("/setup?error=invalid");
  }

  const existeCoach = await prisma.usuario.count({ where: { tipo: TipoUsuario.Coach } });
  if (existeCoach > 0) {
    redirect("/login");
  }

  const senhaHash = await hashSenha(senha);
  await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      tipo: TipoUsuario.Coach,
      senhaPrecisaTroca: false
    }
  });

  revalidatePath("/login");
  redirect("/login");
}

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function SetupPage({ searchParams }: PageProps) {
  const existeCoach = await prisma.usuario.count({ where: { tipo: TipoUsuario.Coach } });
  if (existeCoach > 0) {
    redirect("/login");
  }

  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurar primeiro Coach</h1>
      {mensagemErro === "invalid" && (
        <p className="text-sm text-red-600">Verifique os dados informados e tente novamente.</p>
      )}
      <form action={criarPrimeiroCoach} className="max-w-md space-y-4">
        <div>
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" minLength={8} required />
        </div>
        <div>
          <label htmlFor="confirmar">Confirmar senha</label>
          <input id="confirmar" name="confirmar" type="password" minLength={8} required />
        </div>
        <button type="submit">Criar Coach</button>
      </form>
    </div>
  );
}
