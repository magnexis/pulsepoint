import type { UnifiedSignal } from "../models/signal.js";

type TrendIndicator = {
  category: "sentiment_drop" | "complaint_spike" | "inactivity";
  severity: "critical" | "warning" | "info";
  message: string;
  delta: number;
};

type TrendAnalysis = {
  direction: "improving" | "declining" | "stable";
  indicators: TrendIndicator[];
  sentimentSeries: Array<{ date: string; value: number }>;
  complaintSeries: Array<{ date: string; value: number }>;
  activitySeries: Array<{ date: string; value: number }>;
};

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildDateKeys(days: number) {
  const dates: string[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

export function analyzeTrends(signals: UnifiedSignal[]): TrendAnalysis {
  const dates = buildDateKeys(30);
  const buckets = new Map<
    string,
    { sentiments: number[]; complaints: number; activity: number }
  >();

  for (const date of dates) {
    buckets.set(date, {
      sentiments: [],
      complaints: 0,
      activity: 0,
    });
  }

  for (const signal of signals) {
    const date = new Date(signal.timestamp).toISOString().slice(0, 10);
    const bucket = buckets.get(date);

    if (!bucket) {
      continue;
    }

    bucket.sentiments.push(signal.sentiment);
    bucket.activity += 1;

    if (signal.sentiment < -0.2 || signal.severity === "high") {
      bucket.complaints += 1;
    }
  }

  const sentimentSeries = dates.map((date) => ({
    date,
    value: Number(average(buckets.get(date)?.sentiments ?? []).toFixed(2)),
  }));
  const complaintSeries = dates.map((date) => ({
    date,
    value: buckets.get(date)?.complaints ?? 0,
  }));
  const activitySeries = dates.map((date) => ({
    date,
    value: buckets.get(date)?.activity ?? 0,
  }));

  const last7Sentiment = average(sentimentSeries.slice(-7).map((entry) => entry.value));
  const prior7Sentiment = average(
    sentimentSeries.slice(-14, -7).map((entry) => entry.value),
  );
  const last7Complaints = complaintSeries
    .slice(-7)
    .reduce((sum, entry) => sum + entry.value, 0);
  const prior7Complaints = complaintSeries
    .slice(-14, -7)
    .reduce((sum, entry) => sum + entry.value, 0);
  const lastSignalAt = signals[0]?.timestamp ?? 0;
  const daysInactive = lastSignalAt
    ? (Date.now() - lastSignalAt) / (1000 * 60 * 60 * 24)
    : 30;

  const indicators: TrendIndicator[] = [];
  const sentimentDelta = last7Sentiment - prior7Sentiment;

  if (sentimentDelta <= -0.18) {
    indicators.push({
      category: "sentiment_drop",
      severity: sentimentDelta <= -0.3 ? "critical" : "warning",
      message: "Recent sentiment dropped sharply compared with the prior week.",
      delta: Number(sentimentDelta.toFixed(2)),
    });
  }

  if (last7Complaints > prior7Complaints + 2) {
    indicators.push({
      category: "complaint_spike",
      severity: last7Complaints > prior7Complaints * 1.8 ? "critical" : "warning",
      message: "Complaint-related signals are rising faster than the recent baseline.",
      delta: Number((last7Complaints - prior7Complaints).toFixed(2)),
    });
  }

  if (daysInactive >= 5) {
    indicators.push({
      category: "inactivity",
      severity: daysInactive >= 10 ? "critical" : "info",
      message: "Signal activity has slowed, which may indicate reduced visibility or business inactivity.",
      delta: Number(daysInactive.toFixed(1)),
    });
  }

  const direction: TrendAnalysis["direction"] =
    sentimentDelta > 0.08 ? "improving" : sentimentDelta < -0.08 ? "declining" : "stable";

  return {
    direction,
    indicators,
    sentimentSeries,
    complaintSeries,
    activitySeries,
  };
}
