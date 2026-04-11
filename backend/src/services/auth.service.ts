import crypto from "node:crypto";

import { prisma } from "../utils/prisma.js";
import { recordHistory } from "./history.service.js";

function createSessionLabel() {
  return `Web session ${new Date().toLocaleDateString("en-US")}`;
}

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  profileImage: string | null;
  isPrivate: boolean;
  isSharingData: boolean;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio,
    profileImage: user.profileImage,
    isPrivate: user.isPrivate,
    isSharingData: user.isSharingData,
  };
}

async function createSession(userId: string) {
  return prisma.loginSession.create({
    data: {
      userId,
      label: createSessionLabel(),
      ipAddress: "127.0.0.1",
    },
  });
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user || user.password !== input.password) {
    throw new Error("Invalid email or password.");
  }

  if (user.isBanned) {
    throw new Error("This account has been suspended.");
  }

  const session = await createSession(user.id);
  await recordHistory({
    userId: user.id,
    actionType: "LOGIN",
    label: "Logged into PulsePoint",
  });

  return {
    user: serializeUser(user),
    session: {
      id: session.id,
      label: session.label,
    },
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  username: string;
  password: string;
}) {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      username: input.username,
      password: input.password,
      settings: {
        create: {
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
            plan: "starter",
          },
        },
      },
    },
  });

  const session = await createSession(user.id);
  await recordHistory({
    userId: user.id,
    actionType: "REGISTER",
    label: "Created a PulsePoint account",
  });

  return {
    user: serializeUser(user),
    session: {
      id: session.id,
      label: session.label,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      sessions: {
        orderBy: { lastSeenAt: "desc" },
        take: 8,
      },
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    user: serializeUser(user),
    sessions: user.sessions.map((session) => ({
      id: session.id,
      label: session.label,
      status: session.status.toLowerCase(),
      lastSeenAt: session.lastSeenAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
    })),
  };
}

export async function revokeSession(userId: string, sessionId: string) {
  await prisma.loginSession.updateMany({
    where: {
      id: sessionId,
      userId,
    },
    data: {
      status: "REVOKED",
    },
  });

  return { success: true };
}

export function generateApiKey() {
  return `pp_live_${crypto.randomBytes(18).toString("hex")}`;
}

