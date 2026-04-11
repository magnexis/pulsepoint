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

type GoogleSearchResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    addressComponents?: Array<{
      longText?: string;
      shortText?: string;
      types?: string[];
    }>;
    location?: { latitude?: number; longitude?: number };
    types?: string[];
    websiteUri?: string;
    nationalPhoneNumber?: string;
    rating?: number;
    userRatingCount?: number;
  }>;
};

type GooglePlaceDetails = {
  id?: string;
  displayName?: { text?: string };
  googleMapsUri?: string;
  businessStatus?: string;
  reviews?: Array<{
    name?: string;
    rating?: number;
    publishTime?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: {
      displayName?: string;
    };
    reviewReply?: {
      text?: { text?: string };
      publishTime?: string;
    };
  }>;
};

type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizePlaceType(rawType?: string): string {
  return rawType
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase()) ?? "Business";
}

function readAddressComponent(
  components: AddressComponent[] | undefined,
  type: string,
) {
  return components?.find((component) => component.types?.includes(type));
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
    (signal) => signal.sentiment < -0.25 || signal.severity !== "low",
  ).length;
  const responseRate =
    signals.length === 0
      ? 0
      : (signals.filter((signal) => signal.metadata?.ownerResponse === true).length /
          signals.length) *
        100;
  const last7DaySignals = signals.filter(
    (signal) => Date.now() - signal.timestamp <= 7 * 24 * 60 * 60 * 1000,
  ).length;

  return {
    signalCount: signals.length,
    weightedSentiment:
      signals.length === 0 ? 0 : clamp(totalSentiment / signals.length, -1, 1),
    complaintCount,
    responseRate: Math.round(responseRate),
    activityLevel: clamp(last7DaySignals * 18 + signals.length * 12, 0, 100),
    lastCapturedAt: signals[0]?.timestamp ?? null,
  };
}

function buildCandidateFromPlace(
  place: NonNullable<GoogleSearchResponse["places"]>[number],
): DiscoveredBusinessCandidate | null {
  const city = readAddressComponent(place.addressComponents, "locality")?.longText ?? "";
  const state =
    readAddressComponent(place.addressComponents, "administrative_area_level_1")
      ?.shortText ?? "";

  if (!place.id || !place.displayName?.text || !place.formattedAddress) {
    return null;
  }

  return {
    name: place.displayName.text,
    category: normalizePlaceType(place.types?.[0]),
    description:
      typeof place.rating === "number"
        ? `${place.displayName.text} holds a ${place.rating.toFixed(1)} Google rating across ${place.userRatingCount ?? 0} reviews.`
        : `${place.displayName.text} was discovered through the live Google Places search pipeline.`,
    address: place.formattedAddress,
    city,
    state,
    postalCode:
      readAddressComponent(place.addressComponents, "postal_code")?.longText,
    country:
      readAddressComponent(place.addressComponents, "country")?.shortText ?? "US",
    latitude: place.location?.latitude ?? 0,
    longitude: place.location?.longitude ?? 0,
    website: place.websiteUri,
    phone: place.nationalPhoneNumber,
    googlePlaceId: place.id,
    source: "google",
  };
}

export const googleReviewsService = {
  async searchBusinesses(
    query: string,
    location: string,
    limit = 8,
  ): Promise<DiscoveredBusinessCandidate[]> {
    if (!env.GOOGLE_PLACES_API_KEY) {
      return [];
    }

    const cacheKey = `google-search:${query}:${location}:${limit}`;

    return cache.withCache(cacheKey, env.SEARCH_CACHE_TTL_SECONDS, async () => {
      const payload = await fetchJson<GoogleSearchResponse>(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY ?? "",
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.types,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount",
          },
          body: JSON.stringify({
            textQuery: [query, location].filter(Boolean).join(", "),
            maxResultCount: limit,
          }),
        },
      );

      return (payload.places ?? [])
        .map(buildCandidateFromPlace)
        .filter((candidate): candidate is DiscoveredBusinessCandidate => candidate !== null);
    });
  },

  async fetchSignals(business: {
    name: string;
    city: string;
    state: string;
    googlePlaceId?: string | null;
  }): Promise<SourceSignalBatch> {
    if (!env.GOOGLE_PLACES_API_KEY) {
      return {
        source: "google",
        fetchedAt: Date.now(),
        signals: [],
        sourceSummary: emptySummary(),
      };
    }

    const discoveredId =
      business.googlePlaceId ??
      (await this.searchBusinesses(business.name, `${business.city}, ${business.state}`, 1))[0]
        ?.googlePlaceId;

    if (!discoveredId) {
      return {
        source: "google",
        fetchedAt: Date.now(),
        signals: [],
        sourceSummary: emptySummary(),
      };
    }

    const cacheKey = `google-signals:${discoveredId}`;

    return cache.withCache(cacheKey, env.CACHE_TTL_SECONDS, async () => {
      const details = await fetchJson<GooglePlaceDetails>(
        `https://places.googleapis.com/v1/places/${discoveredId}`,
        {
          headers: {
            "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY ?? "",
            "X-Goog-FieldMask":
              "id,displayName,googleMapsUri,businessStatus,reviews",
          },
        },
      );

      const signals: UnifiedSignal[] = (details.reviews ?? [])
        .map((review) => {
          const text = review.originalText?.text ?? review.text?.text ?? "";
          const rating = review.rating ?? 3;
          const sentiment = analyzeSentiment(text, { ratingHint: rating });
          const timestamp = review.publishTime
            ? new Date(review.publishTime).getTime()
            : Date.now();
          const severity: UnifiedSignal["severity"] =
            rating <= 2 || sentiment.score < -0.45
              ? "high"
              : sentiment.score < -0.05
                ? "medium"
                : "low";

          return {
            externalId:
              review.name ??
              `${discoveredId}-${review.authorAttribution?.displayName ?? "anonymous"}-${timestamp}`,
            source: "google" as const,
            sentiment: sentiment.score,
            content: text,
            timestamp,
            severity,
            tone: sentiment.tone,
            type: "review" as const,
            url: details.googleMapsUri,
            metadata: {
              rating,
              author: review.authorAttribution?.displayName,
              ownerResponse: Boolean(review.reviewReply),
            },
          };
        })
        .filter((signal) => signal.content.trim().length > 0);

      if (details.businessStatus && details.businessStatus !== "OPERATIONAL") {
        signals.push({
          externalId: `${discoveredId}-status-${details.businessStatus.toLowerCase()}`,
          source: "google",
          sentiment: -0.55,
          content: `${details.displayName?.text ?? business.name} is currently reported by Google as ${details.businessStatus.toLowerCase()}.`,
          timestamp: Date.now(),
          severity: "high",
          tone: "angry",
          type: "update",
          url: details.googleMapsUri,
          metadata: {
            businessStatus: details.businessStatus,
          },
        });
      }

      const orderedSignals = signals.sort((left, right) => right.timestamp - left.timestamp);

      return {
        source: "google",
        fetchedAt: Date.now(),
        signals: orderedSignals,
        sourceSummary: summarizeSignals(orderedSignals),
      };
    });
  },
};
