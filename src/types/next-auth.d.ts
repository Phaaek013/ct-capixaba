import NextAuth, { DefaultSession } from "next-auth";
import { TipoUsuario } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tipo: TipoUsuario;
      senhaPrecisaTroca: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    tipo: TipoUsuario;
    senhaPrecisaTroca: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tipo?: TipoUsuario;
    senhaPrecisaTroca?: boolean;
  }
}
