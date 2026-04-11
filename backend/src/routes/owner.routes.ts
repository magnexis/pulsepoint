import { Router } from "express";

import {
  ownerAnalyticsController,
  ownerOverviewController,
  ownerResponsesController,
  ownerSettingsController,
} from "../controllers/owner.controller.js";

export const ownerRouter = Router();

ownerRouter.get("/owner", ownerOverviewController);
ownerRouter.get("/owner/analytics", ownerAnalyticsController);
ownerRouter.get("/owner/responses", ownerResponsesController);
ownerRouter.get("/owner/settings", ownerSettingsController);

