
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getPPLList, getPMLList, getAllocationStatus, assignPPLToNKS, removePPLAssignment } from "@/services/wilayah-api";
import { AllocationStatus, Petugas } from "@/types/database-schema";
import { Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function AlokasiPetugasPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("alokasikan");
  const [selectedPPL, setSelectedPPL] = useState<string>("");
  const [selectedPML, setSelectedPML] = useState<string>("");
  const [selectedListViewPPL, setSelectedListViewPPL] = useState<string>("");
  const [selectedAllocations, setSelectedAllocations] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "allocated" | "unallocated">("all");
  const [filterTypeNKS, setFilterTypeNKS] = useState<boolean>(true);
  const [filterTypeSegmen, setFilterTypeSegmen] = useState<boolean>(true);
  const [filterAllocated, setFilterAllocated] = useState<boolean>(true);
  const [filterUnallocated, setFilterUnallocated] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get all PPL
  const { data: pplList = [], isLoading: isLoadingPPL } = useQuery({
    queryKey: ["ppl_list"],
    queryFn: () => getPPLList(),
  });

  // Get all PML
  const { data: pmlList = [], isLoading: isLoadingPML } = useQuery({
    queryKey: ["pml_list"],
    queryFn: () => getPMLList(),
  });

  // Get allocation status
  const { 
    data: allocationStatus = [], 
    isLoading: isLoadingAllocations, 
    refetch: refetchAllocations 
  } = useQuery({
    queryKey: ["allocation_status"],
    queryFn: () => getAllocationStatus(),
  });

  // Filter allocations for the tab "Alokasikan Petugas"
  const filteredAllocations = allocationStatus.filter((item) => {
    if (filter === "allocated") return item.is_allocated;
    if (filter === "unallocated") return !item.is_allocated;
    return true;
  });

  // Filter allocations for search and filtering in the "Status Alokasi" tab
  const statusFilteredAllocations = allocationStatus.filter((item) => {
    // Apply type filter
    if (!filterTypeNKS && item.type === "nks") return false;
    if (!filterTypeSegmen && item.type === "segmen") return false;
    
    // Apply allocation status filter
    if (!filterAllocated && item.is_allocated) return false;
    if (!filterUnallocated && !item.is_allocated) return false;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(query) ||
        item.desa_name.toLowerCase().includes(query) ||
        item.kecamatan_name.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Filter allocations for the "Lihat Alokasi" tab
  const pplAllocations = allocationStatus.filter((item) => {
    if (!selectedListViewPPL) return false;
    return item.is_allocated && item.ppl_id === selectedListViewPPL;
  });

  // Assign PPL to NKS mutation
  const assignPPLMutation = useMutation({
    mutationFn: async (allocations: string[]) => {
      if (!selectedPPL || !selectedPML) {
        throw new Error("Pilih PPL dan PML terlebih dahulu");
      }

      const results = await Promise.all(
        allocations.map((allocationId) =>
          assignPPLToNKS(allocationId, selectedPPL, selectedPML)
        )
      );

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocation_status"] });
      setSelectedAllocations([]);
      toast.success("Berhasil mengalokasikan petugas");
    },
    onError: (error) => {
      console.error("Error assigning PPL:", error);
      toast.error("Gagal mengalokasikan petugas");
    },
  });

  // Remove PPL assignment mutation
  const removePPLMutation = useMutation({
    mutationFn: async (params: { allocationId: string; pplId: string }) => {
      return removePPLAssignment(params.allocationId, params.pplId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocation_status"] });
      toast.success("Berhasil menghapus alokasi petugas");
    },
    onError: (error) => {
      console.error("Error removing PPL assignment:", error);
      toast.error("Gagal menghapus alokasi petugas");
    },
  });

  // Handle selection change
  const handleSelectionChange = (allocationId: string) => {
    if (selectedAllocations.includes(allocationId)) {
      setSelectedAllocations(selectedAllocations.filter((id) => id !== allocationId));
    } else {
      setSelectedAllocations([...selectedAllocations, allocationId]);
    }
  };

  // Handle assign button click
  const handleAssign = () => {
    if (selectedAllocations.length === 0) {
      toast.error("Pilih minimal satu NKS/Segmen");
      return;
    }

    if (!selectedPPL) {
      toast.error("Pilih PPL terlebih dahulu");
      return;
    }

    if (!selectedPML) {
      toast.error("Pilih PML terlebih dahulu");
      return;
    }

    assignPPLMutation.mutate(selectedAllocations);
  };

  // Handle remove assignment
  const handleRemoveAssignment = (allocationId: string, pplId: string) => {
    removePPLMutation.mutate({ allocationId, pplId });
  };

  useEffect(() => {
    // Reset selected allocations when filter changes
    setSelectedAllocations([]);
  }, [filter]);

  // Set current user's ID as selectedPML if they are a PML
  useEffect(() => {
    if (user && user.role === "pml") {
      setSelectedPML(user.id);
    }
  }, [user]);

  // Get the PPL name by ID
  const getPPLName = (pplId: string): string => {
    const ppl = pplList.find((p) => p.id === pplId);
    return ppl ? ppl.name : "-";
  };

  // Get the PML name by ID
  const getPMLName = (pmlId: string): string => {
    const pml = pmlList.find((p) => p.id === pmlId);
    return pml ? pml.name : "-";
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Alokasi Petugas</h1>

      <Tabs defaultValue="alokasikan" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-simonita-cream mb-8">
          <TabsTrigger value="alokasikan">Alokasikan Petugas</TabsTrigger>
          <TabsTrigger value="lihat">Lihat Alokasi Petugas</TabsTrigger>
          <TabsTrigger value="status">Status Alokasi</TabsTrigger>
        </TabsList>

        {/* Alokasikan Petugas Tab */}
        <TabsContent value="alokasikan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selection Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Petugas</CardTitle>
                <CardDescription>
                  Pilih PPL dan PML yang akan dialokasikan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* PPL Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Petugas PPL
                    </label>
                    <Select
                      value={selectedPPL}
                      onValueChange={setSelectedPPL}
                      disabled={isLoadingPPL}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih PPL" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingPPL ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Memuat...</span>
                          </div>
                        ) : pplList.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">
                            Tidak ada PPL
                          </div>
                        ) : (
                          pplList.map((ppl) => (
                            <SelectItem key={ppl.id} value={ppl.id}>
                              {ppl.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* PML Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Petugas PML (Pengawas)
                    </label>
                    <Select 
                      value={selectedPML} 
                      onValueChange={setSelectedPML} 
                      disabled={isLoadingPML || (user?.role === "pml")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih PML" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingPML ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Memuat...</span>
                          </div>
                        ) : pmlList.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">
                            Tidak ada PML
                          </div>
                        ) : (
                          pmlList.map((pml) => (
                            <SelectItem key={pml.id} value={pml.id}>
                              {pml.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NKS/Segmen Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih NKS/Segmen</CardTitle>
                <CardDescription>
                  Pilih NKS atau Segmen yang akan dialokasikan ke PPL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      className="cursor-pointer" 
                      variant="outline" 
                      onClick={() => setFilter("all")}
                      style={{
                        backgroundColor: filter === "all" ? "#4a6741" : undefined,
                        color: filter === "all" ? "white" : undefined
                      }}
                    >
                      Semua Tipe
                    </Badge>
                    <Badge 
                      className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200" 
                      variant="outline" 
                      onClick={() => setFilter("allocated")}
                      style={{
                        backgroundColor: filter === "allocated" ? "#4a6741" : undefined,
                        color: filter === "allocated" ? "white" : undefined
                      }}
                    >
                      Teralokasi
                    </Badge>
                    <Badge 
                      className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200" 
                      variant="outline" 
                      onClick={() => setFilter("unallocated")}
                      style={{
                        backgroundColor: filter === "unallocated" ? "#4a6741" : undefined,
                        color: filter === "unallocated" ? "white" : undefined
                      }}
                    >
                      Belum Teralokasi
                    </Badge>
                  </div>

                  <Input
                    placeholder="Cari NKS/Segmen..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NKS/Segmen List Card */}
          <Card className="mt-6">
            <CardContent className="p-0 sm:p-6">
              {isLoadingAllocations ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2">Memuat data alokasi...</span>
                </div>
              ) : filteredAllocations.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  Tidak ada data NKS/Segmen yang sesuai filter
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-between items-center px-4 sm:px-0">
                    <span className="text-sm text-muted-foreground">
                      {selectedAllocations.length} item dipilih dari {filteredAllocations.length} total
                    </span>
                    <Button 
                      onClick={handleAssign} 
                      disabled={selectedAllocations.length === 0 || !selectedPPL || !selectedPML || assignPPLMutation.isPending}
                      className="bg-simonita-green hover:bg-simonita-green/80"
                    >
                      {assignPPLMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Alokasikan
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <div className="text-center">#</div>
                          </TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead>Desa/Kecamatan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAllocations
                          .filter(allocation => 
                            searchQuery ? 
                              allocation.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              allocation.desa_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              allocation.kecamatan_name.toLowerCase().includes(searchQuery.toLowerCase())
                              : true
                          )
                          .map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedAllocations.includes(allocation.id)}
                                onChange={() => handleSelectionChange(allocation.id)}
                                disabled={allocation.is_allocated}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-800">
                                {allocation.type === "nks" ? "NKS" : "Segmen"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{allocation.code}</TableCell>
                            <TableCell>{allocation.desa_name} / {allocation.kecamatan_name}</TableCell>
                            <TableCell>
                              {allocation.is_allocated ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Teralokasi
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100">
                                  Belum Dialokasi
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {allocation.is_allocated && allocation.ppl_id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleRemoveAssignment(allocation.id, allocation.ppl_id!)
                                  }
                                  disabled={removePPLMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lihat Alokasi Petugas Tab */}
        <TabsContent value="lihat">
          <Card>
            <CardHeader>
              <CardTitle>Alokasi Petugas PPL</CardTitle>
              <CardDescription>
                Lihat alokasi wilayah tugas untuk PPL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* PPL Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Pilih PPL
                  </label>
                  <Select
                    value={selectedListViewPPL}
                    onValueChange={setSelectedListViewPPL}
                    disabled={isLoadingPPL}
                  >
                    <SelectTrigger className="w-full md:w-80">
                      <SelectValue placeholder="Pilih PPL" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPPL ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Memuat...</span>
                        </div>
                      ) : pplList.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          Tidak ada PPL
                        </div>
                      ) : (
                        pplList.map((ppl) => (
                          <SelectItem key={ppl.id} value={ppl.id}>
                            {ppl.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Allocation List */}
                {selectedListViewPPL && (
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kode NKS</TableHead>
                          <TableHead>Desa</TableHead>
                          <TableHead>Kecamatan</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pplAllocations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                              Tidak ada data alokasi untuk PPL ini
                            </TableCell>
                          </TableRow>
                        ) : (
                          pplAllocations.map((allocation) => (
                            <TableRow key={allocation.id}>
                              <TableCell className="font-medium">{allocation.code}</TableCell>
                              <TableCell>{allocation.desa_name}</TableCell>
                              <TableCell>{allocation.kecamatan_name}</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveAssignment(allocation.id, allocation.ppl_id!)}
                                  disabled={removePPLMutation.isPending}
                                  className="flex items-center gap-1"
                                >
                                  <X className="h-4 w-4" />
                                  Hapus Alokasi
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Alokasi Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status Alokasi Wilayah</CardTitle>
              <CardDescription>
                Pantau status alokasi NKS dan Segmen ke Petugas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari berdasarkan kode, desa, atau kecamatan..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <div className="flex gap-2 items-center mr-4">
                      <Badge 
                        className="cursor-pointer" 
                        variant="outline" 
                        style={{
                          backgroundColor: filterTypeNKS && filterTypeSegmen ? "#4a6741" : undefined,
                          color: filterTypeNKS && filterTypeSegmen ? "white" : undefined
                        }}
                        onClick={() => {
                          setFilterTypeNKS(true);
                          setFilterTypeSegmen(true);
                        }}
                      >
                        Semua Tipe
                      </Badge>
                      <Badge 
                        className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200" 
                        variant="outline" 
                        style={{
                          backgroundColor: filterTypeNKS && !filterTypeSegmen ? "#4a6741" : undefined,
                          color: filterTypeNKS && !filterTypeSegmen ? "white" : undefined
                        }}
                        onClick={() => {
                          setFilterTypeNKS(true);
                          setFilterTypeSegmen(false);
                        }}
                      >
                        NKS
                      </Badge>
                      <Badge 
                        className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200" 
                        variant="outline" 
                        style={{
                          backgroundColor: !filterTypeNKS && filterTypeSegmen ? "#4a6741" : undefined,
                          color: !filterTypeNKS && filterTypeSegmen ? "white" : undefined
                        }}
                        onClick={() => {
                          setFilterTypeNKS(false);
                          setFilterTypeSegmen(true);
                        }}
                      >
                        Segmen
                      </Badge>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Badge 
                        className="cursor-pointer" 
                        variant="outline" 
                        style={{
                          backgroundColor: filterAllocated && filterUnallocated ? "#4a6741" : undefined,
                          color: filterAllocated && filterUnallocated ? "white" : undefined
                        }}
                        onClick={() => {
                          setFilterAllocated(true);
                          setFilterUnallocated(true);
                        }}
                      >
                        Semua Status
                      </Badge>
                      <Badge 
                        className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200" 
                        variant="outline" 
                        style={{
                          backgroundColor: filterAllocated && !filterUnallocated ? "#4a6741" : undefined,
                          color: filterAllocated && !filterUnallocated ? "white" : undefined
                        }}
                        onClick={() => {
                          setFilterAllocated(true);
                          setFilterUnallocated(false);
                        }}
                      >
                        Teralokasi
                      </Badge>
                      <Badge 
                        className="cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200" 
                        variant="outline" 
                        style={{
                          backgroundColor: !filterAllocated && filterUnallocated ? "#4a6741" : undefined,
                          color: !filterAllocated && filterUnallocated ? "white" : undefined
                        }}
                        onClick={() => {
                          setFilterAllocated(false);
                          setFilterUnallocated(true);
                        }}
                      >
                        Belum Dialokasi
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Allocation Status Table */}
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Desa</TableHead>
                        <TableHead>Kecamatan</TableHead>
                        <TableHead>Status Alokasi</TableHead>
                        <TableHead>PPL</TableHead>
                        <TableHead>PML</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingAllocations ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                            <span className="block mt-2">Memuat data alokasi...</span>
                          </TableCell>
                        </TableRow>
                      ) : statusFilteredAllocations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Tidak ada data alokasi yang sesuai filter
                          </TableCell>
                        </TableRow>
                      ) : (
                        statusFilteredAllocations.map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-800">
                                {allocation.type === "nks" ? "NKS" : "Segmen"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{allocation.code}</TableCell>
                            <TableCell>{allocation.desa_name}</TableCell>
                            <TableCell>{allocation.kecamatan_name}</TableCell>
                            <TableCell>
                              {allocation.is_allocated ? (
                                <div className="flex items-center">
                                  <div className="w-3 h-3 mr-2 rounded-full bg-green-500"></div>
                                  <span className="text-green-700">Teralokasi</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <div className="w-3 h-3 mr-2 rounded-full bg-red-500"></div>
                                  <span className="text-red-700">Belum Dialokasi</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {allocation.ppl_id ? getPPLName(allocation.ppl_id) : "-"}
                            </TableCell>
                            <TableCell>
                              {allocation.pml_id ? getPMLName(allocation.pml_id) : "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
