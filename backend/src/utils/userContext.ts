import type { Request, Response, NextFunction } from "express";

import { prisma } from "./prisma.js";
import { env } from "./env.js";
import { verifyToken } from "../services/auth.service.js";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  password: string;
  bio: string;
  profileImage: string | null;
  isPrivate: boolean;
  isSharingData: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

declare global {
  namespace Express {
    interface Request {
      currentUser?: CurrentUser;
    }
  }
}

export async function attachCurrentUser(request: Request, response: Response, next: NextFunction) {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) {
      response.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      response.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      response.status(401).json({ error: { code: "UNAUTHORIZED", message: "User not found." } });
      return;
    }

    request.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  if (request.currentUser?.role !== "ADMIN") {
    response.status(403).json({ error: { code: "FORBIDDEN", message: "Admin access required." } });
    return;
  }
  next();
}