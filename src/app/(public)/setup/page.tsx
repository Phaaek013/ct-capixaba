import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SetupForm } from './setup-form';

export default async function SetupPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // se já houver coach cadastrado, redireciona pro login
  const existeCoach = await prisma.usuario.count({ where: { tipo: 'Coach' } });
  if (existeCoach > 0) {
    redirect('/login');
  }

  const erro =
    typeof searchParams?.error === 'string' ? searchParams.error : null;

  const mensagem =
    erro === 'invalid'
      ? 'Verifique os dados informados (senha mínima 8 e confirmação igual).'
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

      <SetupForm />
    </div>
  );
}
