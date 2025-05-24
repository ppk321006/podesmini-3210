import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, FileText, Eye, X, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVerificationDataForPML, approveDataPendataan, rejectDataPendataan } from "@/services/verification-service";

export default function VerifikasiPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  // Fetch verification data
  const { 
    data: pendataanList = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['verification_data', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getVerificationDataForPML(user.id);
    },
    enabled: !!user?.id
  });
  
  // Mutations
  const approveMutation = useMutation({
    mutationFn: (dataId: string) => approveDataPendataan(dataId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification_data'] });
      setShowApproveDialog(false);
      setSelectedItem(null);
    }
  });
  
  const rejectMutation = useMutation({
    mutationFn: ({ dataId, reason }: { dataId: string; reason: string }) => 
      rejectDataPendataan(dataId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification_data'] });
      setShowRejectDialog(false);
      setSelectedItem(null);
      setRejectReason("");
    }
  });
  
  const getFilteredList = () => {
    let filtered = pendataanList;
    
    // Apply tab filter
    if (activeTab === "pending") {
      filtered = filtered.filter(item => item.status === "selesai" && item.verification_status === "belum_verifikasi");
    } else if (activeTab === "approved") {
      filtered = filtered.filter(item => item.verification_status === "approved");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter(item => item.verification_status === "rejected");
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.desa?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ppl?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desa?.kecamatan?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const getStatusBadge = (status: string, verificationStatus: string) => {
    if (verificationStatus === "approved") {
      return <Badge className="bg-green-500">Disetujui</Badge>;
    } else if (verificationStatus === "rejected") {
      return <Badge className="bg-red-500">Ditolak</Badge>;
    } else if (status === "selesai") {
      return <Badge className="bg-orange-500">Menunggu Verifikasi</Badge>;
    } else {
      return <Badge className="bg-gray-500">Draft</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };
  
  const handleApprove = () => {
    if (!selectedItem) return;
    approveMutation.mutate(selectedItem.id);
  };
  
  const handleReject = () => {
    if (!selectedItem) return;
    
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }
    
    rejectMutation.mutate({ 
      dataId: selectedItem.id, 
      reason: rejectReason 
    });
  };
  
  const clearFilters = () => {
    setSearchTerm("");
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

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-500">Terjadi kesalahan saat memuat data verifikasi</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['verification_data'] })}
              className="mt-4"
            >
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredList = getFilteredList();
  const pendingCount = pendataanList.filter(item => 
    item.status === "selesai" && item.verification_status === "belum_verifikasi").length;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Data</h1>
          <p className="text-gray-500">Verifikasi data pendataan desa</p>
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
              {pendingCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
          <TabsTrigger value="all">Semua</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Memuat data...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredList.length === 0 ? (
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
              {filteredList.map((item) => (
                <Card 
                  key={item.id}
                  className={`${
                    item.verification_status === "rejected" ? "border-red-200" : 
                    item.verification_status === "approved" ? "border-green-200" : 
                    "border-orange-200"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.desa && item.desa.name || "Desa tidak diketahui"}</CardTitle>
                      {getStatusBadge(item.status, item.verification_status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <span>Kecamatan: {item.desa && item.desa.kecamatan && item.desa.kecamatan.name || "-"}</span>
                    </CardDescription>
                    <CardDescription className="flex items-center gap-1">
                      <span>Petugas: {item.ppl && item.ppl.name || "-"}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Jumlah Keluarga</p>
                        <p>{item.jumlah_keluarga?.toLocaleString() || "-"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Luas Lahan</p>
                        <p>{item.jumlah_lahan_pertanian || "-"} Ha</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium">Potensi Ekonomi</p>
                      <p className="line-clamp-2">{item.potensi_ekonomi || "-"}</p>
                    </div>

                    <div className="text-sm">
                      <p className="font-medium">Infrastruktur</p>
                      <p className="line-clamp-2">{item.status_infrastruktur || "-"}</p>
                    </div>

                    <div className="text-sm">
                      <p className="font-medium">Catatan</p>
                      <p className="line-clamp-2">{item.catatan_khusus || "-"}</p>
                    </div>
                    
                    {item.verification_status === "rejected" && item.rejection_reason && (
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
                    {item.verification_status === "belum_verifikasi" && (
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white border-none flex-1"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowApproveDialog(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Setujui
                        </Button>
                          
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white border-none flex-1"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    )}
                    
                    {item.verification_status !== "belum_verifikasi" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 w-full"
                        onClick={() => {
                          setSelectedItem(item);
                          if (item.verification_status === "rejected") {
                            setShowRejectDialog(true);
                          } else {
                            setShowApproveDialog(true);
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Lihat Detail
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.verification_status === "approved" 
                ? "Detail Persetujuan" 
                : "Konfirmasi Persetujuan"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.verification_status === "approved" 
                ? `Data pendataan desa ${selectedItem?.desa?.name || ""}` 
                : `Apakah Anda yakin ingin menyetujui data pendataan ${selectedItem?.desa?.name || ""}?`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Desa</h3>
                <p>{selectedItem.desa?.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Kecamatan</h3>
                <p>{selectedItem.desa?.kecamatan?.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Petugas</h3>
                <p>{selectedItem.ppl?.name}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowApproveDialog(false);
                setSelectedItem(null);
              }}
            >
              {selectedItem?.verification_status === "approved" ? "Tutup" : "Batal"}
            </Button>
            
            {selectedItem?.verification_status !== "approved" && (
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Setujui
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.verification_status === "rejected" 
                ? "Detail Penolakan" 
                : "Tolak Pendataan"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.verification_status === "rejected" 
                ? `Alasan penolakan untuk ${selectedItem?.desa?.name || ""}` 
                : `Berikan alasan penolakan untuk data pendataan ${selectedItem?.desa?.name || ""}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem?.verification_status === "rejected" ? (
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <p className="font-medium text-sm text-red-700">Alasan Penolakan</p>
              <p className="mt-1 text-red-600">{selectedItem?.rejection_reason || "Tidak ada alasan yang diberikan"}</p>
            </div>
          ) : (
            <Textarea 
              placeholder="Alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
              disabled={rejectMutation.isPending}
            />
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedItem(null);
                setRejectReason("");
              }}
            >
              {selectedItem?.verification_status === "rejected" ? "Tutup" : "Batal"}
            </Button>
            
            {selectedItem?.verification_status !== "rejected" && (
              <Button 
                className="bg-red-500 hover:bg-red-600"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tolak
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
