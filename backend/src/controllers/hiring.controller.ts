import type { Request, Response } from "express";

import {
  getHiringInsights,
  getHiringTrends,
} from "../services/hiring.service.js";
import { syncBusinessIntelligence } from "../services/businessSync.service.js";
import { sendApiError } from "../utils/apiError.js";
import { z } from "zod";

const paramsSchema = z.object({
  businessId: z.string().min(1),
});

export async function getHiringInsightsController(
  request: Request,
  response: Response,
) {
  try {
    const params = paramsSchema.parse(request.params);
    await syncBusinessIntelligence(params.businessId);
    const result = await getHiringInsights(params.businessId);
    response.json({
      data: result,
    });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function getHiringTrendsController(
  request: Request,
  response: Response,
) {
  try {
    const params = paramsSchema.parse(request.params);
    await syncBusinessIntelligence(params.businessId);
    const result = await getHiringTrends(params.businessId);
    response.json({
      data: result,
    });
  } catch (error) {
    sendApiError(response, error);
  }
}
