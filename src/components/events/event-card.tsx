import Link from "next/link";
import { Calendar, MapPin, ArrowRight, ExternalLink } from "lucide-react";
import type { Event } from "@/types/events";
import { EVENT_TYPE_LABELS, EVENT_TYPE_STYLE } from "@/types/events";
import { EventCoverImage } from "@/components/events/event-cover-image";

interface Props {
  event: Event;
  variant?: "default" | "compact";
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

export const EventCard = ({ event, variant = "default" }: Props) => {
  const style = EVENT_TYPE_STYLE[event.event_type];
  const formattedDate = formatDate(event.event_date);
  const compact = variant === "compact";

  return (
    <article
      className={
        "group flex flex-col rounded-2xl border bg-white shadow-sm transition hover:shadow-md " +
        style.ring
      }
    >
      {event.image_url && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl bg-gray-100">
          <EventCoverImage
            src={event.image_url}
            alt={event.title}
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className={"flex flex-1 flex-col p-5 " + (compact ? "gap-2" : "gap-3")}>
        <div className="flex flex-wrap items-center gap-2">
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

        <h3
          className={
            "font-bold text-[#0f1f5c] " + (compact ? "text-base" : "text-lg leading-tight")
          }
        >
          {event.title}
        </h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {formattedDate && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="shrink-0" strokeWidth={2} aria-hidden />
              {formattedDate}
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0" strokeWidth={2} aria-hidden />
              {event.location}
            </span>
          )}
        </div>

        <p
          className={
            "text-sm text-gray-600 " + (compact ? "line-clamp-2" : "line-clamp-3")
          }
        >
          {event.description}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={`/eventos/${event.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f5c] hover:text-orange-500"
          >
            Ler mais <ArrowRight size={14} />
          </Link>
          {event.external_url && (
            <a
              href={event.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
            >
              <ExternalLink size={13} /> Link externo
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
