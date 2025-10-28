import { requireAuth } from "./auth";
import { redirect } from "next/navigation";

export async function assertCoach() {
  const session = await requireAuth();
  if (session.user?.tipo !== "Coach") {
    if (session.user?.tipo === "Aluno") {
      redirect("/aluno");
    }
    redirect("/login");
  }
  return session;
}
