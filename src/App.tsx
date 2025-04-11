
import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/auth-context";
import { Layout } from "./components/layout/layout";  // Changed from default import to named import
import DashboardPage from "./pages/dashboard";
import ProgressUbinanPage from "./pages/progress-ubinan";
import PetugasPage from "./pages/petugas";
import WilayahPage from "./pages/wilayah";
import AlokasiWilayahPage from "./pages/alokasi-wilayah";
import AlokasiPetugasPage from "./pages/alokasi-petugas";
import VerifikasiPage from "./pages/verifikasi";
import InputUbinanPage from "./pages/input-ubinan";
import ProfilePage from "./pages/profil";
import NotFoundPage from "./pages/not-found";

// Create the QueryClient instance within the App component function
function App() {
  const queryClient = new QueryClient();
  
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/progres" element={<ProgressUbinanPage />} />
                  <Route path="/petugas" element={<PetugasPage />} />
                  <Route path="/input-data" element={<InputUbinanPage />} />
                  <Route path="/wilayah" element={<WilayahPage />} />
                  <Route path="/alokasi-wilayah" element={<AlokasiWilayahPage />} />
                  <Route path="/alokasi-petugas" element={<AlokasiPetugasPage />} />
                  <Route path="/verifikasi" element={<VerifikasiPage />} />
                  <Route path="/profil" element={<ProfilePage />} />
                  <Route path="/pengaturan" element={<div className="p-8 text-center">Halaman Pengaturan (akan dikembangkan)</div>} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
