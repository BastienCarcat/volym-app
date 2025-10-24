"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Save } from "lucide-react";
import {
  useSession,
  useUpdateSessionCache,
  type SessionWithExercises,
} from "../../../_hooks/use-sessions";
import { FieldWrapper, Form, TitleInput, useZodForm } from "@/components/form";
import { sessionWithExercisesSchema } from "../../../schemas";
import { useAction } from "next-safe-action/hooks";
import { saveSession } from "../../../_actions/save-session.action";
import z from "zod";
import SessionExercisesList from "./session-exercises-list";
import { toast } from "sonner";
import { useUpdateProgramCache } from "../../../_hooks/use-programs";
import { useWarnIfUnsavedChanges } from "@/hooks/use-warn-if-unsaved-changes";

interface SessionCardProps {
  sessionId: string;
  programId: string;
}

export type SessionFormValues = z.infer<typeof sessionWithExercisesSchema>;

export function SessionCard({ sessionId, programId }: SessionCardProps) {
  const { data: session } = useSession(sessionId);

  const updateSessionCache = useUpdateSessionCache();
  const { updateSession } = useUpdateProgramCache();

  const form = useZodForm({
    schema: sessionWithExercisesSchema,
    reValidateMode: "onChange",
    defaultValues: session,
  });

  // TODO: show warniing if we change the day tab
  useWarnIfUnsavedChanges(
    form.formState.isDirty,
    "Your session have unsaved changes. Are you sure you want to leave?"
  );

  const { execute, isPending } = useAction(saveSession, {
    onSuccess: ({ data }) => {
      if (data) {
        const nameChanged = session?.name !== data.name;
        updateSessionCache(sessionId, data);
        form.reset(data); // TODO: this re-render all the Form so accordions are closed after submit

        if (nameChanged) {
          updateSession(programId, sessionId, { name: data.name });
        }
      }
    },
    onError: () => {
      toast.error("An error occurred while saving the session");
    },
  });

  const handleSubmit = (data: SessionWithExercises) => {
    execute(data);
  };

  const canSave = form.formState.isDirty && !isPending;

  return (
    <Form
      form={form}
      onSubmit={handleSubmit}
      disabled={isPending}
      className="flex h-full min-h-0 flex-col"
    >
      <Card className="h-full min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle>
            <FieldWrapper name="name" control={form.control}>
              {(props) => (
                <TitleInput
                  {...props.field}
                  placeholder="Enter session name"
                  maxLength={30}
                  showCharCount
                  as="h2"
                />
              )}
            </FieldWrapper>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-hidden">
          <SessionExercisesList />
        </CardContent>
        <CardFooter className="flex flex-shrink-0 justify-end">
          <Button disabled={!canSave} className="shadow-lg" type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save session"}
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
