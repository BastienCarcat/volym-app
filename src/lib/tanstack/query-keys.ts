export const queryKeys = {
  // User queries
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Program queries
  programs: {
    all: ["programs"] as const,
    lists: () => [...queryKeys.programs.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.programs.lists(), { filters }] as const,
    details: () => [...queryKeys.programs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.programs.details(), id] as const,
    schedules: (programId: string) =>
      [...queryKeys.programs.detail(programId), "schedules"] as const,
  },

  // Workout queries
  workouts: {
    all: ["workouts"] as const,
    lists: () => [...queryKeys.workouts.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.workouts.lists(), { filters }] as const,
    details: () => [...queryKeys.workouts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.workouts.details(), id] as const,
    exercises: (workoutId: string) =>
      [...queryKeys.workouts.detail(workoutId), "exercises"] as const,
  },

  // Exercise queries
  exercises: {
    all: ["exercises"] as const,
    lists: () => [...queryKeys.exercises.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.exercises.lists(), { filters }] as const,
    details: () => [...queryKeys.exercises.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.exercises.details(), id] as const,
    sets: (exerciseId: string) =>
      [...queryKeys.exercises.detail(exerciseId), "sets"] as const,
  },
} as const;
