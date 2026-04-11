import {
  HiringSeniority,
  HiringSource,
  Prisma,
  RiskLevel,
  SignalSeverity,
  SignalSource,
  SignalTone,
  SignalType,
  TrendDirection,
} from "@prisma/client";

import type { HiringSignal } from "../models/hiring.js";
import type { UnifiedSignal } from "../models/signal.js";
import { prisma } from "../utils/prisma.js";
import { analyzeHiringSignals } from "./ai/hiringAnalysis.service.js";
import { calculateAdvancedHealthScore } from "./aggregation/aggregation.service.js";
import { linkedInHiringService } from "./dataSources/hiring/linkedin.service.js";
import { indeedHiringService } from "./dataSources/hiring/indeed.service.js";
import { googleReviewsService } from "./dataSources/googleReviews.service.js";
import { newsService } from "./dataSources/news.service.js";
import { redditService } from "./dataSources/reddit.service.js";
import { yelpService } from "./dataSources/yelp.service.js";
import { syncAlertsForBusiness } from "./alert.service.js";
import { analyzeTrends } from "./trend.service.js";

function toSignalSource(source: UnifiedSignal["source"]) {
  return {
    google: SignalSource.GOOGLE,
    yelp: SignalSource.YELP,
    reddit: SignalSource.REDDIT,
    news: SignalSource.NEWS,
  }[source];
}

function toSignalSeverity(severity: UnifiedSignal["severity"]) {
  return {
    low: SignalSeverity.LOW,
    medium: SignalSeverity.MEDIUM,
    high: SignalSeverity.HIGH,
  }[severity];
}

function toSignalTone(tone: UnifiedSignal["tone"]) {
  return {
    angry: SignalTone.ANGRY,
    neutral: SignalTone.NEUTRAL,
    positive: SignalTone.POSITIVE,
  }[tone];
}

function toSignalType(type: UnifiedSignal["type"]) {
  return {
    review: SignalType.REVIEW,
    discussion: SignalType.DISCUSSION,
    article: SignalType.ARTICLE,
    update: SignalType.UPDATE,
  }[type];
}

function toHiringSource(source: HiringSignal["source"]) {
  return source === "linkedin" ? HiringSource.LINKEDIN : HiringSource.INDEED;
}

function toHiringSeniority(seniority: HiringSignal["seniority"]) {
  return {
    entry: HiringSeniority.ENTRY,
    mid: HiringSeniority.MID,
    senior: HiringSeniority.SENIOR,
  }[seniority];
}

function toRiskLevel(level: "low" | "medium" | "high") {
  return {
    low: RiskLevel.LOW,
    medium: RiskLevel.MEDIUM,
    high: RiskLevel.HIGH,
  }[level];
}

function toTrendDirection(direction: "improving" | "declining" | "stable") {
  return {
    improving: TrendDirection.IMPROVING,
    declining: TrendDirection.DECLINING,
    stable: TrendDirection.STABLE,
  }[direction];
}

function mapSignalLogToUnifiedSignal(signal: {
  source: SignalSource;
  externalId: string;
  signalType: SignalType;
  tone: SignalTone;
  severity: SignalSeverity;
  sentiment: number;
  content: string;
  sourceUrl: string | null;
  metadata: unknown;
  occurredAt: Date;
}): UnifiedSignal {
  return {
    externalId: signal.externalId,
    source: signal.source.toLowerCase() as UnifiedSignal["source"],
    sentiment: signal.sentiment,
    content: signal.content,
    timestamp: signal.occurredAt.getTime(),
    severity: signal.severity.toLowerCase() as UnifiedSignal["severity"],
    tone: signal.tone.toLowerCase() as UnifiedSignal["tone"],
    type: signal.signalType.toLowerCase() as UnifiedSignal["type"],
    url: signal.sourceUrl ?? undefined,
    metadata:
      signal.metadata && typeof signal.metadata === "object"
        ? (signal.metadata as Record<string, unknown>)
        : undefined,
  };
}

function mapHiringSignal(signal: {
  source: HiringSource;
  externalId: string;
  role: string;
  frequency: number;
  occurredAt: Date;
  seniority: HiringSeniority;
  department: string;
  metadata: unknown;
}): HiringSignal {
  return {
    externalId: signal.externalId,
    source: signal.source.toLowerCase() as HiringSignal["source"],
    role: signal.role,
    frequency: signal.frequency,
    timestamp: signal.occurredAt.getTime(),
    seniority: signal.seniority.toLowerCase() as HiringSignal["seniority"],
    department: signal.department,
    metadata:
      signal.metadata && typeof signal.metadata === "object"
        ? (signal.metadata as Record<string, unknown>)
        : undefined,
  };
}

export async function syncBusinessIntelligence(
  businessId: string,
  force = false,
) {
  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  if (
    !force &&
    business.lastSyncedAt &&
    Date.now() - business.lastSyncedAt.getTime() < 15 * 60 * 1000
  ) {
    return null;
  }

  const signalSettled = await Promise.allSettled([
    googleReviewsService.fetchSignals(business),
    yelpService.fetchSignals(business),
    redditService.fetchSignals(business),
    newsService.fetchSignals(business),
  ]);

  const hiringSettled = await Promise.allSettled([
    linkedInHiringService.fetchSignals(business),
    indeedHiringService.fetchSignals(business),
  ]);

  const signalBatches = signalSettled
    .flatMap((result) => {
      if (result.status === "fulfilled") {
        return [result.value];
      }

      console.error("Signal sync failure", result.reason);
      return [];
    });
  const hiringSignals = hiringSettled.flatMap((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    console.error("Hiring sync failure", result.reason);
    return [];
  });

  const flattenedSignals = signalBatches.flatMap((batch) => batch.signals);

  if (flattenedSignals.length > 0) {
    await prisma.signalLog.createMany({
      data: flattenedSignals.map((signal) => ({
        businessId,
        source: toSignalSource(signal.source),
        externalId: signal.externalId,
        signalType: toSignalType(signal.type),
        tone: toSignalTone(signal.tone),
        severity: toSignalSeverity(signal.severity),
        sentiment: signal.sentiment,
        content: signal.content,
        sourceUrl: signal.url,
        metadata: signal.metadata as Prisma.InputJsonValue | undefined,
        occurredAt: new Date(signal.timestamp),
      })),
      skipDuplicates: true,
    });
  }

  if (hiringSignals.length > 0) {
    await prisma.hiringSignal.createMany({
      data: hiringSignals.map((signal) => ({
        businessId,
        source: toHiringSource(signal.source),
        externalId: signal.externalId,
        role: signal.role,
        frequency: signal.frequency,
        department: signal.department,
        seniority: toHiringSeniority(signal.seniority),
        occurredAt: new Date(signal.timestamp),
        metadata: signal.metadata as Prisma.InputJsonValue | undefined,
      })),
      skipDuplicates: true,
    });
  }

  for (const batch of signalBatches) {
    await prisma.signal.upsert({
      where: {
        businessId_source: {
          businessId,
          source: toSignalSource(batch.source),
        },
      },
      update: {
        signalCount: batch.sourceSummary.signalCount,
        weightedSentiment: batch.sourceSummary.weightedSentiment,
        complaintCount: batch.sourceSummary.complaintCount,
        responseRate: batch.sourceSummary.responseRate,
        activityLevel: batch.sourceSummary.activityLevel,
        lastCapturedAt: batch.sourceSummary.lastCapturedAt
          ? new Date(batch.sourceSummary.lastCapturedAt)
          : null,
      },
      create: {
        businessId,
        source: toSignalSource(batch.source),
        signalCount: batch.sourceSummary.signalCount,
        weightedSentiment: batch.sourceSummary.weightedSentiment,
        complaintCount: batch.sourceSummary.complaintCount,
        responseRate: batch.sourceSummary.responseRate,
        activityLevel: batch.sourceSummary.activityLevel,
        lastCapturedAt: batch.sourceSummary.lastCapturedAt
          ? new Date(batch.sourceSummary.lastCapturedAt)
          : null,
      },
    });
  }

  const [storedSignals, storedReports, storedHiringSignals] = await Promise.all([
    prisma.signalLog.findMany({
      where: {
        businessId,
        occurredAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        occurredAt: "desc",
      },
      take: 400,
    }),
    prisma.report.findMany({
      where: {
        businessId,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 120,
    }),
    prisma.hiringSignal.findMany({
      where: {
        businessId,
        occurredAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        occurredAt: "desc",
      },
      take: 200,
    }),
  ]);

  const normalizedSignals = storedSignals.map(mapSignalLogToUnifiedSignal);
  const normalizedHiringSignals = storedHiringSignals.map(mapHiringSignal);
  const analytics = calculateAdvancedHealthScore(
    normalizedSignals,
    normalizedHiringSignals,
    storedReports.map((report) => ({
      type: report.type,
      severity: report.severity,
      createdAt: report.createdAt.getTime(),
    })),
  );
  const trendAnalysis = analyzeTrends(normalizedSignals);
  const hiringAnalysis = analyzeHiringSignals(normalizedHiringSignals);

  await prisma.business.update({
    where: {
      id: businessId,
    },
    data: {
      healthScore: analytics.healthScore,
      trustScore: analytics.trustScore,
      riskLevel: toRiskLevel(analytics.riskLevel),
      trend: toTrendDirection(analytics.trend),
      responsivenessRate: analytics.responsiveness,
      activityLevel: analytics.activityConsistency,
      lastSignalAt: normalizedSignals[0]
        ? new Date(normalizedSignals[0].timestamp)
        : business.lastSignalAt,
      lastSyncedAt: new Date(),
    },
  });

  await prisma.trendSnapshot.create({
    data: {
      businessId,
      healthScore: analytics.healthScore,
      trustScore: analytics.trustScore,
      riskLevel: toRiskLevel(analytics.riskLevel),
      trend: toTrendDirection(analytics.trend),
      weightedSentiment: analytics.weightedSentiment,
      complaintVelocity: analytics.complaintVelocity,
      activityConsistency: analytics.activityConsistency,
      responsivenessRate: analytics.responsiveness,
    },
  });

  const alerts = await syncAlertsForBusiness(prisma, businessId, analytics, trendAnalysis);

  return {
    analytics,
    trendAnalysis,
    alerts,
    hiringAnalysis,
  };
}
