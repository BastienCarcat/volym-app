"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Save, BookmarkPlus, Clock } from "lucide-react";
import {
  useUpdateSessionCache,
  type SessionWithItems,
} from "@/hooks/use-sessions";
import { sessionWithItemsFormSchema } from "@/lib/schemas/sessions.form.schema";
import { useAction } from "next-safe-action/hooks";
import z from "zod";
import SessionItemsList from "./session-items-list";
import { toast } from "sonner";
import { useUpdateProgramCache } from "@/app/(root)/programs/_hooks/use-programs";
import { useWarnIfUnsavedChanges } from "@/hooks/use-warn-if-unsaved-changes";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProgramContext } from "@/app/(root)/programs/[id]/_providers/program-provider";
import { useWatch } from "react-hook-form";
import { FieldWrapper, Form, useZodForm } from "@/components/ui/form";
import { TitleInput } from "@/components/ui/title-input";
import {
  calculateSessionDuration,
  formatSessionDuration,
} from "@/lib/sessions/calculate-duration";
import { saveSession } from "@/app/(root)/programs/_actions/save-session.action";
import { SaveAsTemplateDialog } from "./save-as-template-dialog";

interface SessionCardProps {
  session: SessionWithItems;
  programId: string;
}

export type SessionFormValues = z.infer<typeof sessionWithItemsFormSchema>;

export function SessionCard({ session, programId }: SessionCardProps) {
  const { setActiveSession, resetActiveSession } = useProgramContext();

  const updateSessionCache = useUpdateSessionCache();
  const { updateFullSession } = useUpdateProgramCache();

  const form = useZodForm({
    schema: sessionWithItemsFormSchema,
    reValidateMode: "onChange",
    defaultValues: session,
  });

  React.useEffect(() => {
    resetActiveSession(session.id);
  }, [session.id, resetActiveSession]);

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      setActiveSession(session.id, values as SessionWithItems);
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
        toast.success("Session saved successfully");
      }
    },
    onError: () => {
      toast.error("An error occurred while saving the session");
    },
  });

  const sessionItems = useWatch({
    control: form.control,
    name: "sessionItems",
  });

  const estimatedDuration = React.useMemo(() => {
    const currentSession = {
      ...session,
      sessionItems: sessionItems || [],
    } as SessionWithItems;
    return calculateSessionDuration(currentSession);
  }, [sessionItems, session]);

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = React.useState(false);

  const canSave = form.formState.isDirty && !isPending;

  const handleSubmit = () => {
    form.handleSubmit((values) => execute(values))();
  };

  return (
    <Form
      form={form}
      disabled={isPending}
      className="flex h-full min-h-0 flex-col"
    >
      <Card className="relative h-full min-h-0">
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

            <div className="flex flex-shrink-0 items-center gap-2">
              {estimatedDuration > 0 && (
                <div className="text-muted-foreground flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm">
                  <span>{formatSessionDuration(estimatedDuration)}</span>
                  <Clock className="h-4 w-4" />
                </div>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTemplateDialogOpen(true)}
                    className="flex-shrink-0"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save session as model</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-hidden">
          <SessionItemsList />
        </CardContent>

        <Button
          disabled={!canSave}
          className="absolute right-0 bottom-0 -translate-4 transform shadow-lg"
          type="button"
          onClick={handleSubmit}
        >
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Saving..." : "Save session"}
        </Button>
      </Card>

      <SaveAsTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={(o) => setIsTemplateDialogOpen(o)}
        sessionId={session.id}
        defaultName={session.name}
      />
    </Form>
  );
}
