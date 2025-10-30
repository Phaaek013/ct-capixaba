import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: number;
    tipo: 'Coach' | 'Aluno';
    senhaPrecisaTroca: boolean;
    name?: string | null;
    email?: string | null;
  }

  interface Session {
    user: {
      id: number;
      tipo: 'Coach' | 'Aluno';
      senhaPrecisaTroca: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    tipo: 'Coach' | 'Aluno';
    senhaPrecisaTroca: boolean;
  }
}