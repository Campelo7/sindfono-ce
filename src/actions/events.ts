"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventInputSchema, type EventInput } from "@/validations/event";
import type { Event } from "@/types/events";
import { serverLog } from "@/lib/log";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any;

async function requireAdminForEvents() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: adminUser } = await (supabase as SupabaseAny)
    .from("admin_users")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!adminUser) throw new Error("Acesso não autorizado.");
  return { supabase: supabase as SupabaseAny, user, adminUser };
}

function revalidateAllEventCaches(id?: string) {
  revalidateTag("events");
  if (id) revalidateTag(`event-${id}`);
}

// ── Admin: listar tudo (publicados + rascunhos) ─────────────────────────────
export async function listAllEventsAdmin(): Promise<Event[]> {
  const { supabase } = await requireAdminForEvents();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // Tabela ainda não criada (migration 009 não rodada no Supabase)
    if (error.message?.includes("schema cache") || error.code === "42P01") {
      throw new Error("MIGRATION_REQUIRED");
    }
    throw new Error(error.message);
  }
  return (data as Event[]) ?? [];
}

// ── Admin: buscar por id ────────────────────────────────────────────────────
export async function getEventByIdAdmin(id: string): Promise<Event | null> {
  const { supabase } = await requireAdminForEvents();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Event | null) ?? null;
}

// ── Admin: criar ────────────────────────────────────────────────────────────
export async function createEvent(input: EventInput) {
  const { supabase, user } = await requireAdminForEvents();

  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const { data: created, error } = await supabase
    .from("events")
    .insert({
      title: data.title,
      description: data.description,
      event_type: data.eventType,
      event_date: data.eventDate,
      location: data.location,
      image_url: data.imageUrl,
      external_url: data.externalUrl,
      is_published: data.isPublished,
      is_featured: data.isFeatured,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    serverLog.error("createEvent: erro", { message: error.message, code: error.code });
    return { error: `Erro ao criar evento: ${error.message}` };
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  revalidateAllEventCaches();

  return { success: true, id: (created as { id: string }).id };
}

// ── Admin: atualizar ────────────────────────────────────────────────────────
export async function updateEvent(id: string, input: EventInput) {
  const { supabase } = await requireAdminForEvents();

  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const { error } = await supabase
    .from("events")
    .update({
      title: data.title,
      description: data.description,
      event_type: data.eventType,
      event_date: data.eventDate,
      location: data.location,
      image_url: data.imageUrl,
      external_url: data.externalUrl,
      is_published: data.isPublished,
      is_featured: data.isFeatured,
    })
    .eq("id", id);

  if (error) {
    serverLog.error("updateEvent: erro", { id, message: error.message });
    return { error: `Erro ao atualizar evento: ${error.message}` };
  }

  revalidatePath("/admin/eventos");
  revalidatePath(`/admin/eventos/${id}`);
  revalidatePath("/eventos");
  revalidatePath(`/eventos/${id}`);
  revalidatePath("/");
  revalidateAllEventCaches(id);
  return { success: true };
}

// ── Admin: publicar/despublicar ─────────────────────────────────────────────
export async function toggleEventPublished(id: string, publish: boolean) {
  const { supabase } = await requireAdminForEvents();

  const { error } = await supabase
    .from("events")
    .update({ is_published: publish })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  revalidateAllEventCaches(id);
  return { success: true };
}

// ── Admin: excluir ──────────────────────────────────────────────────────────
export async function deleteEvent(id: string) {
  const { supabase } = await requireAdminForEvents();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    serverLog.error("deleteEvent: erro", { id, message: error.message });
    return { error: `Erro ao excluir evento: ${error.message}` };
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  revalidateAllEventCaches(id);
  return { success: true };
}
