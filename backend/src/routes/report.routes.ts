import { Router } from "express";

import { submitReportController } from "../controllers/report.controller.js";

export const reportRouter = Router();

reportRouter.post("/report", submitReportController);

