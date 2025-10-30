import Link from "next/link";
import { assertCoach } from "@/lib/roles";

export default async function CoachDashboard() {
  const session = await assertCoach();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded p-4 space-y-2">
        <h1 className="text-2xl font-bold">Olá, {session.user?.name}</h1>
        <p className="text-sm text-slate-600">{session.user?.email}</p>
      </div>
      <nav className="grid gap-2">
        <Link href="/coach/alunos" className="bg-white p-4 rounded shadow">Gerenciar alunos</Link>
        <Link href="/coach/treinos" className="bg-white p-4 rounded shadow">Treinos</Link>
        <Link href="/coach/modelos" className="bg-white p-4 rounded shadow">Modelos de treino</Link>
        <Link href="/coach/pdfs" className="bg-white p-4 rounded shadow">PDFs</Link>
        <Link href="/coach/config" className="bg-white p-4 rounded shadow">Configurações</Link>
      </nav>
      {/* Logout handled in header via client LogoutButton */}
    </div>
  );
}
