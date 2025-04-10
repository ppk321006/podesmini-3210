
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, FileCheck, AlertCircle, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UbinanData } from "@/types/database-schema";
import { getUbinanDataForVerification } from "@/services/wilayah-api";
import { VerificationDialog } from "@/components/verification/verification-dialog";
import { formatDateToLocale } from "@/lib/utils";

const VerifikasiPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [ubinanData, setUbinanData] = useState<UbinanData[]>([]);
  const [filteredData, setFilteredData] = useState<UbinanData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("menunggu");
  const [selectedData, setSelectedData] = useState<UbinanData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const statusCount = {
    menunggu: 0,
    dikonfirmasi: 0,
    ditolak: 0,
    belum: 0
  };

  // Calculate status counts
  ubinanData.forEach(item => {
    if (item.status === "sudah_diisi") statusCount.menunggu++;
    else if (item.status === "dikonfirmasi") statusCount.dikonfirmasi++;
    else if (item.status === "ditolak") statusCount.ditolak++;
    else statusCount.belum++;
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // If user is PML, fetch data for verification
        if (user.role === 'pml') {
          const data = await getUbinanDataForVerification(user.id);
          setUbinanData(data);
          setFilteredData(data);
        }
      } catch (error) {
        console.error("Error fetching data for verification:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data untuk verifikasi",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  useEffect(() => {
    // Filter data based on search term and selected tab
    let filtered = [...ubinanData];
    
    // Filter by status tab
    if (selectedTab === "menunggu") {
      filtered = filtered.filter(item => item.status === "sudah_diisi");
    } else if (selectedTab === "dikonfirmasi") {
      filtered = filtered.filter(item => item.status === "dikonfirmasi");
    } else if (selectedTab === "ditolak") {
      filtered = filtered.filter(item => item.status === "ditolak");
    } else if (selectedTab === "belum") {
      filtered = filtered.filter(item => item.status === "belum_diisi");
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.responden_name.toLowerCase().includes(term) || 
        item.komoditas.toLowerCase().includes(term) ||
        (item.nks?.code && item.nks.code.toLowerCase().includes(term)) ||
        (item.segmen?.code && item.segmen.code.toLowerCase().includes(term))
      );
    }
    
    setFilteredData(filtered);
  }, [ubinanData, searchTerm, selectedTab]);

  const handleVerify = (data: UbinanData) => {
    setSelectedData(data);
    setIsDialogOpen(true);
  };

  const handleVerificationComplete = (updatedData: UbinanData) => {
    setUbinanData(prev => 
      prev.map(item => 
        item.id === updatedData.id ? updatedData : item
      )
    );
    setIsDialogOpen(false);
    
    const actionText = updatedData.status === "dikonfirmasi" ? "dikonfirmasi" : "ditolak";
    
    toast({
      title: "Berhasil",
      description: `Data ubinan telah ${actionText}`,
      variant: "default"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sudah_diisi":
        return <Badge className="bg-yellow-500">Menunggu Verifikasi</Badge>;
      case "dikonfirmasi":
        return <Badge className="bg-green-500">Dikonfirmasi</Badge>;
      case "ditolak":
        return <Badge className="bg-red-500">Ditolak</Badge>;
      default:
        return <Badge className="bg-gray-500">Belum Diisi</Badge>;
    }
  };

  if (!user || user.role !== 'pml') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Halaman ini hanya tersedia untuk PML</h1>
        <p>Silahkan login sebagai PML untuk mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Verifikasi Data Ubinan</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50">
          <CardHeader className="py-4">
            <CardTitle className="text-lg text-yellow-700">Menunggu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-700">{statusCount.menunggu}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="py-4">
            <CardTitle className="text-lg text-green-700">Dikonfirmasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{statusCount.dikonfirmasi}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="py-4">
            <CardTitle className="text-lg text-red-700">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{statusCount.ditolak}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardHeader className="py-4">
            <CardTitle className="text-lg text-gray-700">Belum Diisi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-700">{statusCount.belum}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Data Ubinan</CardTitle>
          <CardDescription>Verifikasi dan konfirmasi data ubinan yang telah diisikan oleh PPL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Input 
                placeholder="Cari berdasarkan nama responden atau komoditas" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Tabs defaultValue="menunggu" onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="menunggu">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Menunggu Verifikasi</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="dikonfirmasi">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>Dikonfirmasi</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="ditolak">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span>Ditolak</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="belum">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    <span>Belum Diisi</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="menunggu" className="pt-4">
                <DataTable 
                  data={filteredData} 
                  loading={loading} 
                  getStatusBadge={getStatusBadge}
                  onVerify={handleVerify}
                  emptyMessage="Tidak ada data yang menunggu verifikasi"
                />
              </TabsContent>
              
              <TabsContent value="dikonfirmasi" className="pt-4">
                <DataTable 
                  data={filteredData} 
                  loading={loading} 
                  getStatusBadge={getStatusBadge}
                  onVerify={handleVerify}
                  emptyMessage="Tidak ada data yang telah dikonfirmasi"
                />
              </TabsContent>
              
              <TabsContent value="ditolak" className="pt-4">
                <DataTable 
                  data={filteredData} 
                  loading={loading} 
                  getStatusBadge={getStatusBadge}
                  onVerify={handleVerify}
                  emptyMessage="Tidak ada data yang ditolak"
                />
              </TabsContent>

              <TabsContent value="belum" className="pt-4">
                <DataTable 
                  data={filteredData} 
                  loading={loading} 
                  getStatusBadge={getStatusBadge}
                  onVerify={handleVerify}
                  emptyMessage="Tidak ada data yang belum diisi"
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      {selectedData && (
        <VerificationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          data={selectedData}
          onComplete={handleVerificationComplete}
        />
      )}
    </div>
  );
};

interface DataTableProps {
  data: UbinanData[];
  loading: boolean;
  getStatusBadge: (status: string) => JSX.Element;
  onVerify: (data: UbinanData) => void;
  emptyMessage: string;
}

const DataTable = ({ data, loading, getStatusBadge, onVerify, emptyMessage }: DataTableProps) => {
  if (loading) {
    return <div className="py-8 text-center">Memuat data...</div>;
  }
  
  if (data.length === 0) {
    return <div className="py-8 text-center">{emptyMessage}</div>;
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jenis</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Responden</TableHead>
            <TableHead>Status Sampel</TableHead>
            <TableHead>Komoditas</TableHead>
            <TableHead>Tanggal Ubinan</TableHead>
            <TableHead>Berat Hasil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dokumen</TableHead>
            <TableHead className="text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.nks_id ? "NKS" : "Segmen"}</TableCell>
              <TableCell>
                {item.nks_id ? item.nks?.code : item.segmen?.code || "-"}
              </TableCell>
              <TableCell>{item.responden_name}</TableCell>
              <TableCell>{item.sample_status || "-"}</TableCell>
              <TableCell className="capitalize">{item.komoditas.replace('_', ' ')}</TableCell>
              <TableCell>{formatDateToLocale(item.tanggal_ubinan)}</TableCell>
              <TableCell>{item.berat_hasil} kg</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                {item.dokumen_diterima ? (
                  <Badge className="bg-green-500">Diterima</Badge>
                ) : (
                  <Badge className="bg-yellow-500">Belum Diterima</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onVerify(item)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Detail
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VerifikasiPage;
