import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const endpoints = [
  "GET /businesses",
  "GET /business/:id",
  "GET /analytics/:id",
  "POST /report",
  "GET /hiring/:businessId",
  "GET /hiring/trends/:businessId",
];

export function ApiDocsPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="text-sm uppercase tracking-[0.28em] text-pulse-200">API Docs</div>
        <h1 className="font-display text-5xl font-semibold tracking-tight">
          REST endpoints for separated frontend and backend deployments.
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          The frontend calls the backend exclusively through Axios with
          <code className="mx-1 rounded bg-white/10 px-2 py-1">VITE_API_URL</code>.
          The backend exposes JSON-only routes on
          <code className="mx-1 rounded bg-white/10 px-2 py-1">PORT=5000</code>.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Environment setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Frontend: <code>VITE_API_URL=http://localhost:5000</code></p>
            <p>Backend: <code>PORT=5000</code></p>
            <p>Google and Yelp search require provider keys. News falls back to Google News RSS when a News API key is absent.</p>
            <p>Hiring intelligence uses LinkedIn guest jobs and Indeed RSS ingestion paths.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available endpoints</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {endpoints.map((endpoint) => (
              <div key={endpoint} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm">
                {endpoint}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/search">Try a live search</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin">Open admin view</Link>
        </Button>
      </div>
    </div>
  );
}

