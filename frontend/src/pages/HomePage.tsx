import { ArrowRight, Radar, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { BusinessCard } from "@/components/business-card";
import { BusinessMap } from "@/components/business-map";
import { EmptyState, LoadingGrid } from "@/components/page-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchStore } from "@/store/useSearchStore";

export function HomePage() {
  const navigate = useNavigate();
  const { query, location, setLocation, setQuery } = useSearchStore();
  const debouncedQuery = useDebouncedValue(query);
  const debouncedLocation = useDebouncedValue(location);
  const suggestions = useBusinesses({
    query: debouncedQuery,
    location: debouncedLocation,
    pageSize: 5,
    enabled: debouncedQuery.length > 1 || debouncedLocation.length > 1,
  });
  const featured = useBusinesses({
    pageSize: 3,
  });

  function submitSearch() {
    navigate(
      `/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
    );
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-visible bg-gradient-to-br from-white/8 to-white/4">
          <CardContent className="space-y-8 p-8 sm:p-10">
            <Badge variant="info">Realtime intelligence layer</Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                Monitor business health, risk, and hiring momentum from live market signals.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                PulsePoint blends review sentiment, complaint pressure, news exposure,
                community chatter, and hiring activity into one operational trust layer.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                aria-label="Business search query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by business name"
              />
              <Input
                aria-label="Search location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, state"
              />
              <Button size="lg" onClick={submitSearch}>
                Analyze
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {suggestions.data?.data?.length ? (
              <div className="glass-panel grid gap-3 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Autocomplete
                </div>
                {suggestions.data.data.map((business) => (
                  <button
                    key={business.id}
                    className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3 text-left transition hover:bg-white/10"
                    onClick={() => navigate(`/business/${business.id}`)}
                  >
                    <div>
                      <div className="font-medium">{business.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {business.location.label}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Health</div>
                      <div className="font-semibold">{business.healthScore}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Weighted trust score", value: "Live" },
                { icon: Radar, label: "Source anomaly alerts", value: "15 min" },
                { icon: Workflow, label: "Hiring intelligence", value: "Integrated" },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                  <item.icon className="mb-4 h-5 w-5 text-pulse-300" />
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">What PulsePoint surfaces</div>
                <h2 className="section-title">Signal fusion overview</h2>
              </div>
              <Sparkles className="h-5 w-5 text-mint-300" />
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Google and Yelp contribute higher-confidence review and operational signals.
                Reddit and news provide reputation volatility. Hiring data explains whether a
                company is expanding, contracting, or churning leadership.
              </p>
              <p>
                Every signal is weighted by source reliability and time decay, then rolled
                into alerting, score snapshots, and a business-level trust model.
              </p>
            </div>
            <BusinessMap businesses={featured.data?.data ?? []} heightClassName="h-[300px]" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Recently tracked businesses</div>
            <h2 className="section-title">Live business cards</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Open dashboard
          </Button>
        </div>

        {featured.isLoading ? (
          <LoadingGrid />
        ) : featured.data?.data.length ? (
          <div className="grid gap-6 xl:grid-cols-3">
            {featured.data.data.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No businesses tracked yet"
            description="Run a live business search to create your first monitored profile and populate the dashboard."
            actionLabel="Start with search"
            onAction={() => navigate("/search")}
          />
        )}
      </section>
    </div>
  );
}
