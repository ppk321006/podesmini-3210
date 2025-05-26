
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { InputDataForm } from "./input-form";
import { PendataanDataItem, PendataanStatus } from "@/types/pendataan-types";

interface DesaData {
  id: string;
  name: string;
  kecamatan_name: string;
  status: PendataanStatus | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  persentase_selesai: number | null;
}

export default function InputDataPage() {
  const { user } = useAuth();
  const [desaData, setDesaData] = useState<DesaData[]>([]);
  const [editingData, setEditingData] = useState<PendataanDataItem | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchDesaData();
    } else {
      setIsLoading(false);
      setErrorMessage("User ID tidak ditemukan. Silakan login kembali.");
    }
  }, [user?.id]);

  async function fetchDesaData() {
    if (!user?.id) {
      setIsLoading(false);
      setErrorMessage("User ID tidak ditemukan");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Fetching data for PPL ID:", user.id);

      // Query alokasi petugas untuk mendapatkan desa yang ditugaskan ke PPL
      const { data: alokasiData, error: alokasiError } = await supabase
        .from('alokasi_petugas')
        .select(`
          desa_id,
          desa:desa_id(
            id,
            name,
            kecamatan:kecamatan_id(
              id,
              name
            )
          )
        `)
        .eq('ppl_id', user.id);

      if (alokasiError) {
        console.error("Error fetching alokasi data:", alokasiError);
        setErrorMessage(`Gagal mengambil data alokasi desa: ${alokasiError.message}`);
        toast.error("Gagal mengambil data alokasi desa");
        setIsLoading(false);
        return;
      }

      if (!alokasiData || alokasiData.length === 0) {
        console.log("No allocated desa found for this PPL");
        setDesaData([]);
        setIsLoading(false);
        return;
      }

      console.log("Allocated desa data:", alokasiData);

      // Ambil daftar desa_id yang dialokasikan
      const desaIds = alokasiData.map(item => item.desa_id);
      console.log("Desa IDs to lookup:", desaIds);

      // Query data pendataan untuk desa yang dialokasikan
      const { data: pendataanData, error: pendataanError } = await supabase
        .from('data_pendataan_desa')
        .select('*')
        .in('desa_id', desaIds)
        .eq('ppl_id', user.id);

      if (pendataanError) {
        console.error("Error fetching pendataan data:", pendataanError);
        setErrorMessage(`Gagal mengambil data pendataan: ${pendataanError.message}`);
      }

      console.log("Pendataan data:", pendataanData);

      // Gabungkan data
      const processedData = alokasiData.map((item: any) => {
        const pendataanItem = pendataanData?.find(p => p.desa_id === item.desa_id);
        return {
          id: item.desa_id,
          name: item.desa?.name || "-",
          kecamatan_name: item.desa?.kecamatan?.name || "-",
          status: pendataanItem?.status || "belum",
          tanggal_mulai: pendataanItem?.tanggal_mulai || null,
          tanggal_selesai: pendataanItem?.tanggal_selesai || null,
          persentase_selesai: pendataanItem?.persentase_selesai || 0
        };
      });

      console.log("Processed data:", processedData);
      setDesaData(processedData);
    } catch (err) {
      console.error("Error in fetchDesaData:", err);
      setErrorMessage("Terjadi kesalahan saat mengambil data");
      toast.error("Terjadi kesalahan saat mengambil data");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(data: DesaData) {
    // Convert DesaData to PendataanDataItem format before passing to the form
    const pendataanItem: PendataanDataItem = {
      id: "", // This will be empty for new items
      desa_id: data.id,
      ppl_id: user?.id || "",
      jumlah_keluarga: null,
      jumlah_lahan_pertanian: null,
      status_infrastruktur: null,
      potensi_ekonomi: null,
      catatan_khusus: null,
      status: data.status || "belum",
      persentase_selesai: data.persentase_selesai || 0,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai: data.tanggal_selesai,
      verification_status: "belum_verifikasi",
      rejection_reason: null,
      desa: {
        id: data.id,
        name: data.name,
        kecamatan: {
          id: "", // We don't have kecamatan id in DesaData
          name: data.kecamatan_name
        }
      }
    };

    setEditingData(pendataanItem);
    setIsDialogOpen(true);
  }

  const handleUpdateSuccess = () => {
    setIsDialogOpen(false);
    setEditingData(null);
    fetchDesaData();
    toast.success("Data pendataan berhasil diperbarui");
  };

  const filteredData = desaData.filter(item => {
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return item.name.toLowerCase().includes(searchLower) || 
             item.kecamatan_name.toLowerCase().includes(searchLower);
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
      case "approved":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Disetujui</Badge>;
      case "ditolak":
        return <Badge className="bg-red-500 hover:bg-red-600">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Belum Dikerjakan</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">Silakan login terlebih dahulu</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
            <div className="flex gap-2">
              <Button onClick={() => fetchDesaData()}>Coba Lagi</Button>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem("potensidesa_user");
                window.location.reload();
              }}>
                Logout & Login Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Countdown Timer Component */}
      <Card className="mb-6 border-orange-300 shadow-sm">
        
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl">Data Pendataan Desa</CardTitle>
          <Button variant="outline" onClick={() => fetchDesaData()} className="mt-2 md:mt-0">
            Refresh Data
          </Button>
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
                <option value="approved">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>Desa</TableHead>
                  <TableHead>Progress (%)</TableHead>
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
                      {desaData.length === 0 
                        ? "Anda belum memiliki alokasi desa" 
                        : "Tidak ada data yang sesuai filter"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.kecamatan_name}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.persentase_selesai || 0}%</TableCell>
                      <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                      <TableCell>{formatDate(item.tanggal_selesai)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
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
              Update Data Pendataan Desa {editingData?.desa?.name}
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
