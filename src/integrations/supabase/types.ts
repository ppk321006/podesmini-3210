export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alokasi_petugas: {
        Row: {
          created_at: string | null
          desa_id: string
          id: string
          pml_id: string | null
          ppl_id: string
        }
        Insert: {
          created_at?: string | null
          desa_id: string
          id?: string
          pml_id?: string | null
          ppl_id: string
        }
        Update: {
          created_at?: string | null
          desa_id?: string
          id?: string
          pml_id?: string | null
          ppl_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alokasi_petugas_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "desa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alokasi_petugas_pml_id_fkey"
            columns: ["pml_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alokasi_petugas_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_pendataan_desa: {
        Row: {
          catatan_khusus: string | null
          desa_id: string
          id: string
          jumlah_keluarga: number | null
          jumlah_lahan_pertanian: number | null
          persentase_selesai: number | null
          potensi_ekonomi: string | null
          ppl_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["pendataan_status"] | null
          status_infrastruktur: string | null
          tanggal_mulai: string | null
          tanggal_selesai: string | null
          updated_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          catatan_khusus?: string | null
          desa_id: string
          id?: string
          jumlah_keluarga?: number | null
          jumlah_lahan_pertanian?: number | null
          persentase_selesai?: number | null
          potensi_ekonomi?: string | null
          ppl_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["pendataan_status"] | null
          status_infrastruktur?: string | null
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          updated_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          catatan_khusus?: string | null
          desa_id?: string
          id?: string
          jumlah_keluarga?: number | null
          jumlah_lahan_pertanian?: number | null
          persentase_selesai?: number | null
          potensi_ekonomi?: string | null
          ppl_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["pendataan_status"] | null
          status_infrastruktur?: string | null
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          updated_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "data_pendataan_desa_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "desa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_pendataan_desa_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      desa: {
        Row: {
          id: string
          kecamatan_id: string
          name: string
        }
        Insert: {
          id?: string
          kecamatan_id: string
          name: string
        }
        Update: {
          id?: string
          kecamatan_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "desa_kecamatan_id_fkey"
            columns: ["kecamatan_id"]
            isOneToOne: false
            referencedRelation: "kecamatan"
            referencedColumns: ["id"]
          },
        ]
      }
      dokumen_pendataan: {
        Row: {
          desa_id: string
          id: string
          jenis_dokumen: string
          komentar: string | null
          nama_file: string
          ppl_id: string
          status: Database["public"]["Enums"]["dokumen_status"] | null
          updated_at: string | null
          uploaded_at: string | null
          url: string
        }
        Insert: {
          desa_id: string
          id?: string
          jenis_dokumen: string
          komentar?: string | null
          nama_file: string
          ppl_id: string
          status?: Database["public"]["Enums"]["dokumen_status"] | null
          updated_at?: string | null
          uploaded_at?: string | null
          url: string
        }
        Update: {
          desa_id?: string
          id?: string
          jenis_dokumen?: string
          komentar?: string | null
          nama_file?: string
          ppl_id?: string
          status?: Database["public"]["Enums"]["dokumen_status"] | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "dokumen_pendataan_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "desa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dokumen_pendataan_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      nks: {
        Row: {
          code: string
          created_at: string | null
          desa_id: string
          id: string
          subround: number | null
          target_padi: number | null
          target_palawija: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          desa_id: string
          id?: string
          subround?: number | null
          target_padi?: number | null
          target_palawija?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          desa_id?: string
          id?: string
          subround?: number | null
          target_padi?: number | null
          target_palawija?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nks_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "desa"
            referencedColumns: ["id"]
          },
        ]
      }
      nks_komoditas: {
        Row: {
          created_at: string | null
          id: string
          komoditas: string
          nks_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          komoditas: string
          nks_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          komoditas?: string
          nks_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nks_komoditas_nks_id_fkey"
            columns: ["nks_id"]
            isOneToOne: false
            referencedRelation: "nks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifikasi: {
        Row: {
          created_at: string | null
          data: Json | null
          dibaca: boolean | null
          id: string
          judul: string
          pesan: string
          tipe: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          dibaca?: boolean | null
          id?: string
          judul: string
          pesan: string
          tipe: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          dibaca?: boolean | null
          id?: string
          judul?: string
          pesan?: string
          tipe?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifikasi_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_report: {
        Row: {
          completed_count: number | null
          created_at: string | null
          id: string
          month: number
          ppl_id: string
          rejected_count: number | null
          target_count: number | null
          target_padi: number | null
          target_palawija: number | null
          updated_at: string | null
          verified_count: number | null
          year: number
        }
        Insert: {
          completed_count?: number | null
          created_at?: string | null
          id?: string
          month: number
          ppl_id: string
          rejected_count?: number | null
          target_count?: number | null
          target_padi?: number | null
          target_palawija?: number | null
          updated_at?: string | null
          verified_count?: number | null
          year: number
        }
        Update: {
          completed_count?: number | null
          created_at?: string | null
          id?: string
          month?: number
          ppl_id?: string
          rejected_count?: number | null
          target_count?: number | null
          target_padi?: number | null
          target_palawija?: number | null
          updated_at?: string | null
          verified_count?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "progress_report_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sampel_krt: {
        Row: {
          created_at: string | null
          id: string
          nama: string
          nks_id: string | null
          segmen_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nama: string
          nks_id?: string | null
          segmen_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nama?: string
          nks_id?: string | null
          segmen_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sampel_krt_nks_id_fkey"
            columns: ["nks_id"]
            isOneToOne: false
            referencedRelation: "nks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sampel_krt_segmen_id_fkey"
            columns: ["segmen_id"]
            isOneToOne: false
            referencedRelation: "segmen"
            referencedColumns: ["id"]
          },
        ]
      }
      segmen: {
        Row: {
          bulan: number | null
          code: string
          created_at: string | null
          desa_id: string
          id: string
          target_padi: number | null
        }
        Insert: {
          bulan?: number | null
          code: string
          created_at?: string | null
          desa_id: string
          id?: string
          target_padi?: number | null
        }
        Update: {
          bulan?: number | null
          code?: string
          created_at?: string | null
          desa_id?: string
          id?: string
          target_padi?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "segmen_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "desa"
            referencedColumns: ["id"]
          },
        ]
      }
      status_pendataan_desa: {
        Row: {
          created_at: string | null
          desa_id: string
          id: string
          ppl_id: string | null
          status: Database["public"]["Enums"]["pendataan_status"] | null
          tanggal_mulai: string | null
          tanggal_selesai: string | null
          target: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          desa_id: string
          id?: string
          ppl_id?: string | null
          status?: Database["public"]["Enums"]["pendataan_status"] | null
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          target?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          desa_id?: string
          id?: string
          ppl_id?: string | null
          status?: Database["public"]["Enums"]["pendataan_status"] | null
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          target?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_pendataan_desa_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "desa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pendataan_desa_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ubinan_data: {
        Row: {
          berat_hasil: number
          created_at: string | null
          dokumen_diterima: boolean | null
          id: string
          komentar: string | null
          komoditas: string
          nks_id: string | null
          pml_id: string | null
          ppl_id: string
          responden_name: string
          sample_status: string | null
          segmen_id: string | null
          status: Database["public"]["Enums"]["ubinan_status"] | null
          tanggal_ubinan: string
          updated_at: string | null
        }
        Insert: {
          berat_hasil: number
          created_at?: string | null
          dokumen_diterima?: boolean | null
          id?: string
          komentar?: string | null
          komoditas: string
          nks_id?: string | null
          pml_id?: string | null
          ppl_id: string
          responden_name: string
          sample_status?: string | null
          segmen_id?: string | null
          status?: Database["public"]["Enums"]["ubinan_status"] | null
          tanggal_ubinan: string
          updated_at?: string | null
        }
        Update: {
          berat_hasil?: number
          created_at?: string | null
          dokumen_diterima?: boolean | null
          id?: string
          komentar?: string | null
          komoditas?: string
          nks_id?: string | null
          pml_id?: string | null
          ppl_id?: string
          responden_name?: string
          sample_status?: string | null
          segmen_id?: string | null
          status?: Database["public"]["Enums"]["ubinan_status"] | null
          tanggal_ubinan?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ubinan_data_nks_id_fkey"
            columns: ["nks_id"]
            isOneToOne: false
            referencedRelation: "nks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubinan_data_pml_id_fkey"
            columns: ["pml_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubinan_data_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubinan_data_segmen_id_fkey"
            columns: ["segmen_id"]
            isOneToOne: false
            referencedRelation: "segmen"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          name: string
          password: string
          pml_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          password: string
          pml_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          password?: string
          pml_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_pml_id_fkey"
            columns: ["pml_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wilayah_tugas: {
        Row: {
          created_at: string | null
          id: string
          nks_id: string
          pml_id: string
          ppl_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nks_id: string
          pml_id: string
          ppl_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nks_id?: string
          pml_id?: string
          ppl_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wilayah_tugas_nks_id_fkey"
            columns: ["nks_id"]
            isOneToOne: false
            referencedRelation: "nks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wilayah_tugas_pml_id_fkey"
            columns: ["pml_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wilayah_tugas_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wilayah_tugas_segmen: {
        Row: {
          created_at: string | null
          id: string
          pml_id: string
          ppl_id: string
          segmen_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pml_id: string
          ppl_id: string
          segmen_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pml_id?: string
          ppl_id?: string
          segmen_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wilayah_tugas_segmen_pml_id_fkey"
            columns: ["pml_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wilayah_tugas_segmen_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wilayah_tugas_segmen_segmen_id_fkey"
            columns: ["segmen_id"]
            isOneToOne: false
            referencedRelation: "segmen"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ubinan_progress_monthly: {
        Row: {
          month: number | null
          padi_count: number | null
          palawija_count: number | null
          pending_verification: number | null
          ppl_id: string | null
          rejected: number | null
          subround: number | null
          verified: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ubinan_data_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ubinan_totals: {
        Row: {
          padi_target: number | null
          palawija_target: number | null
          ppl_id: string | null
          subround: number | null
          total_padi: number | null
          total_palawija: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ubinan_data_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
      dokumen_status: "belum_dikirim" | "dikirim" | "diterima" | "ditolak"
      pendataan_status: "belum" | "proses" | "selesai" | "ditolak" | "approved"
      ubinan_status: "belum_diisi" | "sudah_diisi" | "dikonfirmasi" | "ditolak"
      user_role: "admin" | "pml" | "ppl" | "viewer"
      verification_status: "belum_verifikasi" | "approved" | "ditolak"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dokumen_status: ["belum_dikirim", "dikirim", "diterima", "ditolak"],
      pendataan_status: ["belum", "proses", "selesai", "ditolak", "approved"],
      ubinan_status: ["belum_diisi", "sudah_diisi", "dikonfirmasi", "ditolak"],
      user_role: ["admin", "pml", "ppl", "viewer"],
      verification_status: ["belum_verifikasi", "approved", "ditolak"],
    },
  },
} as const
