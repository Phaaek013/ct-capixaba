'use client';

import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-black p-2 text-white hover:bg-neutral-800 disabled:bg-neutral-400"
    >
      {pending ? 'Criando...' : 'Criar Coach'}
    </button>
  );
}

export function SetupForm() {
  return (
    <form action="/api/setup" method="POST" className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="nome" className="block text-sm font-medium">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          className="w-full rounded-md border border-neutral-300 bg-white p-2 outline-none focus:border-black"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-neutral-300 bg-white p-2 outline-none focus:border-black"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="senha" className="block text-sm font-medium">
          Senha (mín. 8)
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          minLength={8}
          required
          className="w-full rounded-md border border-neutral-300 bg-white p-2 outline-none focus:border-black"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmar" className="block text-sm font-medium">
          Confirmar senha
        </label>
        <input
          id="confirmar"
          name="confirmar"
          type="password"
          minLength={8}
          required
          className="w-full rounded-md border border-neutral-300 bg-white p-2 outline-none focus:border-black"
        />
      </div>

      <SubmitButton />
    </form>
  );
}