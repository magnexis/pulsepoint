import type { Request, Response } from "express";
import { z } from "zod";

import { getCurrentUser, loginUser, registerUser, revokeSession } from "../services/auth.service.js";
import { sendApiError } from "../utils/apiError.js";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

const sessionSchema = z.object({
  sessionId: z.string().min(1),
});

export async function loginController(request: Request, response: Response) {
  try {
    const payload = loginSchema.parse(request.body);
    response.json({ data: await loginUser(payload) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function registerController(request: Request, response: Response) {
  try {
    const payload = registerSchema.parse(request.body);
    response.status(201).json({ data: await registerUser(payload) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function currentUserController(request: Request, response: Response) {
  try {
    response.json({ data: await getCurrentUser(request.currentUser!.id) });
  } catch (error) {
    sendApiError(response, error);
  }
}

export async function revokeSessionController(request: Request, response: Response) {
  try {
    const payload = sessionSchema.parse(request.body);
    response.json({ data: await revokeSession(request.currentUser!.id, payload.sessionId) });
  } catch (error) {
    sendApiError(response, error);
  }
}

