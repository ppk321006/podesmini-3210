
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Map,
  Home,
  Users,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types for our data
interface Kecamatan {
  id: string;
  name: string;
  jumlah_desa?: number;
}

interface Desa {
  id: string;
  name: string;
  kecamatan_id: string;
}

export default function WilayahPage() {
  const [activeTab, setActiveTab] = useState("kecamatan");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'kecamatan' | 'desa'} | null>(null);
  
  // Form states
  const [newKecamatanName, setNewKecamatanName] = useState("");
  const [editKecamatanName, setEditKecamatanName] = useState("");
  const [editKecamatanId, setEditKecamatanId] = useState<string | null>(null);
  
  const [newDesaName, setNewDesaName] = useState("");
  const [newDesaKecamatanId, setNewDesaKecamatanId] = useState("");
  const [editDesaName, setEditDesaName] = useState("");
  const [editDesaId, setEditDesaId] = useState<string | null>(null);
  
  // UI states
  const [showAddKecamatan, setShowAddKecamatan] = useState(false);
  const [showEditKecamatan, setShowEditKecamatan] = useState(false);
  const [showAddDesa, setShowAddDesa] = useState(false);
  const [showEditDesa, setShowEditDesa] = useState(false);

  const queryClient = useQueryClient();
  
  // Fetch kecamatan data from Supabase
  const { 
    data: kecamatanList = [], 
    isLoading: isLoadingKecamatan 
  } = useQuery({
    queryKey: ['kecamatan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kecamatan')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error("Error fetching kecamatan data:", error);
        toast.error("Gagal mengambil data kecamatan");
        throw error;
      }

      // Count desa for each kecamatan
      const kecamatanWithCount = await Promise.all(
        data.map(async (kec) => {
          const { count, error: countError } = await supabase
            .from('desa')
            .select('*', { count: 'exact', head: true })
            .eq('kecamatan_id', kec.id);
            
          if (countError) {
            console.error("Error counting desa:", countError);
            return {
              ...kec,
              jumlah_desa: 0
            };
          }
          
          return {
            ...kec,
            jumlah_desa: count || 0
          };
        })
      );
      
      return kecamatanWithCount as Kecamatan[];
    }
  });
  
  // Fetch desa data from Supabase
  const { 
    data: desaList = [], 
    isLoading: isLoadingDesa 
  } = useQuery({
    queryKey: ['desa', selectedKecamatan],
    queryFn: async () => {
      let query = supabase
        .from('desa')
        .select('*')
        .order('name', { ascending: true });
        
      if (selectedKecamatan) {
        query = query.eq('kecamatan_id', selectedKecamatan);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error("Error fetching desa data:", error);
        toast.error("Gagal mengambil data desa");
        throw error;
      }
      
      return data as Desa[];
    }
  });
  
  // Mutations
  const addKecamatanMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('kecamatan')
        .insert([{ name }])
        .select();
        
      if (error) {
        console.error("Error adding kecamatan:", error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kecamatan'] });
      setNewKecamatanName("");
      setShowAddKecamatan(false);
      toast.success("Kecamatan berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(`Gagal menambahkan kecamatan: ${error.message}`);
    }
  });
  
  const updateKecamatanMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('kecamatan')
        .update({ name })
        .eq('id', id)
        .select();
        
      if (error) {
        console.error("Error updating kecamatan:", error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kecamatan'] });
      setEditKecamatanId(null);
      setEditKecamatanName("");
      setShowEditKecamatan(false);
      toast.success("Kecamatan berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui kecamatan: ${error.message}`);
    }
  });
  
  const addDesaMutation = useMutation({
    mutationFn: async ({ name, kecamatan_id }: { name: string; kecamatan_id: string }) => {
      const { data, error } = await supabase
        .from('desa')
        .insert([{ name, kecamatan_id }])
        .select();
        
      if (error) {
        console.error("Error adding desa:", error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desa'] });
      queryClient.invalidateQueries({ queryKey: ['kecamatan'] });
      setNewDesaName("");
      setNewDesaKecamatanId("");
      setShowAddDesa(false);
      toast.success("Desa berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(`Gagal menambahkan desa: ${error.message}`);
    }
  });
  
  const updateDesaMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('desa')
        .update({ name })
        .eq('id', id)
        .select();
        
      if (error) {
        console.error("Error updating desa:", error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desa'] });
      setEditDesaId(null);
      setEditDesaName("");
      setShowEditDesa(false);
      toast.success("Desa berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui desa: ${error.message}`);
    }
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'kecamatan' | 'desa' }) => {
      const table = type === 'kecamatan' ? 'kecamatan' : 'desa';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting ${type}:`, error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'kecamatan') {
        queryClient.invalidateQueries({ queryKey: ['kecamatan'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['desa'] });
        queryClient.invalidateQueries({ queryKey: ['kecamatan'] });
      }
      setShowDeleteDialog(false);
      setItemToDelete(null);
      toast.success(`${variables.type === 'kecamatan' ? 'Kecamatan' : 'Desa'} berhasil dihapus`);
    },
    onError: (error, variables) => {
      // Check if the error is because of foreign key constraint
      if (error.message?.includes('foreign key constraint')) {
        toast.error(`Tidak dapat menghapus ${variables.type} karena masih memiliki data terkait`);
      } else {
        toast.error(`Gagal menghapus ${variables.type}: ${error.message}`);
      }
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  });
  
  const getFilteredKecamatan = () => {
    if (!searchTerm) return kecamatanList;
    
    return kecamatanList.filter(kec => 
      kec.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const getFilteredDesa = () => {
    let filtered = desaList;
    
    if (searchTerm) {
      filtered = filtered.filter(desa => 
        desa.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const getKecamatanName = (id: string) => {
    const kecamatan = kecamatanList.find(kec => kec.id === id);
    return kecamatan ? kecamatan.name : "-";
  };
  
  const handleAddKecamatan = () => {
    if (!newKecamatanName.trim()) {
      toast.error("Nama kecamatan tidak boleh kosong");
      return;
    }
    
    addKecamatanMutation.mutate(newKecamatanName.trim());
  };
  
  const handleEditKecamatan = () => {
    if (!editKecamatanId) return;
    if (!editKecamatanName.trim()) {
      toast.error("Nama kecamatan tidak boleh kosong");
      return;
    }
    
    updateKecamatanMutation.mutate({ 
      id: editKecamatanId, 
      name: editKecamatanName.trim() 
    });
  };
  
  const handleAddDesa = () => {
    if (!newDesaName.trim()) {
      toast.error("Nama desa tidak boleh kosong");
      return;
    }
    
    if (!newDesaKecamatanId) {
      toast.error("Silakan pilih kecamatan");
      return;
    }
    
    addDesaMutation.mutate({ 
      name: newDesaName.trim(),
      kecamatan_id: newDesaKecamatanId
    });
  };
  
  const handleEditDesa = () => {
    if (!editDesaId) return;
    if (!editDesaName.trim()) {
      toast.error("Nama desa tidak boleh kosong");
      return;
    }
    
    updateDesaMutation.mutate({ 
      id: editDesaId, 
      name: editDesaName.trim() 
    });
  };
  
  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    deleteItemMutation.mutate(itemToDelete);
  };
  
  const confirmDelete = (id: string, type: 'kecamatan' | 'desa') => {
    setItemToDelete({ id, type });
    setShowDeleteDialog(true);
  };
  
  const handleEditKecamatanClick = (kecamatan: Kecamatan) => {
    setEditKecamatanId(kecamatan.id);
    setEditKecamatanName(kecamatan.name);
    setShowEditKecamatan(true);
  };
  
  const handleEditDesaClick = (desa: Desa) => {
    setEditDesaId(desa.id);
    setEditDesaName(desa.name);
    setShowEditDesa(true);
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Manajemen Wilayah</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="kecamatan" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Kecamatan
          </TabsTrigger>
          <TabsTrigger value="desa" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Desa
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="kecamatan">
          <Card>
            <CardHeader className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:justify-between md:items-center">
              <div>
                <CardTitle>Daftar Kecamatan</CardTitle>
                <CardDescription>
                  Kelola kecamatan di Kabupaten Majalengka
                </CardDescription>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                onClick={() => setShowAddKecamatan(true)}
              >
                <Plus className="h-4 w-4" />
                Tambah Kecamatan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari kecamatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary text-secondary-foreground">
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama Kecamatan</TableHead>
                      <TableHead className="text-center">Jumlah Desa</TableHead>
                      <TableHead className="text-center w-[150px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingKecamatan ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Memuat data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : getFilteredKecamatan().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Tidak ada data kecamatan
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredKecamatan().map((kecamatan, index) => (
                        <TableRow key={kecamatan.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{kecamatan.name}</TableCell>
                          <TableCell className="text-center">{kecamatan.jumlah_desa || 0}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditKecamatanClick(kecamatan)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => confirmDelete(kecamatan.id, 'kecamatan')}
                                disabled={(kecamatan.jumlah_desa || 0) > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="desa">
          <Card>
            <CardHeader className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:justify-between md:items-center">
              <div>
                <CardTitle>Daftar Desa</CardTitle>
                <CardDescription>
                  Kelola desa di Kabupaten Majalengka
                </CardDescription>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                onClick={() => setShowAddDesa(true)}
              >
                <Plus className="h-4 w-4" />
                Tambah Desa
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Cari desa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select 
                  className="px-3 py-2 rounded-md border border-input bg-background h-10"
                  value={selectedKecamatan || ""}
                  onChange={(e) => setSelectedKecamatan(e.target.value || null)}
                >
                  <option value="">Semua Kecamatan</option>
                  {kecamatanList.map(kec => (
                    <option key={kec.id} value={kec.id}>
                      {kec.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary text-secondary-foreground">
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama Desa</TableHead>
                      <TableHead>Kecamatan</TableHead>
                      <TableHead className="text-center w-[150px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingDesa ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Memuat data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : getFilteredDesa().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Tidak ada data desa
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredDesa().map((desa, index) => (
                        <TableRow key={desa.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{desa.name}</TableCell>
                          <TableCell>{getKecamatanName(desa.kecamatan_id)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditDesaClick(desa)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => confirmDelete(desa.id, 'desa')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog: Tambah Kecamatan */}
      <Dialog open={showAddKecamatan} onOpenChange={setShowAddKecamatan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kecamatan Baru</DialogTitle>
            <DialogDescription>
              Tambahkan kecamatan baru ke sistem
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="kecamatanName" className="text-sm font-medium">
                Nama Kecamatan
              </label>
              <Input
                id="kecamatanName"
                placeholder="Masukkan nama kecamatan"
                value={newKecamatanName}
                onChange={(e) => setNewKecamatanName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddKecamatan(false)}
              disabled={addKecamatanMutation.isPending}
            >
              Batal
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleAddKecamatan}
              disabled={addKecamatanMutation.isPending}
            >
              {addKecamatanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Edit Kecamatan */}
      <Dialog open={showEditKecamatan} onOpenChange={setShowEditKecamatan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kecamatan</DialogTitle>
            <DialogDescription>
              Perbarui informasi kecamatan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="editKecamatanName" className="text-sm font-medium">
                Nama Kecamatan
              </label>
              <Input
                id="editKecamatanName"
                placeholder="Masukkan nama kecamatan"
                value={editKecamatanName}
                onChange={(e) => setEditKecamatanName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditKecamatan(false);
                setEditKecamatanId(null);
                setEditKecamatanName("");
              }}
              disabled={updateKecamatanMutation.isPending}
            >
              Batal
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleEditKecamatan}
              disabled={updateKecamatanMutation.isPending}
            >
              {updateKecamatanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Tambah Desa */}
      <Dialog open={showAddDesa} onOpenChange={setShowAddDesa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Desa Baru</DialogTitle>
            <DialogDescription>
              Tambahkan desa baru ke sistem
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="desaName" className="text-sm font-medium">
                Nama Desa
              </label>
              <Input
                id="desaName"
                placeholder="Masukkan nama desa"
                value={newDesaName}
                onChange={(e) => setNewDesaName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="desaKecamatan" className="text-sm font-medium">
                Kecamatan
              </label>
              <select
                id="desaKecamatan"
                className="w-full px-3 py-2 rounded-md border border-input bg-background h-10"
                value={newDesaKecamatanId}
                onChange={(e) => setNewDesaKecamatanId(e.target.value)}
              >
                <option value="">Pilih Kecamatan</option>
                {kecamatanList.map(kec => (
                  <option key={kec.id} value={kec.id}>
                    {kec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddDesa(false)}
              disabled={addDesaMutation.isPending}
            >
              Batal
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleAddDesa}
              disabled={addDesaMutation.isPending}
            >
              {addDesaMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Edit Desa */}
      <Dialog open={showEditDesa} onOpenChange={setShowEditDesa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Desa</DialogTitle>
            <DialogDescription>
              Perbarui informasi desa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="editDesaName" className="text-sm font-medium">
                Nama Desa
              </label>
              <Input
                id="editDesaName"
                placeholder="Masukkan nama desa"
                value={editDesaName}
                onChange={(e) => setEditDesaName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditDesa(false);
                setEditDesaId(null);
                setEditDesaName("");
              }}
              disabled={updateDesaMutation.isPending}
            >
              Batal
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleEditDesa}
              disabled={updateDesaMutation.isPending}
            >
              {updateDesaMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Konfirmasi Hapus */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {itemToDelete?.type === 'kecamatan' ? 'kecamatan' : 'desa'} ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setItemToDelete(null);
              }}
              disabled={deleteItemMutation.isPending}
            >
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteItem}
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
