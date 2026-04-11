import { Cloud, Database, Shield, Timer } from "lucide-react";

import { ErrorState, LoadingGrid } from "@/components/page-states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useHealthStatus } from "@/hooks/useHealthStatus";
import { formatRelativeDate } from "@/lib/utils";

export function AdminPage() {
  const health = useHealthStatus();
  const businesses = useBusinesses({
    pageSize: 6,
  });

  if (health.isLoading || businesses.isLoading) {
    return <LoadingGrid />;
  }

  if (health.error || businesses.error) {
    return (
      <ErrorState
        description={health.error ?? businesses.error ?? "Admin data is currently unavailable."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const items = businesses.data?.data ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Backend service",
            value: health.data?.status ?? "unknown",
            icon: Cloud,
          },
          {
            label: "Tracked businesses",
            value: items.length,
            icon: Database,
          },
          {
            label: "Scheduler cadence",
            value: "15m",
            icon: Timer,
          },
          {
            label: "Security posture",
            value: "API-only",
            icon: Shield,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-3 p-6">
              <item.icon className="h-5 w-5 text-pulse-300" />
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="font-display text-4xl font-semibold capitalize">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deployment readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Frontend is designed for Vercel with <code>VITE_API_URL</code> controlling the API host.</p>
            <p>Backend is isolated and ready for Railway or Render with <code>PORT=5000</code> and provider API keys.</p>
            <p>Alerts, trend snapshots, signals, hiring signals, and reports are all persisted for historical analysis.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracked business risk queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((business) => (
              <div key={business.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-medium">{business.name}</div>
                  <Badge
                    variant={
                      business.riskLevel === "high"
                        ? "danger"
                        : business.riskLevel === "medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    {business.riskLevel}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Health {business.healthScore} · Synced {formatRelativeDate(business.lastSyncedAt)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

