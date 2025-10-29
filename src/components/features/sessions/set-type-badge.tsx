import { SetType } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Flame, Droplet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetTypeBadgeProps {
  type: SetType;
  className?: string;
}

export function SetTypeBadge({ type, className }: SetTypeBadgeProps) {
  if (type === SetType.Normal) {
    return null;
  }

  const config = getSetTypeConfig(type);

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border font-medium",
        config.className,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}

function getSetTypeConfig(type: SetType) {
  switch (type) {
    case SetType.WarmUp:
      return {
        label: "Warm-up",
        icon: <Droplet className="h-3 w-3" />,
        className: "border-blue-200 bg-blue-50 text-blue-700",
      };
    case SetType.DropsSet:
      return {
        label: "Drop Set",
        icon: <Zap className="h-3 w-3" />,
        className: "border-orange-200 bg-orange-50 text-orange-700",
      };
    case SetType.Failure:
      return {
        label: "Failure",
        icon: <Flame className="h-3 w-3" />,
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case SetType.Normal:
    default:
      return {
        label: "Normal",
        icon: null,
        className: "border-gray-200 bg-gray-50 text-gray-700",
      };
  }
}

export function getSetTypeLabel(type: SetType): string {
  return getSetTypeConfig(type).label;
}
