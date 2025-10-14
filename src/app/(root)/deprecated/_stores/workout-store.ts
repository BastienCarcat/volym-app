import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { WorkoutExercise, Exercise } from "../types";

interface WorkoutStore {
  // State
  workoutId: string | null;
  exercises: WorkoutExercise[];
  isLoading: boolean;
  lastSaved: Date | null;

  // Actions
  setWorkoutId: (id: string) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  reorderExercises: (exercises: WorkoutExercise[]) => void;
  clearWorkout: () => void;

  // Internal
  setLoading: (loading: boolean) => void;
  setSaved: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    workoutId: null,
    exercises: [],
    isLoading: false,
    lastSaved: null,

    // Actions
    setWorkoutId: (id: string) => {
      set({ workoutId: id });
    },

    addExercise: (exercise) => {
      const currentExercises = get().exercises;
      const newOrder = currentExercises.length;

      const workoutExercise: WorkoutExercise = {
        id: `${exercise.id}-${Date.now()}`, // Unique instance ID
        exerciseId: exercise.id,
        name: exercise.name,
        bodyPart: exercise.bodyPart,
        image: exercise.image,
        equipment: exercise.equipment,
        targetMuscles: exercise.targetMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        order: newOrder,
        createdAt: new Date(),
      };

      set((state) => ({
        exercises: [...state.exercises, workoutExercise],
      }));
    },

    removeExercise: (exerciseId: string) => {
      set((state) => ({
        exercises: state.exercises.filter((ex) => ex.id !== exerciseId),
      }));
    },

    reorderExercises: (exercises: WorkoutExercise[]) => {
      const reorderedExercises = exercises.map((ex, index) => ({
        ...ex,
        order: index,
      }));

      set({ exercises: reorderedExercises });
    },

    clearWorkout: () => {
      set({
        exercises: [],
        workoutId: null,
        lastSaved: null,
      });
    },

    // Internal actions
    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setSaved: () => {
      set({ lastSaved: new Date() });
    },
  }))
);

// Auto-save functionality
// Subscribe to exercises changes and trigger auto-save
useWorkoutStore.subscribe(
  (state) => state.exercises,
  async (exercises, previousExercises) => {
    const { workoutId, setLoading, setSaved } = useWorkoutStore.getState();

    // Don't auto-save if no workout ID or if it's the initial empty state
    if (!workoutId || exercises.length === 0) return;

    // Debounce: only save if exercises actually changed
    if (JSON.stringify(exercises) === JSON.stringify(previousExercises)) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      console.log("🔄 Auto-saving workout exercises...", {
        workoutId,
        exerciseCount: exercises.length,
        exercises: exercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          order: ex.order,
        })),
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSaved();
      console.log("✅ Workout auto-saved successfully!");
    } catch (error) {
      console.error("❌ Auto-save failed:", error);
    } finally {
      setLoading(false);
    }
  }
);
