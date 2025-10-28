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

import { Save, BookmarkPlus } from "lucide-react";
import {
  useUpdateSessionCache,
  type SessionWithExercises,
} from "@/hooks/use-sessions";
import { sessionWithExercisesSchema } from "@/lib/schemas/sessions";
import { useAction } from "next-safe-action/hooks";
import { saveSession } from "@/app/(root)/programs/_actions/save-session.action";
import { saveSessionAsTemplate } from "@/app/(root)/programs/_actions/save-session-as-template.action";
import z from "zod";
import SessionExercisesList from "./session-exercises-list";
import { toast } from "sonner";
import { useUpdateProgramCache } from "@/app/(root)/programs/_hooks/use-programs";
import { useWarnIfUnsavedChanges } from "@/hooks/use-warn-if-unsaved-changes";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUpdateTemplatesCache } from "@/app/(root)/templates/_hooks/use-templates";
import { useProgramContext } from "@/app/(root)/programs/[id]/_providers/program-provider";
import { useWatch } from "react-hook-form";
import { FieldWrapper, Form, useZodForm } from "@/components/ui/form";
import { TitleInput } from "@/components/ui/title-input";

interface SessionCardProps {
  session: SessionWithExercises;
  programId: string;
}

export type SessionFormValues = z.infer<typeof sessionWithExercisesSchema>;

export function SessionCard({ session, programId }: SessionCardProps) {
  const { setActiveSession, resetActiveSession } = useProgramContext();

  const updateSessionCache = useUpdateSessionCache();
  const { updateFullSession } = useUpdateProgramCache();
  const { addTemplate } = useUpdateTemplatesCache();

  const form = useZodForm({
    schema: sessionWithExercisesSchema,
    reValidateMode: "onChange",
    defaultValues: session,
  });

  React.useEffect(() => {
    resetActiveSession(session.id);
  }, [session.id, resetActiveSession]);

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      setActiveSession(session.id, values as SessionWithExercises);
    });
    return () => subscription.unsubscribe();
  }, [form, session.id, setActiveSession]);

  useWarnIfUnsavedChanges(
    form.formState.isDirty,
    "Your session have unsaved changes. Are you sure you want to leave?"
  );

  const { execute, isPending } = useAction(saveSession, {
    onSuccess: ({ data }) => {
      if (data) {
        updateSessionCache(session.id, data);
        updateFullSession(programId, session.id, data);
        form.reset(data); // TODO: this re-render all the Form so accordions are closed after submit
      }
    },
    onError: () => {
      toast.error("An error occurred while saving the session");
    },
  });

  const { execute: saveAsTemplate, isPending: isSavingAsTemplate } = useAction(
    saveSessionAsTemplate,
    {
      onSuccess: ({ data }) => {
        if (data) {
          addTemplate({
            id: data.id,
            name: data.name,
            note: data.note,
            isPublic: data.isPublic,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
          });
          toast.success(`Template "${data.name}" created successfully`);
        }
      },
      onError: () => {
        toast.error("An error occurred while saving the template");
      },
    }
  );

  const handleSubmit = (data: SessionWithExercises) => {
    execute(data);
  };

  const handleSaveAsTemplate = () => {
    saveAsTemplate({ sessionId: session.id });
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
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex-1">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveAsTemplate}
                  disabled={isSavingAsTemplate}
                  className="flex-shrink-0"
                >
                  {isSavingAsTemplate ? (
                    <Spinner />
                  ) : (
                    <BookmarkPlus className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save session as model</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
