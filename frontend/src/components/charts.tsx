import { cn } from "@/lib/utils";

type ChartPoint = {
  date: string;
  value: number;
};

function normalizePoints(points: ChartPoint[]) {
  if (points.length === 0) {
    return "";
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
}

export function ScoreRing({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "danger";
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 140 140" className="h-36 w-36">
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="fill-none stroke-white/10"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          className={cn(
            "fill-none transition-all duration-500",
            tone === "danger" ? "stroke-coral-400" : "stroke-pulse-300",
          )}
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          transform="rotate(-90 70 70)"
        />
        <text
          x="70"
          y="68"
          textAnchor="middle"
          className="fill-white text-3xl font-semibold"
        >
          {value}
        </text>
        <text
          x="70"
          y="90"
          textAnchor="middle"
          className="fill-slate-300 text-[11px]"
        >
          /100
        </text>
      </svg>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function TrendLine({
  points,
  accentClassName = "stroke-pulse-300",
}: {
  points: ChartPoint[];
  accentClassName?: string;
}) {
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 100 100" className="h-40 w-full overflow-visible">
        <polyline
          points={normalizePoints(points)}
          className={cn("fill-none stroke-[3]", accentClassName)}
        />
      </svg>
      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
        {points.slice(-4).map((point) => (
          <div key={point.date}>
            <div>{point.date.slice(5)}</div>
            <div className="text-sm text-white">{point.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniBars({ points }: { points: ChartPoint[] }) {
  const peak = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="flex h-28 items-end gap-2">
      {points.map((point) => (
        <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-2xl bg-gradient-to-t from-pulse-400 to-mint-300"
            style={{
              height: `${Math.max((point.value / peak) * 100, 8)}%`,
            }}
          />
          <span className="text-[10px] text-muted-foreground">{point.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

