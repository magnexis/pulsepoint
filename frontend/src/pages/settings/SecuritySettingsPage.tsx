import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { apiAction, useCurrentUser } from "@/hooks/useUserData";
import { api } from "@/lib/api";
import { Input, SaveSettingsButton, SettingsCard, SettingsLoadBoundary } from "@/pages/SettingsShared";

export function SecuritySettingsPage() {
  const { pushToast } = useToast();
  const [currentRefresh, setCurrentRefresh] = useState(0);
  const currentUser = useCurrentUser(currentRefresh);

  return (
    <SettingsLoadBoundary refreshKey={currentRefresh}>
      {({ settings, onSaved }) => {
        const [password, setPassword] = useState("");
        const [twoFactorEnabled, setTwoFactorEnabled] = useState(settings.data.twoFactorEnabled);

        return (
          <SettingsCard title="Security settings">
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Change password" />
            <label className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
              <span>Enable 2FA simulation</span>
              <input checked={twoFactorEnabled} onChange={(event) => setTwoFactorEnabled(event.target.checked)} type="checkbox" />
            </label>
            <SaveSettingsButton
              onSaved={() => {
                onSaved();
                setCurrentRefresh((value) => value + 1);
              }}
              payload={{
                ...settings.data,
                account: { email: settings.data.profile.email },
                security: { twoFactorEnabled, password: password || undefined },
              }}
            />
            <div className="space-y-3 pt-4">
              <div className="text-sm text-muted-foreground">Login sessions</div>
              {currentUser.data?.data.sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                  <div>
                    <div className="font-medium">{session.label}</div>
                    <div className="text-xs text-muted-foreground">{session.status}</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await apiAction(() => api.post("/auth/revoke-session", { sessionId: session.id }));
                        pushToast({ title: "Session revoked", tone: "success" });
                        setCurrentRefresh((value) => value + 1);
                      } catch (error) {
                        pushToast({ title: "Action failed", description: (error as Error).message, tone: "error" });
                      }
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </SettingsCard>
        );
      }}
    </SettingsLoadBoundary>
  );
}

