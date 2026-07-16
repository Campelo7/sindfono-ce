import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, ArrowLeft, ExternalLink } from "lucide-react";
import { getPublicEventById } from "@/lib/events-public";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { EVENT_TYPE_LABELS, EVENT_TYPE_STYLE } from "@/types/events";

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

async function fetchPublicEvent(id: string) {
  return getPublicEventById(id);
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await fetchPublicEvent(id);
  if (!event) return { title: "Evento — Sindfono CE" };
  return {
    title: `${event.title} — Sindfono CE`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await fetchPublicEvent(id);
  if (!event) notFound();

  const style = EVENT_TYPE_STYLE[event.event_type];
  const formattedDate = formatDate(event.event_date);

  return (
    <article className="min-h-screen bg-gray-50 pt-24 pb-10 sm:pt-32 sm:pb-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/eventos"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#0f1f5c]"
        >
          <ArrowLeft size={14} /> Voltar para eventos
        </Link>

        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold " + style.tag
              }
            >
              {EVENT_TYPE_LABELS[event.event_type]}
            </span>
            {event.is_featured && (
              <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                Destaque
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f1f5c] leading-tight">
            {event.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={15} /> {formattedDate}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} /> {event.location}
              </span>
            )}
          </div>
        </header>

        {event.image_url && (
          <div className="relative mb-8 aspect-[16/9] max-h-[420px] overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <EventCoverImage src={event.image_url} alt={event.title} />
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
            {event.description}
          </div>

          {event.external_url && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <a
                href={event.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
              >
                <ExternalLink size={15} /> Acessar link do evento
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
