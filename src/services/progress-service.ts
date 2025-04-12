import { supabase } from "@/integrations/supabase/client";
import { DetailProgressData, UbinanTotals, VerificationStatusCount, PalawijaTypeCount, SubroundProgressData, PetugasPerformance } from "@/types/database-schema";

export async function getProgressDetailBySubround(subround: number, year: number = new Date().getFullYear()): Promise<DetailProgressData[]> {
  try {
    console.log(`Getting progress detail for subround: ${subround}, year: ${year}`);
    
    // Call the database function with both subround and year parameters
    const { data, error } = await supabase
      .rpc('get_ubinan_progress_detail_by_subround', { 
        subround_param: subround,
        year_param: year
      });
    
    if (error) {
      console.error("Error fetching progress detail:", error);
      return [];
    }
    
    return data as DetailProgressData[];
  } catch (error) {
    console.error("Error in getProgressDetailBySubround:", error);
    return [];
  }
}

export async function getUbinanTotalsBySubround(subround: number, year: number = new Date().getFullYear()): Promise<UbinanTotals> {
  try {
    console.log(`Getting ubinan totals for subround: ${subround}, year: ${year}`);
    
    // Call the database function with both subround and year parameters
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

export async function getPPLTargets(pplId: string): Promise<{ padi: number, palawija: number }> {
  try {
    // Get all NKS assigned to this PPL
    const { data: nksAssignments, error: nksError } = await supabase
      .from('wilayah_tugas')
      .select('nks_id, nks!inner(target_padi, target_palawija)')
      .eq('ppl_id', pplId);
      
    if (nksError) {
      console.error("Error fetching NKS assignments:", nksError);
      return { padi: 0, palawija: 0 };
    }
    
    // Get all Segmen assigned to this PPL
    const { data: segmenAssignments, error: segmenError } = await supabase
      .from('wilayah_tugas_segmen')
      .select('segmen_id, segmen!inner(target_padi)')
      .eq('ppl_id', pplId);
      
    if (segmenError) {
      console.error("Error fetching Segmen assignments:", segmenError);
      return { padi: 0, palawija: 0 };
    }
    
    // Calculate total targets
    const padiTarget = segmenAssignments.reduce((sum, item) => {
      return sum + (item.segmen?.target_padi || 0);
    }, 0);
    
    const palawijaTarget = nksAssignments.reduce((sum, item) => {
      return sum + (item.nks?.target_palawija || 0);
    }, 0);
    
    return {
      padi: padiTarget,
      palawija: palawijaTarget
    };
  } catch (error) {
    console.error("Error in getPPLTargets:", error);
    return { padi: 0, palawija: 0 };
  }
}

export async function getPPLsByPML(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('pml_id', pmlId)
      .eq('role', 'ppl');
      
    if (error) {
      console.error("Error fetching PPLs by PML:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getPPLsByPML:", error);
    return [];
  }
}

export async function filterUbinanBySubround(ubinanData: any[], subround: number) {
  if (subround === 0) return ubinanData;
  
  return ubinanData.filter(item => {
    const date = new Date(item.tanggal_ubinan);
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (subround === 1) return month >= 1 && month <= 4;
    if (subround === 2) return month >= 5 && month <= 8;
    if (subround === 3) return month >= 9 && month <= 12;
    
    return true;
  });
}

// Updated to filter by subround if provided
export async function getAllPPLPerformance(year: number = new Date().getFullYear(), subround: number = 0): Promise<PetugasPerformance[]> {
  try {
    // Get all PPL users
    const { data: pplUsers, error: pplError } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('role', 'ppl');
      
    if (pplError) {
      console.error("Error fetching PPL users:", pplError);
      return [];
    }
    
    // Get all ubinan data for calculating performance
    const { data: ubinanData, error: ubinanError } = await supabase
      .from('ubinan_data')
      .select('id, ppl_id, komoditas, status, tanggal_ubinan')
      .eq('status', 'dikonfirmasi')
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (ubinanError) {
      console.error("Error fetching ubinan data:", ubinanError);
      return [];
    }
    
    // Get all pending verification data
    const { data: pendingData, error: pendingError } = await supabase
      .from('ubinan_data')
      .select('id, ppl_id')
      .eq('status', 'sudah_diisi')
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (pendingError) {
      console.error("Error fetching pending data:", pendingError);
      return [];
    }
    
    // Get all rejected data
    const { data: rejectedData, error: rejectedError } = await supabase
      .from('ubinan_data')
      .select('id, ppl_id')
      .eq('status', 'ditolak')
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (rejectedError) {
      console.error("Error fetching rejected data:", rejectedError);
      return [];
    }
    
    // Filter data by subround if specified
    let filteredUbinanData = ubinanData;
    let filteredPendingData = pendingData;
    let filteredRejectedData = rejectedData;
    
    if (subround > 0) {
      // Filter data based on the subround (months range)
      const startMonth = (subround - 1) * 4 + 1; // 1, 5, 9
      const endMonth = subround * 4; // 4, 8, 12
      
      filteredUbinanData = ubinanData.filter(item => {
        const date = new Date(item.tanggal_ubinan);
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        return month >= startMonth && month <= endMonth;
      });
      
      filteredPendingData = pendingData.filter(item => {
        const date = new Date(item.tanggal_ubinan);
        const month = date.getMonth() + 1;
        return month >= startMonth && month <= endMonth;
      });
      
      filteredRejectedData = rejectedData.filter(item => {
        const date = new Date(item.tanggal_ubinan);
        const month = date.getMonth() + 1;
        return month >= startMonth && month <= endMonth;
      });
    }
    
    // Process performance data for each PPL
    const performances: PetugasPerformance[] = [];
    
    if (pplUsers) {
      for (const ppl of pplUsers) {
        // Get targets for this PPL
        const targets = await getPPLTargets(ppl.id);
        
        // Count completed ubinan entries by komoditas
        const completedPadi = filteredUbinanData.filter(
          item => item.ppl_id === ppl.id && item.komoditas === 'padi'
        ).length;
        
        const completedPalawija = filteredUbinanData.filter(
          item => item.ppl_id === ppl.id && item.komoditas !== 'padi'
        ).length;
        
        // Count pending verification entries
        const pendingVerification = filteredPendingData.filter(
          item => item.ppl_id === ppl.id
        ).length;
        
        // Count rejected entries
        const rejected = filteredRejectedData.filter(
          item => item.ppl_id === ppl.id
        ).length;
        
        // Calculate total and completion percentage
        const totalTarget = targets.padi + targets.palawija;
        const totalCompleted = completedPadi + completedPalawija;
        const completionPercentage = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;
        
        performances.push({
          ppl_id: ppl.id,
          ppl_name: ppl.name,
          ppl_username: ppl.username,
          padi_target: targets.padi,
          palawija_target: targets.palawija,
          padi_completed: completedPadi,
          palawija_completed: completedPalawija,
          total_target: totalTarget,
          total_completed: totalCompleted,
          completion_percentage: completionPercentage,
          pending_verification: pendingVerification,
          rejected: rejected
        });
      }
    }
    
    return performances;
  } catch (error) {
    console.error("Error in getAllPPLPerformance:", error);
    return [];
  }
}

export async function getPPLProgressByMonth(pplId: string, year: number = new Date().getFullYear()) {
  try {
    const targets = await getPPLTargets(pplId);
    const { data, error } = await supabase
      .from('ubinan_data')
      .select('*')
      .eq('ppl_id', pplId)
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (error) {
      console.error("Error fetching PPL progress:", error);
      return [];
    }
    
    // Create monthly data from fetched ubinan data
    return createProgressDataFromUbinan(data, targets.padi, targets.palawija);
  } catch (error) {
    console.error("Error in getPPLProgressByMonth:", error);
    return [];
  }
}

export async function getPMLProgressByMonth(pmlId: string, year: number = new Date().getFullYear()) {
  try {
    // Get all PPLs under this PML
    const ppls = await getPPLsByPML(pmlId);
    
    if (!ppls.length) {
      return [];
    }
    
    // Get all ubinan data for these PPLs
    const { data, error } = await supabase
      .from('ubinan_data')
      .select('*')
      .in('ppl_id', ppls.map(ppl => ppl.id))
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (error) {
      console.error("Error fetching PML progress:", error);
      return [];
    }
    
    // Calculate total targets for all PPLs
    let totalPadiTarget = 0;
    let totalPalawijaTarget = 0;
    
    for (const ppl of ppls) {
      const targets = await getPPLTargets(ppl.id);
      totalPadiTarget += targets.padi;
      totalPalawijaTarget += targets.palawija;
    }
    
    // Create monthly data from fetched ubinan data
    return createProgressDataFromUbinan(data, totalPadiTarget, totalPalawijaTarget);
  } catch (error) {
    console.error("Error in getPMLProgressByMonth:", error);
    return [];
  }
}

// Implement the missing function getProgressByPML
export async function getProgressByPML(pmlId: string) {
  try {
    // Get all PPLs under this PML
    const ppls = await getPPLsByPML(pmlId);
    
    if (!ppls.length) {
      return {
        totalPadi: 0,
        totalPalawija: 0,
        pendingVerification: 0,
        verified: 0,
        rejected: 0
      };
    }
    
    // Get all ubinan data for these PPLs
    const { data: ubinanData, error } = await supabase
      .from('ubinan_data')
      .select('*')
      .in('ppl_id', ppls.map(ppl => ppl.id));
      
    if (error) {
      console.error("Error fetching PML progress:", error);
      return {
        totalPadi: 0,
        totalPalawija: 0,
        pendingVerification: 0,
        verified: 0,
        rejected: 0
      };
    }
    
    // Count different status and types
    const pendingVerification = ubinanData.filter(item => item.status === 'sudah_diisi').length;
    const verified = ubinanData.filter(item => item.status === 'dikonfirmasi').length;
    const rejected = ubinanData.filter(item => item.status === 'ditolak').length;
    const totalPadi = ubinanData.filter(item => item.komoditas === 'padi' && item.status === 'dikonfirmasi').length;
    const totalPalawija = ubinanData.filter(item => item.komoditas !== 'padi' && item.status === 'dikonfirmasi').length;
    
    return {
      totalPadi,
      totalPalawija,
      pendingVerification,
      verified,
      rejected
    };
  } catch (error) {
    console.error("Error in getProgressByPML:", error);
    return {
      totalPadi: 0,
      totalPalawija: 0,
      pendingVerification: 0,
      verified: 0,
      rejected: 0
    };
  }
}

// Implement the missing function getUbinanDataByPML
export async function getUbinanDataByPML(pmlId: string) {
  try {
    const { data, error } = await supabase
      .from('ubinan_data')
      .select(`
        *,
        nks:nks_id(
          id, code,
          desa:desa_id(
            id, name,
            kecamatan:kecamatan_id(id, name)
          )
        ),
        segmen:segmen_id(
          id, code,
          desa:desa_id(
            id, name,
            kecamatan:kecamatan_id(id, name)
          )
        ),
        ppl:ppl_id(id, name, username)
      `)
      .eq('pml_id', pmlId);
      
    if (error) {
      console.error("Error fetching ubinan data by PML:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUbinanDataByPML:", error);
    return [];
  }
}

// Make sure other necessary functions are available
export function createProgressDataFromUbinan(
  ubinanData: any[],
  padiTarget: number,
  palawijaTarget: number
): DetailProgressData[] {
  // Initialize an array for all months
  const monthlyData: DetailProgressData[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const monthItems = ubinanData.filter(item => {
      const itemDate = new Date(item.tanggal_ubinan);
      return itemDate.getMonth() + 1 === i;
    });
    
    const padiCount = monthItems.filter(item => item.komoditas === 'padi' && item.status === 'dikonfirmasi').length;
    const palawijaCount = monthItems.filter(item => item.komoditas !== 'padi' && item.status === 'dikonfirmasi').length;
    
    // Calculate monthly target (distributed evenly across months)
    const monthlyPadiTarget = Math.ceil(padiTarget / 12);
    const monthlyPalawijaTarget = Math.ceil(palawijaTarget / 12);
    
    // Calculate percentages
    const padiPercentage = monthlyPadiTarget > 0 ? (padiCount / monthlyPadiTarget) * 100 : 0;
    const palawijaPercentage = monthlyPalawijaTarget > 0 ? (palawijaCount / monthlyPalawijaTarget) * 100 : 0;
    
    monthlyData.push({
      month: i,
      padi_count: padiCount,
      palawija_count: palawijaCount,
      padi_target: monthlyPadiTarget,
      palawija_target: monthlyPalawijaTarget,
      padi_percentage: padiPercentage,
      palawija_percentage: palawijaPercentage
    });
  }
  
  return monthlyData;
}
