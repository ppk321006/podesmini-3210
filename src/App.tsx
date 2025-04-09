
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context";
import { Layout } from "@/components/layout/layout";
import DashboardPage from "./pages/dashboard";
import NotFoundPage from "./pages/not-found";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              {/* We'll add other routes as we develop them */}
              <Route path="/progres" element={<div className="p-8 text-center">Halaman Progres Ubinan (akan dikembangkan)</div>} />
              <Route path="/petugas" element={<div className="p-8 text-center">Halaman Manajemen Petugas (akan dikembangkan)</div>} />
              <Route path="/input-data" element={<div className="p-8 text-center">Halaman Input Data (akan dikembangkan)</div>} />
              <Route path="/wilayah" element={<div className="p-8 text-center">Halaman Alokasi Wilayah (akan dikembangkan)</div>} />
              <Route path="/verifikasi" element={<div className="p-8 text-center">Halaman Verifikasi Data (akan dikembangkan)</div>} />
              <Route path="/profil" element={<div className="p-8 text-center">Halaman Profil (akan dikembangkan)</div>} />
              <Route path="/pengaturan" element={<div className="p-8 text-center">Halaman Pengaturan (akan dikembangkan)</div>} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
