import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * Settings page - redirects to appropriate account/settings page based on role
 */
const Settings = () => {
  const navigate = useNavigate();
  const { role, isRoleReady } = useAuth();

  useEffect(() => {
    if (!isRoleReady) return;

    if (role === "patient") {
      navigate("/patient/account", { replace: true });
    } else if (role === "therapist") {
      navigate("/therapist", { replace: true });
    } else if (role === "admin" || role === "super_admin") {
      navigate("/admin/master", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [isRoleReady, role, navigate]);

  return <LoadingSpinner message="Redirecting..." />;
};

export default Settings;
