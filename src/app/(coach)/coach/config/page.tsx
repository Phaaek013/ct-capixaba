import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { salvarConfig } from "./actions";

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function ConfigPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  if (session.user.tipo !== "Coach") {
    redirect(session.user.tipo === "Aluno" ? "/aluno" : "/login");
  }

  const [config, totalAlunos, totalTreinos, totalDocumentos] = await Promise.all([
    getConfig(),
  prisma.usuario.count({ where: { tipo: 'Aluno' } }),
    prisma.treino.count({ where: { ehModelo: false } }),
    prisma.documentoPDF.count()
  ]);
  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;
  const mensagemSucesso = typeof searchParams?.sucesso === "string" ? searchParams?.sucesso : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Configurações</h1>
        {mensagemErro === "invalid" && (
          <p className="text-sm text-red-600">Informe um número inteiro maior que zero.</p>
        )}
        {mensagemSucesso && <p className="text-sm text-green-600">Configuração atualizada.</p>}
      </div>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Visão geral</h2>
          <ul className="grid gap-3 sm:grid-cols-3 text-sm">
            <li className="rounded border border-slate-700 p-3">
              <p className="text-xs uppercase text-slate-400">Alunos ativos</p>
              <p className="text-2xl font-semibold">{totalAlunos}</p>
            </li>
            <li className="rounded border border-slate-700 p-3">
              <p className="text-xs uppercase text-slate-400">Treinos registrados</p>
              <p className="text-2xl font-semibold">{totalTreinos}</p>
            </li>
            <li className="rounded border border-slate-700 p-3">
              <p className="text-xs uppercase text-slate-400">PDFs enviados</p>
              <p className="text-2xl font-semibold">{totalDocumentos}</p>
            </li>
          </ul>
        </div>

        <div className="rounded border border-slate-700 p-4 space-y-4 max-w-md">
          <h2 className="text-xl font-semibold">Capacidade de alunos</h2>
          <form action={salvarConfig} className="space-y-3">
            <div>
              <label htmlFor="limiteAlunos">Limite de alunos</label>
              <input
                id="limiteAlunos"
                name="limiteAlunos"
                type="number"
                min={1}
                defaultValue={config.limiteAlunos}
                required
              />
            </div>
            <button type="submit">Salvar</button>
          </form>
          <p className="text-xs text-slate-500">
            Registro criado em {new Date(config.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.
          </p>
        </div>
      </section>
    </div>
  );
}
