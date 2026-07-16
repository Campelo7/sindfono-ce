import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentsPanel } from "@/features/portal/documents-panel";
import type { MembershipStatus } from "@/types/database";

export default async function DocumentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: request } = await (supabase as any)
    .from("membership_requests")
    .select("id, status, documents(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#0f1f5c] mb-2">Meus Documentos</h1>
      <p className="text-gray-500 mb-8">Visualize e reenvie seus documentos</p>
      {request ? (
        <DocumentsPanel
          requestId={request.id}
          requestStatus={request.status as MembershipStatus}
          documents={request.documents ?? []}
        />
      ) : (
        <p className="text-gray-500">Nenhuma solicitação encontrada.</p>
      )}
    </div>
  );
}
