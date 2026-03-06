import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Mail, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BottomNav } from "@/components/layout/BottomNav";
import { PatientHeader } from "@/components/layout/PatientHeader";

const PatientAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        fetchUser(session.user);
      }
    };
    
    init();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && mounted) {
        fetchUser(session.user);
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUser = async (authUser: any) => {
    setUser(authUser);
    
    const { data: userData } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", authUser.id)
      .single();
    
    setUserName(userData?.name || authUser.email?.split("@")[0] || "User");
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <PatientHeader userName={userName} />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{userName}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Account Details */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Details
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground">Patient</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <button
              onClick={() => navigate("/patient/progress")}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">View Progress</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <Separator />
            <button
              onClick={() => navigate("/patient/messages")}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">Messages</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <Separator />
            <button
              onClick={() => navigate("/learn")}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">Learn Hub</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Montrose Myofunctional Therapy
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default PatientAccount;
