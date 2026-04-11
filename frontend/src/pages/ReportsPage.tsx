import { useState } from "react";

import { ErrorState, LoadingGrid } from "@/components/page-states";
import { ReportDialog } from "@/components/report-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserReports } from "@/hooks/useUserData";
import { formatRelativeDate } from "@/lib/utils";

export function ReportsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const reports = useUserReports(refreshKey);

  if (reports.isLoading) return <LoadingGrid />;
  if (reports.error || !reports.data) return <ErrorState description={reports.error ?? "Failed to load reports."} onRetry={() => setRefreshKey((value) => value + 1)} />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submitted reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.data.data.map((report) => (
            <div key={report.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{report.title}</div>
                  <div className="text-sm text-muted-foreground">{report.business.name}</div>
                </div>
                <Badge variant={report.status === "resolved" ? "success" : report.status === "reviewed" ? "info" : "warning"}>
                  {report.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <div className="mt-3 text-xs text-muted-foreground">{formatRelativeDate(report.createdAt)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      {reports.data.data[0] ? (
        <div className="flex justify-end">
          <ReportDialog businessId={reports.data.data[0].business.id} onSubmitted={() => setRefreshKey((value) => value + 1)} />
        </div>
      ) : null}
    </div>
  );
}

