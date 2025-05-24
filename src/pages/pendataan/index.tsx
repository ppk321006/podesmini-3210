import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Search, X, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendataanData, savePendataanData, PendataanFormData } from '@/services/pendataan-service';

export default function PendataanPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formValues, setFormValues] = useState<PendataanFormData>({
    desaId: '',
    pplId: '',
    status: 'belum',
    tanggalMulai: null,
    tanggalSelesai: null,
    jumlahKeluarga: null,
    jumlahLahanPertanian: null,
    statusInfrastruktur: '',
    potensiEkonomi: '',
    catatanKhusus: ''
  });
  
  const [selectedDesaId, setSelectedDesaId] = useState<string | null>(null);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pendataan_data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User ID tidak ditemukan");
      return await getPendataanData(user.id);
    },
    enabled: !!user?.id
  });
  
  const { alokasiData = [], pendataanData = [] } = data || {};
  
  const saveMutation = useMutation({
    mutationFn: (formData: PendataanFormData) => savePendataanData(formData),
    onSuccess: () => {
      toast.success("Data pendataan berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ['pendataan_data'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menyimpan data pendataan");
    }
  });
  
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
        status: existingData.status || 'belum',
        tanggalMulai: existingData.tanggal_mulai ? new Date(existingData.tanggal_mulai) : null,
        tanggalSelesai: existingData.tanggal_selesai ? new Date(existingData.tanggal_selesai) : null,
        jumlahKeluarga: existingData.jumlah_keluarga,
        jumlahLahanPertanian: existingData.jumlah_lahan_pertanian,
        statusInfrastruktur: existingData.status_infrastruktur || '',
        potensiEkonomi: existingData.potensi_ekonomi || '',
        catatanKhusus: existingData.catatan_khusus || ''
      });
    } else {
      // Reset form jika belum ada data
      setFormValues({
        desaId: desaId,
        pplId: user.id,
        status: 'belum',
        tanggalMulai: null,
        tanggalSelesai: null,
        jumlahKeluarga: null,
        jumlahLahanPertanian: null,
        statusInfrastruktur: '',
        potensiEkonomi: '',
        catatanKhusus: ''
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDesaId || !user?.id) {
      toast.error("Silakan pilih desa terlebih dahulu");
      return;
    }
    
    // Validate data
    if (formValues.status === 'selesai') {
      if (!formValues.tanggalMulai) {
        toast.error("Tanggal mulai harus diisi untuk status Selesai");
        return;
      }
      if (!formValues.tanggalSelesai) {
        toast.error("Tanggal selesai harus diisi untuk status Selesai");
        return;
      }
      if (formValues.tanggalSelesai < formValues.tanggalMulai) {
        toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
        return;
      }
    } else if (formValues.status === 'proses' && !formValues.tanggalMulai) {
      toast.error("Tanggal mulai harus diisi untuk status Sedang Dikerjakan");
      return;
    }
    
    // Submit data
    saveMutation.mutate(formValues);
  };
  
  // Get verification status badge for a desa
  const getVerificationBadge = (desaId: string) => {
    const desaData = pendataanData.find((item: any) => item.desa_id === desaId);
    
    if (!desaData) return null;
    
    if (desaData.verification_status === 'approved') {
      return <Badge className="bg-green-500 text-white">Disetujui</Badge>;
    } else if (desaData.verification_status === 'rejected') {
      return <Badge className="bg-red-500 text-white">Ditolak</Badge>;
    } else if (desaData.status === 'selesai') {
      return <Badge className="bg-orange-500 text-white">Menunggu Verifikasi</Badge>;
    }
    
    return null;
  };
  
  // Get filtered desa list based on search
  const getFilteredDesa = () => {
    if (!alokasiData || alokasiData.length === 0) return [];
    
    return alokasiData.filter((desa: any) => {
      if (!searchTerm) return true;
      
      const desaName = desa.desa && desa.desa.name || "Desa tidak diketahui";
      const kecamatanName = desa.desa && desa.desa.kecamatan && desa.desa.kecamatan.name || "-";
      const searchLower = searchTerm.toLowerCase();
      
      return desaName.includes(searchLower) || kecamatanName.includes(searchLower);
    });
  };
  
  // Format date 
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
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
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">{(error as Error).message}</p>
            <Button onClick={() => refetch()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (alokasiData.length === 0) {
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
              <Button onClick={() => refetch()} className="mt-4" variant="outline">Refresh Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get desa info from alokasi data
  const getCurrentDesaInfo = () => {
    if (!selectedDesaId) return null;
    return alokasiData.find((item: any) => item.desa_id === selectedDesaId)?.desa;
  };
  
  // Get current pendataan data
  const getCurrentPendataanData = () => {
    if (!selectedDesaId) return null;
    return pendataanData.find((item: any) => item.desa_id === selectedDesaId);
  };
  
  const currentDesaInfo = getCurrentDesaInfo();
  const currentPendataanData = getCurrentPendataanData();
  const isRejected = currentPendataanData?.verification_status === 'rejected';
  const rejectionReason = currentPendataanData?.rejection_reason;
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Data Pendataan Desa</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Pilih Desa</CardTitle>
                  <CardDescription>Daftar desa yang menjadi tugas Anda</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => refetch()}>
                  <Loader2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              
              {/* Search box */}
              <div className="relative mt-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari desa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {getFilteredDesa().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "Tidak ada desa yang sesuai dengan pencarian" : "Tidak ada desa yang dialokasikan"}
                  </div>
                ) : (
                  getFilteredDesa().map((desa: any) => {
                    // Find pendataan data for this desa
                    const desaData = pendataanData.find((item: any) => item.desa_id === desa.desa_id);
                    const status = desaData?.status || 'belum';
                    const verificationStatus = desaData?.verification_status;
                    
                    let statusClassName = "bg-gray-50 hover:bg-gray-100";
                    let statusIcon = null;
                    
                    if (verificationStatus === 'approved') {
                      statusClassName = "bg-green-50 text-green-700 hover:bg-green-100";
                      statusIcon = <CheckCircle className="h-4 w-4 text-green-500" />;
                    } else if (verificationStatus === 'rejected') {
                      statusClassName = "bg-red-50 text-red-700 hover:bg-red-100";
                      statusIcon = <XCircle className="h-4 w-4 text-red-500" />;
                    } else if (status === 'selesai') {
                      statusClassName = "bg-orange-50 text-orange-700 hover:bg-orange-100";
                      statusIcon = <AlertCircle className="h-4 w-4 text-orange-500" />;
                    } else if (status === 'proses') {
                      statusClassName = "bg-blue-50 text-blue-700 hover:bg-blue-100";
                      statusIcon = <Calendar className="h-4 w-4 text-blue-500" />;
                    }
                    
                    if (selectedDesaId === desa.desa_id) {
                      statusClassName = "bg-primary text-white";
                    }
                    
                    return (
                      <button
                        key={desa.desa_id}
                        onClick={() => handleDesaSelect(desa.desa_id)}
                        className={`w-full text-left p-3 rounded-md transition-all ${statusClassName}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{desa.desa && desa.desa.name || "Desa tidak diketahui"}</div>
                            <div className="text-sm opacity-80">{desa.desa && desa.desa.kecamatan && desa.desa.kecamatan.name || "-"}</div>
                          </div>
                          {statusIcon}
                        </div>
                        
                        {desaData && (
                          <div className={`flex items-center gap-1 text-xs mt-1 ${
                            selectedDesaId === desa.desa_id ? "text-white/80" : ""
                          }`}>
                            {verificationStatus === 'approved' ? (
                              <span>✓ Disetujui</span>
                            ) : verificationStatus === 'rejected' ? (
                              <span>✖ Ditolak</span>  
                            ) : status === 'selesai' ? (
                              <span>⟳ Menunggu verifikasi</span>
                            ) : status === 'proses' ? (
                              <span>⟳ Sedang dikerjakan</span>
                            ) : (
                              <span>○ Belum dikerjakan</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
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
                  ? `Isi data untuk desa ${currentDesaInfo?.name || ''} (Kecamatan ${currentDesaInfo?.kecamatan?.name || ''})`
                  : "Pilih desa terlebih dahulu dari panel sebelah kiri"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isRejected && rejectionReason && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <h3 className="font-medium text-red-800">Data Ditolak</h3>
                      <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
                      <p className="text-xs text-red-600 mt-2">Silakan perbaiki data dan kirim ulang</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status Pendataan</Label>
                    <Select
                      value={formValues.status}
                      onValueChange={(value: "belum" | "proses" | "selesai") => {
                        setFormValues(prev => ({ 
                          ...prev, 
                          status: value,
                          // Set default dates based on status
                          tanggalMulai: value === "proses" && !prev.tanggalMulai ? new Date() : prev.tanggalMulai,
                          tanggalSelesai: value === "selesai" ? new Date() : prev.tanggalSelesai
                        }));
                      }}
                      disabled={!selectedDesaId || saveMutation.isPending}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="belum">Belum Dikerjakan</SelectItem>
                        <SelectItem value="proses">Sedang Dikerjakan</SelectItem>
                        <SelectItem value="selesai">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(formValues.status === "proses" || formValues.status === "selesai") && (
                    <div>
                      <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                      <div className="mt-1">
                        <DatePicker
                          date={formValues.tanggalMulai ? new Date(formValues.tanggalMulai) : undefined}
                          onSelect={(date) => setFormValues(prev => ({ ...prev, tanggalMulai: date }))}
                          disabled={!selectedDesaId || saveMutation.isPending}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Wajib diisi untuk status Sedang Dikerjakan dan Selesai
                      </p>
                    </div>
                  )}
                  
                  {formValues.status === "selesai" && (
                    <div>
                      <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                      <div className="mt-1">
                        <DatePicker
                          date={formValues.tanggalSelesai ? new Date(formValues.tanggalSelesai) : undefined}
                          onSelect={(date) => setFormValues(prev => ({ ...prev, tanggalSelesai: date }))}
                          disabled={!selectedDesaId || !formValues.tanggalMulai || saveMutation.isPending}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Wajib diisi untuk status Selesai
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jumlahKeluarga">Jumlah Keluarga</Label>
                      <Input
                        id="jumlahKeluarga"
                        name="jumlahKeluarga"
                        type="number"
                        placeholder="Masukkan jumlah keluarga"
                        value={formValues.jumlahKeluarga || ''}
                        onChange={(e) => setFormValues(prev => ({
                          ...prev, 
                          jumlahKeluarga: e.target.value ? parseInt(e.target.value) : null
                        }))}
                        disabled={!selectedDesaId || saveMutation.isPending}
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
                        value={formValues.jumlahLahanPertanian || ''}
                        onChange={(e) => setFormValues(prev => ({
                          ...prev, 
                          jumlahLahanPertanian: e.target.value ? parseFloat(e.target.value) : null
                        }))}
                        disabled={!selectedDesaId || saveMutation.isPending}
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
                      value={formValues.statusInfrastruktur || ''}
                      onChange={handleInputChange}
                      disabled={!selectedDesaId || saveMutation.isPending}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="potensiEkonomi">Potensi Ekonomi</Label>
                    <Textarea
                      id="potensiEkonomi"
                      name="potensiEkonomi"
                      placeholder="Deskripsikan potensi ekonomi desa"
                      value={formValues.potensiEkonomi || ''}
                      onChange={handleInputChange}
                      disabled={!selectedDesaId || saveMutation.isPending}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="catatanKhusus">Catatan Pendataan</Label>
                    <Textarea
                      id="catatanKhusus"
                      name="catatanKhusus"
                      placeholder="Catatan khusus/tambahan untuk desa ini"
                      value={formValues.catatanKhusus || ''}
                      onChange={handleInputChange}
                      disabled={!selectedDesaId || saveMutation.isPending}
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    {selectedDesaId && currentPendataanData && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <span>Status verifikasi:</span>
                        {getVerificationBadge(selectedDesaId)}
                      </div>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!selectedDesaId || saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : isRejected ? "Kirim Ulang Data" : "Simpan Data"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
