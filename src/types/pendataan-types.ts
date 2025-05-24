
import { UserRole } from "./user";

export type VerificationStatus = 'belum_verifikasi' | 'approved' | 'ditolak';
export type PendataanStatus = 'belum' | 'proses' | 'selesai' | 'ditolak' | 'approved';

export interface KecamatanData {
  id: string;
  name: string;
}

export interface DesaData {
  id: string;
  name: string;
  kecamatan_id?: string;
  kecamatan?: KecamatanData;
  status?: PendataanStatus;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  target?: number;
}

export interface PplData {
  id: string;
  name: string;
  username: string;
}

export interface PendataanDataItem {
  id: string;
  desa_id: string;
  ppl_id: string;
  jumlah_keluarga: number | null;
  jumlah_lahan_pertanian: number | null;
  status_infrastruktur: string | null;
  potensi_ekonomi: string | null;
  catatan_khusus: string | null;
  status: PendataanStatus;
  persentase_selesai: number;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  desa?: DesaData;
  ppl?: PplData;
}

export interface ProgressSummary {
  total: number;
  selesai: number;
  proses: number;
  belum: number;
  ditolak: number;
  persentase_selesai: number;
}

export interface AlokasiBertugas {
  desa_id: string;
  desa_name: string;
  kecamatan_name: string;
  status?: PendataanStatus;
  verification_status?: VerificationStatus;
}

export interface PendataanFilter {
  userRole: UserRole;
  userId: string;
  kecamatanId?: string;
  desaId?: string;
  status?: PendataanStatus;
}
