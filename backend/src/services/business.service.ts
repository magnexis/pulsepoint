import { TrendDirection } from "@prisma/client";

import type {
  DiscoveredBusinessCandidate,
  SearchBusinessesParams,
} from "../models/business.js";
import { prisma } from "../utils/prisma.js";
import { slugify } from "../utils/slug.js";
import { syncBusinessIntelligence } from "./businessSync.service.js";
import { googleReviewsService } from "./dataSources/googleReviews.service.js";
import { yelpService } from "./dataSources/yelp.service.js";
import { getHiringInsights, getHiringTrends } from "./hiring.service.js";

function serializeBusiness(business: {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  latitude: number;
  longitude: number;
  website: string | null;
  phone: string | null;
  healthScore: number;
  trustScore: number;
  riskLevel: { toString(): string };
  trend: { toString(): string };
  lastSignalAt: Date | null;
  lastSyncedAt: Date | null;
  alerts?: Array<{ severity: { toString(): string }; title: string }>;
  signals?: Array<{
    source: { toString(): string };
    signalCount: number;
    weightedSentiment: number;
    complaintCount: number;
    responseRate: number;
    activityLevel: number;
  }>;
}) {
  return {
    id: business.id,
    name: business.name,
    category: business.category,
    description: business.description,
    address: business.address,
    location: {
      city: business.city,
      state: business.state,
      postalCode: business.postalCode,
      country: business.country,
      latitude: business.latitude,
      longitude: business.longitude,
      label: [business.city, business.state].filter(Boolean).join(", "),
    },
    website: business.website,
    phone: business.phone,
    healthScore: business.healthScore,
    trustScore: business.trustScore,
    riskLevel: business.riskLevel.toString().toLowerCase(),
    trend: business.trend.toString().toLowerCase(),
    lastSignalAt: business.lastSignalAt?.toISOString() ?? null,
    lastSyncedAt: business.lastSyncedAt?.toISOString() ?? null,
    sourceBreakdown:
      business.signals?.map((signal) => ({
        source: signal.source.toString().toLowerCase(),
        signalCount: signal.signalCount,
        weightedSentiment: signal.weightedSentiment,
        complaintCount: signal.complaintCount,
        responseRate: signal.responseRate,
        activityLevel: signal.activityLevel,
      })) ?? [],
    activeAlerts:
      business.alerts?.map((alert) => ({
        severity: alert.severity.toString().toLowerCase(),
        title: alert.title,
      })) ?? [],
  };
}

async function upsertBusinessFromCandidate(candidate: DiscoveredBusinessCandidate) {
  const slug = slugify(`${candidate.name}-${candidate.city}-${candidate.state}`);
  const orFilters: Array<{
    googlePlaceId?: string;
    yelpBusinessId?: string;
    slug?: string;
  }> = [{ slug }];

  if (candidate.googlePlaceId) {
    orFilters.push({ googlePlaceId: candidate.googlePlaceId });
  }

  if (candidate.yelpBusinessId) {
    orFilters.push({ yelpBusinessId: candidate.yelpBusinessId });
  }

  const existing = await prisma.business.findFirst({
    where: {
      OR: orFilters,
    },
  });

  const payload = {
    name: candidate.name,
    slug,
    category: candidate.category,
    description: candidate.description,
    address: candidate.address,
    city: candidate.city,
    state: candidate.state,
    postalCode: candidate.postalCode,
    country: candidate.country ?? "US",
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    website: candidate.website,
    phone: candidate.phone,
    googlePlaceId: candidate.googlePlaceId,
    yelpBusinessId: candidate.yelpBusinessId,
  };

  if (existing) {
    return prisma.business.update({
      where: {
        id: existing.id,
      },
      data: payload,
    });
  }

  return prisma.business.create({
    data: payload,
  });
}

async function discoverBusinesses(
  query: string,
  location: string,
  pageSize: number,
) {
  const discovered = await Promise.allSettled([
    googleReviewsService.searchBusinesses(query, location, pageSize),
    yelpService.searchBusinesses(query, location, pageSize),
  ]);
  const merged = new Map<string, DiscoveredBusinessCandidate>();

  for (const result of discovered) {
    if (result.status !== "fulfilled") {
      console.error("Business discovery failed", result.reason);
      continue;
    }

    for (const candidate of result.value) {
      const key = slugify(`${candidate.name}-${candidate.city}-${candidate.state}`);
      const existing = merged.get(key);

      merged.set(key, {
        ...(existing ?? {}),
        ...candidate,
        googlePlaceId: candidate.googlePlaceId ?? existing?.googlePlaceId,
        yelpBusinessId: candidate.yelpBusinessId ?? existing?.yelpBusinessId,
      });
    }
  }

  const candidates = Array.from(merged.values()).slice(0, pageSize);
  const businesses = [];

  for (const candidate of candidates) {
    businesses.push(await upsertBusinessFromCandidate(candidate));
  }

  return businesses;
}

export async function searchBusinesses(params: SearchBusinessesParams) {
  const query = params.query?.trim();
  const location = params.location?.trim();

  if (query || location) {
    const liveBusinesses = await discoverBusinesses(
      query ?? "",
      location ?? "",
      params.pageSize,
    );

    await Promise.allSettled(
      liveBusinesses.slice(0, Math.min(liveBusinesses.length, 4)).map((business) =>
        syncBusinessIntelligence(business.id, true),
      ),
    );
  }

  const where = {
    AND: [
      query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { category: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {},
      location
        ? {
            OR: [
              { city: { contains: location, mode: "insensitive" as const } },
              { state: { contains: location, mode: "insensitive" as const } },
              { address: { contains: location, mode: "insensitive" as const } },
            ],
          }
        : {},
    ],
  };

  const [total, businesses] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.findMany({
      where,
      include: {
        alerts: {
          where: {
            resolvedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
        signals: true,
      },
      orderBy: [
        {
          healthScore: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  return {
    data: businesses.map(serializeBusiness),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      hasNextPage: params.page * params.pageSize < total,
    },
  };
}

export async function getBusinessProfile(
  businessId: string,
  page: number,
  pageSize: number,
) {
  await syncBusinessIntelligence(businessId);

  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
    include: {
      alerts: {
        where: {
          resolvedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
      reports: {
        orderBy: {
          createdAt: "desc",
        },
        take: 12,
        include: {
          user: true,
        },
      },
      signals: true,
      trendSnapshots: {
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
      },
      signalLogs: {
        orderBy: {
          occurredAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      },
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  const [signalTotal, hiringInsights, hiringTrends] = await Promise.all([
    prisma.signalLog.count({
      where: {
        businessId,
      },
    }),
    getHiringInsights(businessId),
    getHiringTrends(businessId),
  ]);

  return {
    data: {
      ...serializeBusiness(business),
      reports: business.reports.map((report) => ({
        id: report.id,
        type: report.type.toLowerCase(),
        title: report.title,
        description: report.description,
        severity: report.severity,
        status: report.status.toLowerCase(),
        createdAt: report.createdAt.toISOString(),
        user: report.user
          ? {
              name: report.user.name,
              email: report.user.email,
            }
          : null,
      })),
      alerts: business.alerts.map((alert) => ({
        id: alert.id,
        severity: alert.severity.toLowerCase(),
        category: alert.category,
        title: alert.title,
        description: alert.description,
        metricDelta: alert.metricDelta,
        createdAt: alert.createdAt.toISOString(),
      })),
      trendSnapshots: business.trendSnapshots
        .map((snapshot) => ({
          id: snapshot.id,
          healthScore: snapshot.healthScore,
          trustScore: snapshot.trustScore,
          riskLevel: snapshot.riskLevel.toLowerCase(),
          trend: snapshot.trend.toLowerCase(),
          weightedSentiment: snapshot.weightedSentiment,
          complaintVelocity: snapshot.complaintVelocity,
          activityConsistency: snapshot.activityConsistency,
          responsivenessRate: snapshot.responsivenessRate,
          createdAt: snapshot.createdAt.toISOString(),
        }))
        .reverse(),
      signalFeed: {
        data: business.signalLogs.map((signal) => ({
          id: signal.id,
          source: signal.source.toLowerCase(),
          tone: signal.tone.toLowerCase(),
          severity: signal.severity.toLowerCase(),
          type: signal.signalType.toLowerCase(),
          sentiment: signal.sentiment,
          content: signal.content,
          occurredAt: signal.occurredAt.toISOString(),
          sourceUrl: signal.sourceUrl,
        })),
        meta: {
          page,
          pageSize,
          total: signalTotal,
          hasNextPage: page * pageSize < signalTotal,
        },
      },
      hiringInsights,
      hiringTrends,
    },
  };
}

export async function getBusinessAnalytics(businessId: string) {
  await syncBusinessIntelligence(businessId);

  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
    },
    include: {
      alerts: {
        where: {
          resolvedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
      signals: true,
      trendSnapshots: {
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
      },
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  const hiringInsights = await getHiringInsights(businessId);

  return {
    data: {
      id: business.id,
      healthScore: business.healthScore,
      trustScore: business.trustScore,
      riskLevel: business.riskLevel.toLowerCase(),
      trend:
        business.trend === TrendDirection.IMPROVING
          ? "improving"
          : business.trend === TrendDirection.DECLINING
            ? "declining"
            : "stable",
      sourceBreakdown: business.signals.map((signal) => ({
        source: signal.source.toLowerCase(),
        signalCount: signal.signalCount,
        weightedSentiment: signal.weightedSentiment,
        complaintCount: signal.complaintCount,
        responseRate: signal.responseRate,
        activityLevel: signal.activityLevel,
      })),
      alerts: business.alerts.map((alert) => ({
        id: alert.id,
        severity: alert.severity.toLowerCase(),
        category: alert.category,
        title: alert.title,
        description: alert.description,
        createdAt: alert.createdAt.toISOString(),
      })),
      trendSnapshots: business.trendSnapshots
        .map((snapshot) => ({
          createdAt: snapshot.createdAt.toISOString(),
          healthScore: snapshot.healthScore,
          trustScore: snapshot.trustScore,
          weightedSentiment: snapshot.weightedSentiment,
          complaintVelocity: snapshot.complaintVelocity,
          activityConsistency: snapshot.activityConsistency,
          responsivenessRate: snapshot.responsivenessRate,
        }))
        .reverse(),
      hiring: hiringInsights,
    },
  };
}
