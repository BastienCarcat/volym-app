"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { SessionWithItems } from "@/hooks/use-sessions";

interface ProgramContextValue {
  programId: string;
  activeSessionId?: string;
  activeSessionFormValues?: SessionWithItems;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  setActiveSession: (sessionId: string, values: SessionWithItems) => void;
  resetActiveSession: (sessionId: string) => void;
  clearActiveSession: () => void;
}

const ProgramContext = createContext<ProgramContextValue | null>(null);

interface ProgramProviderProps {
  programId: string;
  children: ReactNode;
}

export function ProgramProvider({ programId, children }: ProgramProviderProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [activeSessionFormValues, setActiveSessionFormValues] = useState<
    SessionWithItems | undefined
  >();
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  const setActiveSession = useCallback(
    (sessionId: string, values: SessionWithItems) => {
      setActiveSessionId(sessionId);
      setActiveSessionFormValues(values);
    },
    []
  );

  const resetActiveSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setActiveSessionFormValues(undefined);
  }, []);

  const clearActiveSession = useCallback(() => {
    setActiveSessionId(undefined);
    setActiveSessionFormValues(undefined);
  }, []);

  return (
    <ProgramContext.Provider
      value={{
        programId,
        activeSessionId,
        activeSessionFormValues,
        currentWeek,
        setCurrentWeek,
        setActiveSession,
        resetActiveSession,
        clearActiveSession,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgramContext() {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error("useProgramContext must be used within ProgramProvider");
  }
  return context;
}
