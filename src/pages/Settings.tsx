import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Settings page - redirects to appropriate account/settings page based on role
 */
const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      // Redirect based on role
      if (userData?.role === "patient") {
        navigate("/patient/account", { replace: true });
      } else if (userData?.role === "therapist") {
        navigate("/therapist", { replace: true });
      } else if (userData?.role === "admin" || userData?.role === "super_admin") {
        navigate("/admin/master", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    };

    redirect();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

export default Settings;
