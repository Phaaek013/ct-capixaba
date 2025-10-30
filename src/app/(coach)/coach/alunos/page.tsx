import { prisma } from "@/lib/prisma";
import { criarAluno, atualizarAluno, removerAluno } from "./actions";
import { ConfirmSubmitButton } from "./confirm-submit-button";
import { assertCoach } from "@/lib/roles";

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function AlunosPage({ searchParams }: PageProps) {
  await assertCoach();

  const termo = typeof searchParams?.q === "string" ? searchParams?.q : "";
  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;
  const mensagemSucesso = typeof searchParams?.sucesso === "string" ? searchParams?.sucesso : null;

  const alunos = await prisma.usuario.findMany({
  where: {
    tipo: 'Aluno',
    ...(termo
      ? {
          OR: [
            { nome: { contains: termo, mode: 'insensitive' } },
            { email: { contains: termo, mode: 'insensitive' } },
          ],
        }
      : {}),
  },
  orderBy: { createdAt: 'desc' },
});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Alunos</h1>
        <form method="get" className="flex flex-col sm:flex-row gap-2">
          <input
            name="q"
            placeholder="Buscar por nome ou email"
            defaultValue={termo}
            className="sm:flex-1"
          />
          <button type="submit" className="self-start sm:self-auto">
            Buscar
          </button>
        </form>
        {mensagemErro === "email" && (
          <p className="text-sm text-red-600">Este email já está em uso.</p>
        )}
        {mensagemErro === "invalid" && (
          <p className="text-sm text-red-600">Preencha todos os campos corretamente.</p>
        )}
        {mensagemSucesso && (
          <p className="text-sm text-green-600">Operação realizada com sucesso.</p>
        )}
      </div>

      <section className="bg-white shadow rounded p-4 space-y-4">
        <h2 className="text-xl font-semibold">Cadastrar novo aluno</h2>
        <form action={criarAluno} className="space-y-3">
          <div>
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="senhaInicial">Senha inicial</label>
            <input id="senhaInicial" name="senhaInicial" type="password" minLength={8} required />
            <p className="text-xs text-slate-500">O aluno precisará alterar no primeiro acesso.</p>
          </div>
          <button type="submit">Criar aluno</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Lista</h2>
        {alunos.length === 0 ? (
          <p>Nenhum aluno cadastrado.</p>
        ) : (
          <ul className="space-y-4">
            {alunos.map((aluno) => (
              <li key={aluno.id} className="bg-white shadow rounded p-4 space-y-3">
                <div className="text-sm text-slate-600">
                  Criado em {new Date(aluno.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </div>
                <form action={atualizarAluno} className="space-y-3">
                  <input type="hidden" name="id" value={aluno.id} />
                  <div>
                    <label htmlFor={`nome-${aluno.id}`}>Nome</label>
                    <input id={`nome-${aluno.id}`} name="nome" defaultValue={aluno.nome} required />
                  </div>
                  <div>
                    <label htmlFor={`email-${aluno.id}`}>Email</label>
                    <input id={`email-${aluno.id}`} name="email" type="email" defaultValue={aluno.email} required />
                  </div>
                  <button type="submit">Salvar</button>
                </form>
                <form action={removerAluno} className="inline">
                  <input type="hidden" name="id" value={aluno.id} />
                  <ConfirmSubmitButton
                    type="submit"
                    message="Confirmar remoção do aluno?"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remover
                  </ConfirmSubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
