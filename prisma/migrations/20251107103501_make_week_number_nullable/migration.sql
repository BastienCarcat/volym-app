-- AlterTable
ALTER TABLE "public"."Session" ALTER COLUMN "weekNumber" DROP NOT NULL,
ALTER COLUMN "weekNumber" DROP DEFAULT;
