import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ShieldCheck,
  CalendarDays,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/solicitacoes", label: "Cadastros", icon: Users },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/admin-login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: adminUser } = await (supabase as any)
    .from("admin_users")
    .select("name, role")
    .eq("user_id", user.id)
    .single();

  const admin = adminUser as { name: string; role: string } | null;
  if (!admin) redirect("/auth/admin-login?error=unauthorized");

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-gray-200 bg-[#0f1f5c] lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <ShieldCheck size={28} className="text-orange-400" />
          <div>
            <p className="text-sm font-bold text-white">Admin</p>
            <p className="text-xs text-orange-400">Sindfono CE</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={18} /> {label}
            </Link>
          ))}

          <div className="pt-4 mt-2 border-t border-white/10">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-orange-300/90 transition hover:bg-white/10 hover:text-orange-200"
            >
              <ExternalLink size={18} /> Ver site público
            </Link>
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
            <p className="text-xs text-white/40 capitalize">{admin.role}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} /> Sair
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-gray-200 bg-[#0f1f5c] lg:hidden">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-orange-400" />
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto overscroll-x-contain border-t border-white/10 px-3 py-2">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex shrink-0 items-center justify-center rounded-lg p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={20} />
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            aria-label="Ver site público"
            className="flex shrink-0 items-center justify-center rounded-lg p-2.5 text-orange-300 transition hover:bg-white/10 hover:text-orange-200"
          >
            <ExternalLink size={20} />
          </Link>
          <form action={signOut} className="shrink-0">
            <button
              type="submit"
              aria-label="Sair"
              className="flex items-center justify-center rounded-lg p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      <main className="lg:pl-60">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
