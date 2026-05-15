export const EXERCISES = [
  // ── STR ──────────────────────────────────────────────────────────────────
  { name: "Deadlift",           coeff: 0.60, difficultyCoeff: 2.0, stat: "STR", names: { cs: "Mrtvý tah",              pl: "Martwy ciąg" } },
  { name: "Squat",              coeff: 0.71, difficultyCoeff: 1.9, stat: "STR", names: { cs: "Dřep",                   pl: "Przysiad" } },
  { name: "Bench Press",        coeff: 0.79, difficultyCoeff: 1.8, stat: "STR", names: { cs: "Bench press",            pl: "Wyciskanie sztangi" } },
  { name: "dumbell Press",      coeff: 0.90, difficultyCoeff: 1.8, stat: "STR", names: { cs: "jednoruční tlaky na prsa",    pl: "wyciskanie hantli" } },
  { name: "Overhead Press",     coeff: 1.50, difficultyCoeff: 1.8, stat: "STR", names: { cs: "Tlak nad hlavou",        pl: "Wyciskanie nad głowę" } },
  { name: "Barbell Row",        coeff: 1.10, difficultyCoeff: 1.7, stat: "STR", names: { cs: "Přítah s osou",          pl: "Wiosłowanie sztangą" } },
  { name: "Romanian Deadlift",  coeff: 0.93, difficultyCoeff: 1.6, stat: "STR", names: { cs: "Rumunský mrtvý tah",    pl: "Martwy ciąg rumuński" } },
  { name: "Hyperextension",     coeff: 0.75, difficultyCoeff: 1.5, stat: "STR", names: { cs: "Hyperextenze",          pl: "Hiperekstensja" } },
  { name: "Incline Bench",      coeff: 1.00, difficultyCoeff: 1.5, stat: "STR", names: { cs: "Šikmý bench press",     pl: "Wyciskanie na skosie" } },
  { name: "Dumbbell Row",       coeff: 1.70, difficultyCoeff: 1.4, stat: "STR", names: { cs: "Přítah jednoruční",     pl: "Wiosłowanie hantlą" } },
  { name: "Bicep Curl",         coeff: 4.00, difficultyCoeff: 1.0, stat: "STR", names: { cs: "Zdvih na biceps",       pl: "Uginanie bicepsa" } },
  { name: "Bicep Curl machine", coeff: 4.00, difficultyCoeff: 1.0, stat: "STR", names: { cs: "biceps na stroji",       pl: "maszyna do uginania bicepsów" } },
  { name: "Tricep Extension",   coeff: 3.50, difficultyCoeff: 1.0, stat: "STR", names: { cs: "Tricepsová extenze",    pl: "Prostowanie tricepsa" } },
  { name: "Shrugs",             coeff: 1.20, difficultyCoeff: 1.0, stat: "STR", names: { cs: "Krčení ramen trapezy",    pl: "wzrusza ramionami" } },

  // ── DEX ──────────────────────────────────────────────────────────────────
  { name: "Pull-up",            coeff: 0.75, difficultyCoeff: 1.6, stat: "DEX", names: { cs: "Přítah na hrazdě",      pl: "Podciąganie" } },
  { name: "Lat pulldown",       coeff: 0.75, difficultyCoeff: 1.6, stat: "DEX", names: { cs: "Stahování horní kladky",pl: "ściąganie drążka wyciągu" } },
  { name: "Lunges",             coeff: 0.85, difficultyCoeff: 1.4, stat: "DEX", names: { cs: "Výpady",                pl: "Wykroki" } },
  { name: "Dip",                coeff: 0.80, difficultyCoeff: 1.5, stat: "DEX", names: { cs: "Dip",                   pl: "Dip" } },
  { name: "Ab Wheel Rollout",   coeff: 0.95, difficultyCoeff: 1.3, stat: "DEX", names: { cs: "Kolečko na břicho",     pl: "Rollout kołem" } },
  { name: "Vertical Leg Raises",coeff: 0.90, difficultyCoeff: 1.3, stat: "DEX", names: { cs: "Zdvihy nohou ve visu",  pl: "Unoszenie nóg w zwisie" } },
  { name: "Push-up",            coeff: 1.10, difficultyCoeff: 1.2, stat: "DEX", names: { cs: "Kliky",                 pl: "Pompki" } },
  { name: "Leg Curl",           coeff: 1.86, difficultyCoeff: 1.1, stat: "DEX", names: { cs: "Zakopávání",            pl: "Uginanie nóg" } },
  { name: "Leg Extension",      coeff: 1.86, difficultyCoeff: 1.1, stat: "DEX", names: { cs: "Extenze nohou",         pl: "Prostowanie nóg" } },
  { name: "Face Pull",          coeff: 2.00, difficultyCoeff: 1.1, stat: "DEX", names: { cs: "Přítah k obličeji",     pl: "Ściąganie do twarzy" } },
  { name: "Lateral Raise",      coeff: 2.29, difficultyCoeff: 1.0, stat: "DEX", names: { cs: "Upažení",               pl: "Unoszenie boczne" } },
  { name: "Calf Raise",         coeff: 1.00, difficultyCoeff: 1.0, stat: "DEX", names: { cs: "Zvedání na špičky",     pl: "Wspięcia na palce" } },
  { name: "Hip trust",          coeff: 0.50, difficultyCoeff: 1.9, stat: "DEX", names: { cs: "zvedani panve",         pl: "wypychanie bioder " } },
  { name: "Running",            coeff: 28,                          stat: "DEX", names: { cs: "Běh",                   pl: "Bieganie" },            running: true },
  { name: "Roller Skating",     coeff: 14,                          stat: "DEX", names: { cs: "Bruslení",              pl: "Jazda na rolkach" },     running: true },

  // ── Activity (timed, yields DEX + VIT) ───────────────────────────────────
  { name: "Badminton",          coeff: 2.90, stat: "DEX", names: { cs: "Badminton",              pl: "Badminton" },            timed: true },
  { name: "Volleyball",         coeff: 2.90, stat: "DEX", names: { cs: "Volejbal",               pl: "Siatkówka" },            timed: true },
  { name: "Squash",             coeff: 2.90, stat: "DEX", names: { cs: "Squash",                 pl: "Squash" },               timed: true },

  // ── VIT ──────────────────────────────────────────────────────────────────
  { name: "Farmer's Walk",      coeff: 1.07, difficultyCoeff: 1.7, stat: "VIT", names: { cs: "Farmářská chůze",       pl: "Spacer farmera" } },
  { name: "Sled Push",          coeff: 1.14, difficultyCoeff: 1.6, stat: "VIT", names: { cs: "Tažení sáněk",          pl: "Pchanie sań" } },
];
