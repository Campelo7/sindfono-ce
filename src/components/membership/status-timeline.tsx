import { cn } from "@/lib/utils";
import { TIMELINE_STEPS, getStatusIndex } from "@/types/membership";
import type { MembershipStatus } from "@/types/database";

interface StatusTimelineProps {
  status: MembershipStatus;
}

export const StatusTimeline = ({ status }: StatusTimelineProps) => {
  const currentIndex = getStatusIndex(status);
  const isRejected = status === "rejected";

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {TIMELINE_STEPS.map((step, i) => {
          const stepIndex = getStatusIndex(step.key);
          const isDone = !isRejected && stepIndex <= currentIndex;
          const isCurrent = !isRejected && stepIndex === currentIndex;
          const isLocked = isRejected || stepIndex > currentIndex;

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Ícone */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition",
                  isDone && !isCurrent && "border-green-500 bg-green-500 text-white",
                  isCurrent && "border-[#0f1f5c] bg-[#0f1f5c] text-white shadow-lg",
                  isLocked && "border-gray-200 bg-white text-gray-400",
                )}
              >
                {isDone && !isCurrent ? "✓" : isLocked ? "🔒" : step.icon}
              </div>

              {/* Texto */}
              <div className="pt-1.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isDone && "text-gray-900",
                    isLocked && "text-gray-400",
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-xs text-[#0f1f5c] font-medium">
                    Status atual
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {isRejected && (
          <div className="relative flex items-start gap-4">
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-red-400 bg-red-50 text-sm">
              ❌
            </div>
            <div className="pt-1.5">
              <p className="text-sm font-semibold text-red-700">Solicitação reprovada</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
