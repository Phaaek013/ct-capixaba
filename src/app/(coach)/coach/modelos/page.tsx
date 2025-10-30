import { prisma } from "@/lib/prisma";
import { criarModelo, usarModelo, removerModelo } from "./actions";
import { assertCoach } from "@/lib/roles";

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function ModelosPage({ searchParams }: PageProps) {
  await assertCoach();

  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;
  const mensagemSucesso = typeof searchParams?.sucesso === "string" ? searchParams?.sucesso : null;

  const [modelos, alunos] = await Promise.all([
    prisma.treino.findMany({ where: { ehModelo: true }, orderBy: { updatedAt: "desc" } }),
  prisma.usuario.findMany({ where: { tipo: 'Aluno' }, orderBy: { nome: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Modelos de treino</h1>
        {mensagemErro === "invalid" && (
          <p className="text-sm text-red-600">Preencha os campos obrigatórios.</p>
        )}
        {mensagemErro === "duplicado" && (
          <p className="text-sm text-red-600">Já existe treino para este aluno na data escolhida.</p>
        )}
        {mensagemErro === "notfound" && (
          <p className="text-sm text-red-600">Modelo não encontrado.</p>
        )}
        {mensagemSucesso === "criado" && (
          <p className="text-sm text-green-600">Modelo salvo.</p>
        )}
        {mensagemSucesso === "usado" && (
          <p className="text-sm text-green-600">Treino criado a partir do modelo.</p>
        )}
        {mensagemSucesso === "removido" && (
          <p className="text-sm text-green-600">Modelo removido.</p>
        )}
      </div>

      <section className="bg-white shadow rounded p-4 space-y-4">
        <h2 className="text-xl font-semibold">Novo modelo</h2>
        <form action={criarModelo} className="space-y-3">
          <div>
            <label htmlFor="nomeModelo">Nome do modelo</label>
            <input id="nomeModelo" name="nomeModelo" required />
          </div>
          <div>
            <label htmlFor="conteudo">Conteúdo</label>
            <textarea id="conteudo" name="conteudo" rows={6} required />
          </div>
          <div>
            <label htmlFor="videoUrl">URL do vídeo (opcional)</label>
            <input id="videoUrl" name="videoUrl" />
          </div>
          <button type="submit">Salvar modelo</button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modelos salvos</h2>
        {modelos.length === 0 ? (
          <p>Nenhum modelo cadastrado.</p>
        ) : (
          <ul className="space-y-4">
            {modelos.map((modelo) => (
              <li key={modelo.id} className="bg-white shadow rounded p-4 space-y-3">
                <div>
                  <p className="font-medium">{modelo.nomeModelo}</p>
                  <p className="text-xs text-slate-600">
                    Atualizado em {new Date(modelo.updatedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </p>
                </div>
                <p className="text-sm whitespace-pre-wrap text-slate-700">{modelo.conteudo}</p>
                {modelo.videoUrl && (
                  <a href={modelo.videoUrl} target="_blank" rel="noreferrer" className="text-blue-600">
                    Ver vídeo
                  </a>
                )}
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                  <form action={usarModelo} className="grid gap-2 sm:grid-cols-3">
                    <input type="hidden" name="modeloId" value={modelo.id} />
                    <div className="sm:col-span-1">
                      <label htmlFor={`aluno-${modelo.id}`} className="sr-only">
                        Aluno
                      </label>
                      <select id={`aluno-${modelo.id}`} name="alunoId" defaultValue="" required>
                        <option value="" disabled>
                          Escolha o aluno
                        </option>
                        {alunos.map((aluno) => (
                          <option key={aluno.id} value={aluno.id}>
                            {aluno.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label htmlFor={`data-${modelo.id}`} className="sr-only">
                        Data
                      </label>
                      <input id={`data-${modelo.id}`} name="dataTreino" type="date" required />
                    </div>
                    <button type="submit" className="sm:col-span-1">
                      Usar modelo
                    </button>
                  </form>
                  <form action={removerModelo} className="flex items-center sm:justify-end">
                    <input type="hidden" name="modeloId" value={modelo.id} />
                    <button type="submit" className="text-red-600 hover:text-red-700">
                      Remover modelo
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
