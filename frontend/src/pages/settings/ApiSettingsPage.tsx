import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { apiAction, useUserSettings } from "@/hooks/useUserData";
import { api } from "@/lib/api";
import { SettingsCard } from "@/pages/SettingsShared";
import { useState } from "react";

export function ApiSettingsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const settings = useUserSettings(refreshKey);
  const { pushToast } = useToast();

  if (settings.isLoading || !settings.data) {
    return <div className="text-sm text-muted-foreground">Loading API settings...</div>;
  }

  return (
    <SettingsCard title="API settings">
      <div className="rounded-2xl bg-white/6 p-4 text-sm">
        <div className="font-medium">Current API key</div>
        <div className="mt-2 break-all text-muted-foreground">{settings.data.data.apiKey ?? "No key generated yet."}</div>
      </div>
      <div className="text-sm text-muted-foreground">
        Usage count: {settings.data.data.apiUsageCount}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={async () => {
            try {
              await apiAction(() => api.post("/user/api-key"));
              pushToast({ title: "API key generated", tone: "success" });
              setRefreshKey((value) => value + 1);
            } catch (error) {
              pushToast({ title: "Failed to create key", description: (error as Error).message, tone: "error" });
            }
          }}
        >
          Generate API key
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await apiAction(() => api.delete("/user/api-key"));
              pushToast({ title: "API key revoked", tone: "success" });
              setRefreshKey((value) => value + 1);
            } catch (error) {
              pushToast({ title: "Failed to revoke key", description: (error as Error).message, tone: "error" });
            }
          }}
        >
          Revoke API key
        </Button>
      </div>
    </SettingsCard>
  );
}

