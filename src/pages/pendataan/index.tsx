import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlokasiBertugas, 
  PendataanDataItem 
} from '@/types/pendataan-types';
import { 
  getAlokasiBertugasByPplId, 
  getDesaPendataanStatus 
} from '@/services/pendataan-service';
import { InputDataForm } from '@/pages/input-ubinan/input-form';

export default function PendataanPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [selectedDesaId, setSelectedDesaId] = useState<string | null>(null);
  const [alokasiBertugas, setAlokasiBertugas] = useState<AlokasiBertugas[]>([]);
  const [pendataanData, setPendataanData] = useState<PendataanDataItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPendataanData, setCurrentPendataanData] = useState<PendataanDataItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (user?.id) {
      fetchData();
    } else {
      setIsLoading(false);
      setErrorMessage("User ID tidak ditemukan. Silakan login kembali.");
    }
  }, [user?.id]);
  
  const fetchData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      setErrorMessage("User ID tidak ditemukan");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Fetching data for PPL ID:", user.id);
      
      // Get desa allocation data
      const alokasiData = await getAlokasiBertugasByPplId(user.id);
      setAlokasiBertugas(alokasiData);
      
      // Fetch individual status for each desa
      const pendataanPromises = alokasiData.map(async (alokasi) => {
        return getDesaPendataanStatus(alokasi.desa_id, user.id);
      });
      
      const pendataanResults = await Promise.all(pendataanPromises);
      const validResults = pendataanResults.filter((item): item is PendataanDataItem => item !== null);
      setPendataanData(validResults);
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setErrorMessage(error.message || "Gagal memuat data");
      toast.error(error.message || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDesaSelect = async (desaId: string) => {
    try {
      setSelectedDesaId(desaId);
      
      if (!user?.id) {
        toast.error("User ID tidak ditemukan, silakan login ulang");
        return;
      }
      
      // Find existing data for this desa
      const existingData = pendataanData.find(item => item.desa_id === desaId);
      
      // If data exists, use it; otherwise create a new data object
      let currentData: PendataanDataItem;
      
      if (existingData) {
        currentData = existingData;
      } else {
        // Get desa details from alokasi
        const desaDetails = alokasiBertugas.find(item => item.desa_id === desaId);
        
        if (!desaDetails) {
          toast.error("Data desa tidak ditemukan");
          return;
        }
        
        // Create new data object with default values
        currentData = {
          id: "",
          desa_id: desaId,
          ppl_id: user.id,
          jumlah_keluarga: null,
          jumlah_lahan_pertanian: null,
          status_infrastruktur: null,
          potensi_ekonomi: null,
          catatan_khusus: null,
          status: "belum",
          persentase_selesai: 0,
          tanggal_mulai: null,
          tanggal_selesai: null,
          verification_status: "belum_verifikasi",
          rejection_reason: null,
          desa: {
            id: desaId,
            name: desaDetails.desa_name,
            kecamatan: {
              id: "", // We don't have this in the current data structure
              name: desaDetails.kecamatan_name
            }
          }
        };
      }
      
      setCurrentPendataanData(currentData);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error selecting desa:", error);
      toast.error("Terjadi kesalahan saat memilih desa");
    }
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentPendataanData(null);
  };
  
  const handleUpdateSuccess = async () => {
    handleDialogClose();
    await fetchData(); // Refresh data after successful update
    toast.success("Data berhasil diperbarui");
  };
  
  // Filter desa based on search term
  const filteredDesa = alokasiBertugas.filter(desa => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      desa.desa_name.toLowerCase().includes(searchLower) ||
      desa.kecamatan_name.toLowerCase().includes(searchLower)
    );
  });
  
  // Get status badge for each desa
  const getStatusBadge = (desaId: string) => {
    const pendataanItem = pendataanData.find(item => item.desa_id === desaId);
    
    if (!pendataanItem) return null;
    
    // Show verification status if applicable
    if (pendataanItem.verification_status === 'approved') {
      return <Badge className="bg-green-500 text-white">Disetujui</Badge>;
    } else if (pendataanItem.verification_status === 'ditolak') {
      return <Badge variant="destructive">Ditolak</Badge>;
    }
    
    // Otherwise show pendataan status
    switch (pendataanItem.status) {
      case 'belum':
        return <Badge variant="outline">Belum Dikerjakan</Badge>;
      case 'proses':
        return <Badge variant="secondary">Sedang Dikerjakan</Badge>;
      case 'selesai':
        return <Badge className="bg-blue-500 text-white">Belum Diverifikasi</Badge>;
      default:
        return null;
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">Silakan login terlebih dahulu</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-2 text-gray-500">Memuat data alokasi desa...</p>
        </div>
      </div>
    );
  }
  
  if (errorMessage) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">{errorMessage}</p>
            <Button onClick={() => fetchData()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (alokasiBertugas.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Pendataan Desa</CardTitle>
            <CardDescription>Isi data pendataan desa yang menjadi tugas Anda</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500">Anda belum memiliki alokasi desa untuk mendata.</p>
              <p className="text-sm text-muted-foreground mt-2">Silakan hubungi admin untuk mendapatkan alokasi desa.</p>
              <Button onClick={() => fetchData()} className="mt-4" variant="outline">Refresh Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Data Pendataan Desa</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Cari desa atau kecamatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDesa.map((desa) => {
          // Find pendataan data for this desa if it exists
          const dataExists = pendataanData.some(item => item.desa_id === desa.desa_id);
          
          return (
            <Card 
              key={desa.desa_id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDesaId === desa.desa_id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleDesaSelect(desa.desa_id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{desa.desa_name}</CardTitle>
                <CardDescription>{desa.kecamatan_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    {getStatusBadge(desa.desa_id)}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary-dark"
                  >
                    {dataExists ? "Lihat/Edit Data" : "Isi Data"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {currentPendataanData && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Data Pendataan Desa {currentPendataanData.desa?.name}
              </DialogTitle>
            </DialogHeader>
            <InputDataForm 
              initialData={currentPendataanData} 
              onSuccess={handleUpdateSuccess} 
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
