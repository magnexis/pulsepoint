import type {
  SourceSignalBatch,
  SourceSummary,
  UnifiedSignal,
} from "../../models/signal.js";
import { cache } from "../../utils/cache.js";
import { env } from "../../utils/env.js";
import { fetchJson } from "../../utils/http.js";
import { analyzeSentiment } from "../ai/sentiment.service.js";

type RedditSearchResponse = {
  data?: {
    children?: Array<{
      data?: {
        id?: string;
        title?: string;
        selftext?: string;
        permalink?: string;
        created_utc?: number;
        score?: number;
        num_comments?: number;
        subreddit?: string;
      };
    }>;
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
    activityLevel: clamp(activeDays * 12 + signals.length * 8, 0, 100),
    lastCapturedAt: signals[0]?.timestamp ?? null,
  };
}

export const redditService = {
  async fetchSignals(business: {
    name: string;
    city: string;
    state: string;
  }): Promise<SourceSignalBatch> {
    const query = `"${business.name}" "${business.city}" OR "${business.state}"`;
    const cacheKey = `reddit-signals:${query}`;

    return cache.withCache(cacheKey, env.CACHE_TTL_SECONDS, async () => {
      const searchUrl = new URL("https://www.reddit.com/search.json");
      searchUrl.searchParams.set("q", query);
      searchUrl.searchParams.set("sort", "new");
      searchUrl.searchParams.set("limit", "25");
      searchUrl.searchParams.set("type", "link");

      const payload = await fetchJson<RedditSearchResponse>(searchUrl.toString(), {
        headers: {
          "User-Agent": "PulsePoint/1.0",
        },
      });

      const signals: UnifiedSignal[] = (payload.data?.children ?? [])
        .map((child) => child.data)
        .filter((post): post is NonNullable<typeof post> => Boolean(post?.id))
        .map((post) => {
          const content = [post.title, post.selftext].filter(Boolean).join(" ");
          const analysis = analyzeSentiment(content);
          const redditWeight =
            typeof post.num_comments === "number"
              ? clamp(post.num_comments / 50, 0, 1)
              : 0;
          const adjustedSentiment = clamp(
            analysis.score - redditWeight * 0.05,
            -1,
            1,
          );
          const severity: UnifiedSignal["severity"] =
            adjustedSentiment < -0.4
              ? "high"
              : adjustedSentiment < -0.1
                ? "medium"
                : "low";

          return {
            externalId: post.id ?? `${business.name}-${post.created_utc}`,
            source: "reddit" as const,
            sentiment: adjustedSentiment,
            content,
            timestamp: Math.round((post.created_utc ?? Date.now() / 1000) * 1000),
            severity,
            tone: analysis.tone,
            type: "discussion" as const,
            url: post.permalink ? `https://www.reddit.com${post.permalink}` : undefined,
            metadata: {
              subreddit: post.subreddit,
              score: post.score,
              commentCount: post.num_comments,
            },
          };
        })
        .filter((signal) =>
          signal.content.toLowerCase().includes(business.name.toLowerCase()),
        )
        .sort((left, right) => right.timestamp - left.timestamp);

      return {
        source: "reddit",
        fetchedAt: Date.now(),
        signals,
        sourceSummary: summarizeSignals(signals),
      };
    });
  },
};
