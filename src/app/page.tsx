import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.senhaPrecisaTroca) {
    redirect("/primeiro-acesso/alterar-senha");
  }

  if (session.user.tipo === "Coach") {
    redirect("/coach");
  }

  redirect("/aluno");
}
