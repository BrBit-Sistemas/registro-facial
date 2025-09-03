import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PersonRegister from "./pages/PersonRegister";
import PersonList from "./pages/PersonList";
import CompanyRegister from "./pages/CompanyRegister";
import CourtRegister from "./pages/CourtRegister";
import RegimeRegister from "./pages/RegimeRegister";
import FrequencyTypeRegister from "./pages/FrequencyTypeRegister";
import ClosureReasonRegister from "./pages/ClosureReasonRegister";
import OccurrenceTypeRegister from "./pages/OccurrenceTypeRegister";
import OccurrenceHistory from "./pages/OccurrenceHistory";
import FacialReview from "./pages/FacialReview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/person-register" element={<ProtectedRoute><PersonRegister /></ProtectedRoute>} />
            <Route path="/person-list" element={<ProtectedRoute><PersonList /></ProtectedRoute>} />
            <Route path="/company-register" element={<ProtectedRoute><CompanyRegister /></ProtectedRoute>} />
            <Route path="/court-register" element={<ProtectedRoute><CourtRegister /></ProtectedRoute>} />
            <Route path="/regime-register" element={<ProtectedRoute><RegimeRegister /></ProtectedRoute>} />
            <Route path="/frequency-type" element={<ProtectedRoute><FrequencyTypeRegister /></ProtectedRoute>} />
            <Route path="/closure-reason" element={<ProtectedRoute><ClosureReasonRegister /></ProtectedRoute>} />
            <Route path="/occurrence-type" element={<ProtectedRoute><OccurrenceTypeRegister /></ProtectedRoute>} />
            <Route path="/occurrence-history" element={<ProtectedRoute><OccurrenceHistory /></ProtectedRoute>} />
            <Route path="/facial-review" element={<ProtectedRoute><FacialReview /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;