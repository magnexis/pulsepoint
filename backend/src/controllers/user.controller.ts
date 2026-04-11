import type { Request, Response } from "express";
import { z } from "zod";

import { getUserAlerts, markAlertRead } from "../services/alertFeed.service.js";
import { getHistory } from "../services/history.service.js";
import { getUserReports } from "../services/report.service.js";
import { createUserApiKey, deleteUserApiKey, getUserSettings, updateUserSettings } from "../services/user.service.js";
import { addWatchlistItem, getWatchlist, removeWatchlistItem } from "../services/watchlist.service.js";
import { sendApiError } from "../utils/apiError.js";

const settingsSchema = z.object({
  profile: z.object({
    name: z.string().min(2).max(80),
    username: z.string().min(3).max(40),
    bio: z.string().max(280),
    profileImage: z.string().optional(),
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
    theme: z.string(),
    plan: z.string(),
  }),
});

const watchlistSchema = z.object({
  businessId: z.string().min(1),
});

const severityQuerySchema = z.object({
  severity: z.string().optional(),
});

const alertReadSchema = z.object({
  alertId: z.string().min(1),
});

const watchlistParamsSchema = z.object({
  id: z.string().min(1),
});

export async function getUserSettingsController(request: Request, response: Response) {
  try {
    response.json({ data: await getUserSettings(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function updateUserSettingsController(request: Request, response: Response) {
  try {
    const payload = settingsSchema.parse(request.body);
    response.json({ data: await updateUserSettings(request.currentUser!.id, payload) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function createApiKeyController(request: Request, response: Response) {
  try {
    response.status(201).json({ data: await createUserApiKey(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function deleteApiKeyController(request: Request, response: Response) {
  try {
    response.json({ data: await deleteUserApiKey(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function getWatchlistController(request: Request, response: Response) {
  try {
    response.json({ data: await getWatchlist(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function addWatchlistController(request: Request, response: Response) {
  try {
    const payload = watchlistSchema.parse(request.body);
    response.status(201).json({ data: await addWatchlistItem(request.currentUser!.id, payload.businessId) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function removeWatchlistController(request: Request, response: Response) {
  try {
    const params = watchlistParamsSchema.parse(request.params);
    response.json({ data: await removeWatchlistItem(request.currentUser!.id, params.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function getAlertsController(request: Request, response: Response) {
  try {
    const query = severityQuerySchema.parse(request.query);
    response.json({ data: await getUserAlerts(request.currentUser!.id, query.severity) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function markAlertReadController(request: Request, response: Response) {
  try {
    const payload = alertReadSchema.parse(request.body);
    response.json({ data: await markAlertRead(request.currentUser!.id, payload.alertId) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function getHistoryController(request: Request, response: Response) {
  try {
    response.json({ data: await getHistory(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function getUserReportsController(request: Request, response: Response) {
  try {
    response.json({ data: await getUserReports(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}
