-- DropForeignKey
ALTER TABLE "public"."CircuitItem" DROP CONSTRAINT "CircuitItem_circuitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CircuitItem" DROP CONSTRAINT "CircuitItem_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionItem" DROP CONSTRAINT "SessionItem_circuitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionItem" DROP CONSTRAINT "SessionItem_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionItem" DROP CONSTRAINT "SessionItem_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Set" DROP CONSTRAINT "Set_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateItem" DROP CONSTRAINT "TemplateItem_circuitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateItem" DROP CONSTRAINT "TemplateItem_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TemplateItem" DROP CONSTRAINT "TemplateItem_templateId_fkey";

-- AlterTable
ALTER TABLE "public"."CircuitItem" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."SessionItem" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."TemplateItem" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "CircuitItem_deletedAt_idx" ON "public"."CircuitItem"("deletedAt");

-- CreateIndex
CREATE INDEX "SessionItem_deletedAt_idx" ON "public"."SessionItem"("deletedAt");

-- CreateIndex
CREATE INDEX "TemplateItem_deletedAt_idx" ON "public"."TemplateItem"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."SessionItem" ADD CONSTRAINT "SessionItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionItem" ADD CONSTRAINT "SessionItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionItem" ADD CONSTRAINT "SessionItem_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "public"."Circuit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateItem" ADD CONSTRAINT "TemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."WorkoutTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateItem" ADD CONSTRAINT "TemplateItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateItem" ADD CONSTRAINT "TemplateItem_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "public"."Circuit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CircuitItem" ADD CONSTRAINT "CircuitItem_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "public"."Circuit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CircuitItem" ADD CONSTRAINT "CircuitItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Set" ADD CONSTRAINT "Set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
