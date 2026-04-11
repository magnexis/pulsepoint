import {
  Bell,
  Clock3,
  LayoutDashboard,
  Settings,
  Star,
  TriangleAlert,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/watchlist", label: "Watchlist", icon: Star },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/reports", label: "Reports", icon: TriangleAlert },
  { to: "/history", label: "History", icon: Clock3 },
  { to: "/settings/profile", label: "Settings", icon: Settings },
];

export function WorkspaceLayout() {
  return <AppLayout titlePrefix="User Workspace" navItems={navItems} />;
}

