
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";
import { PetugasPerformance } from "@/types/database-schema";

interface PerformanceTableProps {
  data: PetugasPerformance[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortColumn: string;
  setSortColumn: (column: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
}

export const PerformanceTable = ({ 
  data, 
  isLoading, 
  searchTerm, 
  setSearchTerm, 
  sortColumn, 
  setSortColumn, 
  sortDirection, 
  setSortDirection 
}: PerformanceTableProps) => {
  
  const [filteredData, setFilteredData] = useState<PetugasPerformance[]>([]);
  
  // Handle sorting functionality
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
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
  
  // Filter and sort data
  useEffect(() => {
    // Filter data based on search term
    const filtered = data.filter(item => 
      item.ppl_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ppl_username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort data based on current sort settings
    const sorted = [...filtered].sort((a, b) => {
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
    
    setFilteredData(sorted);
  }, [data, searchTerm, sortColumn, sortDirection]);
  
  return (
    <div>
      <div className="relative flex-1 mb-4">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari petugas..."
          className="pl-8 w-full md:w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
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
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    Tidak ada data petugas yang tersedia
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
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
    </div>
  );
};
