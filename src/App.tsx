
import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/auth-context";
import { Layout } from "./components/layout/layout";
import DashboardPage from "./pages/dashboard";
import PetugasPage from "./pages/petugas";
import WilayahPage from "./pages/wilayah";
import DocumentUploadPage from "./pages/dokumen/upload";
import DocumentViewerPage from "./pages/dokumen/viewer";
import ProfilePage from "./pages/profil";
import PendataanPage from "./pages/pendataan";
import VerifikasiPage from "./pages/verifikasi";
import NotificationsPage from "./pages/notifications";
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
    return <Navigate to="/dashboard" replace />;
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
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/petugas" element={
                    <RoleBasedRoute 
                      element={<PetugasPage />} 
                      allowedRoles={[UserRole.ADMIN]} 
                    />
                  } />
                  <Route path="/wilayah" element={
                    <RoleBasedRoute 
                      element={<WilayahPage />} 
                      allowedRoles={[UserRole.ADMIN]} 
                    />
                  } />
                  <Route path="/pendataan" element={
                    <RoleBasedRoute 
                      element={<PendataanPage />} 
                      allowedRoles={[UserRole.PPL]} 
                    />
                  } />
                  <Route path="/verifikasi" element={
                    <RoleBasedRoute 
                      element={<VerifikasiPage />} 
                      allowedRoles={[UserRole.PML]} 
                    />
                  } />
                  <Route path="/dokumen/upload" element={
                    <RoleBasedRoute 
                      element={<DocumentUploadPage />} 
                      allowedRoles={[UserRole.PPL]} 
                    />
                  } />
                  <Route path="/dokumen/viewer/:id" element={
                    <RoleBasedRoute 
                      element={<DocumentViewerPage />} 
                      allowedRoles={[UserRole.ADMIN, UserRole.PML, UserRole.PPL]} 
                    />
                  } />
                  <Route path="/notifikasi" element={
                    <RoleBasedRoute 
                      element={<NotificationsPage />} 
                      allowedRoles={[UserRole.ADMIN, UserRole.PML, UserRole.PPL]} 
                    />
                  } />
                  <Route path="/profil" element={<ProfilePage />} />
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
