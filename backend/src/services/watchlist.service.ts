import { prisma } from "../utils/prisma.js";
import { recordHistory } from "./history.service.js";

export async function getWatchlist(userId: string) {
  const items = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      business: {
        include: {
          alerts: {
            where: { resolvedAt: null },
            take: 3,
          },
          signals: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map((item) => ({
    id: item.id,
    createdAt: item.createdAt.toISOString(),
    business: {
      id: item.business.id,
      name: item.business.name,
      category: item.business.category,
      description: item.business.description,
      healthScore: item.business.healthScore,
      trustScore: item.business.trustScore,
      riskLevel: item.business.riskLevel.toLowerCase(),
      trend: item.business.trend.toLowerCase(),
      location: `${item.business.city}, ${item.business.state}`,
      activeAlerts: item.business.alerts.length,
    },
  }));
}

export async function addWatchlistItem(userId: string, businessId: string) {
  const item = await prisma.watchlist.upsert({
    where: {
      userId_businessId: {
        userId,
        businessId,
      },
    },
    update: {},
    create: {
      userId,
      businessId,
    },
  });

  const business = await prisma.business.findUniqueOrThrow({
    where: { id: businessId },
  });

  await recordHistory({
    userId,
    businessId,
    actionType: "SAVE_WATCHLIST",
    label: `Saved ${business.name} to watchlist`,
  });

  return item;
}

export async function removeWatchlistItem(userId: string, watchlistId: string) {
  const item = await prisma.watchlist.findFirst({
    where: {
      id: watchlistId,
      userId,
    },
    include: {
      business: true,
    },
  });

  if (!item) {
    throw new Error("Watchlist item not found.");
  }

  await prisma.watchlist.delete({
    where: { id: watchlistId },
  });

  await recordHistory({
    userId,
    businessId: item.businessId,
    actionType: "REMOVE_WATCHLIST",
    label: `Removed ${item.business.name} from watchlist`,
  });

  return { success: true };
}

