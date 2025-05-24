import { supabase } from "@/integrations/supabase/client";
import { DetailProgressData } from "@/types/database-schema";

/**
 * Returns the subround number based on the month
 * Subround 1: Jan-Apr (months 1-4)
 * Subround 2: May-Aug (months 5-8)
 * Subround 3: Sep-Dec (months 9-12)
 */
export const getSubroundFromMonth = (month: number): number => {
  if (month >= 1 && month <= 4) {
    return 1;
  } else if (month >= 5 && month <= 8) {
    return 2;
  } else {
    return 3;
  }
};

/**
 * Returns the month range for a specified subround
 */
export function getMonthsForSubround(subround: number): number[] {
  if (subround === 1) {
    return [1, 2, 3, 4]; // Jan-Apr
  } else if (subround === 2) {
    return [5, 6, 7, 8]; // May-Aug
  } else if (subround === 3) {
    return [9, 10, 11, 12]; // Sep-Dec
  }
  return []; // Invalid subround
}

/**
 * Returns the current active subround based on the current month
 */
export async function getCurrentSubround(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_subround');
    
    if (error) {
      console.error("Error fetching current subround:", error);
      return getSubroundFromMonth((new Date()).getMonth() + 1);
    }
    
    return data;
  } catch (error) {
    console.error("Error in getCurrentSubround:", error);
    return getSubroundFromMonth((new Date()).getMonth() + 1);
  }
}

/**
 * Returns the subround name based on the subround number
 */
export function getSubroundName(subround: number): string {
  if (subround === 1) {
    return "Januari-April";
  } else if (subround === 2) {
    return "Mei-Agustus";
  } else if (subround === 3) {
    return "September-Desember";
  }
  return "Tidak Valid";
}

/**
 * Creates progress data from ubinan data
 */
export function createProgressDataFromUbinan(
  ubinanData: any[],
  padiTarget: number = 0,
  palawijaTarget: number = 0
): DetailProgressData[] {
  // Group data by month
  const monthlyData: { [key: number]: any } = {};
  
  // Initialize data for all months
  for (let month = 1; month <= 12; month++) {
    monthlyData[month] = {
      month,
      totalPadi: 0,
      totalPalawija: 0,
      pendingVerification: 0,
      verified: 0,
      rejected: 0,
      padiTarget,
      palawijaTarget
    };
  }
  
  // Count data by month
  ubinanData.forEach(item => {
    const date = new Date(item.tanggal_ubinan);
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (item.komoditas === 'padi') {
      monthlyData[month].totalPadi++;
    } else {
      monthlyData[month].totalPalawija++;
    }
    
    if (item.status === 'sudah_diisi') {
      monthlyData[month].pendingVerification++;
    } else if (item.status === 'dikonfirmasi') {
      monthlyData[month].verified++;
    } else if (item.status === 'ditolak') {
      monthlyData[month].rejected++;
    }
  });
  
  // Calculate percentages and convert to array
  return Object.values(monthlyData).map((item: any) => {
    // Calculate percentage based on subround to prevent double counting targets
    const currentSubround = getSubroundFromMonth(item.month);
    const monthsInSubround = getMonthsForSubround(currentSubround).length;
    
    // Only count target for the current subround
    const padiTargetForMonth = currentSubround ? padiTarget / monthsInSubround : 0;
    const palawijaTargetForMonth = currentSubround ? palawijaTarget / monthsInSubround : 0;
    
    return {
      month: item.month,
      totalPadi: item.totalPadi,
      totalPalawija: item.totalPalawija,
      pendingVerification: item.pendingVerification,
      verified: item.verified,
      rejected: item.rejected,
      padiTarget: padiTargetForMonth,
      palawijaTarget: palawijaTargetForMonth,
      padi_percentage: padiTargetForMonth > 0 ? (item.totalPadi / padiTargetForMonth) * 100 : 0,
      palawija_percentage: palawijaTargetForMonth > 0 ? (item.totalPalawija / palawijaTargetForMonth) * 100 : 0
    };
  });
}
