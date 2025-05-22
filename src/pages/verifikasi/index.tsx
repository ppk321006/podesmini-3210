
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
import { DataPendataanDesa } from "@/types/pendataan";
import { toast } from "sonner";

// Mock data for demonstration
const mockPendataanList: DataPendataanDesa[] = [
  {
    id: "pendataan-1",
    desa_id: "desa-1",
    ppl_id: "ppl-id-123",
    jumlah_penduduk: 2500,
    luas_wilayah: 5.2,
    potensi_ekonomi: "Pertanian padi dan palawija",
    infrastruktur: "Jalan utama sudah beraspal, terdapat 1 puskesmas",
    catatan: "Beberapa bagian desa masih sering mengalami banjir saat musim hujan",
    status: "submitted",
    created_at: "2023-05-20T10:30:00Z",
    updated_at: "2023-05-20T14:30:00Z"
  },
  {
    id: "pendataan-2",
    desa_id: "desa-2",
    ppl_id: "ppl-id-456",
    jumlah_penduduk: 3200,
    luas_wilayah: 6.5,
    potensi_ekonomi: "Peternakan sapi dan industri rumahan",
    infrastruktur: "Jalan utama sudah beraspal, terdapat 1 puskesmas dan 1 pasar desa",
    catatan: "Ekonomi desa berkembang dengan baik berkat industri rumahan",
    status: "approved",
    created_at: "2023-05-15T08:15:00Z",
    updated_at: "2023-05-19T09:20:00Z"
  },
  {
    id: "pendataan-3",
    desa_id: "desa-3",
    ppl_id: "ppl-id-789",
    jumlah_penduduk: 1800,
    luas_wilayah: 4.3,
    potensi_ekonomi: "Perkebunan kopi dan pertanian",
    infrastruktur: "Jalan sebagian belum beraspal, terdapat 1 puskesmas pembantu",
    catatan: "Akses jalan masih perlu perbaikan untuk menunjang ekonomi",
    status: "rejected",
    alasan_penolakan: "Data jumlah penduduk tidak sesuai dengan data kependudukan. Mohon cek ulang data sensus terbaru.",
    created_at: "2023-05-18T13:40:00Z",
    updated_at: "2023-05-21T11:45:00Z"
  },
  {
    id: "pendataan-4",
    desa_id: "desa-4",
    ppl_id: "ppl-id-123",
    jumlah_penduduk: 2100,
    luas_wilayah: 3.8,
    potensi_ekonomi: "Pertanian dan perikanan",
    infrastruktur: "Jalan desa sebagian rusak, memiliki 1 puskesmas pembantu",
    catatan: "Wilayah berpotensi untuk pengembangan perikanan darat",
    status: "submitted",
    created_at: "2023-05-21T09:15:00Z",
    updated_at: "2023-05-21T11:20:00Z"
  }
];

// Mock data for desa names
const mockDesaNameMap: Record<string, string> = {
  "desa-1": "Desa Cidahu",
  "desa-2": "Desa Sukamaju",
  "desa-3": "Desa Cibunar",
  "desa-4": "Desa Buniseuri"
};

// Mock data for PPL names
const mockPplNameMap: Record<string, string> = {
  "ppl-id-123": "Ahmad Suprapto",
  "ppl-id-456": "Budi Santoso",
  "ppl-id-789": "Citra Dewi"
};

export default function VerifikasiPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [pendataanList, setPendataanList] = useState<DataPendataanDesa[]>(mockPendataanList);
  const [selectedItem, setSelectedItem] = useState<DataPendataanDesa | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const getFilteredList = () => {
    let filtered = pendataanList;
    
    // Apply tab filter
    if (activeTab === "pending") {
      filtered = filtered.filter(item => item.status === "submitted");
    } else if (activeTab === "approved") {
      filtered = filtered.filter(item => item.status === "approved");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter(item => item.status === "rejected");
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        mockDesaNameMap[item.desa_id].toLowerCase().includes(searchTerm.toLowerCase()) ||
        mockPplNameMap[item.ppl_id].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Disetujui</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Ditolak</Badge>;
      case "submitted":
        return <Badge className="bg-orange-500">Menunggu Verifikasi</Badge>;
      default:
        return <Badge className="bg-gray-500">Draft</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  const handleApprove = () => {
    if (!selectedItem) return;
    
    setPendataanList(prev => 
      prev.map(item => 
        item.id === selectedItem.id ? { ...item, status: "approved", updated_at: new Date().toISOString() } : item
      )
    );
    
    toast.success(`Data ${mockDesaNameMap[selectedItem.desa_id]} telah disetujui`);
    setShowApproveDialog(false);
    setSelectedItem(null);
  };
  
  const handleReject = () => {
    if (!selectedItem) return;
    
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }
    
    setPendataanList(prev => 
      prev.map(item => 
        item.id === selectedItem.id ? 
        { 
          ...item, 
          status: "rejected", 
          alasan_penolakan: rejectReason,
          updated_at: new Date().toISOString() 
        } : item
      )
    );
    
    toast.success(`Data ${mockDesaNameMap[selectedItem.desa_id]} telah ditolak`);
    setShowRejectDialog(false);
    setSelectedItem(null);
    setRejectReason("");
  };
  
  const clearFilters = () => {
    setSearchTerm("");
  };

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
              {pendataanList.filter(item => item.status === "submitted").length}
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
                    item.status === "rejected" ? "border-red-200" : 
                    item.status === "approved" ? "border-green-200" : 
                    item.status === "submitted" ? "border-orange-200" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{mockDesaNameMap[item.desa_id]}</CardTitle>
                      {getStatusBadge(item.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <span>Petugas: {mockPplNameMap[item.ppl_id]}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Jumlah Penduduk</p>
                        <p>{item.jumlah_penduduk.toLocaleString()} jiwa</p>
                      </div>
                      <div>
                        <p className="font-medium">Luas Wilayah</p>
                        <p>{item.luas_wilayah} km²</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium">Potensi Ekonomi</p>
                      <p className="line-clamp-2">{item.potensi_ekonomi}</p>
                    </div>
                    
                    {item.status === "rejected" && item.alasan_penolakan && (
                      <div className="bg-red-50 p-3 rounded-md border border-red-200">
                        <p className="font-medium text-sm text-red-700 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Alasan Penolakan
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          {item.alasan_penolakan}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Dibuat: {formatDate(item.created_at)}</span>
                      <span>Diupdate: {formatDate(item.updated_at)}</span>
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
                    
                    {item.status === "submitted" && (
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
                                Apakah Anda yakin ingin menyetujui data pendataan {mockDesaNameMap[item.desa_id]}?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowApproveDialog(false);
                                  setSelectedItem(null);
                                }}
                              >
                                Batal
                              </Button>
                              <Button 
                                className="bg-green-500 hover:bg-green-600"
                                onClick={handleApprove}
                              >
                                Setujui
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
                                Berikan alasan penolakan untuk data pendataan {mockDesaNameMap[item.desa_id]}
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
                              >
                                Batal
                              </Button>
                              <Button 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                              >
                                Tolak Data
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
