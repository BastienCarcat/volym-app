/*
  Warnings:

  - Made the column `weight` on table `ExerciseSet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reps` on table `ExerciseSet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."ExerciseSet" ALTER COLUMN "weight" SET NOT NULL,
ALTER COLUMN "reps" SET NOT NULL;
