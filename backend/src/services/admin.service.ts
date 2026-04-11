import { prisma } from "../utils/prisma.js";

export async function getAdminOverview() {
  const [users, businesses, reports, alerts] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.report.count(),
    prisma.alert.count({
      where: { resolvedAt: null },
    }),
  ]);

  return {
    metrics: {
      users,
      businesses,
      reports,
      alerts,
    },
  };
}

export async function getAdminUsers() {
  const users = await prisma.user.findMany({
    include: {
      settings: true,
      watchlistItems: true,
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    isBanned: user.isBanned,
    watchlistCount: user.watchlistItems.length,
    plan:
      user.settings?.preferences &&
      typeof user.settings.preferences === "object" &&
      "plan" in user.settings.preferences
        ? String((user.settings.preferences as Record<string, unknown>).plan)
        : "growth",
  }));
}

export async function getAdminBusinesses() {
  const businesses = await prisma.business.findMany({
    include: {
      alerts: {
        where: { resolvedAt: null },
      },
      reports: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 80,
  });

  return businesses.map((business) => ({
    id: business.id,
    name: business.name,
    healthScore: business.healthScore,
    trustScore: business.trustScore,
    riskLevel: business.riskLevel.toLowerCase(),
    reports: business.reports.length,
    alerts: business.alerts.length,
  }));
}

export async function getAdminReports() {
  const reports = await prisma.report.findMany({
    include: {
      business: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return reports.map((report) => ({
    id: report.id,
    title: report.title,
    type: report.type.toLowerCase(),
    status: report.status.toLowerCase(),
    severity: report.severity,
    business: report.business.name,
    user: report.user?.email ?? "anonymous",
    createdAt: report.createdAt.toISOString(),
  }));
}

export async function getAdminSystem() {
  const [sessions, settings] = await Promise.all([
    prisma.loginSession.count({
      where: { status: "ACTIVE" },
    }),
    prisma.userSettings.aggregate({
      _sum: {
        apiUsageCount: true,
      },
    }),
  ]);

  return {
    activeSessions: sessions,
    apiUsageCount: settings._sum.apiUsageCount ?? 0,
    scheduler: "15-minute cron",
    deploymentTargets: ["Vercel", "Railway/Render"],
  };
}

export async function banUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: true },
  });

  return { success: true };
}

export async function removeReport(reportId: string) {
  await prisma.report.delete({
    where: { id: reportId },
  });

  return { success: true };
}

export async function editBusinessScore(input: {
  businessId: string;
  healthScore: number;
  trustScore: number;
}) {
  const business = await prisma.business.update({
    where: { id: input.businessId },
    data: {
      healthScore: input.healthScore,
      trustScore: input.trustScore,
    },
  });

  return {
    id: business.id,
    healthScore: business.healthScore,
    trustScore: business.trustScore,
  };
}
