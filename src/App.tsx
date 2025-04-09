
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context";
import { Layout } from "@/components/layout/layout";
import DashboardPage from "./pages/dashboard";
import PetugasPage from "./pages/petugas";
import WilayahPage from "./pages/wilayah";
import AlokasiWilayahPage from "./pages/alokasi-wilayah";
import AlokasiPetugasPage from "./pages/alokasi-petugas";
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
              <Route path="/progres" element={<div className="p-8 text-center">Halaman Progres Ubinan (akan dikembangkan)</div>} />
              <Route path="/petugas" element={<PetugasPage />} />
              <Route path="/input-data" element={<div className="p-8 text-center">Halaman Input Data (akan dikembangkan)</div>} />
              <Route path="/wilayah" element={<WilayahPage />} />
              <Route path="/alokasi-wilayah" element={<AlokasiWilayahPage />} />
              <Route path="/alokasi-petugas" element={<AlokasiPetugasPage />} />
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
