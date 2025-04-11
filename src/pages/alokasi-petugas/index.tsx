
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getPPLList, getPMLList, getAllocationStatus, assignPPLToNKS, removePPLAssignment } from "@/services/wilayah-api";
import { AllocationStatus, Petugas } from "@/types/database-schema";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function AlokasiPetugasPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPPL, setSelectedPPL] = useState<string>("");
  const [selectedPML, setSelectedPML] = useState<string>("");
  const [selectedAllocations, setSelectedAllocations] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "allocated" | "unallocated">("all");

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
  const { data: allocationStatus = [], isLoading: isLoadingAllocations, refetch: refetchAllocations } = useQuery({
    queryKey: ["allocation_status"],
    queryFn: () => getAllocationStatus(),
  });

  // Filter allocations
  const filteredAllocations = allocationStatus.filter((item) => {
    if (filter === "allocated") return item.is_allocated;
    if (filter === "unallocated") return !item.is_allocated;
    return true;
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

      <div className="grid grid-cols-1 gap-6">
        {/* Selection Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Petugas</CardTitle>
            <CardDescription>
              Pilih petugas yang akan dialokasikan ke NKS atau Segmen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PPL Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Pilih Petugas Pendataan Lapangan (PPL)
                </label>
                <Select
                  value={selectedPPL}
                  onValueChange={setSelectedPPL}
                  disabled={isLoadingPPL}
                >
                  <SelectTrigger>
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
                  Pilih Petugas Pemeriksa Lapangan (PML)
                </label>
                <Select 
                  value={selectedPML} 
                  onValueChange={setSelectedPML} 
                  disabled={isLoadingPML || (user?.role === "pml")}
                >
                  <SelectTrigger>
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

            {/* NKS/Segmen List Title */}
            <div className="mt-6 mb-2 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pilih NKS/Segmen</h3>

              <div className="flex items-center space-x-2">
                <label className="text-sm">Filter:</label>
                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value as "all" | "allocated" | "unallocated")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="allocated">Sudah Dialokasikan</SelectItem>
                    <SelectItem value="unallocated">Belum Dialokasikan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NKS/Segmen List Card */}
        <Card>
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
                        <TableHead>Desa</TableHead>
                        <TableHead>Kecamatan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>PPL</TableHead>
                        <TableHead>PML</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllocations.map((allocation) => (
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
                            <Badge variant="outline">
                              {allocation.type === "nks" ? "NKS" : "Segmen"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{allocation.code}</TableCell>
                          <TableCell>{allocation.desa_name}</TableCell>
                          <TableCell>{allocation.kecamatan_name}</TableCell>
                          <TableCell>
                            {allocation.is_allocated ? (
                              <Badge className="bg-green-100 text-green-800">
                                Sudah Dialokasikan
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100">
                                Belum Dialokasikan
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {allocation.ppl_id ? getPPLName(allocation.ppl_id) : "-"}
                          </TableCell>
                          <TableCell>
                            {allocation.pml_id ? getPMLName(allocation.pml_id) : "-"}
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
      </div>
    </div>
  );
}
