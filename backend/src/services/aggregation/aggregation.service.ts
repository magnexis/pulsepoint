import type { HiringSignal } from "../../models/hiring.js";
import type { UnifiedSignal, UnifiedSignalSource } from "../../models/signal.js";

type ReportImpact = {
  type: "COMPLAINT" | "FEEDBACK" | "SCAM_FLAG";
  severity: number;
  createdAt: number;
};

type AdvancedHealthScore = {
  healthScore: number;
  trustScore: number;
  riskLevel: "low" | "medium" | "high";
  trend: "improving" | "declining" | "stable";
  weightedSentiment: number;
  complaintSpike: number;
  complaintVelocity: number;
  activityConsistency: number;
  responsiveness: number;
  sourceBreakdown: Array<{
    source: UnifiedSignalSource;
    signalCount: number;
    weightedSentiment: number;
    reliabilityWeight: number;
  }>;
  hiringImpact: number;
};

const SOURCE_WEIGHTS: Record<UnifiedSignalSource, number> = {
  google: 1,
  yelp: 0.82,
  news: 0.65,
  reddit: 0.45,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sourceBreakdown(signals: UnifiedSignal[]) {
  return (Object.keys(SOURCE_WEIGHTS) as UnifiedSignalSource[]).map((source) => {
    const sourceSignals = signals.filter((signal) => signal.source === source);
    return {
      source,
      signalCount: sourceSignals.length,
      weightedSentiment: average(sourceSignals.map((signal) => signal.sentiment)),
      reliabilityWeight: SOURCE_WEIGHTS[source],
    };
  });
}

function calculateActivityConsistency(signals: UnifiedSignal[]) {
  const lastThirtyDays = signals.filter(
    (signal) => Date.now() - signal.timestamp <= 30 * 24 * 60 * 60 * 1000,
  );
  const buckets = new Map<string, number>();

  for (const signal of lastThirtyDays) {
    const day = new Date(signal.timestamp).toISOString().slice(0, 10);
    buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }

  const counts = Array.from(buckets.values());
  const activeDays = buckets.size;
  const mean = average(counts);
  const variance =
    counts.length === 0
      ? 0
      : average(counts.map((count) => (count - mean) ** 2));
  const stability = mean === 0 ? 0 : 1 - variance / (mean * mean + 1);

  return clamp(activeDays * 2 + stability * 40, 0, 100);
}

function calculateResponsiveness(signals: UnifiedSignal[]) {
  const reviewSignals = signals.filter(
    (signal) => signal.type === "review" || signal.type === "discussion",
  );
  const ownerResponses = reviewSignals.filter(
    (signal) => signal.metadata?.ownerResponse === true,
  ).length;
  const negativeSignals = reviewSignals.filter((signal) => signal.sentiment < -0.2);

  let recoveryCount = 0;

  for (const signal of negativeSignals) {
    const recovered = reviewSignals.some(
      (candidate) =>
        candidate.timestamp > signal.timestamp &&
        candidate.timestamp - signal.timestamp <= 7 * 24 * 60 * 60 * 1000 &&
        candidate.sentiment > 0.1,
    );

    if (recovered) {
      recoveryCount += 1;
    }
  }

  const ownerResponseRate =
    reviewSignals.length === 0 ? 0 : ownerResponses / reviewSignals.length;
  const recoveryRate =
    negativeSignals.length === 0 ? 0.5 : recoveryCount / negativeSignals.length;

  return clamp(ownerResponseRate * 60 + recoveryRate * 40, 0, 100);
}

function calculateComplaintSpike(
  signals: UnifiedSignal[],
  reports: ReportImpact[],
) {
  const now = Date.now();
  const recentComplaints =
    signals.filter(
      (signal) =>
        signal.timestamp >= now - 7 * 24 * 60 * 60 * 1000 &&
        (signal.sentiment < -0.2 || signal.severity === "high"),
    ).length +
    reports.filter(
      (report) =>
        report.createdAt >= now - 7 * 24 * 60 * 60 * 1000 &&
        report.type !== "FEEDBACK",
    ).length;

  const baselineComplaints =
    signals.filter(
      (signal) =>
        signal.timestamp < now - 7 * 24 * 60 * 60 * 1000 &&
        signal.timestamp >= now - 30 * 24 * 60 * 60 * 1000 &&
        (signal.sentiment < -0.2 || signal.severity === "high"),
    ).length +
    reports.filter(
      (report) =>
        report.createdAt < now - 7 * 24 * 60 * 60 * 1000 &&
        report.createdAt >= now - 30 * 24 * 60 * 60 * 1000 &&
        report.type !== "FEEDBACK",
    ).length;

  const baselineDensity = baselineComplaints / 3 || 1;
  const spike = (recentComplaints - baselineDensity) / baselineDensity;

  return {
    complaintSpike: clamp(spike, 0, 1.5),
    complaintVelocity: Number((recentComplaints / 7).toFixed(2)),
  };
}

function calculateHiringImpact(hiringSignals: HiringSignal[]) {
  const now = Date.now();
  const recent = hiringSignals.filter(
    (signal) => signal.timestamp >= now - 30 * 24 * 60 * 60 * 1000,
  );
  const previous = hiringSignals.filter(
    (signal) =>
      signal.timestamp < now - 30 * 24 * 60 * 60 * 1000 &&
      signal.timestamp >= now - 60 * 24 * 60 * 60 * 1000,
  );
  const recentVolume = recent.reduce((sum, signal) => sum + signal.frequency, 0);
  const previousVolume = previous.reduce((sum, signal) => sum + signal.frequency, 0);
  const growth =
    previousVolume === 0 ? (recentVolume > 0 ? 0.25 : 0) : (recentVolume - previousVolume) / previousVolume;
  const repeatedSeniorRoles = recent.filter(
    (signal) => signal.seniority === "senior" && signal.frequency >= 3,
  ).length;

  return clamp(growth * 12 - repeatedSeniorRoles * 2.5, -12, 12);
}

export function calculateAdvancedHealthScore(
  signals: UnifiedSignal[],
  hiringSignals: HiringSignal[] = [],
  reports: ReportImpact[] = [],
): AdvancedHealthScore {
  const orderedSignals = [...signals].sort((left, right) => right.timestamp - left.timestamp);
  const weightedSignals = orderedSignals.map((signal) => {
    const ageHours = (Date.now() - signal.timestamp) / (1000 * 60 * 60);
    const decay = Math.exp(-ageHours / 96);
    const weight = SOURCE_WEIGHTS[signal.source] * decay;
    return {
      ...signal,
      weight,
    };
  });

  const totalWeight = weightedSignals.reduce((sum, signal) => sum + signal.weight, 0) || 1;
  const weightedSentiment = clamp(
    weightedSignals.reduce(
      (sum, signal) => sum + signal.sentiment * signal.weight,
      0,
    ) / totalWeight,
    -1,
    1,
  );
  const sentimentScore = ((weightedSentiment + 1) / 2) * 100;
  const activityConsistency = calculateActivityConsistency(orderedSignals);
  const responsiveness = calculateResponsiveness(orderedSignals);
  const { complaintSpike, complaintVelocity } = calculateComplaintSpike(
    orderedSignals,
    reports,
  );
  const hiringImpact = calculateHiringImpact(hiringSignals);
  const recentWindow = orderedSignals.filter(
    (signal) => Date.now() - signal.timestamp <= 7 * 24 * 60 * 60 * 1000,
  );
  const previousWindow = orderedSignals.filter(
    (signal) =>
      Date.now() - signal.timestamp > 7 * 24 * 60 * 60 * 1000 &&
      Date.now() - signal.timestamp <= 30 * 24 * 60 * 60 * 1000,
  );
  const trendDelta =
    average(recentWindow.map((signal) => signal.sentiment)) -
    average(previousWindow.map((signal) => signal.sentiment));
  const trend: AdvancedHealthScore["trend"] =
    trendDelta > 0.08 ? "improving" : trendDelta < -0.08 ? "declining" : "stable";
  const coverageBoost =
    sourceBreakdown(orderedSignals).filter((item) => item.signalCount > 0).length * 3;

  const healthScore = clamp(
    Math.round(
      sentimentScore * 0.5 +
        responsiveness * 0.18 +
        activityConsistency * 0.15 +
        coverageBoost +
        hiringImpact -
        complaintSpike * 18,
    ),
    0,
    100,
  );

  const trustScore = clamp(
    Math.round(
      sentimentScore * 0.44 +
        responsiveness * 0.2 +
        activityConsistency * 0.13 +
        coverageBoost -
        complaintSpike * 16 +
        hiringImpact * 0.6,
    ),
    0,
    100,
  );

  const riskLevel: AdvancedHealthScore["riskLevel"] =
    healthScore < 45 || complaintSpike >= 0.9 || trustScore < 40
      ? "high"
      : healthScore < 70 || complaintSpike >= 0.35
        ? "medium"
        : "low";

  return {
    healthScore,
    trustScore,
    riskLevel,
    trend,
    weightedSentiment: Number(weightedSentiment.toFixed(3)),
    complaintSpike: Number(complaintSpike.toFixed(3)),
    complaintVelocity,
    activityConsistency: Number(activityConsistency.toFixed(1)),
    responsiveness: Number(responsiveness.toFixed(1)),
    sourceBreakdown: sourceBreakdown(orderedSignals),
    hiringImpact: Number(hiringImpact.toFixed(1)),
  };
}
