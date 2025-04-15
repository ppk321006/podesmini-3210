
import { supabase } from "@/integrations/supabase/client";
import { PerformanceData } from "@/types/database-schema";

export async function getAllPPLPerformance(year: number, subround: number): Promise<PerformanceData[]> {
  try {
    const { data: petugasPerformance = [], error } = await supabase.rpc('get_ppl_activity_summary', {
      year_param: year,
      subround_param: subround
    });

    if (error) {
      console.error("Error fetching PPL performance:", error);
      return [];
    }

    // Transform the data to match PerformanceData type
    return petugasPerformance.map(petugas => ({
      id: petugas.ppl_id,
      name: petugas.ppl_name,
      role: 'ppl',
      pml: petugas.pml_id ? {
        id: petugas.pml_id,
        name: petugas.pml_name
      } : undefined,
      totalPadi: petugas.padi_count,
      totalPalawija: petugas.palawija_count,
      pendingVerification: petugas.pending_count,
      verified: petugas.confirmed_count,
      rejected: petugas.rejected_count,
      month: petugas.month,
      createdAt: new Date().toISOString() // This is required by the type but not relevant for this view
    }));
  } catch (error) {
    console.error("Error in getAllPPLPerformance:", error);
    return [];
  }
}
