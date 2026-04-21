const EXERCISES = [
  // ── STR ──────────────────────────────────────────────────────────────────
  { name: "Deadlift",           coeff: 0.60, difficultyCoeff: 2.0, stat: "STR" },
  { name: "Squat",              coeff: 0.71, difficultyCoeff: 1.9, stat: "STR" },
  { name: "Bench Press",        coeff: 0.79, difficultyCoeff: 1.8, stat: "STR" },
  { name: "Overhead Press",     coeff: 1.50, difficultyCoeff: 1.8, stat: "STR" },
  { name: "Barbell Row",        coeff: 1.10, difficultyCoeff: 1.7, stat: "STR" },
  { name: "Romanian Deadlift",  coeff: 0.93, difficultyCoeff: 1.6, stat: "STR" },
  { name: "Incline Bench",      coeff: 1.00, difficultyCoeff: 1.5, stat: "STR" },
  { name: "Dumbbell Row",       coeff: 1.70, difficultyCoeff: 1.4, stat: "STR" },
  { name: "Bicep Curl",         coeff: 4.00, difficultyCoeff: 1.0, stat: "STR" },
  { name: "Tricep Extension",   coeff: 3.50, difficultyCoeff: 1.0, stat: "STR" },

  // ── DEX ──────────────────────────────────────────────────────────────────
  { name: "Pull-up",            coeff: 0.75, difficultyCoeff: 1.6, stat: "DEX" },
  { name: "Lunges",             coeff: 0.85, difficultyCoeff: 1.4, stat: "DEX" },
  { name: "Dip",                coeff: 0.80, difficultyCoeff: 1.5, stat: "DEX" },
  { name: "Ab Wheel Rollout",   coeff: 0.95, difficultyCoeff: 1.3, stat: "DEX" },
  { name: "Push-up",            coeff: 1.10, difficultyCoeff: 1.2, stat: "DEX" },
  { name: "Leg Curl",           coeff: 1.86, difficultyCoeff: 1.1, stat: "DEX" },
  { name: "Leg Extension",      coeff: 1.86, difficultyCoeff: 1.1, stat: "DEX" },
  { name: "Face Pull",          coeff: 2.00, difficultyCoeff: 1.1, stat: "DEX" },
  { name: "Lateral Raise",      coeff: 2.29, difficultyCoeff: 1.0, stat: "DEX" },
  { name: "Calf Raise",         coeff: 1.00, difficultyCoeff: 1.0, stat: "DEX" },
  { name: "Running",            coeff: 28,                          stat: "DEX", running: true },
  { name: "Roller Skating",     coeff: 14,                          stat: "DEX", running: true },

  // ── Activity (timed, yields DEX + VIT) ───────────────────────────────────
  { name: "Badminton",          coeff: 2.90, stat: "DEX", timed: true },
  { name: "Volleyball",         coeff: 2.90, stat: "DEX", timed: true },

  // ── VIT ──────────────────────────────────────────────────────────────────
  { name: "Farmer's Walk",      coeff: 1.07, difficultyCoeff: 1.7, stat: "VIT" },
  { name: "Sled Push",          coeff: 1.14, difficultyCoeff: 1.6, stat: "VIT" },
];
