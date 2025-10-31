"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, GripVertical, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircuitTypeBadge } from "./circuit-type-badge";
import { CircuitType } from "@/generated/prisma";
import { cn } from "@/lib/utils";

interface CircuitCardProps {
  type: CircuitType;
  duration?: number | null;
  rest?: number | null;
  note?: string | null;
  children: React.ReactNode;
  onRemove?: () => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function CircuitCard({
  type,
  duration,
  rest,
  note,
  children,
  onRemove,
  isDragging = false,
  dragHandleProps,
}: CircuitCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50/50 shadow-none",
        isDragging && "opacity-50"
      )}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 px-3 py-2">
        <div className="flex items-center gap-3">
          {dragHandleProps && (
            <button
              type="button"
              className="cursor-grab touch-none active:cursor-grabbing"
              {...dragHandleProps}
            >
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}

          <CircuitTypeBadge type={type} />

          <div className="flex items-center gap-3 text-sm text-gray-600">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{duration}s</span>
              </div>
            )}
            {rest && (
              <div className="flex items-center gap-1">
                <span>Rest: {rest}s</span>
              </div>
            )}
          </div>
        </div>

        {onRemove && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onRemove}
                className="focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove circuit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      {note && (
        <div className="border-t border-blue-200 px-3 py-2 text-sm text-gray-600">
          {note}
        </div>
      )}

      <CardContent className="space-y-2 p-2">{children}</CardContent>
    </Card>
  );
}
