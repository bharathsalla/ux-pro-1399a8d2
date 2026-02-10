import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider, useAdminContext } from "@/contexts/AdminContext";
// Auth page removed — persona page loads directly
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import FlowCheckPage from "./pages/FlowCheckPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import WhyFreePage from "./pages/WhyFreePage";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAdmin } = useAdminContext();

  // Admin view
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
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
