import cron from "node-cron";

import { env } from "../utils/env.js";
import { prisma } from "../utils/prisma.js";
import { syncBusinessIntelligence } from "./businessSync.service.js";

export function startScheduler() {
  if (!env.ENABLE_SYNC_JOBS) {
    return;
  }

  cron.schedule("*/15 * * * *", async () => {
    try {
      const businesses = await prisma.business.findMany({
        orderBy: {
          lastSyncedAt: "asc",
        },
        take: 12,
      });

      for (const business of businesses) {
        try {
          await syncBusinessIntelligence(business.id, true);
        } catch (error) {
          console.error(`Scheduled sync failed for ${business.id}`, error);
        }
      }
    } catch (error) {
      console.error("Scheduler cycle failed", error);
    }
  });
}
