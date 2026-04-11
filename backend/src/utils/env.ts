import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const numberFromString = (fallback: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }, z.number());

const booleanFromString = (fallback: boolean) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return fallback;
    }

    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }

    return fallback;
  }, z.boolean());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: numberFromString(5000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  YELP_API_KEY: z.string().optional(),
  NEWS_API_KEY: z.string().optional(),
  ENABLE_SYNC_JOBS: booleanFromString(true),
  SYNC_LOOKBACK_MINUTES: numberFromString(15),
  CACHE_TTL_SECONDS: numberFromString(600),
  SEARCH_CACHE_TTL_SECONDS: numberFromString(300),
  LINKEDIN_JOBS_URL_TEMPLATE: z.string().optional(),
  INDEED_JOBS_URL_TEMPLATE: z
    .string()
    .default("https://www.indeed.com/jobs?q={query}&l={location}"),
  DEMO_USER_EMAIL: z.string().default("demo@pulsepoint.app"),
  DEMO_USER_NAME: z.string().default("PulsePoint Demo"),
  DEMO_USER_USERNAME: z.string().default("pulsepoint-demo"),
});

export const env = envSchema.parse(process.env);
