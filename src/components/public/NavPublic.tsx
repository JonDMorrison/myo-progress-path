import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, Info, BookOpen, FileText, User, LogIn, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


const primaryNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: Info },
  { href: "/learn", label: "Learn", icon: BookOpen },
];

const secondaryNavLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/resources", label: "Resources" },
];

export const NavPublic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role, name")
          .eq("id", session.user.id)
          .single();
        
        setUserRole(userData?.role ?? null);
        setUserName(userData?.name ?? null);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role, name")
          .eq("id", session.user.id)
          .single();
        
        setUserRole(userData?.role ?? null);
        setUserName(userData?.name ?? null);
      } else {
        setUserRole(null);
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast.error("Error logging out");
        return;
      }
      setUser(null);
      setUserRole(null);
      setUserName(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      console.error("Logout exception:", err);
      toast.error("Error logging out");
    }
  };

  const getRoleDisplay = (role: string | null) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <nav className="container flex h-16 items-center justify-between" aria-label="Main navigation">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <img src="/favicon.png" alt="Montrose Myo" className="h-8 w-8" />
            <span className="text-xl font-bold">Montrose Myo</span>
            <span className="sr-only">by Montrose Dental Centre</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            {[...primaryNavLinks, ...secondaryNavLinks].map((link) => (
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hidden md:flex rounded-full"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      Role: <span className="font-medium text-foreground">{getRoleDisplay(userRole)}</span>
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  const dashboardRoute = userRole === "patient" ? "/patient" : "/therapist";
                  navigate(dashboardRoute);
                }}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex">
              <Button>Login</Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-6">
                {/* Primary Navigation with Icons */}
                <nav className="space-y-1">
                  {primaryNavLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-base font-medium min-h-[48px] ${
                          active 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-accent"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <Separator />

                {/* Secondary Navigation */}
                <nav className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">MORE INFO</p>
                  {secondaryNavLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2.5 rounded-lg transition-colors text-sm min-h-[44px] flex items-center ${
                          active 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <Separator />

                {/* User Section */}
                {user ? (
                  <div className="space-y-2">
                    {/* User Info */}
                    <div className="px-3 py-2 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{userName || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Role: <span className="font-medium">{getRoleDisplay(userRole)}</span>
                      </p>
                    </div>
                    
                    {/* Dashboard Button */}
                    <Button 
                      onClick={() => { 
                        const dashboardRoute = userRole === "patient" ? "/patient" : "/therapist";
                        navigate(dashboardRoute); 
                        setMobileOpen(false); 
                      }} 
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Go to Dashboard
                    </Button>

                    {/* Account/Settings */}
                    <Button 
                      variant="outline"
                      onClick={() => { 
                        navigate("/settings"); 
                        setMobileOpen(false); 
                      }} 
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      Settings
                    </Button>

                    {/* Logout */}
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }} 
                      className="w-full h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
                      size="lg"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Log out
                    </Button>
                  </div>
                ) : (
                  <Button 
                    asChild 
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>
                      <LogIn className="h-5 w-5 mr-2" />
                      Login
                    </Link>
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
