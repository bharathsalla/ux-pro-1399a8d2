import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { AdminProvider, useAdminContext } from "@/contexts/AdminContext";
import AuthPage from "@/components/auth/AuthPage";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import FlowCheckPage from "./pages/FlowCheckPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import WhyFreePage from "./pages/WhyFreePage";
import TranscriptToUIPage from "./pages/TranscriptToUIPage";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAdmin } = useAdminContext();
  const { user, loading } = useAuthContext();

  // Admin view (can bypass login via passcode)
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in — show auth page
  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/transcript" element={<TranscriptToUIPage />} />
      <Route path="/flowcheck" element={<FlowCheckPage />} />
      <Route path="/testimonials" element={<TestimonialsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/why-it-is-free" element={<WhyFreePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// App root
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AdminProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </AdminProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
