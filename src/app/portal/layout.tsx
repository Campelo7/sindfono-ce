import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import { LayoutDashboard, FileText, Bell, LogOut, CreditCard, CalendarDays, ExternalLink } from "lucide-react";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/documentos", label: "Documentos", icon: FileText },
  { href: "/portal/pagamento", label: "Pagamento", icon: CreditCard },
  { href: "/portal/notificacoes", label: "Notificações", icon: Bell },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  const fullName = (profile as { full_name: string } | null)?.full_name;

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-gray-200 bg-white shadow-sm lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
          <Image src="/logo.png" alt="Sindfono CE" width={36} height={36} className="rounded-lg" />
          <div className="leading-tight">
            <p className="text-sm font-bold text-[#0f1f5c]">Portal</p>
            <p className="text-xs text-orange-500 font-semibold">Sindfono CE</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#0f1f5c]"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="pt-4 mt-2 border-t border-gray-100 space-y-1">
            <Link
              href="/eventos"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#0f1f5c]"
            >
              <CalendarDays size={18} /> Eventos
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
            >
              <ExternalLink size={18} /> Site institucional
            </Link>
          </div>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f1f5c] text-white text-xs font-bold">
              {fullName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-800">{fullName ?? user.email}</p>
              <p className="truncate text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={16} /> Sair
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 min-w-0">
            <Image src="/logo.png" alt="Sindfono CE" width={32} height={32} className="rounded-lg shrink-0" />
            <span className="text-sm font-bold text-[#0f1f5c] truncate">Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto overscroll-x-contain border-t border-gray-100 px-3 py-2">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex shrink-0 items-center justify-center rounded-lg p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-[#0f1f5c]"
            >
              <Icon size={20} />
            </Link>
          ))}
          <Link
            href="/eventos"
            aria-label="Eventos"
            className="flex shrink-0 items-center justify-center rounded-lg p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-[#0f1f5c]"
          >
            <CalendarDays size={20} />
          </Link>
          <form action={signOut} className="shrink-0">
            <button
              type="submit"
              aria-label="Sair"
              className="flex shrink-0 items-center justify-center rounded-lg p-2.5 text-red-500 transition hover:bg-red-50"
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
