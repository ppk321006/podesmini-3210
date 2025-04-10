
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { FileSpreadsheet, FilePdf, ImageIcon, Download, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";
import { exportUbinanDataToExcel, exportUbinanReportToPdf, exportUbinanChartToImage } from "@/services/export-service"; 
import { toast } from "sonner";
import { format } from "date-fns";

export function ExportDataCard() {
  const [exportType, setExportType] = useState<"excel" | "pdf" | "image">("excel");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [komoditas, setKomoditas] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      if (!startDate || !endDate) {
        toast.error("Pilih rentang tanggal terlebih dahulu");
        return;
      }

      setIsLoading(true);
      
      const filename = `ubinan_${format(startDate, "yyyyMMdd")}_${format(endDate, "yyyyMMdd")}`;
      
      if (exportType === "excel") {
        const blob = await exportUbinanDataToExcel(
          startDate.toISOString().split('T')[0], 
          endDate.toISOString().split('T')[0], 
          komoditas
        );
        saveAs(blob, `${filename}.xlsx`);
        toast.success("Data Excel berhasil diunduh");
      } 
      else if (exportType === "pdf") {
        const blob = await exportUbinanReportToPdf(
          startDate.toISOString().split('T')[0], 
          endDate.toISOString().split('T')[0], 
          komoditas
        );
        saveAs(blob, `${filename}.pdf`);
        toast.success("Laporan PDF berhasil diunduh");
      }
      else if (exportType === "image") {
        const blob = await exportUbinanChartToImage(
          startDate.toISOString().split('T')[0], 
          endDate.toISOString().split('T')[0], 
          komoditas
        );
        saveAs(blob, `${filename}.png`);
        toast.success("Grafik berhasil diunduh");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ekspor Data</CardTitle>
        <CardDescription>
          Ekspor data ubinan dalam berbagai format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Format Export</label>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={exportType === "excel" ? "default" : "outline"}
              onClick={() => setExportType("excel")}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              variant={exportType === "pdf" ? "default" : "outline"}
              onClick={() => setExportType("pdf")}
              className="flex items-center gap-2"
            >
              <FilePdf className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant={exportType === "image" ? "default" : "outline"}
              onClick={() => setExportType("image")}
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Grafik
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Komoditas</label>
          <Select value={komoditas} onValueChange={setKomoditas}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih komoditas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Komoditas</SelectItem>
              <SelectItem value="padi">Padi</SelectItem>
              <SelectItem value="jagung">Jagung</SelectItem>
              <SelectItem value="kedelai">Kedelai</SelectItem>
              <SelectItem value="kacang_tanah">Kacang Tanah</SelectItem>
              <SelectItem value="ubi_kayu">Ubi Kayu</SelectItem>
              <SelectItem value="ubi_jalar">Ubi Jalar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Mulai</label>
            <DatePicker date={startDate} onSelect={setStartDate} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Akhir</label>
            <DatePicker date={endDate} onSelect={setEndDate} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleExport}
          disabled={isLoading || !startDate || !endDate}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Unduh {exportType === "excel" ? "Excel" : exportType === "pdf" ? "PDF" : "Grafik"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
