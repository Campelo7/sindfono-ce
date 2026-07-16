import { permanentRedirect } from "next/navigation";

// Rota legada: o formulário antigo foi substituído pelo fluxo em `/sindicalizar`
// (com conta obrigatória, RLS e pagamento pós-aprovação). Mantemos um redirect
// permanente para não quebrar links já divulgados.
export default function SindicalizacaoLegacyPage() {
  permanentRedirect("/sindicalizar");
}
