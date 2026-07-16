import { cn } from "@/lib/utils";

interface RegisteredOnlyBadgeProps {
  size?: "sm" | "md" | "lg";
}

export const RegisteredOnlyBadge = ({ size = "md" }: RegisteredOnlyBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-semibold bg-slate-100 text-slate-700",
      size === "sm" && "px-2.5 py-0.5 text-xs",
      size === "md" && "px-3 py-1 text-sm",
      size === "lg" && "px-4 py-1.5 text-base",
    )}
  >
    <span>👤</span>
    Conta criada
  </span>
);
