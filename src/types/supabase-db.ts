
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password: string
          name: string
          role: 'admin' | 'pml' | 'ppl' | 'viewer'
          pml_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          name: string
          role: 'admin' | 'pml' | 'ppl' | 'viewer'
          pml_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          name?: string
          role?: 'admin' | 'pml' | 'ppl' | 'viewer'
          pml_id?: string | null
          created_at?: string
        }
      }
      kecamatan: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      desa: {
        Row: {
          id: string
          name: string
          kecamatan_id: string
        }
        Insert: {
          id?: string
          name: string
          kecamatan_id: string
        }
        Update: {
          id?: string
          name?: string
          kecamatan_id?: string
        }
      }
      nks: {
        Row: {
          id: string
          code: string
          desa_id: string
          target_padi: number
          target_palawija: number
          subround: number | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          desa_id: string
          target_padi?: number
          target_palawija?: number
          subround?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          desa_id?: string
          target_padi?: number
          target_palawija?: number
          subround?: number | null
          created_at?: string
        }
      }
      nks_komoditas: {
        Row: {
          id: string
          nks_id: string
          komoditas: string
          created_at: string
        }
        Insert: {
          id?: string
          nks_id: string
          komoditas: string
          created_at?: string
        }
        Update: {
          id?: string
          nks_id?: string
          komoditas?: string
          created_at?: string
        }
      }
      segmen: {
        Row: {
          id: string
          code: string
          desa_id: string
          target_padi: number
          bulan: number | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          desa_id: string
          target_padi?: number
          bulan?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          desa_id?: string
          target_padi?: number
          bulan?: number | null
          created_at?: string
        }
      }
      sampel_krt: {
        Row: {
          id: string
          nama: string
          status: string
          nks_id: string | null
          segmen_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          status: string
          nks_id?: string | null
          segmen_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          status?: string
          nks_id?: string | null
          segmen_id?: string | null
          created_at?: string
        }
      }
      wilayah_tugas: {
        Row: {
          id: string
          nks_id: string
          pml_id: string
          ppl_id: string
          created_at: string
        }
        Insert: {
          id?: string
          nks_id: string
          pml_id: string
          ppl_id: string
          created_at?: string
        }
        Update: {
          id?: string
          nks_id?: string
          pml_id?: string
          ppl_id?: string
          created_at?: string
        }
      }
      ubinan_data: {
        Row: {
          id: string
          nks_id: string | null
          segmen_id: string | null
          ppl_id: string
          responden_name: string
          sample_status: string | null
          komoditas: string
          tanggal_ubinan: string
          berat_hasil: number
          status: string
          pml_id: string | null
          dokumen_diterima: boolean
          komentar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nks_id?: string | null
          segmen_id?: string | null
          ppl_id: string
          responden_name: string
          sample_status?: string | null
          komoditas: string
          tanggal_ubinan: string
          berat_hasil: number
          status?: string
          pml_id?: string | null
          dokumen_diterima?: boolean
          komentar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nks_id?: string | null
          segmen_id?: string | null
          ppl_id?: string
          responden_name?: string
          sample_status?: string | null
          komoditas?: string
          tanggal_ubinan?: string
          berat_hasil?: number
          status?: string
          pml_id?: string | null
          dokumen_diterima?: boolean
          komentar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progress_report: {
        Row: {
          id: string
          ppl_id: string
          target_count: number
          completed_count: number
          verified_count: number
          rejected_count: number
          target_padi: number
          target_palawija: number
          year: number
          month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ppl_id: string
          target_count?: number
          completed_count?: number
          verified_count?: number
          rejected_count?: number
          target_padi?: number
          target_palawija?: number
          year: number
          month: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ppl_id?: string
          target_count?: number
          completed_count?: number
          verified_count?: number
          rejected_count?: number
          target_padi?: number
          target_palawija?: number
          year?: number
          month?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_subround: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_ubinan_progress_by_subround: {
        Args: { subround_param: number }
        Returns: {
          ppl_id: string
          ppl_name: string
          target_count: number
          completed_count: number
          verified_count: number
          rejected_count: number
          completion_percentage: number
        }[]
      }
      get_ubinan_progress_by_year: {
        Args: { year_param: number }
        Returns: {
          month: number
          target_count: number
          completed_count: number
          verified_count: number
          rejected_count: number
          completion_percentage: number
        }[]
      }
    }
    Enums: {
      user_role: 'admin' | 'pml' | 'ppl' | 'viewer'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
