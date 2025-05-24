
import { supabase } from "@/integrations/supabase/client";
import { DetailProgressData, UbinanTotals, VerificationStatusCount, PalawijaTypeCount } from "@/types/database-schema";

// Fungsi untuk mendapatkan detail progress pendataan berdasarkan subround
export async function getProgressDetailBySubround(subround: number, year: number = new Date().getFullYear()): Promise<DetailProgressData[]> {
  try {
    console.log(`Getting progress detail for subround: ${subround}, year: ${year}`);
    
    // Data dummy untuk simulasi
    const mockData = [
      {
        month: 1,
        totalPadi: 5,
        totalPalawija: 3,
        padiTarget: 10,
        palawijaTarget: 8,
        padi_count: 5,
        palawija_count: 3,
        padi_target: 10,
        palawija_target: 8,
        pending_verification: 2,
        verified: 6,
        rejected: 0,
        padi_percentage: 50,
        palawija_percentage: 37.5,
        pendingVerification: 2
      },
      {
        month: 2,
        totalPadi: 7,
        totalPalawija: 4,
        padiTarget: 10,
        palawijaTarget: 8,
        padi_count: 7,
        palawija_count: 4,
        padi_target: 10,
        palawija_target: 8,
        pending_verification: 3,
        verified: 8,
        rejected: 0,
        padi_percentage: 70,
        palawija_percentage: 50,
        pendingVerification: 3
      },
      {
        month: 3,
        totalPadi: 8,
        totalPalawija: 6,
        padiTarget: 10,
        palawijaTarget: 8,
        padi_count: 8,
        palawija_count: 6,
        padi_target: 10,
        palawija_target: 8,
        pending_verification: 2,
        verified: 12,
        rejected: 0,
        padi_percentage: 80,
        palawija_percentage: 75,
        pendingVerification: 2
      },
      {
        month: 4,
        totalPadi: 9,
        totalPalawija: 7,
        padiTarget: 10,
        palawijaTarget: 8,
        padi_count: 9,
        palawija_count: 7,
        padi_target: 10,
        palawija_target: 8,
        pending_verification: 1,
        verified: 15,
        rejected: 0,
        padi_percentage: 90,
        palawija_percentage: 87.5,
        pendingVerification: 1
      }
    ];
    
    // Untuk subround > 1, geser bulan sesuai dengan subround
    if (subround > 1) {
      return mockData.map(item => ({
        ...item,
        month: item.month + ((subround - 1) * 4)
      }));
    }
    
    return mockData;
  } catch (error) {
    console.error("Error in getProgressDetailBySubround:", error);
    return [];
  }
}

// Fungsi untuk mendapatkan total pendataan berdasarkan subround
export async function getUbinanTotalsBySubround(subround: number, year: number = new Date().getFullYear()): Promise<UbinanTotals> {
  try {
    console.log(`Getting ubinan totals for subround: ${subround}, year: ${year}`);
    
    // Data dummy untuk simulasi
    const totals: UbinanTotals = {
      total_padi: 29,
      total_palawija: 20,
      padi_target: 40,
      palawija_target: 32,
      pending_verification: 8
    };
    
    return totals;
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

// Fungsi untuk mendapatkan status verifikasi
export async function getVerificationStatusCounts(): Promise<VerificationStatusCount[]> {
  try {
    // Data dummy untuk simulasi
    return [
      { status: "approved", count: 35 },
      { status: "pending", count: 15 },
      { status: "rejected", count: 5 }
    ];
  } catch (error) {
    console.error("Error in getVerificationStatusCounts:", error);
    return [];
  }
}

// Fungsi untuk mendapatkan jumlah pendataan berdasarkan jenis
export async function getPendataanByStatus(): Promise<PalawijaTypeCount[]> {
  try {
    // Data dummy untuk simulasi
    return [
      { komoditas: "selesai", count: 35 },
      { komoditas: "proses", count: 15 },
      { komoditas: "ditolak", count: 5 },
      { komoditas: "belum", count: 45 }
    ];
  } catch (error) {
    console.error("Error in getPendataanByStatus:", error);
    return [];
  }
}

// Fungsi untuk mendapatkan status pendataan per kecamatan
export async function getStatusPendataanPerKecamatan(): Promise<any[]> {
  try {
    // Data dummy untuk simulasi
    return [
      { 
        kecamatan: "Majalengka", 
        total: 20,
        selesai: 8,
        proses: 5,
        ditolak: 2,
        belum: 5
      },
      { 
        kecamatan: "Kadipaten", 
        total: 15,
        selesai: 10,
        proses: 2,
        ditolak: 0,
        belum: 3
      },
      { 
        kecamatan: "Jatiwangi", 
        total: 12,
        selesai: 7,
        proses: 3,
        ditolak: 1,
        belum: 1
      },
      { 
        kecamatan: "Dawuan", 
        total: 10,
        selesai: 5,
        proses: 2,
        ditolak: 1,
        belum: 2
      },
      { 
        kecamatan: "Kertajati", 
        total: 18,
        selesai: 5,
        proses: 3,
        ditolak: 1,
        belum: 9
      }
    ];
  } catch (error) {
    console.error("Error in getStatusPendataanPerKecamatan:", error);
    return [];
  }
}
