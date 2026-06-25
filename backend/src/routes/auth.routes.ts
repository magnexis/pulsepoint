import { Router } from "express";

import { currentUserController, loginController, registerController, revokeSessionController } from "../controllers/auth.controller.js";
import { attachCurrentUser } from "../utils/userContext.js";

export const authRouter = Router();

authRouter.post("/auth/login", loginController);
authRouter.post("/auth/register", registerController);
authRouter.get("/auth/me", attachCurrentUser, currentUserController);
authRouter.post("/auth/revoke-session", attachCurrentUser, revokeSessionController);