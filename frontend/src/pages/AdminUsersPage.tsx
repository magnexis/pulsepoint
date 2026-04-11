import { useState } from "react";

import { ErrorState, LoadingGrid } from "@/components/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/toast-provider";
import { apiAction, useAdminUsers } from "@/hooks/useUserData";
import { api } from "@/lib/api";

export function AdminUsersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const users = useAdminUsers(refreshKey);
  const { pushToast } = useToast();
  if (users.isLoading) return <LoadingGrid />;
  if (users.error || !users.data) return <ErrorState description={users.error ?? "Failed to load users."} onRetry={() => setRefreshKey((value) => value + 1)} />;

  return (
    <Card>
      <CardHeader><CardTitle>User controls</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {users.data.data.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email} · {user.plan}</div>
            </div>
            <Button
              variant="outline"
              disabled={user.isBanned}
              onClick={async () => {
                try {
                  await apiAction(() => api.post(`/admin/users/${user.id}/ban`));
                  pushToast({ title: "User banned", tone: "success" });
                  setRefreshKey((value) => value + 1);
                } catch (error) {
                  pushToast({ title: "Ban failed", description: (error as Error).message, tone: "error" });
                }
              }}
            >
              {user.isBanned ? "Banned" : "Ban user"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

