import { useState } from "react";

import { Input, SaveSettingsButton, SettingsCard, SettingsLoadBoundary, Textarea } from "@/pages/SettingsShared";

export function ProfileSettingsPage() {
  return (
    <SettingsLoadBoundary>
      {({ settings, onSaved }) => {
        const [name, setName] = useState(settings.data.profile.name);
        const [username, setUsername] = useState(settings.data.profile.username);
        const [bio, setBio] = useState(settings.data.profile.bio);
        const [profileImage, setProfileImage] = useState(settings.data.profile.profileImage ?? "");

        return (
          <SettingsCard title="Profile settings">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
            <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" />
            <Input value={profileImage} onChange={(event) => setProfileImage(event.target.value)} placeholder="Profile image URL" />
            <Textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Bio" />
            <SaveSettingsButton
              onSaved={onSaved}
              payload={{
                ...settings.data,
                profile: { name, username, bio, profileImage },
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

