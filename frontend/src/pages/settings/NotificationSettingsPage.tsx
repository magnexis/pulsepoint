import { useState } from "react";

import { SaveSettingsButton, SettingsCard, SettingsLoadBoundary } from "@/pages/SettingsShared";

export function NotificationSettingsPage() {
  return (
    <SettingsLoadBoundary>
      {({ settings, onSaved }) => {
        const [notifications, setNotifications] = useState(settings.data.notifications);
        return (
          <SettingsCard title="Notification settings">
            {[
              { key: "emailAlerts", label: "Email alerts" },
              { key: "riskAlerts", label: "Risk alerts" },
              { key: "hiringAlerts", label: "Hiring alerts" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                <span>{item.label}</span>
                <input
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(event) =>
                    setNotifications((current) => ({
                      ...current,
                      [item.key]: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
              </label>
            ))}
            <SaveSettingsButton
              onSaved={onSaved}
              payload={{
                ...settings.data,
                notifications,
                account: { email: settings.data.profile.email },
                security: { twoFactorEnabled: settings.data.twoFactorEnabled },
              }}
            />
          </SettingsCard>
        );
      }}
    </SettingsLoadBoundary>
  );
}

