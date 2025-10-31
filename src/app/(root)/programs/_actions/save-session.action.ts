"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { sessionWithItemsFormSchema } from "@/lib/schemas/sessions.form.schema";
import { SessionItemType, CircuitItemType, Prisma } from "@/generated/prisma";
import { getSessionById } from "@/lib/database/get-session-by-id";
import { SafeActionError } from "@/lib/errors";
import type { SessionFormValues } from "@/components/features/sessions/session-card";

/**
 * Refactored saveSession
 *
 * Architecture:
 * 1. Fetch existing data
 * 2. Compute operation plan (diffs)
 * 3. Execute operations in order:
 *    - Delete cascade: Sets → Exercises → CircuitItems → Circuits → SessionItems
 *    - Update: parallel bulk updates
 *    - Create: nested creates with parallelism
 *
 * Handles:
 * - Add/remove sessionItems
 * - Add/remove circuitItems
 * - Type conversion (Exercise ↔ Circuit)
 * - Add/remove/update sets
 * - Update exercises/circuits
 */

/* ===================== TYPES ===================== */

interface ExistingSessionItem {
  id: string;
  order: number;
  type: SessionItemType;
  exerciseId: string | null;
  circuitId: string | null;
  exercise: { id: string; sets: { id: string }[] } | null;
  circuit: {
    id: string;
    circuitItems: {
      id: string;
      exerciseId: string | null;
      exercise: { id: string; sets: { id: string }[] } | null;
    }[];
  } | null;
}

interface OperationPlan {
  // Deletes (must be done first, in cascade order)
  setIdsToDelete: string[];
  exerciseIdsToDelete: string[];
  circuitItemIdsToDelete: string[];
  circuitIdsToDelete: string[];
  sessionItemIdsToDelete: string[];

  // Updates (can be done in parallel)
  sessionItemUpdates: Array<{ id: string; order: number }>;
  exerciseUpdates: Array<{
    id: string;
    exerciseId: string;
    note: string | null;
  }>;
  circuitUpdates: Array<{
    id: string;
    type: any;
    duration: number | null;
    rest: number | null;
    note: string | null;
  }>;
  circuitItemUpdates: Array<{ id: string; order: number }>;
  setUpdates: Array<{
    id: string;
    weight: number | null;
    reps: number | null;
    rest: number | null;
    type: any;
    rpe: number | null;
    order: number;
  }>;

  // Creates (by exerciseId for bulk createMany)
  setCreatesByExerciseId: Record<string, Prisma.SetCreateManyInput[]>;

  // Nested creates (must be sequential per item, but parallel across items)
  nestedCreates: Array<(tx: any) => Promise<any>>;
}

/* ===================== UTILITIES ===================== */

const chunk = <T>(arr: T[], size = 50): T[][] => {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
};

const parallelChunked = async <T>(
  tasks: (() => Promise<T>)[],
  concurrency = 20
): Promise<T[]> => {
  const results: T[] = [];
  const sets = chunk(tasks, concurrency);
  for (const s of sets) {
    results.push(...(await Promise.all(s.map((fn) => fn()))));
  }
  return results;
};

/* ===================== FETCH EXISTING DATA ===================== */

async function fetchExistingData(
  tx: any,
  sessionId: string
): Promise<ExistingSessionItem[]> {
  return tx.sessionItem.findMany({
    where: { sessionId },
    select: {
      id: true,
      order: true,
      type: true,
      exerciseId: true,
      circuitId: true,
      exercise: {
        select: {
          id: true,
          sets: { select: { id: true } },
        },
      },
      circuit: {
        select: {
          id: true,
          circuitItems: {
            select: {
              id: true,
              exerciseId: true,
              exercise: {
                select: { id: true, sets: { select: { id: true } } },
              },
            },
          },
        },
      },
    },
  });
}

/* ===================== COMPUTE PLAN ===================== */

function computeOperationPlan(
  input: SessionFormValues,
  existingItems: ExistingSessionItem[]
): OperationPlan {
  const plan: OperationPlan = {
    setIdsToDelete: [],
    exerciseIdsToDelete: [],
    circuitItemIdsToDelete: [],
    circuitIdsToDelete: [],
    sessionItemIdsToDelete: [],
    sessionItemUpdates: [],
    exerciseUpdates: [],
    circuitUpdates: [],
    circuitItemUpdates: [],
    setUpdates: [],
    setCreatesByExerciseId: {},
    nestedCreates: [],
  };

  const existingMap = new Map(existingItems.map((it) => [it.id, it]));
  const inputItemIds = new Set(
    input.sessionItems.filter((it) => it.id).map((it) => it.id!)
  );

  // Identify deleted sessionItems and cascade deletes
  for (const existing of existingItems) {
    if (!inputItemIds.has(existing.id)) {
      plan.sessionItemIdsToDelete.push(existing.id);

      // Cascade: collect children to delete
      if (existing.exerciseId && existing.exercise) {
        plan.exerciseIdsToDelete.push(existing.exerciseId);
        plan.setIdsToDelete.push(...existing.exercise.sets.map((s) => s.id));
      }

      if (existing.circuitId && existing.circuit) {
        plan.circuitIdsToDelete.push(existing.circuitId);
        for (const ci of existing.circuit.circuitItems) {
          plan.circuitItemIdsToDelete.push(ci.id);
          if (ci.exerciseId && ci.exercise) {
            plan.exerciseIdsToDelete.push(ci.exerciseId);
            plan.setIdsToDelete.push(...ci.exercise.sets.map((s) => s.id));
          }
        }
      }
    }
  }

  // Process input items
  for (const inputItem of input.sessionItems) {
    const existing = inputItem.id ? existingMap.get(inputItem.id) : null;

    if (!existing) {
      // NEW sessionItem -> nested create
      planNestedCreate(plan, input.id, inputItem);
    } else {
      // EXISTING sessionItem -> check for type conversion or updates
      if (existing.type !== inputItem.type) {
        // TYPE CONVERSION: delete old structure and create new
        planTypeConversion(plan, existing, inputItem);
      } else if (
        inputItem.type === SessionItemType.Exercise &&
        inputItem.exercise
      ) {
        // EXERCISE update
        planExerciseUpdate(plan, existing, inputItem);
      } else if (
        inputItem.type === SessionItemType.Circuit &&
        inputItem.circuit
      ) {
        // CIRCUIT update
        planCircuitUpdate(plan, existing, inputItem);
      }
    }
  }

  return plan;
}

/* ===================== PLAN HELPERS ===================== */

function planExerciseAndSetsUpdate(
  plan: OperationPlan,
  existingExerciseId: string,
  existingSets: { id: string }[],
  inputExercise: {
    exerciseId: string;
    note: string | null;
    sets: Array<{
      id?: string;
      weight: number | null;
      reps: number | null;
      rest: number | null;
      type: any;
      rpe: number | null;
      order: number;
    }>;
  }
): void {
  // Update exercise metadata
  plan.exerciseUpdates.push({
    id: existingExerciseId,
    exerciseId: inputExercise.exerciseId,
    note: inputExercise.note,
  });

  // Sets diff
  const existingSetIds = existingSets.map((s) => s.id);
  const existingSetSet = new Set(existingSetIds);
  const inputSetIds = new Set(
    inputExercise.sets.filter((s) => s.id).map((s) => s.id!)
  );

  // Deleted sets
  const setsToDelete = existingSetIds.filter((id) => !inputSetIds.has(id));
  plan.setIdsToDelete.push(...setsToDelete);

  // Update or create sets
  for (const s of inputExercise.sets) {
    if (s.id && existingSetSet.has(s.id)) {
      // Update existing set
      plan.setUpdates.push({
        id: s.id,
        weight: s.weight ?? null,
        reps: s.reps ?? null,
        rest: s.rest ?? null,
        type: s.type,
        rpe: s.rpe ?? null,
        order: s.order,
      });
    } else {
      // Create new set
      if (!plan.setCreatesByExerciseId[existingExerciseId]) {
        plan.setCreatesByExerciseId[existingExerciseId] = [];
      }
      plan.setCreatesByExerciseId[existingExerciseId].push({
        exerciseId: existingExerciseId,
        weight: s.weight ?? null,
        reps: s.reps ?? null,
        rest: s.rest ?? null,
        type: s.type,
        rpe: s.rpe ?? null,
        order: s.order,
      } as Prisma.SetCreateManyInput);
    }
  }
}

function planNestedCreate(
  plan: OperationPlan,
  sessionId: string | undefined,
  inputItem: SessionFormValues["sessionItems"][0]
): void {
  if (!sessionId) return;
  if (inputItem.type === SessionItemType.Exercise && inputItem.exercise) {
    const e = inputItem.exercise;
    plan.nestedCreates.push(async (tx: any) => {
      // Note: Can't use nested create due to @unique constraint on exerciseId
      // Must create exercise first, then link to sessionItem
      const createdExercise = await tx.exercise.create({
        data: {
          exerciseId: e.exerciseId,
          note: e.note,
          sets: {
            create: e.sets.map((s) => ({
              weight: s.weight ?? null,
              reps: s.reps ?? null,
              rest: s.rest ?? null,
              type: s.type,
              rpe: s.rpe ?? null,
              order: s.order,
            })),
          },
        },
      });
      return tx.sessionItem.create({
        data: {
          sessionId,
          type: SessionItemType.Exercise,
          order: inputItem.order,
          exerciseId: createdExercise.id,
        },
      });
    });
  } else if (inputItem.type === SessionItemType.Circuit && inputItem.circuit) {
    const c = inputItem.circuit;
    plan.nestedCreates.push(async (tx: any) => {
      // Circuit supports nested create for circuitItems and their exercises
      const createdCircuit = await tx.circuit.create({
        data: {
          type: c.type,
          duration: c.duration,
          rest: c.rest,
          note: c.note,
          circuitItems: {
            create: await Promise.all(
              c.circuitItems
                .filter((ci) => ci.exercise)
                .map(async (ci) => {
                  // Create exercise first due to @unique constraint on circuitItem.exerciseId
                  const createdExercise = await tx.exercise.create({
                    data: {
                      exerciseId: ci.exercise!.exerciseId,
                      note: ci.exercise!.note,
                      sets: {
                        create: ci.exercise!.sets.map((s) => ({
                          weight: s.weight ?? null,
                          reps: s.reps ?? null,
                          rest: s.rest ?? null,
                          type: s.type,
                          rpe: s.rpe ?? null,
                          order: s.order,
                        })),
                      },
                    },
                  });
                  return {
                    type: ci.type,
                    order: ci.order,
                    exerciseId: createdExercise.id,
                  };
                })
            ),
          },
        },
      });
      return tx.sessionItem.create({
        data: {
          sessionId,
          type: SessionItemType.Circuit,
          order: inputItem.order,
          circuitId: createdCircuit.id,
        },
      });
    });
  }
}

function planTypeConversion(
  plan: OperationPlan,
  existing: ExistingSessionItem,
  inputItem: SessionFormValues["sessionItems"][0]
): void {
  // Delete old structure (cascade)
  if (existing.exerciseId && existing.exercise) {
    plan.exerciseIdsToDelete.push(existing.exerciseId);
    plan.setIdsToDelete.push(...existing.exercise.sets.map((s) => s.id));
  }

  if (existing.circuitId && existing.circuit) {
    plan.circuitIdsToDelete.push(existing.circuitId);
    for (const ci of existing.circuit.circuitItems) {
      plan.circuitItemIdsToDelete.push(ci.id);
      if (ci.exerciseId && ci.exercise) {
        plan.exerciseIdsToDelete.push(ci.exerciseId);
        plan.setIdsToDelete.push(...ci.exercise.sets.map((s) => s.id));
      }
    }
  }

  // Update sessionItem type
  plan.sessionItemUpdates.push({
    id: existing.id,
    order: inputItem.order,
  });

  // Create new structure (will be done after deletes)
  if (inputItem.type === SessionItemType.Exercise && inputItem.exercise) {
    const e = inputItem.exercise;
    plan.nestedCreates.push(async (tx: any) => {
      // Create exercise first due to @unique constraint
      const createdExercise = await tx.exercise.create({
        data: {
          exerciseId: e.exerciseId,
          note: e.note,
          sets: {
            create: e.sets.map((s) => ({
              weight: s.weight ?? null,
              reps: s.reps ?? null,
              rest: s.rest ?? null,
              type: s.type,
              rpe: s.rpe ?? null,
              order: s.order,
            })),
          },
        },
      });
      return tx.sessionItem.update({
        where: { id: existing.id },
        data: {
          type: SessionItemType.Exercise,
          exerciseId: createdExercise.id,
          circuitId: null,
        },
      });
    });
  } else if (inputItem.type === SessionItemType.Circuit && inputItem.circuit) {
    const c = inputItem.circuit;
    plan.nestedCreates.push(async (tx: any) => {
      // Create circuit with exercises first
      const createdCircuit = await tx.circuit.create({
        data: {
          type: c.type,
          duration: c.duration,
          rest: c.rest,
          note: c.note,
          circuitItems: {
            create: await Promise.all(
              c.circuitItems
                .filter((ci) => ci.exercise)
                .map(async (ci) => {
                  const createdExercise = await tx.exercise.create({
                    data: {
                      exerciseId: ci.exercise!.exerciseId,
                      note: ci.exercise!.note,
                      sets: {
                        create: ci.exercise!.sets.map((s) => ({
                          weight: s.weight ?? null,
                          reps: s.reps ?? null,
                          rest: s.rest ?? null,
                          type: s.type,
                          rpe: s.rpe ?? null,
                          order: s.order,
                        })),
                      },
                    },
                  });
                  return {
                    type: ci.type,
                    order: ci.order,
                    exerciseId: createdExercise.id,
                  };
                })
            ),
          },
        },
      });
      return tx.sessionItem.update({
        where: { id: existing.id },
        data: {
          type: SessionItemType.Circuit,
          circuitId: createdCircuit.id,
          exerciseId: null,
        },
      });
    });
  }
}

function planExerciseUpdate(
  plan: OperationPlan,
  existing: ExistingSessionItem,
  inputItem: SessionFormValues["sessionItems"][0]
): void {
  const e = inputItem.exercise!;

  // Update sessionItem order
  if (existing.order !== inputItem.order) {
    plan.sessionItemUpdates.push({ id: existing.id, order: inputItem.order });
  }

  // Update exercise and sets using shared logic
  if (existing.exerciseId && existing.exercise) {
    planExerciseAndSetsUpdate(
      plan,
      existing.exerciseId,
      existing.exercise.sets,
      e
    );
  }
}

function planCircuitUpdate(
  plan: OperationPlan,
  existing: ExistingSessionItem,
  inputItem: SessionFormValues["sessionItems"][0]
): void {
  const c = inputItem.circuit!;

  // Update sessionItem order
  if (existing.order !== inputItem.order) {
    plan.sessionItemUpdates.push({ id: existing.id, order: inputItem.order });
  }

  // Update circuit metadata
  if (existing.circuitId) {
    plan.circuitUpdates.push({
      id: existing.circuitId,
      type: c.type,
      duration: c.duration,
      rest: c.rest,
      note: c.note,
    });

    // CircuitItems diff
    const existingCircuitItems = existing.circuit?.circuitItems ?? [];
    const existingCircuitMap = new Map(
      existingCircuitItems.map((ci) => [ci.id, ci])
    );
    const inputCircuitIds = new Set(
      c.circuitItems.filter((ci) => ci.id).map((ci) => ci.id!)
    );

    // Removed circuit items -> cascade delete
    const removedCircuitItems = existingCircuitItems.filter(
      (ci) => !inputCircuitIds.has(ci.id)
    );
    for (const ci of removedCircuitItems) {
      plan.circuitItemIdsToDelete.push(ci.id);
      if (ci.exerciseId && ci.exercise) {
        plan.exerciseIdsToDelete.push(ci.exerciseId);
        plan.setIdsToDelete.push(...ci.exercise.sets.map((s) => s.id));
      }
    }

    // Process each input circuit item
    for (const inputCi of c.circuitItems) {
      const existingCi = inputCi.id ? existingCircuitMap.get(inputCi.id) : null;

      if (!existingCi) {
        // NEW circuitItem
        const e = inputCi.exercise!;
        plan.nestedCreates.push(async (tx: any) => {
          // Create exercise first due to @unique constraint
          const createdExercise = await tx.exercise.create({
            data: {
              exerciseId: e.exerciseId,
              note: e.note,
              sets: {
                create: e.sets.map((s) => ({
                  weight: s.weight ?? null,
                  reps: s.reps ?? null,
                  rest: s.rest ?? null,
                  type: s.type,
                  rpe: s.rpe ?? null,
                  order: s.order,
                })),
              },
            },
          });
          return tx.circuitItem.create({
            data: {
              circuitId: existing.circuitId!,
              type: CircuitItemType.Exercise,
              order: inputCi.order,
              exerciseId: createdExercise.id,
            },
          });
        });
      } else if (
        inputCi.type === CircuitItemType.Exercise &&
        inputCi.exercise
      ) {
        const e = inputCi.exercise;

        // Update circuitItem order
        if (existingCi && inputCi.order !== undefined) {
          plan.circuitItemUpdates.push({
            id: existingCi.id,
            order: inputCi.order,
          });
        }

        // Update exercise and sets using shared logic
        if (existingCi.exerciseId && existingCi.exercise) {
          planExerciseAndSetsUpdate(
            plan,
            existingCi.exerciseId,
            existingCi.exercise.sets,
            e
          );
        }
      }
    }
  }
}

/* ===================== EXECUTE PLAN ===================== */

async function executePlan(tx: any, plan: OperationPlan): Promise<void> {
  // 1. DELETE CASCADE (order matters: Sets → Exercises → CircuitItems → Circuits → SessionItems)

  // Delete sets
  if (plan.setIdsToDelete.length) {
    const chunks = chunk(plan.setIdsToDelete, 200);
    await Promise.all(
      chunks.map((ids) => tx.set.deleteMany({ where: { id: { in: ids } } }))
    );
  }

  // Delete exercises
  if (plan.exerciseIdsToDelete.length) {
    const chunks = chunk(plan.exerciseIdsToDelete, 200);
    await Promise.all(
      chunks.map((ids) =>
        tx.exercise.deleteMany({ where: { id: { in: ids } } })
      )
    );
  }

  // Delete circuitItems
  if (plan.circuitItemIdsToDelete.length) {
    const chunks = chunk(plan.circuitItemIdsToDelete, 200);
    await Promise.all(
      chunks.map((ids) =>
        tx.circuitItem.deleteMany({ where: { id: { in: ids } } })
      )
    );
  }

  // Delete circuits
  if (plan.circuitIdsToDelete.length) {
    const chunks = chunk(plan.circuitIdsToDelete, 200);
    await Promise.all(
      chunks.map((ids) => tx.circuit.deleteMany({ where: { id: { in: ids } } }))
    );
  }

  // Delete sessionItems
  if (plan.sessionItemIdsToDelete.length) {
    const chunks = chunk(plan.sessionItemIdsToDelete, 200);
    await Promise.all(
      chunks.map((ids) =>
        tx.sessionItem.deleteMany({ where: { id: { in: ids } } })
      )
    );
  }

  // 2. UPDATES (parallel)
  // Note: Prisma doesn't support bulk updates with different values per row.
  // Alternatives: raw SQL (loses type-safety) or parallel chunked updates (current solution - best compromise)
  const updateTasks: (() => Promise<any>)[] = [];

  for (const update of plan.sessionItemUpdates) {
    updateTasks.push(() =>
      tx.sessionItem.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    );
  }

  for (const update of plan.exerciseUpdates) {
    updateTasks.push(() =>
      tx.exercise.update({
        where: { id: update.id },
        data: { exerciseId: update.exerciseId, note: update.note },
      })
    );
  }

  for (const update of plan.circuitUpdates) {
    updateTasks.push(() =>
      tx.circuit.update({
        where: { id: update.id },
        data: {
          type: update.type,
          duration: update.duration,
          rest: update.rest,
          note: update.note,
        },
      })
    );
  }

  for (const update of plan.circuitItemUpdates) {
    updateTasks.push(() =>
      tx.circuitItem.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    );
  }

  for (const update of plan.setUpdates) {
    updateTasks.push(() =>
      tx.set.update({
        where: { id: update.id },
        data: {
          weight: update.weight,
          reps: update.reps,
          rest: update.rest,
          type: update.type,
          rpe: update.rpe,
          order: update.order,
        },
      })
    );
  }

  if (updateTasks.length) {
    await parallelChunked(updateTasks, 40);
  }

  // 3. CREATE SETS (bulk createMany by exerciseId)
  const setCreateTasks = Object.entries(plan.setCreatesByExerciseId).map(
    ([_exerciseId, sets]) =>
      async () => {
        const chunks = chunk(sets, 200);
        for (const c of chunks) {
          await tx.set.createMany({ data: c });
        }
      }
  );
  // Note: Max 10 exerciseIds processed in parallel (not 2000 sets!)
  // Each task processes 1 exerciseId with its sets in sequential chunks of 200
  if (setCreateTasks.length) {
    await parallelChunked(setCreateTasks, 10);
  }

  // 4. NESTED CREATES (parallel)
  // Fixed: Now uses tx instead of global prisma client (was a bug!)
  if (plan.nestedCreates.length) {
    await parallelChunked(
      plan.nestedCreates.map((fn) => () => fn(tx)),
      12
    );
  }
}

/* ===================== MAIN FUNCTION ===================== */

export const saveSession = authActionClient
  .inputSchema(sessionWithItemsFormSchema)
  .action(async ({ parsedInput: input }) => {
    if (!input?.id) {
      throw new SafeActionError("Session ID is required");
    }
    const sessionId = input.id;

    await prisma.$transaction(
      async (tx) => {
        // 1. Update session metadata
        await tx.session.update({
          where: { id: sessionId },
          data: { name: input.name, note: input.note },
        });

        // 2. Fetch existing data
        const existingItems = await fetchExistingData(tx, sessionId);

        // 3. Compute operation plan
        const plan = computeOperationPlan(input, existingItems);

        // 4. Execute plan
        await executePlan(tx, plan);

        // Log summary
        console.log("[saveSession] Operations:", {
          deleted: {
            sets: plan.setIdsToDelete.length,
            exercises: plan.exerciseIdsToDelete.length,
            circuitItems: plan.circuitItemIdsToDelete.length,
            circuits: plan.circuitIdsToDelete.length,
            sessionItems: plan.sessionItemIdsToDelete.length,
          },
          updated: {
            sessionItems: plan.sessionItemUpdates.length,
            exercises: plan.exerciseUpdates.length,
            circuits: plan.circuitUpdates.length,
            circuitItems: plan.circuitItemUpdates.length,
            sets: plan.setUpdates.length,
          },
          created: {
            sets: Object.values(plan.setCreatesByExerciseId).reduce(
              (sum, arr) => sum + arr.length,
              0
            ),
            nested: plan.nestedCreates.length,
          },
        });
      },
      {
        timeout: 15000,
      }
    );

    const session = await getSessionById(sessionId);
    if (!session) throw new SafeActionError("Session not found after save");

    const { programId, ...sessionWithoutProgramId } = session;
    return sessionWithoutProgramId;
  });
