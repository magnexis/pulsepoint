import { z } from "zod";

import { prisma } from "../utils/prisma.js";
import { syncBusinessIntelligence } from "./businessSync.service.js";

function createReporterIdentity(email: string) {
  const emailPrefix = email.split("@")[0] ?? "reporter";
  const normalizedPrefix = emailPrefix.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const fallbackPrefix = normalizedPrefix.length > 0 ? normalizedPrefix : "reporter";
  const suffix = email.toLowerCase().replace(/[^a-z0-9]/g, "").slice(-6) || "user01";

  return {
    username: `${fallbackPrefix}-${suffix}`.slice(0, 40),
    password: `reporter-${suffix}`,
  };
}

const reportSchema = z.object({
  businessId: z.string().min(1),
  type: z.enum(["COMPLAINT", "FEEDBACK", "SCAM_FLAG"]),
  title: z.string().min(4).max(120),
  description: z.string().min(12).max(1200),
  severity: z.number().int().min(1).max(5),
  sentiment: z.number().int().min(-100).max(100).default(0),
  user: z.object({
    name: z.string().min(2).max(80),
    email: z.email(),
  }),
});

export type SubmitReportInput = z.input<typeof reportSchema>;

export async function submitReport(input: SubmitReportInput) {
  const payload = reportSchema.parse(input);

  const business = await prisma.business.findUnique({
    where: {
      id: payload.businessId,
    },
  });

  if (!business) {
    throw new Error("Business not found.");
  }

  const user = await prisma.user.upsert({
    where: {
      email: payload.user.email,
    },
    update: {
      name: payload.user.name,
    },
    create: {
      name: payload.user.name,
      email: payload.user.email,
      ...createReporterIdentity(payload.user.email),
    },
  });

  const report = await prisma.report.create({
    data: {
      businessId: payload.businessId,
      userId: user.id,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      sentiment: payload.sentiment,
    },
    include: {
      user: true,
    },
  });

  await syncBusinessIntelligence(payload.businessId, true);

  return {
    id: report.id,
    businessId: report.businessId,
    type: report.type.toLowerCase(),
    title: report.title,
    description: report.description,
    severity: report.severity,
    sentiment: report.sentiment,
    createdAt: report.createdAt.toISOString(),
    user: {
      name: report.user?.name ?? payload.user.name,
      email: report.user?.email ?? payload.user.email,
    },
  };
}

export async function getUserReports(userId: string) {
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
    take: 80,
  });

  return reports.map((report) => ({
    id: report.id,
    business: {
      id: report.business.id,
      name: report.business.name,
    },
    type: report.type.toLowerCase(),
    title: report.title,
    description: report.description,
    severity: report.severity,
    status: report.status.toLowerCase(),
    createdAt: report.createdAt.toISOString(),
  }));
}
