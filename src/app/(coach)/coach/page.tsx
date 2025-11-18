import Link from "next/link";
import { assertCoach } from "@/lib/roles";
import "./page.css";

export default async function CoachDashboard() {
  const session = await assertCoach();

  return (
    <div className="space-y-6">
      <div className="card p-4 space-y-2">
        <h1 className="text-2xl font-bold">Olá, {session.user?.name}</h1>
        <p className="text-sm muted">{session.user?.email}</p>
      </div>
      <nav className="grid gap-2 coach-nav">
        <Link href="/coach/alunos" className="card p-4 hover:border-primary transition-colors">Gerenciar alunos</Link>
        <Link href="/coach/treinos" className="card p-4 hover:border-primary transition-colors">Treinos</Link>
        <Link href="/coach/feedback" className="card p-4 hover:border-primary transition-colors">Feedbacks</Link>
        <Link href="/coach/modelos" className="card p-4 hover:border-primary transition-colors">Modelos de treino</Link>
        <Link href="/coach/pdfs" className="card p-4 hover:border-primary transition-colors">PDFs</Link>
        <Link href="/coach/config" className="card p-4 hover:border-primary transition-colors">Configurações</Link>
      </nav>
    </div>
  );
}
