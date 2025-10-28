import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const coachLinks = [
  { href: "/coach", label: "Dashboard" },
  { href: "/coach/alunos", label: "Alunos" },
  { href: "/coach/treinos", label: "Treinos" },
  { href: "/coach/modelos", label: "Modelos" },
  { href: "/coach/pdfs", label: "PDFs" },
  { href: "/coach/config", label: "Config" }
];

const alunoLinks = [{ href: "/aluno", label: "Área do aluno" }];

export async function HeaderBrand() {
  const session = await getServerSession(authOptions);
  let links: { href: string; label: string }[] = [];

  if (session?.user.tipo === "Coach") {
    links = coachLinks;
  } else if (session?.user.tipo === "Aluno") {
    links = alunoLinks;
  }

  return (
    <header className="brand-header">
      <Link href="/" className="brand-logo">
        CT Capixaba
      </Link>
      {links.length > 0 && (
        <nav className="brand-nav" aria-label="Navegação principal">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
