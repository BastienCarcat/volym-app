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
import { Form, useZodForm } from "@/components/form";
import { sessionWithExercisesSchema } from "../../../schemas";
import { useAction } from "next-safe-action/hooks";
import { saveSession } from "../../../_actions/save-session.action";
import z from "zod";
import SessionExercisesList from "./session-exercises-list";
import { toast } from "sonner";

interface SessionCardProps {
  sessionId: string;
}

export type SessionFormValues = z.infer<typeof sessionWithExercisesSchema>;

export function SessionCard({ sessionId }: SessionCardProps) {
  const { data: session } = useSession(sessionId);

  const updateSessionCache = useUpdateSessionCache();

  const form = useZodForm({
    schema: sessionWithExercisesSchema,
    reValidateMode: "onChange",
    defaultValues: session,
  });

  const { execute, isPending } = useAction(saveSession, {
    onSuccess: ({ data }) => {
      if (data) {
        // const nameChanged = session?.name !== data.name;
        // const noteChanged = session?.note !== data.note;
        updateSessionCache(sessionId, data);
        form.reset(data); // TODO: this re-render all the Form so accordions are closed after submit

        // if (nameChanged || noteChanged) {
        //   refreshWorkouts();
        // }
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
    <Card className="h-full">
      <Form form={form} onSubmit={handleSubmit} disabled={isPending}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{session.name}</h2>
              {session.note && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {session.note}
                </p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <SessionExercisesList />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button disabled={!canSave} className="shadow-lg" type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save session"}
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}
