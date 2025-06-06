import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUpDown, Search } from "lucide-react";
import { DetailProgressData, SubroundProgressData } from "@/types/database-schema";
import { Input } from "@/components/ui/input";

interface ProgressTableProps {
  title: string;
  description: string;
  data: DetailProgressData[];
  loading?: boolean;
  selectedYear?: number;
  selectedSubround?: number;
}

export function ProgressTable({
  title,
  description,
  data,
  loading = false,
  selectedYear,
  selectedSubround
}: ProgressTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Helper function to get month name
  const getMonthName = (monthNum: number) => {
    const months = [
      "Januari", "Februari", "Maret", "April",
      "Mei", "Juni", "Juli", "Agustus",
      "September", "Oktober", "November", "Desember"
    ];
    return months[monthNum - 1] || "";
  };

  // Get subround name from month number
  const getSubroundName = (monthNum: number): string => {
    if (monthNum >= 1 && monthNum <= 4) return "Subround 1";
    if (monthNum >= 5 && monthNum <= 8) return "Subround 2";
    if (monthNum >= 9 && monthNum <= 12) return "Subround 3";
    return "Unknown";
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

  // Helper function to get either the old or new property name
  const getPadiCount = (item: DetailProgressData): number => {
    return item.padi_count !== undefined ? item.padi_count : item.totalPadi;
  };

  const getPalawijaCount = (item: DetailProgressData): number => {
    return item.palawija_count !== undefined ? item.palawija_count : item.totalPalawija;
  };

  const getPadiTarget = (item: DetailProgressData): number => {
    return item.padi_target !== undefined ? item.padi_target : item.padiTarget;
  };

  const getPalawijaTarget = (item: DetailProgressData): number => {
    return item.palawija_target !== undefined ? item.palawija_target : item.palawijaTarget;
  };

  // Sort function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Group data by subround
  const groupBySubround = (data: DetailProgressData[]): SubroundProgressData[] => {
    // Initialize subround data
    const subrounds: { [key: string]: SubroundProgressData } = {
      "1": {
        subround: 1,
        subround_name: "Subround 1 (Jan-Apr)",
        padi_count: 0,
        palawija_count: 0,
        padi_target: 0,
        palawija_target: 0,
        padi_percentage: 0,
        palawija_percentage: 0,
      },
      "2": {
        subround: 2,
        subround_name: "Subround 2 (May-Aug)",
        padi_count: 0,
        palawija_count: 0,
        padi_target: 0,
        palawija_target: 0,
        padi_percentage: 0,
        palawija_percentage: 0,
      },
      "3": {
        subround: 3,
        subround_name: "Subround 3 (Sep-Dec)",
        padi_count: 0,
        palawija_count: 0,
        padi_target: 0,
        palawija_target: 0,
        padi_percentage: 0,
        palawija_percentage: 0,
      }
    };

    // Calculate subround data from monthly data
    data.forEach(monthData => {
      let subroundNum = 1;
      if (monthData.month >= 5 && monthData.month <= 8) subroundNum = 2;
      if (monthData.month >= 9) subroundNum = 3;

      subrounds[subroundNum].padi_count += getPadiCount(monthData);
      subrounds[subroundNum].palawija_count += getPalawijaCount(monthData);
      
      // Only add targets for the corresponding subround months
      // This fixes the issue where targets were being shown incorrectly
      subrounds[subroundNum].padi_target += getPadiTarget(monthData);
      subrounds[subroundNum].palawija_target += getPalawijaTarget(monthData);
    });

    // Calculate percentages
    Object.values(subrounds).forEach(subround => {
      subround.padi_percentage = subround.padi_target > 0 ? (subround.padi_count / subround.padi_target) * 100 : 0;
      subround.palawija_percentage = subround.palawija_target > 0 ? (subround.palawija_count / subround.palawija_target) * 100 : 0;
    });

    return Object.values(subrounds);
  };

  // Calculate the totals for all subrounds
  const calculateTotals = (subroundsData: SubroundProgressData[]): SubroundProgressData => {
    const totals: SubroundProgressData = {
      subround: 0,
      subround_name: "Total",
      padi_count: 0,
      palawija_count: 0,
      padi_target: 0,
      palawija_target: 0,
      padi_percentage: 0,
      palawija_percentage: 0,
    };

    subroundsData.forEach(subround => {
      totals.padi_count += subround.padi_count;
      totals.palawija_count += subround.palawija_count;
      totals.padi_target += subround.padi_target;
      totals.palawija_target += subround.palawija_target;
    });

    totals.padi_percentage = totals.padi_target > 0 ? (totals.padi_count / totals.padi_target) * 100 : 0;
    totals.palawija_percentage = totals.palawija_target > 0 ? (totals.palawija_count / totals.palawija_target) * 100 : 0;

    return totals;
  };

  // Group the data by subround
  const subroundData = groupBySubround(data);
  const totalsData = calculateTotals(subroundData);

  // Filter data based on search term - if we're showing monthly view
  const filteredData = selectedSubround === 0 
    ? data.filter(item => 
        getMonthName(item.month).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(getPadiTarget(item)).includes(searchTerm) ||
        String(getPalawijaTarget(item)).includes(searchTerm)
      )
    : data.filter(item => {
        // Filter data based on the selected subround
        if (selectedSubround === 1) return item.month >= 1 && item.month <= 4;
        if (selectedSubround === 2) return item.month >= 5 && item.month <= 8;
        if (selectedSubround === 3) return item.month >= 9 && item.month <= 12;
        return true;
      });

  // Sort data based on current sort settings
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'month':
        valueA = a.month;
        valueB = b.month;
        break;
      case 'padi_target':
        valueA = getPadiTarget(a);
        valueB = getPadiTarget(b);
        break;
      case 'padi_count':
        valueA = getPadiCount(a);
        valueB = getPadiCount(b);
        break;
      case 'padi_percentage':
        valueA = a.padi_percentage;
        valueB = b.padi_percentage;
        break;
      case 'palawija_target':
        valueA = getPalawijaTarget(a);
        valueB = getPalawijaTarget(b);
        break;
      case 'palawija_count':
        valueA = getPalawijaCount(a);
        valueB = getPalawijaCount(b);
        break;
      case 'palawija_percentage':
        valueA = a.palawija_percentage;
        valueB = b.palawija_percentage;
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Sort the subround data
  const sortedSubroundData = [...subroundData].sort((a, b) => {
    if (!sortColumn) return a.subround - b.subround;
    
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'subround':
        valueA = a.subround;
        valueB = b.subround;
        break;
      case 'padi_target':
        valueA = a.padi_target;
        valueB = b.padi_target;
        break;
      case 'padi_count':
        valueA = a.padi_count;
        valueB = b.padi_count;
        break;
      case 'padi_percentage':
        valueA = a.padi_percentage;
        valueB = b.padi_percentage;
        break;
      case 'palawija_target':
        valueA = a.palawija_target;
        valueB = b.palawija_target;
        break;
      case 'palawija_count':
        valueA = a.palawija_count;
        valueB = b.palawija_count;
        break;
      case 'palawija_percentage':
        valueA = a.palawija_percentage;
        valueB = b.palawija_percentage;
        break;
      default:
        return a.subround - b.subround;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
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
          <div>
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari data..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {selectedSubround === 0 ? (
                    <TableRow>
                      <TableHead 
                        onClick={() => handleSort('subround')}
                        className="cursor-pointer"
                      >
                        Subround {sortColumn === 'subround' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('padi_target')}
                        className="cursor-pointer"
                      >
                        Padi Target {sortColumn === 'padi_target' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('padi_count')}
                        className="cursor-pointer"
                      >
                        Padi Selesai {sortColumn === 'padi_count' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('padi_percentage')}
                        className="cursor-pointer"
                      >
                        % Padi {sortColumn === 'padi_percentage' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('palawija_target')}
                        className="cursor-pointer"
                      >
                        Palawija Target {sortColumn === 'palawija_target' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('palawija_count')}
                        className="cursor-pointer"
                      >
                        Palawija Selesai {sortColumn === 'palawija_count' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('palawija_percentage')}
                        className="cursor-pointer"
                      >
                        % Palawija {sortColumn === 'palawija_percentage' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableHead 
                        onClick={() => handleSort('month')}
                        className="cursor-pointer"
                      >
                        Bulan {sortColumn === 'month' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('padi_target')}
                        className="cursor-pointer"
                      >
                        Padi Target {sortColumn === 'padi_target' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('padi_count')}
                        className="cursor-pointer"
                      >
                        Padi Selesai {sortColumn === 'padi_count' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('padi_percentage')}
                        className="cursor-pointer"
                      >
                        % Padi {sortColumn === 'padi_percentage' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('palawija_target')}
                        className="cursor-pointer"
                      >
                        Palawija Target {sortColumn === 'palawija_target' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('palawija_count')}
                        className="cursor-pointer"
                      >
                        Palawija Selesai {sortColumn === 'palawija_count' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('palawija_percentage')}
                        className="cursor-pointer"
                      >
                        % Palawija {sortColumn === 'palawija_percentage' && (
                          <ArrowUpDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {selectedSubround === 0 ? (
                    // Show subround data
                    <>
                      {sortedSubroundData.map((item) => (
                        <TableRow key={item.subround}>
                          <TableCell>{item.subround_name}</TableCell>
                          <TableCell>{item.padi_target}</TableCell>
                          <TableCell>{item.padi_count}</TableCell>
                          <TableCell>
                            {renderPercentageBadge(item.padi_percentage)}
                          </TableCell>
                          <TableCell>{item.palawija_target}</TableCell>
                          <TableCell>{item.palawija_count}</TableCell>
                          <TableCell>
                            {renderPercentageBadge(item.palawija_percentage)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total row */}
                      <TableRow className="font-medium bg-muted/20 border-t-2">
                        <TableCell>{totalsData.subround_name}</TableCell>
                        <TableCell>{totalsData.padi_target}</TableCell>
                        <TableCell>{totalsData.padi_count}</TableCell>
                        <TableCell>
                          {renderPercentageBadge(totalsData.padi_percentage)}
                        </TableCell>
                        <TableCell>{totalsData.palawija_target}</TableCell>
                        <TableCell>{totalsData.palawija_count}</TableCell>
                        <TableCell>
                          {renderPercentageBadge(totalsData.palawija_percentage)}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    // Show monthly data for the selected subround
                    sortedData.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell>{getMonthName(month.month)}</TableCell>
                        <TableCell>{getPadiTarget(month)}</TableCell>
                        <TableCell>{getPadiCount(month)}</TableCell>
                        <TableCell>
                          {renderPercentageBadge(month.padi_percentage)}
                        </TableCell>
                        <TableCell>{getPalawijaTarget(month)}</TableCell>
                        <TableCell>{getPalawijaCount(month)}</TableCell>
                        <TableCell>
                          {renderPercentageBadge(month.palawija_percentage)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
