import { Building2, Radar, Shield, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="text-sm uppercase tracking-[0.28em] text-pulse-200">About PulsePoint</div>
        <h1 className="font-display text-5xl font-semibold tracking-tight">
          PulsePoint is built for operators who need signal-backed business decisions.
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          We combine public reputation data, business instability signals, and hiring intelligence
          into a single operating layer for local-business risk analysis.
        </p>
      </section>
      <div className="grid gap-6 xl:grid-cols-4">
        {[
          { icon: Radar, title: "Signal Fusion", copy: "Reviews, news, forums, and hiring signals are normalized into one monitoring graph." },
          { icon: Shield, title: "Trust Analytics", copy: "Health and trust scores react to complaint spikes, response patterns, and inactivity." },
          { icon: Building2, title: "Owner Controls", copy: "Business owners get response workflows, settings, and visibility into complaint pressure." },
          { icon: Sparkles, title: "SaaS Ready", copy: "Separated frontend and backend architecture supports Vercel plus Railway or Render deployments." },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <item.icon className="h-5 w-5 text-pulse-300" />
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.copy}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

