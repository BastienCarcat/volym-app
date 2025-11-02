"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

import { createProgramSchema } from "@/lib/schemas/programs";
import { createProgram } from "@/app/(root)/programs/_actions/create-program.action";
import { updateUserLevel } from "@/app/(root)/programs/_actions/update-user-level.action";
import { useRefreshPrograms } from "@/app/(root)/programs/_hooks/use-programs";
import { FieldWrapper, useZodForm, Form } from "@/components/ui/form";
import { ProgramType, ProgramObjective, UserLevel } from "@/generated/prisma";
import { useAction } from "next-safe-action/hooks";
import z from "zod";

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLevel: UserLevel | null;
}

const PROGRAM_TYPE_OPTIONS = [
  {
    value: ProgramType.Days,
    label: "Days",
    description: "Fixed weekly schedule (Monday to Sunday)",
  },
  {
    value: ProgramType.Cycle,
    label: "Cycle",
    description: "Rotating training cycle (Day 1, Day 2, Day 3...)",
  },
];

const PROGRAM_OBJECTIVE_OPTIONS = [
  {
    value: ProgramObjective.Hypertrophy,
    label: "Hypertrophy",
  },
  {
    value: ProgramObjective.Strength,
    label: "Strength",
  },
  {
    value: ProgramObjective.PowerLifting,
    label: "PowerLifting",
  },
  {
    value: ProgramObjective.Endurance,
    label: "Endurance",
  },
  {
    value: ProgramObjective.Recomposition,
    label: "Recomposition",
  },
  {
    value: ProgramObjective.Athletic,
    label: "Athletic",
  },
  {
    value: ProgramObjective.General,
    label: "General",
  },
];

const USER_LEVEL_OPTIONS = [
  {
    value: UserLevel.Beginner,
    label: "Beginner (< 1 year)",
  },
  {
    value: UserLevel.Intermediate,
    label: "Intermediate (1-3 years)",
  },
  {
    value: UserLevel.Advanced,
    label: "Advanced (3-5 years)",
  },
  {
    value: UserLevel.Elite,
    label: "Elite (5+ years)",
  },
];

const createProgramWithUserLevelSchema = createProgramSchema.extend({
  userLevel: z.enum(UserLevel),
});

export function CreateProgramDialog({
  open,
  onOpenChange,
  userLevel,
}: CreateProgramDialogProps) {
  const router = useRouter();
  const refreshPrograms = useRefreshPrograms();

  const form = useZodForm({
    schema: createProgramWithUserLevelSchema,
    defaultValues: {
      name: "",
      type: ProgramType.Days,
      ...(userLevel && { userLevel }),
    },
  });

  const { execute: executeCreateProgram, isExecuting } = useAction(
    createProgram,
    {
      onError: ({ error }) => {
        const errorMessage =
          typeof error.serverError === "string"
            ? error.serverError
            : "An error occurred while creating program";
        toast.error(errorMessage);
      },
      onSuccess: ({ data }) => {
        router.push(`/programs/${data.id}`);
        onOpenChange(false);
        refreshPrograms();
      },
    }
  );

  const { execute: executeUpdateUserLevel } = useAction(updateUserLevel, {
    onError: ({ error }) => {
      const errorMessage =
        typeof error.serverError === "string"
          ? error.serverError
          : "An error occurred while updating your training level";
      toast.error(errorMessage);
    },
  });

  const needUpdateUserLevel = !userLevel;

  const handleSubmit = async (
    data: z.infer<typeof createProgramWithUserLevelSchema>
  ) => {
    const { userLevel, ...newProgramValues } = data;
    if (needUpdateUserLevel) {
      executeUpdateUserLevel({ level: userLevel });
    }
    executeCreateProgram(newProgramValues);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
          <DialogDescription>
            Enter the details for your new training program.
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={handleSubmit} disabled={isExecuting}>
          <div className="space-y-4">
            {needUpdateUserLevel && (
              <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div>
                  <h4 className="font-semibold text-blue-900">
                    What is your training level?
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    This helps us provide better insights for your program.
                  </p>
                </div>

                <FieldWrapper name="userLevel" control={form.control} required>
                  {(props) => (
                    <SelectInput
                      {...props.field}
                      options={USER_LEVEL_OPTIONS}
                      placeholder="Select your level"
                      aria-invalid={props.fieldState.invalid}
                    />
                  )}
                </FieldWrapper>
              </div>
            )}

            <FieldWrapper
              name="name"
              control={form.control}
              label="Program Name"
              required
            >
              {(props) => (
                <Input
                  {...props.field}
                  placeholder="e.g., Upper/Lower"
                  aria-invalid={props.fieldState.invalid}
                />
              )}
            </FieldWrapper>

            <FieldWrapper
              name="type"
              control={form.control}
              label="Program Type"
              required
              description="Choose how your training schedule is structured"
            >
              {(props) => (
                <SelectInput
                  {...props.field}
                  options={PROGRAM_TYPE_OPTIONS}
                  aria-invalid={props.fieldState.invalid}
                />
              )}
            </FieldWrapper>

            <FieldWrapper
              name="objective"
              control={form.control}
              label="Program Objective"
              description="What is the main goal of this program?"
            >
              {(props) => (
                <SelectInput
                  {...props.field}
                  options={PROGRAM_OBJECTIVE_OPTIONS}
                  aria-invalid={props.fieldState.invalid}
                  placeholder="Select an objective (optional)"
                />
              )}
            </FieldWrapper>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isExecuting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isExecuting || !form.formState.isDirty}
              >
                {isExecuting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Program
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
