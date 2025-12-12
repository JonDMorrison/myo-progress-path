import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect to patient dashboard - Progress section is shown on main dashboard
const PatientProgress = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/patient", { replace: true });
  }, [navigate]);

  return null;
};

export default PatientProgress;
