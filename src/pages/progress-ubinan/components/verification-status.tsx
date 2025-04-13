
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UbinanTotals } from "@/types/database-schema";

interface VerificationStatusCardProps {
  totals: UbinanTotals | undefined;
  isLoading: boolean;
}

export const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({ 
  totals, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Verifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingPercentage = totals && (totals.padi_target + totals.palawija_target) > 0
    ? (totals.pending_verification / (totals.padi_target + totals.palawija_target)) * 100
    : 0;
  
  const verifiedPercentage = totals && (totals.padi_target + totals.palawija_target) > 0
    ? ((totals.total_padi + totals.total_palawija) / (totals.padi_target + totals.palawija_target)) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Verifikasi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 mt-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Menunggu Verifikasi</span>
              <span>{totals?.pending_verification || 0} entri</span>
            </div>
            <Progress
              value={pendingPercentage}
              className="h-2 bg-yellow-100"
            >
              <div className="h-full bg-yellow-500" />
            </Progress>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Terverifikasi</span>
              <span>{(totals?.total_padi || 0) + (totals?.total_palawija || 0)} entri</span>
            </div>
            <Progress
              value={verifiedPercentage}
              className="h-2 bg-green-100"
            >
              <div className="h-full bg-green-500" />
            </Progress>
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Target</span>
              <span>{(totals?.padi_target || 0) + (totals?.palawija_target || 0)} entri</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
