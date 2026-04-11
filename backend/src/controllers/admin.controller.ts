import type { Request, Response } from "express";
import { z } from "zod";

import { banUser, editBusinessScore, getAdminBusinesses, getAdminOverview, getAdminReports, getAdminSystem, getAdminUsers, removeReport } from "../services/admin.service.js";
import { sendApiError } from "../utils/apiError.js";

const businessScoreSchema = z.object({
  businessId: z.string().min(1),
  healthScore: z.number().int().min(0).max(100),
  trustScore: z.number().int().min(0).max(100),
});

const idParams = z.object({
  id: z.string().min(1),
});

export async function adminOverviewController(_request: Request, response: Response) {
  try {
    response.json({ data: await getAdminOverview() });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function adminUsersController(_request: Request, response: Response) {
  try {
    response.json({ data: await getAdminUsers() });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function adminBusinessesController(_request: Request, response: Response) {
  try {
    response.json({ data: await getAdminBusinesses() });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function adminReportsController(_request: Request, response: Response) {
  try {
    response.json({ data: await getAdminReports() });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function adminSystemController(_request: Request, response: Response) {
  try {
    response.json({ data: await getAdminSystem() });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function banUserController(request: Request, response: Response) {
  try {
    const params = idParams.parse(request.params);
    response.json({ data: await banUser(params.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function removeReportController(request: Request, response: Response) {
  try {
    const params = idParams.parse(request.params);
    response.json({ data: await removeReport(params.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function editBusinessScoreController(request: Request, response: Response) {
  try {
    const payload = businessScoreSchema.parse(request.body);
    response.json({ data: await editBusinessScore(payload) });
  } catch (error) {
    sendApiError(response, error);
  }
}

