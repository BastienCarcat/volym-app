"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAction } from "next-safe-action/hooks";
import { deleteTemplate } from "../_actions/delete-template.action";
import { toast } from "sonner";
import { useUpdateTemplatesCache } from "../_hooks/use-templates";

export type Template = {
  id: string;
  name: string;
  note: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

function DeleteTemplateButton({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName: string;
}) {
  const { removeTemplate } = useUpdateTemplatesCache();
  const { execute, isPending } = useAction(deleteTemplate, {
    onSuccess: ({ input }) => {
      removeTemplate(input.templateId);
      toast.success("Template deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete template");
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the template &quot;{templateName}
            &quot;. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => execute({ templateId })}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<Template>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      const note = row.getValue("note") as string | null;
      return <span className="text-muted-foreground">{note || "-"}</span>;
    },
    size: 600,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <DeleteTemplateButton
            templateId={row.original.id}
            templateName={row.original.name}
          />
        </div>
      );
    },
    size: 100,
  },
];
