import { permanentRedirect } from "next/navigation";

// Rota legada: a página antiga expunha dados de pagamento em rota pública.
// Agora as instruções de pagamento só aparecem no portal do usuário, após
// aprovação da documentação pela diretoria.
export default function SindicalizacaoConfirmacaoLegacyPage() {
  permanentRedirect("/sindicalizar/sucesso");
}
