"use client";

import React, { useCallback } from "react";
import { Plus } from "lucide-react";
import { Group, NavGroup } from "@/components/layout/sidebar/nav-group";
import { useCreateWorkout } from "@/app/(root)/workouts/_hooks/use-workouts";

export function NavGroupWorkouts({ group }: { group: Group }) {
  const createWorkoutMutation = useCreateWorkout();

  const handleAddWorkout = useCallback(() => {
    createWorkoutMutation.mutate({
      name: "New Workout",
    });
  }, [createWorkoutMutation]);

  return (
    <NavGroup group={group}>
      <NavGroup.Action title={`Add ${group.entity}`} onClick={handleAddWorkout}>
        <Plus />
        <span className="sr-only">Add {group.entity}</span>
      </NavGroup.Action>
    </NavGroup>
  );
}
