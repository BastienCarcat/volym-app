-- CreateEnum
CREATE TYPE "public"."UserLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Elite');

-- CreateEnum
CREATE TYPE "public"."ProgramObjective" AS ENUM ('Hypertrophy', 'Strength', 'PowerLifting', 'Endurance', 'Recomposition', 'Athletic', 'General');

-- CreateEnum
CREATE TYPE "public"."BodyPart" AS ENUM ('Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core');

-- AlterTable
ALTER TABLE "public"."Program" ADD COLUMN     "objective" "public"."ProgramObjective";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "level" "public"."UserLevel",
ADD COLUMN     "strengths" "public"."BodyPart"[],
ADD COLUMN     "weaknesses" "public"."BodyPart"[];
