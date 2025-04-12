import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Pencil, Trash2, Search, Filter, Tag, Check } from "lucide-react";
import { toast } from "sonner";
import { 
  getKecamatanList, 
  createKecamatan,
  getDesaList,
  createDesa,
  getNKSList,
  createNKS,
  getNKSWithAssignments,
  deleteNKS,
  getSegmenList,
  createSegmen,
  getSegmenWithAssignments,
  deleteSegmen,
  createSampelKRT,
  getSampelKRTList,
  deleteSampelKRT,
  getSubround
} from "@/services/wilayah-api";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateToLocale, monthsIndonesia } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

export default function WilayahPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("kecamatan");
  const [filterText, setFilterText] = useState("");
  
  const [isEditNKSDialogOpen, setIsEditNKSDialogOpen] = useState(false);
  const [isEditSegmenDialogOpen, setIsEditSegmenDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);
  
  const [newKecamatanName, setNewKecamatanName] = useState("");
  
  const [sampelKRTList, setSampelKRTList] = useState<Array<{nama: string; status: 'Utama' | 'Cadangan'}>>([]);
  const [newKRTNama, setNewKRTNama] = useState("");
  const [newKRTStatus, setNewKRTStatus] = useState<'Utama' | 'Cadangan'>('Utama');
  
  const { data: kecamatanList = [], isLoading: isLoadingKecamatan } = useQuery({
    queryKey: ["kecamatan"],
    queryFn: getKecamatanList,
  });
  
  const createKecamatanMutation = useMutation({
    mutationFn: (name: string) => createKecamatan(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kecamatan"] });
      setNewKecamatanName("");
      toast.success("Kecamatan berhasil ditambahkan");
    },
    onError: (error) => {
      console.error("Error creating kecamatan:", error);
      toast.error("Gagal menambahkan kecamatan");
    }
  });
  
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");
  const [newDesaName, setNewDesaName] = useState("");
  
  const { data: desaList = [], isLoading: isLoadingDesa } = useQuery({
    queryKey: ["desa", selectedKecamatanId],
    queryFn: () => getDesaList(selectedKecamatanId || undefined),
    enabled: !!selectedKecamatanId || activeTab === "desa",
  });
  
  const createDesaMutation = useMutation({
    mutationFn: (values: { name: string; kecamatanId: string }) => 
      createDesa(values.name, values.kecamatanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desa", selectedKecamatanId] });
      setNewDesaName("");
      toast.success("Desa berhasil ditambahkan");
    },
    onError: (error) => {
      console.error("Error creating desa:", error);
      toast.error("Gagal menambahkan desa");
    }
  });
  
  const [selectedDesaId, setSelectedDesaId] = useState("");
  const [newNKSCode, setNewNKSCode] = useState("");
  const [targetPalawija, setTargetPalawija] = useState(0);
  const [selectedKomoditasList, setSelectedKomoditasList] = useState<string[]>([]);
  const [subroundValue, setSubroundValue] = useState(1);
  
  const { data: currentSubround = 1 } = useQuery({
    queryKey: ["subround"],
    queryFn: getSubround,
  });
  
  useEffect(() => {
    setSubroundValue(currentSubround);
  }, [currentSubround]);
  
  const { data: nksWithAssignments = [], isLoading: isLoadingNKSAssignments } = useQuery({
    queryKey: ["nks_assignments"],
    queryFn: getNKSWithAssignments,
    enabled: activeTab === "nks",
  });
  
  const { data: nksList = [] } = useQuery({
    queryKey: ["nks", selectedDesaId],
    queryFn: () => getNKSList(selectedDesaId || undefined),
    enabled: !!selectedDesaId || activeTab === "nks",
  });
  
  const createNKSMutation = useMutation({
    mutationFn: (values: { 
      code: string; 
      desaId: string; 
      targetPalawija: number;
      subround: number;
      sampelKRTList: {nama: string; status: 'Utama' | 'Cadangan'}[];
    }) => {
      return createNKS(
        values.code, 
        values.desaId,
        values.targetPalawija,
        values.subround
      ).then(nks => {
        const promises = values.sampelKRTList.map(krt => 
          createSampelKRT({
            nama: krt.nama, 
            status: krt.status, 
            nks_id: nks.id
          })
        );
        return Promise.all(promises).then(() => nks);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nks", selectedDesaId] });
      queryClient.invalidateQueries({ queryKey: ["nks_assignments"] });
      setNewNKSCode("");
      setTargetPalawija(0);
      setSelectedKomoditasList([]);
      setSampelKRTList([]);
      toast.success("NKS berhasil ditambahkan");
    },
    onError: (error) => {
      console.error("Error creating NKS:", error);
      toast.error("Gagal menambahkan NKS");
    }
  });
  
  const deleteNKSMutation = useMutation({
    mutationFn: (id: string) => deleteNKS(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nks", selectedDesaId] });
      queryClient.invalidateQueries({ queryKey: ["nks_assignments"] });
      toast.success("NKS berhasil dihapus");
    },
    onError: (error) => {
      console.error("Error deleting NKS:", error);
      toast.error("Gagal menghapus NKS");
    }
  });
  
  const [newSegmenCode, setNewSegmenCode] = useState("");
  const [targetPadi, setTargetPadi] = useState(0);
  const [selectedBulan, setSelectedBulan] = useState<number | "">("");
  
  const { data: segmenWithAssignments = [], isLoading: isLoadingSegmenAssignments } = useQuery({
    queryKey: ["segmen_assignments"],
    queryFn: getSegmenWithAssignments,
    enabled: activeTab === "segmen",
  });
  
  const { data: segmenList = [] } = useQuery({
    queryKey: ["segmen", selectedDesaId],
    queryFn: () => getSegmenList(selectedDesaId || undefined),
    enabled: !!selectedDesaId || activeTab === "segmen",
  });
  
  const createSegmenMutation = useMutation({
    mutationFn: (values: { 
      code: string; 
      desaId: string; 
      targetPadi: number;
      bulan: number;
    }) => {
      return createSegmen(
        values.code, 
        values.desaId,
        values.targetPadi,
        values.bulan
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segmen", selectedDesaId] });
      queryClient.invalidateQueries({ queryKey: ["segmen_assignments"] });
      setNewSegmenCode("");
      setTargetPadi(0);
      setSelectedBulan("");
      toast.success("Segmen berhasil ditambahkan");
    },
    onError: (error) => {
      console.error("Error creating Segmen:", error);
      toast.error("Gagal menambahkan Segmen");
    }
  });
  
  const deleteSegmenMutation = useMutation({
    mutationFn: (id: string) => deleteSegmen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segmen", selectedDesaId] });
      queryClient.invalidateQueries({ queryKey: ["segmen_assignments"] });
      toast.success("Segmen berhasil dihapus");
    },
    onError: (error) => {
      console.error("Error deleting Segmen:", error);
      toast.error("Gagal menghapus Segmen");
    }
  });
  
  const handleAddKecamatan = () => {
    if (!newKecamatanName.trim()) {
      toast.error("Nama kecamatan tidak boleh kosong");
      return;
    }
    
    createKecamatanMutation.mutate(newKecamatanName);
  };
  
  const handleAddDesa = () => {
    if (!newDesaName.trim()) {
      toast.error("Nama desa tidak boleh kosong");
      return;
    }
    
    if (!selectedKecamatanId) {
      toast.error("Pilih kecamatan terlebih dahulu");
      return;
    }
    
    createDesaMutation.mutate({
      name: newDesaName,
      kecamatanId: selectedKecamatanId
    });
  };
  
  const handleAddNKS = () => {
    if (!newNKSCode.trim()) {
      toast.error("Kode NKS tidak boleh kosong");
      return;
    }
    
    if (!selectedDesaId) {
      toast.error("Pilih desa terlebih dahulu");
      return;
    }
    
    if (selectedKomoditasList.length === 0) {
      toast.error("Pilih minimal satu jenis tanaman palawija");
      return;
    }
    
    if (sampelKRTList.length < targetPalawija * 2) {
      toast.error(`Anda harus menambahkan minimal ${targetPalawija * 2} sampel KRT`);
      return;
    }
    
    createNKSMutation.mutate({
      code: newNKSCode,
      desaId: selectedDesaId,
      targetPalawija: targetPalawija,
      subround: subroundValue,
      sampelKRTList: sampelKRTList
    });
  };
  
  const handleAddSegmen = () => {
    if (!newSegmenCode.trim()) {
      toast.error("Kode Segmen tidak boleh kosong");
      return;
    }
    
    if (!selectedDesaId) {
      toast.error("Pilih desa terlebih dahulu");
      return;
    }
    
    if (selectedBulan === "") {
      toast.error("Pilih bulan terlebih dahulu");
      return;
    }
    
    createSegmenMutation.mutate({
      code: newSegmenCode,
      desaId: selectedDesaId,
      targetPadi: targetPadi,
      bulan: selectedBulan as number
    });
  };
  
  const handleDeleteNKS = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus NKS ini?")) {
      deleteNKSMutation.mutate(id);
    }
  };
  
  const handleDeleteSegmen = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus Segmen ini?")) {
      deleteSegmenMutation.mutate(id);
    }
  };
  
  const handleAddKRT = () => {
    if (!newKRTNama.trim()) {
      toast.error("Nama KRT tidak boleh kosong");
      return;
    }
    
    setSampelKRTList([...sampelKRTList, { nama: newKRTNama, status: newKRTStatus }]);
    setNewKRTNama("");
    setNewKRTStatus('Utama');
  };
  
  const handleRemoveKRT = (index: number) => {
    const newList = [...sampelKRTList];
    newList.splice(index, 1);
    setSampelKRTList(newList);
  };
  
  const toggleKomoditasSelection = (komoditas: string) => {
    setSelectedKomoditasList(prevList => {
      if (prevList.includes(komoditas)) {
        return prevList.filter(k => k !== komoditas);
      } else {
        return [...prevList, komoditas];
      }
    });
  };

  const filteredNKSData = nksWithAssignments ? nksWithAssignments.filter(item => {
    const searchText = filterText.toLowerCase();
    return (
      item.code.toLowerCase().includes(searchText) || 
      (item.desa?.name && item.desa.name.toLowerCase().includes(searchText)) || 
      (item.desa?.kecamatan?.name && item.desa.kecamatan.name.toLowerCase().includes(searchText))
    );
  }) : [];

  const filteredSegmenData = segmenWithAssignments ? segmenWithAssignments.filter(item => {
    const searchText = filterText.toLowerCase();
    return (
      item.code.toLowerCase().includes(searchText) || 
      (item.desa?.name && item.desa.name.toLowerCase().includes(searchText)) || 
      (item.desa?.kecamatan?.name && item.desa.kecamatan.name.toLowerCase().includes(searchText))
    );
  }) : [];

  const getMonthName = (monthNum: number): string => {
    const month = monthsIndonesia.find(m => m.value === monthNum);
    return month ? month.label : '';
  };

  const getPetugasName = (id: string) => {
    const pml = pmlList.find(p => p.id === id);
    if (pml) return pml.name;
    
    const ppl = pplList.find(p => p.id === id);
    return ppl ? ppl.name : "-";
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Manajemen Wilayah</h1>
      
      <div className="mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="kecamatan">Kecamatan</TabsTrigger>
            <TabsTrigger value="desa">Desa</TabsTrigger>
            <TabsTrigger value="nks">NKS</TabsTrigger>
            <TabsTrigger value="segmen">Segmen</TabsTrigger>
          </TabsList>
          
          {(activeTab === 'nks' || activeTab === 'segmen') && (
            <div className="flex items-center mb-4 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari..."
                  className="pl-8"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <TabsContent value="kecamatan">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah Kecamatan Baru</CardTitle>
                  <CardDescription>Tambahkan kecamatan baru ke sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="kecamatan-name">Nama Kecamatan</Label>
                      <Input
                        id="kecamatan-name"
                        placeholder="Masukkan nama kecamatan"
                        value={newKecamatanName}
                        onChange={(e) => setNewKecamatanName(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    onClick={handleAddKecamatan}
                    disabled={createKecamatanMutation.isPending || !newKecamatanName.trim()}
                  >
                    {createKecamatanMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Kecamatan</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingKecamatan ? (
                    <p>Memuat data...</p>
                  ) : kecamatanList.length === 0 ? (
                    <p className="text-muted-foreground">Belum ada data kecamatan</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Kecamatan</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kecamatanList.map((kecamatan) => (
                          <TableRow key={kecamatan.id}>
                            <TableCell>{kecamatan.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{kecamatan.id}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="desa">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah Desa Baru</CardTitle>
                  <CardDescription>Tambahkan desa baru ke sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="kecamatan-select">Pilih Kecamatan</Label>
                      <Select 
                        value={selectedKecamatanId} 
                        onValueChange={setSelectedKecamatanId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kecamatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {kecamatanList.map((kecamatan) => (
                            <SelectItem key={kecamatan.id} value={kecamatan.id}>
                              {kecamatan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="desa-name">Nama Desa</Label>
                      <Input
                        id="desa-name"
                        placeholder="Masukkan nama desa"
                        value={newDesaName}
                        onChange={(e) => setNewDesaName(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    onClick={handleAddDesa}
                    disabled={
                      createDesaMutation.isPending || 
                      !newDesaName.trim() || 
                      !selectedKecamatanId
                    }
                  >
                    {createDesaMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Desa</CardTitle>
                  <CardDescription>
                    {selectedKecamatanId 
                      ? `Menampilkan desa di kecamatan yang dipilih` 
                      : "Pilih kecamatan untuk melihat desa"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedKecamatanId ? (
                    <p className="text-muted-foreground">Pilih kecamatan terlebih dahulu</p>
                  ) : isLoadingDesa ? (
                    <p>Memuat data...</p>
                  ) : desaList && desaList.length === 0 ? (
                    <p className="text-muted-foreground">Belum ada data desa untuk kecamatan ini</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Desa</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {desaList && desaList.map((desa) => (
                          <TableRow key={desa.id}>
                            <TableCell>{desa.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{desa.id}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="nks">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah NKS Baru</CardTitle>
                  <CardDescription>Tambahkan Nomor Kode Sampel baru ke sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="kecamatan-select">Pilih Kecamatan</Label>
                      <Select 
                        value={selectedKecamatanId} 
                        onValueChange={(value) => {
                          setSelectedKecamatanId(value);
                          setSelectedDesaId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kecamatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {kecamatanList.map((kecamatan) => (
                            <SelectItem key={kecamatan.id} value={kecamatan.id}>
                              {kecamatan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="desa-select">Pilih Desa</Label>
                      <Select 
                        value={selectedDesaId} 
                        onValueChange={setSelectedDesaId}
                        disabled={!selectedKecamatanId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih desa" />
                        </SelectTrigger>
                        <SelectContent>
                          {desaList && desaList.map((desa) => (
                            <SelectItem key={desa.id} value={desa.id}>
                              {desa.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="nks-code">Kode NKS</Label>
                      <Input
                        id="nks-code"
                        placeholder="Masukkan kode NKS"
                        value={newNKSCode}
                        onChange={(e) => setNewNKSCode(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="subround-select">Pilih Subround</Label>
                      <Select 
                        value={subroundValue.toString()} 
                        onValueChange={(value) => setSubroundValue(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih subround" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Subround 1</SelectItem>
                          <SelectItem value="2">Subround 2</SelectItem>
                          <SelectItem value="3">Subround 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label className="mb-2">Nama Tanaman Palawija</Label>
                      <div className="flex flex-wrap gap-2">
                        {['jagung', 'kedelai', 'kacang_tanah', 'ubi_kayu', 'ubi_jalar'].map((komoditas) => (
                          <Badge 
                            key={komoditas} 
                            variant={selectedKomoditasList.includes(komoditas) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleKomoditasSelection(komoditas)}
                          >
                            {selectedKomoditasList.includes(komoditas) && (
                              <Check className="mr-1 h-3 w-3" />
                            )}
                            {komoditas.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="target-palawija">Target Ubinan</Label>
                      <Input
                        id="target-palawija"
                        type="number"
                        placeholder="Jumlah target palawija"
                        value={targetPalawija.toString()}
                        onChange={(e) => setTargetPalawija(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Nama Kepala Rumahtangga Sampel</Label>
                        <span className="text-sm text-muted-foreground">
                          {sampelKRTList.length} dari {targetPalawija * 2} KRT
                        </span>
                      </div>
                      
                      <div className="flex gap-2 items-end mb-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Nama KRT"
                            value={newKRTNama}
                            onChange={(e) => setNewKRTNama(e.target.value)}
                          />
                        </div>
                        
                        <div className="w-24">
                          <Select 
                            value={newKRTStatus}
                            onValueChange={(value: 'Utama' | 'Cadangan') => setNewKRTStatus(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Utama">Utama</SelectItem>
                              <SelectItem value="Cadangan">Cadangan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button type="button" onClick={handleAddKRT} size="sm">
                          <Plus className="h-4 w-4 mr-1" /> Tambah
                        </Button>
                      </div>
                      
                      {sampelKRTList.length > 0 && (
                        <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nama KRT</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px]">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sampelKRTList.map((krt, index) => (
                                <TableRow key={index}>
                                  <TableCell>{krt.nama}</TableCell>
                                  <TableCell>{krt.status}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleRemoveKRT(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    onClick={handleAddNKS}
                    disabled={
                      createNKSMutation.isPending || 
                      !newNKSCode.trim() || 
                      !selectedDesaId ||
                      selectedKomoditasList.length === 0
                    }
                  >
                    {createNKSMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Daftar NKS</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingNKSAssignments ? (
                    <p>Memuat data...</p>
                  ) : filteredNKSData.length === 0 ? (
                    <p className="text-muted-foreground">
                      {filterText ? "Tidak ada data NKS yang sesuai filter" : "Belum ada data NKS"}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kode NKS</TableHead>
                          <TableHead>Desa</TableHead>
                          <TableHead>Kecamatan</TableHead>
                          <TableHead>Subround</TableHead>
                          <TableHead>Komoditas</TableHead>
                          <TableHead>Target Ubinan</TableHead>
                          <TableHead>PPL</TableHead>
                          <TableHead>PML</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNKSData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>{item.desa?.name || '-'}</TableCell>
                            <TableCell>{item.desa?.kecamatan?.name || '-'}</TableCell>
                            <TableCell>{item.subround || '1'}</TableCell>
                            <TableCell>
                              {item.komoditas_list && Array.isArray(item.komoditas_list) && item.komoditas_list.length > 0 
                                ? item.komoditas_list.map((k: any) => k.komoditas).join(', ')
                                : '-'
                              }
                            </TableCell>
                            <TableCell>{item.target_palawija}</TableCell>
                            <TableCell>
                              {item.wilayah_tugas && Array.isArray(item.wilayah_tugas) && item.wilayah_tugas.length > 0 
                                ? (item.wilayah_tugas[0] as any)?.ppl?.name || '-'
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              {item.wilayah_tugas && Array.isArray(item.wilayah_tugas) && item.wilayah_tugas.length > 0 
                                ? (item.wilayah_tugas[0] as any)?.pml?.name || '-'
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setCurrentEditItem(item);
                                    setIsEditNKSDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteNKS(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="segmen">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah Segmen Baru</CardTitle>
                  <CardDescription>Tambahkan segmen baru ke sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="kecamatan-select">Pilih Kecamatan</Label>
                      <Select 
                        value={selectedKecamatanId} 
                        onValueChange={(value) => {
                          setSelectedKecamatanId(value);
                          setSelectedDesaId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kecamatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {kecamatanList.map((kecamatan) => (
