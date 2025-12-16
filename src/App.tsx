import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import SuperAdminManagement from "./pages/admin/SuperAdminManagement";
import PatientDeleteTool from "./pages/admin/PatientDeleteTool";
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

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/week-0" element={<Week0 />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:slug" element={<LearnArticle />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/what-is-myofunctional-therapy" element={<WhatIsMyofunctionalTherapy />} />
            <Route path="/clinical-testing" element={<ClinicalTesting />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/seed-super-admins" element={<SeedSuperAdmins />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/progress" element={<PatientProgress />} />
            <Route path="/patient/messages" element={<PatientMessages />} />
            <Route path="/patient/account" element={<PatientAccount />} />
            <Route path="/therapist" element={<TherapistDashboard />} />
            <Route path="/therapist/patients" element={<TherapistPatients />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/master" element={<MasterAdmin />} />
            <Route path="/admin/seed-program" element={<SeedProgram />} />
            <Route path="/admin/update-weeks-1-2" element={<UpdateWeeks1And2 />} />
            <Route path="/admin/update-weeks-3-4" element={<UpdateWeeks3And4 />} />
            <Route path="/admin/update-weeks-5-6" element={<UpdateWeeks5And6 />} />
            <Route path="/admin/media-audit" element={<MediaAudit />} />
            <Route path="/admin/super-admins" element={<SuperAdminManagement />} />
            <Route path="/admin/delete-patients" element={<PatientDeleteTool />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/therapist/ai-assist" element={<TherapistAIAssist />} />
            <Route path="/week/:weekNumber" element={<WeekDetail />} />
            <Route path="/review/:patientId/:weekNumber" element={<ReviewWeek />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
