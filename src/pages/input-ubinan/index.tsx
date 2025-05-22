import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { UbinanData } from "@/types/database-schema";
import { UbinanInputForm } from "./input-form";
import { CustomTables } from "@/types/supabase-custom";

// Extended UbinanData with additional UI properties
interface ExtendedUbinanData extends CustomTables['ubinan_data']['Row'] {
  desa_name: string;
  kecamatan_name: string;
  location_code: string;
  pml_name?: string;
  ppl_name?: string;
}

export default function InputUbinanPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ubinanData, setUbinanData] = useState<ExtendedUbinanData[]>([]);
  const [editingData, setEditingData] = useState<ExtendedUbinanData | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUbinanData();
    }
  }, [user]);

  async function fetchUbinanData() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ubinan_data')
        .select(`
          *,
          nks:nks_id(
            id, 
            code,
            desa:desa_id(
              id, 
              name,
              kecamatan:kecamatan_id(
                id, 
                name
              )
            )
          ),
          segmen:segmen_id(
            id, 
            code,
            desa:desa_id(
              id, 
              name,
              kecamatan:kecamatan_id(
                id, 
                name
              )
            )
          ),
          pml:pml_id(name)
        `)
        .eq("ppl_id", user?.id || '');

      if (error) {
        console.error("Error fetching ubinan data:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data ubinan",
          variant: "destructive",
        });
        return;
      }

      // Process the data with proper typing
      const processedData = (data || []).map((item: any) => {
        const desa_name = item.nks?.desa?.name || item.segmen?.desa?.name || "-";
        const kecamatan_name = item.nks?.desa?.kecamatan?.name || item.segmen?.desa?.kecamatan?.name || "-";
        const location_code = item.nks?.code || item.segmen?.code || "-";
        const pml_name = item.pml?.name || "-";
        
        return {
          ...item,
          desa_name,
          kecamatan_name,
          location_code,
          pml_name
        } as ExtendedUbinanData;
      });

      setUbinanData(processedData);
    } catch (err) {
      console.error("Error in ubinan data fetch:", err);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(data: ExtendedUbinanData) {
    if (data.status === "dikonfirmasi") {
      toast({
        title: "Tidak dapat diedit",
        description: "Data yang sudah dikonfirmasi tidak dapat diedit",
        variant: "destructive",
      });
      return;
    }
    
    setEditingData(data);
    setIsDialogOpen(true);
  }

  const handleUpdateSuccess = () => {
    setIsDialogOpen(false);
    setEditingData(null);
    fetchUbinanData();
    toast({
      title: "Berhasil",
      description: "Data ubinan berhasil diperbarui",
      variant: "default",
    });
  };

  const filteredData = ubinanData.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.komoditas.toLowerCase().includes(searchLower) ||
        item.responden_name.toLowerCase().includes(searchLower) ||
        item.desa_name.toLowerCase().includes(searchLower) ||
        item.kecamatan_name.toLowerCase().includes(searchLower) ||
        item.location_code.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "belum_diisi":
        return <Badge variant="outline">Belum Diisi</Badge>;
      case "sudah_diisi":
        return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
      case "dikonfirmasi":
        return <Badge className="bg-green-500 hover:bg-green-600">Terverifikasi</Badge>;
      case "ditolak":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl">Data Ubinan</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
            <Button 
              onClick={() => {
                setEditingData(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari berdasarkan nama, komoditas, desa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="belum_diisi">Belum Diisi</option>
                <option value="sudah_diisi">Menunggu Verifikasi</option>
                <option value="dikonfirmasi">Terverifikasi</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Komoditas</TableHead>
                  <TableHead>Responden</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Hasil (Kg)</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Komentar PML</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.komoditas.charAt(0).toUpperCase() + item.komoditas.slice(1).replace('_', ' ')}
                      </TableCell>
                      <TableCell>{item.responden_name}</TableCell>
                      <TableCell>
                        <div>{item.desa_name}</div>
                        <div className="text-sm text-muted-foreground">{item.kecamatan_name}</div>
                        <div className="text-xs text-muted-foreground">{item.location_code}</div>
                      </TableCell>
                      <TableCell>{item.berat_hasil} kg</TableCell>
                      <TableCell>
                        {format(new Date(item.tanggal_ubinan), 'dd MMM yyyy', { locale: id })}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.komentar || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          disabled={item.status === "dikonfirmasi"}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingData ? "Edit Data Ubinan" : "Tambah Data Ubinan"}
            </DialogTitle>
          </DialogHeader>
          <UbinanInputForm 
            initialData={editingData} 
            onSuccess={handleUpdateSuccess} 
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingData(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
