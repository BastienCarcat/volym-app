-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('Coach', 'Athlete');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "public"."SetType" AS ENUM ('WarmUp', 'Normal', 'DropsSet', 'Failure');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "weight" INTEGER,
    "height" INTEGER,
    "lastname" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "email" TEXT NOT NULL,
    "type" "public"."UserType" NOT NULL DEFAULT 'Athlete',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Program" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "note" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProgramSchedule" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "weekNumber" INTEGER,

    CONSTRAINT "ProgramSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workout" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "note" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkoutExercise" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL,
    "supersetId" TEXT,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseSet" (
    "id" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "weight" INTEGER,
    "reps" INTEGER,
    "rest" INTEGER,
    "order" INTEGER NOT NULL,
    "type" "public"."SetType" NOT NULL DEFAULT 'Normal',
    "rpe" INTEGER,

    CONSTRAINT "ExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Program" ADD CONSTRAINT "Program_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgramSchedule" ADD CONSTRAINT "ProgramSchedule_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgramSchedule" ADD CONSTRAINT "ProgramSchedule_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workout" ADD CONSTRAINT "Workout_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseSet" ADD CONSTRAINT "ExerciseSet_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "public"."WorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
