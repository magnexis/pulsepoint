import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingGrid } from "@/components/page-states";
import { useAdminSystem } from "@/hooks/useUserData";

export function AdminSystemPage() {
  const system = useAdminSystem();
  if (system.isLoading) return <LoadingGrid />;
  if (system.error || !system.data) return <ErrorState description={system.error ?? "Failed to load system metrics."} onRetry={() => window.location.reload()} />;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {[
        ["Active sessions", system.data.data.activeSessions],
        ["API usage", system.data.data.apiUsageCount],
        ["Scheduler", system.data.data.scheduler],
        ["Deploy targets", system.data.data.deploymentTargets.join(" / ")],
      ].map(([label, value]) => (
        <Card key={label}>
          <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
          <CardContent className="font-display text-3xl font-semibold">{value}</CardContent>
        </Card>
      ))}
    </div>
  );
}
