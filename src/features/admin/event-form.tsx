"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Send } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createEvent, updateEvent } from "@/actions/events";
import type { EventInput } from "@/validations/event";
import type { Event, EventType } from "@/types/events";
import { EVENT_TYPE_LABELS } from "@/types/events";

interface Props {
  mode: "create" | "edit";
  initial?: Event;
}

const EMPTY: EventInput = {
  title: "",
  description: "",
  eventType: "event",
  eventDate: null,
  location: null,
  imageUrl: null,
  externalUrl: null,
  isPublished: false,
  isFeatured: false,
};

// Formata para o formato aceito por <input type="datetime-local">
const toLocalInputValue = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const EventForm = ({ mode, initial }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState<EventInput>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          eventType: initial.event_type,
          eventDate: initial.event_date,
          location: initial.location,
          imageUrl: initial.image_url,
          externalUrl: initial.external_url,
          isPublished: initial.is_published,
          isFeatured: initial.is_featured,
        }
      : EMPTY,
  );

  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const handleSubmit = (publish?: boolean) => {
    startTransition(async () => {
      const payload: EventInput = publish === undefined ? form : { ...form, isPublished: publish };

      const result =
        mode === "create"
          ? await createEvent(payload)
          : await updateEvent(initial!.id, payload);

      if ("error" in result && result.error) {
        toast(result.error, "error");
        return;
      }

      toast(mode === "create" ? "Evento criado!" : "Evento atualizado!", "success");
      router.push("/admin/eventos");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Título <span className="text-orange-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            maxLength={140}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex.: Assembleia Geral Ordinária"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Tipo <span className="text-orange-500">*</span>
            </label>
            <select
              value={form.eventType}
              onChange={(e) => set("eventType", e.target.value as EventType)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Data e hora
            </label>
            <input
              type="datetime-local"
              value={toLocalInputValue(form.eventDate ?? null)}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return set("eventDate", null);
                const d = new Date(v);
                set("eventDate", Number.isNaN(d.getTime()) ? null : d.toISOString());
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Local
          </label>
          <input
            type="text"
            value={form.location ?? ""}
            maxLength={200}
            onChange={(e) => set("location", e.target.value || null)}
            placeholder="Ex.: Sede do sindicato, online, etc."
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Descrição <span className="text-orange-500">*</span>
          </label>
          <textarea
            value={form.description}
            maxLength={4000}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Detalhes do evento, pauta, público-alvo, orientações…"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-y min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="text-xs text-gray-400 mt-1">
            {form.description.length}/4000 caracteres
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              URL da imagem (opcional)
            </label>
            <input
              type="url"
              value={form.imageUrl ?? ""}
              onChange={(e) => set("imageUrl", e.target.value || null)}
              placeholder="https://…/imagem.jpg"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Link externo (opcional)
            </label>
            <input
              type="url"
              value={form.externalUrl ?? ""}
              onChange={(e) => set("externalUrl", e.target.value || null)}
              placeholder="https://…/inscricao"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 cursor-pointer transition hover:border-gray-300">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => set("isFeatured", e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500/40"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            Destacar na página inicial (aparece no bloco “Atualizações”).
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={() => router.push("/admin/eventos")}
          disabled={pending}
          className="rounded-full border-2 border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#0f1f5c] px-6 py-2.5 text-sm font-semibold text-[#0f1f5c] hover:bg-[#0f1f5c] hover:text-white disabled:opacity-60"
        >
          <Save size={15} /> Salvar como rascunho
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          <Send size={15} /> {pending ? "Salvando…" : "Publicar"}
        </button>
      </div>
    </div>
  );
};
