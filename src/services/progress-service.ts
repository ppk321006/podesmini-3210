
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

export interface ProgressData {
  desa_id: string;
  desa_name: string;
  kecamatan_id: string;
  kecamatan_name: string;
  ppl_id: string | null;
  ppl_name: string | null;
  pml_id: string | null;
  pml_name: string | null;
  status: string;
  verification_status: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
}

export async function getProgressData(userId: string, userRole: string) {
  try {
    // Use the same dashboard data function that filters by role
    const { data, error } = await supabase.rpc('get_dashboard_data', {
      user_role: userRole.toLowerCase(),
      user_id: userId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching progress data:", error);
    throw error;
  }
}

export function getProgressStatistics(data: ProgressData[]) {
  const kecamatanStats = new Map();
  
  // First pass: prepare kecamatan structure
  data.forEach(item => {
    if (!item.kecamatan_id) return;
    
    if (!kecamatanStats.has(item.kecamatan_id)) {
      kecamatanStats.set(item.kecamatan_id, {
        id: item.kecamatan_id,
        name: item.kecamatan_name,
        total: 0,
        belum: 0,
        proses: 0,
        selesai: 0,
        approved: 0,
        rejected: 0,
        desas: []
      });
    }
    
    const kecStat = kecamatanStats.get(item.kecamatan_id);
    kecStat.total += 1;
    
    // Calculate status counts
    if (item.verification_status === 'approved') {
      kecStat.approved += 1;
    } else if (item.verification_status === 'rejected') {
      kecStat.rejected += 1;
    } else if (item.status === 'selesai') {
      kecStat.selesai += 1;
    } else if (item.status === 'proses') {
      kecStat.proses += 1;
    } else {
      kecStat.belum += 1;
    }
    
    // Add desa to the list
    kecStat.desas.push({
      id: item.desa_id,
      name: item.desa_name,
      status: item.status,
      verification_status: item.verification_status,
      ppl_name: item.ppl_name,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai
    });
  });
  
  // Calculate percentages and sort desas
  kecamatanStats.forEach(kecStat => {
    kecStat.completion = kecStat.total > 0 
      ? ((kecStat.approved + kecStat.selesai) / kecStat.total) * 100 
      : 0;
      
    // Sort desas by status (completed first)
    kecStat.desas.sort((a: any, b: any) => {
      const statusOrder = (s: string, v: string) => {
        if (v === 'approved') return 0;
        if (s === 'selesai') return v === 'rejected' ? 2 : 1;
        if (s === 'proses') return 3;
        return 4;
      };
      
      return statusOrder(a.status, a.verification_status) - statusOrder(b.status, b.verification_status);
    });
  });
  
  // Convert to array and sort by completion
  const result = Array.from(kecamatanStats.values()).sort((a, b) => {
    // Sort by completion (descending)
    return b.completion - a.completion;
  });
  
  return result;
}
