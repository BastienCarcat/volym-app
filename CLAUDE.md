# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

- **Purpose**: Volym is an application designed for weightlifting practitioners and sports coaches to create muscle training programs
- **Key Features**:
  - Create training programs with critical information (volume, exercise coherence, number of sets, and various metrics)
  - Provide program analysis
  - Export programs as PDF
- **Main Views**:
  - **Program View**: Allows distributing training sessions across the week (scheduling workouts)
  - **Workout View**: Enables creating training routines by adding exercises, sets, target weights, etc.

## Development Commands

- **Development server**: `pnpm run dev` (uses Turbopack for faster builds)
- **Build**: `pnpm run build` (production build with Turbopack)
- **Start production**: `pnpm start`
- **Lint**: `pnpm run lint` (ESLint with Next.js and TypeScript rules)

Note: This project uses pnpm as the package manager. So always use pnpm

## Project Architecture

This is a Next.js 15 application using the App Router architecture with the following key technologies:

### Tech Stack

- **Framework**: Next.js 15.5.3 with App Router
- **UI**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui components (configured in components.json)
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono (optimized with next/font)
- **database**: Supabase with Prisma ORM

### Directory Structure

- `src/app/` - App Router pages and layouts
- `src/lib/` - Utility functions (includes cn() for className merging)
- `public/` - Static assets
- Component aliases configured: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`

### Key Configuration Files

- `components.json` - shadcn/ui configuration (New York style, CSS variables enabled)
- `eslint.config.mjs` - ESLint with Next.js core-web-vitals and TypeScript rules
- `tsconfig.json` - TypeScript configuration with strict mode and path aliases
- `postcss.config.mjs` - PostCSS with Tailwind CSS plugin

### Styling Conventions

- Uses Tailwind CSS with CSS variables for theming
- Includes dark mode support (evident from dark: classes in components)
- Uses the `cn()` utility function for conditional className merging (clsx + tailwind-merge)
- Base color scheme: neutral
- Components follow shadcn/ui patterns

### Component Patterns

- Uses proper TypeScript types (Metadata, React.ReactNode)
- Follows Next.js App Router conventions
- Implements responsive design with Tailwind breakpoints
- Uses Next.js Image component for optimized images

## Database Schema

### Core Models

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

### Database Configuration

- Uses PostgreSQL via Supabase
- Prisma ORM with Accelerate extension for performance optimization
- Client generation location: `src/generated/prisma`
- Supports server-side and client-side Supabase configurations

### Key Dependencies

- Prisma ORM Client: `@prisma/client@6.16.2`
- Supabase SSR Support: `@supabase/ssr@0.7.0`
- Supabase JavaScript Client: `@supabase/supabase-js@2.57.4`

# IMPORTANT RULES

- All the app must be in english (including metadata and others)
- Always document global and utility functions, explaining their purpose and usage in detail