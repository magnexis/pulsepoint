import { Router } from "express";

import { currentUserController, loginController, registerController, revokeSessionController } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/auth/login", loginController);
authRouter.post("/auth/register", registerController);
authRouter.get("/auth/me", currentUserController);
authRouter.post("/auth/revoke-session", revokeSessionController);

