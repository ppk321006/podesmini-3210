
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { DownloadIcon, Loader2 } from "lucide-react";
import { exportUbinanDataToExcel, exportUbinanReportToJpeg } from "@/services/export-service";

export function ExportDataCard() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("all");
  const [subround, setSubround] = useState("all");
  const [exportType, setExportType] = useState<"excel" | "jpeg">("excel");
  const [isExporting, setIsExporting] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  
  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ];
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Check for required fields
      if (!year) {
        toast.error("Pilih tahun terlebih dahulu");
        return;
      }
      
      // At least one filter should be selected
      if (!month && !subround) {
        toast.error("Pilih bulan atau subround terlebih dahulu");
        return;
      }
      
      // Calculate date range based on selections
      let startDate = `${year}-01-01`;
      let endDate = `${year}-12-31`;
      
      // If month is selected, narrow down the date range
      if (month && month !== "all") {
        const monthNum = parseInt(month);
        startDate = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
        
        // Calculate last day of month
        const lastDay = new Date(parseInt(year), monthNum, 0).getDate();
        endDate = `${year}-${monthNum.toString().padStart(2, '0')}-${lastDay}`;
      }
      // If subround is selected, use subround date range
      else if (subround && subround !== "all") {
        switch (subround) {
          case "1": // Jan-Apr
            startDate = `${year}-01-01`;
            endDate = `${year}-04-30`;
            break;
          case "2": // May-Aug
            startDate = `${year}-05-01`;
            endDate = `${year}-08-31`;
            break;
          case "3": // Sep-Dec
            startDate = `${year}-09-01`;
            endDate = `${year}-12-31`;
            break;
        }
      }
      
      // Call the appropriate export function based on type
      if (exportType === "excel") {
        const blob = await exportUbinanDataToExcel(startDate, endDate);
        const fileName = `Data_Ubinan_${startDate}_${endDate}.xlsx`;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success("Data berhasil diekspor ke Excel");
      } else {
        const blob = await exportUbinanReportToJpeg(startDate, endDate);
        const fileName = `Laporan_Ubinan_${startDate}_${endDate}.jpeg`;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success("Data berhasil diekspor ke JPEG");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Card className="w-full col-span-full">
      <CardHeader>
        <CardTitle>Ekspor Data Ubinan</CardTitle>
        <CardDescription>
          Ekspor data ubinan berdasarkan filter yang dipilih
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="year">Tahun</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="month">Bulan</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subround">Subround</Label>
            <Select value={subround} onValueChange={setSubround}>
              <SelectTrigger id="subround">
                <SelectValue placeholder="Pilih subround" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Subround</SelectItem>
                <SelectItem value="1">Subround 1 (Jan-Apr)</SelectItem>
                <SelectItem value="2">Subround 2 (Mei-Ags)</SelectItem>
                <SelectItem value="3">Subround 3 (Sep-Des)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Format Ekspor</Label>
          <RadioGroup
            value={exportType}
            onValueChange={(value) => setExportType(value as "excel" | "jpeg")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel">Excel (.xlsx)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="jpeg" id="jpeg" />
              <Label htmlFor="jpeg">JPEG (.jpeg)</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full md:w-auto" 
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengekspor...
            </>
          ) : (
            <>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Ekspor Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
