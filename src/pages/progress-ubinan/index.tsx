
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthsIndonesia, getMonthName } from "@/lib/utils";

interface ProgressData {
  month: number;
  target_count: number;
  completed_count: number;
  verified_count: number;
  rejected_count: number;
  completion_percentage: number;
}

interface YearOption {
  value: number;
  label: string;
}

export default function ProgressUbinanPage() {
  const currentYear = new Date().getFullYear();
  const yearOptions: YearOption[] = [
    { value: currentYear, label: currentYear.toString() },
    { value: currentYear - 1, label: (currentYear - 1).toString() },
    { value: currentYear - 2, label: (currentYear - 2).toString() }
  ];
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);

  useEffect(() => {
    fetchProgressData();
  }, [selectedYear]);

  const fetchProgressData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_ubinan_progress_by_year', {
        year_param: selectedYear
      });

      if (error) {
        console.error('Error fetching progress data:', error);
        return;
      }

      const formattedData = formatProgressData(data || []);
      setProgressData(formattedData);
    } catch (error) {
      console.error('Error in progress data fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatProgressData = (data: ProgressData[]) => {
    // Create data for all 12 months even if some months have no data
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNumber = i + 1;
      const existingData = data.find(item => item.month === monthNumber);
      
      return existingData || {
        month: monthNumber,
        target_count: 0,
        completed_count: 0,
        verified_count: 0,
        rejected_count: 0,
        completion_percentage: 0,
      };
    });

    return allMonths;
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number(value));
  };

  const chartData = progressData.map(item => ({
    ...item,
    name: getMonthName(item.month),
    completion: Number(item.completion_percentage.toFixed(1))
  }));

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Progress Ubinan</h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Tahun:</span>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Grafik Progress Ubinan {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer className="h-full" config={{}}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="completion" name="Persentase Selesai (%)" fill="#4299E1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target_count" name="Target" fill="#48BB78" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed_count" name="Terisi" fill="#ECC94B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="verified_count" name="Diverifikasi" fill="#38B2AC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Data Progress Ubinan {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bulan</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">Terisi</TableHead>
                    <TableHead className="text-right">Diverifikasi</TableHead>
                    <TableHead className="text-right">Ditolak</TableHead>
                    <TableHead className="text-right">Persentase Selesai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {progressData.map((item) => (
                    <TableRow key={item.month}>
                      <TableCell className="font-medium">{getMonthName(item.month)}</TableCell>
                      <TableCell className="text-right">{item.target_count}</TableCell>
                      <TableCell className="text-right">{item.completed_count}</TableCell>
                      <TableCell className="text-right">{item.verified_count}</TableCell>
                      <TableCell className="text-right">{item.rejected_count}</TableCell>
                      <TableCell className="text-right">{item.completion_percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
