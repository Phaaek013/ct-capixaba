import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compararSenha } from "./utils/crypto";
import { prisma } from "./lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email }
        });

        if (!usuario) {
          return null;
        }

        const senhaCorreta = await compararSenha(credentials.senha, usuario.senhaHash);

        if (!senhaCorreta) {
          return null;
        }

        return {
          id: String(usuario.id),
          name: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
          senhaPrecisaTroca: usuario.senhaPrecisaTroca
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tipo = (user as any).tipo;
        token.senhaPrecisaTroca = (user as any).senhaPrecisaTroca;
      }

      if (token.sub) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: Number(token.sub) }
        });

        if (usuario) {
          token.tipo = usuario.tipo;
          token.name = usuario.nome;
          token.email = usuario.email;
          token.senhaPrecisaTroca = usuario.senhaPrecisaTroca;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.tipo = token.tipo as TipoUsuario;
        session.user.senhaPrecisaTroca = token.senhaPrecisaTroca as boolean;
      }

      return session;
    }
  }
};
