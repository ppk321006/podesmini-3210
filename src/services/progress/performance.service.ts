
import { supabase } from "@/integrations/supabase/client";
import { PetugasPerformance } from "@/types/database-schema";
import { getPPLTargets } from "./petugas-progress.service";

export async function getAllPPLPerformance(year: number = new Date().getFullYear(), subround: number = 0): Promise<PetugasPerformance[]> {
  try {
    const { data: pplUsers, error: pplError } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('role', 'ppl');
      
    if (pplError) {
      console.error("Error fetching PPL users:", pplError);
      return [];
    }
    
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
    
    const { data: pendingData, error: pendingError } = await supabase
      .from('ubinan_data')
      .select('id, ppl_id, tanggal_ubinan')
      .eq('status', 'sudah_diisi')
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (pendingError) {
      console.error("Error fetching pending data:", pendingError);
      return [];
    }
    
    const { data: rejectedData, error: rejectedError } = await supabase
      .from('ubinan_data')
      .select('id, ppl_id, tanggal_ubinan')
      .eq('status', 'ditolak')
      .gte('tanggal_ubinan', `${year}-01-01`)
      .lte('tanggal_ubinan', `${year}-12-31`);
      
    if (rejectedError) {
      console.error("Error fetching rejected data:", rejectedError);
      return [];
    }
    
    let filteredUbinanData = ubinanData;
    let filteredPendingData = pendingData;
    let filteredRejectedData = rejectedData;
    
    if (subround > 0) {
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
    
    const performances: PetugasPerformance[] = [];
    
    if (pplUsers) {
      for (const ppl of pplUsers) {
        const targets = await getPPLTargets(ppl.id);
        
        const completedPadi = filteredUbinanData.filter(
          item => item.ppl_id === ppl.id && item.komoditas === 'padi'
        ).length;
        
        const completedPalawija = filteredUbinanData.filter(
          item => item.ppl_id === ppl.id && item.komoditas !== 'padi'
        ).length;
        
        const pendingVerification = filteredPendingData.filter(
          item => item.ppl_id === ppl.id
        ).length;
        
        const rejected = filteredRejectedData.filter(
          item => item.ppl_id === ppl.id
        ).length;
        
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
