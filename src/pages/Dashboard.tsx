import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get user's role
      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        navigate("/auth");
        return;
      }

      // Redirect based on role
      if (userData.role === "patient") {
        // Check if patient needs to complete onboarding
        const { data: patient } = await supabase
          .from("patients")
          .select("id")
          .eq("user_id", session.user.id)
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
      } else if (userData.role === "therapist" || userData.role === "admin" || userData.role === "super_admin") {
        navigate("/therapist");
      } else {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Montrose Myo..." />;
  }

  return null;
};

export default Index;
