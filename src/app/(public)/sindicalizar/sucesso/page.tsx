import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function SindicalizarSucessoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-28 pb-12 sm:pt-32">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={44} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0f1f5c]">
          Documentação enviada com sucesso!
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Sua documentação foi recebida e será analisada pela diretoria do Sindfono CE.
          Você será notificado por e-mail quando houver uma atualização.
        </p>
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-left text-sm text-blue-800">
          <p className="font-semibold mb-2">Próximos passos:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>A diretoria analisará seus documentos</li>
            <li>Em caso de pendência, você receberá uma notificação</li>
            <li>Após aprovação, a área de pagamento será liberada</li>
            <li>Com o pagamento confirmado, sua sindicalização estará ativa</li>
          </ol>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/portal"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f1f5c] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
          >
            Acompanhar no portal <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
