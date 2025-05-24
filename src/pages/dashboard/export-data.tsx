
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Download, FileText, Image } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { exportUbinanDataToExcel, exportUbinanReportToJpeg } from "@/services/export-service";
import { saveAs } from 'file-saver';
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/user";

export default function ExportDataPage() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  // Hide export functionality for PPL and PML roles
  if (user?.role === UserRole.PPL || user?.role === UserRole.PML) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Export Data</CardTitle>
            <CardDescription>
              Fitur export data tidak tersedia untuk role Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Anda tidak memiliki akses untuk mengexport data. Silakan hubungi administrator jika Anda memerlukan data ini.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      toast.error("Silakan pilih tanggal mulai dan tanggal akhir");
      return;
    }

    if (startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
      return;
    }

    setIsExporting(true);
    try {
      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");
      
      const blob = await exportUbinanDataToExcel(startDateStr, endDateStr);
      const filename = `data-ubinan-${startDateStr}-${endDateStr}.xlsx`;
      
      saveAs(blob, filename);
      toast.success("Data berhasil diexport ke Excel");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Gagal export data ke Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Silakan pilih tanggal mulai dan tanggal akhir");
      return;
    }

    if (startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
      return;
    }

    setIsExporting(true);
    try {
      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");
      
      const blob = await exportUbinanReportToJpeg(startDateStr, endDateStr);
      const filename = `laporan-ubinan-${startDateStr}-${endDateStr}.jpg`;
      
      saveAs(blob, filename);
      toast.success("Laporan berhasil diexport");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Gagal export laporan");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Export Data Ubinan</CardTitle>
          <CardDescription>
            Export data ubinan dalam berbagai format berdasarkan periode tanggal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export Excel
                </CardTitle>
                <CardDescription>
                  Export data ubinan dalam format Excel (.xlsx)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleExportExcel}
                  disabled={isExporting || !startDate || !endDate}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Mengexport..." : "Download Excel"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Export Laporan
                </CardTitle>
                <CardDescription>
                  Export laporan ringkasan dalam format gambar (.jpg)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleExportReport}
                  disabled={isExporting || !startDate || !endDate}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Mengexport..." : "Download Laporan"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {(!startDate || !endDate) && (
            <div className="text-sm text-muted-foreground">
              Silakan pilih periode tanggal untuk mengaktifkan fitur export
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
