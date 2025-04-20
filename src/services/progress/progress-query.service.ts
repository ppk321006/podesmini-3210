import { supabase } from "@/integrations/supabase/client";
import { DetailProgressData, UbinanTotals, VerificationStatusCount, PalawijaTypeCount } from "@/types/database-schema";

export async function getProgressDetailBySubround(subround: number, year: number = new Date().getFullYear()): Promise<DetailProgressData[]> {
  try {
    console.log(`Getting progress detail for subround: ${subround}, year: ${year}`);
    
    const { data, error } = await supabase
      .rpc('get_ubinan_progress_detail_by_subround', { 
        subround_param: subround,
        year_param: year
      });
    
    if (error) {
      console.error("Error fetching progress detail:", error);
      return [];
    }
    
    return data.map((item: any) => ({
      month: item.month,
      totalPadi: item.padi_count,
      totalPalawija: item.palawija_count,
      padiTarget: item.padi_target,
      palawijaTarget: item.palawija_target,
      padi_count: item.padi_count,
      palawija_count: item.palawija_count,
      padi_target: item.padi_target,
      palawija_target: item.palawija_target,
      pendingVerification: 0,
      verified: 0,
      rejected: 0,
      padi_percentage: item.padi_percentage,
      palawija_percentage: item.palawija_percentage
    }));
  } catch (error) {
    console.error("Error in getProgressDetailBySubround:", error);
    return [];
  }
}

export async function getUbinanTotalsBySubround(subround: number, year: number = new Date().getFullYear()): Promise<UbinanTotals> {
  try {
    console.log(`Getting ubinan totals for subround: ${subround}, year: ${year}`);
    
    const { data, error } = await supabase
      .rpc('get_ubinan_totals_by_subround', { 
        subround_param: subround,
        year_param: year
      });
    
    if (error) {
      console.error("Error fetching ubinan totals:", error);
      return {
        total_padi: 0,
        total_palawija: 0,
        padi_target: 0,
        palawija_target: 0,
        pending_verification: 0
      };
    }
    
    return data[0] as UbinanTotals;
  } catch (error) {
    console.error("Error in getUbinanTotalsBySubround:", error);
    return {
      total_padi: 0,
      total_palawija: 0,
      padi_target: 0,
      palawija_target: 0,
      pending_verification: 0
    };
  }
}

export async function getVerificationStatusCounts(): Promise<VerificationStatusCount[]> {
  try {
    const { data, error } = await supabase.rpc('get_verification_status_counts');
    
    if (error) {
      console.error("Error fetching verification status counts:", error);
      return [];
    }
    
    return data as VerificationStatusCount[];
  } catch (error) {
    console.error("Error in getVerificationStatusCounts:", error);
    return [];
  }
}

export async function getPalawijaByType(): Promise<PalawijaTypeCount[]> {
  try {
    const { data, error } = await supabase.rpc('get_palawija_by_type');
    
    if (error) {
      console.error("Error fetching palawija by type:", error);
      return [];
    }
    
    return data as PalawijaTypeCount[];
  } catch (error) {
    console.error("Error in getPalawijaByType:", error);
    return [];
  }
}
