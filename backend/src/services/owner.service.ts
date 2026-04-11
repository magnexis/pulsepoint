import { prisma } from "../utils/prisma.js";

export async function getOwnerOverview(userId: string) {
  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      business: {
        include: {
          trendSnapshots: {
            orderBy: { createdAt: "desc" },
            take: 14,
          },
          reports: {
            orderBy: { createdAt: "desc" },
            take: 6,
          },
          hiringSignals: {
            take: 12,
          },
        },
      },
    },
    take: 3,
  });

  return watchlist.map((item) => ({
    id: item.business.id,
    name: item.business.name,
    healthScore: item.business.healthScore,
    trustScore: item.business.trustScore,
    trend: item.business.trend.toLowerCase(),
    stats: {
      reports: item.business.reports.length,
      recentHiringSignalCount: item.business.hiringSignals.length,
    },
    snapshots: item.business.trendSnapshots
      .map((snapshot) => ({
        createdAt: snapshot.createdAt.toISOString(),
        healthScore: snapshot.healthScore,
        complaintVelocity: snapshot.complaintVelocity,
      }))
      .reverse(),
  }));
}

export async function getOwnerAnalytics(userId: string) {
  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      business: {
        include: {
          signals: true,
          trendSnapshots: {
            orderBy: { createdAt: "desc" },
            take: 30,
          },
        },
      },
    },
    take: 5,
  });

  return watchlist.map((item) => ({
    businessId: item.business.id,
    name: item.business.name,
    score: item.business.healthScore,
    sourceBreakdown: item.business.signals.map((signal) => ({
      source: signal.source.toLowerCase(),
      signalCount: signal.signalCount,
      weightedSentiment: signal.weightedSentiment,
    })),
    trendSnapshots: item.business.trendSnapshots
      .map((snapshot) => ({
        createdAt: snapshot.createdAt.toISOString(),
        healthScore: snapshot.healthScore,
        trustScore: snapshot.trustScore,
      }))
      .reverse(),
  }));
}

export async function getOwnerResponses(userId: string) {
  const reports = await prisma.report.findMany({
    where: {
      userId,
    },
    include: {
      business: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 40,
  });

  return reports.map((report) => ({
    id: report.id,
    business: report.business.name,
    title: report.title,
    status: report.status.toLowerCase(),
    type: report.type.toLowerCase(),
    createdAt: report.createdAt.toISOString(),
  }));
}
