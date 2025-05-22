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
          {
            foreignKeyName: "desa_kecamatan_id_fkey"
            columns: ["kecamatan_id"]
            isOneToOne: false
            referencedRelation: "progress_view"
            referencedColumns: ["kecamatan_id"]
          },
        ]
      }
      dokumen: {
        Row: {
          created_at: string | null
          id: string
          jenis_file: string
          nama_file: string
          pendataan_id: string
          tipe_file: string
          ukuran: number
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          jenis_file: string
          nama_file: string
          pendataan_id: string
          tipe_file: string
          ukuran: number
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          jenis_file?: string
          nama_file?: string
          pendataan_id?: string
          tipe_file?: string
          ukuran?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "dokumen_pendataan_id_fkey"
            columns: ["pendataan_id"]
            isOneToOne: false
            referencedRelation: "pendataan"
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
      notifikasi: {
        Row: {
          created_at: string | null
          data: Json | null
          dibaca: boolean
          id: string
          judul: string
          pesan: string
          tipe: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          dibaca?: boolean
          id?: string
          judul: string
          pesan: string
          tipe: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          dibaca?: boolean
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
            referencedRelation: "progress_view"
            referencedColumns: ["pml_id"]
          },
          {
            foreignKeyName: "notifikasi_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "progress_view"
            referencedColumns: ["ppl_id"]
          },
          {
            foreignKeyName: "notifikasi_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pendataan: {
        Row: {
          alasan_penolakan: string | null
          catatan: string | null
          created_at: string | null
          desa_id: string
          id: string
          infrastruktur: string | null
          jumlah_penduduk: number | null
          luas_wilayah: number | null
          potensi_ekonomi: string | null
          ppl_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          alasan_penolakan?: string | null
          catatan?: string | null
          created_at?: string | null
          desa_id: string
          id?: string
          infrastruktur?: string | null
          jumlah_penduduk?: number | null
          luas_wilayah?: number | null
          potensi_ekonomi?: string | null
          ppl_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          alasan_penolakan?: string | null
          catatan?: string | null
          created_at?: string | null
          desa_id?: string
          id?: string
          infrastruktur?: string | null
          jumlah_penduduk?: number | null
          luas_wilayah?: number | null
          potensi_ekonomi?: string | null
          ppl_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pendataan_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "desa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pendataan_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "progress_view"
            referencedColumns: ["desa_id"]
          },
          {
            foreignKeyName: "pendataan_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "progress_view"
            referencedColumns: ["pml_id"]
          },
          {
            foreignKeyName: "pendataan_ppl_id_fkey"
            columns: ["ppl_id"]
            isOneToOne: false
            referencedRelation: "progress_view"
            referencedColumns: ["ppl_id"]
          },
          {
            foreignKeyName: "pendataan_ppl_id_fkey"
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
          last_login: string | null
          name: string
          password: string
          pml_id: string | null
          role: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_login?: string | null
          name: string
          password: string
          pml_id?: string | null
          role: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_login?: string | null
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
            referencedRelation: "progress_view"
            referencedColumns: ["pml_id"]
          },
          {
            foreignKeyName: "users_pml_id_fkey"
            columns: ["pml_id"]
            isOneToOne: false
            referencedRelation: "progress_view"
            referencedColumns: ["ppl_id"]
          },
          {
            foreignKeyName: "users_pml_id_fkey"
            columns: ["pml_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      progress_view: {
        Row: {
          desa_id: string | null
          desa_name: string | null
          kecamatan_id: string | null
          kecamatan_name: string | null
          last_updated: string | null
          pml_id: string | null
          pml_name: string | null
          ppl_id: string | null
          ppl_name: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
