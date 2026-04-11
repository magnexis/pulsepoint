import { AlertTriangle, BriefcaseBusiness, ShieldCheck, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { BusinessCard } from "@/components/business-card";
import { BusinessMap } from "@/components/business-map";
import { EmptyState, ErrorState, LoadingGrid } from "@/components/page-states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinesses } from "@/hooks/useBusinesses";
import { formatNumber } from "@/lib/utils";

export function DashboardPage() {
  const navigate = useNavigate();
  const businesses = useBusinesses({
    pageSize: 9,
  });

  if (businesses.isLoading) {
    return <LoadingGrid />;
  }

  if (businesses.error) {
    return <ErrorState description={businesses.error} onRetry={() => window.location.reload()} />;
  }

  const items = businesses.data?.data ?? [];
  const averageHealth =
    items.reduce((sum, business) => sum + business.healthScore, 0) /
      Math.max(items.length, 1) || 0;
  const highRiskCount = items.filter((business) => business.riskLevel === "high").length;
  const openAlerts = items.reduce((sum, business) => sum + business.activeAlerts.length, 0);
  const expandingHiring = items.filter(
    (business) =>
      business.sourceBreakdown.some((source) => source.signalCount > 0) &&
      business.trend === "improving",
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Average health",
            value: formatNumber(averageHealth, 1),
            icon: TrendingUp,
          },
          {
            label: "High-risk businesses",
            value: highRiskCount,
            icon: AlertTriangle,
          },
          {
            label: "Active alerts",
            value: openAlerts,
            icon: ShieldCheck,
          },
          {
            label: "Improving profiles",
            value: expandingHiring,
            icon: BriefcaseBusiness,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-3 p-6">
              <item.icon className="h-5 w-5 text-pulse-300" />
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="font-display text-4xl font-semibold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio map</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessMap businesses={items} />
        </CardContent>
      </Card>

      {items.length ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {items.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="The dashboard is ready for tracked businesses"
          description="Search a business from the public site to populate this dashboard with live intelligence."
          actionLabel="Go to search"
          onAction={() => navigate("/search")}
        />
      )}
    </div>
  );
}

