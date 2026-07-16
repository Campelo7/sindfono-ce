import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Event } from "@/types/events";
import { serverLog } from "@/lib/log";

/** Colunas necessárias para listagem/detalhe público (evita `select *`). */
const EVENT_PUBLIC_SELECT =
  "id, title, description, event_type, event_date, location, image_url, external_url, is_published, is_featured, created_at, updated_at";

const REVALIDATE_SECONDS = 300;

async function fetchFeaturedEvents(limit: number): Promise<Event[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_PUBLIC_SELECT)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    serverLog.error("fetchFeaturedEvents: erro", { message: error.message });
    return [];
  }
  return (data as Event[]) ?? [];
}

async function fetchPublicEvents(limit: number): Promise<Event[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_PUBLIC_SELECT)
    .eq("is_published", true)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    serverLog.error("fetchPublicEvents: erro", { message: error.message });
    return [];
  }
  return (data as Event[]) ?? [];
}

async function fetchPublicEventById(id: string): Promise<Event | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_PUBLIC_SELECT)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    serverLog.error("fetchPublicEventById: erro", { id, message: error.message });
    return null;
  }
  return (data as Event | null) ?? null;
}

export const getFeaturedEvents = (limit = 3) =>
  unstable_cache(
    () => fetchFeaturedEvents(limit),
    ["events-featured", String(limit)],
    { revalidate: REVALIDATE_SECONDS, tags: ["events"] },
  )();

export const getPublicEvents = (limit = 20) =>
  unstable_cache(
    () => fetchPublicEvents(limit),
    ["events-public-list", String(limit)],
    { revalidate: REVALIDATE_SECONDS, tags: ["events"] },
  )();

export const getPublicEventById = (id: string) =>
  unstable_cache(
    () => fetchPublicEventById(id),
    ["events-public-detail", id],
    { revalidate: REVALIDATE_SECONDS, tags: ["events", `event-${id}`] },
  )();
