
// Custom database type definitions for our Supabase tables
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
        }
        Insert: {
          id?: string
          username: string
          password: string
          name: string
          role: 'admin' | 'pml' | 'ppl' | 'viewer'
          pml_id?: string | null
        }
        Update: {
          id?: string
          username?: string
          password?: string
          name?: string
          role?: 'admin' | 'pml' | 'ppl' | 'viewer'
          pml_id?: string | null
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
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          desa_id: string
          target_padi: number
          target_palawija: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          desa_id?: string
          target_padi?: number
          target_palawija?: number
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
          nks_id: string
          ppl_id: string
          responden_name: string
          komoditas: 'padi' | 'jagung' | 'kedelai' | 'kacang_tanah' | 'ubi_kayu' | 'ubi_jalar'
          tanggal_ubinan: string
          berat_hasil: number
          status: 'belum_diisi' | 'sudah_diisi' | 'dikonfirmasi' | 'ditolak'
          pml_id: string | null
          dokumen_diterima: boolean
          komentar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nks_id: string
          ppl_id: string
          responden_name: string
          komoditas: 'padi' | 'jagung' | 'kedelai' | 'kacang_tanah' | 'ubi_kayu' | 'ubi_jalar'
          tanggal_ubinan: string
          berat_hasil: number
          status?: 'belum_diisi' | 'sudah_diisi' | 'dikonfirmasi' | 'ditolak'
          pml_id?: string | null
          dokumen_diterima?: boolean
          komentar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nks_id?: string
          ppl_id?: string
          responden_name?: string
          komoditas?: 'padi' | 'jagung' | 'kedelai' | 'kacang_tanah' | 'ubi_kayu' | 'ubi_jalar'
          tanggal_ubinan?: string
          berat_hasil?: number
          status?: 'belum_diisi' | 'sudah_diisi' | 'dikonfirmasi' | 'ditolak'
          pml_id?: string | null
          dokumen_diterima?: boolean
          komentar?: string | null
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
    }
    Enums: {
      komoditas_type: 'padi' | 'jagung' | 'kedelai' | 'kacang_tanah' | 'ubi_kayu' | 'ubi_jalar'
      verification_status: 'belum_diisi' | 'sudah_diisi' | 'dikonfirmasi' | 'ditolak'
      user_role: 'admin' | 'pml' | 'ppl' | 'viewer'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
