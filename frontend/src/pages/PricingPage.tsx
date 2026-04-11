import { Check, Layers3, Rocket, Shield } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/toast-provider";

const tiers = [
  {
    name: "Starter",
    price: "$49",
    description: "For small operators monitoring a handful of locations.",
    features: ["10 tracked businesses", "Alert intelligence", "Weekly exports"],
    icon: Layers3,
  },
  {
    name: "Growth",
    price: "$149",
    description: "For teams that need hiring signals and source-level visibility.",
    features: [
      "100 tracked businesses",
      "Hiring intelligence",
      "7 and 30-day trend analytics",
    ],
    icon: Rocket,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For operators that need admin controls, API workflows, and SLA support.",
    features: ["Unlimited tracked businesses", "Admin workspace", "Priority onboarding"],
    icon: Shield,
  },
];

export function PricingPage() {
  const { pushToast } = useToast();
  return (
    <div className="space-y-10">
      <section className="space-y-4 text-center">
        <div className="text-sm uppercase tracking-[0.28em] text-pulse-200">Pricing</div>
        <h1 className="font-display text-5xl font-semibold tracking-tight">
          Plans for operators that need signal-backed decisions.
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          PulsePoint ships as a premium SaaS workflow with a separated frontend and API-first
          backend that is ready for Vercel plus Railway or Render deployments.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className="h-full">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/8 p-3">
                  <tier.icon className="h-5 w-5 text-pulse-300" />
                </div>
                <CardTitle>{tier.name}</CardTitle>
              </div>
              <div className="font-display text-4xl font-semibold">{tier.price}</div>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-mint-300" />
                  <span>{feature}</span>
                </div>
              ))}
              <Button
                className="mt-6 w-full"
                onClick={() => {
                  pushToast({
                    title: `${tier.name} upgrade`,
                    description: "Opening Stripe-compatible checkout flow.",
                    tone: "info",
                  });
                  window.open(import.meta.env.VITE_STRIPE_URL ?? "https://stripe.com/payments/checkout", "_blank", "noopener,noreferrer");
                }}
              >
                Upgrade plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link to="/contact">Talk to sales</Link>
        </Button>
      </div>
    </div>
  );
}
