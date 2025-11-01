"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "next-safe-action/hooks";
import { saveSessionAsTemplate } from "@/app/(root)/programs/_actions/save-session-as-template.action";
import { toast } from "sonner";
import {
  useRefreshTemplates,
  useUpdateTemplatesCache,
} from "@/app/(root)/templates/_hooks/use-templates";

interface SaveAsTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  defaultName: string;
}

export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  sessionId,
  defaultName,
}: SaveAsTemplateDialogProps) {
  const [templateName, setTemplateName] = React.useState("");
  const refresh = useRefreshTemplates();

  React.useEffect(() => {
    if (open) {
      setTemplateName(defaultName);
    }
  }, [open, defaultName]);

  const { execute: saveAsTemplate, isPending } = useAction(
    saveSessionAsTemplate,
    {
      onSuccess: ({ data, input }) => {
        if (data) {
          refresh();
          toast.success(
            `Template "${input.templateName}" created successfully`
          );
          onOpenChange(false);
          setTemplateName("");
        }
      },
      onError: () => {
        toast.error("An error occurred while saving the template");
      },
    }
  );

  const handleSave = () => {
    if (templateName.trim()) {
      saveAsTemplate({ sessionId, templateName: templateName.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>
            Enter a name for your template. This will save the current session
            structure as a reusable template.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Input
            id="template-name"
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!templateName.trim() || isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              "Save template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
