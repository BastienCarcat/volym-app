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
import { Input } from "@/components/form/fields/inputs/input";

import { createProgramSchema } from "../_schemas/schemas";
import { createProgram } from "../_actions/create-program.action";
import { useRefreshPrograms } from "../_hooks/use-programs";

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
          <Input
            name="name"
            control={form.control}
            label="Program Name"
            placeholder="e.g., Upper/Lower"
            required
            disabled={isExecuting}
          />
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
