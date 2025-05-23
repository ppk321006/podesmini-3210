
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

export default function PendataanPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formValues, setFormValues] = useState({
    desaId: '',
    pplId: '',
    jumlahKeluarga: '',
    jumlahLahanPertanian: '',
    statusInfrastruktur: '',
    potensiEkonomi: '',
    catatanKhusus: '',
  });
  
  const [selectedDesaId, setSelectedDesaId] = useState<string | null>(null);
  const [alokasiBertugas, setAlokasiBertugas] = useState<any[]>([]);
  const [pendataanData, setPendataanData] = useState<any[]>([]);
  
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
      console.log("Fetching data for user ID:", user.id);
      
      // Fetch alokasi petugas
      const { data: alokasiData, error: alokasiError } = await supabase
        .from('alokasi_petugas')
        .select(`
          desa_id,
          desa:desa_id(
            id,
            name,
            kecamatan:kecamatan_id(
              id,
              name
            )
          )
        `)
        .eq('ppl_id', user.id);
        
      if (alokasiError) {
        console.error("Error fetching alokasi petugas:", alokasiError);
        setErrorMessage(`Gagal mengambil data alokasi: ${alokasiError.message}`);
        throw alokasiError;
      }
      
      console.log("Alokasi data:", alokasiData);
      
      const processedAlokasi = (alokasiData || []).map((item: any) => ({
        desa_id: item.desa_id,
        desa_name: item.desa?.name || 'Unknown',
        kecamatan_name: item.desa?.kecamatan?.name || 'Unknown'
      }));
      
      setAlokasiBertugas(processedAlokasi);
      
      // Fetch data pendataan
      const { data: pendataanData, error: pendataanError } = await supabase
        .from('data_pendataan_desa')
        .select('*')
        .eq('ppl_id', user.id);
        
      if (pendataanError) {
        console.error("Error fetching data pendataan:", pendataanError);
        setErrorMessage(`Gagal mengambil data pendataan: ${pendataanError.message}`);
        throw pendataanError;
      }
      
      console.log("Pendataan data:", pendataanData);
      setPendataanData(pendataanData || []);
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setErrorMessage(error.message || "Gagal memuat data");
      toast.error(error.message || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDesaSelect = (desaId: string) => {
    setSelectedDesaId(desaId === selectedDesaId ? null : desaId);
    
    if (!user?.id) {
      toast.error("User ID tidak ditemukan, silakan login ulang");
      return;
    }
    
    // Cari data pendataan yang sudah ada untuk desa ini
    const existingData = pendataanData.find((item: any) => item.desa_id === desaId);
    
    if (existingData) {
      setFormValues({
        desaId: existingData.desa_id,
        pplId: user.id,
        jumlahKeluarga: existingData.jumlah_keluarga?.toString() || '',
        jumlahLahanPertanian: existingData.jumlah_lahan_pertanian?.toString() || '',
        statusInfrastruktur: existingData.status_infrastruktur || '',
        potensiEkonomi: existingData.potensi_ekonomi || '',
        catatanKhusus: existingData.catatan_khusus || '',
      });
    } else {
      // Reset form jika belum ada data
      setFormValues({
        desaId: desaId,
        pplId: user.id,
        jumlahKeluarga: '',
        jumlahLahanPertanian: '',
        statusInfrastruktur: '',
        potensiEkonomi: '',
        catatanKhusus: '',
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDesaId || !user?.id) {
      toast.error("Silakan pilih desa terlebih dahulu");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const existingData = pendataanData.find((item: any) => item.desa_id === selectedDesaId);
      
      const dataToSubmit = {
        desa_id: selectedDesaId,
        ppl_id: user.id,
        jumlah_keluarga: parseInt(formValues.jumlahKeluarga) || 0,
        jumlah_lahan_pertanian: parseFloat(formValues.jumlahLahanPertanian) || 0,
        status_infrastruktur: formValues.statusInfrastruktur,
        potensi_ekonomi: formValues.potensiEkonomi,
        catatan_khusus: formValues.catatanKhusus,
        persentase_selesai: 100,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (existingData) {
        // Update data yang sudah ada
        const { data, error } = await supabase
          .from('data_pendataan_desa')
          .update(dataToSubmit)
          .eq('desa_id', selectedDesaId)
          .eq('ppl_id', user.id)
          .select();
          
        if (error) throw error;
        result = data;
      } else {
        // Insert data baru
        const { data, error } = await supabase
          .from('data_pendataan_desa')
          .insert({
            ...dataToSubmit,
            tanggal_mulai: new Date().toISOString(),
            tanggal_selesai: new Date().toISOString(),
            status: 'selesai'
          })
          .select();
          
        if (error) throw error;
        result = data;
      }
      
      // Update status pendataan jika ada
      try {
        await supabase
          .from('status_pendataan_desa')
          .upsert({
            desa_id: selectedDesaId,
            ppl_id: user.id,
            status: 'selesai',
            tanggal_mulai: new Date().toISOString(),
            tanggal_selesai: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (statusError) {
        console.warn("Error updating status pendataan:", statusError);
        // Tidak perlu throw error karena data utama sudah tersimpan
      }
      
      toast.success("Data pendataan berhasil disimpan");
      
      // Refresh data
      fetchData();
      
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(error.message || "Gagal menyimpan data pendataan");
    } finally {
      setIsSubmitting(false);
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
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Pilih Desa</CardTitle>
              <CardDescription>Daftar desa yang menjadi tugas Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alokasiBertugas.map((desa: any) => {
                  // Cari status pendataan dari data yang sudah ada
                  const existingData = pendataanData.find((item: any) => item.desa_id === desa.desa_id);
                  const isCompleted = existingData !== undefined;
                  
                  return (
                    <button
                      key={desa.desa_id}
                      onClick={() => handleDesaSelect(desa.desa_id)}
                      className={`w-full text-left p-3 rounded-md transition-all ${
                        selectedDesaId === desa.desa_id
                          ? 'bg-primary text-white'
                          : isCompleted
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{desa.desa_name}</div>
                      <div className="text-sm opacity-80">{desa.kecamatan_name}</div>
                      {isCompleted && (
                        <div className={`text-xs mt-1 ${selectedDesaId === desa.desa_id ? 'text-white/80' : 'text-green-600'}`}>
                          ✓ Data sudah diisi
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Form Pendataan Desa</CardTitle>
              <CardDescription>
                {selectedDesaId 
                  ? `Isi data untuk desa ${alokasiBertugas.find((d: any) => d.desa_id === selectedDesaId)?.desa_name || ''}`
                  : "Pilih desa terlebih dahulu dari panel sebelah kiri"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jumlahKeluarga">Jumlah Keluarga</Label>
                    <Input
                      id="jumlahKeluarga"
                      name="jumlahKeluarga"
                      type="number"
                      placeholder="Masukkan jumlah keluarga"
                      value={formValues.jumlahKeluarga}
                      onChange={handleInputChange}
                      disabled={!selectedDesaId || isSubmitting}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jumlahLahanPertanian">Luas Lahan Pertanian (Ha)</Label>
                    <Input
                      id="jumlahLahanPertanian"
                      name="jumlahLahanPertanian"
                      type="number"
                      step="0.01"
                      placeholder="Masukkan luas lahan pertanian"
                      value={formValues.jumlahLahanPertanian}
                      onChange={handleInputChange}
                      disabled={!selectedDesaId || isSubmitting}
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="statusInfrastruktur">Status Infrastruktur</Label>
                  <Textarea
                    id="statusInfrastruktur"
                    name="statusInfrastruktur"
                    placeholder="Deskripsikan kondisi infrastruktur desa"
                    value={formValues.statusInfrastruktur}
                    onChange={handleInputChange}
                    disabled={!selectedDesaId || isSubmitting}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="potensiEkonomi">Potensi Ekonomi</Label>
                  <Textarea
                    id="potensiEkonomi"
                    name="potensiEkonomi"
                    placeholder="Deskripsikan potensi ekonomi desa"
                    value={formValues.potensiEkonomi}
                    onChange={handleInputChange}
                    disabled={!selectedDesaId || isSubmitting}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="catatanKhusus">Catatan Khusus</Label>
                  <Textarea
                    id="catatanKhusus"
                    name="catatanKhusus"
                    placeholder="Catatan khusus/tambahan untuk desa ini"
                    value={formValues.catatanKhusus}
                    onChange={handleInputChange}
                    disabled={!selectedDesaId || isSubmitting}
                    rows={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  disabled={!selectedDesaId || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : "Simpan Data"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
