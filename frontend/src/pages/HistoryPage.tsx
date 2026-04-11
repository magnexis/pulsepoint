import { Link } from "react-router-dom";

import { ErrorState, LoadingGrid } from "@/components/page-states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistoryFeed } from "@/hooks/useUserData";
import { formatRelativeDate } from "@/lib/utils";

export function HistoryPage() {
  const history = useHistoryFeed();

  if (history.isLoading) return <LoadingGrid />;
  if (history.error || !history.data) return <ErrorState description={history.error ?? "Failed to load history."} onRetry={() => window.location.reload()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.data.data.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <div className="font-medium">{item.label}</div>
            <div className="mt-1 text-sm text-muted-foreground">{item.actionType.replaceAll("_", " ")}</div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</div>
              {item.business ? (
                <Link className="text-sm text-pulse-200 hover:text-white" to={`/business/${item.business.id}`}>
                  Open {item.business.name}
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
