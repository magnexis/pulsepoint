import { AlertSeverity, type PrismaClient } from "@prisma/client";

import type { analyzeTrends } from "./trend.service.js";

type TrendAnalysis = ReturnType<typeof analyzeTrends>;

type AnalyticsInput = {
  healthScore: number;
  trustScore: number;
  complaintSpike: number;
  complaintVelocity: number;
};

type AlertCandidate = {
  severity: AlertSeverity;
  category: string;
  title: string;
  description: string;
  metricDelta?: number;
  baseline?: number;
};

function buildAlertCandidates(
  analytics: AnalyticsInput,
  trendAnalysis: TrendAnalysis,
): AlertCandidate[] {
  const alerts: AlertCandidate[] = [];

  if (analytics.complaintSpike >= 0.85) {
    alerts.push({
      severity: AlertSeverity.CRITICAL,
      category: "complaint_spike",
      title: "Critical complaint spike detected",
      description:
        "Complaint-related signals are materially above the rolling baseline and need investigation.",
      metricDelta: analytics.complaintVelocity,
      baseline: analytics.complaintSpike,
    });
  } else if (analytics.complaintSpike >= 0.35) {
    alerts.push({
      severity: AlertSeverity.WARNING,
      category: "complaint_spike",
      title: "Complaint pressure is increasing",
      description:
        "Complaint-related signals are trending above baseline and could reduce trust if they persist.",
      metricDelta: analytics.complaintVelocity,
      baseline: analytics.complaintSpike,
    });
  }

  if (analytics.healthScore < 45 || analytics.trustScore < 40) {
    alerts.push({
      severity: AlertSeverity.CRITICAL,
      category: "trust_decline",
      title: "Business health entered a high-risk band",
      description:
        "Current trust and health scores indicate elevated operational or reputational risk.",
      metricDelta: analytics.healthScore,
      baseline: analytics.trustScore,
    });
  }

  for (const indicator of trendAnalysis.indicators) {
    alerts.push({
      severity:
        indicator.severity === "critical"
          ? AlertSeverity.CRITICAL
          : indicator.severity === "warning"
            ? AlertSeverity.WARNING
            : AlertSeverity.INFO,
      category: indicator.category,
      title:
        indicator.category === "sentiment_drop"
          ? "Sentiment dropped versus baseline"
          : indicator.category === "complaint_spike"
            ? "Complaint activity accelerated"
            : "Signal inactivity detected",
      description: indicator.message,
      metricDelta: indicator.delta,
    });
  }

  if (alerts.length === 0 && analytics.healthScore >= 75) {
    alerts.push({
      severity: AlertSeverity.INFO,
      category: "stability",
      title: "Healthy baseline maintained",
      description:
        "Signals remain stable with no active anomalies across the monitoring window.",
      metricDelta: analytics.healthScore,
    });
  }

  return alerts;
}

export async function syncAlertsForBusiness(
  prisma: PrismaClient,
  businessId: string,
  analytics: AnalyticsInput,
  trendAnalysis: TrendAnalysis,
) {
  const candidates = buildAlertCandidates(analytics, trendAnalysis);
  const recentAlerts = await prisma.alert.findMany({
    where: {
      businessId,
      resolvedAt: null,
      createdAt: {
        gte: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    },
  });

  const activeKeys = new Set(candidates.map((candidate) => `${candidate.category}:${candidate.title}`));

  const staleAlerts = recentAlerts.filter(
    (alert) => !activeKeys.has(`${alert.category}:${alert.title}`),
  );

  if (staleAlerts.length > 0) {
    await prisma.alert.updateMany({
      where: {
        id: {
          in: staleAlerts.map((alert) => alert.id),
        },
      },
      data: {
        resolvedAt: new Date(),
      },
    });
  }

  const existingKeys = new Set(
    recentAlerts.map((alert) => `${alert.category}:${alert.title}`),
  );
  const alertsToCreate = candidates.filter(
    (candidate) => !existingKeys.has(`${candidate.category}:${candidate.title}`),
  );

  if (alertsToCreate.length > 0) {
    await prisma.alert.createMany({
      data: alertsToCreate.map((alert) => ({
        businessId,
        severity: alert.severity,
        category: alert.category,
        title: alert.title,
        description: alert.description,
        metricDelta: alert.metricDelta,
        baseline: alert.baseline,
      })),
    });
  }

  return prisma.alert.findMany({
    where: {
      businessId,
      resolvedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });
}
