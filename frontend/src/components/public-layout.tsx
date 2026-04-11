import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, BriefcaseBusiness, Layers3, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { ProfileDropdown } from "@/components/profile-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/api-docs", label: "API Docs" },
];

export function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-pulse-300 to-mint-300 p-2 text-slate-950">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold">PulsePoint</div>
              <div className="text-xs text-muted-foreground">Business Intelligence</div>
            </div>
          </NavLink>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    isActive ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden w-full max-w-sm items-center gap-2 xl:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Global business search"
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate(`/search?query=${encodeURIComponent(search)}`);
                  }
                }}
                placeholder="Search businesses globally"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <NavLink to="/dashboard">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </NavLink>
            </Button>
            <Button asChild>
              <NavLink to="/search">
                <ShieldCheck className="h-4 w-4" />
                Analyze business
              </NavLink>
            </Button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="border-t border-white/10 bg-slate-950/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-pulse-300" />
            <span>Live signals, hiring intelligence, and anomaly monitoring.</span>
          </div>
          <div className="flex gap-4">
            <NavLink to="/api-docs" className="hover:text-white">
              API Docs
            </NavLink>
            <NavLink to="/pricing" className="hover:text-white">
              Pricing
            </NavLink>
            <NavLink to="/about" className="hover:text-white">
              About
            </NavLink>
            <NavLink to="/contact" className="hover:text-white">
              Contact
            </NavLink>
            <NavLink to="/admin" className="hover:text-white">
              Admin
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
