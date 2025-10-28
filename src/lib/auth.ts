import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuth(): Promise<Session> {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
