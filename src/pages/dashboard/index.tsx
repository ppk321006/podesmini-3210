
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { ExportDataCard } from "./export-data";
import { UserRole } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowUpDown, Search } from "lucide-react";
import { getAllPPLPerformance } from "@/services/progress-service";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("completion_percentage");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedSubround, setSelectedSubround] = useState<number>(0); // 0 = all, 1 = Jan-Apr, 2 = May-Aug, 3 = Sep-Dec
  
  // Generate years from 2025 to 2030
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  
  const { data: petugasPerformance = [], isLoading } = useQuery({
    queryKey: ['petugas_performance', selectedYear, selectedSubround],
    queryFn: () => getAllPPLPerformance(selectedYear, selectedSubround),
    enabled: !!user && user.role === UserRole.ADMIN,
  });

  // Sort function for the table
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Filter data based on search term
  const filteredData = petugasPerformance.filter(item => 
    item.ppl_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ppl_username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort data based on current sort settings
  const sortedData = [...filteredData].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'ppl_name':
        valueA = a.ppl_name;
        valueB = b.ppl_name;
        break;
      case 'total_target':
        valueA = a.total_target;
        valueB = b.total_target;
        break;
      case 'total_completed':
        valueA = a.total_completed;
        valueB = b.total_completed;
        break;
      case 'completion_percentage':
        valueA = a.completion_percentage;
        valueB = b.completion_percentage;
        break;
      case 'padi_completed':
        valueA = a.padi_completed;
        valueB = b.padi_completed;
        break;
      case 'palawija_completed':
        valueA = a.palawija_completed;
        valueB = b.palawija_completed;
        break;
      case 'pending_verification':
        valueA = a.pending_verification;
        valueB = b.pending_verification;
        break;
      case 'rejected':
        valueA = a.rejected;
        valueB = b.rejected;
        break;
      default:
        valueA = a.completion_percentage;
        valueB = b.completion_percentage;
    }
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    return sortDirection === 'asc' 
      ? (valueA as number) - (valueB as number) 
      : (valueB as number) - (valueA as number);
  });

  // Helper function to render percentage badge with color
  const renderPercentageBadge = (percentage: number) => {
    let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
    
    if (percentage >= 85) {
      variant = "default";
    } else if (percentage >= 50) {
      variant = "secondary";
    } else if (percentage > 0) {
      variant = "destructive"; 
    }
    
    return (
      <Badge variant={variant}>
        {percentage.toFixed(1)}%
      </Badge>
    );
  };

  const handleChangeYear = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  const handleChangeSubround = (value: string) => {
    setSelectedSubround(parseInt(value));
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6">
        {user?.role === UserRole.ADMIN && (
          <>
            <ExportDataCard />
            
            <Card>
              <CardHeader className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                <CardTitle>Capaian Petugas</CardTitle>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <Select value={selectedYear.toString()} onValueChange={handleChangeYear}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          Tahun {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedSubround.toString()} onValueChange={handleChangeSubround}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Pilih Subround" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Semua</SelectItem>
                      <SelectItem value="1">Subround 1</SelectItem>
                      <SelectItem value="2">Subround 2</SelectItem>
                      <SelectItem value="3">Subround 3</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari petugas..."
                      className="pl-8 md:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            onClick={() => handleSort('ppl_name')}
                            className="cursor-pointer"
                          >
                            Nama Petugas {sortColumn === 'ppl_name' && (
                              <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('total_target')}
                            className="cursor-pointer"
                          >
                            Target {sortColumn === 'total_target' && (
                              <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('total_completed')}
                            className="cursor-pointer"
                          >
                            Terverifikasi {sortColumn === 'total_completed' && (
                              <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('completion_percentage')}
                            className="cursor-pointer text-right"
                          >
                            Persentase {sortColumn === 'completion_percentage' && (
                              <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('padi_completed')}
                            className="cursor-pointer text-center"
                          >
                            Padi {sortColumn === 'padi_completed' && (
                              <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('palawija_completed')}
                            className="cursor-pointer text-center"
                          >
                            Palawija {sortColumn === 'palawija_completed' && (
                              <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('pending_verification')}
                            className="cursor-pointer text-center"
                          >
                            Pending {sortColumn === 'pending_verification' && (
                              <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('rejected')}
                            className="cursor-pointer text-center"
                          >
                            Ditolak {sortColumn === 'rejected' && (
                              <ArrowUpDown className="inline h-4 w-4 ml-1" />
                            )}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                              Tidak ada data petugas yang tersedia
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedData.map((item) => (
                            <TableRow key={item.ppl_id}>
                              <TableCell className="font-medium">{item.ppl_name}</TableCell>
                              <TableCell>{item.total_target}</TableCell>
                              <TableCell>{item.total_completed}</TableCell>
                              <TableCell className="text-right">
                                {renderPercentageBadge(item.completion_percentage)}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.padi_completed}/{item.padi_target}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.palawija_completed}/{item.palawija_target}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary">{item.pending_verification}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="destructive">{item.rejected}</Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
