import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            role: "patient",
          },
        },
      });

      if (error) throw error;

      // If email confirmation is disabled, session is returned immediately
      if (data.session) {
        const userId = data.session.user.id;
        const userEmail = data.session.user.email || email;
        const userName = name;

        // Call edge function to create profile rows (bypasses RLS)
        let profileCreated = false;
        try {
          // Re-get the session to ensure JWT is available
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          const { data: fnData, error: fnError } = await supabase.functions.invoke('create-user-profile', {
            body: { userId, email: userEmail, name: userName },
            headers: currentSession?.access_token
              ? { Authorization: `Bearer ${currentSession.access_token}` }
              : {}
          });
          if (fnError) {
            console.error('Edge function error:', fnError);
          } else {
            profileCreated = true;
          }
        } catch (e) {
          console.error('Profile creation failed:', e);
        }

        // Navigate regardless — OnboardingWizard has retry logic
        // but log if it failed so we can debug
        if (!profileCreated) {
          console.error('Profile creation failed for:', userEmail, userId);
        }
        navigate('/onboarding');
      } else {
        // Email confirmation still required
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before logging in.",
        });
        navigate("/auth");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account before logging in.",
        });
        navigate("/auth");
        return;
      }

      if (error.message.includes("rate limit")) {
        toast({
          title: "Too many attempts",
          description: "Please wait a minute before trying again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-12">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />

      <Card className="w-full max-w-md shadow-2xl border-none bg-white relative z-10 rounded-3xl overflow-hidden animate-fade-in-up">
        <CardHeader className="space-y-6 text-center pb-8 pt-10 px-8">
          <div className="mx-auto flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20 transform rotate-3 transition-transform duration-500 hover:rotate-0">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Create Account
              </h1>
              <p className="text-primary font-bold tracking-widest text-[10px] uppercase">
                Get Started
              </p>
            </div>
          </div>
          <CardDescription className="text-slate-500 text-base leading-relaxed">
            Join the Montrose Myo program and track your progress to better oral health.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-semibold ml-1">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold ml-1">Email</Label>
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold ml-1">Password</Label>
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
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                At least 6 characters
              </p>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-500 leading-relaxed font-medium"
              >
                By creating an account, I agree to the <Link to="/terms" className="text-primary font-bold hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pt-6 pb-12 px-8">
            <Button type="submit" className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all rounded-xl disabled:opacity-50" disabled={loading || !agreedToTerms}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/auth" className="text-primary hover:text-primary/80 font-bold decoration-2 underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
