
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

// Fetch dashboard data based on user role
export const getDashboardData = async (userId: string, userRole: string) => {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_data', {
      user_role: userRole.toLowerCase(),
      user_id: userId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Get overall statistics based on dashboard data
export const getStatisticsByDashboardData = (data: any[]) => {
  const total = data.length;
  const belum = data.filter(item => !item.status || item.status === 'belum').length;
  const proses = data.filter(item => item.status === 'proses').length;
  const selesai = data.filter(item => item.status === 'selesai').length;
  const ditolak = data.filter(item => item.verification_status === 'rejected').length;
  const approved = data.filter(item => item.verification_status === 'approved').length;
  
  const persentaseSelesai = total > 0 
    ? Math.round(((selesai + approved) / total) * 100) 
    : 0;
  
  return {
    total,
    belum,
    proses,
    selesai,
    ditolak,
    approved,
    persentase_selesai: persentaseSelesai
  };
};

// Get kecamatan progress data
export const getKecamatanProgress = (data: any[]) => {
  const kecamatanMap = new Map();
  
  data.forEach(item => {
    if (!item.kecamatan_id) return;
    
    if (!kecamatanMap.has(item.kecamatan_id)) {
      kecamatanMap.set(item.kecamatan_id, {
        id: item.kecamatan_id,
        name: item.kecamatan_name,
        target: 0,
        realisasi: 0,
        proses: 0,
        belum: 0,
        ditolak: 0
      });
    }
    
    const kecStats = kecamatanMap.get(item.kecamatan_id);
    kecStats.target += 1;
    
    if (item.status === 'selesai' || item.verification_status === 'approved') {
      kecStats.realisasi += 1;
    } else if (item.status === 'proses') {
      kecStats.proses += 1;
    } else if (item.verification_status === 'rejected') {
      kecStats.ditolak += 1;
    } else {
      kecStats.belum += 1;
    }
  });
  
  return Array.from(kecamatanMap.values());
};
