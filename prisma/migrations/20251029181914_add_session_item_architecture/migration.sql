/*
  Warnings:

  - You are about to drop the `SessionExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateSet` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `weekNumber` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."CircuitType" AS ENUM ('Superset', 'Biset', 'Triset', 'GiantSet', 'AMRAP');

-- CreateEnum
CREATE TYPE "public"."SessionItemType" AS ENUM ('Exercise', 'Circuit');

-- CreateEnum
CREATE TYPE "public"."CircuitItemType" AS ENUM ('Exercise');

-- DropForeignKey
ALTER TABLE "public"."SessionExercise" DROP CONSTRAINT "SessionExercise_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionSet" DROP CONSTRAINT "SessionSet_sessionExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateExercise" DROP CONSTRAINT "TemplateExercise_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateSet" DROP CONSTRAINT "TemplateSet_templateExerciseId_fkey";

-- AlterTable
ALTER TABLE "public"."Session" ALTER COLUMN "weekNumber" SET NOT NULL,
ALTER COLUMN "weekNumber" SET DEFAULT 1;

-- DropTable
DROP TABLE "public"."SessionExercise";

-- DropTable
DROP TABLE "public"."SessionSet";

-- DropTable
DROP TABLE "public"."TemplateExercise";

-- DropTable
DROP TABLE "public"."TemplateSet";

-- CreateTable
CREATE TABLE "public"."SessionItem" (
    "id" TEXT NOT NULL,
    "type" "public"."SessionItemType" NOT NULL,
    "order" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "circuitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateItem" (
    "id" TEXT NOT NULL,
    "type" "public"."SessionItemType" NOT NULL,
    "order" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "circuitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Circuit" (
    "id" TEXT NOT NULL,
    "type" "public"."CircuitType" NOT NULL,
    "duration" INTEGER,
    "rest" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Circuit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CircuitItem" (
    "id" TEXT NOT NULL,
    "type" "public"."CircuitItemType" NOT NULL,
    "order" INTEGER NOT NULL,
    "circuitId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CircuitItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exercise" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Set" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "weight" INTEGER,
    "reps" INTEGER,
    "rest" INTEGER,
    "order" INTEGER NOT NULL,
    "type" "public"."SetType" NOT NULL DEFAULT 'Normal',
    "rpe" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionItem_exerciseId_key" ON "public"."SessionItem"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionItem_circuitId_key" ON "public"."SessionItem"("circuitId");

-- CreateIndex
CREATE INDEX "SessionItem_sessionId_order_idx" ON "public"."SessionItem"("sessionId", "order");

-- CreateIndex
CREATE INDEX "SessionItem_exerciseId_idx" ON "public"."SessionItem"("exerciseId");

-- CreateIndex
CREATE INDEX "SessionItem_circuitId_idx" ON "public"."SessionItem"("circuitId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateItem_exerciseId_key" ON "public"."TemplateItem"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateItem_circuitId_key" ON "public"."TemplateItem"("circuitId");

-- CreateIndex
CREATE INDEX "TemplateItem_templateId_order_idx" ON "public"."TemplateItem"("templateId", "order");

-- CreateIndex
CREATE INDEX "TemplateItem_exerciseId_idx" ON "public"."TemplateItem"("exerciseId");

-- CreateIndex
CREATE INDEX "TemplateItem_circuitId_idx" ON "public"."TemplateItem"("circuitId");

-- CreateIndex
CREATE INDEX "Circuit_deletedAt_idx" ON "public"."Circuit"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CircuitItem_exerciseId_key" ON "public"."CircuitItem"("exerciseId");

-- CreateIndex
CREATE INDEX "CircuitItem_circuitId_order_idx" ON "public"."CircuitItem"("circuitId", "order");

-- CreateIndex
CREATE INDEX "CircuitItem_exerciseId_idx" ON "public"."CircuitItem"("exerciseId");

-- CreateIndex
CREATE INDEX "Exercise_deletedAt_idx" ON "public"."Exercise"("deletedAt");

-- CreateIndex
CREATE INDEX "Set_exerciseId_order_idx" ON "public"."Set"("exerciseId", "order");

-- CreateIndex
CREATE INDEX "Set_deletedAt_idx" ON "public"."Set"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."SessionItem" ADD CONSTRAINT "SessionItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionItem" ADD CONSTRAINT "SessionItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionItem" ADD CONSTRAINT "SessionItem_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "public"."Circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateItem" ADD CONSTRAINT "TemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."WorkoutTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateItem" ADD CONSTRAINT "TemplateItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateItem" ADD CONSTRAINT "TemplateItem_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "public"."Circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CircuitItem" ADD CONSTRAINT "CircuitItem_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "public"."Circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CircuitItem" ADD CONSTRAINT "CircuitItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Set" ADD CONSTRAINT "Set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
