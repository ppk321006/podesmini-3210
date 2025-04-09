
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UserRole } from "@/types/user";
import { AlertCircle, CheckCircle2, Clock, FileBarChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current");
  const [currentSubround, setCurrentSubround] = useState<number>(1);
  const [progressData, setProgressData] = useState({
    padi: { target: 200, realisasi: 175 },
    palawija: { target: 130, realisasi: 114 }
  });
  
  // This would be replaced with actual data from the API in a real implementation
  const subroundData = {
    "1": [
      { name: "Januari", padi: 15, palawija: 10, padiPercent: 30, palawijaPercent: 25 },
      { name: "Februari", padi: 22, palawija: 15, padiPercent: 44, palawijaPercent: 38 },
      { name: "Maret", padi: 18, palawija: 12, padiPercent: 36, palawijaPercent: 30 },
      { name: "April", padi: 35, palawija: 20, padiPercent: 70, palawijaPercent: 50 }
    ],
    "2": [
      { name: "Mei", padi: 20, palawija: 15, padiPercent: 40, palawijaPercent: 38 },
      { name: "Juni", padi: 25, palawija: 18, padiPercent: 50, palawijaPercent: 45 },
      { name: "Juli", padi: 30, palawija: 22, padiPercent: 60, palawijaPercent: 55 },
      { name: "Agustus", padi: 35, palawija: 25, padiPercent: 70, palawijaPercent: 63 }
    ],
    "3": [
      { name: "September", padi: 18, palawija: 15, padiPercent: 36, palawijaPercent: 38 },
      { name: "Oktober", padi: 25, palawija: 20, padiPercent: 50, palawijaPercent: 50 },
      { name: "November", padi: 22, palawija: 18, padiPercent: 44, palawijaPercent: 45 },
      { name: "Desember", padi: 20, palawija: 15, padiPercent: 40, palawijaPercent: 38 }
    ],
    "year": [
      { name: "Subround 1", padi: 90, palawija: 57, padiPercent: 45, palawijaPercent: 44 },
      { name: "Subround 2", padi: 110, palawija: 80, padiPercent: 55, palawijaPercent: 62 },
      { name: "Subround 3", padi: 85, palawija: 68, padiPercent: 43, palawijaPercent: 52 }
    ]
  };

  const palawijaData = {
    "1": [
      { name: "Jagung", target: 10, realisasi: 8 },
      { name: "Kedelai", target: 8, realisasi: 6 },
      { name: "Kacang Tanah", target: 5, realisasi: 4 },
      { name: "Ubi Kayu", target: 7, realisasi: 6 },
      { name: "Ubi Jalar", target: 5, realisasi: 4 }
    ],
    "2": [
      { name: "Jagung", target: 15, realisasi: 14 },
      { name: "Kedelai", target: 10, realisasi: 8 },
      { name: "Kacang Tanah", target: 5, realisasi: 4 },
      { name: "Ubi Kayu", target: 12, realisasi: 11 },
      { name: "Ubi Jalar", target: 8, realisasi: 7 }
    ],
    "3": [
      { name: "Jagung", target: 15, realisasi: 14 },
      { name: "Kedelai", target: 7, realisasi: 6 },
      { name: "Kacang Tanah", target: 5, realisasi: 4 },
      { name: "Ubi Kayu", target: 11, realisasi: 11 },
      { name: "Ubi Jalar", target: 7, realisasi: 7 }
    ],
    "year": [
      { name: "Jagung", target: 40, realisasi: 36 },
      { name: "Kedelai", target: 25, realisasi: 20 },
      { name: "Kacang Tanah", target: 15, realisasi: 12 },
      { name: "Ubi Kayu", target: 30, realisasi: 28 },
      { name: "Ubi Jalar", target: 20, realisasi: 18 }
    ]
  };
  
  // Fetch current subround from database
  useEffect(() => {
    const fetchCurrentSubround = async () => {
      try {
        const { data, error } = await supabase.rpc('get_subround');
        if (error) throw error;
        setCurrentSubround(data || 1);
        setSelectedPeriod(String(data) || "1");
      } catch (error) {
        console.error('Error fetching current subround:', error);
      }
    };
    
    fetchCurrentSubround();
  }, []);
  
  // Update display data whenever selectedPeriod changes
  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    // For now, we'll just simulate with static data
    if (selectedPeriod === "current") {
      setSelectedPeriod(String(currentSubround));
    }
  }, [selectedPeriod, currentSubround]);
  
  // Get the appropriate data for the current period
  const getCurrentData = () => {
    return subroundData[selectedPeriod as keyof typeof subroundData] || subroundData["1"];
  };
  
  const getCurrentPalawijaData = () => {
    return palawijaData[selectedPeriod as keyof typeof palawijaData] || palawijaData["1"];
  };
  
  // Calculate progress percentage for display
  const calculateProgress = (realized: number, target: number) => {
    return target > 0 ? (realized / target) * 100 : 0;
  };
  
  // Get the appropriate label for the current subround
  const getSubroundLabel = () => {
    switch (selectedPeriod) {
      case "1": return "Januari - April";
      case "2": return "Mei - Agustus";
      case "3": return "September - Desember";
      case "year": return "Tahunan";
      default: return "Januari - April";
    }
  };
  
  const renderUserSpecificContent = () => {
    if (!isAuthenticated || !user) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/6faa01a9-cc07-4092-89f3-a6c83a2690d0.png" 
                  alt="Si Monita Logo" 
                  className="h-16 w-16"
                />
                Si Monita
              </CardTitle>
              <CardDescription>
                Sistem Informasi Monitoring Tanaman Pangan Palawija BPS Kabupaten Majalengka
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-lg font-medium text-simonita-brown">
                Silakan login untuk mengakses sistem
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tentang Si Monita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Si Monita adalah Sistem Informasi Monitoring Tanaman Pangan Palawija yang digunakan oleh BPS Kabupaten Majalengka untuk:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Memonitor progres pelaksanaan ubinan komoditas Padi dan Palawija</li>
                <li>Mengelola distribusi wilayah tugas untuk Petugas Pemeriksa Lapangan (PML) dan Petugas Pendataan Lapangan (PPL)</li>
                <li>Memberikan informasi rekap progres dalam bentuk tabel dan grafik</li>
                <li>Mempermudah pelaporan dan validasi data lapangan secara digital dan terstruktur</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    const commonContent = (
      <>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard Si Monita</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Periode:</span>
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Subround 1 (Jan-Apr)</SelectItem>
                <SelectItem value="2">Subround 2 (Mei-Agt)</SelectItem>
                <SelectItem value="3">Subround 3 (Sept-Des)</SelectItem>
                <SelectItem value="year">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Ubinan Padi</CardTitle>
              <FileBarChart className="h-4 w-4 text-simonita-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.padi.realisasi}</div>
              <p className="text-xs text-muted-foreground">Target: {progressData.padi.target} sampel</p>
              <Progress 
                value={calculateProgress(progressData.padi.realisasi, progressData.padi.target)} 
                className="mt-2 h-2" 
              />
              <p className="text-xs text-right mt-1">{calculateProgress(progressData.padi.realisasi, progressData.padi.target).toFixed(1)}%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Ubinan Palawija</CardTitle>
              <FileBarChart className="h-4 w-4 text-simonita-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.palawija.realisasi}</div>
              <p className="text-xs text-muted-foreground">Target: {progressData.palawija.target} sampel</p>
              <Progress 
                value={calculateProgress(progressData.palawija.realisasi, progressData.palawija.target)} 
                className="mt-2 h-2" 
              />
              <p className="text-xs text-right mt-1">{calculateProgress(progressData.palawija.realisasi, progressData.palawija.target).toFixed(1)}%</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Belum Diverifikasi</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Menunggu pemeriksaan PML</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Subround Aktif</CardTitle>
              <AlertCircle className="h-4 w-4 text-simonita-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentSubround}</div>
              <p className="text-xs text-muted-foreground">{getSubroundLabel()}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Progres Ubinan: Jumlah</CardTitle>
              <CardDescription>
                Perkembangan ubinan padi dan palawija {selectedPeriod === "year" ? "tahunan" : "periode " + getSubroundLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getCurrentData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="padi" fill="#4A7834" name="Padi" />
                    <Bar dataKey="palawija" fill="#FABE4C" name="Palawija" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Progres Ubinan: Persentase</CardTitle>
              <CardDescription>
                Persentase perkembangan terhadap target {selectedPeriod === "year" ? "tahunan" : "periode " + getSubroundLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getCurrentData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="padiPercent" fill="#4A7834" name="Padi %" />
                    <Bar dataKey="palawijaPercent" fill="#FABE4C" name="Palawija %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
    
    if (user.role === UserRole.ADMIN) {
      return (
        <div className="space-y-6">
          {commonContent}
          
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Realisasi Palawija</CardTitle>
                <CardDescription>Pencapaian per jenis komoditas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getCurrentPalawijaData()}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="target" fill="#4A7834" name="Target" />
                      <Bar dataKey="realisasi" fill="#FABE4C" name="Realisasi" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Verifikasi</CardTitle>
                <CardDescription>Jumlah data berdasarkan status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>Terverifikasi</span>
                  </div>
                  <span className="font-bold">266</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span>Menunggu Verifikasi</span>
                  </div>
                  <span className="font-bold">23</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Ditolak</span>
                  </div>
                  <span className="font-bold">12</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                    <span>Belum Diisi</span>
                  </div>
                  <span className="font-bold">29</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    if (user.role === UserRole.PML) {
      return (
        <div className="space-y-6">
          {commonContent}
          
          <Card>
            <CardHeader>
              <CardTitle>Data Memerlukan Verifikasi</CardTitle>
              <CardDescription>Data yang perlu diverifikasi oleh Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PPL</TableHead>
                      <TableHead>Komoditas</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell>PPL {i}</TableCell>
                        <TableCell>{i % 2 === 0 ? "Padi" : "Palawija - Jagung"}</TableCell>
                        <TableCell className="text-right">
                          <button className="text-sm text-blue-600 hover:underline">
                            Lihat Detail
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (user.role === UserRole.PPL) {
      return (
        <div className="space-y-6">
          {commonContent}
          
          <Card>
            <CardHeader>
              <CardTitle>Status Data Ubinan Anda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Terverifikasi</span>
                </div>
                <span className="font-bold">18</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span>Menunggu Verifikasi</span>
                </div>
                <span className="font-bold">3</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span>Ditolak & Perlu Diperbaiki</span>
                </div>
                <span className="font-bold">1</span>
              </div>
              
              <div className="mt-4">
                <button className="w-full bg-simonita-green text-white px-4 py-2 rounded-md hover:bg-simonita-green/90 transition-colors">
                  Input Data Baru
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {commonContent}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {renderUserSpecificContent()}
    </div>
  );
}
