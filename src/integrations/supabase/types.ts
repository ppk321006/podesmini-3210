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
      desa: {
        Row: {
          created_at: string | null
          id: string
          kecamatan_id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kecamatan_id: string
          name: string
        }
        Update: {
          created_at?: string | null
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
      kecamatan: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
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
      progress_report: {
        Row: {
          completed_count: number
          created_at: string | null
          id: string
          month: number
          ppl_id: string
          rejected_count: number
          target_count: number
          target_padi: number
          target_palawija: number
          updated_at: string | null
          verified_count: number
          year: number
        }
        Insert: {
          completed_count?: number
          created_at?: string | null
          id?: string
          month: number
          ppl_id: string
          rejected_count?: number
          target_count?: number
          target_padi?: number
          target_palawija?: number
          updated_at?: string | null
          verified_count?: number
          year: number
        }
        Update: {
          completed_count?: number
          created_at?: string | null
          id?: string
          month?: number
          ppl_id?: string
          rejected_count?: number
          target_count?: number
          target_padi?: number
          target_palawija?: number
          updated_at?: string | null
          verified_count?: number
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
          status: string
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
          status?: string
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
          status?: string
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
          role: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          password: string
          pml_id?: string | null
          role: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          password?: string
          pml_id?: string | null
          role?: string
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
      allocation_status: {
        Row: {
          code: string | null
          desa_id: string | null
          desa_name: string | null
          id: string | null
          is_allocated: boolean | null
          kecamatan_id: string | null
          kecamatan_name: string | null
          pml_id: string | null
          ppl_id: string | null
          type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_palawija_by_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          komoditas: string
          count: number
        }[]
      }
      get_ppl_activity_summary: {
        Args: {
          year_param?: number
          month_param?: number
          subround_param?: number
          status_param?: string
          ppl_id_param?: string
          pml_id_param?: string
        }
        Returns: {
          ppl_id: string
          ppl_name: string
          pml_id: string
          pml_name: string
          month: number
          total_count: number
          padi_count: number
          palawija_count: number
          confirmed_count: number
          pending_count: number
          rejected_count: number
        }[]
      }
      get_subround: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      get_ubinan_progress_detail_by_subround: {
        Args:
          | { subround_param: number }
          | { subround_param: number; year_param?: number }
        Returns: {
          month: number
          padi_count: number
          palawija_count: number
          padi_target: number
          palawija_target: number
          padi_percentage: number
          palawija_percentage: number
        }[]
      }
      get_ubinan_totals_by_subround: {
        Args:
          | { subround_param: number }
          | { subround_param: number; year_param?: number }
        Returns: {
          total_padi: number
          total_palawija: number
          padi_target: number
          palawija_target: number
          pending_verification: number
        }[]
      }
      get_verification_status_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          status: string
          count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
