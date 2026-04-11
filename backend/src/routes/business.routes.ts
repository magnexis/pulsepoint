import { Router } from "express";

import {
  getBusinessController,
  listBusinessesController,
} from "../controllers/business.controller.js";

export const businessRouter = Router();

businessRouter.get("/businesses", listBusinessesController);
businessRouter.get("/business/:id", getBusinessController);

