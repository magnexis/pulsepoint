import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../utils/prisma.js";
import { generateApiKey } from "./auth.service.js";
import { getHistory, recordHistory } from "./history.service.js";

const settingsSchema = z.object({
  profile: z.object({
    name: z.string().min(2).max(80),
    username: z.string().min(3).max(40),
    bio: z.string().max(280).default(""),
    profileImage: z.string().url().optional().or(z.literal("")),
  }),
  account: z.object({
    email: z.email(),
  }),
  notifications: z.object({
    emailAlerts: z.boolean(),
    riskAlerts: z.boolean(),
    hiringAlerts: z.boolean(),
  }),
  privacy: z.object({
    visibility: z.enum(["public", "private"]),
    shareData: z.boolean(),
  }),
  security: z.object({
    twoFactorEnabled: z.boolean(),
    password: z.string().min(6).optional(),
  }),
  preferences: z.object({
    theme: z.string().default("midnight"),
    plan: z.string().default("growth"),
  }),
});

export type SettingsInput = z.input<typeof settingsSchema>;

function normalizeSettings(settings: {
  notifications: unknown;
  privacy: unknown;
  preferences: unknown;
  apiKey: string | null;
  apiKeyCreatedAt: Date | null;
  apiUsageCount: number;
  twoFactorEnabled: boolean;
}) {
  return {
    notifications:
      settings.notifications && typeof settings.notifications === "object"
        ? settings.notifications
        : {},
    privacy:
      settings.privacy && typeof settings.privacy === "object" ? settings.privacy : {},
    preferences:
      settings.preferences && typeof settings.preferences === "object"
        ? settings.preferences
        : {},
    apiKey: settings.apiKey,
    apiKeyCreatedAt: settings.apiKeyCreatedAt?.toISOString() ?? null,
    apiUsageCount: settings.apiUsageCount,
    twoFactorEnabled: settings.twoFactorEnabled,
  };
}

export async function getUserSettings(userId: string) {
  const [user, settings, watchlist, history] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.userSettings.findUnique({
      where: { userId },
    }),
    prisma.watchlist.count({
      where: { userId },
    }),
    getHistory(userId),
  ]);

  if (!user || !settings) {
    throw new Error("User settings not found.");
  }

  return {
    profile: {
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    },
    ...normalizeSettings(settings),
    watchlistCount: watchlist,
    recentHistory: history.slice(0, 8),
  };
}

export async function updateUserSettings(userId: string, input: SettingsInput) {
  const payload = settingsSchema.parse(input);

  const [user, settings] = await Promise.all([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.profile.name,
        username: payload.profile.username,
        email: payload.account.email,
        bio: payload.profile.bio,
        profileImage: payload.profile.profileImage || null,
        isPrivate: payload.privacy.visibility === "private",
        isSharingData: payload.privacy.shareData,
        password: payload.security.password
          ? payload.security.password
          : undefined,
      },
    }),
    prisma.userSettings.update({
      where: { userId },
      data: {
        notifications: payload.notifications as Prisma.InputJsonValue,
        privacy: {
          visibility: payload.privacy.visibility,
          shareData: payload.privacy.shareData,
        } as Prisma.InputJsonValue,
        preferences: payload.preferences as Prisma.InputJsonValue,
        twoFactorEnabled: payload.security.twoFactorEnabled,
      },
    }),
  ]);

  await recordHistory({
    userId,
    actionType: "SETTINGS_UPDATED",
    label: "Updated account settings",
  });

  return {
    profile: {
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    },
    ...normalizeSettings(settings),
  };
}

export async function createUserApiKey(userId: string) {
  const apiKey = generateApiKey();
  const settings = await prisma.userSettings.update({
    where: { userId },
    data: {
      apiKey,
      apiKeyCreatedAt: new Date(),
      apiUsageCount: {
        increment: 1,
      },
    },
  });

  return {
    apiKey,
    apiKeyCreatedAt: settings.apiKeyCreatedAt?.toISOString() ?? null,
  };
}

export async function deleteUserApiKey(userId: string) {
  await prisma.userSettings.update({
    where: { userId },
    data: {
      apiKey: null,
      apiKeyCreatedAt: null,
    },
  });

  return { success: true };
}

