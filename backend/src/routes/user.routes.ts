import { Router } from "express";

import {
  addWatchlistController,
  createApiKeyController,
  deleteApiKeyController,
  getAlertsController,
  getHistoryController,
  getUserSettingsController,
  getUserReportsController,
  getWatchlistController,
  markAlertReadController,
  removeWatchlistController,
  updateUserSettingsController,
} from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/user/settings", getUserSettingsController);
userRouter.put("/user/settings", updateUserSettingsController);
userRouter.post("/user/api-key", createApiKeyController);
userRouter.delete("/user/api-key", deleteApiKeyController);
userRouter.get("/watchlist", getWatchlistController);
userRouter.post("/watchlist", addWatchlistController);
userRouter.delete("/watchlist/:id", removeWatchlistController);
userRouter.get("/alerts", getAlertsController);
userRouter.post("/alerts/read", markAlertReadController);
userRouter.get("/history", getHistoryController);
userRouter.get("/user/reports", getUserReportsController);
