import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileEdit, Trash2, Plus, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UbinanInputForm } from "./input-form";
import { VerificationDialog } from "@/components/verification/verification-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateToLocale } from "@/lib/utils";
import { UbinanData } from "@/types/database-schema";
import { UserRole } from "@/types/user";

export default function InputUbinanPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<UbinanData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterKomoditas, setFilterKomoditas] = useState<string>("all");

  const fetchUbinanData = async () => {
    if (!user?.id) return [];

    const query = supabase
      .from("ubinan_data")
      .select(`
        *,
        nks:nks_id(id, code, desa:desa_id(id, name, kecamatan:kecamatan_id(id, name))),
        segmen:segmen_id(id, code, desa:desa_id(id, name, kecamatan:kecamatan_id(id, name)))
      `)
      .eq("ppl_id", user.id)
      .order("tanggal_ubinan", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching ubinan data:", error);
      throw error;
    }

    return data as UbinanData[];
  };

  const { data: ubinanData = [], isLoading, refetch } = useQuery({
    queryKey: ["ppl_ubinan", user?.id],
    queryFn: fetchUbinanData,
    enabled: !!user?.id && (user?.role === UserRole.PPL),
  });

  const filteredData = ubinanData.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesKomoditas = filterKomoditas === 'all' || item.komoditas === filterKomoditas;
    return matchesStatus && matchesKomoditas;
  });

  const handleEdit = (data: UbinanData) => {
    setEditData(data);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase
        .from("ubinan_data")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Data berhasil dihapus");
      refetch();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Gagal menghapus data");
    }
  };

  const handleEditComplete = () => {
    setIsEditDialogOpen(false);
    setEditData(null);
    refetch();
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "belum_diisi":
        return <Badge variant="outline">Belum Diisi</Badge>;
      case "sudah_diisi":
        return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
      case "dikonfirmasi":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Terverifikasi</Badge>;
      case "ditolak":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (user?.role !== UserRole.PPL) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Input Data Ubinan</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Anda tidak memiliki akses untuk menginput data ubinan
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Input Data Ubinan</h1>

      {showForm ? (
        <UbinanInputForm
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refetch();
          }}
        />
      ) : (
        <div className="mb-6">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Input Data Baru
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Ubinan Tersimpan</CardTitle>
          <CardDescription>
            Data yang sudah diinput dan status verifikasinya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Filter:</span>
            </div>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="belum_diisi">Belum Diisi</SelectItem>
                <SelectItem value="sudah_diisi">Menunggu Verifikasi</SelectItem>
                <SelectItem value="dikonfirmasi">Terverifikasi</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filterKomoditas}
              onValueChange={setFilterKomoditas}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Komoditas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Komoditas</SelectItem>
                <SelectItem value="padi">Padi</SelectItem>
                <SelectItem value="jagung">Jagung</SelectItem>
                <SelectItem value="kedelai">Kedelai</SelectItem>
                <SelectItem value="kacang_tanah">Kacang Tanah</SelectItem>
                <SelectItem value="ubi_kayu">Ubi Kayu</SelectItem>
                <SelectItem value="ubi_jalar">Ubi Jalar</SelectItem>
              </SelectContent>
            </Select>
            
            {(filterStatus !== 'all' || filterKomoditas !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setFilterStatus('all');
                  setFilterKomoditas('all');
                }}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" /> Reset
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada data ubinan tersimpan{filterStatus !== 'all' ? ' dengan status yang dipilih' : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Komoditas</TableHead>
                    <TableHead>Kode NKS/Segmen</TableHead>
                    <TableHead>Responden</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Berat Hasil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="capitalize">
                        {item.komoditas?.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        {item.nks?.code || item.segmen?.code || "-"}
                        <div className="text-xs text-muted-foreground">
                          {item.nks?.desa?.name || item.segmen?.desa?.name || ""} / 
                          {item.nks?.desa?.kecamatan?.name || item.segmen?.desa?.kecamatan?.name || ""}
                        </div>
                      </TableCell>
                      <TableCell>{item.responden_name}</TableCell>
                      <TableCell>
                        {item.tanggal_ubinan ? formatDateToLocale(item.tanggal_ubinan) : "-"}
                      </TableCell>
                      <TableCell>{item.berat_hasil} kg</TableCell>
                      <TableCell>{renderStatus(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                            disabled={item.status === 'dikonfirmasi'}
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={item.status === 'dikonfirmasi' || item.status === 'sudah_diisi'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editData && (
        <VerificationDialog 
          isOpen={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)}
          onComplete={handleEditComplete}
          data={editData}
          mode="edit"
        />
      )}
    </div>
  );
}
