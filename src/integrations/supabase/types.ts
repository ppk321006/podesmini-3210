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
          created_at: string
          desa_id: string
          id: string
          subround: number | null
          target_padi: number
          target_palawija: number
        }
        Insert: {
          code: string
          created_at?: string
          desa_id: string
          id?: string
          subround?: number | null
          target_padi?: number
          target_palawija?: number
        }
        Update: {
          code?: string
          created_at?: string
          desa_id?: string
          id?: string
          subround?: number | null
          target_padi?: number
          target_palawija?: number
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
          created_at: string
          id: string
          komoditas: string
          nks_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          komoditas: string
          nks_id: string
        }
        Update: {
          created_at?: string
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
          created_at: string
          id: string
          month: number
          ppl_id: string
          rejected_count: number
          target_count: number
          target_padi: number
          target_palawija: number
          updated_at: string
          verified_count: number
          year: number
        }
        Insert: {
          completed_count?: number
          created_at?: string
          id?: string
          month: number
          ppl_id: string
          rejected_count?: number
          target_count?: number
          target_padi?: number
          target_palawija?: number
          updated_at?: string
          verified_count?: number
          year: number
        }
        Update: {
          completed_count?: number
          created_at?: string
          id?: string
          month?: number
          ppl_id?: string
          rejected_count?: number
          target_count?: number
          target_padi?: number
          target_palawija?: number
          updated_at?: string
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
          created_at: string
          id: string
          nama: string
          nks_id: string | null
          segmen_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          nks_id?: string | null
          segmen_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
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
          created_at: string
          desa_id: string
          id: string
          target_padi: number
        }
        Insert: {
          bulan?: number | null
          code: string
          created_at?: string
          desa_id: string
          id?: string
          target_padi?: number
        }
        Update: {
          bulan?: number | null
          code?: string
          created_at?: string
          desa_id?: string
          id?: string
          target_padi?: number
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
          created_at: string
          dokumen_diterima: boolean
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
          updated_at: string
        }
        Insert: {
          berat_hasil: number
          created_at?: string
          dokumen_diterima?: boolean
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
          updated_at?: string
        }
        Update: {
          berat_hasil?: number
          created_at?: string
          dokumen_diterima?: boolean
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
          updated_at?: string
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
          created_at: string
          id: string
          name: string
          password: string
          pml_id: string | null
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          pml_id?: string | null
          role: string
          username: string
        }
        Update: {
          created_at?: string
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
          created_at: string
          id: string
          nks_id: string
          pml_id: string
          ppl_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nks_id: string
          pml_id: string
          ppl_id: string
        }
        Update: {
          created_at?: string
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
      user_role: "admin" | "user" | "viewer"
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
      user_role: ["admin", "user", "viewer"],
    },
  },
} as const
