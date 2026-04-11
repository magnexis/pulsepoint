import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppLayout({
  titlePrefix,
  navItems,
  backToPublic = true,
}: {
  titlePrefix: string;
  navItems: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  backToPublic?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title = useMemo(() => {
    const current = navItems.find((item) => location.pathname.startsWith(item.to));
    return current ? current.label : titlePrefix;
  }, [location.pathname, navItems, titlePrefix]);

  return (
    <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-slate-950/92 p-6 backdrop-blur-xl transition-transform lg:static lg:w-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-10">
          <div className="font-display text-xl font-semibold">PulsePoint</div>
          <div className="text-xs text-muted-foreground">{titlePrefix}</div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:bg-white/6 hover:text-white",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/65 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                aria-label="Toggle navigation"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setOpen((value) => !value)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <div className="text-sm text-muted-foreground">{titlePrefix}</div>
                <h1 className="font-display text-2xl font-semibold">{title}</h1>
              </div>
            </div>
            {backToPublic ? (
              <Button asChild variant="outline">
                <NavLink to="/">Public site</NavLink>
              </Button>
            ) : null}
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="px-4 py-8 sm:px-6 lg:px-8"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
