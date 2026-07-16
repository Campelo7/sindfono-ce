import Link from "next/link";
import { listAllRequests } from "@/actions/admin";
import type { AdminListFilter } from "@/actions/admin";
import { StatusBadge } from "@/components/membership/status-badge";
import { RegisteredOnlyBadge } from "@/components/membership/registered-only-badge";
import { Eye, Mail } from "lucide-react";
import type { MembershipStatus } from "@/types/database";

const STATUS_OPTIONS: { value: AdminListFilter; label: string }[] = [
  { value: "", label: "Todos os cadastros" },
  { value: "registered_only", label: "Só criou conta" },
  { value: "documents_pending", label: "Aguardando documentos" },
  { value: "under_review", label: "Em análise" },
  { value: "correction_requested", label: "Correção solicitada" },
  { value: "approved_for_payment", label: "Aprovado p/ pagamento" },
  { value: "payment_pending", label: "Pagamento pendente" },
  { value: "active", label: "Ativo" },
  { value: "rejected", label: "Reprovado" },
];

interface Props {
  searchParams: Promise<{ status?: string; city?: string; name?: string }>;
}

export default async function SolicitacoesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const statusFilter = (sp.status ?? "") as AdminListFilter;

  let requests: Awaited<ReturnType<typeof listAllRequests>> = [];
  let loadError: string | null = null;

  try {
    requests = await listAllRequests({
      status: statusFilter,
      city: sp.city,
      name: sp.name,
    });
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Erro ao carregar cadastros.";
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#0f1f5c] mb-2">Cadastros</h1>
      <p className="text-gray-500 mb-6">
        Todos que criaram conta no site, inclusive quem ainda não enviou documentos
      </p>

      {loadError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      {/* Filtros */}
      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input
          name="name"
          defaultValue={sp.name}
          placeholder="Buscar por nome ou e-mail…"
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <input
          name="city"
          defaultValue={sp.city}
          placeholder="Cidade…"
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value || "all"} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-[#0f1f5c] px-4 text-sm font-semibold text-white hover:bg-blue-900"
        >
          Filtrar
        </button>
        <Link
          href="/admin/solicitacoes"
          className="flex h-10 items-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Limpar
        </Link>
      </form>

      {/* Tabela */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Nome / E-mail</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Cidade</th>
                <th className="px-4 py-3 font-semibold text-gray-600">CREFONO 8</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Conta criada</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    {loadError ? "Não foi possível carregar os cadastros." : "Nenhum cadastro encontrado."}
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.user_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {r.full_name ?? r.email}
                      </p>
                      {r.full_name && (
                        <p className="text-xs text-gray-500 mt-0.5">{r.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.residential_city ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {r.crfa_or_student_info ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(r.registered_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      {r.request_status ? (
                        <StatusBadge status={r.request_status as MembershipStatus} size="sm" />
                      ) : (
                        <RegisteredOnlyBadge size="sm" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.request_id ? (
                        <Link
                          href={`/admin/solicitacoes/${r.request_id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f1f5c]/10 px-3 py-1.5 text-xs font-semibold text-[#0f1f5c] hover:bg-[#0f1f5c]/20 transition"
                        >
                          <Eye size={13} /> Visualizar
                        </Link>
                      ) : (
                        <a
                          href={`mailto:${r.email}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                        >
                          <Mail size={13} /> Contatar
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
