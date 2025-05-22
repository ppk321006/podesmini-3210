
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, AlertCircle, Info, Calendar } from "lucide-react";
import { Notifikasi } from "@/types/pendataan";

// Mock notifications data
const mockNotifications: Notifikasi[] = [
  {
    id: "1",
    user_id: "ppl-id-123",
    judul: "Data Ditolak",
    pesan: "Data pendataan desa Cijati telah ditolak. Alasan: Data penduduk tidak sesuai.",
    tipe: "error",
    dibaca: false,
    created_at: "2023-05-22T10:30:00Z",
    data: {
      pendataan_id: "pdt-123",
      desa_id: "desa-123"
    }
  },
  {
    id: "2",
    user_id: "ppl-id-123",
    judul: "Deadline Mendekat",
    pesan: "Pendataan desa Cipaku harus diselesaikan dalam 7 hari.",
    tipe: "warning",
    dibaca: false,
    created_at: "2023-05-21T08:15:00Z",
    data: {
      desa_id: "desa-456"
    }
  },
  {
    id: "3",
    user_id: "pml-id-123",
    judul: "Data Baru Dikirim",
    pesan: "Data pendataan desa Sukamaju telah dikirim dan menunggu verifikasi.",
    tipe: "info",
    dibaca: true,
    created_at: "2023-05-20T14:45:00Z",
    data: {
      pendataan_id: "pdt-456",
      desa_id: "desa-789"
    }
  },
  {
    id: "4",
    user_id: "admin-id-123",
    judul: "Data Disetujui",
    pesan: "Data pendataan desa Bojong telah disetujui.",
    tipe: "success",
    dibaca: true,
    created_at: "2023-05-19T11:20:00Z",
    data: {
      pendataan_id: "pdt-789",
      desa_id: "desa-012"
    }
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notifikasi[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");
  
  const unreadCount = notifications.filter(n => !n.dibaca).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, dibaca: true } : notif
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, dibaca: true }))
    );
  };
  
  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.dibaca);
    return notifications.filter(n => n.tipe === activeTab);
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-500">Kelola pemberitahuan sistem</p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="relative">
            Semua
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Belum Dibaca</TabsTrigger>
          <TabsTrigger value="info">Informasi</TabsTrigger>
          <TabsTrigger value="warning">Peringatan</TabsTrigger>
          <TabsTrigger value="error">Kesalahan</TabsTrigger>
          <TabsTrigger value="success">Sukses</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'Semua Notifikasi' : 
                 activeTab === 'unread' ? 'Notifikasi Belum Dibaca' :
                 activeTab === 'info' ? 'Informasi' :
                 activeTab === 'warning' ? 'Peringatan' :
                 activeTab === 'error' ? 'Kesalahan' : 'Sukses'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getFilteredNotifications().length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto" />
                  <p className="mt-2 text-gray-500">Tidak ada notifikasi</p>
                </div>
              ) : (
                getFilteredNotifications().map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border ${notification.dibaca ? 'bg-white' : 'bg-orange-50'} ${
                      !notification.dibaca ? 'border-orange-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getNotificationIcon(notification.tipe)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold">
                            {notification.judul}
                            {!notification.dibaca && (
                              <Badge className="ml-2 bg-orange-500 text-white">Baru</Badge>
                            )}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(notification.created_at)}
                            </span>
                            {!notification.dibaca && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                                className="h-7 px-2"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.pesan}</p>
                        {notification.data && notification.data.pendataan_id && (
                          <Button 
                            variant="link" 
                            className="mt-2 h-7 p-0 text-orange-600"
                            asChild
                          >
                            <a href={
                              notification.tipe === "info" ? `/verifikasi?id=${notification.data.pendataan_id}` : 
                              notification.tipe === "error" ? `/pendataan?id=${notification.data.pendataan_id}` :
                              `/dokumen/viewer/${notification.data.pendataan_id}`
                            }>
                              Lihat Detail
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
