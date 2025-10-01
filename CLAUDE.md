# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Context

- **Purpose**: Volym is an application for weightlifting practitioners and sports coaches to create, track, and analyze muscle training programs.
- **Key Features**:
  - Create structured training programs with exercises, sets, weights, reps, RPE, rest periods, etc.
  - Analyze programs for volume, coherence, and performance metrics
  - Schedule workouts across the week in programs
  - Export programs as PDF
- **Main Views**:
  - **Program View**: Schedule workouts for the week, visualize program progression
  - **Workout View**: Create and edit workout routines, manage exercises and sets

---

## Development Commands

- **Development server**: `pnpm run dev` (Turbopack for faster builds)
- **Build**: `pnpm run build`
- **Start production**: `pnpm start`
- **Lint**: `pnpm run lint` (ESLint with Next.js + TypeScript rules)
- **Type-check**: `tsc --noEmit`

**Note:** Always use `pnpm` as the package manager.

---

## Project Architecture

- Next.js 15 App Router architecture
- TypeScript strict mode
- React 19.1.0
- Tailwind CSS v4 + PostCSS
- UI Components: shadcn/ui (Radix primitives)
- Icons: Lucide React
- Fonts: Geist Sans / Geist Mono
- Database: Supabase + Prisma ORM
- State / Data fetching: React Query (Tanstack)
- Forms: React Hook Form + `@next-safe-action/adapter-react-hook-form`
- Animations: optional Framer Motion or tw-animate-css

---

## Directory Structure and Feature-First Organization

This project uses a **feature-first structure**.  
Each feature has its own folder under `src/app/` (for routes) or `src/lib/` (for shared backend logic).  
The goal is to keep everything related to a feature (actions, schemas, hooks, UI, pages) in one place.

### Example: `workouts/`

src/app/(root)/workouts/
├── \_actions/ -> All server actions related to workouts
├── \_schemas/ -> Zod schemas for validation (createWorkout, updateWorkout, etc.)
├── \_hooks/ -> Custom hooks, usually wrappers for TanStack Query (e.g. useGetWorkouts, useCreateWorkout)
├── \_components/ -> UI components specific to workouts (WorkoutCard, WorkoutForm, etc.)
├── types.ts -> all workouts types
├── [id]/ → Dynamic route for individual workouts (view/edit page)
│ ├── page.tsx
│ ├── layout.tsx
│ └── loading.tsx
└── page.tsx → Workouts index page

### Supporting Folders

- `src/components/` → Generic, **shared UI components** used across multiple features.
- `src/hooks/` → Global React hooks not tied to a single feature.
- `src/lib/` → Shared backend logic, grouped by domain:
  - `api/` → API helpers (e.g. `getUser.ts`).
  - `auth/` → Types and helpers for authentication.
  - `prisma/` → Prisma client configuration.
  - `supabase/` → Supabase client + middleware.
  - `tanstack/` → TanStack Query config and global setup.
- `src/utils/` → Generic utility functions.
- `src/generated/` → Auto-generated files (e.g. Prisma client). **Do not edit manually**.

---

### Rules for Contribution

1. **Feature-first**: If adding logic for a feature (e.g. "programs"), create a folder in `src/app/(root)/programs/` with `_actions`, `_schemas`, `_hooks`, `_components` as needed.
2. **Shared logic/UI**: If it is used in multiple features, place it in `src/components/`, `src/hooks/`, or `src/lib/`.
3. **Schemas**: Always use Zod schemas inside `_schemas` for validation (client + server).
4. **Hooks**: TanStack Query hooks should be centralized inside `_hooks`.
5. **Actions**: All server actions for a feature live in `_actions`. Use `nextSafeAction` for safety.
6. **Components**: If the component is **feature-specific**, place it in `_components` inside the feature folder.

---

### Benefits of this structure

- **Encapsulation**: Each feature has everything it needs.
- **Scalability**: Easy to add new features without bloating the root folders.
- **Clarity**: Contributors know immediately where to place actions, schemas, hooks, and components.
- **Consistency**: Every feature follows the same pattern → `_actions`, `_schemas`, `_hooks`, `_components`.

---

### Summary

- **Pages & layouts** → `app/`
- **UI building blocks** → `components/`
- **Reusable logic** → `hooks/`
- **Global providers** → `providers/`
- **Service integrations & utilities** → `utils/`
- **Generated code (do not edit)** → `generated/`

This structure ensures:

- **Consistency** (UI centralized in components)
- **Scalability** (logic and providers separated)
- **Maintainability** (clear responsibilities per folder)

**Aliases**:

- `@/components` → components folder
- `@/lib` → lib folder
- `@/hooks` → hooks folder

---

## Coding Guidelines

### TypeScript

- Use strict types; never use `any`
- Always define interfaces/types for component props
- Prefer `const` over `let` when possible

### Next.js

- Use App Router conventions (`page.tsx`, `layout.tsx`)
- Use server actions (`use server`) for any Prisma mutation
- Fetch data server-side via server actions and hydrate client with React Query if interactivity is needed
- Pages must be dynamically typed: `/workouts/[id]/page.tsx` must accept `id` from params

### React

- Components should be small, focused, and reusable
- Split UI from logic:
  - UI components: purely presentational
  - Hooks: data fetching or state
  - Actions: server mutations
- Manage loading and error states explicitly
- Always add skeletons or placeholders for loading data

### Forms

- Use React Hook Form with Zod validation
- Integrate `@next-safe-action/adapter-react-hook-form` for server-side mutations
- Validate all required fields and provide error messages

### Styling

- Tailwind CSS v4 + `tailwind-merge` (`cn` utility)
- Support dark mode (`dark:` classes)
- Use consistent spacing, typography, and colors
- For animations, prefer Framer Motion when appropriate

### Database / Prisma

- Use Prisma client (`@prisma/client`) for all queries
- Separate business logic into `lib/prisma/`
- Use `@prisma/extension-accelerate` for performance where possible
- Always include proper `select` or `include` to avoid N+1 queries
- Use enums (`UserType`, `Gender`, `SetType`) to type-check

---

## Server Actions

- All mutations go through server actions (`authActionClient.action`) for secure operations
- Server actions return typed data or throw an Error
- Example structure:

```ts
"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";

export const addWorkoutExercise = authActionClient.action(
  async ({
    ctx: { user },
    input,
  }: {
    ctx: any;
    input: { workoutId: string; exerciseId: string };
  }) => {
    const exercise = await prisma.workoutExercise.create({
      data: {
        workoutId: input.workoutId,
        exerciseId: input.exerciseId,
        order: 0,
      },
    });
    return exercise;
  }
);
```

## Component Patterns

- UI components should be in /components folder
- Follow shadcn/ui patterns and Tailwind conventions
- Components must have:
  - Props interface
  - Docstring explaining purpose
  - Default props if needed

Example for ExerciseSetItem.tsx:

```ts
interface ExerciseSetItemProps {
  weight?: number;
  reps?: number;
  rpe?: number;
  rest?: number;
}

export function ExerciseSetItem({
  weight,
  reps,
  rpe,
  rest,
}: ExerciseSetItemProps) {
  return (
    <div className="flex justify-between p-2 border-b">
      <span>{weight ?? "-"}</span>
      <span>{reps ?? "-"}</span>
      <span>{rpe ?? "-"}</span>
      <span>{rest ?? "-"}</span>
    </div>
  );
}
```

## Database Schema Reference

**User** (id, weight, height, lastname,
firstname, gender, email, type)

- Types: Coach/Athlete
- Genders: Male/Female

**Program** (id, createdBy, note, name)

- Belongs to User
- Has multiple ProgramSchedules

**ProgramSchedule** (id, programId, workoutId,
day, weekNumber)

- Links Programs to Workouts on specific
  days

**Workout** (id, createdBy, note, name)

- Belongs to User
- Contains WorkoutExercises

**WorkoutExercise** (id, workoutId, exerciseId,
note, order, supersetId)

- Links exercises to workouts
- Has multiple ExerciseSets

**ExerciseSet** (id, workoutExerciseId, weight,
reps, rest, order, type, rpe)

- Set types: WarmUp, Normal, DropsSet,
  Failure

## Best Practices / Rules

- All app must be in English (including metadata, labels, variables)
- Document global and utility functions explaining purpose and usage
- Never use types "any" or "as" unless unavoidable
- Always use Prisma types for entities (e.g : Workout)
- Error handling:
  - Catch and display errors
  - Validate server responses
- Performance:
  - Avoid N+1 queries
  - Use React.memo or useMemo if needed
- Accessibility:
  - Use Radix UI for accessible primitives
  - Always add aria-\* attributes when needed
- Responsiveness:
  - Tailwind breakpoints for mobile/tablet/desktop
- Code readability:
  - Keep functions < 50 lines
  - Split large components into smaller ones
  - Use clear naming conventions
