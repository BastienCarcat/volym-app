"use client";

import React, { useCallback } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createWorkout } from "@/app/(root)/workouts/_actions/create-workout.action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  useRefreshWorkouts,
  useWorkouts,
} from "@/app/(root)/workouts/_hooks/use-workouts";

export function NavGroupWorkouts() {
  const router = useRouter();
  const refreshWorkouts = useRefreshWorkouts();

  const { execute, isPending: createIsPending } = useAction(createWorkout, {
    onError: ({ error }) => {
      const serverError = error.serverError;

      toast.error(
        serverError?.message || "An error occurred while creating workout"
      );
    },
    onSuccess: ({ data: newWorkout }) => {
      router.push(`/workouts/${newWorkout.id}`);
      void refreshWorkouts();
    },
  });

  const { data, isLoading: getIsLoading } = useWorkouts();

  const handleAddWorkout = useCallback(() => {
    execute({
      name: "New Workout",
    });
  }, [execute]);

  const workouts = data?.workouts || [];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workouts</SidebarGroupLabel>
      <SidebarGroupAction
        title="Add workout"
        onClick={handleAddWorkout}
        disabled={createIsPending}
      >
        {createIsPending ? (
          <Loader2 className="text-gray-400 animate-spin" />
        ) : (
          <Plus />
        )}
        <span className="sr-only">Add workout</span>
      </SidebarGroupAction>
      <SidebarMenu>
        {getIsLoading ? (
          <SidebarMenuItem className="flex justify-center pt-2">
            <Loader2 className="text-gray-400 animate-spin" />
          </SidebarMenuItem>
        ) : workouts?.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>No workouts yet</SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          workouts?.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <Link href={`/workouts/${item.id}`}>{item.name}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
