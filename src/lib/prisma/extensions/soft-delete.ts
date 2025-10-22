import { Prisma } from "@/generated/prisma";

/**
 * List of models that support soft delete (have a deletedAt field)
 */
const SOFT_DELETE_MODELS = [
  "program",
  "session",
  "workoutTemplate",
  "templateExercise",
  "templateSet",
  "sessionExercise",
  "sessionSet",
] as const;

type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

/**
 * Prisma Client Extension for Soft Delete
 *
 * This extension automatically:
 * - Excludes soft-deleted records (deletedAt !== null) from find operations
 * - Converts delete operations to updates that set deletedAt
 * - Supports cascading soft deletes for nested relations
 *
 * Usage:
 * const prismaWithSoftDelete = prisma.$extends(softDeleteExtension);
 *
 * Based on Prisma recommendations:
 * https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware/soft-delete-middleware
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: "softDelete",
  query: {
    $allModels: {
      async findUnique({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async findUniqueOrThrow({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async findFirst({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async findFirstOrThrow({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async findMany({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async count({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async aggregate({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async groupBy({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async update({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async updateMany({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async upsert({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },

      async delete({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        // Convert delete to update with deletedAt timestamp
        return (query as any)({
          ...args,
          data: { deletedAt: new Date() },
        });
      },

      async deleteMany({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        // Convert deleteMany to updateMany with deletedAt timestamp
        return (query as any)({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
    },
  },
});

/**
 * Type guard to check if a model supports soft delete
 */
function isSoftDeleteModel(model: string): model is SoftDeleteModel {
  return SOFT_DELETE_MODELS.includes(model as SoftDeleteModel);
}

/**
 * Client method extension to add restore and forceDelete methods
 */
export const softDeleteModelExtensions = Prisma.defineExtension({
  name: "softDeleteMethods",
  model: {
    $allModels: {
      /**
       * Restore a soft-deleted record
       */
      async restore<T>(
        this: T,
        where: Prisma.Args<T, "findUnique">["where"]
      ): Promise<Prisma.Result<T, object, "update">> {
        const context = Prisma.getExtensionContext(this) as any;

        if (!isSoftDeleteModel(context.$name as string)) {
          throw new Error(
            `Model ${context.$name} does not support soft delete`
          );
        }

        return await (context as any).update({
          where,
          data: { deletedAt: null },
        });
      },

      /**
       * Permanently delete a record (skip soft delete)
       */
      async forceDelete<T>(
        this: T,
        where: Prisma.Args<T, "findUnique">["where"]
      ): Promise<Prisma.Result<T, object, "delete">> {
        const context = Prisma.getExtensionContext(this) as any;
        return await (context as any).delete({ where });
      },

      /**
       * Find including soft-deleted records
       */
      async findManyWithDeleted<T>(
        this: T,
        args?: Prisma.Args<T, "findMany">
      ): Promise<Prisma.Result<T, object, "findMany">> {
        const context = Prisma.getExtensionContext(this) as any;
        return await (context as any).findMany(args);
      },

      /**
       * Find only soft-deleted records
       */
      async findManyDeleted<T>(
        this: T,
        args?: Prisma.Args<T, "findMany">
      ): Promise<Prisma.Result<T, object, "findMany">> {
        const context = Prisma.getExtensionContext(this) as any;

        if (!isSoftDeleteModel(context.$name as string)) {
          throw new Error(
            `Model ${context.$name} does not support soft delete`
          );
        }

        return await (context as any).findMany({
          ...args,
          where: {
            ...args?.where,
            deletedAt: { not: null },
          },
        });
      },
    },
  },
});
