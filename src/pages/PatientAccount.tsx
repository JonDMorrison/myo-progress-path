import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect to patient dashboard - Account section is shown on main dashboard
const PatientAccount = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/patient", { replace: true });
  }, [navigate]);

  return null;
};

export default PatientAccount;
