"use client";

import * as React from "react";
import { toast } from "sonner";
import { DayOfWeek } from "@/generated/prisma";

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

interface CreateSessionDialogProps {
  programId: string;
  // For Days type
  day?: DayOfWeek;
  weekNumber?: number;
  // For Cycle type
  cycleDay?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionDialog({
  programId,
  day,
  weekNumber,
  cycleDay,
  open,
  onOpenChange,
}: CreateSessionDialogProps) {
  const { data: templates = [] } = useTemplates();

  const isCycleType = cycleDay !== undefined;

  const form = useZodForm({
    schema: createSessionFormSchema,
    defaultValues: {
      programId,
      name: "",
      day,
      weekNumber,
      note: "",
      isRestDay: false,
      ...(isCycleType && { cycleDay }),
    },
  });

  const { mutate, isPending } = useCreateSession();

  const handleSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
        toast.success("Session created successfully");
      },
      onError: () => {
        toast.error("An error occurred while creating session");
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

  const dialogTitle = isCycleType
    ? `Add Day ${cycleDay}`
    : "Create New Session";
  const dialogDescription = isCycleType
    ? `Create a new training session for Day ${cycleDay}.${hasTemplates ? " Optionally select a template to duplicate exercises from." : ""}`
    : `Create a new training session for ${day}.${hasTemplates ? " Optionally select a template to duplicate exercises from." : ""}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={handleSubmit} disabled={isPending}>
          <div className="space-y-4">
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
                  ></SelectInput>
                )}
              </FieldWrapper>
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
                Create Session
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
