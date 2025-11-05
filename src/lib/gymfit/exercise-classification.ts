const COMPOUND_EXERCISES = new Set([
  'squat',
  'deadlift',
  'bench press',
  'overhead press',
  'military press',
  'barbell row',
  'pendlay row',
  'pull-up',
  'chin-up',
  'dip',
  'lunge',
  'leg press',
  'romanian deadlift',
  'front squat',
  'back squat',
  'incline bench press',
  'decline bench press',
  'seated row',
  'cable row',
  'lat pulldown',
  'push-up',
  'clean',
  'snatch',
  'thruster',
  'bulgarian split squat',
  'step-up',
  'good morning',
  'sumo deadlift',
  'trap bar deadlift',
  'landmine press',
  't-bar row',
]);

export function isCompoundExercise(exerciseName: string): boolean {
  const normalized = exerciseName.toLowerCase().trim();

  for (const compound of COMPOUND_EXERCISES) {
    if (normalized.includes(compound)) {
      return true;
    }
  }

  return false;
}

export function classifyExercise(exerciseName: string): 'compound' | 'isolation' {
  return isCompoundExercise(exerciseName) ? 'compound' : 'isolation';
}
