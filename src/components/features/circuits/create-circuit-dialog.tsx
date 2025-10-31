"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircuitType } from "@/generated/prisma";
import { Form, useZodForm, FieldWrapper } from "@/components/ui/form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NumberInput } from "@/components/ui/number-input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Zap, Repeat, Infinity } from "lucide-react";

const createCircuitSchema = z.object({
  type: z.enum(Object.values(CircuitType) as [CircuitType, ...CircuitType[]]),
  duration: z.number().positive().nullable(),
  rest: z.number().positive().nullable(),
  note: z.string().nullable(),
});

export type CreateCircuitFormValues = z.infer<typeof createCircuitSchema>;

interface CreateCircuitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCircuitCreate: (circuit: CreateCircuitFormValues) => void;
}

const circuitTypes = [
  {
    type: CircuitType.Superset,
    label: "Superset",
    description: "2 exercises back-to-back",
    icon: Zap,
  },
  {
    type: CircuitType.Biset,
    label: "Biset",
    description: "2 exercises same muscle",
    icon: Zap,
  },
  {
    type: CircuitType.Triset,
    label: "Triset",
    description: "3 exercises in sequence",
    icon: Repeat,
  },
  {
    type: CircuitType.GiantSet,
    label: "Giant Set",
    description: "4+ exercises in sequence",
    icon: Repeat,
  },
  {
    type: CircuitType.AMRAP,
    label: "AMRAP",
    description: "As Many Rounds As Possible",
    icon: Infinity,
  },
];

export function CreateCircuitDialog({
  open,
  onOpenChange,
  onCircuitCreate,
}: CreateCircuitDialogProps) {
  const [selectedType, setSelectedType] = useState<CircuitType | null>(null);

  const form = useZodForm({
    schema: createCircuitSchema,
    defaultValues: {
      type: CircuitType.Superset,
      duration: null,
      rest: null,
      note: null,
    },
  });

  const handleSubmit = (data: CreateCircuitFormValues) => {
    onCircuitCreate(data);
    onOpenChange(false);
    form.reset();
    setSelectedType(null);
  };

  const handleTypeSelect = (type: CircuitType) => {
    setSelectedType(type);
    form.setValue("type", type);
  };

  const isAmrap = form.watch("type") === CircuitType.AMRAP;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Circuit</DialogTitle>
          <DialogDescription>
            Choose a circuit type and configure parameters
          </DialogDescription>
        </DialogHeader>

        <Form form={form} onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Circuit Type Selection */}
            <div className="space-y-3">
              <Label>Circuit Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {circuitTypes.map(({ type, label, description, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all hover:bg-accent",
                      selectedType === type
                        ? "border-primary bg-accent"
                        : "border-border"
                    )}
                  >
                    <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold">{label}</div>
                      <div className="text-muted-foreground text-sm">
                        {description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AMRAP Duration */}
            {isAmrap && (
              <FieldWrapper name="duration" control={form.control}>
                {(props) => (
                  <div className="space-y-2">
                    <Label>Duration (seconds)</Label>
                    <NumberInput
                      {...props.field}
                      value={props.field.value || ""}
                      onChange={(value) =>
                        props.field.onChange(value ? Number(value) : null)
                      }
                      placeholder="e.g., 300"
                      min={1}
                    />
                  </div>
                )}
              </FieldWrapper>
            )}

            {/* Rest Between Rounds */}
            <FieldWrapper name="rest" control={form.control}>
              {(props) => (
                <div className="space-y-2">
                  <Label>Rest Between Rounds (seconds)</Label>
                  <NumberInput
                    {...props.field}
                    value={props.field.value || ""}
                    onChange={(value) =>
                      props.field.onChange(value ? Number(value) : null)
                    }
                    placeholder="e.g., 120"
                    min={0}
                  />
                </div>
              )}
            </FieldWrapper>

            {/* Note */}
            <FieldWrapper name="note" control={form.control}>
              {(props) => (
                <div className="space-y-2">
                  <Label>Note (optional)</Label>
                  <Textarea
                    {...props.field}
                    value={props.field.value || ""}
                    placeholder="Add any notes about this circuit"
                    className="h-20"
                  />
                </div>
              )}
            </FieldWrapper>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
                setSelectedType(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedType}>
              Create Circuit
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
