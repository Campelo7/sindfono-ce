import { getDashboardStats } from "@/actions/admin";
import { Users, FileText, AlertTriangle, CreditCard, CheckCircle, Clock, UserPlus } from "lucide-react";

const CARDS = [
  { key: "registered_only",      label: "Só criou conta",        icon: UserPlus,      color: "bg-slate-50 border-slate-200 text-slate-700" },
  { key: "pending",              label: "Aguardando documentos", icon: Clock,         color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  { key: "under_review",         label: "Em análise",            icon: FileText,      color: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "correction_requested", label: "Correções solicitadas", icon: AlertTriangle, color: "bg-orange-50 border-orange-200 text-orange-700" },
  { key: "approved_for_payment", label: "Aprovados p/ pagamento",icon: CreditCard,   color: "bg-purple-50 border-purple-200 text-purple-700" },
  { key: "payment_pending",      label: "Pagamento em análise",  icon: CreditCard,    color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { key: "active",               label: "Associados ativos",     icon: CheckCircle,   color: "bg-green-50 border-green-200 text-green-700" },
] as const;

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#0f1f5c] mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">Visão geral dos cadastros e solicitações</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className={`rounded-2xl border p-6 flex items-center gap-4 ${color}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/60">
              <Icon size={22} />
            </div>
            <div>
              <p className="text-3xl font-extrabold">{stats[key]}</p>
              <p className="text-sm font-medium opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Total de cadastros no site: <strong className="text-gray-900">{stats.total}</strong>
          {" "}·{" "}
          Com solicitação iniciada: <strong className="text-gray-900">{stats.with_request}</strong>
          {" "}·{" "}
          Reprovadas: <strong className="text-red-600">{stats.rejected}</strong>
        </p>
      </div>
    </div>
  );
}
