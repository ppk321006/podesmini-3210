
import { useState } from "react";
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
  X
} from "lucide-react";
import { toast } from "sonner";

// Mock data for kecamatan and desa
const mockKecamatan = [
  { id: "kec-1", nama: "Majalengka", jumlah_desa: 15 },
  { id: "kec-2", nama: "Kadipaten", jumlah_desa: 12 },
  { id: "kec-3", nama: "Jatiwangi", jumlah_desa: 10 },
  { id: "kec-4", nama: "Dawuan", jumlah_desa: 8 },
  { id: "kec-5", nama: "Kertajati", jumlah_desa: 7 },
];

const mockDesa = [
  { id: "desa-1", kecamatan_id: "kec-1", nama: "Cidahu" },
  { id: "desa-2", kecamatan_id: "kec-1", nama: "Sukamaju" },
  { id: "desa-3", kecamatan_id: "kec-1", nama: "Cibunar" },
  { id: "desa-4", kecamatan_id: "kec-1", nama: "Buniseuri" },
  { id: "desa-5", kecamatan_id: "kec-2", nama: "Kadipaten" },
  { id: "desa-6", kecamatan_id: "kec-2", nama: "Babakan" },
  { id: "desa-7", kecamatan_id: "kec-3", nama: "Jatiwangi" },
  { id: "desa-8", kecamatan_id: "kec-3", nama: "Sutawangi" },
  { id: "desa-9", kecamatan_id: "kec-4", nama: "Dawuan" },
  { id: "desa-10", kecamatan_id: "kec-5", nama: "Kertajati" },
];

export default function WilayahPage() {
  const [activeTab, setActiveTab] = useState("kecamatan");
  const [searchTerm, setSearchTerm] = useState("");
  const [kecamatanList, setKecamatanList] = useState(mockKecamatan);
  const [desaList, setDesaList] = useState(mockDesa);
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
  
  const getFilteredKecamatan = () => {
    if (!searchTerm) return kecamatanList;
    
    return kecamatanList.filter(kec => 
      kec.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const getFilteredDesa = () => {
    let filtered = desaList;
    
    if (selectedKecamatan) {
      filtered = filtered.filter(desa => desa.kecamatan_id === selectedKecamatan);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(desa => 
        desa.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const getKecamatanName = (id: string) => {
    return kecamatanList.find(kec => kec.id === id)?.nama || "-";
  };
  
  const handleAddKecamatan = () => {
    if (!newKecamatanName.trim()) {
      toast.error("Nama kecamatan tidak boleh kosong");
      return;
    }
    
    const newKecamatan = {
      id: `kec-${kecamatanList.length + 1}`,
      nama: newKecamatanName.trim(),
      jumlah_desa: 0
    };
    
    setKecamatanList([...kecamatanList, newKecamatan]);
    setNewKecamatanName("");
    setShowAddKecamatan(false);
    toast.success(`Kecamatan ${newKecamatanName} berhasil ditambahkan`);
  };
  
  const handleEditKecamatan = () => {
    if (!editKecamatanId) return;
    if (!editKecamatanName.trim()) {
      toast.error("Nama kecamatan tidak boleh kosong");
      return;
    }
    
    setKecamatanList(prev => 
      prev.map(kec => 
        kec.id === editKecamatanId ? { ...kec, nama: editKecamatanName.trim() } : kec
      )
    );
    
    setEditKecamatanId(null);
    setEditKecamatanName("");
    setShowEditKecamatan(false);
    toast.success("Kecamatan berhasil diperbarui");
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
    
    const newDesa = {
      id: `desa-${desaList.length + 1}`,
      kecamatan_id: newDesaKecamatanId,
      nama: newDesaName.trim()
    };
    
    setDesaList([...desaList, newDesa]);
    
    // Update jumlah desa di kecamatan
    setKecamatanList(prev => 
      prev.map(kec => 
        kec.id === newDesaKecamatanId ? { ...kec, jumlah_desa: kec.jumlah_desa + 1 } : kec
      )
    );
    
    setNewDesaName("");
    setNewDesaKecamatanId("");
    setShowAddDesa(false);
    toast.success(`Desa ${newDesaName} berhasil ditambahkan`);
  };
  
  const handleEditDesa = () => {
    if (!editDesaId) return;
    if (!editDesaName.trim()) {
      toast.error("Nama desa tidak boleh kosong");
      return;
    }
    
    setDesaList(prev => 
      prev.map(desa => 
        desa.id === editDesaId ? { ...desa, nama: editDesaName.trim() } : desa
      )
    );
    
    setEditDesaId(null);
    setEditDesaName("");
    setShowEditDesa(false);
    toast.success("Desa berhasil diperbarui");
  };
  
  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'kecamatan') {
      // Check if there are desa in this kecamatan
      const hasRelatedDesa = desaList.some(desa => desa.kecamatan_id === itemToDelete.id);
      
      if (hasRelatedDesa) {
        toast.error("Tidak dapat menghapus kecamatan yang memiliki desa");
        setShowDeleteDialog(false);
        setItemToDelete(null);
        return;
      }
      
      setKecamatanList(prev => prev.filter(kec => kec.id !== itemToDelete.id));
      toast.success("Kecamatan berhasil dihapus");
    } else {
      setDesaList(prev => prev.filter(desa => desa.id !== itemToDelete.id));
      
      // Update jumlah desa di kecamatan
      const desa = desaList.find(d => d.id === itemToDelete.id);
      if (desa) {
        setKecamatanList(prev => 
          prev.map(kec => 
            kec.id === desa.kecamatan_id ? { ...kec, jumlah_desa: kec.jumlah_desa - 1 } : kec
          )
        );
      }
      
      toast.success("Desa berhasil dihapus");
    }
    
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };
  
  const confirmDelete = (id: string, type: 'kecamatan' | 'desa') => {
    setItemToDelete({ id, type });
    setShowDeleteDialog(true);
  };
  
  const handleEditKecamatanClick = (kecamatan: any) => {
    setEditKecamatanId(kecamatan.id);
    setEditKecamatanName(kecamatan.nama);
    setShowEditKecamatan(true);
  };
  
  const handleEditDesaClick = (desa: any) => {
    setEditDesaId(desa.id);
    setEditDesaName(desa.nama);
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
                className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
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
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Kecamatan</TableHead>
                      <TableHead className="text-center">Jumlah Desa</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredKecamatan().map((kecamatan, index) => (
                      <TableRow key={kecamatan.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{kecamatan.nama}</TableCell>
                        <TableCell className="text-center">{kecamatan.jumlah_desa}</TableCell>
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
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {getFilteredKecamatan().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Tidak ada data kecamatan
                        </TableCell>
                      </TableRow>
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
                className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
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
                      {kec.nama}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Desa</TableHead>
                      <TableHead>Kecamatan</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredDesa().map((desa, index) => (
                      <TableRow key={desa.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{desa.nama}</TableCell>
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
                    ))}
                    
                    {getFilteredDesa().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Tidak ada data desa
                        </TableCell>
                      </TableRow>
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
            >
              Batal
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleAddKecamatan}
            >
              Simpan
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
            >
              Batal
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleEditKecamatan}
            >
              Simpan
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
                    {kec.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddDesa(false)}
            >
              Batal
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleAddDesa}
            >
              Simpan
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
            >
              Batal
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleEditDesa}
            >
              Simpan
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
            >
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteItem}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
