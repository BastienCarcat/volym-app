/*
  Warnings:

  - You are about to drop the `ExerciseSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutExercise` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Program` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- DropForeignKey
ALTER TABLE "public"."ExerciseSet" DROP CONSTRAINT "ExerciseSet_workoutExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProgramSchedule" DROP CONSTRAINT "ProgramSchedule_programId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProgramSchedule" DROP CONSTRAINT "ProgramSchedule_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Workout" DROP CONSTRAINT "Workout_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_workoutId_fkey";

-- AlterTable
ALTER TABLE "public"."Program" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."ExerciseSet";

-- DropTable
DROP TABLE "public"."ProgramSchedule";

-- DropTable
DROP TABLE "public"."Workout";

-- DropTable
DROP TABLE "public"."WorkoutExercise";

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "day" "public"."DayOfWeek" NOT NULL,
    "weekNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkoutTemplate" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateExercise" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL,
    "supersetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TemplateExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateSet" (
    "id" TEXT NOT NULL,
    "templateExerciseId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "rest" INTEGER,
    "order" INTEGER NOT NULL,
    "type" "public"."SetType" NOT NULL DEFAULT 'Normal',
    "rpe" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TemplateSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionExercise" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL,
    "supersetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionSet" (
    "id" TEXT NOT NULL,
    "sessionExerciseId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "rest" INTEGER,
    "order" INTEGER NOT NULL,
    "type" "public"."SetType" NOT NULL DEFAULT 'Normal',
    "rpe" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SessionSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_programId_idx" ON "public"."Session"("programId");

-- CreateIndex
CREATE INDEX "Session_templateId_idx" ON "public"."Session"("templateId");

-- CreateIndex
CREATE INDEX "Session_deletedAt_idx" ON "public"."Session"("deletedAt");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_createdBy_idx" ON "public"."WorkoutTemplate"("createdBy");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_isPublic_idx" ON "public"."WorkoutTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_deletedAt_idx" ON "public"."WorkoutTemplate"("deletedAt");

-- CreateIndex
CREATE INDEX "TemplateExercise_templateId_idx" ON "public"."TemplateExercise"("templateId");

-- CreateIndex
CREATE INDEX "TemplateExercise_deletedAt_idx" ON "public"."TemplateExercise"("deletedAt");

-- CreateIndex
CREATE INDEX "TemplateSet_templateExerciseId_idx" ON "public"."TemplateSet"("templateExerciseId");

-- CreateIndex
CREATE INDEX "TemplateSet_deletedAt_idx" ON "public"."TemplateSet"("deletedAt");

-- CreateIndex
CREATE INDEX "SessionExercise_sessionId_idx" ON "public"."SessionExercise"("sessionId");

-- CreateIndex
CREATE INDEX "SessionExercise_deletedAt_idx" ON "public"."SessionExercise"("deletedAt");

-- CreateIndex
CREATE INDEX "SessionSet_sessionExerciseId_idx" ON "public"."SessionSet"("sessionExerciseId");

-- CreateIndex
CREATE INDEX "SessionSet_deletedAt_idx" ON "public"."SessionSet"("deletedAt");

-- CreateIndex
CREATE INDEX "Program_createdBy_idx" ON "public"."Program"("createdBy");

-- CreateIndex
CREATE INDEX "Program_deletedAt_idx" ON "public"."Program"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."WorkoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutTemplate" ADD CONSTRAINT "WorkoutTemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateExercise" ADD CONSTRAINT "TemplateExercise_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."WorkoutTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateSet" ADD CONSTRAINT "TemplateSet_templateExerciseId_fkey" FOREIGN KEY ("templateExerciseId") REFERENCES "public"."TemplateExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionExercise" ADD CONSTRAINT "SessionExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionSet" ADD CONSTRAINT "SessionSet_sessionExerciseId_fkey" FOREIGN KEY ("sessionExerciseId") REFERENCES "public"."SessionExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
