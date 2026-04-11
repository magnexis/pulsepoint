import {
  BarChart3,
  Building2,
  MessageSquare,
  Settings2,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";

const navItems = [
  { to: "/owner", label: "Overview", icon: Building2 },
  { to: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/owner/responses", label: "Responses", icon: MessageSquare },
  { to: "/owner/settings", label: "Settings", icon: Settings2 },
];

export function OwnerLayout() {
  return <AppLayout titlePrefix="Owner Workspace" navItems={navItems} />;
}

