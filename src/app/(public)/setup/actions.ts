'use server';

import { prisma } from '@/lib/prisma';
import { hashSenha } from '@/utils/crypto';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function criarCoach(formData: FormData) {
  // Verificar se a requisição é POST
  const headersList = headers();
  const method = headersList.get('x-method') || 'GET';
  if (method !== 'POST') {
    throw new Error('Method not allowed');
  }

  const nome      = String(formData.get('nome') ?? '').trim();
  const emailRaw  = String(formData.get('email') ?? '').trim();
  const senha     = String(formData.get('senha') ?? '');
  const confirmar = String(formData.get('confirmar') ?? '');

  const email = emailRaw.toLowerCase();

  // validação simples
  if (!nome || !email || !senha || senha.length < 8 || senha !== confirmar) {
    redirect('/setup?error=invalid');
  }

  // se já existir coach, manda pro login
  const jaExiste = await prisma.usuario.count({ where: { tipo: 'Coach' } });
  if (jaExiste > 0) {
    redirect('/login');
  }

  try {
    const senhaHash = await hashSenha(senha);

    await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        tipo: 'Coach',             // string (sem enum)
        senhaPrecisaTroca: false,
      },
    });

    redirect('/login');
  } catch (err: any) {
    // e-mail já em uso (índice único do Prisma)
    if (err?.code === 'P2002') {
      redirect('/setup?error=email');
    }
    // fallback
    redirect('/setup?error=unknown');
  }
}
