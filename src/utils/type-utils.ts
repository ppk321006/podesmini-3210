
import { CustomTables } from "@/types/supabase-custom";
import { UbinanData } from "@/types/database-schema";

/**
 * Safely cast Supabase data to UbinanData type
 */
export function castToUbinanData(data: unknown): UbinanData {
  const typedData = data as CustomTables['ubinan_data']['Row'];
  
  return {
    id: typedData.id,
    nks_id: typedData.nks_id,
    segmen_id: typedData.segmen_id,
    ppl_id: typedData.ppl_id,
    responden_name: typedData.responden_name,
    komoditas: typedData.komoditas,
    tanggal_ubinan: typedData.tanggal_ubinan,
    berat_hasil: typedData.berat_hasil,
    status: typedData.status,
    komentar: typedData.komentar || "",
    sample_status: typedData.sample_status || "",
    dokumen_diterima: typedData.dokumen_diterima || false,
    created_at: typedData.created_at,
    updated_at: typedData.updated_at,
    pml_id: typedData.pml_id
  };
}
