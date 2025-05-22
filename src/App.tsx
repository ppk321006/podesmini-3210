import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { useAuth, AuthProvider } from './context/auth-context';
import { Layout } from './components/layout/layout';
import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { PetugasPage } from './pages/petugas';
import { WilayahPage } from './pages/wilayah';
import InputUbinanPage from './pages/input-ubinan';
import AlokasiPetugasPage from './pages/alokasi-petugas';
import AlokasiWilayahPage from './pages/alokasi-wilayah';
import { VerifikasiPage } from './pages/verifikasi';
import { VerifikasiDataPage } from './pages/verifikasi-data';
import { PendataanPage } from './pages/pendataan';
import { ProgressUbinanPage } from './pages/progress-ubinan';
import { PetugasProgresPage } from './pages/petugas-progres';
import { DokumenUploadPage } from './pages/dokumen/upload';
import { DokumenViewerPage } from './pages/dokumen/viewer';
import { NotificationsPage } from './pages/notifications';
import { ExportDataPage } from './pages/export';
import { ProfilPage } from './pages/profil';
import { NotFoundPage } from './pages/not-found';

const queryClient = new QueryClient();

function App() {
  const { authState } = useAuth();
  const isLoggedIn = authState.isAuthenticated;

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/petugas" element={<PetugasPage />} />
              <Route path="/wilayah" element={<WilayahPage />} />
              <Route path="/input-ubinan" element={<InputUbinanPage />} />
              <Route path="/alokasi-petugas" element={<AlokasiPetugasPage />} />
              <Route path="/alokasi-wilayah" element={<AlokasiWilayahPage />} />
              <Route path="/verifikasi" element={<VerifikasiPage />} />
              <Route path="/verifikasi-data" element={<VerifikasiDataPage />} />
              <Route path="/pendataan" element={<PendataanPage />} />
              <Route path="/progress-ubinan" element={<ProgressUbinanPage />} />
              <Route path="/petugas-progres" element={<PetugasProgresPage />} />
              <Route path="/dokumen/upload" element={<DokumenUploadPage />} />
              <Route path="/dokumen/:id" element={<DokumenViewerPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/export" element={<ExportDataPage />} />
              <Route path="/profil" element={<ProfilPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
