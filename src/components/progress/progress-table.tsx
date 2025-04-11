
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailProgressData } from "@/types/database-schema";

interface ProgressDataRow {
  month: number;
  komoditas: string;
  target: number;
  teralokasi: number;
  terisi: number;
  diverifikasi: number;
  ditolak: number;
  persentase: number;
}

interface ProgressTableProps {
  title: string;
  description?: string;
  data: ProgressDataRow[];
  loading?: boolean;
}

const monthNames = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember"
];

export function ProgressTable({ title, description, data, loading }: ProgressTableProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data yang tersedia
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulan</TableHead>
                  <TableHead>Komoditas</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Teralokasi</TableHead>
                  <TableHead className="text-right">Terisi</TableHead>
                  <TableHead className="text-right">Diverifikasi</TableHead>
                  <TableHead className="text-right">Ditolak</TableHead>
                  <TableHead className="text-right">Persentase Selesai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={`${row.month}-${row.komoditas}-${index}`}>
                    <TableCell>{monthNames[row.month - 1]}</TableCell>
                    <TableCell>
                      <Badge variant={row.komoditas === "Padi" ? "default" : "secondary"}>
                        {row.komoditas}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.target}</TableCell>
                    <TableCell className="text-right">{row.teralokasi}</TableCell>
                    <TableCell className="text-right">{row.terisi}</TableCell>
                    <TableCell className="text-right">{row.diverifikasi}</TableCell>
                    <TableCell className="text-right">{row.ditolak}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={
                          row.persentase >= 75 ? "default" : 
                          row.persentase >= 50 ? "secondary" :
                          row.persentase >= 25 ? "outline" : "destructive"
                        }
                        className={
                          row.persentase >= 75 ? "bg-green-500 hover:bg-green-600" :
                          row.persentase >= 50 ? "" :
                          row.persentase >= 25 ? "bg-amber-500 hover:bg-amber-600 text-white" : ""
                        }
                      >
                        {row.persentase.toFixed(1)}%
                      </Badge>
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

export function convertProgressDataToRows(data: DetailProgressData[]): ProgressDataRow[] {
  const rows: ProgressDataRow[] = [];
  
  data.forEach(item => {
    // Add row for padi
    rows.push({
      month: item.month,
      komoditas: "Padi",
      target: item.padi_target,
      teralokasi: item.padi_target, // Assuming all targets are allocated
      terisi: item.padi_count,
      diverifikasi: item.padi_count, // Simplified, actual should come from verification status
      ditolak: 0, // Would come from ditolak status
      persentase: item.padi_percentage
    });
    
    // Add row for palawija
    rows.push({
      month: item.month,
      komoditas: "Palawija",
      target: item.palawija_target,
      teralokasi: item.palawija_target, // Assuming all targets are allocated
      terisi: item.palawija_count,
      diverifikasi: item.palawija_count, // Simplified, actual should come from verification status
      ditolak: 0, // Would come from ditolak status
      persentase: item.palawija_percentage
    });
  });
  
  return rows;
}

export function createProgressDataFromUbinan(
  ubinanData: any[],
  targetPadi: number = 0,
  targetPalawija: number = 0
): ProgressDataRow[] {
  // Group data by month and komoditas
  const dataByMonthKomoditas = ubinanData.reduce((acc, item) => {
    const month = new Date(item.tanggal_ubinan).getMonth() + 1;
    const komoditas = item.komoditas === 'padi' ? 'Padi' : 'Palawija';
    
    if (!acc[`${month}-${komoditas}`]) {
      acc[`${month}-${komoditas}`] = {
        month,
        komoditas,
        terisi: 0,
        diverifikasi: 0,
        ditolak: 0
      };
    }
    
    acc[`${month}-${komoditas}`].terisi += 1;
    
    if (item.status === 'dikonfirmasi') {
      acc[`${month}-${komoditas}`].diverifikasi += 1;
    } else if (item.status === 'ditolak') {
      acc[`${month}-${komoditas}`].ditolak += 1;
    }
    
    return acc;
  }, {});
  
  // Convert to array and calculate percentages
  return Object.values(dataByMonthKomoditas).map((item: any) => {
    const target = item.komoditas === 'Padi' ? targetPadi : targetPalawija;
    const teralokasi = target; // Assuming all targets are allocated
    const persentase = target > 0 ? (item.diverifikasi / target) * 100 : 0;
    
    return {
      month: item.month,
      komoditas: item.komoditas,
      target,
      teralokasi,
      terisi: item.terisi,
      diverifikasi: item.diverifikasi,
      ditolak: item.ditolak,
      persentase
    };
  }).sort((a, b) => a.month - b.month);
}
