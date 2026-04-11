import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { Input, SaveSettingsButton, SettingsCard, SettingsLoadBoundary } from "@/pages/SettingsShared";
import { useAuthStore } from "@/store/useAuthStore";

export function AccountSettingsPage() {
  const { logout } = useAuthStore();
  const { pushToast } = useToast();
  return (
    <SettingsLoadBoundary>
      {({ settings, onSaved }) => {
        const [email, setEmail] = useState(settings.data.profile.email);
        const [username, setUsername] = useState(settings.data.profile.username);
        return (
          <SettingsCard title="Account settings">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" />
            <div className="flex flex-wrap gap-3">
              <SaveSettingsButton
                onSaved={onSaved}
                payload={{
                  ...settings.data,
                  profile: { ...settings.data.profile, username },
                  account: { email },
                  security: { twoFactorEnabled: settings.data.twoFactorEnabled },
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  pushToast({
                    title: "Account removed locally",
                    description: "For safety, delete account currently signs you out and clears the local session.",
                    tone: "info",
                  });
                }}
              >
                Delete account
              </Button>
            </div>
          </SettingsCard>
        );
      }}
    </SettingsLoadBoundary>
  );
}

