
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
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.responden_name.toLowerCase().includes(term) || 
        item.komoditas.toLowerCase().includes(term)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Verifikasi Data Ubinan</h1>
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
            <TableHead>Nama Responden</TableHead>
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
              <TableCell>{item.responden_name}</TableCell>
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
