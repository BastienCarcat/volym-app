import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import {
  softDeleteExtension,
  softDeleteModelExtensions,
} from "./extensions/soft-delete";

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

/**
 * Create a Prisma Client with extensions
 * - Accelerate: for connection pooling and caching
 * - Soft Delete: automatic filtering of deleted records
 * - Soft Delete Methods: restore, forceDelete, findManyWithDeleted, findManyDeleted
 */
function createPrismaClient() {
  return new PrismaClient()
    .$extends(withAccelerate())
    .$extends(softDeleteExtension)
    .$extends(softDeleteModelExtensions);
}

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

/**
 * Raw Prisma Client without soft delete extension
 * Use this when you need to access all records including deleted ones
 * or when you need to perform operations that bypass soft delete
 */
export const prismaRaw = new PrismaClient().$extends(withAccelerate());
