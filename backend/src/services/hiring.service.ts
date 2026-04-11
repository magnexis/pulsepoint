import { prisma } from "../utils/prisma.js";
import { analyzeHiringSignals } from "./ai/hiringAnalysis.service.js";

function serializeHiringSignal(signal: {
  id: string;
  source: { toString(): string };
  role: string;
  frequency: number;
  department: string;
  seniority: { toString(): string };
  occurredAt: Date;
  metadata: unknown;
}) {
  return {
    id: signal.id,
    source: signal.source.toString().toLowerCase(),
    role: signal.role,
    frequency: signal.frequency,
    department: signal.department,
    seniority: signal.seniority.toString().toLowerCase(),
    timestamp: signal.occurredAt.getTime(),
    metadata:
      signal.metadata && typeof signal.metadata === "object"
        ? signal.metadata
        : undefined,
  };
}

function buildHiringTrendSeries(
  signals: Array<ReturnType<typeof serializeHiringSignal>>,
  days: number,
) {
  const buckets = new Map<string, number>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    buckets.set(date, 0);
  }

  for (const signal of signals) {
    const date = new Date(signal.timestamp).toISOString().slice(0, 10);

    if (!buckets.has(date)) {
      continue;
    }

    buckets.set(date, (buckets.get(date) ?? 0) + signal.frequency);
  }

  return Array.from(buckets.entries()).map(([date, value]) => ({
    date,
    value,
  }));
}

export async function getHiringInsights(businessId: string) {
  const hiringSignals = await prisma.hiringSignal.findMany({
    where: {
      businessId,
    },
    orderBy: {
      occurredAt: "desc",
    },
    take: 120,
  });

  const serializedSignals = hiringSignals.map(serializeHiringSignal);
  const normalizedSignals = serializedSignals.map((signal) => ({
    externalId: signal.id,
    source: signal.source as "linkedin" | "indeed",
    role: signal.role,
    frequency: signal.frequency,
    timestamp: signal.timestamp,
    seniority: signal.seniority as "entry" | "mid" | "senior",
    department: signal.department,
    metadata:
      signal.metadata && typeof signal.metadata === "object"
        ? (signal.metadata as Record<string, unknown>)
        : undefined,
  }));
  const analysis = analyzeHiringSignals(normalizedSignals);

  return {
    summary: analysis.summary,
    classification: analysis.classification,
    velocityPerWeek: analysis.velocityPerWeek,
    growthRate: analysis.growthRate,
    openRoles: analysis.openRoles,
    recentSignals: serializedSignals.slice(0, 20),
  };
}

export async function getHiringTrends(businessId: string) {
  const hiringSignals = await prisma.hiringSignal.findMany({
    where: {
      businessId,
    },
    orderBy: {
      occurredAt: "desc",
    },
    take: 180,
  });

  const serializedSignals = hiringSignals.map(serializeHiringSignal);

  return {
    series7d: buildHiringTrendSeries(serializedSignals, 7),
    series30d: buildHiringTrendSeries(serializedSignals, 30),
    roles: serializedSignals.slice(0, 24),
  };
}

