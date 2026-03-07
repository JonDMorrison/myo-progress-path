import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope } from "lucide-react";

function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number, label: string): Promise<T> {
  const promise = Promise.resolve(promiseLike);
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out. Please try again.`)), ms)
    ),
  ]);
}

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const redirectByRole = async (userId: string, metadataRole?: string) => {
    // Try user_metadata role first (available immediately from auth response, no extra query)
    // Fall back to RPC only if metadata is missing
    let role = metadataRole || null;
    
    if (!role) {
      try {
        const { data: rpcRole } = await withTimeout(
          supabase.rpc("get_user_role", { _user_id: userId }),
          10_000,
          "Checking account permissions"
        );
        role = rpcRole;
      } catch {
        // If RPC times out, try reading from session metadata as last resort
        const { data: { session } } = await supabase.auth.getSession();
        role = session?.user?.user_metadata?.role || null;
      }
    }

    if (role && (role === "therapist" || role === "admin" || role === "super_admin")) {
      navigate("/therapist", { replace: true });
      return;
    }

    // If not a known staff role, check if they are a patient
    const { data: patient } = await withTimeout(
      supabase.from("patients").select("id").eq("user_id", userId).maybeSingle(),
      15_000,
      "Loading patient profile",
    );

    if (patient?.id) {
      const { data: onboarding } = await withTimeout(
        supabase
          .from("onboarding_progress")
          .select("completed_at")
          .eq("patient_id", patient.id)
          .maybeSingle(),
        10_000,
        "Loading onboarding"
      );

      if (!onboarding?.completed_at) {
        navigate("/onboarding", { replace: true });
        return;
      }

      navigate("/patient", { replace: true });
      return;
    }

    if (role) {
      navigate("/therapist", { replace: true });
      return;
    }

    navigate("/", { replace: true });
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          await redirectByRole(session.user.id);
        } catch {
          // If something is misconfigured, keep the user on /auth so they can retry or reset password.
        }
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
        const { error } = await withTimeout(
          supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
            },
          }),
          15_000,
          "Sending magic link",
        );

        if (error) throw error;

        toast({
          title: "Check your email",
          description: "We sent you a magic link to sign in.",
        });
      } else {
        // Password login
        const { error, data } = await withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          15_000,
          "Signing in",
        );

        if (error) throw error;

        const signedInUserId = data.user?.id || data.session?.user?.id;
        if (!signedInUserId) {
          throw new Error("Signed in, but could not read user id from the session. Please refresh and try again.");
        }

        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });

        await redirectByRole(signedInUserId);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />

      <Card className="w-full max-w-md shadow-2xl border-none bg-white relative z-10 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-6 text-center pb-8 pt-10">
          <div className="mx-auto flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img src="/favicon.png" alt="Montrose Myo" className="h-14 w-14 brightness-0 invert" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 font-outfit">Montrose Myo</h1>
              <p className="text-primary font-bold tracking-widest text-xs uppercase">Patient Portal</p>
            </div>
          </div>
          <CardDescription className="text-slate-500 text-lg">
            {useMagicLink ? 'Secure sign in via email' : 'Continue your therapy journey'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleAuth}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all"
              />
            </div>

            {!useMagicLink && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pt-4 pb-12 px-8">
            <Button type="submit" className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all rounded-xl" disabled={loading}>
              {loading ? "Authenticating..." : useMagicLink ? "Send Magic Link" : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setUseMagicLink(!useMagicLink)}
                className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                {useMagicLink ? "Use password instead" : "Use magic link instead"}
              </button>
            </div>

            <div className="text-center text-sm text-slate-400 pt-6 border-t border-slate-100 w-full">
              New patient?{" "}
              <Link to="/register" className="text-primary hover:text-primary/80 font-bold decoration-2 underline-offset-4 hover:underline">
                Create Account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
