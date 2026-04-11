import type { Request, Response } from "express";
import { z } from "zod";

import {
  getBusinessAnalytics,
  getBusinessProfile,
  searchBusinesses,
} from "../services/business.service.js";
import { recordHistory } from "../services/history.service.js";
import { sendApiError } from "../utils/apiError.js";

const searchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(8),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});
const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function listBusinessesController(
  request: Request,
  response: Response,
) {
  try {
    const query = searchSchema.parse(request.query);
    const result = await searchBusinesses(query);
    await recordHistory({
      userId: request.currentUser!.id,
      actionType: "SEARCH",
      label: `Searched for ${query.query || "all businesses"} in ${query.location || "all locations"}`,
      metadata: {
        query: query.query,
        location: query.location,
      },
    });
    response.json(result);
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function getBusinessController(
  request: Request,
  response: Response,
) {
  try {
    const pagination = paginationSchema.parse(request.query);
    const params = paramsSchema.parse(request.params);
    const result = await getBusinessProfile(
      params.id,
      pagination.page,
      pagination.pageSize,
    );
    await recordHistory({
      userId: request.currentUser!.id,
      businessId: params.id,
      actionType: "VIEW_BUSINESS",
      label: `Viewed business intelligence profile`,
    });
    response.json(result);
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function getAnalyticsController(
  request: Request,
  response: Response,
) {
  try {
    const params = paramsSchema.parse(request.params);
    const result = await getBusinessAnalytics(params.id);
    response.json(result);
  } catch (error) {
    sendApiError(response, error);
  }
}
