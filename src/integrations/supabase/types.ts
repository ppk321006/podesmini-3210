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
          created_at: string | null
          desa_id: string
          id: string
          subround: number
          target_padi: number
          target_palawija: number
        }
        Insert: {
          code: string
          created_at?: string | null
          desa_id: string
          id?: string
          subround?: number
          target_padi?: number
          target_palawija?: number
        }
        Update: {
          code?: string
          created_at?: string | null
          desa_id?: string
          id?: string
          subround?: number
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
      ubinan_data: {
        Row: {
          berat_hasil: number
          created_at: string | null
          dokumen_diterima: boolean
          id: string
          komentar: string | null
          komoditas: string
          nks_id: string
          pml_id: string | null
          ppl_id: string
          responden_name: string
          status: string
          tanggal_ubinan: string
          updated_at: string | null
        }
        Insert: {
          berat_hasil: number
          created_at?: string | null
          dokumen_diterima?: boolean
          id?: string
          komentar?: string | null
          komoditas: string
          nks_id: string
          pml_id?: string | null
          ppl_id: string
          responden_name: string
          status?: string
          tanggal_ubinan: string
          updated_at?: string | null
        }
        Update: {
          berat_hasil?: number
          created_at?: string | null
          dokumen_diterima?: boolean
          id?: string
          komentar?: string | null
          komoditas?: string
          nks_id?: string
          pml_id?: string | null
          ppl_id?: string
          responden_name?: string
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
        Relationships: []
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
          status: Database["public"]["Enums"]["verification_status"]
          komoditas: Database["public"]["Enums"]["komoditas_type"]
          count: number
        }[]
      }
      get_ubinan_progress_by_year: {
        Args: { year_param: number }
        Returns: {
          status: Database["public"]["Enums"]["verification_status"]
          komoditas: Database["public"]["Enums"]["komoditas_type"]
          count: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      komoditas_type:
        | "padi"
        | "jagung"
        | "kedelai"
        | "kacang_tanah"
        | "ubi_kayu"
        | "ubi_jalar"
      user_role: "admin" | "user"
      verification_status:
        | "belum_diisi"
        | "sudah_diisi"
        | "dikonfirmasi"
        | "ditolak"
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
      komoditas_type: [
        "padi",
        "jagung",
        "kedelai",
        "kacang_tanah",
        "ubi_kayu",
        "ubi_jalar",
      ],
      user_role: ["admin", "user"],
      verification_status: [
        "belum_diisi",
        "sudah_diisi",
        "dikonfirmasi",
        "ditolak",
      ],
    },
  },
} as const
