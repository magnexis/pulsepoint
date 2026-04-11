import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingGrid } from "@/components/page-states";
import { Badge } from "@/components/ui/badge";
import { useOwnerResponses } from "@/hooks/useUserData";
import { formatRelativeDate } from "@/lib/utils";

export function OwnerResponsesPage() {
  const responses = useOwnerResponses();
  if (responses.isLoading) return <LoadingGrid />;
  if (responses.error || !responses.data) return <ErrorState description={responses.error ?? "Failed to load owner responses."} onRetry={() => window.location.reload()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {responses.data.data.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.business}</div>
              </div>
              <Badge variant={item.status === "resolved" ? "success" : item.status === "reviewed" ? "info" : "warning"}>
                {item.status}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

