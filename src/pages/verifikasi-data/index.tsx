
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  getUbinanDataForVerification,
  updateUbinanVerification
} from "@/services/wilayah-api";
import { useAuth } from "@/context/auth-context";
import { Search, CheckCircle, XCircle, Clock, Loader2, Check, X } from "lucide-react";
import { formatDateToLocale } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

export default function VerifikasiDataPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // Verification dialog state
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [currentUbinanId, setCurrentUbinanId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'dikonfirmasi' | 'ditolak'>('dikonfirmasi');
  const [dokumentDiterima, setDokumentDiterima] = useState(true);
  const [komentar, setKomentar] = useState("");
  
  // Get ubinan data for verification
  const { data: ubinanData = [], isLoading: isLoadingUbinan } = useQuery({
    queryKey: ["ubinan_verification", user?.id],
    queryFn: () => user?.id ? getUbinanDataForVerification(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
  
  // Verify ubinan data mutation
  const verifyUbinanMutation = useMutation({
    mutationFn: (values: { 
      id: string;
      status: 'dikonfirmasi' | 'ditolak';
      dokumenDiterima: boolean;
      komentar: string;
    }) => updateUbinanVerification(
      values.id,
      values.status,
      values.dokumenDiterima,
      values.komentar
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ubinan_verification", user?.id] });
      resetVerificationForm();
      toast.success("Verifikasi data ubinan berhasil disimpan");
    },
    onError: (error) => {
      console.error("Error verifying ubinan data:", error);
      toast.error("Gagal menyimpan verifikasi");
    }
  });
  
  // Reset verification form
  const resetVerificationForm = () => {
    setCurrentUbinanId(null);
    setVerificationStatus('dikonfirmasi');
    setDokumentDiterima(true);
    setKomentar("");
    setIsVerifyDialogOpen(false);
  };
  
  // Handle verify button click
  const handleVerifyClick = (ubinanId: string) => {
    setCurrentUbinanId(ubinanId);
    setIsVerifyDialogOpen(true);
  };
  
  // Handle verification submit
  const handleVerificationSubmit = () => {
    if (!currentUbinanId) return;
    
    verifyUbinanMutation.mutate({
      id: currentUbinanId,
      status: verificationStatus,
      dokumenDiterima,
      komentar,
    });
  };
  
  // Filter ubinan data
  const filteredUbinanData = ubinanData.filter(item => {
    const searchMatch = 
      item.responden_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.komoditas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nks?.code && item.nks.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.ppl?.name && item.ppl.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const statusMatch = filterStatus === null || item.status === filterStatus;
    
    return searchMatch && statusMatch;
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Data Ubinan</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daftar Data Ubinan</CardTitle>
          <CardDescription>
            Data ubinan yang memerlukan verifikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama responden, komoditas, kode NKS, atau nama PPL"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={filterStatus === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilterStatus(null)}
              >
                Semua Status
              </Badge>
              <Badge 
                variant={filterStatus === "sudah_diisi" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilterStatus("sudah_diisi")}
              >
                <Clock className="mr-1 h-3 w-3" /> Menunggu Verifikasi
              </Badge>
              <Badge 
                variant={filterStatus === "dikonfirmasi" ? "default" : "outline"}
                className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
                onClick={() => setFilterStatus("dikonfirmasi")}
              >
                <CheckCircle className="mr-1 h-3 w-3" /> Dikonfirmasi
              </Badge>
              <Badge 
                variant={filterStatus === "ditolak" ? "default" : "outline"}
                className="cursor-pointer bg-red-100 text-red-800 hover:bg-red-200"
                onClick={() => setFilterStatus("ditolak")}
              >
                <XCircle className="mr-1 h-3 w-3" /> Ditolak
              </Badge>
            </div>
            
            {isLoadingUbinan ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2">Memuat data ubinan...</span>
              </div>
            ) : filteredUbinanData.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                Tidak ada data ubinan yang sesuai dengan filter
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Komoditas</TableHead>
                      <TableHead>PPL</TableHead>
                      <TableHead>NKS</TableHead>
                      <TableHead>Responden</TableHead>
                      <TableHead>Hasil (kg)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUbinanData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDateToLocale(item.tanggal_ubinan)}</TableCell>
                        <TableCell>{item.komoditas.replace("_", " ")}</TableCell>
                        <TableCell>{item.ppl?.name || "-"}</TableCell>
                        <TableCell>{item.nks?.code || "-"}</TableCell>
                        <TableCell>{item.responden_name}</TableCell>
                        <TableCell>{item.berat_hasil}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.status === "dikonfirmasi"
                                ? "bg-green-100 text-green-800"
                                : item.status === "ditolak"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {item.status === "dikonfirmasi"
                              ? "Dikonfirmasi"
                              : item.status === "ditolak"
                              ? "Ditolak"
                              : "Menunggu Verifikasi"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyClick(item.id)}
                            disabled={item.status !== "sudah_diisi"}
                          >
                            {item.status === "sudah_diisi" ? "Verifikasi" : "Lihat Detail"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verifikasi Data Ubinan</DialogTitle>
            <DialogDescription>
              Verifikasi data ubinan yang diinputkan oleh PPL
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Status Verifikasi</h3>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={verificationStatus === 'dikonfirmasi' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVerificationStatus('dikonfirmasi')}
                    className={verificationStatus === 'dikonfirmasi' ? "bg-green-600" : ""}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Konfirmasi
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={verificationStatus === 'ditolak' ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setVerificationStatus('ditolak')}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Tolak
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="dokumen"
                checked={dokumentDiterima}
                onCheckedChange={setDokumentDiterima}
              />
              <Label htmlFor="dokumen">Dokumen diterima</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="komentar">Komentar</Label>
              <Textarea
                id="komentar"
                placeholder="Masukkan komentar atau catatan verifikasi"
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batalkan</Button>
            </DialogClose>
            <Button 
              onClick={handleVerificationSubmit}
              disabled={verifyUbinanMutation.isPending}
            >
              {verifyUbinanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Verifikasi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
