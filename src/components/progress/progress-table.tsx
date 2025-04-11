
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { DetailProgressData } from "@/types/database-schema";

interface ProgressTableProps {
  title: string;
  description: string;
  data: DetailProgressData[];
  loading?: boolean;
}

export function ProgressTable({
  title,
  description,
  data,
  loading = false
}: ProgressTableProps) {
  // Helper function to get month name
  const getMonthName = (monthNum: number) => {
    const months = [
      "Januari", "Februari", "Maret", "April",
      "Mei", "Juni", "Juli", "Agustus",
      "September", "Oktober", "November", "Desember"
    ];
    return months[monthNum - 1] || "";
  };
  
  // Helper function to render percentage badge with color
  const renderPercentageBadge = (percentage: number) => {
    let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
    
    if (percentage >= 85) {
      // Use the default variant for high completion
      variant = "default";
    } else if (percentage >= 50) {
      // Use the secondary variant for medium completion
      variant = "secondary";
    } else if (percentage > 0) {
      // Use the destructive variant for low completion
      variant = "destructive"; 
    }
    
    return (
      <Badge variant={variant}>
        {percentage.toFixed(1)}%
      </Badge>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data progress yang tersedia
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulan</TableHead>
                  <TableHead>Padi Target</TableHead>
                  <TableHead>Padi Selesai</TableHead>
                  <TableHead>% Padi</TableHead>
                  <TableHead>Palawija Target</TableHead>
                  <TableHead>Palawija Selesai</TableHead>
                  <TableHead>% Palawija</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell>{getMonthName(month.month)}</TableCell>
                    <TableCell>{month.padi_target}</TableCell>
                    <TableCell>{month.padi_count}</TableCell>
                    <TableCell>
                      {renderPercentageBadge(month.padi_percentage)}
                    </TableCell>
                    <TableCell>{month.palawija_target}</TableCell>
                    <TableCell>{month.palawija_count}</TableCell>
                    <TableCell>
                      {renderPercentageBadge(month.palawija_percentage)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function createProgressDataFromUbinan(
  ubinanData: any[],
  padiTarget: number,
  palawijaTarget: number
): DetailProgressData[] {
  // Initialize an array for all months
  const monthlyData: DetailProgressData[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const monthItems = ubinanData.filter(item => {
      const itemDate = new Date(item.tanggal_ubinan);
      return itemDate.getMonth() + 1 === i;
    });
    
    const padiCount = monthItems.filter(item => item.komoditas === 'padi' && item.status === 'dikonfirmasi').length;
    const palawijaCount = monthItems.filter(item => item.komoditas !== 'padi' && item.status === 'dikonfirmasi').length;
    
    // Calculate monthly target (distributed evenly across months)
    const monthlyPadiTarget = Math.ceil(padiTarget / 12);
    const monthlyPalawijaTarget = Math.ceil(palawijaTarget / 12);
    
    // Calculate percentages
    const padiPercentage = monthlyPadiTarget > 0 ? (padiCount / monthlyPadiTarget) * 100 : 0;
    const palawijaPercentage = monthlyPalawijaTarget > 0 ? (palawijaCount / monthlyPalawijaTarget) * 100 : 0;
    
    monthlyData.push({
      month: i,
      padi_count: padiCount,
      palawija_count: palawijaCount,
      padi_target: monthlyPadiTarget,
      palawija_target: monthlyPalawijaTarget,
      padi_percentage: padiPercentage,
      palawija_percentage: palawijaPercentage
    });
  }
  
  return monthlyData;
}
