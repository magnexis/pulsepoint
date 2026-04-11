import {
  Bell,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRoundCog,
  UserSquare2,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";

const navItems = [
  { to: "/settings/profile", label: "Profile", icon: UserSquare2 },
  { to: "/settings/account", label: "Account", icon: UserRoundCog },
  { to: "/settings/notifications", label: "Notifications", icon: Bell },
  { to: "/settings/privacy", label: "Privacy", icon: ShieldCheck },
  { to: "/settings/security", label: "Security", icon: LockKeyhole },
  { to: "/settings/api", label: "API", icon: KeyRound },
];

export function SettingsLayout() {
  return <AppLayout titlePrefix="Settings" navItems={navItems} />;
}
