import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEventByIdAdmin } from "@/actions/events";
import { EventForm } from "@/features/admin/event-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventByIdAdmin(id);
  if (!event) notFound();

  return (
    <div>
      <Link
        href="/admin/eventos"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#0f1f5c]"
      >
        <ArrowLeft size={14} /> Voltar para eventos
      </Link>

      <h1 className="text-2xl font-extrabold text-[#0f1f5c] mb-1">Editar evento</h1>
      <p className="text-gray-500 mb-6">
        Ajuste as informações do evento e salve. Alterações refletem imediatamente na página pública.
      </p>

      <EventForm mode="edit" initial={event} />
    </div>
  );
}
