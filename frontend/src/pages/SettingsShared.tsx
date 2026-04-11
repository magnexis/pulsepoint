import { useEffect, useState } from "react";

import { ErrorState, LoadingGrid } from "@/components/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/toast-provider";
import { useUserSettings, useCurrentUser, apiAction } from "@/hooks/useUserData";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export function useSettingsResource(refreshKey = 0) {
  const settings = useUserSettings(refreshKey);
  const currentUser = useCurrentUser(refreshKey);
  return { settings, currentUser };
}

export function SettingsLoadBoundary({
  children,
  refreshKey = 0,
}: {
  children: (input: {
    settings: NonNullable<ReturnType<typeof useUserSettings>["data"]>;
    currentUser: NonNullable<ReturnType<typeof useCurrentUser>["data"]>;
    onSaved: () => void;
  }) => React.ReactNode;
  refreshKey?: number;
}) {
  const [version, setVersion] = useState(refreshKey);
  const resources = useSettingsResource(version);

  useEffect(() => {
    setVersion(refreshKey);
  }, [refreshKey]);

  if (resources.settings.isLoading || resources.currentUser.isLoading) return <LoadingGrid />;
  if (resources.settings.error || resources.currentUser.error || !resources.settings.data || !resources.currentUser.data) {
    return <ErrorState description={resources.settings.error ?? resources.currentUser.error ?? "Failed to load settings."} onRetry={() => setVersion((value) => value + 1)} />;
  }

  return <>{children({ settings: resources.settings.data, currentUser: resources.currentUser.data, onSaved: () => setVersion((value) => value + 1) })}</>;
}

export function SaveSettingsButton({
  payload,
  onSaved,
}: {
  payload: Record<string, unknown>;
  onSaved: () => void;
}) {
  const { pushToast } = useToast();
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Button
      disabled={isSaving}
      onClick={async () => {
        setIsSaving(true);
        try {
          const response = await apiAction(() => api.put("/user/settings", payload));
          if (user) {
            window.localStorage.setItem(
              "pulsepoint-user",
              JSON.stringify({
                ...user,
                ...((response as { data: { data: { profile: { name: string; email: string; username: string; bio: string; profileImage: string | null } } } }).data.data.profile),
              }),
            );
          }
          pushToast({ title: "Settings saved", tone: "success" });
          onSaved();
        } catch (error) {
          pushToast({ title: "Save failed", description: (error as Error).message, tone: "error" });
        } finally {
          setIsSaving(false);
        }
      }}
    >
      {isSaving ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export { Input, Textarea };

