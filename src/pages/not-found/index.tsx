
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-simonita-brown">404</h1>
      <h2 className="mt-4 text-2xl font-medium text-simonita-brown">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 text-muted-foreground">
        Maaf, halaman yang Anda cari tidak dapat ditemukan.
      </p>
      <Button 
        onClick={() => navigate("/")} 
        className="mt-8 bg-simonita-green hover:bg-simonita-green/90"
      >
        Kembali ke Dashboard
      </Button>
    </div>
  );
}
