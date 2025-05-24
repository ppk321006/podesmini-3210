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
            referencedRelation: "dashboard_data_view"
            referencedColumns: ["desa_id"]
          },
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
          status: Database["public"]["Enums"]["verification_status"] | null
          status_infrastruktur: string | null
          tanggal_mulai: string | null
          tanggal_selesai: string | null
          updated_at: string | null
          verification_status: string | null
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
          status?: Database["public"]["Enums"]["verification_status"] | null
          status_infrastruktur?: string | null
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          updated_at?: string | null
          verification_status?: string | null
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
          status?: Database["public"]["Enums"]["verification_status"] | null
          status_infrastruktur?: string | null
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_pendataan_desa_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "dashboard_data_view"
            referencedColumns: ["desa_id"]
          },
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
            referencedRelation: "dashboard_data_view"
            referencedColumns: ["kecamatan_id"]
          },
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
          status: Database["public"]["Enums"]["document_status"] | null
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
          status?: Database["public"]["Enums"]["document_status"] | null
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
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "dokumen_pendataan_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: false
            referencedRelation: "dashboard_data_view"
            referencedColumns: ["desa_id"]
          },
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
      status_pendataan_desa: {
        Row: {
          created_at: string | null
          desa_id: string
          id: string
          ppl_id: string | null
          status: Database["public"]["Enums"]["verification_status"]
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
          status?: Database["public"]["Enums"]["verification_status"]
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
          status?: Database["public"]["Enums"]["verification_status"]
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          target?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_pendataan_desa_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: true
            referencedRelation: "dashboard_data_view"
            referencedColumns: ["desa_id"]
          },
          {
            foreignKeyName: "status_pendataan_desa_desa_id_fkey"
            columns: ["desa_id"]
            isOneToOne: true
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
      users: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
          pml_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          pml_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          created_at?: string
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
    }
    Views: {
      dashboard_data_view: {
        Row: {
          desa_id: string | null
          desa_name: string | null
          kecamatan_id: string | null
          kecamatan_name: string | null
          persentase_selesai: number | null
          pml_id: string | null
          pml_name: string | null
          ppl_id: string | null
          ppl_name: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          tanggal_mulai: string | null
          tanggal_selesai: string | null
          verification_status: string | null
        }
        Relationships: [
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
    }
    Functions: {
      create_notification: {
        Args: {
          user_id: string
          judul: string
          pesan: string
          tipe: string
          related_data?: Json
        }
        Returns: string
      }
      get_dashboard_data: {
        Args: { user_role: string; user_id: string }
        Returns: {
          desa_id: string
          desa_name: string
          kecamatan_id: string
          kecamatan_name: string
          status: string
          verification_status: string
          persentase_selesai: number
          tanggal_mulai: string
          tanggal_selesai: string
          ppl_id: string
          ppl_name: string
          pml_id: string
          pml_name: string
        }[]
      }
      get_pendataan_progress: {
        Args: { kecamatan_id?: string; ppl_id?: string }
        Returns: {
          total_desa: number
          belum: number
          proses: number
          selesai: number
          ditolak: number
          approved: number
          persentase_selesai: number
        }[]
      }
    }
    Enums: {
      document_status: "belum_dikirim" | "dikirim" | "diterima" | "ditolak"
      user_role: "admin" | "pml" | "ppl" | "viewer"
      verification_status:
        | "belum"
        | "proses"
        | "selesai"
        | "ditolak"
        | "approved"
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
      document_status: ["belum_dikirim", "dikirim", "diterima", "ditolak"],
      user_role: ["admin", "pml", "ppl", "viewer"],
      verification_status: [
        "belum",
        "proses",
        "selesai",
        "ditolak",
        "approved",
      ],
    },
  },
} as const
