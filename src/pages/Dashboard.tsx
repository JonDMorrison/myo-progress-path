import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
      } else if (userData.role === "therapist" || userData.role === "admin") {
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Montrose Myo...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
