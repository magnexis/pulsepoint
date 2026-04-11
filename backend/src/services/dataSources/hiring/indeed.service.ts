import { XMLParser } from "fast-xml-parser";

import type { HiringSignal } from "../../../models/hiring.js";
import { cache } from "../../../utils/cache.js";
import { env } from "../../../utils/env.js";
import { fetchText } from "../../../utils/http.js";

type IndeedRss = {
  rss?: {
    channel?: {
      item?:
        | Array<{
            title?: string;
            description?: string;
            link?: string;
            pubDate?: string;
          }>
        | {
            title?: string;
            description?: string;
            link?: string;
            pubDate?: string;
          };
    };
  };
};

function inferSeniority(role: string): HiringSignal["seniority"] {
  const lowered = role.toLowerCase();

  if (/(director|head|principal|staff|lead|vp|chief|senior)/.test(lowered)) {
    return "senior";
  }

  if (/(associate|coordinator|specialist|analyst|manager|engineer ii|mid)/.test(lowered)) {
    return "mid";
  }

  return "entry";
}

function inferDepartment(role: string): string {
  const lowered = role.toLowerCase();

  if (/(engineer|developer|platform|software|data|devops)/.test(lowered)) {
    return "Engineering";
  }

  if (/(sales|account executive|bdr|growth)/.test(lowered)) {
    return "Sales";
  }

  if (/(marketing|brand|content|seo)/.test(lowered)) {
    return "Marketing";
  }

  if (/(operations|logistics|warehouse)/.test(lowered)) {
    return "Operations";
  }

  if (/(finance|accounting|controller)/.test(lowered)) {
    return "Finance";
  }

  if (/(support|customer|success|service)/.test(lowered)) {
    return "Support";
  }

  return "General";
}

export const indeedHiringService = {
  async fetchSignals(business: {
    name: string;
    city: string;
    state: string;
  }): Promise<HiringSignal[]> {
    const query = encodeURIComponent(business.name);
    const location = encodeURIComponent(`${business.city}, ${business.state}`);
    const template =
      env.INDEED_JOBS_URL_TEMPLATE ??
      "https://www.indeed.com/jobs?q={query}&l={location}";
    const rssUrl = template
      .replace("{query}", query)
      .replace("{location}", location)
      .replace("https://www.indeed.com/jobs", "https://rss.indeed.com/rss");
    const cacheKey = `indeed-hiring:${business.name}:${business.city}:${business.state}`;

    return cache.withCache(cacheKey, env.CACHE_TTL_SECONDS, async () => {
      const xml = await fetchText(rssUrl, {
        headers: {
          "User-Agent": "PulsePoint/1.0",
        },
      });
      const parser = new XMLParser({
        ignoreAttributes: false,
        trimValues: true,
      });
      const payload = parser.parse(xml) as IndeedRss;
      const items = payload.rss?.channel?.item;
      const jobs = Array.isArray(items) ? items : items ? [items] : [];
      const roleFrequency = new Map<string, number>();

      const filtered = jobs
        .filter((job) => {
          const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
          return text.includes(business.name.toLowerCase());
        })
        .map((job) => {
          const role = (job.title ?? "Open Role").split(" - ")[0].trim();
          const frequency = (roleFrequency.get(role) ?? 0) + 1;
          roleFrequency.set(role, frequency);

          return {
            externalId: job.link ?? `${role}-${job.pubDate ?? Date.now()}`,
            source: "indeed" as const,
            role,
            frequency,
            timestamp: job.pubDate ? new Date(job.pubDate).getTime() : Date.now(),
            seniority: inferSeniority(role),
            department: inferDepartment(role),
            url: job.link,
            metadata: {
              description: job.description,
            },
          };
        });

      return filtered.map((signal) => ({
        ...signal,
        frequency: roleFrequency.get(signal.role) ?? signal.frequency,
      }));
    });
  },
};
