import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import montroseLogo from "@/assets/MyoCoach_Logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/learn", label: "Learn" },
  { href: "/resources", label: "Resources" },
];

export const NavPublic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <nav className="container flex h-16 items-center justify-between" aria-label="Main navigation">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <img src={montroseLogo} alt="Montrose Myo" className="h-10" />
            <span className="sr-only">Montrose Myo by Montrose Dental Centre</span>
          </Link>
          
          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
                aria-current={location.pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Button 
              onClick={() => navigate("/")} 
              variant="ghost" 
              size="icon"
              className="hidden md:flex rounded-full"
              aria-label="Go to dashboard"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex">
              <Button>Login</Button>
            </Link>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-2"
                    aria-current={location.pathname === link.href ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Button onClick={() => { navigate("/"); setMobileOpen(false); }} className="mt-4">
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button asChild className="mt-4">
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>Login</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};
