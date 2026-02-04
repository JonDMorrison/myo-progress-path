import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Inbox,
  Users,
  BarChart3,
  Sparkles,
  LogOut,
  Shield,
  BookOpen,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const navItems = {
  main: [
    { title: "Inbox", url: "/therapist", icon: Inbox },
    { title: "Patients", url: "/therapist/patients", icon: Users },
    { title: "Curriculum", url: "/therapist#curriculum", icon: BookOpen },
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "AI Assistant", url: "/therapist/ai-assist", icon: Sparkles },
  ],
  resources: [
    { title: "Learn Hub", url: "/learn", icon: BookOpen },
  ],
};

export function TherapistSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    // Prefer session lookup (fast/local) to avoid occasional hangs with getUser() during refresh.
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role === "admin" || userData?.role === "super_admin") setIsAdmin(true);
    if (userData?.role === "super_admin") setIsSuperAdmin(true);
  };

  const isActive = (path: string) => currentPath === path;

  const handleSignOut = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      // Clear Supabase session
      await supabase.auth.signOut();

      // Force clear local storage to be safe
      localStorage.clear();
      sessionStorage.clear();

      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });

      // Hard redirect to Auth page - most reliable way
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);

      // Force cleanup anyway
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <Link to="/therapist" className="flex items-center gap-2">
          <img src="/favicon.png" alt="Montrose Myo" className="h-8 w-8" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Montrose Myo
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.main.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.resources.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={currentPath.startsWith("/admin")}
                      tooltip="Admin Portal"
                    >
                      <Link to={isSuperAdmin ? "/admin/master" : "/admin/content"}>
                        <Shield className="h-4 w-4" />
                        <span>{isSuperAdmin ? "Super Admin" : "Admin"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to Home">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!justify-center text-muted-foreground"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden truncate">Sign Out</span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
