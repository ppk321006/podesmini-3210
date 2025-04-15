
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getSubroundFromMonth } from "@/services/progress/utils.service";
import { Search } from "lucide-react";

export interface PerformanceData {
  id: string;
  name: string;
  role: string;
  pml?: {
    id: string;
    name: string;
  };
  totalPadi: number;
  totalPalawija: number;
  pendingVerification: number;
  verified: number;
  rejected: number;
  createdAt?: string;
  month?: number;
}

export interface PerformanceTableProps {
  title?: string;
  description?: string;
  data: PerformanceData[];
  loading?: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  sortColumn: string;
  setSortColumn: React.Dispatch<React.SetStateAction<string>>;
  sortDirection: "asc" | "desc";
  setSortDirection: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
}

export function PerformanceTable({
  title = "Performance",
  description = "Performance data for all petugas",
  data,
  loading,
  searchTerm,
  setSearchTerm,
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
}: PerformanceTableProps) {
  const [filterRole, setFilterRole] = useState("all");
  const [filterMonth, setFilterMonth] = useState("0");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter data based on role, month, and status
  const filteredData = data.filter((item) => {
    const roleMatch = filterRole === "all" || item.role === filterRole;
    
    // Filter by month if month filter is active
    let monthMatch = true;
    if (filterMonth !== "0" && item.month) {
      monthMatch = item.month === parseInt(filterMonth);
    } else if (filterMonth !== "0" && item.createdAt) {
      // If month data is not directly available but we have createdAt, extract month
      const itemDate = new Date(item.createdAt);
      monthMatch = (itemDate.getMonth() + 1) === parseInt(filterMonth);
    }
    
    // Filter by verification status
    let statusMatch = true;
    if (filterStatus === "verified" && item.verified <= 0) {
      statusMatch = false;
    } else if (filterStatus === "pending" && item.pendingVerification <= 0) {
      statusMatch = false;
    } else if (filterStatus === "rejected" && item.rejected <= 0) {
      statusMatch = false;
    }
    
    return roleMatch && monthMatch && statusMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="role-filter">Filter Petugas</Label>
            <Select
              value={filterRole}
              onValueChange={setFilterRole}
            >
              <SelectTrigger id="role-filter" className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter petugas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Petugas</SelectItem>
                <SelectItem value="ppl">PPL</SelectItem>
                <SelectItem value="pml">PML</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="month-filter">Filter Bulan</Label>
            <Select
              value={filterMonth}
              onValueChange={setFilterMonth}
            >
              <SelectTrigger id="month-filter" className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Semua Bulan</SelectItem>
                <SelectItem value="1">Januari</SelectItem>
                <SelectItem value="2">Februari</SelectItem>
                <SelectItem value="3">Maret</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">Mei</SelectItem>
                <SelectItem value="6">Juni</SelectItem>
                <SelectItem value="7">Juli</SelectItem>
                <SelectItem value="8">Agustus</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">Oktober</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">Desember</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status-filter">Filter Status</Label>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger id="status-filter" className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="verified">Terverifikasi</SelectItem>
                <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2 flex-1">
            <Label htmlFor="search">Pencarian</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama petugas..."
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Tidak ada data tersedia</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>PML</TableHead>
                  <TableHead>Subround</TableHead>
                  {filterMonth !== "0" && (
                    <TableHead>Bulan</TableHead>
                  )}
                  <TableHead>Padi</TableHead>
                  <TableHead>Palawija</TableHead>
                  <TableHead>Status Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((petugas, index) => {
                  const month = petugas.month || (petugas.createdAt ? new Date(petugas.createdAt).getMonth() + 1 : null);
                  const subround = month ? getSubroundFromMonth(month) : null;
                  
                  return (
                    <TableRow key={petugas.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{petugas.name}</TableCell>
                      <TableCell>
                        <Badge variant={petugas.role === "ppl" ? "secondary" : "outline"}>
                          {petugas.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {petugas.pml ? petugas.pml.name : "-"}
                      </TableCell>
                      <TableCell>
                        {subround ? `Subround ${subround}` : "-"}
                      </TableCell>
                      {filterMonth !== "0" && (
                        <TableCell>
                          {month ? format(new Date(2025, month - 1, 1), "MMMM", { locale: id }) : "-"}
                        </TableCell>
                      )}
                      <TableCell>
                        <span className="font-medium">{petugas.totalPadi}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{petugas.totalPalawija}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {petugas.verified > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Terverifikasi: {petugas.verified}
                            </Badge>
                          )}
                          {petugas.pendingVerification > 0 && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Menunggu: {petugas.pendingVerification}
                            </Badge>
                          )}
                          {petugas.rejected > 0 && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Ditolak: {petugas.rejected}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          Menampilkan {filteredData.length} dari {data.length} petugas
        </div>
      </CardFooter>
    </Card>
  );
}
