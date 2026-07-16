"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { deleteEvent, toggleEventPublished } from "@/actions/events";

interface Props {
  id: string;
  isPublished: boolean;
  title: string;
}

export const EventRowActions = ({ id, isPublished, title }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleEventPublished(id, !isPublished);
      if ("error" in result && result.error) toast(result.error, "error");
      else {
        toast(!isPublished ? "Evento publicado." : "Evento despublicado.", "success");
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEvent(id);
      if ("error" in result && result.error) {
        toast(result.error, "error");
      } else {
        toast("Evento excluído.", "success");
        setConfirmDelete(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleToggle}
          disabled={pending}
          className={
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 " +
            (isPublished
              ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
              : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100")
          }
        >
          {isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
          {isPublished ? "Despublicar" : "Publicar"}
        </button>

        <Link
          href={`/admin/eventos/${id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Pencil size={13} /> Editar
        </Link>

        <button
          onClick={() => setConfirmDelete(true)}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          <Trash2 size={13} /> Excluir
        </button>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => (pending ? null : setConfirmDelete(false))}
        title="Excluir evento"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Confirma a exclusão de <strong>“{title}”</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={pending}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? "Excluindo…" : "Excluir"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
