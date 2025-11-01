"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Clock, Plus } from "lucide-react";
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
  onExerciseAdd?: () => void;
}

export function CircuitCard({
  type,
  duration,
  rest,
  note,
  children,
  onRemove,
  onExerciseAdd,
}: CircuitCardProps) {
  return (
    <Card
      className={cn(
        "gap-2 overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50/50 pt-3 pb-1 shadow-none"
      )}
    >
      <CardHeader className="px-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
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
        </div>
      </CardHeader>

      {note && (
        <div className="border-t border-blue-200 px-3 py-2 text-sm text-gray-600">
          {note}
        </div>
      )}

      <CardContent className="space-y-2 p-2">
        {children}

        {onExerciseAdd && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={onExerciseAdd}
              size="sm"
              variant="outline"
              className="border-2 border-dashed border-gray-300 px-6 py-2 text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add exercise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
