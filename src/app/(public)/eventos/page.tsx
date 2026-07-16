import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { getPublicEvents } from "@/lib/events-public";
import { EventCard } from "@/components/events/event-card";

export const revalidate = 300;

export const metadata = {
  title: "Eventos e Atualizações — Sindfono CE",
  description:
    "Reuniões, assembleias, treinamentos e comunicados oficiais do Sindicato dos Fonoaudiólogos do Estado do Ceará.",
};

export default async function EventosPage() {
  const events = await getPublicEvents(50);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-200 bg-white pt-24 pb-10 sm:pt-32 sm:pb-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 p-2">
              <CalendarDays className="shrink-0 text-orange-500" size={22} strokeWidth={2} />
            </div>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-orange-500">
              Sindfono CE
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0f1f5c] leading-tight">
            Eventos e atualizações
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl">
            Acompanhe reuniões, assembleias, treinamentos e comunicados oficiais do
            Sindicato dos Fonoaudiólogos do Estado do Ceará.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 sm:p-12 text-center">
              <CalendarDays size={44} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-semibold">
                Nenhum evento publicado no momento.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Volte em breve — as próximas ações do sindicato aparecem aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0f1f5c] px-6 py-2.5 text-sm font-semibold text-[#0f1f5c] hover:bg-[#0f1f5c] hover:text-white"
            >
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
