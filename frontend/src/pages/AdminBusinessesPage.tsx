import { useState } from "react";

import { ErrorState, LoadingGrid } from "@/components/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast-provider";
import { apiAction, useAdminBusinesses } from "@/hooks/useUserData";
import { api } from "@/lib/api";

export function AdminBusinessesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState<Record<string, { healthScore: string; trustScore: string }>>({});
  const businesses = useAdminBusinesses(refreshKey);
  const { pushToast } = useToast();
  if (businesses.isLoading) return <LoadingGrid />;
  if (businesses.error || !businesses.data) return <ErrorState description={businesses.error ?? "Failed to load businesses."} onRetry={() => setRefreshKey((value) => value + 1)} />;

  return (
    <div className="grid gap-4">
      {businesses.data.data.map((business) => (
        <Card key={business.id}>
          <CardHeader><CardTitle>{business.name}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={editing[business.id]?.healthScore ?? String(business.healthScore)}
                onChange={(event) =>
                  setEditing((current) => ({
                    ...current,
                    [business.id]: {
                      healthScore: event.target.value,
                      trustScore: current[business.id]?.trustScore ?? String(business.trustScore),
                    },
                  }))
                }
                placeholder="Health score"
              />
              <Input
                value={editing[business.id]?.trustScore ?? String(business.trustScore)}
                onChange={(event) =>
                  setEditing((current) => ({
                    ...current,
                    [business.id]: {
                      healthScore: current[business.id]?.healthScore ?? String(business.healthScore),
                      trustScore: event.target.value,
                    },
                  }))
                }
                placeholder="Trust score"
              />
            </div>
            <Button
              onClick={async () => {
                try {
                  const payload = editing[business.id] ?? {
                    healthScore: String(business.healthScore),
                    trustScore: String(business.trustScore),
                  };
                  await apiAction(() =>
                    api.put("/admin/business-score", {
                      businessId: business.id,
                      healthScore: Number(payload.healthScore),
                      trustScore: Number(payload.trustScore),
                    }),
                  );
                  pushToast({ title: "Business scores updated", tone: "success" });
                  setRefreshKey((value) => value + 1);
                } catch (error) {
                  pushToast({ title: "Update failed", description: (error as Error).message, tone: "error" });
                }
              }}
            >
              Save scores
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

