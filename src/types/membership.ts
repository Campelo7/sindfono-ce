import type { MembershipStatus, DocumentType, DocumentStatus } from "./database";

// ── Status labels / badges ───────────────────────────────────────────────────
export const STATUS_CONFIG: Record<
  MembershipStatus,
  { label: string; color: string; icon: string; description: string }
> = {
  draft: {
    label: "Rascunho",
    color: "bg-gray-100 text-gray-600",
    icon: "✏️",
    description: "Formulário em preenchimento",
  },
  documents_pending: {
    label: "Aguardando documentos",
    color: "bg-yellow-100 text-yellow-700",
    icon: "📄",
    description: "Envie seus documentos para prosseguir",
  },
  under_review: {
    label: "Em análise",
    color: "bg-blue-100 text-blue-700",
    icon: "🔍",
    description: "Documentação em análise pela diretoria",
  },
  correction_requested: {
    label: "Correção solicitada",
    color: "bg-orange-100 text-orange-700",
    icon: "⚠️",
    description: "Há pendências nos seus documentos",
  },
  approved_for_payment: {
    label: "Aprovado — aguardando pagamento",
    color: "bg-purple-100 text-purple-700",
    icon: "💳",
    description: "Documentação aprovada. Efetue o pagamento para concluir",
  },
  payment_pending: {
    label: "Pagamento em análise",
    color: "bg-indigo-100 text-indigo-700",
    icon: "⏳",
    description: "Comprovante de pagamento enviado, aguardando confirmação",
  },
  active: {
    label: "Associado ativo",
    color: "bg-green-100 text-green-700",
    icon: "✅",
    description: "Bem-vindo ao Sindfono CE!",
  },
  rejected: {
    label: "Reprovado",
    color: "bg-red-100 text-red-700",
    icon: "❌",
    description: "Solicitação reprovada",
  },
};

// ── Document labels ──────────────────────────────────────────────────────────
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rg: "RG (frente e verso)",
  cpf: "CPF",
  crfa: "Comprovante de inscrição do CREFONO 8",
  address_proof: "Comprovante de endereço",
  photo_3x4: "Foto de perfil",
  other: "Outro documento",
};

export const DOCUMENT_STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Aguardando análise", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-700" },
  correction_needed: { label: "Correção necessária", color: "bg-orange-100 text-orange-700" },
  rejected: { label: "Reprovado", color: "bg-red-100 text-red-700" },
};

// ── Timeline steps ───────────────────────────────────────────────────────────
export interface TimelineStep {
  key: MembershipStatus;
  label: string;
  icon: string;
}

export const TIMELINE_STEPS: TimelineStep[] = [
  { key: "documents_pending", label: "Cadastro realizado", icon: "✔" },
  { key: "under_review",      label: "Documentação enviada", icon: "✔" },
  { key: "approved_for_payment", label: "Em análise pela diretoria", icon: "🔍" },
  { key: "payment_pending",   label: "Aprovado para pagamento", icon: "💳" },
  { key: "active",            label: "Associado ativo", icon: "🏆" },
];

// ── Step ordering ────────────────────────────────────────────────────────────
const STATUS_ORDER: MembershipStatus[] = [
  "draft",
  "documents_pending",
  "under_review",
  "correction_requested",
  "approved_for_payment",
  "payment_pending",
  "active",
];

export const getStatusIndex = (status: MembershipStatus): number =>
  STATUS_ORDER.indexOf(status);
