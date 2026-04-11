import { Router } from "express";

import { getAnalyticsController } from "../controllers/business.controller.js";

export const analyticsRouter = Router();

analyticsRouter.get("/analytics/:id", getAnalyticsController);

