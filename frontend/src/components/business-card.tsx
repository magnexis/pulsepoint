import { ArrowUpRight, MapPin, ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiAction } from "@/hooks/useUserData";
import { api } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import type { BusinessSummary } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";

export function BusinessCard({ business }: { business: BusinessSummary }) {
  const { pushToast } = useToast();
  return (
    <Card className="transition-transform duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge variant={business.riskLevel === "high" ? "danger" : business.riskLevel === "medium" ? "warning" : "success"}>
              {business.riskLevel} risk
            </Badge>
            <CardTitle>{business.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{business.category}</p>
          </div>
          <div className="rounded-2xl bg-white/8 px-4 py-3 text-right">
            <div className="text-xs text-muted-foreground">Health</div>
            <div className="font-display text-2xl font-semibold">{business.healthScore}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{business.location.label}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Trust score</span>
            <span>{business.trustScore}</span>
          </div>
          <Progress value={business.trustScore} />
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            {business.activeAlerts.length > 0 ? (
              <ShieldAlert className="h-4 w-4 text-coral-400" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-mint-300" />
            )}
            <span>{business.activeAlerts[0]?.title ?? "No active alerts"}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(business.lastSyncedAt)}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild className="w-full">
            <Link to={`/business/${business.id}`}>
              Open business intelligence
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await apiAction(() => api.post("/watchlist", { businessId: business.id }));
                pushToast({
                  title: "Saved to watchlist",
                  description: `${business.name} is now in your monitored list.`,
                  tone: "success",
                });
              } catch (error) {
                pushToast({
                  title: "Save failed",
                  description: (error as Error).message,
                  tone: "error",
                });
              }
            }}
          >
            Save business
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
