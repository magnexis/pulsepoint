import type { Request } from "express";

import { env } from "./env.js";
import { prisma } from "./prisma.js";

type CurrentUser = Awaited<ReturnType<typeof ensureDemoUser>>;

declare global {
  namespace Express {
    interface Request {
      currentUser?: CurrentUser;
    }
  }
}

function defaultSettingsPayload() {
  return {
    notifications: {
      emailAlerts: true,
      riskAlerts: true,
      hiringAlerts: true,
    },
    privacy: {
      visibility: "private",
      shareData: true,
    },
    preferences: {
      theme: "midnight",
      plan: "growth",
    },
  };
}

export async function ensureDemoUser() {
  const user = await prisma.user.upsert({
    where: {
      email: env.DEMO_USER_EMAIL,
    },
    update: {
      name: env.DEMO_USER_NAME,
      username: env.DEMO_USER_USERNAME,
    },
    create: {
      name: env.DEMO_USER_NAME,
      email: env.DEMO_USER_EMAIL,
      username: env.DEMO_USER_USERNAME,
      password: "demo-password",
    },
  });

  await prisma.userSettings.upsert({
    where: {
      userId: user.id,
    },
    update: {},
    create: {
      userId: user.id,
      ...defaultSettingsPayload(),
    },
  });

  return user;
}

export async function resolveCurrentUser(request: Request) {
  const requestedUserId = request.header("x-user-id");

  if (requestedUserId) {
    const user = await prisma.user.findUnique({
      where: {
        id: requestedUserId,
      },
    });

    if (user) {
      return user;
    }
  }

  return ensureDemoUser();
}

export async function attachCurrentUser(request: Request) {
  request.currentUser = await resolveCurrentUser(request);
}
