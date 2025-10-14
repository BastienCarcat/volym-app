"use client";

import React, { useCallback } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  useCreateWorkout,
  useGetWorkouts,
} from "@/app/(root)/deprecated/_hooks/workout";
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

export function NavGroupWorkouts() {
  const router = useRouter();
  const { mutate, isPending: createIsPending } = useCreateWorkout({
    onSuccess: (newWorkout) => {
      router.push(`/workouts/${newWorkout.id}`);
    },
  });
  const { data: workouts, isLoading: getIsLoading } = useGetWorkouts();

  const handleAddWorkout = useCallback(() => {
    mutate({
      name: "New Workout",
    });
  }, [mutate]);

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
