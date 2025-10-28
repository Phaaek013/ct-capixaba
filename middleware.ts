import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { nextUrl, nextauth } = req;
    const token = nextauth.token;
    const pathname = nextUrl.pathname;

    if (!token) {
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/coach") && token.tipo !== "Coach") {
      return NextResponse.redirect(new URL("/aluno", req.url));
    }

    if (pathname.startsWith("/aluno") && token.tipo !== "Aluno") {
      return NextResponse.redirect(new URL("/coach", req.url));
    }

    if (pathname === "/primeiro-acesso/alterar-senha" && token.senhaPrecisaTroca === false) {
      if (token.tipo === "Coach") {
        return NextResponse.redirect(new URL("/coach", req.url));
      }
      return NextResponse.redirect(new URL("/aluno", req.url));
    }

    if (token.senhaPrecisaTroca && pathname !== "/primeiro-acesso/alterar-senha") {
      return NextResponse.redirect(new URL("/primeiro-acesso/alterar-senha", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public|login|setup).*)"]
};
