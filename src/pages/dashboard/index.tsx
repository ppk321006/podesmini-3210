
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Clock, CalendarClock, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { StatusPendataan } from "@/types/pendataan";

// Mock data for demonstration
const mockStatusData: StatusPendataan = {
  total: 100,
  selesai: 45,
  proses: 30,
  belum: 15,
  ditolak: 10,
  persentase_selesai: 45
};

const mockKecamatanData = [
  { name: "Majalengka", target: 25, realisasi: 15 },
  { name: "Kadipaten", target: 20, realisasi: 8 },
  { name: "Jatiwangi", target: 18, realisasi: 10 },
  { name: "Dawuan", target: 15, realisasi: 5 },
  { name: "Kertajati", target: 22, realisasi: 7 }
];

const COLORS = ["#22c55e", "#f97316", "#ef4444", "#64748b"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate the days remaining until deadline (June 30, 2025)
  const today = new Date();
  const deadline = new Date(2025, 5, 30); // Month is 0-based in JS
  const daysRemaining = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const pieData = [
    { name: "Selesai", value: mockStatusData.selesai, color: "#22c55e" },
    { name: "Proses", value: mockStatusData.proses, color: "#f97316" },
    { name: "Ditolak", value: mockStatusData.ditolak, color: "#ef4444" },
    { name: "Belum", value: mockStatusData.belum, color: "#64748b" }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Selamat datang, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-orange-100 text-orange-800 rounded-lg p-2">
          <Clock className="h-5 w-5 mr-2" />
          <span className="font-medium mr-2">Deadline:</span>
          <span>{deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="ml-2 bg-orange-200 px-2 py-0.5 rounded-full text-sm font-medium">
            {daysRemaining} hari lagi
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Desa</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStatusData.total}</div>
                <p className="text-xs text-gray-500">100%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStatusData.selesai}</div>
                <p className="text-xs text-gray-500">{mockStatusData.persentase_selesai}% dari total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
                <CalendarClock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStatusData.proses}</div>
                <p className="text-xs text-gray-500">{(mockStatusData.proses / mockStatusData.total * 100).toFixed(0)}% dari total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStatusData.ditolak}</div>
                <p className="text-xs text-gray-500">{(mockStatusData.ditolak / mockStatusData.total * 100).toFixed(0)}% dari total</p>
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart and Deadline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Status Pendataan</CardTitle>
                <CardDescription>Distribusi status pendataan desa</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} desa`, 'Jumlah']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deadline</CardTitle>
                <CardDescription>Batas waktu pendataan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Progress Keseluruhan</span>
                    <span className="text-sm font-medium">{mockStatusData.persentase_selesai}%</span>
                  </div>
                  <Progress value={mockStatusData.persentase_selesai} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CalendarClock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground">Tanggal Deadline</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Sisa Waktu</p>
                      <p className="text-sm text-orange-700">
                        {daysRemaining} hari ({Math.ceil(daysRemaining/7)} minggu)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Per Kecamatan</CardTitle>
              <CardDescription>Perbandingan target dan realisasi per kecamatan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockKecamatanData.map((kecamatan, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{kecamatan.name}</span>
                    <span className="text-sm font-medium">{kecamatan.realisasi}/{kecamatan.target} desa</span>
                  </div>
                  <div className="relative">
                    <Progress value={(kecamatan.realisasi / kecamatan.target) * 100} className="h-2" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {((kecamatan.realisasi / kecamatan.target) * 100).toFixed(0)}% selesai
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
