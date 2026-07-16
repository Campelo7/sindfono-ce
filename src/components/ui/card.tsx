import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => (
  <div className={cn("rounded-2xl border border-gray-100 bg-white p-6 shadow-sm", className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }: CardProps) => (
  <h3 className={cn("text-lg font-bold text-gray-900", className)}>{children}</h3>
);

export const CardDescription = ({ children, className }: CardProps) => (
  <p className={cn("text-sm text-gray-500 mt-1", className)}>{children}</p>
);
