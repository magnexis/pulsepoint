import type { Request, Response } from "express";

import { submitReport } from "../services/report.service.js";
import { sendApiError } from "../utils/apiError.js";

export async function submitReportController(
  request: Request,
  response: Response,
) {
  try {
    const result = await submitReport(request.body);
    response.status(201).json({
      data: result,
    });
  } catch (error) {
    sendApiError(response, error);
  }
}

