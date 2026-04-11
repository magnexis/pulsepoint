import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingGrid } from "@/components/page-states";
import { useToast } from "@/components/toast-provider";
import { useAlertsFeed, apiAction } from "@/hooks/useUserData";
import { api } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";

export function AlertsPage() {
  const [severity, setSeverity] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const { pushToast } = useToast();
  const alerts = useAlertsFeed(severity, refreshKey);

  if (alerts.isLoading) return <LoadingGrid />;
  if (alerts.error || !alerts.data) return <ErrorState description={alerts.error ?? "Failed to load alerts."} onRetry={() => setRefreshKey((value) => value + 1)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {["all", "critical", "warning", "info"].map((level) => (
          <Button key={level} variant={severity === level ? "default" : "outline"} onClick={() => setSeverity(level)}>
            {level}
          </Button>
        ))}
      </div>
      <div className="grid gap-4">
        {alerts.data.data.map((alert) => (
          <Card key={alert.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{alert.title}</CardTitle>
                <div className="mt-1 text-sm text-muted-foreground">{alert.business.name}</div>
              </div>
              <Badge variant={alert.severity === "critical" ? "danger" : alert.severity === "warning" ? "warning" : "info"}>
                {alert.severity}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{alert.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{formatRelativeDate(alert.createdAt)}</div>
                <Button
                  variant="outline"
                  disabled={alert.isRead}
                  onClick={async () => {
                    try {
                      await apiAction(() => api.post("/alerts/read", { alertId: alert.id }));
                      pushToast({ title: "Alert marked as read", tone: "success" });
                      setRefreshKey((value) => value + 1);
                    } catch (error) {
                      pushToast({ title: "Action failed", description: (error as Error).message, tone: "error" });
                    }
                  }}
                >
                  {alert.isRead ? "Read" : "Mark as read"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

