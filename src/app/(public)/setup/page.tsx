import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

type PageProps = { searchParams?: Record<string, string | string[]> };

export default async function SetupPage({ searchParams }: PageProps) {
  const existeCoach = await prisma.usuario.count({ where: { tipo: 'Coach' } });
  if (existeCoach > 0) {
    redirect('/login');
  }

  const erro = typeof searchParams?.error === 'string' ? searchParams.error : null;
  const mensagem =
    erro === 'invalid'
      ? 'Verifique os dados (senha mínima 8 e confirmação igual).'
      : erro === 'email'
      ? 'Este e-mail já está em uso.'
      : erro === 'unknown'
      ? 'Não foi possível concluir. Tente novamente.'
      : null;

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Configurar o primeiro Coach</h1>

      {mensagem && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{mensagem}</p>
      )}

      <form method="POST" action="/api/setup" className="space-y-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="nome" className="block text-sm font-medium">Nome</label>
          <input id="nome" name="nome" type="text" required
                 className="w-full rounded-md border border-neutral-300 bg-white p-2 outline-none focus:border-black" />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">E-mail</label>
          <input id="email" name="email" type="email" required
                 className="w-full rounded-md border border-neutral-300 bg-white p-2 outline-none focus:border-black" />
        </div>

        <div className="space-y-1">
          <label htmlFor="senha" className="block text-sm font-medium">Senha (mín. 8)</label>
          <input id="senha" name="senha" type="password" minLength={8} required
                 className="w-full rounded-md border border-neutral-300 bg-white p-2 outline-none focus:border-black" />
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmar" className="block text-sm font-medium">Confirmar senha</label>
          <input id="confirmar" name="confirmar" type="password" minLength={8} required
                 className="w-full rounded-md border border-neutral-300 bg-white p-2 outline-none focus:border-black" />
        </div>

        <button type="submit" className="w-full rounded-md bg-black p-2 text-white hover:bg-neutral-800">
          Criar Coach
        </button>
      </form>
    </div>
  );
}
