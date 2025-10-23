import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

export function LoadingSpinner({ size = "md", className, message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div
          className={cn(
            "animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4",
            sizeClasses[size],
            className
          )}
        />
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
