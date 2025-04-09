
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  getKecamatanList, 
  createKecamatan,
  getDesaList,
  createDesa,
  getNKSList,
  createNKS
} from "@/services/wilayah-api";

export default function WilayahPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("kecamatan");
  
  // Kecamatan states and queries
  const [newKecamatanName, setNewKecamatanName] = useState("");
  
  const { data: kecamatanList = [], isLoading: isLoadingKecamatan } = useQuery({
    queryKey: ["kecamatan"],
    queryFn: getKecamatanList,
  });
  
  const createKecamatanMutation = useMutation({
    mutationFn: createKecamatan,
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
  
  // Desa states and queries
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");
  const [newDesaName, setNewDesaName] = useState("");
  
  const { data: desaList = [], isLoading: isLoadingDesa } = useQuery({
    queryKey: ["desa", selectedKecamatanId],
    queryFn: () => getDesaList(selectedKecamatanId || undefined),
    enabled: activeTab === "desa",
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
  
  // NKS states and queries
  const [selectedDesaId, setSelectedDesaId] = useState("");
  const [newNKSCode, setNewNKSCode] = useState("");
  const [targetPadi, setTargetPadi] = useState(0);
  const [targetPalawija, setTargetPalawija] = useState(0);
  
  const { data: nksList = [], isLoading: isLoadingNKS } = useQuery({
    queryKey: ["nks", selectedDesaId],
    queryFn: () => getNKSList(selectedDesaId || undefined),
    enabled: activeTab === "nks",
  });
  
  const createNKSMutation = useMutation({
    mutationFn: (values: { 
      code: string; 
      desaId: string; 
      targetPadi: number; 
      targetPalawija: number 
    }) => createNKS(
      values.code, 
      values.desaId, 
      values.targetPadi, 
      values.targetPalawija
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nks", selectedDesaId] });
      setNewNKSCode("");
      setTargetPadi(0);
      setTargetPalawija(0);
      toast.success("NKS berhasil ditambahkan");
    },
    onError: (error) => {
      console.error("Error creating NKS:", error);
      toast.error("Gagal menambahkan NKS");
    }
  });

  // Handlers
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
    
    createNKSMutation.mutate({
      code: newNKSCode,
      desaId: selectedDesaId,
      targetPadi: targetPadi,
      targetPalawija: targetPalawija
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Manajemen Wilayah</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="kecamatan">Kecamatan</TabsTrigger>
          <TabsTrigger value="desa">Desa</TabsTrigger>
          <TabsTrigger value="nks">NKS</TabsTrigger>
        </TabsList>
        
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
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left">Nama Kecamatan</th>
                          <th className="p-3 text-left">ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kecamatanList.map((kecamatan) => (
                          <tr key={kecamatan.id} className="border-t">
                            <td className="p-3">{kecamatan.name}</td>
                            <td className="p-3 text-xs text-muted-foreground">{kecamatan.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                ) : desaList.length === 0 ? (
                  <p className="text-muted-foreground">Belum ada data desa untuk kecamatan ini</p>
                ) : (
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left">Nama Desa</th>
                          <th className="p-3 text-left">ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {desaList.map((desa) => (
                          <tr key={desa.id} className="border-t">
                            <td className="p-3">{desa.name}</td>
                            <td className="p-3 text-xs text-muted-foreground">{desa.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                        {desaList.map((desa) => (
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="target-padi">Target Padi</Label>
                      <Input
                        id="target-padi"
                        type="number"
                        placeholder="Jumlah target padi"
                        value={targetPadi.toString()}
                        onChange={(e) => setTargetPadi(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="target-palawija">Target Palawija</Label>
                      <Input
                        id="target-palawija"
                        type="number"
                        placeholder="Jumlah target palawija"
                        value={targetPalawija.toString()}
                        onChange={(e) => setTargetPalawija(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  onClick={handleAddNKS}
                  disabled={
                    createNKSMutation.isPending || 
                    !newNKSCode.trim() || 
                    !selectedDesaId
                  }
                >
                  {createNKSMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Daftar NKS</CardTitle>
                <CardDescription>
                  {selectedDesaId 
                    ? `Menampilkan NKS di desa yang dipilih` 
                    : "Pilih desa untuk melihat NKS"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDesaId ? (
                  <p className="text-muted-foreground">Pilih desa terlebih dahulu</p>
                ) : isLoadingNKS ? (
                  <p>Memuat data...</p>
                ) : nksList.length === 0 ? (
                  <p className="text-muted-foreground">Belum ada data NKS untuk desa ini</p>
                ) : (
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left">Kode NKS</th>
                          <th className="p-3 text-center">Target Padi</th>
                          <th className="p-3 text-center">Target Palawija</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nksList.map((nks) => (
                          <tr key={nks.id} className="border-t">
                            <td className="p-3">{nks.code}</td>
                            <td className="p-3 text-center">{nks.target_padi}</td>
                            <td className="p-3 text-center">{nks.target_palawija}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
