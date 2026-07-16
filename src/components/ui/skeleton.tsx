import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-lg bg-gray-200", className)} />
);

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-3 shadow-sm">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const TableRowSkeleton = () => (
  <tr>
    {[1, 2, 3, 4, 5].map((i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);
