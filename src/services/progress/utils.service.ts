
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the subround number based on the month
 * Subround 1: Jan-Apr (months 1-4)
 * Subround 2: May-Aug (months 5-8)
 * Subround 3: Sep-Dec (months 9-12)
 */
export function getSubroundFromMonth(month: number): number {
  if (month >= 1 && month <= 4) {
    return 1;
  } else if (month >= 5 && month <= 8) {
    return 2;
  } else if (month >= 9 && month <= 12) {
    return 3;
  }
  return 0; // Invalid month
}

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
