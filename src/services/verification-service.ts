
import { supabase } from "@/integrations/supabase/client";
import { VerificationStatus } from "@/types/pendataan-types";

export async function verifyPendataanData(
  pendataanId: string,
  verificationStatus: VerificationStatus,
  rejectionReason?: string
): Promise<void> {
  try {
    const updateData: any = {
      verification_status: verificationStatus,
    };

    if (verificationStatus === 'ditolak' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    } else if (verificationStatus === 'approved') {
      updateData.rejection_reason = null;
    }

    const { error } = await supabase
      .from('data_pendataan_desa')
      .update(updateData)
      .eq('id', pendataanId);

    if (error) {
      console.error("Error verifying data:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in verifyPendataanData:", error);
    throw error;
  }
}
