
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Search, X, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getProgressData, getProgressStatistics } from "@/services/progress-service";

export default function ProgressPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch progress data
  const { data: rawProgressData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['progress_data', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id || !user?.role) return [];
      return await getProgressData(user.id, user.role);
    },
    enabled: !!user?.id && !!user?.role
  });
  
  // Get statistics from raw data
  const kecamatanStats = getProgressStatistics(rawProgressData);
  
  // Filter kecamatan stats based on search term
  const filteredStats = kecamatanStats.filter(kecamatan => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    if (kecamatan.name.toLowerCase().includes(searchLower)) return true;
    
    // Check if any desa matches the search
    return kecamatan.desas.some((desa: any) => 
      desa.name.toLowerCase().includes(searchLower) || 
      (desa.ppl_name && desa.ppl_name.toLowerCase().includes(searchLower))
    );
  });
  
  // Get status badge for a desa
  const getStatusBadge = (status: string, verificationStatus: string) => {
    if (verificationStatus === "approved") {
      return <Badge className="bg-green-500">Disetujui</Badge>;
    } else if (verificationStatus === "rejected") {
      return <Badge className="bg-red-500">Ditolak</Badge>;
    } else if (status === "selesai") {
      return <Badge className="bg-orange-500">Menunggu Verifikasi</Badge>;
    } else if (status === "proses") {
      return <Badge className="bg-blue-500">Sedang Dikerjakan</Badge>;
    } else {
      return <Badge className="bg-gray-500">Belum Dikerjakan</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">Silakan login terlebih dahulu</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-500 mb-4">Terjadi kesalahan saat memuat data progress</p>
            <Button onClick={() => refetch()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Pendataan Desa</h1>
          <p className="text-gray-500">Monitoring progress pendataan desa</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()} 
          disabled={isLoading}
          className="mt-2 md:mt-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh Data
        </Button>
      </div>
      
      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Cari berdasarkan nama kecamatan, desa atau petugas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-xl"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-gray-500">Memuat data progress...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredStats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
            <h2 className="text-xl font-medium mb-1">Tidak ada data</h2>
            <p className="text-gray-500 text-center">
              {searchTerm 
                ? "Tidak ditemukan data yang sesuai dengan pencarian" 
                : "Belum ada data progress pendataan"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredStats.map((kecamatan: any) => (
            <Card key={kecamatan.id} className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <CardTitle>{kecamatan.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {kecamatan.total} desa 
                      {kecamatan.approved > 0 && ` • ${kecamatan.approved} disetujui`}
                      {kecamatan.selesai > 0 && ` • ${kecamatan.selesai} menunggu verifikasi`}
                      {kecamatan.proses > 0 && ` • ${kecamatan.proses} sedang dikerjakan`}
                      {kecamatan.belum > 0 && ` • ${kecamatan.belum} belum dikerjakan`}
                      {kecamatan.rejected > 0 && ` • ${kecamatan.rejected} ditolak`}
                    </CardDescription>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <Badge 
                      className={
                        kecamatan.completion >= 80 
                          ? "bg-green-500" 
                          : kecamatan.completion >= 50 
                            ? "bg-orange-500" 
                            : "bg-gray-500"
                      }
                    >
                      {Math.round(kecamatan.completion)}% selesai
                    </Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="relative">
                    <Progress 
                      value={kecamatan.completion || 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="desas" className="border-b-0">
                    <AccordionTrigger className="py-2">
                      <span className="text-sm font-medium">
                        Lihat detail desa ({kecamatan.desas.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-md border overflow-hidden mt-2">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="py-2 px-4 text-left font-medium">Desa</th>
                              <th className="py-2 px-4 text-left font-medium">Petugas</th>
                              <th className="py-2 px-4 text-left font-medium">Tanggal Mulai</th>
                              <th className="py-2 px-4 text-left font-medium">Tanggal Selesai</th>
                              <th className="py-2 px-4 text-left font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kecamatan.desas.map((desa: any) => (
                              <tr key={desa.id} className="border-t">
                                <td className="py-3 px-4">{desa.name}</td>
                                <td className="py-3 px-4">{desa.ppl_name || "-"}</td>
                                <td className="py-3 px-4">{formatDate(desa.tanggal_mulai)}</td>
                                <td className="py-3 px-4">{formatDate(desa.tanggal_selesai)}</td>
                                <td className="py-3 px-4">
                                  {getStatusBadge(desa.status, desa.verification_status)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
