import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({
  score,
  size = "sm",
  showLabel = false,
  className,
}: ScoreBadgeProps) {
  const { color, textColor, grade } = getScoreVisualization(score);
  const circleSize = size === "sm" ? 60 : size === "md" ? 80 : 100;
  const strokeWidth = size === "sm" ? 4 : size === "md" ? 5 : 6;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const scoreFontSize =
    size === "sm" ? "18px" : size === "md" ? "24px" : "32px";
  const subscriptFontSize =
    size === "sm" ? "10px" : size === "md" ? "14px" : "18px";
  const subscriptShift = size === "sm" ? "3" : size === "md" ? "6" : "8";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg width={circleSize} height={circleSize} className="rotate-[-90deg]">
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <g transform={`rotate(90 ${circleSize / 2} ${circleSize / 2})`}>
          <text
            x={circleSize / 2}
            y={circleSize / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className={textColor}
            style={{ fontSize: scoreFontSize }}
          >
            <tspan className={cn("font-bold")}>{score}</tspan>
            <tspan
              className={cn("font-normal")}
              style={{ fontSize: subscriptFontSize }}
              dy={subscriptShift}
            >
              %
            </tspan>
          </text>
        </g>
      </svg>
      {showLabel && (
        <span className="text-muted-foreground text-xs font-medium">
          {grade}
        </span>
      )}
    </div>
  );
}

function getScoreVisualization(score: number): {
  color: string;
  textColor: string;
  grade: string;
} {
  if (score >= 90) {
    return {
      color: "hsl(142, 76%, 36%)",
      textColor: "fill-green-600",
      grade: "Excellent",
    };
  }
  if (score >= 80) {
    return {
      color: "hsl(142, 70%, 45%)",
      textColor: "fill-green-500",
      grade: "Very Good",
    };
  }
  if (score >= 70) {
    return {
      color: "hsl(45, 93%, 47%)",
      textColor: "fill-yellow-600",
      grade: "Good",
    };
  }
  if (score >= 60) {
    return {
      color: "hsl(25, 95%, 53%)",
      textColor: "fill-orange-500",
      grade: "Fair",
    };
  }
  return {
    color: "hsl(0, 84%, 60%)",
    textColor: "fill-red-500",
    grade: "Needs Work",
  };
}
