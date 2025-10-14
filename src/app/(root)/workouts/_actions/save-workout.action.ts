"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { saveWorkoutSchema } from "../schemas";

export const saveWorkout = authActionClient
  .inputSchema(saveWorkoutSchema)
  .action(async ({ parsedInput: input }) => {
    console.log("input :>> ", input);
    return { status: "ok" };
    // return await prisma.$transaction(async (tx) => {
    //   // 1. Update workout basic info
    //   await tx.workout.update({
    //     where: { id: input.id },
    //     data: {
    //       name: input.name,
    //       note: input.note,
    //     },
    //   });

    //   // 2. Delete all existing exercises and their sets (cascade delete)
    //   await tx.workoutExercise.deleteMany({
    //     where: { workoutId: input.id },
    //   });

    //   // 3. Create new exercises with their sets
    //   for (const exercise of input.exercises) {
    //     const createdExercise = await tx.workoutExercise.create({
    //       data: {
    //         workoutId: input.id,
    //         exerciseId: exercise.exerciseId,
    //         note: exercise.note,
    //         order: exercise.order,
    //       },
    //     });

    //     // Create sets for this exercise
    //     if (exercise.sets.length > 0) {
    //       await tx.exerciseSet.createMany({
    //         data: exercise.sets.map((set) => ({
    //           workoutExerciseId: createdExercise.id,
    //           weight: set.weight,
    //           reps: set.reps,
    //           rest: set.rest,
    //           type: set.type,
    //           rpe: set.rpe,
    //           order: set.order,
    //         })),
    //       });
    //     }
    //   }

    //   // 4. Return the complete updated workout with relations
    //   return await tx.workout.findUnique({
    //     where: { id: input.id },
    //     include: {
    //       exercises: {
    //         orderBy: { order: "asc" },
    //         include: {
    //           sets: {
    //             orderBy: { order: "asc" },
    //           },
    //         },
    //       },
    //     },
    //   });
    // });
  });
