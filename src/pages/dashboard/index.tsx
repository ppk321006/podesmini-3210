import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UserRole } from "@/types/user";
import { AlertCircle, CheckCircle2, Clock, FileBarChart } from "lucide-react";

const subroundData = [
  { name: "Januari", padi: 65, palawija: 40 },
  { name: "Februari", padi: 70, palawija: 45 },
  { name: "Maret", padi: 80, palawija: 55 },
  { name: "April", padi: 90, palawija: 70 },
];

const palawijaData = [
  { name: "Jagung", target: 40, realisasi: 36 },
  { name: "Kedelai", target: 25, realisasi: 20 },
  { name: "Kacang Tanah", target: 15, realisasi: 12 },
  { name: "Ubi Kayu", target: 30, realisasi: 28 },
  { name: "Ubi Jalar", target: 20, realisasi: 18 },
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  
  const currentMonth = new Date().getMonth() + 1;
  let currentSubround = 1;
  if (currentMonth >= 5 && currentMonth <= 8) {
    currentSubround = 2;
  } else if (currentMonth >= 9) {
    currentSubround = 3;
  }
  
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Ubinan Padi</CardTitle>
              <FileBarChart className="h-4 w-4 text-simonita-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">175</div>
              <p className="text-xs text-muted-foreground">Target: 200 sampel</p>
              <Progress value={87.5} className="mt-2 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Ubinan Palawija</CardTitle>
              <FileBarChart className="h-4 w-4 text-simonita-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">114</div>
              <p className="text-xs text-muted-foreground">Target: 130 sampel</p>
              <Progress value={87.5} className="mt-2 h-2" />
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
              {currentSubround === 1 && <p className="text-xs text-muted-foreground">Januari - April</p>}
              {currentSubround === 2 && <p className="text-xs text-muted-foreground">Mei - Agustus</p>}
              {currentSubround === 3 && <p className="text-xs text-muted-foreground">September - Desember</p>}
            </CardContent>
          </Card>
        </div>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Progres Ubinan Subround {currentSubround}</CardTitle>
            <CardDescription>
              Perkembangan ubinan padi dan palawija periode {currentSubround === 1 ? "Januari-April" : currentSubround === 2 ? "Mei-Agustus" : "September-Desember"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subroundData}
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
                      data={palawijaData}
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
                <div className="grid grid-cols-3 gap-4 p-4 font-medium">
                  <div>PPL</div>
                  <div>Komoditas</div>
                  <div className="text-right">Tindakan</div>
                </div>
                <div className="divide-y">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-3 gap-4 p-4">
                      <div>PPL {i}</div>
                      <div>{i % 2 === 0 ? "Padi" : "Palawija - Jagung"}</div>
                      <div className="text-right">
                        <button className="text-sm text-blue-600 hover:underline">
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
