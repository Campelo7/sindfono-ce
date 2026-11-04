import Link from "next/link";
import { getPublicEvents } from "@/lib/events-public";
import { EventCard } from "@/components/events/event-card";
import { CampaignBanner } from "@/components/events/campaign-banner";

export const revalidate = 300;

export const metadata = {
  title: "Eventos — Sindfono CE",
  description:
    "Reuniões, assembleias, treinamentos e comunicados oficiais do Sindicato dos Fonoaudiólogos do Estado do Ceará.",
};

export default async function EventosPage() {
  const events = await getPublicEvents(50);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho da página */}
      <section className="border-b border-gray-200 bg-white pt-24 pb-10 sm:pt-32 sm:pb-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 p-2.5">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <circle cx="8" cy="13" r="1" fill="#2563eb"/>
                <circle cx="12" cy="13" r="1" fill="#2563eb"/>
                <circle cx="16" cy="13" r="1" fill="#2563eb"/>
                <circle cx="8" cy="17" r="1" fill="#2563eb"/>
                <circle cx="12" cy="17" r="1" fill="#2563eb"/>
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-blue-600">
              Sindfono CE
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0f1f5c] leading-tight">
            Eventos
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl">
            Acompanhe comunicados, reuniões, assembleias e acontecimentos da categoria.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-10">

          {/* Banner do Mês (Novembro Azul) */}
          <div>
            <CampaignBanner variant="full" />
          </div>

          {/* Lista de eventos */}
          {events.length > 0 && (
            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Botão de retorno */}
          <div className="pt-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0f1f5c] px-6 py-2.5 text-sm font-semibold text-[#0f1f5c] hover:bg-[#0f1f5c] hover:text-white transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Voltar para o início
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
