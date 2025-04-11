
import { supabase } from "@/integrations/supabase/client";
import { DetailProgressData, UbinanTotals, VerificationStatusCount, PalawijaTypeCount } from "@/types/database-schema";

export async function getProgressDetailBySubround(subround: number): Promise<DetailProgressData[]> {
  try {
    const { data, error } = await supabase.rpc('get_ubinan_progress_detail_by_subround', {
      subround_param: subround
    });
    
    if (error) {
      console.error("Error fetching progress detail:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getProgressDetailBySubround:", error);
    return [];
  }
}

export async function getUbinanTotalsBySubround(subround: number): Promise<UbinanTotals> {
  try {
    const { data, error } = await supabase.rpc('get_ubinan_totals_by_subround', {
      subround_param: subround
    });
    
    if (error) {
      console.error("Error fetching ubinan totals:", error);
      throw error;
    }
    
    return data?.[0] || {
      total_padi: 0,
      total_palawija: 0,
      padi_target: 0,
      palawija_target: 0,
      pending_verification: 0
    };
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
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getVerificationStatusCounts:", error);
    return [];
  }
}

export async function getPalawijaTypeCounts(): Promise<PalawijaTypeCount[]> {
  try {
    const { data, error } = await supabase.rpc('get_palawija_by_type');
    
    if (error) {
      console.error("Error fetching palawija type counts:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getPalawijaTypeCounts:", error);
    return [];
  }
}

export async function getUbinanDataByPPL(pplId: string) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(*),
        segmen:segmen_id(*)
      `)
      .eq('ppl_id', pplId);
      
    if (error) {
      console.error("Error fetching ubinan data by PPL:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getUbinanDataByPPL:", error);
    return [];
  }
}

export async function getWilayahTugasByPPL(pplId: string) {
  try {
    // Get NKS assignments
    const { data: nksData, error: nksError } = await supabase
      .from('wilayah_tugas')
      .select(`
        nks:nks_id(*),
        pml:pml_id(*)
      `)
      .eq('ppl_id', pplId);
      
    if (nksError) {
      console.error("Error fetching NKS assignments:", nksError);
      throw nksError;
    }
    
    // Get Segmen assignments
    const { data: segmenData, error: segmenError } = await supabase
      .from('wilayah_tugas_segmen')
      .select(`
        segmen:segmen_id(*),
        pml:pml_id(*)
      `)
      .eq('ppl_id', pplId);
      
    if (segmenError) {
      console.error("Error fetching Segmen assignments:", segmenError);
      throw segmenError;
    }
    
    return {
      nks: nksData || [],
      segmen: segmenData || []
    };
  } catch (error) {
    console.error("Error in getWilayahTugasByPPL:", error);
    return {
      nks: [],
      segmen: []
    };
  }
}

export async function getPPLTargets(pplId: string) {
  try {
    const wilayahTugas = await getWilayahTugasByPPL(pplId);
    
    let totalPadiTarget = 0;
    let totalPalawijaTarget = 0;
    
    // Calculate targets from NKS
    wilayahTugas.nks.forEach(item => {
      if (item.nks && typeof item.nks.target_palawija === 'number') {
        totalPalawijaTarget += item.nks.target_palawija;
      }
    });
    
    // Calculate targets from Segmen
    wilayahTugas.segmen.forEach(item => {
      if (item.segmen && typeof item.segmen.target_padi === 'number') {
        totalPadiTarget += item.segmen.target_padi;
      }
    });
    
    return {
      padi: totalPadiTarget,
      palawija: totalPalawijaTarget
    };
  } catch (error) {
    console.error("Error in getPPLTargets:", error);
    return {
      padi: 0,
      palawija: 0
    };
  }
}

export async function getAllPPLProgress(year: number) {
  try {
    // Get all PPL users
    const { data: pplUsers, error: pplError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'ppl');
      
    if (pplError) {
      console.error("Error fetching PPL users:", pplError);
      throw pplError;
    }
    
    // Get all ubinan data
    const { data: ubinanData, error: ubinanError } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        ppl:ppl_id(*)
      `)
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (ubinanError) {
      console.error("Error fetching ubinan data:", ubinanError);
      throw ubinanError;
    }
    
    // Process data by PPL
    const progressByPPL = {};
    
    if (pplUsers) {
      for (const ppl of pplUsers) {
        const pplUbinanData = ubinanData?.filter(item => item.ppl_id === ppl.id) || [];
        const targets = await getPPLTargets(ppl.id);
        
        progressByPPL[ppl.id] = {
          ppl,
          ubinanData: pplUbinanData,
          targets
        };
      }
    }
    
    return progressByPPL;
  } catch (error) {
    console.error("Error in getAllPPLProgress:", error);
    return {};
  }
}
