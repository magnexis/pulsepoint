import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingGrid } from "@/components/page-states";
import { TrendLine } from "@/components/charts";
import { useOwnerAnalytics } from "@/hooks/useUserData";

export function OwnerAnalyticsPage() {
  const analytics = useOwnerAnalytics();
  if (analytics.isLoading) return <LoadingGrid />;
  if (analytics.error || !analytics.data) return <ErrorState description={analytics.error ?? "Failed to load owner analytics."} onRetry={() => window.location.reload()} />;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {analytics.data.data.map((business) => (
        <Card key={business.businessId}>
          <CardHeader>
            <CardTitle>{business.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <TrendLine points={business.trendSnapshots.map((snapshot) => ({ date: snapshot.createdAt.slice(5, 10), value: snapshot.healthScore }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              {business.sourceBreakdown.map((source) => (
                <div key={source.source} className="rounded-2xl bg-white/6 p-3 text-sm">
                  <div className="font-medium capitalize">{source.source}</div>
                  <div className="text-muted-foreground">{source.signalCount} signals · {source.weightedSentiment.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

