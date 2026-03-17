import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import AdminContent from "./pages/AdminContent";
import ReviewWeek from "./pages/ReviewWeek";
import Reports from "./pages/Reports";
import TherapistAIAssist from "./pages/TherapistAIAssist";
import MasterAdmin from "./pages/MasterAdmin";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import SeedSuperAdmins from "./pages/SeedSuperAdmins";
import SeedProgram from "./pages/admin/SeedProgram";
import UpdateWeeks1And2 from "./pages/admin/UpdateWeeks1And2";
import UpdateWeeks3And4 from "./pages/admin/UpdateWeeks3And4";
import UpdateWeeks5And6 from "./pages/admin/UpdateWeeks5And6";
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

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
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

                {/* Protected: Any authenticated user */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />
                <Route path="/week-0" element={<ProtectedRoute><Week0 /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/setup-mfa" element={<ProtectedRoute><SetupMFA /></ProtectedRoute>} />

                {/* Protected: Patient routes */}
                <Route path="/patient" element={<ProtectedRoute requiredRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/progress" element={<ProtectedRoute requiredRoles={["patient"]}><PatientProgress /></ProtectedRoute>} />
                <Route path="/patient/messages" element={<ProtectedRoute requiredRoles={["patient"]}><PatientMessages /></ProtectedRoute>} />
                <Route path="/patient/account" element={<ProtectedRoute requiredRoles={["patient"]}><PatientAccount /></ProtectedRoute>} />
                <Route path="/week/:weekNumber" element={<ProtectedRoute requiredRoles={["patient", "therapist", "admin", "super_admin"]}><WeekDetail /></ProtectedRoute>} />
                <Route path="/protocol/:slug" element={<ProtectedRoute requiredRoles={["patient", "therapist", "admin", "super_admin"]}><ProtocolDetail /></ProtectedRoute>} />

                {/* Protected: Staff routes */}
                <Route path="/therapist" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><TherapistDashboard /></ProtectedRoute>} />
                <Route path="/therapist/patients" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><TherapistPatients /></ProtectedRoute>} />
                <Route path="/therapist/ai-assist" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><TherapistAIAssist /></ProtectedRoute>} />
                <Route path="/review/:patientId/:weekNumber" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><ReviewWeek /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute requiredRoles={["therapist", "admin", "super_admin"]}><Reports /></ProtectedRoute>} />

                {/* Protected: Admin routes */}
                <Route path="/admin/content" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><AdminContent /></ProtectedRoute>} />
                <Route path="/admin/seed-program" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><SeedProgram /></ProtectedRoute>} />
                <Route path="/admin/update-weeks-1-2" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><UpdateWeeks1And2 /></ProtectedRoute>} />
                <Route path="/admin/update-weeks-3-4" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><UpdateWeeks3And4 /></ProtectedRoute>} />
                <Route path="/admin/update-weeks-5-6" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><UpdateWeeks5And6 /></ProtectedRoute>} />
                <Route path="/admin/media-audit" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><MediaAudit /></ProtectedRoute>} />
                <Route path="/admin/exercise-editor" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><ExerciseContentEditor /></ProtectedRoute>} />
                <Route path="/admin/week-settings" element={<ProtectedRoute requiredRoles={["admin", "super_admin"]}><WeekSettingsEditor /></ProtectedRoute>} />

                {/* Protected: Super admin routes */}
                <Route path="/seed-super-admins" element={<ProtectedRoute requiredRoles={["super_admin"]}><SeedSuperAdmins /></ProtectedRoute>} />
                <Route path="/admin/master" element={<ProtectedRoute requiredRoles={["super_admin"]}><MasterAdmin /></ProtectedRoute>} />
                <Route path="/admin/super-admins" element={<ProtectedRoute requiredRoles={["super_admin"]}><SuperAdminManagement /></ProtectedRoute>} />
                <Route path="/admin/delete-patients" element={<ProtectedRoute requiredRoles={["super_admin"]}><PatientDeleteTool /></ProtectedRoute>} />
                <Route path="/admin/testing-feedback" element={<ProtectedRoute requiredRoles={["super_admin"]}><TestingFeedback /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
