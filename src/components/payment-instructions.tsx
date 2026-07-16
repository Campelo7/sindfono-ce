import { Mail } from "lucide-react";
import { PAYMENT_INFO } from "@/lib/constants";

export const PaymentInstructions = () => (
  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 space-y-3 text-sm">
    <p className="font-bold text-[#0f1f5c] text-base mb-4">Informações de pagamento</p>
    <Row label="Matrícula" value={PAYMENT_INFO.matricula} />
    <Row label="Pix CNPJ" value={PAYMENT_INFO.pixCnpj} mono />
    <Row
      label="Transferência bancária"
      value={`${PAYMENT_INFO.bankName} — Ag. ${PAYMENT_INFO.bankAgency} — Conta ${PAYMENT_INFO.bankAccount}`}
    />
    <Row label="Anuidade à vista" value={`${PAYMENT_INFO.anuidade} (12 meses)`} />
    <div className="pt-2 border-t border-blue-200">
      <p className="text-gray-600">
        Pagamento por cartão:{" "}
        <a href={`mailto:${PAYMENT_INFO.email}`} className="text-blue-700 underline inline-flex items-center gap-1">
          <Mail size={13} />
          {PAYMENT_INFO.email}
        </a>
      </p>
      <p className="mt-2 text-gray-600">
        Envie o comprovante para:{" "}
        <a href={`mailto:${PAYMENT_INFO.email}`} className="text-blue-700 underline">
          {PAYMENT_INFO.email}
        </a>
      </p>
    </div>
  </div>
);

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex flex-wrap gap-1">
    <span className="font-semibold text-gray-700">{label}:</span>
    <span className={mono ? "font-mono text-gray-800" : "text-gray-700"}>{value}</span>
  </div>
);
