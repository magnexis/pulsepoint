import { Router } from "express";

import {
  getHiringInsightsController,
  getHiringTrendsController,
} from "../controllers/hiring.controller.js";

export const hiringRouter = Router();

hiringRouter.get("/hiring/:businessId", getHiringInsightsController);
hiringRouter.get("/hiring/trends/:businessId", getHiringTrendsController);

