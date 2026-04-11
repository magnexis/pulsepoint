import { useState } from "react";

import { SaveSettingsButton, SettingsCard, SettingsLoadBoundary } from "@/pages/SettingsShared";

export function PrivacySettingsPage() {
  return (
    <SettingsLoadBoundary>
      {({ settings, onSaved }) => {
        const [visibility, setVisibility] = useState(settings.data.privacy.visibility);
        const [shareData, setShareData] = useState(settings.data.privacy.shareData);
        return (
          <SettingsCard title="Privacy settings">
            <select
              className="h-11 rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-white"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as "public" | "private")}
            >
              <option value="public">Public profile</option>
              <option value="private">Private profile</option>
            </select>
            <label className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
              <span>Allow data sharing</span>
              <input checked={shareData} onChange={(event) => setShareData(event.target.checked)} type="checkbox" />
            </label>
            <SaveSettingsButton
              onSaved={onSaved}
              payload={{
                ...settings.data,
                privacy: { visibility, shareData },
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

