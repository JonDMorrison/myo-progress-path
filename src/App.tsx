import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PatientAccessGate } from "@/components/PatientAccessGate";
import Home from "./pages/Home";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";
import PatientDashboard from "./pages/PatientDashboard";
import WeekDetail from "./pages/WeekDetail";
import TherapistDashboard from "./pages/TherapistDashboard";
import TherapistPatients from "./pages/TherapistPatients";
import AccessRequests from "./pages/AccessRequests";
import PatientOverview from "./pages/PatientOverview";
import AdminContent from "./pages/AdminContent";
import ReviewWeek from "./pages/ReviewWeek";
import MasterAdmin from "./pages/MasterAdmin";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import SeedSuperAdmins from "./pages/SeedSuperAdmins";
import SeedProgram from "./pages/admin/SeedProgram";
import MediaAudit from "./pages/admin/MediaAudit";
import ExerciseContentEditor from "./pages/admin/ExerciseContentEditor";
import WeekSettingsEditor from "./pages/admin/WeekSettingsEditor";
import SuperAdminManagement from "./pages/admin/SuperAdminManagement";
import PatientDeleteTool from "./pages/admin/PatientDeleteTool";
import TestingFeedback from "./pages/admin/TestingFeedback";
import NotFound from "./pages/NotFound";
import Week0 from "./pages/Week0";
import Learn from "./pages/Learn";
import LearnArticle from "./pages/LearnArticle";
import WhatIsMyofunctionalTherapy from "./pages/WhatIsMyofunctionalTherapy";
import Resources from "./pages/Resources";
import PatientProgress from "./pages/PatientProgress";
import PatientMessages from "./pages/PatientMessages";
import PatientAccount from "./pages/PatientAccount";
import ClinicalTesting from "./pages/ClinicalTesting";
import ProtocolDetail from "./pages/ProtocolDetail";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import SetupMFA from "./pages/SetupMFA";

const queryClient = new QueryClient();
const patientGate = (node: React.ReactNode) => <PatientAccessGate>{node}</PatientAccessGate>;

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:slug" element={<LearnArticle />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/what-is-myofunctional-therapy" element={<WhatIsMyofunctionalTherapy />} />
              <Route path="/clinical-testing" element={<ClinicalTesting />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />
              <Route path="/week-0" element={<ProtectedRoute><Week0 /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/setup-mfa" element={<ProtectedRoute><SetupMFA /></ProtectedRoute>} />
              <Route path="/patient" element={<ProtectedRoute requiredRoles={["patient"]}>{patientGate(<PatientDashboard />)}</ProtectedRoute>} />
              <Route path="/patient/progress" element={<ProtectedRoute requiredRoles={["patient"]}>{patientGate(<PatientProgress />)}</ProtectedRoute>} />
              <Route path="/patient/messages" element={<ProtectedRoute requiredRoles={["patient"]}>{patientGate(<PatientMessages />)}</ProtectedRoute>} />
              <Route path="/patient/account" element={<ProtectedRoute requiredRoles={["patient"]}>{patientGate(<PatientAccount />)}</ProtectedRoute>} />
              <Route path="/week/:weekNumber" element={<ProtectedRoute requiredRoles={["patient", "therapist", "admin", "super_admin"]}>{patientGate(<WeekDetail />)}</ProtectedRoute>} />
              <Route path="/protocol/:slug" element={<ProtectedRoute requiredRoles={["patient", "therapist", "admin", "super_admin"]}>{patientGate(<ProtocolDetail />)}</ProtectedRoute>} />
              <Route path="/therapist" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><TherapistDashboard /></ProtectedRoute>} />
              <Route path="/therapist/patients" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><TherapistPatients /></ProtectedRoute>} />
              <Route path="/therapist/requests" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><AccessRequests /></ProtectedRoute>} />
              <Route path="/therapist/patient/:patientId" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><PatientOverview /></ProtectedRoute>} />
              <Route path="/review/:patientId/:weekNumber" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><ReviewWeek /></ProtectedRoute>} />
              <Route path="/admin/content" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><AdminContent /></ProtectedRoute>} />
              <Route path="/admin/seed-program" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><SeedProgram /></ProtectedRoute>} />
              <Route path="/admin/media-audit" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><MediaAudit /></ProtectedRoute>} />
              <Route path="/admin/exercise-editor" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><ExerciseContentEditor /></ProtectedRoute>} />
              <Route path="/admin/week-settings" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><WeekSettingsEditor /></ProtectedRoute>} />
              <Route path="/seed-super-admins" element={<ProtectedRoute requiredRoles={["super_admin"]}><SeedSuperAdmins /></ProtectedRoute>} />
              <Route path="/admin/master" element={<ProtectedRoute requiredRoles={["super_admin"]}><MasterAdmin /></ProtectedRoute>} />
              <Route path="/admin/super-admins" element={<ProtectedRoute requiredRoles={["super_admin"]}><SuperAdminManagement /></ProtectedRoute>} />
              <Route path="/admin/delete-patients" element={<ProtectedRoute requiredRoles={["super_admin"]}><PatientDeleteTool /></ProtectedRoute>} />
              <Route path="/admin/testing-feedback" element={<ProtectedRoute requiredRoles={["super_admin"]}><TestingFeedback /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
