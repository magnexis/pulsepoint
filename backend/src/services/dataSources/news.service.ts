import { XMLParser } from "fast-xml-parser";

import type {
  SourceSignalBatch,
  SourceSummary,
  UnifiedSignal,
} from "../../models/signal.js";
import { cache } from "../../utils/cache.js";
import { env } from "../../utils/env.js";
import { fetchJson, fetchText } from "../../utils/http.js";
import { analyzeSentiment } from "../ai/sentiment.service.js";

type NewsApiResponse = {
  articles?: Array<{
    title?: string;
    description?: string;
    url?: string;
    publishedAt?: string;
    source?: {
      name?: string;
    };
  }>;
};

type GoogleNewsRss = {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function summarizeSignals(signals: UnifiedSignal[]): SourceSummary {
  const totalSentiment = signals.reduce((sum, signal) => sum + signal.sentiment, 0);
  const complaintCount = signals.filter(
    (signal) => signal.sentiment < -0.15 || signal.severity !== "low",
  ).length;
  const activeDays = new Set(
    signals.map((signal) => new Date(signal.timestamp).toISOString().slice(0, 10)),
  ).size;

  return {
    signalCount: signals.length,
    weightedSentiment:
      signals.length === 0 ? 0 : clamp(totalSentiment / signals.length, -1, 1),
    complaintCount,
    responseRate: 0,
    activityLevel: clamp(activeDays * 10 + signals.length * 8, 0, 100),
    lastCapturedAt: signals[0]?.timestamp ?? null,
  };
}

export const newsService = {
  async fetchSignals(business: {
    name: string;
    city: string;
  }): Promise<SourceSignalBatch> {
    const query = `"${business.name}" "${business.city}"`;
    const cacheKey = `news-signals:${query}`;

    return cache.withCache(cacheKey, env.CACHE_TTL_SECONDS, async () => {
      let signals: UnifiedSignal[] = [];

      if (env.NEWS_API_KEY) {
        const searchUrl = new URL("https://newsapi.org/v2/everything");
        searchUrl.searchParams.set("q", query);
        searchUrl.searchParams.set("language", "en");
        searchUrl.searchParams.set("sortBy", "publishedAt");
        searchUrl.searchParams.set("pageSize", "20");

        const payload = await fetchJson<NewsApiResponse>(searchUrl.toString(), {
          headers: {
            "X-Api-Key": env.NEWS_API_KEY,
          },
        });

        signals = (payload.articles ?? [])
          .map((article) => {
            const content = [article.title, article.description]
              .filter(Boolean)
              .join(". ");
            const analysis = analyzeSentiment(content);
            const timestamp = article.publishedAt
              ? new Date(article.publishedAt).getTime()
              : Date.now();
            const severity: UnifiedSignal["severity"] =
              analysis.score < -0.45
                ? "high"
                : analysis.score < -0.12
                  ? "medium"
                  : "low";

            return {
              externalId: article.url ?? `${business.name}-${timestamp}`,
              source: "news" as const,
              sentiment: analysis.score,
              content,
              timestamp,
              severity,
              tone: analysis.tone,
              type: "article" as const,
              url: article.url,
              metadata: {
                publisher: article.source?.name,
              },
            };
          })
          .sort((left, right) => right.timestamp - left.timestamp);
      } else {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
        const xml = await fetchText(rssUrl, {
          headers: {
            "User-Agent": "PulsePoint/1.0",
          },
        });
        const parser = new XMLParser({
          ignoreAttributes: false,
          parseTagValue: true,
          trimValues: true,
        });
        const payload = parser.parse(xml) as GoogleNewsRss;
        const items = payload.rss?.channel?.item;
        const articles = Array.isArray(items) ? items : items ? [items] : [];

        signals = articles
          .map((article) => {
            const content = [article.title, article.description]
              .filter(Boolean)
              .join(". ");
            const analysis = analyzeSentiment(content);
            const timestamp = article.pubDate
              ? new Date(article.pubDate).getTime()
              : Date.now();
            const severity: UnifiedSignal["severity"] =
              analysis.score < -0.45
                ? "high"
                : analysis.score < -0.12
                  ? "medium"
                  : "low";

            return {
              externalId: article.link ?? `${business.name}-${timestamp}`,
              source: "news" as const,
              sentiment: analysis.score,
              content,
              timestamp,
              severity,
              tone: analysis.tone,
              type: "article" as const,
              url: article.link,
              metadata: {},
            };
          })
          .sort((left, right) => right.timestamp - left.timestamp);
      }

      return {
        source: "news",
        fetchedAt: Date.now(),
        signals,
        sourceSummary: summarizeSignals(signals),
      };
    });
  },
};
