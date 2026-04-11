import { ChevronDown, LogOut, Settings, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { useAuthStore } from "@/store/useAuthStore";

export function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { user, logout } = useAuthStore();
  const initials = useMemo(() => {
    if (!user) {
      return "PP";
    }

    return user.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((value) => !value)}>
        <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{initials}</span>
        {user.name}
        <ChevronDown className="h-4 w-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-[24px] border border-white/10 bg-slate-950/95 p-3 shadow-glass backdrop-blur-xl">
          <div className="mb-3 rounded-2xl bg-white/6 p-3">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
          <div className="space-y-1">
            <Link
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-white/8"
              to="/dashboard"
              onClick={() => setOpen(false)}
            >
              <UserCircle2 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-white/8"
              to="/settings/profile"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm hover:bg-white/8"
              onClick={() => {
                logout();
                setOpen(false);
                pushToast({
                  title: "Signed out",
                  description: "Your local PulsePoint session has been cleared.",
                  tone: "success",
                });
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

