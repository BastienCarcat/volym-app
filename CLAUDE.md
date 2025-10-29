# CLAUDE.md

**Volym** - Weightlifting app for athletes and coaches to create, track, and analyze training programs.

**Stack**: Next.js 15 + React 19 + TypeScript + Tailwind v4 + Prisma + Supabase + TanStack Query + shadcn/ui

---

## Commands

```bash
pnpm run dev         # Dev server (Turbopack)
pnpm run build       # Production build
tsc --noEmit         # Type-check
pnpm run lint        # Lint code
pnpm run format      # Format with Prettier
```

**CRITICAL**: Always use `pnpm` (never npm/yarn)

---

## Architecture: Hybrid Feature-First

### Feature Structure (`src/app/(root)/<feature>/`)

```
<feature>/
├── _actions/       # Server actions (mutations)
├── _hooks/         # Feature related hooks
├── _components/    # Components ONLY for this feature (not reusable)
├── [id]/
│   ├── _components/  # Components ONLY for this route (not reusable)
│   └── page.tsx
└── page.tsx
```

### Shared Code

**Components** (`src/components/`):

- `features/<domain>/` - Reusable business components (exercises, sessions, programs)
- `ui/` - Pure UI components (shadcn/ui + form components)
- `layout/` - Layout components

**Hooks** (`src/hooks/`):

- `<domain>/` - Shared hooks (e.g., `exercises/use-exercise.ts`)

**Lib** (`src/lib/`):

- `schemas/<domain>.ts` - **ALL Zod schemas centralized here** (sessions, programs, gymfit)
- `gymfit/` - GymFit integration
- `auth/`, `prisma/`, `supabase/`, `tanstack/`, `nextSafeAction/` - Core integrations

**CRITICAL**: Schemas MUST be in `src/lib/schemas/<domain>.ts`, NOT in feature folders

### Path Aliases

```typescript
@/components → src/components/
@/lib        → src/lib/
@/hooks      → src/hooks/
```

### Placement Decision Tree

**Components**:

- Multi-feature use → `components/features/<domain>/`
- Single feature → `app/(root)/<feature>/_components/`
- Pure UI → `components/ui/`

**Hooks**:

- Multi-feature → `hooks/<domain>/`
- Single feature → `app/(root)/<feature>/_hooks/`

**Schemas**:

- **ALL** → `lib/schemas/<domain>.ts`

---

## Critical Rules

### TypeScript

**NEVER**:

- Use `any` type
- Use `as` type assertions (unless unavoidable)

**ALWAYS**:

- Define interfaces for props
- Use Prisma-generated types
- Use z.infer<typeof [schema]> with zod schemas
- Prefer `const` over `let`

### Important

- When you create `/api` routes ALWAYS do like @src/app/api/programs/[id]/route.ts and use the best @src/lib/safe-route.ts files to do it.
- When you create `Server Function` please always look code in @src/app/(root)/programs/\_actions/save-session.action.ts and use @src/lib/nextSafeAction/client.ts to do it. Each action should be name `action-name.action.ts`
- For fetch request, always use @src/lib/up-fetch.ts
- Always use `useMutation` or `useQuery` when you work with query (with `upfetch`)

### React

- Keep components as DRY as possible
- Always handle loading/error states
- Provide skeleton loaders

### Forms

- Use useZodForm with a schema for formValues

### Styling

- Tailwind CSS v4 only
- Use `cn()` from `@/lib/utils.ts`
- Mobile-first design

### Prisma

**CRITICAL**:

- Use singleton from `src/lib/prisma/prisma.ts`
- NEVER multiple instances
- Always use `select` or `include`
- Use Prisma-generated types
- Use `findUnique` over `findFirst` when possible

**Performance**:

- Prevent N+1: `include` with nesting, `in` filters
- Bulk ops: `createMany()`, `updateMany()`
- Process large datasets in chunks (~1000)

### Database Schema

**Models**: User → Program → Session → SessionExercise → SessionSet
**Templates**: WorkoutTemplate → TemplateExercise → TemplateSet
**Enums**: UserType (Coach/Athlete), Gender, SetType (WarmUp/Normal/DropsSet/Failure), DayOfWeek

---

## State Management

**Query Keys**: Centralized in `src/lib/tanstack/query-keys.ts`

---

## Critical Don'ts

**NEVER**:

- Use `any` or `as` (unless unavoidable)
- Edit `src/generated/`
- Create multiple Prisma instances
- Use npm/yarn (always pnpm)
- Commit without type-check (`tsc --noEmit`)
- Place feature code in shared folders
- Use inline styles
- Add emojis in code/comments

**ALWAYS**:

- English (code, comments, commits)
- Loading states
- Proper TypeScript types
- Follow feature-first structure
- Error handling
