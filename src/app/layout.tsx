import "./globals.css";
import "../styles/brand.css";
import "../styles/dark-theme.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { HeaderBrand } from "@/components/HeaderBrand";

export const metadata: Metadata = {
  title: "ct-capixaba",
  description: "Gestão de treinos ct-capixaba"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="brand-shell">
          <HeaderBrand />
          <main className="brand-content">{children}</main>
          <footer className="brand-footer">
            <nav aria-label="Informações">
              <Link href="/faq">FAQ</Link>
              <Link href="/termos">Termos</Link>
              <Link href="/privacidade">Privacidade</Link>
            </nav>
            <p>© {new Date().getFullYear()} CT Capixaba</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
