import { Badge } from "@/components/ui/badge";
import { CircuitType } from "@/generated/prisma";
import { Zap, Repeat, Infinity } from "lucide-react";

interface CircuitTypeBadgeProps {
  type: CircuitType;
  className?: string;
}

const circuitConfig = {
  [CircuitType.Superset]: {
    label: "Superset",
    icon: Zap,
    variant: "default" as const,
  },
  [CircuitType.Biset]: {
    label: "Biset",
    icon: Zap,
    variant: "default" as const,
  },
  [CircuitType.Triset]: {
    label: "Triset",
    icon: Repeat,
    variant: "secondary" as const,
  },
  [CircuitType.GiantSet]: {
    label: "Giant Set",
    icon: Repeat,
    variant: "secondary" as const,
  },
  [CircuitType.AMRAP]: {
    label: "AMRAP",
    icon: Infinity,
    variant: "outline" as const,
  },
};

export function CircuitTypeBadge({ type, className }: CircuitTypeBadgeProps) {
  const config = circuitConfig[type];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
