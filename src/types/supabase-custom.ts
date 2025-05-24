
import { Database } from '@/integrations/supabase/types';

// Type definitions for tables that exist in the Supabase database
export interface CustomTables {
  ubinan_data: {
    Row: {
      id: string;
      nks_id: string | null;
      segmen_id: string | null;
      ppl_id: string;
      pml_id: string | null;
      responden_name: string;
      komoditas: string;
      tanggal_ubinan: string;
      berat_hasil: number;
      status: string;
      komentar: string | null;
      sample_status: string | null;
      dokumen_diterima: boolean | null;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<CustomTables['ubinan_data']['Row'], 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<CustomTables['ubinan_data']['Row']>;
  };
  users: {
    Row: {
      id: string;
      username: string;
      password: string;
      name: string;
      role: string;
      pml_id: string | null;
      created_at: string;
    };
    Insert: Omit<CustomTables['users']['Row'], 'id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<CustomTables['users']['Row']>;
  };
  wilayah_tugas: {
    Row: {
      id: string;
      nks_id: string;
      pml_id: string;
      ppl_id: string;
      created_at: string;
    };
    Insert: Omit<CustomTables['wilayah_tugas']['Row'], 'id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<CustomTables['wilayah_tugas']['Row']>;
  };
  wilayah_tugas_segmen: {
    Row: {
      id: string;
      segmen_id: string;
      pml_id: string;
      ppl_id: string;
      created_at: string;
    };
    Insert: Omit<CustomTables['wilayah_tugas_segmen']['Row'], 'id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<CustomTables['wilayah_tugas_segmen']['Row']>;
  };
  nks: {
    Row: {
      id: string;
      code: string;
      desa_id: string;
      target_padi: number;
      target_palawija: number;
      subround: number | null;
      created_at: string;
    };
    Insert: Omit<CustomTables['nks']['Row'], 'id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<CustomTables['nks']['Row']>;
  };
  segmen: {
    Row: {
      id: string;
      code: string;
      desa_id: string;
      target_padi: number;
      bulan: number | null;
      created_at: string;
    };
    Insert: Omit<CustomTables['segmen']['Row'], 'id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<CustomTables['segmen']['Row']>;
  };
  sampel_krt: {
    Row: {
      id: string;
      nama: string;
      status: string;
      nks_id: string | null;
      segmen_id: string | null;
      created_at: string;
    };
    Insert: Omit<CustomTables['sampel_krt']['Row'], 'id' | 'created_at'> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<CustomTables['sampel_krt']['Row']>;
  };
  alokasi_petugas: {
    Row: {
      id: string;
      desa_id: string;
      ppl_id: string;
      pml_id: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      desa_id: string;
      ppl_id: string;
      pml_id?: string | null;
      created_at?: string | null;
    };
    Update: Partial<CustomTables['alokasi_petugas']['Row']>;
  };
  status_pendataan_desa: {
    Row: {
      id: string;
      desa_id: string;
      ppl_id: string | null;
      status: 'belum' | 'proses' | 'selesai' | 'ditolak' | 'approved';
      tanggal_mulai: string | null;
      tanggal_selesai: string | null;
      target: number | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      desa_id: string;
      ppl_id?: string | null;
      status?: 'belum' | 'proses' | 'selesai' | 'ditolak' | 'approved';
      tanggal_mulai?: string | null;
      tanggal_selesai?: string | null;
      target?: number | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: Partial<CustomTables['status_pendataan_desa']['Row']>;
  };
  data_pendataan_desa: {
    Row: {
      id: string;
      desa_id: string;
      ppl_id: string;
      jumlah_keluarga: number | null;
      jumlah_lahan_pertanian: number | null;
      status_infrastruktur: string | null;
      potensi_ekonomi: string | null;
      catatan_khusus: string | null;
      persentase_selesai: number | null;
      tanggal_mulai: string | null;
      tanggal_selesai: string | null;
      status: 'belum' | 'proses' | 'selesai' | 'ditolak' | 'approved' | null;
      verification_status: 'belum_verifikasi' | 'approved' | 'ditolak' | null;
      rejection_reason: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      desa_id: string;
      ppl_id: string;
      jumlah_keluarga?: number | null;
      jumlah_lahan_pertanian?: number | null;
      status_infrastruktur?: string | null;
      potensi_ekonomi?: string | null;
      catatan_khusus?: string | null;
      persentase_selesai?: number | null;
      tanggal_mulai?: string | null;
      tanggal_selesai?: string | null;
      status?: 'belum' | 'proses' | 'selesai' | 'ditolak' | 'approved' | null;
      verification_status?: 'belum_verifikasi' | 'approved' | 'ditolak' | null;
      rejection_reason?: string | null;
      updated_at?: string | null;
    };
    Update: Partial<CustomTables['data_pendataan_desa']['Row']>;
  };
  dokumen_pendataan: {
    Row: {
      id: string;
      desa_id: string;
      ppl_id: string;
      jenis_dokumen: string;
      nama_file: string;
      url: string;
      status: 'belum_dikirim' | 'dikirim' | 'diterima' | 'ditolak' | null;
      komentar: string | null;
      uploaded_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      desa_id: string;
      ppl_id: string;
      jenis_dokumen: string;
      nama_file: string;
      url: string;
      status?: 'belum_dikirim' | 'dikirim' | 'diterima' | 'ditolak' | null;
      komentar?: string | null;
      uploaded_at?: string | null;
      updated_at?: string | null;
    };
    Update: Partial<CustomTables['dokumen_pendataan']['Row']>;
  };
  activity_log: {
    Row: {
      id: string;
      user_id: string | null;
      action: string;
      entity_type: string;
      entity_id: string;
      details: any | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      user_id?: string | null;
      action: string;
      entity_type: string;
      entity_id: string;
      details?: any | null;
      created_at?: string | null;
    };
    Update: Partial<CustomTables['activity_log']['Row']>;
  };
  notifikasi: {
    Row: {
      id: string;
      user_id: string;
      judul: string;
      pesan: string;
      tipe: string;
      dibaca: boolean | null;
      created_at: string | null;
      data: any | null;
    };
    Insert: {
      id?: string;
      user_id: string;
      judul: string;
      pesan: string;
      tipe: string;
      dibaca?: boolean | null;
      created_at?: string | null;
      data?: any | null;
    };
    Update: Partial<CustomTables['notifikasi']['Row']>;
  };
  ubinan_progress_monthly: {
    Row: {
      month: number | null;
      year: number | null;
      subround: number | null;
      ppl_id: string | null;
      padi_count: number | null;
      palawija_count: number | null;
      pending_verification: number | null;
      verified: number | null;
      rejected: number | null;
    };
  };
  ubinan_totals: {
    Row: {
      subround: number | null;
      year: number | null;
      ppl_id: string | null;
      total_padi: number | null;
      total_palawija: number | null;
      padi_target: number | null;
      palawija_target: number | null;
    };
  };
}

// Create a type safe schema accessor for use with supabase.from() calls
export type ExtendedDatabase = {
  public: {
    Tables: Database['public']['Tables'] & CustomTables;
    Views: Database['public']['Views'] & {
      ubinan_progress_monthly: CustomTables['ubinan_progress_monthly'];
      ubinan_totals: CustomTables['ubinan_totals'];
    };
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
};

// Type helper for Supabase queries
export type TableName = keyof CustomTables | keyof Database['public']['Tables'];
