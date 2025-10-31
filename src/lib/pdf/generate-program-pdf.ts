import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ProgramWithFullSessionsAndExercises } from "@/app/(root)/programs/_hooks/use-programs";
import type { GymFitExercise } from "../gymfit/types";
import { SetType, SessionItemType, CircuitType } from "@/generated/prisma";

interface GenerateProgramPDFOptions {
  program: ProgramWithFullSessionsAndExercises;
  exercises: Record<string, GymFitExercise>;
}

const formatSetType = (type: SetType): string => {
  switch (type) {
    case SetType.WarmUp:
      return "Warm-up";
    case SetType.Normal:
      return "Normal";
    case SetType.DropsSet:
      return "Drop set";
    case SetType.Failure:
      return "Failure";
    default:
      return type;
  }
};

const formatRest = (rest: number | null): string => {
  if (!rest) return "-";
  if (rest < 60) return `${rest}s`;
  const minutes = Math.floor(rest / 60);
  const seconds = rest % 60;
  return seconds > 0 ? `${minutes}m${seconds}s` : `${minutes}m`;
};

const formatDay = (day: string): string => {
  const days: Record<string, string> = {
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",
    Sunday: "Sunday",
  };
  return days[day] || day;
};

const formatCircuitType = (type: CircuitType): string => {
  switch (type) {
    case CircuitType.Superset:
      return "Superset";
    case CircuitType.Biset:
      return "Biset";
    case CircuitType.Triset:
      return "Triset";
    case CircuitType.GiantSet:
      return "Giant Set";
    case CircuitType.AMRAP:
      return "AMRAP";
    default:
      return type;
  }
};

export const generateProgramPDF = ({
  program,
  exercises,
}: GenerateProgramPDFOptions): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // Header - Program name
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(program.name, pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  // Program note if exists
  if (program.note) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const noteLines = doc.splitTextToSize(program.note, pageWidth - 40);
    doc.text(noteLines, pageWidth / 2, currentY, { align: "center" });
    currentY += noteLines.length * 5 + 5;
  }

  // Generation date
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated on ${generatedDate}`, pageWidth / 2, currentY, {
    align: "center",
  });
  currentY += 15;

  // Sort sessions by week and day/cycleDay
  const sortedSessions = [...program.sessions].sort((a, b) => {
    const weekA = a.weekNumber || 0;
    const weekB = b.weekNumber || 0;
    if (weekA !== weekB) return weekA - weekB;

    // For cycle type, sort by cycleDay
    if (program.type === "Cycle") {
      return (a.cycleDay || 0) - (b.cycleDay || 0);
    }

    // For days type, sort by day of week
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dayA = a.day || "";
    const dayB = b.day || "";
    return dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB);
  });

  // Group sessions by week
  const sessionsByWeek = sortedSessions.reduce(
    (acc, session) => {
      const week = session.weekNumber || 1;
      if (!acc[week]) acc[week] = [];
      acc[week].push(session);
      return acc;
    },
    {} as Record<number, typeof sortedSessions>
  );

  // Render sessions grouped by week
  Object.entries(sessionsByWeek).forEach(([week, sessions], weekIndex) => {
    // Week header
    if (Object.keys(sessionsByWeek).length > 1) {
      if (weekIndex > 0) currentY += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Week ${week}`, 20, currentY);
      currentY += 8;
    }

    sessions.forEach((session, sessionIndex) => {
      if (sessionIndex > 0 || weekIndex > 0) {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
      }

      // Session header
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const dayLabel =
        program.type === "Cycle"
          ? `Day ${session.cycleDay}`
          : formatDay(session.day || "");
      const sessionTitle = session.isRestDay
        ? `${session.name} - ${dayLabel} (Rest Day)`
        : `${session.name} - ${dayLabel}`;
      doc.text(sessionTitle, 20, currentY);
      currentY += 2;

      // Session note
      if (session.note) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        const noteLines = doc.splitTextToSize(session.note, pageWidth - 40);
        currentY += 5;
        doc.text(noteLines, 20, currentY);
        currentY += noteLines.length * 4;
      }

      currentY += 5;

      // Rest day indicator
      if (session.isRestDay) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("Scheduled rest day", 20, currentY);
        currentY += 10;
        return;
      }

      // Session items table (exercises and circuits)
      if (session.sessionItems.length > 0) {
        const tableData: string[][] = [];

        session.sessionItems.forEach((item) => {
          if (item.type === SessionItemType.Exercise && item.exercise) {
            // Direct exercise
            const exerciseData = exercises[item.exercise.exerciseId];
            const exerciseName = exerciseData?.name || "Unknown exercise";

            item.exercise.sets.forEach((set: any, setIndex: number) => {
              const isFirstSet = setIndex === 0;
              tableData.push([
                isFirstSet ? exerciseName : "",
                `${set.reps}`,
                set.weight ? `${set.weight} kg` : "-",
                formatRest(set.rest),
                formatSetType(set.type),
                set.rpe ? `RPE ${set.rpe}` : "-",
              ]);
            });

            // Exercise note
            if (item.exercise.note) {
              tableData.push([
                `Note: ${item.exercise.note}`,
                "",
                "",
                "",
                "",
                "",
              ]);
            }
          } else if (item.type === SessionItemType.Circuit && item.circuit) {
            // Circuit header
            const circuitHeader = `${formatCircuitType(item.circuit.type)}${
              item.circuit.duration ? ` (${item.circuit.duration}s)` : ""
            }${item.circuit.rest ? ` - Rest: ${formatRest(item.circuit.rest)}` : ""}`;
            tableData.push([circuitHeader, "", "", "", "", ""]);

            // Circuit note
            if (item.circuit.note) {
              tableData.push([
                `Note: ${item.circuit.note}`,
                "",
                "",
                "",
                "",
                "",
              ]);
            }

            // Circuit exercises
            item.circuit.circuitItems?.forEach((circuitItem: any) => {
              if (circuitItem.exercise) {
                const exerciseData =
                  exercises[circuitItem.exercise.exerciseId];
                const exerciseName =
                  exerciseData?.name || "Unknown exercise";

                circuitItem.exercise.sets.forEach((set: any, setIndex: number) => {
                  const isFirstSet = setIndex === 0;
                  tableData.push([
                    isFirstSet ? `  ${exerciseName}` : "",
                    `${set.reps}`,
                    set.weight ? `${set.weight} kg` : "-",
                    formatRest(set.rest),
                    formatSetType(set.type),
                    set.rpe ? `RPE ${set.rpe}` : "-",
                  ]);
                });

                // Exercise note in circuit
                if (circuitItem.exercise.note) {
                  tableData.push([
                    `  Note: ${circuitItem.exercise.note}`,
                    "",
                    "",
                    "",
                    "",
                    "",
                  ]);
                }
              }
            });
          }
        });

        autoTable(doc, {
          startY: currentY,
          head: [["Exercise", "Reps", "Weight", "Rest", "Type", "RPE"]],
          body: tableData,
          theme: "striped",
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 20, halign: "center" },
            2: { cellWidth: 25, halign: "center" },
            3: { cellWidth: 20, halign: "center" },
            4: { cellWidth: 25, halign: "center" },
            5: { cellWidth: 20, halign: "center" },
          },
          didParseCell: (data) => {
            const cellText = data.cell.text[0] || "";

            // Style note rows
            if (
              data.section === "body" &&
              data.column.index === 0 &&
              cellText.includes("Note:")
            ) {
              data.cell.styles.fontStyle = "italic";
              data.cell.styles.textColor = [100, 100, 100];
            }

            // Style circuit headers (doesn't start with space or Note)
            if (
              data.section === "body" &&
              data.column.index === 0 &&
              !cellText.startsWith("  ") &&
              !cellText.includes("Note:") &&
              (cellText.includes("Superset") ||
                cellText.includes("Biset") ||
                cellText.includes("Triset") ||
                cellText.includes("Giant Set") ||
                cellText.includes("AMRAP"))
            ) {
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor = [41, 128, 185];
              data.cell.styles.fillColor = [240, 248, 255];
            }
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentY = (doc as any).lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("No items in this session", 20, currentY);
        currentY += 10;
      }
    });
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  return doc.output("blob");
};
