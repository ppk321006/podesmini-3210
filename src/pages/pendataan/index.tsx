
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Filter,
  X,
  Upload
} from "lucide-react";
import { Desa, DataPendataanDesa } from "@/types/pendataan";

// Mock data for demonstration
const mockDesaList: Desa[] = [
  { 
    id: "desa-1", 
    kecamatan_id: "kec-1", 
    nama: "Desa Cidahu", 
    status: "proses", 
    ppl_id: "ppl-id-123", 
    pml_id: "pml-id-123",
    last_updated: "2023-05-10T14:30:00Z"
  },
  { 
    id: "desa-2", 
    kecamatan_id: "kec-1", 
    nama: "Desa Sukamaju", 
    status: "selesai", 
    ppl_id: "ppl-id-123", 
    pml_id: "pml-id-123",
    last_updated: "2023-05-15T09:20:00Z"
  },
  { 
    id: "desa-3", 
    kecamatan_id: "kec-2", 
    nama: "Desa Cibunar", 
    status: "ditolak", 
    ppl_id: "ppl-id-123", 
    pml_id: "pml-id-123",
    last_updated: "2023-05-12T11:45:00Z"
  },
  { 
    id: "desa-4", 
    kecamatan_id: "kec-2", 
    nama: "Desa Buniseuri", 
    status: "belum", 
    ppl_id: "ppl-id-123", 
    pml_id: "pml-id-123"
  },
];

const mockPendataanData: DataPendataanDesa[] = [
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
    created_at: "2023-05-10T10:30:00Z",
    updated_at: "2023-05-10T14:30:00Z"
  },
  {
    id: "pendataan-2",
    desa_id: "desa-2",
    ppl_id: "ppl-id-123",
    jumlah_penduduk: 3200,
    luas_wilayah: 6.5,
    potensi_ekonomi: "Peternakan sapi dan industri rumahan",
    infrastruktur: "Jalan utama sudah beraspal, terdapat 1 puskesmas dan 1 pasar desa",
    catatan: "Ekonomi desa berkembang dengan baik berkat industri rumahan",
    status: "approved",
    created_at: "2023-05-05T08:15:00Z",
    updated_at: "2023-05-15T09:20:00Z"
  },
  {
    id: "pendataan-3",
    desa_id: "desa-3",
    ppl_id: "ppl-id-123",
    jumlah_penduduk: 1800,
    luas_wilayah: 4.3,
    potensi_ekonomi: "Perkebunan kopi dan pertanian",
    infrastruktur: "Jalan sebagian belum beraspal, terdapat 1 puskesmas pembantu",
    catatan: "Akses jalan masih perlu perbaikan untuk menunjang ekonomi",
    status: "rejected",
    alasan_penolakan: "Data jumlah penduduk tidak sesuai dengan data kependudukan. Mohon cek ulang data sensus terbaru.",
    created_at: "2023-05-08T13:40:00Z",
    updated_at: "2023-05-12T11:45:00Z"
  }
];

export default function PendataanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const getPendataanByDesa = (desaId: string) => {
    return mockPendataanData.find(data => data.desa_id === desaId);
  };
  
  const getFilteredDesaList = () => {
    let filtered = mockDesaList;
    
    if (searchQuery) {
      filtered = filtered.filter(desa => 
        desa.nama.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(desa => desa.status === statusFilter);
    }
    
    if (activeTab !== "all") {
      switch (activeTab) {
        case "belum":
          filtered = filtered.filter(desa => desa.status === "belum");
          break;
        case "proses":
          filtered = filtered.filter(desa => desa.status === "proses");
          break;
        case "selesai":
          filtered = filtered.filter(desa => desa.status === "selesai");
          break;
        case "ditolak":
          filtered = filtered.filter(desa => desa.status === "ditolak");
          break;
      }
    }
    
    return filtered;
  };
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "selesai":
        return <Badge className="bg-green-500">Selesai</Badge>;
      case "proses":
        return <Badge className="bg-orange-500">Dalam Proses</Badge>;
      case "ditolak":
        return <Badge className="bg-red-500">Ditolak</Badge>;
      case "belum":
      default:
        return <Badge className="bg-gray-500">Belum Didata</Badge>;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };
  
  const handleCreatePendataan = (desaId: string) => {
    console.log(`Create pendataan for desa: ${desaId}`);
    // In a real app, navigate to a form to create new pendataan
    navigate(`/dokumen/upload?desa=${desaId}`);
  };
  
  const handleViewPendataan = (pendataanId: string) => {
    console.log(`View pendataan: ${pendataanId}`);
    // In a real app, navigate to pendataan detail view
    navigate(`/dokumen/viewer/${pendataanId}`);
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pendataan Desa</h1>
          <p className="text-gray-500">Kelola pendataan potensi desa</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <Button 
            className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
            onClick={() => navigate('/dokumen/upload')}
          >
            <Upload className="h-4 w-4" />
            Unggah Dokumen
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari desa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={`flex items-center gap-2 ${statusFilter ? 'border-orange-500 text-orange-500' : ''}`}
            onClick={() => setStatusFilter(statusFilter ? null : 'selesai')}
          >
            <Filter className="h-4 w-4" />
            {statusFilter ? 'Status: ' + statusFilter : 'Filter'}
          </Button>
          
          {(searchQuery || statusFilter) && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="belum">Belum Didata</TabsTrigger>
          <TabsTrigger value="proses">Dalam Proses</TabsTrigger>
          <TabsTrigger value="selesai">Selesai</TabsTrigger>
          <TabsTrigger value="ditolak">Ditolak</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredDesaList().map((desa) => {
              const pendataan = getPendataanByDesa(desa.id);
              const isPending = desa.status === "proses";
              const isRejected = desa.status === "ditolak";
              const isComplete = desa.status === "selesai";
              const notStarted = desa.status === "belum";
              
              return (
                <Card key={desa.id} className={`${isRejected ? 'border-red-200' : isPending ? 'border-orange-200' : isComplete ? 'border-green-200' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{desa.nama}</CardTitle>
                      {getStatusBadge(desa.status)}
                    </div>
                    <CardDescription>
                      Terakhir diperbarui: {formatDate(desa.last_updated) || "Belum ada pembaruan"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {pendataan ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium">Jumlah Penduduk</p>
                            <p>{pendataan.jumlah_penduduk.toLocaleString()} jiwa</p>
                          </div>
                          <div>
                            <p className="font-medium">Luas Wilayah</p>
                            <p>{pendataan.luas_wilayah} km²</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm">Potensi Ekonomi</p>
                          <p className="text-sm line-clamp-2">{pendataan.potensi_ekonomi}</p>
                        </div>
                        
                        {isRejected && pendataan.alasan_penolakan && (
                          <div className="bg-red-50 p-3 rounded-md border border-red-200">
                            <p className="font-medium text-sm text-red-700 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Alasan Penolakan
                            </p>
                            <p className="text-sm text-red-600 mt-1">
                              {pendataan.alasan_penolakan}
                            </p>
                          </div>
                        )}
                        
                        {isPending && (
                          <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                            <p className="font-medium text-sm text-orange-700 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Menunggu Verifikasi
                            </p>
                            <p className="text-sm text-orange-600 mt-1">
                              Data sedang menunggu verifikasi dari PML
                            </p>
                          </div>
                        )}
                        
                        {isComplete && (
                          <div className="bg-green-50 p-3 rounded-md border border-green-200">
                            <p className="font-medium text-sm text-green-700 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Data Sudah Diverifikasi
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                              Pendataan untuk desa ini telah selesai
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <FileText className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-4">Belum ada data pendataan</p>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-end pt-2">
                    {pendataan ? (
                      <Button 
                        variant="outline"
                        className="text-orange-500 border-orange-500 hover:bg-orange-50"
                        onClick={() => handleViewPendataan(pendataan.id)}
                      >
                        Lihat Detail
                      </Button>
                    ) : (
                      <Button 
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => handleCreatePendataan(desa.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Buat Pendataan
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          {getFilteredDesaList().length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-medium mb-2">Tidak ada data</h2>
                <p className="text-gray-500">
                  {searchQuery 
                    ? `Tidak ada desa yang sesuai dengan pencarian "${searchQuery}"`
                    : "Tidak ada desa yang ditemukan untuk kriteria filter ini"}
                </p>
                {(searchQuery || statusFilter) && (
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Hapus Filter
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
