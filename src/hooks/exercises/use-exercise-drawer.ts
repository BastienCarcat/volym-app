"use client";

import { useState, useCallback } from "react";

interface UseExerciseDrawerReturn {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setIsDrawerOpen: (open: boolean) => void;
}

/**
 * Hook to manage exercise drawer state
 * Provides a consistent way to open/close the exercise selection drawer
 */
export function useExerciseDrawer(): UseExerciseDrawerReturn {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    setIsDrawerOpen,
  };
}
