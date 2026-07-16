export type EventType =
  | "meeting"
  | "assembly"
  | "training"
  | "event"
  | "announcement";

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  event_date: string | null;
  location: string | null;
  image_url: string | null;
  external_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meeting: "Reunião",
  assembly: "Assembleia",
  training: "Treinamento",
  event: "Evento",
  announcement: "Comunicado",
};

export const EVENT_TYPE_STYLE: Record<
  EventType,
  { tag: string; ring: string; icon: string }
> = {
  meeting: {
    tag: "bg-blue-100 text-blue-700",
    ring: "border-blue-200",
    icon: "text-blue-500",
  },
  assembly: {
    tag: "bg-purple-100 text-purple-700",
    ring: "border-purple-200",
    icon: "text-purple-500",
  },
  training: {
    tag: "bg-green-100 text-green-700",
    ring: "border-green-200",
    icon: "text-green-500",
  },
  event: {
    tag: "bg-orange-100 text-orange-700",
    ring: "border-orange-200",
    icon: "text-orange-500",
  },
  announcement: {
    tag: "bg-gray-100 text-gray-700",
    ring: "border-gray-200",
    icon: "text-gray-500",
  },
};
