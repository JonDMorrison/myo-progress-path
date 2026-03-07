import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Smartphone } from "lucide-react";
import { logAudit } from "@/lib/audit";

export default function SetupMFA() {
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user: authUser, role, isRoleReady } = useAuth();

  useEffect(() => {
    if (!isRoleReady || !authUser) return;
    checkMfaStatus();
  }, [isRoleReady, authUser?.id]);

  async function checkMfaStatus() {
    try {
      // Check if user already has MFA enabled
      const { data: userData } = await supabase
        .from("users")
        .select("role, mfa_enabled")
        .eq("id", authUser!.id)
        .single();

      if (userData?.mfa_enabled) {
        navigate("/dashboard");
        return;
      }

      // Check if MFA is required for this role
      const requiresMfa = ["therapist", "admin", "super_admin"].includes(userData?.role || "");
      if (!requiresMfa) {
        navigate("/dashboard");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error checking MFA status:", error);
      setLoading(false);
    }
  }

  async function enrollMfa() {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Montrose Myo TOTP"
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);

      await logAudit("mfa_enrollment_started", "user");

      toast({
        title: "MFA Enrollment Started",
        description: "Scan the QR code with your authenticator app"
      });
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setEnrolling(false);
    }
  }

  async function verifyMfa() {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode
      });

      if (error) throw error;

      // Mark MFA as enabled in users table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("users")
          .update({
            mfa_enabled: true,
            mfa_enforced_at: new Date().toISOString()
          })
          .eq("id", user.id);

        await logAudit("mfa_enrollment_completed", "user");
      }

      toast({
        title: "MFA Enabled Successfully",
        description: "Your account is now protected with two-factor authentication"
      });

      // Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid code, please try again",
        variant: "destructive"
      });
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Enable Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Your role requires MFA for enhanced security. Set up an authenticator app to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!qrCode ? (
            <>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <Smartphone className="h-5 w-5 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Before you begin:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                      <li>Have your phone ready to scan a QR code</li>
                      <li>Keep your backup codes in a safe place</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={enrollMfa} 
                disabled={enrolling}
                className="w-full"
              >
                {enrolling ? "Setting up..." : "Start MFA Setup"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                    {secret}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Manual entry code (if QR scan doesn't work)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifyCode">Verification Code</Label>
                <Input
                  id="verifyCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={verifyMfa} 
                disabled={enrolling || verifyCode.length !== 6}
                className="w-full"
              >
                {enrolling ? "Verifying..." : "Verify and Enable MFA"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
