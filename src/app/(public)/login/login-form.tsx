"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      // Map common NextAuth error codes to user-friendly messages
      const map: Record<string, string> = {
        CredentialsSignin: "Credenciais inválidas",
        AccessDenied: "Acesso negado",
        Configuration: "Erro de configuração de autenticação",
      };
      setErro(map[err] ?? "Erro ao autenticar");
    }
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const senha = String(formData.get("senha") || "");

    const resposta = await signIn("credentials", {
      redirect: false,
      email,
      senha
    });

    setCarregando(false);

    if (resposta?.error) {
      setErro("Credenciais inválidas");
      return;
    }

    router.replace("/");
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <label htmlFor="senha">Senha</label>
        <input id="senha" name="senha" type="password" required autoComplete="current-password" />
      </div>
      <div className="flex items-center space-x-2">
        <input id="manter" name="manter" type="checkbox" defaultChecked className="w-4 h-4" />
        <label htmlFor="manter" className="!mb-0 text-sm text-slate-700">
          Manter conectado por 30 dias
        </label>
      </div>
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <button type="submit" disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
