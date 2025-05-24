
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PendataanFormData {
  desaId: string;
  pplId: string;
  status: "belum" | "proses" | "selesai";
  tanggalMulai?: Date | null;
  tanggalSelesai?: Date | null;
  jumlahKeluarga?: number | null;
  jumlahLahanPertanian?: number | null;
  statusInfrastruktur?: string;
  potensiEkonomi?: string;
  catatanKhusus?: string;
}

export async function savePendataanData(formData: PendataanFormData) {
  try {
    // Check if data already exists
    const { data: existingData, error: checkError } = await supabase
      .from('data_pendataan_desa')
      .select('*')
      .eq('desa_id', formData.desaId)
      .eq('ppl_id', formData.pplId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    // Prepare data
    const dataToSave = {
      desa_id: formData.desaId,
      ppl_id: formData.pplId,
      status: formData.status,
      tanggal_mulai: formData.tanggalMulai?.toISOString() || null,
      tanggal_selesai: formData.tanggalSelesai?.toISOString() || null,
      jumlah_keluarga: formData.jumlahKeluarga || null,
      jumlah_lahan_pertanian: formData.jumlahLahanPertanian || null,
      status_infrastruktur: formData.statusInfrastruktur || null,
      potensi_ekonomi: formData.potensiEkonomi || null,
      catatan_khusus: formData.catatanKhusus || null,
      persentase_selesai: formData.status === 'selesai' ? 100 : formData.status === 'proses' ? 50 : 0
    };
    
    // For rejected data being resubmitted, reset verification status
    if (existingData && existingData.verification_status === 'rejected') {
      dataToSave.verification_status = 'belum_verifikasi';
    }
    
    if (existingData) {
      // Update existing data
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .update(dataToSave)
        .eq('desa_id', formData.desaId)
        .eq('ppl_id', formData.pplId)
        .select();
        
      if (error) throw error;
      
      // Also update status_pendataan_desa table
      try {
        await supabase
          .from('status_pendataan_desa')
          .upsert({
            desa_id: formData.desaId,
            ppl_id: formData.pplId,
            status: formData.status,
            tanggal_mulai: formData.tanggalMulai?.toISOString() || null,
            tanggal_selesai: formData.tanggalSelesai?.toISOString() || null,
            updated_at: new Date().toISOString()
          });
      } catch (statusError) {
        console.warn("Error updating status pendataan:", statusError);
      }
      
      return data;
    } else {
      // Insert new data
      const { data, error } = await supabase
        .from('data_pendataan_desa')
        .insert({
          ...dataToSave,
          verification_status: 'belum_verifikasi'
        })
        .select();
        
      if (error) throw error;
      
      // Also create status_pendataan_desa entry
      try {
        await supabase
          .from('status_pendataan_desa')
          .upsert({
            desa_id: formData.desaId,
            ppl_id: formData.pplId,
            status: formData.status,
            tanggal_mulai: formData.tanggalMulai?.toISOString() || null,
            tanggal_selesai: formData.tanggalSelesai?.toISOString() || null,
            updated_at: new Date().toISOString()
          });
      } catch (statusError) {
        console.warn("Error creating status pendataan:", statusError);
      }
      
      return data;
    }
  } catch (error) {
    console.error("Error saving pendataan data:", error);
    throw error;
  }
}

export async function getPendataanData(pplId: string) {
  try {
    // Get allocated desas for this PPL
    const { data: alokasiData, error: alokasiError } = await supabase
      .from('alokasi_petugas')
      .select(`
        desa_id,
        desa:desa_id(
          id,
          name,
          kecamatan:kecamatan_id(
            id,
            name
          )
        )
      `)
      .eq('ppl_id', pplId);
      
    if (alokasiError) throw alokasiError;
    
    if (!alokasiData || alokasiData.length === 0) {
      return { alokasiData: [], pendataanData: [] };
    }
    
    // Get desa IDs
    const desaIds = alokasiData.map(item => item.desa_id);
    
    // Get pendataan data for these desas
    const { data: pendataanData, error: pendataanError } = await supabase
      .from('data_pendataan_desa')
      .select('*')
      .in('desa_id', desaIds)
      .eq('ppl_id', pplId);
      
    if (pendataanError) throw pendataanError;
    
    return {
      alokasiData,
      pendataanData: pendataanData || []
    };
  } catch (error) {
    console.error("Error fetching pendataan data:", error);
    throw error;
  }
}
