import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect to patient dashboard - Messages section is shown on main dashboard
const PatientMessages = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/patient", { replace: true });
  }, [navigate]);

  return null;
};

export default PatientMessages;
