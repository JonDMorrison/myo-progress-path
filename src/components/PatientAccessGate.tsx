import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PatientAccessGateProps {
  children: React.ReactNode;
}

export function PatientAccessGate({ children }: PatientAccessGateProps) {
  const { role, user, isRoleReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState<boolean | null>(null);

  useEffect(() => {
    const loadApproval = async () => {
      if (!isRoleReady) return;
      if (role !== "patient") {
        setApproved(true);
        setLoading(false);
        return;
      }
      if (!user) {
        setApproved(false);
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase as any)
        .from("patients")
        .select("access_approved_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to check patient access approval", error);
        setApproved(false);
      } else {
        setApproved(Boolean(data?.access_approved_at));
      }
      setLoading(false);
    };

    loadApproval();
  }, [isRoleReady, role, user?.id]);

  if (!isRoleReady || loading) {
    return <LoadingSpinner message="Checking access..." />;
  }

  if (role !== "patient") {
    return <>{children}</>;
  }

  if (approved) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-lg w-full rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Access pending approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Your access code was accepted, but your therapist still needs to approve your account before modules unlock.
          </p>
          <p>
            You do not need to create another account. Check back after your therapist confirms your access.
          </p>
          <Button asChild className="w-full">
            <a href="/onboarding">Review onboarding</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
