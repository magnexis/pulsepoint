import { HistoryActionType, Prisma } from "@prisma/client";

import { prisma } from "../utils/prisma.js";

export async function recordHistory(input: {
  userId: string;
  actionType: keyof typeof HistoryActionType;
  label: string;
  businessId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.historyItem.create({
    data: {
      userId: input.userId,
      businessId: input.businessId,
      actionType: HistoryActionType[input.actionType],
      label: input.label,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function getHistory(userId: string) {
  const items = await prisma.historyItem.findMany({
    where: { userId },
    include: {
      business: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 80,
  });

  return items.map((item) => ({
    id: item.id,
    actionType: item.actionType.toLowerCase(),
    label: item.label,
    createdAt: item.createdAt.toISOString(),
    metadata:
      item.metadata && typeof item.metadata === "object" ? item.metadata : undefined,
    business: item.business
      ? {
          id: item.business.id,
          name: item.business.name,
          healthScore: item.business.healthScore,
        }
      : null,
  }));
}

