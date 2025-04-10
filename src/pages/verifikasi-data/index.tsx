
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner"; // Changed back to sonner for consistency
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { getUbinanDataForVerification, updateUbinanVerification } from "@/services/wilayah-api";
import { UbinanData } from "@/types/database-schema";
import { formatDateToLocale } from "@/lib/utils";
import { Check, Filter, Loader2, Search, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VerificationDialog } from "@/components/verification/verification-dialog";

export default function VerifikasiDataPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<UbinanData | null>(null);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [komentar, setKomentar] = useState("");
  const [dokumenDiterima, setDokumenDiterima] = useState(false);
  
  // Query to get ubinan data for verification
  const { data: ubinanData = [], isLoading } = useQuery({
    queryKey: ["ubinan_verification", user?.id],
    queryFn: () => user?.id ? getUbinanDataForVerification(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
  
  // Reset verification form
  const resetVerificationForm = () => {
    setKomentar("");
    setDokumenDiterima(false);
    setSelectedData(null);
    setIsVerificationDialogOpen(false);
  };
  
  // Mutation to update verification status
  const verificationMutation = useMutation({
    mutationFn: ({ id, status, dokumenDiterima, komentar }: {
      id: string;
      status: 'dikonfirmasi' | 'ditolak';
      dokumenDiterima: boolean;
      komentar: string;
    }) => {
      return updateUbinanVerification(id, status, dokumenDiterima, komentar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ubinan_verification", user?.id] });
      resetVerificationForm();
      toast.success("Verifikasi data ubinan berhasil disimpan");
    },
    onError: (error) => {
      console.error("Error verifying ubinan data:", error);
      toast.error("Gagal menyimpan verifikasi");
    }
  });
  
  // Handle select data for verification
  const handleSelectData = (data: UbinanData) => {
    setSelectedData(data);
    setDokumenDiterima(data.dokumen_diterima);
    setKomentar(data.komentar || "");
    setIsVerificationDialogOpen(true);
  };
  
  // Handle verification dialog completion
  const handleVerificationComplete = (updatedData: UbinanData) => {
    queryClient.invalidateQueries({ queryKey: ["ubinan_verification", user?.id] });
    resetVerificationForm();
    toast.success(`Data berhasil ${updatedData.status === 'dikonfirmasi' ? 'dikonfirmasi' : 'ditolak'}`);
  };
  
  // Filter data based on search query and status filter
  const filteredData = ubinanData.filter(item => {
    const matchesSearch = item.responden_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.nks?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Count data by status
  const countByStatus = {
    total: ubinanData.length,
    sudah_diisi: ubinanData.filter(item => item.status === "sudah_diisi").length,
    dikonfirmasi: ubinanData.filter(item => item.status === "dikonfirmasi").length,
    ditolak: ubinanData.filter(item => item.status === "ditolak").length,
    belum_diisi: ubinanData.filter(item => item.status === "belum_diisi").length,
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Data Ubinan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{countByStatus.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Menunggu Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{countByStatus.sudah_diisi}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Dikonfirmasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{countByStatus.dikonfirmasi}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{countByStatus.ditolak}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Data Ubinan</CardTitle>
          <CardDescription>
            Verifikasi data ubinan dari petugas PPL di wilayah tugas Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 mb-4 justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari responden atau NKS..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex-shrink-0">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => setStatusFilter(statusFilter ? null : "sudah_diisi")}
                >
                  <Filter className="h-4 w-4" />
                  {statusFilter ? "Semua Status" : "Perlu Diverifikasi"}
                </Button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {searchQuery || statusFilter ? "Tidak ada data yang sesuai dengan filter" : "Belum ada data ubinan yang perlu diverifikasi"}
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NKS</TableHead>
                    <TableHead>Nama Responden</TableHead>
                    <TableHead>Komoditas</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Berat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Petugas</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nks?.code || "-"}</TableCell>
                      <TableCell className="font-medium">{item.responden_name}</TableCell>
                      <TableCell className="capitalize">{item.komoditas.replace("_", " ")}</TableCell>
                      <TableCell>{formatDateToLocale(item.tanggal_ubinan)}</TableCell>
                      <TableCell>{item.berat_hasil} kg</TableCell>
                      <TableCell>
                        {item.status === "sudah_diisi" && <Badge className="bg-blue-100 text-blue-800">Menunggu</Badge>}
                        {item.status === "dikonfirmasi" && <Badge className="bg-green-100 text-green-800">Dikonfirmasi</Badge>}
                        {item.status === "ditolak" && <Badge className="bg-red-100 text-red-800">Ditolak</Badge>}
                        {item.status === "belum_diisi" && <Badge className="bg-yellow-100 text-yellow-800">Belum Diisi</Badge>}
                      </TableCell>
                      <TableCell>{item.ppl?.name || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleSelectData(item)}
                          disabled={item.status === "belum_diisi"}
                        >
                          Verifikasi
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedData && (
        <VerificationDialog
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
          data={selectedData}
          onComplete={handleVerificationComplete}
        />
      )}
    </div>
  );
}
