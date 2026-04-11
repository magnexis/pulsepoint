import type { HiringSignal } from "../../../models/hiring.js";
import { cache } from "../../../utils/cache.js";
import { env } from "../../../utils/env.js";
import { fetchText } from "../../../utils/http.js";

function cleanText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

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

export const linkedInHiringService = {
  async fetchSignals(business: {
    name: string;
    city: string;
    state: string;
  }): Promise<HiringSignal[]> {
    const keywords = encodeURIComponent(business.name);
    const location = encodeURIComponent(`${business.city}, ${business.state}`);
    const template =
      env.LINKEDIN_JOBS_URL_TEMPLATE ||
      "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={query}&location={location}&start=0";
    const resolvedUrl = template
      .replace("{query}", keywords)
      .replace("{location}", location);
    const cacheKey = `linkedin-hiring:${business.name}:${business.city}:${business.state}`;

    return cache.withCache(cacheKey, env.CACHE_TTL_SECONDS, async () => {
      const html = await fetchText(resolvedUrl, {
        headers: {
          "User-Agent": "PulsePoint/1.0",
        },
      });

      const cardPattern =
        /base-search-card__title[^>]*>(?<role>[\s\S]*?)<\/h3>[\s\S]*?search-card__subtitle[^>]*>(?<company>[\s\S]*?)<\/h4>[\s\S]*?job-search-card__location[^>]*>(?<location>[\s\S]*?)<\/span>[\s\S]*?<time[^>]*datetime="(?<date>[^"]+)"[\s\S]*?<a[^>]*href="(?<href>[^"]+)"/gi;
      const roleFrequency = new Map<string, number>();
      const rawSignals: HiringSignal[] = [];

      for (const match of html.matchAll(cardPattern)) {
        const role = cleanText(match.groups?.role ?? "");
        const company = cleanText(match.groups?.company ?? "");
        const jobLocation = cleanText(match.groups?.location ?? "");

        if (!role || !company.toLowerCase().includes(business.name.toLowerCase())) {
          continue;
        }

        const frequency = (roleFrequency.get(role) ?? 0) + 1;
        roleFrequency.set(role, frequency);

        rawSignals.push({
          externalId: match.groups?.href ?? `${role}-${match.groups?.date ?? Date.now()}`,
          source: "linkedin",
          role,
          frequency,
          timestamp: match.groups?.date
            ? new Date(match.groups.date).getTime()
            : Date.now(),
          seniority: inferSeniority(role),
          department: inferDepartment(role),
          location: jobLocation,
          url: match.groups?.href,
          metadata: {
            company,
          },
        });
      }

      return rawSignals.map((signal) => ({
        ...signal,
        frequency: roleFrequency.get(signal.role) ?? signal.frequency,
      }));
    });
  },
};

