import {
  Building,
  Gauge,
  Shield,
  Users,
  FileWarning,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";

const navItems = [
  { to: "/admin", label: "Overview", icon: Gauge },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/businesses", label: "Businesses", icon: Building },
  { to: "/admin/reports", label: "Reports", icon: FileWarning },
  { to: "/admin/system", label: "System", icon: Shield },
];

export function AdminLayout() {
  return <AppLayout titlePrefix="Admin Control Center" navItems={navItems} />;
}

