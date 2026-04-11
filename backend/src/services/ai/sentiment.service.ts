type Tone = "angry" | "neutral" | "positive";

type SentimentResult = {
  score: number;
  tone: Tone;
  complaintLike: boolean;
  mentionsResponse: boolean;
};

const POSITIVE_TERMS = new Set([
  "great",
  "excellent",
  "reliable",
  "friendly",
  "helpful",
  "fast",
  "smooth",
  "clean",
  "professional",
  "responsive",
  "amazing",
  "trusted",
  "honest",
  "recommend",
  "resolved",
  "improved",
  "quality",
]);

const NEGATIVE_TERMS = new Set([
  "awful",
  "terrible",
  "scam",
  "fraud",
  "dishonest",
  "broken",
  "dirty",
  "late",
  "rude",
  "bad",
  "worse",
  "worst",
  "refund",
  "unresolved",
  "unprofessional",
  "decline",
  "closed",
  "ignored",
  "complaint",
  "overcharged",
  "misleading",
  "warning",
]);

const ANGER_TERMS = new Set([
  "furious",
  "angry",
  "outrageous",
  "disgusting",
  "never",
  "avoid",
  "boycott",
  "horrible",
  "scammed",
  "lied",
]);

const RESPONSE_TERMS = [
  "owner responded",
  "management reached out",
  "they fixed it",
  "they resolved",
  "customer service replied",
  "followed up",
];

const NEGATIONS = new Set(["not", "never", "hardly", "no"]);
const INTENSIFIERS = new Set(["very", "extremely", "really", "super", "highly"]);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function analyzeSentiment(
  content: string,
  options?: {
    ratingHint?: number;
  },
): SentimentResult {
  const tokens = tokenize(content);

  if (tokens.length === 0 && typeof options?.ratingHint !== "number") {
    return {
      score: 0,
      tone: "neutral",
      complaintLike: false,
      mentionsResponse: false,
    };
  }

  let rawScore = 0;
  let angerHits = 0;
  let complaintHits = 0;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const previous = tokens[index - 1];
    const prevPrev = tokens[index - 2];
    const intensity =
      INTENSIFIERS.has(previous) || INTENSIFIERS.has(prevPrev) ? 1.35 : 1;
    const negated = NEGATIONS.has(previous) || NEGATIONS.has(prevPrev);

    if (POSITIVE_TERMS.has(token)) {
      rawScore += negated ? -1 * intensity : 1 * intensity;
    }

    if (NEGATIVE_TERMS.has(token)) {
      rawScore += negated ? 0.4 * intensity : -1.15 * intensity;
      complaintHits += 1;
    }

    if (ANGER_TERMS.has(token)) {
      rawScore -= negated ? -0.25 : 1.5 * intensity;
      angerHits += 1;
      complaintHits += 1;
    }
  }

  if (typeof options?.ratingHint === "number") {
    rawScore += (options.ratingHint - 3) / 2;
  }

  const normalized = clamp(
    rawScore / Math.max(2, Math.sqrt(tokens.length + 2)),
    -1,
    1,
  );

  const mentionsResponse = RESPONSE_TERMS.some((term) =>
    content.toLowerCase().includes(term),
  );

  const tone: Tone =
    normalized > 0.22
      ? "positive"
      : normalized < -0.28 && angerHits > 0
        ? "angry"
        : "neutral";

  return {
    score: normalized,
    tone,
    complaintLike: complaintHits > 0 || normalized < -0.35,
    mentionsResponse,
  };
}

