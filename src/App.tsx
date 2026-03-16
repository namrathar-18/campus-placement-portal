import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import AuthPage from "./pages/AuthPage";
import ProfileSetup from "./pages/student/ProfileSetup";
import StudentDashboard from "./pages/student/StudentDashboard";
import CompanyListings from "./pages/student/CompanyListings";
import Applications from "./pages/student/Applications";
import PlacementStats from "./pages/student/PlacementStats";
import AlumniConnect from "./pages/student/AlumniConnect";
import PlacedCompany from "./pages/student/PlacedCompany";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import ManageCompanies from "./pages/officer/ManageCompanies";
import ManageApplications from "./pages/officer/ManageApplications";
import CompanyApplications from "./pages/officer/CompanyApplications";
import ManageNotifications from "./pages/officer/ManageNotifications";
import StudentStats from "./pages/officer/StudentStats";
import PlacementAnalytics from "./pages/officer/PlacementAnalytics";
import PlacedStudents from "./pages/officer/PlacedStudents";
import RepresentativeDashboard from "./pages/representative/RepresentativeDashboard";

import CompanyDetails from "./pages/CompanyDetails";
import StudentNotifications from "./pages/student/Notifications";
import ResumeAnalyzer from "./pages/student/ResumeAnalyzer";
import NotFound from "./pages/NotFound";
import ZenithChatbot from "@/components/chatbot/zenith/ZenithChatbot";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevents refetch-induced flicker when the tab/window regains focus
      refetchOnWindowFocus: false,
      // Keep retry disabled for now to avoid repeated spinners on failing endpoints
      retry: false,
    },
  },
});

const AppContent = () => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
  const showLoader = hasToken && isLoading;
  const showZenith = isAuthenticated && user?.role === "student";

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      {showLoader && <LoadingScreen />}

      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <div style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Student Routes */}
            <Route path="/student/profile-setup" element={<ProfileSetup />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/student/companies" element={<CompanyListings />} />
            <Route path="/student/alumni-connect" element={<AlumniConnect />} />
            <Route path="/student/applications" element={<Applications />} />
            <Route path="/student/stats" element={<PlacementStats />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/placed-company" element={<PlacedCompany />} />
            <Route path="/student/resume-analyzer" element={<ResumeAnalyzer />} />
            
            {/* Officer Routes */}
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/companies" element={<ManageCompanies />} />
            <Route path="/officer/applications" element={<ManageApplications />} />
            <Route path="/officer/applications/:companyId" element={<CompanyApplications />} />
            <Route path="/officer/notifications" element={<ManageNotifications />} />
            <Route path="/officer/students" element={<StudentStats />} />
            <Route path="/officer/analytics" element={<PlacementAnalytics />} />
            <Route path="/officer/placed-students" element={<PlacedStudents />} />
            
            {/* Student Representative Routes */}
            <Route path="/representative/dashboard" element={<RepresentativeDashboard />} />
            <Route path="/representative/companies" element={<ManageCompanies />} />
            <Route path="/representative/applications" element={<ManageApplications />} />
            <Route path="/representative/applications/:companyId" element={<CompanyApplications />} />
            <Route path="/representative/notifications" element={<ManageNotifications />} />
            
            {/* Company Details */}
            <Route path="/company/:id" element={<CompanyDetails />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {showZenith && <ZenithChatbot userId={user.id} />}
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
