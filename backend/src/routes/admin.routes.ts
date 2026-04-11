import { Router } from "express";

import {
  adminBusinessesController,
  adminOverviewController,
  adminReportsController,
  adminSystemController,
  adminUsersController,
  banUserController,
  editBusinessScoreController,
  removeReportController,
} from "../controllers/admin.controller.js";

export const adminRouter = Router();

adminRouter.get("/admin", adminOverviewController);
adminRouter.get("/admin/users", adminUsersController);
adminRouter.get("/admin/businesses", adminBusinessesController);
adminRouter.get("/admin/reports", adminReportsController);
adminRouter.get("/admin/system", adminSystemController);
adminRouter.post("/admin/users/:id/ban", banUserController);
adminRouter.delete("/admin/reports/:id", removeReportController);
adminRouter.put("/admin/business-score", editBusinessScoreController);
