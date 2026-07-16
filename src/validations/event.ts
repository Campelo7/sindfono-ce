import { z } from "zod";

/** URL externa segura: HTTPS ou path relativo interno (/…). */
const safeExternalUrl = z
  .string()
  .max(500)
  .refine(
    (v) => {
      const trimmed = v.trim();
      if (!trimmed) return true;
      if (trimmed.startsWith("/")) return !trimmed.startsWith("//");
      try {
        const u = new URL(trimmed);
        return u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL deve usar HTTPS ou ser um caminho interno (/…)" },
  );

export const eventTypeSchema = z.enum([
  "meeting",
  "assembly",
  "training",
  "event",
  "announcement",
]);

export const eventInputSchema = z.object({
  title: z.string().trim().min(3, "Título é obrigatório").max(140, "Título muito longo"),
  description: z
    .string()
    .trim()
    .min(10, "Descrição é obrigatória (mín. 10 caracteres)")
    .max(4000, "Descrição muito longa"),
  eventType: eventTypeSchema,
  eventDate: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
  location: z
    .string()
    .max(200, "Local muito longo")
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  imageUrl: safeExternalUrl
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  externalUrl: safeExternalUrl
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export type EventInput = z.infer<typeof eventInputSchema>;
