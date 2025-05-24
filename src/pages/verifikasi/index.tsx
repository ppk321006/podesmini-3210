
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, FileText, Eye, Filter, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { verifyPendataanData } from "@/services/verification-service";
import { Loader2 } from "lucide-react";

// Types for the data from Supabase
interface PendataanData {
  id: string;
  desa_id: string;
  ppl_id: string;
  jumlah_keluarga: number | null;
  jumlah_lahan_pertanian: number | null;
  status_infrastruktur: string | null;
  potensi_ekonomi: string | null;
  catatan_khusus: string | null;
  persentase_selesai: number | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  status: 'belum' | 'proses' | 'selesai' | 'ditolak' | 'approved' | null;
  verification_status: 'belum_verifikasi' | 'approved' | 'ditolak' | null;
  rejection_reason: string | null;
  updated_at: string | null;
  desa?: {
    id: string;
    name: string;
    kecamatan?: {
      id: string;
      name: string;
    };
  };
  ppl?: {
    id: string;
    name: string;
    username: string;
  };
}

// Fetch pendataan data for verification
const fetchPendataanData = async (): Promise<PendataanData[]> => {
  const { data, error } = await supabase
    .from('data_pendataan_desa')
    .select(`
      *,
      desa:desa_id (
        id,
        name,
        kecamatan:kecamatan_id (
          id,
          name
        )
      ),
      ppl:ppl_id (
        id,
        name,
        username
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching pendataan data:', error);
    throw error;
  }

  return data || [];
};

export default function VerifikasiPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<PendataanData | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch data using React Query
  const { data: pendataanList = [], isLoading, error } = useQuery({
    queryKey: ['pendataan_data'],
    queryFn: fetchPendataanData,
  });

  const getFilteredList = () => {
    let filtered = pendataanList;
    
    // Apply tab filter
    if (activeTab === "pending") {
      filtered = filtered.filter(item => 
        item.verification_status === "belum_verifikasi" && 
        (item.status === "selesai" || item.status === "approved")
      );
    } else if (activeTab === "approved") {
      filtered = filtered.filter(item => item.verification_status === "approved");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter(item => item.verification_status === "ditolak");
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.desa?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ppl?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ppl?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const getStatusBadge = (verificationStatus: string | null) => {
    switch (verificationStatus) {
      case "approved":
        return <Badge className="bg-green-500">Disetujui</Badge>;
      case "ditolak":
        return <Badge className="bg-red-500">Ditolak</Badge>;
      case "belum_verifikasi":
        return <Badge className="bg-orange-500">Menunggu Verifikasi</Badge>;
      default:
        return <Badge className="bg-gray-500">Draft</Badge>;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak ada";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  const handleApprove = async () => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await verifyPendataanData(selectedItem.id, "approved");
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['pendataan_data'] });
      
      toast.success(`Data ${selectedItem.desa?.name} telah disetujui`);
      setShowApproveDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error approving data:', error);
      toast.error("Gagal menyetujui data");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedItem) return;
    
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await verifyPendataanData(selectedItem.id, "ditolak", rejectReason);
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['pendataan_data'] });
      
      toast.success(`Data ${selectedItem.desa?.name} telah ditolak`);
      setShowRejectDialog(false);
      setSelectedItem(null);
      setRejectReason("");
    } catch (error) {
      console.error('Error rejecting data:', error);
      toast.error("Gagal menolak data");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
          <span>Gagal memuat data. Silakan coba lagi.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Data</h1>
          <p className="text-gray-500">Verifikasi data pendataan potensi desa</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan desa atau petugas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {searchTerm && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Hapus Filter
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Menunggu Verifikasi
            <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800 border-orange-200">
              {pendataanList.filter(item => 
                item.verification_status === "belum_verifikasi" && 
                (item.status === "selesai" || item.status === "approved")
              ).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
          <TabsTrigger value="all">Semua</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {getFilteredList().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-medium mb-2">Tidak ada data</h2>
                <p className="text-gray-500 text-center">
                  {activeTab === "pending" ? 
                    "Tidak ada data yang menunggu verifikasi" : 
                    activeTab === "approved" ? 
                    "Tidak ada data yang telah disetujui" : 
                    activeTab === "rejected" ? 
                    "Tidak ada data yang ditolak" : 
                    "Tidak ada data pendataan"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredList().map((item) => (
                <Card 
                  key={item.id}
                  className={`${
                    item.verification_status === "ditolak" ? "border-red-200" : 
                    item.verification_status === "approved" ? "border-green-200" : 
                    item.verification_status === "belum_verifikasi" ? "border-orange-200" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.desa?.name || "Desa Tidak Diketahui"}</CardTitle>
                      {getStatusBadge(item.verification_status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <span>Petugas: {item.ppl?.name || "Tidak Diketahui"}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Jumlah Keluarga</p>
                        <p>{item.jumlah_keluarga?.toLocaleString() || 0} KK</p>
                      </div>
                      <div>
                        <p className="font-medium">Luas Lahan</p>
                        <p>{item.jumlah_lahan_pertanian || 0} Ha</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium">Potensi Ekonomi</p>
                      <p className="line-clamp-2">{item.potensi_ekonomi || "Belum diisi"}</p>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium">Progress</p>
                      <p>{item.persentase_selesai || 0}% selesai</p>
                    </div>
                    
                    {item.verification_status === "ditolak" && item.rejection_reason && (
                      <div className="bg-red-50 p-3 rounded-md border border-red-200">
                        <p className="font-medium text-sm text-red-700 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Alasan Penolakan
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          {item.rejection_reason}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Mulai: {formatDate(item.tanggal_mulai)}</span>
                      <span>Selesai: {formatDate(item.tanggal_selesai)}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => window.location.href = `/dokumen/viewer/${item.id}`}
                    >
                      <Eye className="h-4 w-4" />
                      Detail
                    </Button>
                    
                    {item.verification_status === "belum_verifikasi" && (
                      <div className="flex gap-2">
                        <Dialog open={showApproveDialog && selectedItem?.id === item.id} onOpenChange={(open) => {
                          if (!open) setSelectedItem(null);
                          setShowApproveDialog(open);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white border-none flex items-center gap-1"
                              onClick={() => setSelectedItem(item)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Setujui
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Konfirmasi Persetujuan</DialogTitle>
                              <DialogDescription>
                                Apakah Anda yakin ingin menyetujui data pendataan {item.desa?.name}?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowApproveDialog(false);
                                  setSelectedItem(null);
                                }}
                                disabled={isSubmitting}
                              >
                                Batal
                              </Button>
                              <Button 
                                className="bg-green-500 hover:bg-green-600"
                                onClick={handleApprove}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyetujui...
                                  </>
                                ) : (
                                  "Setujui"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={showRejectDialog && selectedItem?.id === item.id} onOpenChange={(open) => {
                          if (!open) {
                            setSelectedItem(null);
                            setRejectReason("");
                          }
                          setShowRejectDialog(open);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white border-none flex items-center gap-1"
                              onClick={() => setSelectedItem(item)}
                            >
                              <XCircle className="h-4 w-4" />
                              Tolak
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Tolak Pendataan</DialogTitle>
                              <DialogDescription>
                                Berikan alasan penolakan untuk data pendataan {item.desa?.name}
                              </DialogDescription>
                            </DialogHeader>
                            <Textarea 
                              placeholder="Alasan penolakan..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowRejectDialog(false);
                                  setSelectedItem(null);
                                  setRejectReason("");
                                }}
                                disabled={isSubmitting}
                              >
                                Batal
                              </Button>
                              <Button 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menolak...
                                  </>
                                ) : (
                                  "Tolak Data"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
