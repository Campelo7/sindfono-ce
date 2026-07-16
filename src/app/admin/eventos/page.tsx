import Link from "next/link";
import { Plus, Calendar, MapPin, ExternalLink } from "lucide-react";
import { listAllEventsAdmin } from "@/actions/events";
import { EVENT_TYPE_LABELS, EVENT_TYPE_STYLE } from "@/types/events";
import { EventRowActions } from "@/features/admin/event-actions";

export const dynamic = "force-dynamic";

const formatDate = (iso: string | null) => {
  if (!iso) return "Sem data";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Sem data";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default async function AdminEventsPage() {
  let events: Awaited<ReturnType<typeof listAllEventsAdmin>> = [];
  let migrationRequired = false;

  try {
    events = await listAllEventsAdmin();
  } catch (err) {
    if (err instanceof Error && err.message === "MIGRATION_REQUIRED") {
      migrationRequired = true;
    } else {
      throw err;
    }
  }

  if (migrationRequired) {
    return (
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-8 max-w-xl">
        <h1 className="text-xl font-bold text-[#0f1f5c] mb-2">Configuração pendente</h1>
        <p className="text-sm text-gray-700 leading-relaxed">
          A tabela de eventos ainda não existe no Supabase. Rode a migration{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">009_events.sql</code>{" "}
          no SQL Editor para habilitar o cadastro de eventos.
        </p>
        <p className="text-sm text-gray-600 mt-3">
          A página pública{" "}
          <Link href="/eventos" className="font-semibold text-[#0f1f5c] underline">
            /eventos
          </Link>{" "}
          já está no site — falta só criar a tabela no banco.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f1f5c]">Eventos e atualizações</h1>
          <p className="text-gray-500 mt-0.5">
            Publique reuniões, assembleias, treinamentos e comunicados para os associados.
          </p>
        </div>
        <Link
          href="/admin/eventos/novo"
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-orange-600"
        >
          <Plus size={16} /> Novo evento
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Calendar size={44} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-semibold">Nenhum evento cadastrado ainda.</p>
          <p className="text-gray-500 text-sm mt-1">
            Clique em <strong>Novo evento</strong> para publicar a primeira atualização.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const style = EVENT_TYPE_STYLE[event.event_type];
            return (
              <div
                key={event.id}
                className={
                  "rounded-2xl border bg-white p-5 shadow-sm " + style.ring
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                          style.tag
                        }
                      >
                        {EVENT_TYPE_LABELS[event.event_type]}
                      </span>
                      {event.is_featured && (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                          Destaque
                        </span>
                      )}
                      <span
                        className={
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                          (event.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600")
                        }
                      >
                        {event.is_published ? "Publicado" : "Rascunho"}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[#0f1f5c] mb-1">
                      {event.title}
                    </h2>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(event.event_date)}
                      </span>
                      {event.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} /> {event.location}
                        </span>
                      )}
                      {event.external_url && (
                        <a
                          href={event.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink size={12} /> Link
                        </a>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2 max-w-3xl">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <EventRowActions
                    id={event.id}
                    isPublished={event.is_published}
                    title={event.title}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
