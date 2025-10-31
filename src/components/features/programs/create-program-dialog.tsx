"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
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
import { useRefreshPrograms } from "@/app/(root)/programs/_hooks/use-programs";
import { FieldWrapper } from "@/components/ui/form";
import { ProgramType } from "@/generated/prisma";

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function CreateProgramDialog({
  open,
  onOpenChange,
}: CreateProgramDialogProps) {
  const router = useRouter();
  const refreshPrograms = useRefreshPrograms();

  const {
    form,
    action: { isExecuting },
    handleSubmitWithAction,
  } = useHookFormAction(createProgram, zodResolver(createProgramSchema), {
    formProps: {
      defaultValues: {
        name: "",
        type: ProgramType.Days,
      },
    },
    actionProps: {
      onError: ({ error }) => {
        const errorMessage =
          typeof error.serverError === "string"
            ? error.serverError
            : "An error occurred while creating program";
        toast.error(errorMessage);
      },
      onSuccess: ({ data: newProgram }) => {
        onOpenChange(false);
        refreshPrograms();
        router.push(`/programs/${newProgram.id}`);
      },
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
          <DialogDescription>
            Enter a name for your new training program.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitWithAction} className="space-y-4">
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
                disabled={isExecuting}
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
                disabled={isExecuting}
                aria-invalid={props.fieldState.invalid}
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
            <Button type="submit" disabled={isExecuting}>
              {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Program
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
