import { Home, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-2xl">
        <CardContent className="space-y-6 p-10 text-center">
          <div className="text-sm uppercase tracking-[0.28em] text-pulse-200">404</div>
          <h1 className="font-display text-5xl font-semibold tracking-tight">
            This route is not part of the PulsePoint network.
          </h1>
          <p className="text-muted-foreground">
            Every production route in this app is wired intentionally. The path you tried does
            not exist, so we routed you to a styled fallback instead of a broken screen.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/search">
                <Search className="h-4 w-4" />
                Search businesses
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
