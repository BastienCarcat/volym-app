# Prisma Client Extensions

This directory contains Prisma Client Extensions that add custom functionality to the Prisma client.

## Soft Delete Extension

The soft delete extension automatically handles soft deletion for all models with a `deletedAt` field.

### Features

1. **Automatic Filtering**: All `find*` operations automatically exclude soft-deleted records
2. **Soft Delete on Delete**: `delete()` and `deleteMany()` operations set `deletedAt` instead of hard deleting
3. **Additional Methods**: New methods for working with deleted records

### Usage

The extension is automatically applied to the default Prisma client:

```typescript
import prisma from "@/lib/prisma/prisma";

// All operations automatically exclude soft-deleted records
const programs = await prisma.program.findMany(); // Only non-deleted programs

// Delete operations become soft deletes
await prisma.program.delete({ where: { id: "123" } }); // Sets deletedAt

// Use special methods for advanced operations
await prisma.program.restore({ id: "123" }); // Restore a deleted record
await prisma.program.forceDelete({ id: "123" }); // Permanently delete
await prisma.program.findManyWithDeleted(); // Include deleted records
await prisma.program.findManyDeleted(); // Only deleted records
```

### Raw Client

For operations that need to bypass soft delete (e.g., admin tools, migrations):

```typescript
import { prismaRaw } from "@/lib/prisma/prisma";

// Access all records including deleted
const allPrograms = await prismaRaw.program.findMany();

// Perform hard deletes
await prismaRaw.program.delete({ where: { id: "123" } });
```

### Supported Models

Models with a `deletedAt` field automatically support soft delete:

- Program
- Session
- WorkoutTemplate
- TemplateExercise
- TemplateSet
- SessionExercise
- SessionSet

### Migration from Manual Soft Delete

Previously, soft delete was handled manually using utility functions:

```typescript
// Old approach (deprecated)
import { notDeleted } from "@/lib/database/utils";
const programs = await prisma.program.findMany({
  where: { ...notDeleted() },
});
```

Now, it's automatic:

```typescript
// New approach (automatic)
const programs = await prisma.program.findMany();
```

### Best Practices

1. **Use the default client** for regular operations - soft delete is automatic
2. **Use `prismaRaw`** only when you need to access deleted records or perform hard deletes
3. **Restore deleted records** instead of recreating them when possible
4. **Test queries** to ensure soft delete filtering works as expected in nested relations

### Implementation Details

The extension is based on Prisma's official recommendations:
- [Prisma Soft Delete Middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware/soft-delete-middleware)

It uses Prisma Client Extensions (`$extends`) which is the modern approach (middlewares are deprecated since v4.16.0).
