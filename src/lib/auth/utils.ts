import { auth } from "./index";
import { redirect } from "next/navigation";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/chat");
  }
  return session;
}

export async function getOptionalSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
