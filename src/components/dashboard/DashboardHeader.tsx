import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  greeting: string;
  firstName: string;
  onSignOut: () => void;
}

export function DashboardHeader({ greeting, firstName, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Montrose Myo" className="h-8 w-8" />
              <span className="text-xl font-bold">Montrose Myo</span>
            </div>
            <h1 className="text-lg font-semibold">{greeting}, {firstName}!</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="rounded-xl">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
