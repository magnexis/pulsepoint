import type { HiringAnalysisResult, HiringSignal } from "../../models/hiring.js";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function analyzeHiringSignals(signals: HiringSignal[]): HiringAnalysisResult {
  const sorted = [...signals].sort((left, right) => left.timestamp - right.timestamp);
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const recent = sorted.filter((signal) => signal.timestamp >= thirtyDaysAgo);
  const previous = sorted.filter(
    (signal) => signal.timestamp < thirtyDaysAgo && signal.timestamp >= sixtyDaysAgo,
  );

  const recentFrequency = recent.reduce((sum, signal) => sum + signal.frequency, 0);
  const previousFrequency = previous.reduce((sum, signal) => sum + signal.frequency, 0);
  const growthRate =
    previousFrequency === 0
      ? recentFrequency > 0
        ? 1
        : 0
      : (recentFrequency - previousFrequency) / previousFrequency;

  const weeklyVelocity = recentFrequency / Math.max(1, 30 / 7);
  const seniorRoles = recent.filter((signal) => signal.seniority === "senior").length;
  const repeatedRoles = recent.filter((signal) => signal.frequency >= 3).length;
  const turnoverRisk =
    recent.length > 0 &&
    seniorRoles / recent.length >= 0.35 &&
    repeatedRoles / recent.length >= 0.35 &&
    growthRate < 0.2;

  const departmentSpread = new Set(recent.map((signal) => signal.department)).size;
  const stableBaseline =
    Math.abs(growthRate) < 0.15 && average([recent.length, previous.length]) > 0;

  const classification: HiringAnalysisResult["classification"] = turnoverRisk
    ? "high turnover risk"
    : growthRate > 0.22 && departmentSpread >= 2
      ? "expanding"
      : growthRate < -0.18
        ? "contracting"
        : stableBaseline
          ? "stable"
          : recent.length > 0
            ? "stable"
            : "contracting";

  const boundedGrowth = clamp(growthRate, -1, 2);
  const summary =
    classification === "expanding"
      ? `This business shows a ${Math.round(boundedGrowth * 100)}% increase in hiring over the last 30 days, signaling expansion across ${departmentSpread} departments.`
      : classification === "high turnover risk"
        ? "Hiring activity is concentrated in repeated senior openings, which often signals retention pressure or organizational churn."
        : classification === "contracting"
          ? "Hiring demand has cooled over the last month, suggesting the business is consolidating or slowing expansion."
          : "Hiring demand is steady, which points to stable headcount planning rather than aggressive growth or contraction.";

  return {
    classification,
    velocityPerWeek: Number(weeklyVelocity.toFixed(1)),
    growthRate: Number((boundedGrowth * 100).toFixed(1)),
    openRoles: recent
      .sort((left, right) => right.timestamp - left.timestamp)
      .slice(0, 10),
    summary,
  };
}
