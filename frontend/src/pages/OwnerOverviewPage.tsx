import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingGrid } from "@/components/page-states";
import { MiniBars } from "@/components/charts";
import { useOwnerOverview } from "@/hooks/useUserData";

export function OwnerOverviewPage() {
  const overview = useOwnerOverview();
  if (overview.isLoading) return <LoadingGrid />;
  if (overview.error || !overview.data) return <ErrorState description={overview.error ?? "Failed to load owner overview."} onRetry={() => window.location.reload()} />;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {overview.data.data.map((business) => (
        <Card key={business.id}>
          <CardHeader>
            <CardTitle>{business.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/6 p-3">Health {business.healthScore}</div>
              <div className="rounded-2xl bg-white/6 p-3">Trust {business.trustScore}</div>
              <div className="rounded-2xl bg-white/6 p-3">Reports {business.stats.reports}</div>
            </div>
            <MiniBars points={business.snapshots.slice(-7).map((snapshot) => ({ date: snapshot.createdAt.slice(5, 10), value: snapshot.healthScore }))} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

