import type { DbProgram } from "@/lib/database/get-program-by-id";

interface ProgramHeaderProps {
  program: NonNullable<DbProgram>;
}

export function ProgramHeader({ program }: ProgramHeaderProps) {
  return (
    <header>
      <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
      {program.note && (
        <p className="text-muted-foreground mt-2">{program.note}</p>
      )}
    </header>
  );
}
