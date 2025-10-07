import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import WeekDetail from "./pages/WeekDetail";
import TherapistDashboard from "./pages/TherapistDashboard";
import AdminContent from "./pages/AdminContent";
import ReviewWeek from "./pages/ReviewWeek";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/therapist" element={<TherapistDashboard />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/week/:weekNumber" element={<WeekDetail />} />
          <Route path="/review/:patientId/:weekNumber" element={<ReviewWeek />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
