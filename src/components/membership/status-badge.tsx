import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/types/membership";
import type { MembershipStatus } from "@/types/database";

interface StatusBadgeProps {
  status: MembershipStatus;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        config.color,
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};
