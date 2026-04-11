import type { Response } from "express";
import { ZodError } from "zod";

export function sendApiError(response: Response, error: unknown) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: error.flatten(),
      },
    });
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  const status = message.toLowerCase().includes("not found") ? 404 : 500;

  return response.status(status).json({
    error: {
      code: status === 404 ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
      message,
    },
  });
}

