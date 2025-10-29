import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashSenha } from '@/utils/crypto';

export async function POST(req: Request) {
  const formData = await req.formData();

  const nome       = String(formData.get('nome') ?? '').trim();
  const emailRaw   = String(formData.get('email') ?? '').trim();
  const senha      = String(formData.get('senha') ?? '');
  const confirmar  = String(formData.get('confirmar') ?? '');

  const email = emailRaw.toLowerCase();

  if (!nome || !email || !senha || senha.length < 8 || senha !== confirmar) {
    return NextResponse.redirect(new URL('/setup?error=invalid', req.url));
  }

  const jaExiste = await prisma.usuario.count({ where: { tipo: 'Coach' } });
  if (jaExiste > 0) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const senhaHash = await hashSenha(senha);
    await prisma.usuario.create({
      data: { nome, email, senhaHash, tipo: 'Coach', senhaPrecisaTroca: false },
    });
    return NextResponse.redirect(new URL('/login', req.url));
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.redirect(new URL('/setup?error=email', req.url));
    }
    return NextResponse.redirect(new URL('/setup?error=unknown', req.url));
  }
}
