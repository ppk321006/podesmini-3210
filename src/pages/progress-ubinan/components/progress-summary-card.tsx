
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UbinanTotals } from "@/types/database-schema";

interface ProgressSummaryCardProps {
  title: string;
  value: number;
  count: number;
  target: number;
  variant?: string;
  loading?: boolean;
}

export const ProgressSummaryCard: React.FC<ProgressSummaryCardProps> = ({ 
  title, 
  value, 
  count, 
  target, 
  variant = "default",
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <span className="text-lg font-bold">{value.toFixed(1)}%</span>
          <span className="text-sm text-muted-foreground">
            {count}/{target}
          </span>
        </div>
        {variant === "padi" ? (
          <Progress value={value} className="h-2 bg-green-100">
            <div className="h-full bg-green-600" style={{ width: `${Math.min(100, value)}%` }} />
          </Progress>
        ) : variant === "palawija" ? (
          <Progress value={value} className="h-2 bg-amber-100">
            <div className="h-full bg-amber-600" style={{ width: `${Math.min(100, value)}%` }} />
          </Progress>
        ) : (
          <Progress value={value} className="h-2" />
        )}
      </CardContent>
    </Card>
  );
};

export const ProgressSummaryCards: React.FC<{ 
  totals: UbinanTotals | undefined; 
  isLoading: boolean;
}> = ({ totals, isLoading }) => {
  // Calculate percentages with safe defaults
  const padiPercentage = totals?.padi_target ? (totals.total_padi / totals.padi_target) * 100 : 0;
  const palawijaPercentage = totals?.palawija_target ? (totals.total_palawija / totals.palawija_target) * 100 : 0;
  const totalProgress = totals?.padi_target && totals?.palawija_target 
    ? ((totals.total_padi + totals.total_palawija) / (totals.padi_target + totals.palawija_target)) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {isLoading ? (
        <>
          <ProgressSummaryCard title="" value={0} count={0} target={0} loading={true} />
          <ProgressSummaryCard title="" value={0} count={0} target={0} loading={true} />
          <ProgressSummaryCard title="" value={0} count={0} target={0} loading={true} />
        </>
      ) : (
        <>
          <ProgressSummaryCard
            title="Total Progres"
            value={totalProgress}
            count={(totals?.total_padi || 0) + (totals?.total_palawija || 0)}
            target={(totals?.padi_target || 0) + (totals?.palawija_target || 0)}
          />
          
          <ProgressSummaryCard
            title="Progres Padi"
            value={padiPercentage}
            count={totals?.total_padi || 0}
            target={totals?.padi_target || 0}
            variant="padi"
          />
          
          <ProgressSummaryCard
            title="Progres Palawija"
            value={palawijaPercentage}
            count={totals?.total_palawija || 0}
            target={totals?.palawija_target || 0}
            variant="palawija"
          />
        </>
      )}
    </div>
  );
};
