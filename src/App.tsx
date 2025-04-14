
import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/auth-context";
import { Layout } from "./components/layout/layout";
import DashboardPage from "./pages/dashboard";
import ProgressUbinanPage from "./pages/progress-ubinan";
import PetugasPage from "./pages/petugas";
import WilayahPage from "./pages/wilayah";
import AlokasiWilayahPage from "./pages/alokasi-wilayah";
import AlokasiPetugasPage from "./pages/alokasi-petugas";
import VerifikasiPage from "./pages/verifikasi";
import InputUbinanPage from "./pages/input-ubinan";
import PetugasProgresPage from "./pages/petugas-progres";
import ProfilePage from "./pages/profil";
import NotFoundPage from "./pages/not-found";
import LoginPage from "./pages/login";
import { UserRole } from "./types/user";

// Create a route guard component to restrict access based on role
function RoleBasedRoute({ element, allowedRoles }: { element: React.ReactNode, allowedRoles: UserRole[] }) {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Allow access if user has the required role
  if (user && allowedRoles.includes(user.role)) {
    return element;
  }
  
  // Redirect to not found page if user doesn't have access
  return <NotFoundPage />;
}

// Create a component that redirects authenticated users away from login
function AuthRedirect({ element }: { element: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/progres" replace />;
  }
  
  return element;
}

// Create the QueryClient instance within the App component function
function App() {
  const queryClient = new QueryClient();
  
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/login" element={
                  <AuthRedirect element={<LoginPage />} />
                } />
                
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/progres" element={<ProgressUbinanPage />} />
                  <Route path="/petugas" element={
                    <RoleBasedRoute 
                      element={<PetugasPage />} 
                      allowedRoles={[UserRole.ADMIN]} 
                    />
                  } />
                  <Route path="/input-data" element={
                    <RoleBasedRoute 
                      element={<InputUbinanPage />} 
                      allowedRoles={[UserRole.PPL]} 
                    />
                  } />
                  <Route path="/wilayah" element={
                    <RoleBasedRoute 
                      element={<WilayahPage />} 
                      allowedRoles={[UserRole.ADMIN]} 
                    />
                  } />
                  <Route path="/alokasi-wilayah" element={
                    <RoleBasedRoute 
                      element={<AlokasiWilayahPage />} 
                      allowedRoles={[UserRole.ADMIN]} 
                    />
                  } />
                  <Route path="/alokasi-petugas" element={
                    <RoleBasedRoute 
                      element={<AlokasiPetugasPage />} 
                      allowedRoles={[UserRole.ADMIN]} 
                    />
                  } />
                  <Route path="/verifikasi" element={
                    <RoleBasedRoute 
                      element={<VerifikasiPage />} 
                      allowedRoles={[UserRole.PML]} 
                    />
                  } />
                  <Route path="/petugas-progres" element={
                    <RoleBasedRoute 
                      element={<PetugasProgresPage />} 
                      allowedRoles={[UserRole.ADMIN]} 
                    />
                  } />
                  <Route path="/profil" element={<ProfilePage />} />
                  <Route path="/pengaturan" element={
                    <RoleBasedRoute 
                      element={<div className="p-8 text-center">Halaman Pengaturan (akan dikembangkan)</div>} 
                      allowedRoles={[UserRole.ADMIN]} 
                    />
                  } />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
