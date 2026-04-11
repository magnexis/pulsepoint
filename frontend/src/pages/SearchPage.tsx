import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { BusinessCard } from "@/components/business-card";
import { BusinessMap } from "@/components/business-map";
import { EmptyState, ErrorState, LoadingGrid } from "@/components/page-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useSearchStore } from "@/store/useSearchStore";

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { query, location, page, pageSize, setLocation, setPage, setQuery } =
    useSearchStore();

  useEffect(() => {
    setQuery(searchParams.get("query") ?? "");
    setLocation(searchParams.get("location") ?? "");
    setPage(Number(searchParams.get("page") ?? 1));
  }, [searchParams, setLocation, setPage, setQuery]);

  const businesses = useBusinesses({
    query,
    location,
    page,
    pageSize,
  });

  function runSearch(nextPage = 1) {
    navigate(
      `/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&page=${nextPage}`,
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto]">
          <Input
            aria-label="Search by business name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Business name or category"
          />
          <Input
            aria-label="Search by location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location"
          />
          <Button onClick={() => runSearch(1)}>Refresh live search</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geographic signal coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessMap businesses={businesses.data?.data ?? []} />
        </CardContent>
      </Card>

      {businesses.isLoading ? (
        <LoadingGrid />
      ) : businesses.error ? (
        <ErrorState description={businesses.error} onRetry={() => runSearch(page)} />
      ) : businesses.data?.data.length ? (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            {businesses.data.data.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
          <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
            <div className="text-sm text-muted-foreground">
              Showing page {businesses.data.meta.page} of{" "}
              {Math.max(Math.ceil(businesses.data.meta.total / businesses.data.meta.pageSize), 1)}
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                disabled={page <= 1}
                onClick={() => runSearch(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!businesses.data.meta.hasNextPage}
                onClick={() => runSearch(page + 1)}
              >
                Next page
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No live businesses matched"
          description="Try broadening the business name, using a nearby city, or searching by category."
          actionLabel="Back to home"
          onAction={() => navigate("/")}
        />
      )}
    </div>
  );
}
