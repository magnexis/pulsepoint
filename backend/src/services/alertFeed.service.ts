import { AlertSeverity } from "@prisma/client";

import { prisma } from "../utils/prisma.js";

export async function getUserAlerts(userId: string, severity?: string) {
  const alerts = await prisma.alert.findMany({
    where: {
      resolvedAt: null,
      ...(severity && severity !== "all"
        ? {
            severity: AlertSeverity[severity.toUpperCase() as keyof typeof AlertSeverity],
          }
        : {}),
    },
    include: {
      business: true,
      reads: {
        where: { userId },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 80,
  });

  return alerts.map((alert) => ({
    id: alert.id,
    severity: alert.severity.toLowerCase(),
    category: alert.category,
    title: alert.title,
    description: alert.description,
    createdAt: alert.createdAt.toISOString(),
    business: {
      id: alert.business.id,
      name: alert.business.name,
    },
    isRead: alert.reads.length > 0,
  }));
}

export async function markAlertRead(userId: string, alertId: string) {
  await prisma.alertRead.upsert({
    where: {
      alertId_userId: {
        alertId,
        userId,
      },
    },
    update: {},
    create: {
      alertId,
      userId,
    },
  });

  return { success: true };
}

