import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, TrendingUp, MessageSquare, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  section?: string;
}

const navItems: NavItem[] = [
  { href: "/patient", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/patient/progress", label: "Progress", icon: TrendingUp },
  { href: "/patient/messages", label: "Messages", icon: MessageSquare },
  { href: "/patient/account", label: "Account", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const { user: authUser } = useAuth();
  const [requiresVideo, setRequiresVideo] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authUser?.id) {
      setRequiresVideo(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("patients")
        .select("requires_video")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (!cancelled) {
        setRequiresVideo(data?.requires_video ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const visibleItems = navItems.filter(
    (item) => item.href !== "/patient/messages" || requiresVideo !== false
  );
  const gridColsClass = visibleItems.length === 5 ? "grid-cols-5" : "grid-cols-4";

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur-sm safe-bottom md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className={cn("grid text-center", gridColsClass)}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 px-2 min-h-[44px] transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="mt-1 text-xs font-medium">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
