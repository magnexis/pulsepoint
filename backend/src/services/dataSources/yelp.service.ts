import type { DiscoveredBusinessCandidate } from "../../models/business.js";
import type {
  SourceSignalBatch,
  SourceSummary,
  UnifiedSignal,
} from "../../models/signal.js";
import { cache } from "../../utils/cache.js";
import { env } from "../../utils/env.js";
import { fetchJson } from "../../utils/http.js";
import { analyzeSentiment } from "../ai/sentiment.service.js";

type YelpSearchResponse = {
  businesses?: Array<{
    id: string;
    name: string;
    categories?: Array<{ title?: string }>;
    location?: {
      display_address?: string[];
      city?: string;
      state?: string;
      zip_code?: string;
      country?: string;
      address1?: string;
    };
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    url?: string;
    phone?: string;
    rating?: number;
    review_count?: number;
  }>;
};

type YelpBusinessDetails = {
  id: string;
  name: string;
  url?: string;
  hours?: Array<{ is_open_now?: boolean }>;
};

type YelpReviewsResponse = {
  reviews?: Array<{
    id?: string;
    rating?: number;
    text?: string;
    time_created?: string;
    url?: string;
    user?: {
      name?: string;
    };
  }>;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function emptySummary(): SourceSummary {
  return {
    signalCount: 0,
    weightedSentiment: 0,
    complaintCount: 0,
    responseRate: 0,
    activityLevel: 0,
    lastCapturedAt: null,
  };
}

function summarizeSignals(signals: UnifiedSignal[]): SourceSummary {
  const totalSentiment = signals.reduce((sum, signal) => sum + signal.sentiment, 0);
  const complaintCount = signals.filter(
    (signal) => signal.sentiment < -0.15 || signal.severity === "high",
  ).length;
  const last7Days = signals.filter(
    (signal) => Date.now() - signal.timestamp <= 7 * 24 * 60 * 60 * 1000,
  ).length;

  return {
    signalCount: signals.length,
    weightedSentiment:
      signals.length === 0 ? 0 : clamp(totalSentiment / signals.length, -1, 1),
    complaintCount,
    responseRate: 0,
    activityLevel: clamp(last7Days * 16 + signals.length * 10, 0, 100),
    lastCapturedAt: signals[0]?.timestamp ?? null,
  };
}

export const yelpService = {
  async searchBusinesses(
    query: string,
    location: string,
    limit = 8,
  ): Promise<DiscoveredBusinessCandidate[]> {
    if (!env.YELP_API_KEY) {
      return [];
    }

    const cacheKey = `yelp-search:${query}:${location}:${limit}`;

    return cache.withCache(cacheKey, env.SEARCH_CACHE_TTL_SECONDS, async () => {
      const searchUrl = new URL("https://api.yelp.com/v3/businesses/search");
      searchUrl.searchParams.set("term", query);
      searchUrl.searchParams.set("location", location);
      searchUrl.searchParams.set("limit", `${limit}`);

      const payload = await fetchJson<YelpSearchResponse>(searchUrl.toString(), {
        headers: {
          Authorization: `Bearer ${env.YELP_API_KEY}`,
        },
      });

      return (payload.businesses ?? []).map((business) => ({
        name: business.name,
        category: business.categories?.[0]?.title ?? "Business",
        description:
          typeof business.rating === "number"
            ? `${business.name} carries a ${business.rating.toFixed(1)} Yelp rating across ${business.review_count ?? 0} reviews.`
            : `${business.name} was discovered through the live Yelp business search pipeline.`,
        address:
          business.location?.display_address?.join(", ") ??
          business.location?.address1 ??
          "",
        city: business.location?.city ?? "",
        state: business.location?.state ?? "",
        postalCode: business.location?.zip_code ?? "",
        country: business.location?.country ?? "US",
        latitude: business.coordinates?.latitude ?? 0,
        longitude: business.coordinates?.longitude ?? 0,
        website: business.url,
        phone: business.phone,
        yelpBusinessId: business.id,
        source: "yelp" as const,
      }));
    });
  },

  async fetchSignals(business: {
    name: string;
    city: string;
    state: string;
    yelpBusinessId?: string | null;
  }): Promise<SourceSignalBatch> {
    if (!env.YELP_API_KEY) {
      return {
        source: "yelp",
        fetchedAt: Date.now(),
        signals: [],
        sourceSummary: emptySummary(),
      };
    }

    const resolvedId =
      business.yelpBusinessId ??
      (await this.searchBusinesses(business.name, `${business.city}, ${business.state}`, 1))[0]
        ?.yelpBusinessId;

    if (!resolvedId) {
      return {
        source: "yelp",
        fetchedAt: Date.now(),
        signals: [],
        sourceSummary: emptySummary(),
      };
    }

    const cacheKey = `yelp-signals:${resolvedId}`;

    return cache.withCache(cacheKey, env.CACHE_TTL_SECONDS, async () => {
      const [businessDetails, reviewsPayload] = await Promise.all([
        fetchJson<YelpBusinessDetails>(
          `https://api.yelp.com/v3/businesses/${resolvedId}`,
          {
            headers: {
              Authorization: `Bearer ${env.YELP_API_KEY}`,
            },
          },
        ),
        fetchJson<YelpReviewsResponse>(
          `https://api.yelp.com/v3/businesses/${resolvedId}/reviews`,
          {
            headers: {
              Authorization: `Bearer ${env.YELP_API_KEY}`,
            },
          },
        ),
      ]);

      const signals: UnifiedSignal[] = (reviewsPayload.reviews ?? [])
        .map((review) => {
          const analysis = analyzeSentiment(review.text ?? "", {
            ratingHint: review.rating,
          });
          const timestamp = review.time_created
            ? new Date(review.time_created).getTime()
            : Date.now();
          const severity: UnifiedSignal["severity"] =
            (review.rating ?? 3) <= 2 || analysis.score < -0.45
              ? "high"
              : analysis.score < -0.1
                ? "medium"
                : "low";

          return {
            externalId: review.id ?? `${resolvedId}-${timestamp}`,
            source: "yelp" as const,
            sentiment: analysis.score,
            content: review.text ?? "",
            timestamp,
            severity,
            tone: analysis.tone,
            type: "review" as const,
            url: review.url ?? businessDetails.url,
            metadata: {
              rating: review.rating,
              author: review.user?.name,
            },
          };
        })
        .filter((signal) => signal.content.trim().length > 0);

      if (
        businessDetails.hours?.[0] &&
        businessDetails.hours[0].is_open_now === false
      ) {
        signals.push({
          externalId: `${resolvedId}-closed-now`,
          source: "yelp",
          sentiment: -0.15,
          content: `${businessDetails.name} is currently reported as closed right now on Yelp.`,
          timestamp: Date.now(),
          severity: "medium",
          tone: "neutral",
          type: "update",
          url: businessDetails.url,
          metadata: {
            openNow: false,
          },
        });
      }

      const orderedSignals = signals.sort((left, right) => right.timestamp - left.timestamp);

      return {
        source: "yelp",
        fetchedAt: Date.now(),
        signals: orderedSignals,
        sourceSummary: summarizeSignals(orderedSignals),
      };
    });
  },
};
