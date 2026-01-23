import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import CompanyListings from "./pages/student/CompanyListings";
import Applications from "./pages/student/Applications";
import PlacementStats from "./pages/student/PlacementStats";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import ManageCompanies from "./pages/officer/ManageCompanies";
import ManageApplications from "./pages/officer/ManageApplications";
import ManageNotifications from "./pages/officer/ManageNotifications";
import CompanyDetails from "./pages/CompanyDetails";
import StudentNotifications from "./pages/student/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isLoading } = useAuth();
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
  const showLoader = hasToken && isLoading;

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      {showLoader && <LoadingScreen />}

      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <div style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/companies" element={<CompanyListings />} />
            <Route path="/student/applications" element={<Applications />} />
            <Route path="/student/stats" element={<PlacementStats />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            
            {/* Officer Routes */}
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/companies" element={<ManageCompanies />} />
            <Route path="/officer/applications" element={<ManageApplications />} />
            <Route path="/officer/notifications" element={<ManageNotifications />} />
            
            {/* Company Details */}
            <Route path="/company/:id" element={<CompanyDetails />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
