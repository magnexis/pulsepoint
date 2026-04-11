import { useState } from "react";
import { Link } from "react-router-dom";

import { ErrorState, LoadingGrid } from "@/components/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/toast-provider";
import { useWatchlist } from "@/hooks/useUserData";
import { apiAction } from "@/hooks/useUserData";
import { api } from "@/lib/api";

export function WatchlistPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { pushToast } = useToast();
  const watchlist = useWatchlist(refreshKey);

  if (watchlist.isLoading) return <LoadingGrid />;
  if (watchlist.error || !watchlist.data) return <ErrorState description={watchlist.error ?? "Failed to load watchlist."} onRetry={() => setRefreshKey((value) => value + 1)} />;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {watchlist.data.data.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.business.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{item.business.description}</p>
            <div className="text-sm text-muted-foreground">
              {item.business.location} · Health {item.business.healthScore} · Alerts {item.business.activeAlerts}
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link to={`/business/${item.business.id}`}>Open business</Link>
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await apiAction(() => api.delete(`/watchlist/${item.id}`));
                    pushToast({
                      title: "Removed from watchlist",
                      description: `${item.business.name} is no longer in your saved list.`,
                      tone: "success",
                    });
                    setRefreshKey((value) => value + 1);
                  } catch (error) {
                    pushToast({ title: "Removal failed", description: (error as Error).message, tone: "error" });
                  }
                }}
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

