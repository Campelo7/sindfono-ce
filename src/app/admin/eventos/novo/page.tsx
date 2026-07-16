import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/features/admin/event-form";

export default function NewEventPage() {
  return (
    <div>
      <Link
        href="/admin/eventos"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#0f1f5c]"
      >
        <ArrowLeft size={14} /> Voltar para eventos
      </Link>

      <h1 className="text-2xl font-extrabold text-[#0f1f5c] mb-1">Novo evento</h1>
      <p className="text-gray-500 mb-6">
        Preencha as informações e escolha publicar imediatamente ou salvar como rascunho.
      </p>

      <EventForm mode="create" />
    </div>
  );
}
