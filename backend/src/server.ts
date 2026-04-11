import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { businessRouter } from "./routes/business.routes.js";
import { hiringRouter } from "./routes/hiring.routes.js";
import { ownerRouter } from "./routes/owner.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { startScheduler } from "./services/scheduler.service.js";
import { env } from "./utils/env.js";
import { attachCurrentUser } from "./utils/userContext.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "pulsepoint-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use(async (request, _response, next) => {
  try {
    await attachCurrentUser(request);
    next();
  } catch (error) {
    next(error);
  }
});

app.use(authRouter);
app.use(businessRouter);
app.use(analyticsRouter);
app.use(reportRouter);
app.use(hiringRouter);
app.use(userRouter);
app.use(ownerRouter);
app.use(adminRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled backend error", error);
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    },
  });
});

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested endpoint does not exist.",
    },
  });
});

app.listen(env.PORT, () => {
  console.log(`PulsePoint backend listening on http://localhost:${env.PORT}`);
  startScheduler();
});
