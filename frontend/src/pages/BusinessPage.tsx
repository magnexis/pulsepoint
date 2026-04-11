import { ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { BusinessMap } from "@/components/business-map";
import { MiniBars, ScoreRing, TrendLine } from "@/components/charts";
import { ErrorState, LoadingGrid } from "@/components/page-states";
import { ReportDialog } from "@/components/report-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { formatRelativeDate } from "@/lib/utils";

export function BusinessPage() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const profile = useBusinessProfile(id, page, 12, refreshKey);

  if (profile.isLoading) {
    return <LoadingGrid />;
  }

  if (profile.error || !profile.data) {
    return (
      <ErrorState
        description={profile.error ?? "This business intelligence profile could not be loaded."}
        onRetry={() => setRefreshKey((value) => value + 1)}
      />
    );
  }

  const business = profile.data.data;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-visible">
          <CardContent className="space-y-8 p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge variant={business.riskLevel === "high" ? "danger" : business.riskLevel === "medium" ? "warning" : "success"}>
                  {business.riskLevel} risk
                </Badge>
                <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  {business.name}
                </h1>
                <p className="max-w-2xl text-muted-foreground">{business.description}</p>
                <div className="text-sm text-muted-foreground">
                  {business.category} · {business.location.label} · Synced {formatRelativeDate(business.lastSyncedAt)}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setRefreshKey((value) => value + 1)}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <ReportDialog
                  businessId={business.id}
                  onSubmitted={() => setRefreshKey((value) => value + 1)}
                />
                {business.website ? (
                  <Button asChild>
                    <a href={business.website} rel="noreferrer" target="_blank">
                      Visit source
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Card className="bg-white/6">
                <CardContent className="p-6">
                  <ScoreRing value={business.healthScore} label="Health score" />
                </CardContent>
              </Card>
              <Card className="bg-white/6">
                <CardContent className="p-6">
                  <ScoreRing
                    value={business.trustScore}
                    label="Trust score"
                    tone={business.trustScore < 45 ? "danger" : "default"}
                  />
                </CardContent>
              </Card>
              <Card className="bg-white/6">
                <CardContent className="space-y-2 p-6">
                  <div className="text-sm text-muted-foreground">Trend</div>
                  <div className="font-display text-3xl font-semibold capitalize">{business.trend}</div>
                  <p className="text-sm text-muted-foreground">
                    Active alerts: {business.alerts.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/6">
                <CardContent className="space-y-2 p-6">
                  <div className="text-sm text-muted-foreground">Hiring velocity</div>
                  <div className="font-display text-3xl font-semibold">
                    {business.hiringInsights.velocityPerWeek}/wk
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {business.hiringInsights.classification}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signal geography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BusinessMap businesses={[business]} heightClassName="h-[420px]" />
            <div className="rounded-2xl bg-white/6 p-4 text-sm text-muted-foreground">
              This business is mapped with color-coded health scoring and refreshed source metadata.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Trust and health trend</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Health score snapshots</div>
              <TrendLine
                points={business.trendSnapshots.map((snapshot) => ({
                  date: snapshot.createdAt.slice(5, 10),
                  value: snapshot.healthScore,
                }))}
              />
            </div>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Complaint velocity</div>
              <MiniBars
                points={business.trendSnapshots.slice(-7).map((snapshot) => ({
                  date: snapshot.createdAt.slice(5, 10),
                  value: snapshot.complaintVelocity,
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert intelligence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {business.alerts.length ? (
              business.alerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "danger"
                          : alert.severity === "warning"
                            ? "warning"
                            : "info"
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(alert.createdAt)}
                    </span>
                  </div>
                  <div className="font-medium">{alert.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{alert.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No unresolved alerts right now.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Source breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {business.sourceBreakdown.map((source) => (
              <div key={source.source} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-medium capitalize">{source.source}</div>
                  <div className="text-sm text-muted-foreground">{source.signalCount} signals</div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Sentiment: {source.weightedSentiment.toFixed(2)}</div>
                  <div>Complaints: {source.complaintCount}</div>
                  <div>Response rate: {source.responseRate}%</div>
                  <div>Activity: {source.activityLevel}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiring Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="info">{business.hiringInsights.classification}</Badge>
            <p className="text-sm text-muted-foreground">{business.hiringInsights.summary}</p>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">30-day hiring trend</div>
                <TrendLine points={business.hiringTrends.series30d} accentClassName="stroke-mint-300" />
              </div>
              <div className="space-y-3">
                {business.hiringInsights.openRoles.slice(0, 5).map((role) => (
                  <div key={role.externalId} className="rounded-2xl bg-white/6 p-3">
                    <div className="font-medium">{role.role}</div>
                    <div className="text-xs text-muted-foreground">
                      {role.department} · {role.seniority} · {role.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest signal feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {business.signalFeed.data.map((signal) => (
              <div key={signal.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="default">{signal.source}</Badge>
                    <Badge
                      variant={
                        signal.severity === "high"
                          ? "danger"
                          : signal.severity === "medium"
                            ? "warning"
                            : "info"
                      }
                    >
                      {signal.severity}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(signal.occurredAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{signal.content}</p>
                {signal.sourceUrl ? (
                  <a
                    className="mt-3 inline-flex text-sm text-pulse-200 hover:text-white"
                    href={signal.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open source
                  </a>
                ) : null}
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>
                Previous signals
              </Button>
              <Button
                variant="outline"
                disabled={!business.signalFeed.meta.hasNextPage}
                onClick={() => setPage((value) => value + 1)}
              >
                More signals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {business.reports.length ? (
              business.reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant={report.type === "scam_flag" ? "danger" : report.type === "complaint" ? "warning" : "info"}>
                      {report.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(report.createdAt)}
                    </span>
                  </div>
                  <div className="font-medium">{report.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{report.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No user-submitted reports have been filed for this business yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
