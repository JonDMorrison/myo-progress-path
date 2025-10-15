import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (useMagicLink) {
        // Magic link login
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;

        toast({
          title: "Check your email",
          description: "We sent you a magic link to sign in.",
        });
      } else {
        // Password login
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        // Get user role to redirect appropriately
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });

        // Redirect based on role
        if (userData?.role === "patient") {
          // Check if patient needs onboarding
          const { data: patient } = await supabase
            .from("patients")
            .select("id")
            .eq("user_id", data.user.id)
            .single();

          if (patient) {
            const { data: onboarding } = await supabase
              .from("onboarding_progress")
              .select("completed_at")
              .eq("patient_id", patient.id)
              .maybeSingle();

            if (!onboarding?.completed_at) {
              navigate("/onboarding");
              return;
            }
          }
          navigate("/patient");
        } else if (userData?.role === "therapist" || userData?.role === "admin") {
          navigate("/therapist");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent px-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex items-center gap-2">
            <img src="/favicon.png" alt="Montrose Myo" className="h-12 w-12" />
            <h1 className="text-3xl font-bold">Montrose Myo</h1>
          </div>
          <CardDescription className="text-base">
            Welcome back to your therapy journey
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {!useMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Loading..." : useMagicLink ? "Send Magic Link" : "Sign In"}
            </Button>

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => setUseMagicLink(!useMagicLink)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {useMagicLink ? "Use password instead" : "Use magic link instead"}
              </button>
              
              {!useMagicLink && (
                <button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              Need access?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Get your passcode
              </Link>
              {" "}from Montrose Dental Centre
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
