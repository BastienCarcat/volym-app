"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma";
import { saveProgramSchema } from "../schemas";
import { SafeActionError } from "@/lib/errors";

export const saveProgram = authActionClient
  .inputSchema(saveProgramSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    return prisma.$transaction(async (tx) => {
      const program = await tx.program.findUnique({
        where: { id: input.id },
      });

      if (!program) {
        throw new SafeActionError("Program not found");
      }

      if (program.createdBy !== user.dbUser.id) {
        throw new SafeActionError("Unauthorized");
      }

      await tx.program.update({
        where: { id: input.id },
        data: { name: input.name, note: input.note },
      });

      const existingSchedules = await tx.programSchedule.findMany({
        where: { programId: input.id },
      });

      const existingScheduleMap = new Map(
        existingSchedules.map((s) => [s.day, s])
      );

      const scheduleDeletes: string[] = [];
      const scheduleCreates: Array<Prisma.ProgramScheduleCreateInput> = [];
      const scheduleUpdates: Prisma.ProgramScheduleUpdateArgs[] = [];

      const inputDays = input.schedules.map((s) => s.day as string);

      for (const existingSchedule of existingSchedules) {
        if (!inputDays.includes(existingSchedule.day)) {
          scheduleDeletes.push(existingSchedule.id);
        }
      }

      for (const schedule of input.schedules) {
        const existingSchedule = existingScheduleMap.get(schedule.day);

        if (!existingSchedule) {
          if (schedule.workoutId) {
            scheduleCreates.push({
              program: { connect: { id: input.id } },
              workout: { connect: { id: schedule.workoutId } },
              day: schedule.day,
              weekNumber: 1,
            });
          }
        } else {
          if (schedule.workoutId === null) {
            scheduleDeletes.push(existingSchedule.id);
          } else if (schedule.workoutId !== existingSchedule.workoutId) {
            scheduleUpdates.push({
              where: { id: existingSchedule.id },
              data: { workoutId: schedule.workoutId },
            });
          }
        }
      }

      const batchOperations = [];

      if (scheduleDeletes.length) {
        batchOperations.push(
          tx.programSchedule.deleteMany({
            where: { id: { in: scheduleDeletes } },
          })
        );
      }

      batchOperations.push(
        ...scheduleCreates.map((scheduleData) =>
          tx.programSchedule.create({ data: scheduleData })
        )
      );

      batchOperations.push(
        ...scheduleUpdates.map((q) => tx.programSchedule.update(q))
      );

      const results = await Promise.allSettled(batchOperations);

      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          throw new SafeActionError(
            `Batch operation ${idx} failed: ${result.reason}`
          );
        }
      });

      return tx.program.findUnique({
        where: { id: input.id },
        include: {
          schedules: {
            include: {
              workout: {
                select: {
                  id: true,
                  name: true,
                  note: true,
                },
              },
            },
            orderBy: { day: "asc" },
          },
        },
      });
    });
  });
