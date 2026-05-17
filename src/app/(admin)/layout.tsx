import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role ?? "")) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-3 flex items-center gap-4">
        <span className="font-bold text-sm">AI Hub Admin</span>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="/admin" className="hover:text-foreground">Dashboard</a>
          <a href="/admin/users" className="hover:text-foreground">Users</a>
          <a href="/admin/revenue" className="hover:text-foreground">Revenue</a>
          <a href="/admin/models" className="hover:text-foreground">Models</a>
        </nav>
        <div className="ml-auto">
          <a href="/chat" className="text-sm text-muted-foreground hover:text-foreground">← Back to app</a>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
