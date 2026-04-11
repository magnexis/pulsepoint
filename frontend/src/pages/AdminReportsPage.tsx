import { useState } from "react";

import { ErrorState, LoadingGrid } from "@/components/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/toast-provider";
import { apiAction, useAdminReports } from "@/hooks/useUserData";
import { api } from "@/lib/api";

export function AdminReportsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const reports = useAdminReports(refreshKey);
  const { pushToast } = useToast();
  if (reports.isLoading) return <LoadingGrid />;
  if (reports.error || !reports.data) return <ErrorState description={reports.error ?? "Failed to load admin reports."} onRetry={() => setRefreshKey((value) => value + 1)} />;

  return (
    <Card>
      <CardHeader><CardTitle>Moderation queue</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {reports.data.data.map((report) => (
          <div key={report.id} className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
            <div>
              <div className="font-medium">{report.title}</div>
              <div className="text-sm text-muted-foreground">{report.business} · {report.user}</div>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await apiAction(() => api.delete(`/admin/reports/${report.id}`));
                  pushToast({ title: "Report removed", tone: "success" });
                  setRefreshKey((value) => value + 1);
                } catch (error) {
                  pushToast({ title: "Removal failed", description: (error as Error).message, tone: "error" });
                }
              }}
            >
              Remove report
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

