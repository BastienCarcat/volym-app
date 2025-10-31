-- CreateEnum
CREATE TYPE "public"."ProgramType" AS ENUM ('Days', 'Cycle');

-- AlterTable
ALTER TABLE "public"."Program" ADD COLUMN     "type" "public"."ProgramType" NOT NULL DEFAULT 'Days';

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "cycleDay" INTEGER,
ADD COLUMN     "isRestDay" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "day" DROP NOT NULL;
