
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
import { Edit, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { InputDataForm } from "./input-form";

interface DesaData {
  id: string;
  name: string;
  kecamatan_name: string;
  status: "belum" | "proses" | "selesai" | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  target: number | null;
}

export default function InputDataPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [desaData, setDesaData] = useState<DesaData[]>([]);
  const [editingData, setEditingData] = useState<DesaData | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDesaData();
    }
  }, [user]);

  async function fetchDesaData() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('desa_allocation_view')
        .select(`
          desa_id,
          desa_name,
          kecamatan_name,
          status,
          tanggal_mulai,
          tanggal_selesai,
          target
        `)
        .eq("ppl_id", user?.id || '')
        .order('kecamatan_name')
        .order('desa_name');

      if (error) {
        console.error("Error fetching desa data:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data desa",
          variant: "destructive",
        });
        return;
      }

      // Process the data with proper typing
      const processedData = (data || []).map((item: any) => {
        return {
          id: item.desa_id,
          name: item.desa_name || "-",
          kecamatan_name: item.kecamatan_name || "-",
          status: item.status || "belum",
          tanggal_mulai: item.tanggal_mulai,
          tanggal_selesai: item.tanggal_selesai,
          target: item.target
        };
      });

      setDesaData(processedData);
    } catch (err) {
      console.error("Error in desa data fetch:", err);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(data: DesaData) {
    setEditingData(data);
    setIsDialogOpen(true);
  }

  const handleUpdateSuccess = () => {
    setIsDialogOpen(false);
    setEditingData(null);
    fetchDesaData();
    toast({
      title: "Berhasil",
      description: "Data pendataan berhasil diperbarui",
      variant: "default",
    });
  };

  const filteredData = desaData.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.kecamatan_name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "belum":
        return <Badge variant="outline">Belum Dikerjakan</Badge>;
      case "proses":
        return <Badge variant="secondary">Sedang Dikerjakan</Badge>;
      case "selesai":
        return <Badge className="bg-green-500 hover:bg-green-600">Selesai</Badge>;
      default:
        return <Badge variant="outline">Belum Dikerjakan</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl">Data Pendataan Desa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari berdasarkan nama desa, kecamatan..."
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
                <option value="belum">Belum Dikerjakan</option>
                <option value="proses">Sedang Dikerjakan</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>Desa</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.kecamatan_name}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.target || '-'}</TableCell>
                      <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                      <TableCell>{formatDate(item.tanggal_selesai)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Update Data Pendataan Desa {editingData?.name}
            </DialogTitle>
          </DialogHeader>
          <InputDataForm 
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
