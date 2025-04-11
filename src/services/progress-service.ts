
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

export async function getVerificationStatusCounts(pml_id?: string): Promise<VerificationStatusCount[]> {
  try {
    let query;
    
    if (pml_id) {
      // Get counts specific to a PML
      query = supabase
        .from('ubinan_data')
        .select('status, count', { count: 'exact' })
        .eq('pml_id', pml_id)
        .group('status');
    } else {
      // Get global counts
      query = supabase.rpc('get_verification_status_counts');
    }
    
    const { data, error } = await query;
    
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

export async function getUbinanDataByPML(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(*),
        segmen:segmen_id(*),
        ppl:ppl_id(*)
      `)
      .eq('pml_id', pmlId);
      
    if (error) {
      console.error("Error fetching ubinan data by PML:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getUbinanDataByPML:", error);
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

export async function getPPLsByPML(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('pml_id', pmlId)
      .eq('role', 'ppl');
      
    if (error) {
      console.error("Error fetching PPLs by PML:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getPPLsByPML:", error);
    return [];
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

export async function getProgressByPML(pmlId: string) {
  try {
    // Get all PPLs under this PML
    const ppls = await getPPLsByPML(pmlId);
    
    let totalPadiTarget = 0;
    let totalPalawijaTarget = 0;
    let pmlProgress = {
      totalPadi: 0,
      totalPalawija: 0,
      pendingVerification: 0,
      verified: 0,
      rejected: 0
    };
    
    // For each PPL, get their targets and progress
    for (const ppl of ppls) {
      // Get targets
      const targets = await getPPLTargets(ppl.id);
      totalPadiTarget += targets.padi;
      totalPalawijaTarget += targets.palawija;
      
      // Get ubinan data
      const ubinanData = await getUbinanDataByPPL(ppl.id);
      
      // Count by status and type
      pmlProgress.totalPadi += ubinanData.filter(item => 
        item.komoditas === 'padi' && item.status === 'dikonfirmasi').length;
      
      pmlProgress.totalPalawija += ubinanData.filter(item => 
        item.komoditas !== 'padi' && item.status === 'dikonfirmasi').length;
      
      pmlProgress.pendingVerification += ubinanData.filter(item => 
        item.status === 'sudah_diisi').length;
      
      pmlProgress.verified += ubinanData.filter(item => 
        item.status === 'dikonfirmasi').length;
      
      pmlProgress.rejected += ubinanData.filter(item => 
        item.status === 'ditolak').length;
    }
    
    return {
      ...pmlProgress,
      padiTarget: totalPadiTarget,
      palawijaTarget: totalPalawijaTarget
    };
  } catch (error) {
    console.error("Error in getProgressByPML:", error);
    return {
      totalPadi: 0,
      totalPalawija: 0,
      pendingVerification: 0,
      verified: 0,
      rejected: 0,
      padiTarget: 0,
      palawijaTarget: 0
    };
  }
}

export async function getPPLProgressByMonth(pplId: string, year: number) {
  try {
    const targets = await getPPLTargets(pplId);
    const { data, error } = await supabase
      .from('ubinan_data')
      .select('*')
      .eq('ppl_id', pplId)
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (error) {
      throw error;
    }
    
    // Initialize monthly data
    const monthlyData = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthItems = data?.filter(item => {
        const itemDate = new Date(item.tanggal_ubinan);
        return itemDate.getMonth() + 1 === month;
      }) || [];
      
      const padiCount = monthItems.filter(item => 
        item.komoditas === 'padi' && item.status === 'dikonfirmasi'
      ).length;
      
      const palawijaCount = monthItems.filter(item => 
        item.komoditas !== 'padi' && item.status === 'dikonfirmasi'
      ).length;
      
      // Calculate monthly targets (distributed evenly across months)
      const monthlyPadiTarget = Math.ceil(targets.padi / 12);
      const monthlyPalawijaTarget = Math.ceil(targets.palawija / 12);
      
      // Calculate percentages
      const padiPercentage = monthlyPadiTarget > 0 ? 
        (padiCount / monthlyPadiTarget) * 100 : 0;
      
      const palawijaPercentage = monthlyPalawijaTarget > 0 ? 
        (palawijaCount / monthlyPalawijaTarget) * 100 : 0;
      
      monthlyData.push({
        month,
        padi_count: padiCount,
        palawija_count: palawijaCount,
        padi_target: monthlyPadiTarget,
        palawija_target: monthlyPalawijaTarget,
        padi_percentage: padiPercentage,
        palawija_percentage: palawijaPercentage
      });
    }
    
    return monthlyData;
  } catch (error) {
    console.error("Error in getPPLProgressByMonth:", error);
    return [];
  }
}

export async function getPMLProgressByMonth(pmlId: string, year: number) {
  try {
    // Get all PPLs under this PML
    const ppls = await getPPLsByPML(pmlId);
    
    // Initialize monthly data with zeros
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      padi_count: 0,
      palawija_count: 0,
      padi_target: 0,
      palawija_target: 0,
      padi_percentage: 0,
      palawija_percentage: 0
    }));
    
    // For each PPL, get their monthly progress and add to the total
    for (const ppl of ppls) {
      const pplMonthlyData = await getPPLProgressByMonth(ppl.id, year);
      
      // Add this PPL's data to the total
      pplMonthlyData.forEach((monthData, index) => {
        monthlyData[index].padi_count += monthData.padi_count;
        monthlyData[index].palawija_count += monthData.palawija_count;
        monthlyData[index].padi_target += monthData.padi_target;
        monthlyData[index].palawija_target += monthData.palawija_target;
      });
    }
    
    // Recalculate percentages
    monthlyData.forEach(data => {
      data.padi_percentage = data.padi_target > 0 ? 
        (data.padi_count / data.padi_target) * 100 : 0;
      
      data.palawija_percentage = data.palawija_target > 0 ? 
        (data.palawija_count / data.palawija_target) * 100 : 0;
    });
    
    return monthlyData;
  } catch (error) {
    console.error("Error in getPMLProgressByMonth:", error);
    return [];
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
