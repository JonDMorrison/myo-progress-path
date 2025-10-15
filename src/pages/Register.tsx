import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Lock, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const Register = () => {
  const [step, setStep] = useState<'passcode' | 'details'>('passcode');
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('validate-passcode', {
        body: { passcode }
      });

      if (error) throw error;

      if (data?.valid) {
        setStep('details');
        toast({
          title: "Access granted",
          description: "Please complete your registration.",
        });
      } else {
        toast({
          title: "Invalid passcode",
          description: data?.error || "Please check your passcode and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to validate passcode",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      const { error } = await supabase.auth.signUp({
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

      // Auto-login after registration
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      toast({
        title: "Account created!",
        description: "Welcome to Montrose Myo!",
      });

      // Redirect to onboarding
      navigate("/onboarding");
    } catch (error: any) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent px-4 py-8">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center shadow-progress">
            {step === 'passcode' ? (
              <Lock className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {step === 'passcode' ? 'Access Required' : 'Create Your Account'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'passcode' 
              ? 'Enter your passcode from Montrose Dental Centre to get started' 
              : 'Complete your registration to begin your therapy journey'}
          </CardDescription>
        </CardHeader>

        {step === 'passcode' ? (
          <form onSubmit={validatePasscode}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passcode">Access Passcode</Label>
                <Input
                  id="passcode"
                  type="text"
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  className="h-11"
                  autoComplete="off"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Validating..." : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

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
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    terms and conditions
                  </Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    privacy policy
                  </Link>
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-11" disabled={loading || !agreedToTerms}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <button
                type="button"
                onClick={() => setStep('passcode')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to passcode
              </button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Register;
