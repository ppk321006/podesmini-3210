
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputUbinanForm } from "./input-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { UbinanData } from "@/types/database-schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

export default function InputUbinanPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ubinanData, setUbinanData] = useState<UbinanData[]>([]);
  const [editData, setEditData] = useState<UbinanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ubinanToDelete, setUbinanToDelete] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (user?.id) {
      fetchUbinanData();
    }
  }, [user]);

  const fetchUbinanData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ubinan_data')
        .select(`
          *,
          nks:nks_id(
            id, code,
            desa:desa_id(
              id, name,
              kecamatan:kecamatan_id(id, name)
            )
          ),
          segmen:segmen_id(
            id, code,
            desa:desa_id(
              id, name,
              kecamatan:kecamatan_id(id, name)
            )
          )
        `)
        .eq('ppl_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching ubinan data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data ubinan",
          variant: "destructive",
        });
        return;
      }

      // Process data to add location information
      const processedData = data.map(item => {
        const desa = item.nks?.desa || item.segmen?.desa;
        return {
          ...item,
          desa_name: desa?.name || '-',
          kecamatan_name: desa?.kecamatan?.name || '-'
        };
      });

      setUbinanData(processedData as UbinanData[]);
    } catch (error) {
      console.error("Error in fetchUbinanData:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data ubinan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSuccess = async () => {
    setEditData(null);
    await fetchUbinanData();
    toast({
      title: "Sukses",
      description: "Data ubinan berhasil disimpan",
    });
  };

  const handleDeleteClick = (id: string) => {
    setUbinanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!ubinanToDelete) return;

    try {
      const { error } = await supabase
        .from('ubinan_data')
        .delete()
        .eq('id', ubinanToDelete);

      if (error) {
        console.error("Error deleting ubinan:", error);
        toast({
          title: "Error",
          description: "Gagal menghapus data ubinan",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sukses",
        description: "Data ubinan berhasil dihapus",
      });

      await fetchUbinanData();
    } catch (error) {
      console.error("Error in confirmDelete:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus data ubinan",
        variant: "destructive",
      });
    } finally {
      setUbinanToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditClick = (data: UbinanData) => {
    setEditData(data);
  };

  // Sort function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort data based on current sort settings
  const sortedData = [...ubinanData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'kode':
        valueA = (a.nks?.code || a.segmen?.code || '').toLowerCase();
        valueB = (b.nks?.code || b.segmen?.code || '').toLowerCase();
        break;
      case 'responden':
        valueA = a.responden_name.toLowerCase();
        valueB = b.responden_name.toLowerCase();
        break;
      case 'komoditas':
        valueA = a.komoditas.toLowerCase();
        valueB = b.komoditas.toLowerCase();
        break;
      case 'lokasi':
        valueA = `${a.kecamatan_name} ${a.desa_name}`.toLowerCase();
        valueB = `${b.kecamatan_name} ${b.desa_name}`.toLowerCase();
        break;
      case 'tanggal':
        valueA = new Date(a.tanggal_ubinan).getTime();
        valueB = new Date(b.tanggal_ubinan).getTime();
        break;
      case 'berat':
        valueA = a.berat_hasil;
        valueB = b.berat_hasil;
        break;
      case 'status':
        valueA = a.status.toLowerCase();
        valueB = b.status.toLowerCase();
        break;
      case 'komentar':
        valueA = (a.komentar || '').toLowerCase();
        valueB = (b.komentar || '').toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Input Data Ubinan</h1>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">{editData ? "Edit Data Ubinan" : "Form Input Data"}</TabsTrigger>
          <TabsTrigger value="data">Data Tersimpan</TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="mt-4">
          <InputUbinanForm 
            onSubmitSuccess={handleSubmitSuccess} 
            initialData={editData}
            usedSamples={ubinanData.map(data => ({
              nks_id: data.nks_id,
              segmen_id: data.segmen_id,
              responden_name: data.responden_name
            }))}
          />
        </TabsContent>
        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Ubinan Tersimpan</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : sortedData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada data ubinan yang tersimpan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead onClick={() => handleSort('kode')} className="cursor-pointer">
                          Kode {sortColumn === 'kode' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                        </TableHead>
                        <TableHead onClick={() => handleSort('responden')} className="cursor-pointer">
                          Responden {sortColumn === 'responden' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                        </TableHead>
                        <TableHead onClick={() => handleSort('komoditas')} className="cursor-pointer">
                          Komoditas {sortColumn === 'komoditas' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                        </TableHead>
                        <TableHead onClick={() => handleSort('lokasi')} className="cursor-pointer">
                          Kecamatan/Desa {sortColumn === 'lokasi' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                        </TableHead>
                        <TableHead onClick={() => handleSort('tanggal')} className="cursor-pointer">
                          Tanggal {sortColumn === 'tanggal' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                        </TableHead>
                        <TableHead onClick={() => handleSort('berat')} className="cursor-pointer">
                          Berat Hasil {sortColumn === 'berat' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                        </TableHead>
                        <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                          Status {sortColumn === 'status' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                        </TableHead>
                        <TableHead onClick={() => handleSort('komentar')} className="cursor-pointer">
                          Komentar PML {sortColumn === 'komentar' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
                        </TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.nks?.code || item.segmen?.code || "-"}
                          </TableCell>
                          <TableCell>{item.responden_name}</TableCell>
                          <TableCell className="capitalize">
                            {item.komoditas.replace("_", " ")}
                          </TableCell>
                          <TableCell>
                            {item.kecamatan_name} / {item.desa_name}
                          </TableCell>
                          <TableCell>
                            {format(new Date(item.tanggal_ubinan), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{item.berat_hasil} kg</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.status === "dikonfirmasi"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "ditolak"
                                  ? "bg-red-100 text-red-800"
                                  : item.status === "sudah_diisi"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {item.status === "dikonfirmasi"
                                ? "Terverifikasi"
                                : item.status === "ditolak"
                                ? "Ditolak"
                                : item.status === "sudah_diisi"
                                ? "Menunggu Verifikasi"
                                : "Belum Diisi"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="line-clamp-2">{item.komentar || "-"}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditClick(item)}
                                disabled={item.status === "dikonfirmasi"}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteClick(item.id)}
                                disabled={item.status === "dikonfirmasi"}
                              >
                                <Trash className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Data</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
