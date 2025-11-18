import { prisma } from "@/lib/prisma";
import { criarTreino } from "./actions";
import Link from "next/link";
import { assertCoach } from "@/lib/roles";

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

function formatarData(data: Date) {
  return data.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default async function TreinosPage({ searchParams }: PageProps) {
  await assertCoach();

  const origemId = Number(typeof searchParams?.origem === "string" ? searchParams?.origem : 0) || null;
  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;
  const mensagemSucesso = typeof searchParams?.sucesso === "string" ? searchParams?.sucesso : null;

  const [alunos, treinos, origemTreino] = await Promise.all([
    prisma.usuario.findMany({ where: { tipo: 'Aluno' }, orderBy: { nome: "asc" } }),
    prisma.treino.findMany({
      where: { ehModelo: false },
      include: { aluno: true },
      orderBy: { dataTreino: "desc" },
      take: 30
    }),
    origemId
      ? prisma.treino.findUnique({ where: { id: origemId }, include: { aluno: true } })
      : Promise.resolve(null)
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Treinos</h1>
        {mensagemErro === "invalid" && (
          <p className="text-sm text-red-600">Informe aluno, data e conteúdo.</p>
        )}
        {mensagemErro === "duplicado" && (
          <p className="text-sm text-red-600">Já existe um treino para este aluno nesta data.</p>
        )}
        {mensagemSucesso && <p className="text-sm text-green-600">Treino salvo com sucesso.</p>}
      </div>

      <section className="bg-white shadow rounded p-4 space-y-4">
        <h2 className="text-xl font-semibold">Cadastrar treino</h2>
        {origemTreino && (
          <p className="text-sm text-slate-600">
            Duplicando treino #{origemTreino.id} de {origemTreino.aluno?.nome ?? "Modelo"}.
          </p>
        )}
        <form action={criarTreino} className="space-y-3">
          <input type="hidden" name="origemTreinoId" value={origemTreino?.id ?? ""} />
          <div>
            <label htmlFor="alunoId">Aluno</label>
            <select id="alunoId" name="alunoId" defaultValue="" required>
              <option value="" disabled>
                Selecione um aluno
              </option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dataTreino">Data do treino</label>
            <input id="dataTreino" name="dataTreino" type="date" required />
          </div>
          <div>
            <label htmlFor="conteudo">Conteúdo</label>
            <textarea
              id="conteudo"
              name="conteudo"
              rows={6}
              required
              defaultValue={origemTreino?.conteudo ?? ""}
            />
          </div>
          <div>
            <label htmlFor="videoUrl">URL do vídeo (opcional)</label>
            <input id="videoUrl" name="videoUrl" defaultValue={origemTreino?.videoUrl ?? ""} />
          </div>
          <button type="submit">Salvar treino</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Últimos treinos</h2>
        {treinos.length === 0 ? (
          <p>Nenhum treino cadastrado ainda.</p>
        ) : (
          <ul className="space-y-4">
            {treinos.map((treino) => (
              <li key={treino.id} className="bg-white shadow rounded p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">{treino.aluno?.nome ?? "Aluno removido"}</p>
                    <p className="text-sm text-slate-600">{formatarData(treino.dataTreino ?? new Date())}</p>
                  </div>
                  <Link
                    href={`/coach/treinos?origem=${treino.id}`}
                    className="bg-slate-200 text-slate-800 px-3 py-2 rounded hover:bg-slate-300"
                  >
                    Duplicar
                  </Link>
                </div>
                <p className="text-sm whitespace-pre-wrap text-slate-700">{treino.conteudo}</p>
                {treino.videoUrl && (
                  <a href={treino.videoUrl} target="_blank" rel="noreferrer" className="text-blue-600">
                    Ver vídeo
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
