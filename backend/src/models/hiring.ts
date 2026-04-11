export type HiringSignalSource = "linkedin" | "indeed";
export type HiringSeniority = "entry" | "mid" | "senior";

export type HiringSignal = {
  externalId: string;
  source: HiringSignalSource;
  role: string;
  frequency: number;
  timestamp: number;
  seniority: HiringSeniority;
  department: string;
  location?: string;
  url?: string;
  metadata?: Record<string, unknown>;
};

export type HiringAnalysisResult = {
  classification: "expanding" | "stable" | "contracting" | "high turnover risk";
  velocityPerWeek: number;
  growthRate: number;
  openRoles: HiringSignal[];
  summary: string;
};
