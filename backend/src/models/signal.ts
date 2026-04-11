export type UnifiedSignalSource = "google" | "yelp" | "reddit" | "news";
export type UnifiedSignalSeverity = "low" | "medium" | "high";
export type UnifiedSignalTone = "angry" | "neutral" | "positive";
export type UnifiedSignalType = "review" | "discussion" | "article" | "update";

export type SourceSummary = {
  signalCount: number;
  weightedSentiment: number;
  complaintCount: number;
  responseRate: number;
  activityLevel: number;
  lastCapturedAt: number | null;
};

export type UnifiedSignal = {
  externalId: string;
  source: UnifiedSignalSource;
  sentiment: number;
  content: string;
  timestamp: number;
  severity: UnifiedSignalSeverity;
  tone: UnifiedSignalTone;
  type: UnifiedSignalType;
  url?: string;
  metadata?: Record<string, unknown>;
};

export type SourceSignalBatch = {
  source: UnifiedSignalSource;
  fetchedAt: number;
  signals: UnifiedSignal[];
  sourceSummary: SourceSummary;
};

