import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthReady } from "@/hooks/useAuthReady";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const Index = () => {
  const navigate = useNavigate();
  const { isReady, user, role } = useAuthReady();

  useEffect(() => {
    if (!isReady) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    const redirect = async () => {
      if (role === "therapist" || role === "admin" || role === "super_admin") {
        navigate("/therapist", { replace: true });
        return;
      }

      if (role === "patient") {
        const { data: patient } = await supabase
          .from("patients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (patient) {
          const { data: onboarding } = await supabase
            .from("onboarding_progress")
            .select("completed_at")
            .eq("patient_id", patient.id)
            .maybeSingle();

          if (!onboarding?.completed_at) {
            navigate("/onboarding", { replace: true });
            return;
          }
        }

        navigate("/patient", { replace: true });
        return;
      }

      navigate("/auth", { replace: true });
    };

    redirect();
  }, [isReady, user?.id, role]);

  return <LoadingSpinner message="Loading Montrose Myo..." />;
};

export default Index;
