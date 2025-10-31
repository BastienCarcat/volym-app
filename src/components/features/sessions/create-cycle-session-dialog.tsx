"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select-input";
import { FieldWrapper, Form, useZodForm } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { createSessionFormSchema } from "@/lib/schemas/sessions.form.schema";
import { useCreateSession } from "@/hooks/use-sessions";
import { useTemplates } from "@/app/(root)/templates/_hooks/use-templates";
import { z } from "zod";

interface CreateCycleSessionDialogProps {
  programId: string;
  cycleDay: number;
  weekNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAY_TYPE_OPTIONS = [
  { value: "training", label: "Training Day" },
  { value: "rest", label: "Rest Day" },
];

export function CreateCycleSessionDialog({
  programId,
  cycleDay,
  weekNumber,
  open,
  onOpenChange,
}: CreateCycleSessionDialogProps) {
  const { data: templates = [] } = useTemplates();
  const [dayType, setDayType] = React.useState<"training" | "rest">("training");

  const form = useZodForm({
    schema: createSessionFormSchema,
    defaultValues: {
      programId,
      name: "",
      cycleDay,
      weekNumber,
      note: "",
      isRestDay: false,
    },
  });

  const { mutate, isPending } = useCreateSession();

  const handleSubmit = (data: z.infer<typeof createSessionFormSchema>) => {
    const submitData = {
      ...data,
      isRestDay: dayType === "rest",
      name: dayType === "rest" ? "Rest Day" : data.name,
    };

    mutate(submitData, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
        setDayType("training");
        toast.success("Day created successfully");
      },
      onError: () => {
        toast.error("An error occurred while creating day");
      },
    });
  };

  const templateOptions = React.useMemo(
    () =>
      templates.map((template) => ({
        value: template.id,
        label: template.name,
      })),
    [templates]
  );

  const hasTemplates = templates.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Day {cycleDay} to Cycle</DialogTitle>
          <DialogDescription>
            Create a new training day or rest day in your cycle.
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={handleSubmit} disabled={isPending}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Day Type <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Choose whether this is a training day or rest day
              </p>
              <SelectInput
                value={dayType}
                onChange={(value) => setDayType(value as "training" | "rest")}
                options={DAY_TYPE_OPTIONS}
              />
            </div>

            {dayType === "training" && (
              <>
                <FieldWrapper
                  name="name"
                  control={form.control}
                  label="Session Name"
                  required
                >
                  {(props) => (
                    <Input
                      {...props.field}
                      placeholder="e.g., Upper Body"
                      aria-invalid={props.fieldState.invalid}
                    />
                  )}
                </FieldWrapper>

                {hasTemplates && (
                  <FieldWrapper
                    name="templateId"
                    control={form.control}
                    label="Template (Optional)"
                    description="Select a template to duplicate exercises from"
                  >
                    {(props) => (
                      <SelectInput
                        {...props.field}
                        placeholder="None"
                        options={templateOptions}
                        clearable
                        aria-invalid={props.fieldState.invalid}
                      />
                    )}
                  </FieldWrapper>
                )}
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner className="text-muted-foreground" />}
                Create Day
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
