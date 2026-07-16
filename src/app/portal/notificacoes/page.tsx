import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function NotificacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: notifications } = await (supabase as any)
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typeColors: Record<string, string> = {
    info: "border-blue-100 bg-blue-50",
    success: "border-green-100 bg-green-50",
    warning: "border-orange-100 bg-orange-50",
    error: "border-red-100 bg-red-50",
  };

  const items = (notifications as { id: string; title: string; message: string; type: string; read: boolean; created_at: string }[] | null) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#0f1f5c] mb-2">Notificações</h1>
      <p className="text-gray-500 mb-8">Atualizações sobre sua solicitação</p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Bell size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Nenhuma notificação ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={cn(
                "rounded-2xl border p-5 shadow-sm",
                typeColors[n.type] ?? "border-gray-100 bg-white",
                !n.read && "ring-2 ring-[#0f1f5c]/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{n.title}</p>
                  <p className="mt-1 text-sm text-gray-700">{n.message}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  {!n.read && <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#0f1f5c]" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
