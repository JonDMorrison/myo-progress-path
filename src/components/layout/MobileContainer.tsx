import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  includeBottomPadding?: boolean;
}

export function MobileContainer({ 
  children, 
  className,
  includeBottomPadding = true 
}: MobileContainerProps) {
  return (
    <div 
      className={cn(
        "safe-container",
        includeBottomPadding && "pb-24 md:pb-8",
        className
      )}
    >
      {children}
    </div>
  );
}
