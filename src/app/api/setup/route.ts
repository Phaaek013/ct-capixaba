import { prisma } from '@/lib/prisma';
import { hashSenha } from '@/utils/crypto';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  const nome      = String(formData.get('nome') ?? '').trim();
  const emailRaw  = String(formData.get('email') ?? '').trim();
  const senha     = String(formData.get('senha') ?? '');
  const confirmar = String(formData.get('confirmar') ?? '');

  const email = emailRaw.toLowerCase();

  // validação simples
  if (!nome || !email || !senha || senha.length < 8 || senha !== confirmar) {
    return redirect('/setup?error=invalid');
  }

  // se já existir coach, manda pro login
  const jaExiste = await prisma.usuario.count({ where: { tipo: 'Coach' } });
  if (jaExiste > 0) {
    return redirect('/login');
  }

  try {
    const senhaHash = await hashSenha(senha);

    await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        tipo: 'Coach',
        senhaPrecisaTroca: false,
      },
    });

    return redirect('/login');
  } catch (err: any) {
    // e-mail já em uso (índice único do Prisma)
    if (err?.code === 'P2002') {
      return redirect('/setup?error=email');
    }
    // fallback
    return redirect('/setup?error=unknown');
  }
}