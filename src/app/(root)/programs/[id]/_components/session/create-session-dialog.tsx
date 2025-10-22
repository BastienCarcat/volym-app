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
import { Input } from "@/components/form/fields/inputs/input";
import { SelectInput } from "@/components/form/fields/inputs/select-input";
import { FieldWrapper } from "@/components/form/fields/field-wrapper";
import { Form, useZodForm } from "@/components/form/form";

import { Spinner } from "@/components/ui/spinner";
import { createSessionSchema } from "../../../schemas";
import { useTemplates } from "../../../_hooks/use-templates";
import { useCreateSession } from "../../../_hooks/use-sessions";

interface CreateSessionDialogProps {
  programId: string;
  day: DayOfWeek;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionDialog({
  programId,
  day,
  open,
  onOpenChange,
}: CreateSessionDialogProps) {
  const { data: templates = [] } = useTemplates();

  const form = useZodForm({
    schema: createSessionSchema,
    defaultValues: {
      programId,
      name: "",
      day,
      note: "",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Create a new training session for {day}.
            {hasTemplates &&
              " Optionally select a template to duplicate exercises from."}
          </DialogDescription>
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
