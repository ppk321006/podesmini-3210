
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/user";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    // In a real app, you would save this data to the database
    toast.success("Profil berhasil diperbarui");
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak sama");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru harus minimal 6 karakter");
      return;
    }

    // In a real app, you would verify current password and update to new password
    toast.success("Password berhasil diperbarui");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const getUserRoleLabel = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrator";
      case UserRole.PML:
        return "Pengawas Lapangan";
      case UserRole.PPL:
        return "Petugas Lapangan";
      case UserRole.VIEWER:
        return "Pengamat";
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Anda belum login. Silakan login untuk melihat profil.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Profil Pengguna</h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>Lihat dan perbarui informasi profil Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.username}</p>
              </div>
              <Badge>{getUserRoleLabel(user.role)}</Badge>
            </div>

            <Separator />

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Username tidak dapat diubah
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name || "");
                      setUsername(user.username || "");
                    }}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleSaveProfile}>Simpan</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-1">
                  <Label className="text-muted-foreground text-sm">Nama Lengkap</Label>
                  <p>{user.name}</p>
                </div>
                <div className="grid gap-1">
                  <Label className="text-muted-foreground text-sm">Username</Label>
                  <p>{user.username}</p>
                </div>
                <div className="grid gap-1">
                  <Label className="text-muted-foreground text-sm">Peran</Label>
                  <p>{getUserRoleLabel(user.role)}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profil
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
            <CardDescription>Perbarui password Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Password Saat Ini</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Perbarui Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
