
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, Calendar, Download, FileText, User, Map, FileType } from "lucide-react";

// Mock document data for demonstration
const mockDocument = {
  id: "doc-123",
  judul: "Laporan Potensi Desa Cidahu",
  desa: "Desa Cidahu",
  kecamatan: "Kecamatan Dawuan",
  ppl_name: "Ahmad Suprapto",
  jenis: "dokumen",
  tanggal_upload: "2023-05-15T10:30:00Z",
  status: "approved",
  catatan: "Dokumen laporan potensi desa tahun 2023",
  files: [
    {
      id: "file-1",
      nama: "laporan_potensi_cidahu_2023.pdf",
      tipe: "application/pdf",
      ukuran: 2.45 * 1024 * 1024, // 2.45 MB
      url: "https://www.africau.edu/images/default/sample.pdf" // Sample PDF for demo
    },
    {
      id: "file-2",
      nama: "foto_kantor_desa.jpg",
      tipe: "image/jpeg",
      ukuran: 1.2 * 1024 * 1024, // 1.2 MB
      url: "https://picsum.photos/800/600" // Sample image for demo
    }
  ]
};

export default function DocumentViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentDocument(mockDocument);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat dokumen...</p>
        </div>
      </div>
    );
  }
  
  if (!currentDocument) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">Dokumen tidak ditemukan</h2>
            <p className="text-gray-500 mb-4">Dokumen yang Anda cari tidak tersedia atau telah dihapus.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Disetujui</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Ditolak</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500">Menunggu</Badge>;
      default:
        return <Badge className="bg-gray-500">Draft</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold">{currentDocument.judul}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <span className="flex items-center text-sm text-gray-500">
                <Map className="h-4 w-4 mr-1" />
                {currentDocument.desa}, {currentDocument.kecamatan}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <User className="h-4 w-4 mr-1" />
                {currentDocument.ppl_name}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(currentDocument.tanggal_upload)}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            {getStatusBadge(currentDocument.status)}
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="preview">Pratinjau</TabsTrigger>
          <TabsTrigger value="files">Daftar File</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dokumen</CardTitle>
              <CardDescription>Detail tentang dokumen ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Catatan</h3>
                <p className="text-gray-700">{currentDocument.catatan || "-"}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Desa</h3>
                  <p className="text-gray-700">{currentDocument.desa}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Kecamatan</h3>
                  <p className="text-gray-700">{currentDocument.kecamatan}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Jenis Dokumen</h3>
                  <p className="text-gray-700">
                    {currentDocument.jenis === "dokumen" ? "Dokumen" : "Foto"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Petugas</h3>
                  <p className="text-gray-700">{currentDocument.ppl_name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Tanggal Unggah</h3>
                  <p className="text-gray-700">{formatDate(currentDocument.tanggal_upload)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <div>{getStatusBadge(currentDocument.status)}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Jumlah File</h3>
                <p className="text-gray-700">{currentDocument.files.length} file</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          {currentDocument.files.map((file: any) => (
            <Card key={file.id} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {file.nama}
                </CardTitle>
                <CardDescription>
                  {formatFileSize(file.ukuran)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  {file.tipe.startsWith('image/') ? (
                    <img 
                      src={file.url} 
                      alt={file.nama} 
                      className="w-full h-auto max-h-[500px] object-contain"
                    />
                  ) : file.tipe === 'application/pdf' ? (
                    <iframe 
                      src={file.url} 
                      className="w-full h-[500px] border-0"
                      title={file.nama}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-10 bg-gray-50">
                      <FileType className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-500">Pratinjau tidak tersedia untuk tipe file ini</p>
                      <Button className="mt-4" onClick={() => window.open(file.url, '_blank')}>
                        <Download className="h-4 w-4 mr-2" />
                        Unduh File
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Daftar File</CardTitle>
              <CardDescription>Semua file dalam dokumen ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentDocument.files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="mr-4">
                        {file.tipe.startsWith('image/') ? (
                          <img 
                            src={file.url} 
                            alt={file.nama} 
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <FileText className="h-12 w-12 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{file.nama}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.ukuran)}</p>
                      </div>
                    </div>
                    
                    <Button variant="outline" onClick={() => window.open(file.url, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Unduh
                    </Button>
                  </div>
                ))}
                
                {currentDocument.files.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
                    <p className="mt-2 text-gray-500">Tidak ada file dalam dokumen ini</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
