import type { Request, Response } from "express";

import { getOwnerAnalytics, getOwnerOverview, getOwnerResponses } from "../services/owner.service.js";
import { getUserSettings } from "../services/user.service.js";
import { sendApiError } from "../utils/apiError.js";

export async function ownerOverviewController(request: Request, response: Response) {
  try {
    response.json({ data: await getOwnerOverview(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function ownerAnalyticsController(request: Request, response: Response) {
  try {
    response.json({ data: await getOwnerAnalytics(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function ownerResponsesController(request: Request, response: Response) {
  try {
    response.json({ data: await getOwnerResponses(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function ownerSettingsController(request: Request, response: Response) {
  try {
    response.json({ data: await getUserSettings(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

