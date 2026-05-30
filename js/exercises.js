export const EXERCISES = [
  // ── STR ──────────────────────────────────────────────────────────────────
  { name: "Deadlift",           coeff: 1.20, stat: "STR", names: { cs: "Mrtvý tah",              pl: "Martwy ciąg" } },
  { name: "Squat",              coeff: 1.35, stat: "STR", names: { cs: "Dřep",                   pl: "Przysiad" } },
  { name: "Bench Press",        coeff: 1.42, stat: "STR", names: { cs: "Bench press",            pl: "Wyciskanie sztangi" } },
  { name: "dumbell Press",      coeff: 1.62, stat: "STR", names: { cs: "jednoruční tlaky na prsa",    pl: "wyciskanie hantli" } },
  { name: "Peck deck",          coeff: 3.06, stat: "STR", names: { cs: "Peck deck",              pl: "maszyna do rozpiętek" } },
  { name: "Overhead Press",     coeff: 2.70, stat: "STR", names: { cs: "Tlak nad hlavou",        pl: "Wyciskanie nad głowę" } },
  { name: "Barbell Row",        coeff: 1.87, stat: "STR", names: { cs: "Přítah s osou",          pl: "Wiosłowanie sztangą" } },
  { name: "Romanian Deadlift",  coeff: 1.49, stat: "STR", names: { cs: "Rumunský mrtvý tah",    pl: "Martwy ciąg rumuński" } },
  { name: "Hyperextension",     coeff: 1.13, stat: "STR", names: { cs: "Hyperextenze",          pl: "Hiperekstensja" } },
  { name: "Incline Bench",      coeff: 1.50, stat: "STR", names: { cs: "Šikmý bench press",     pl: "Wyciskanie na skosie" } },
  { name: "Dumbbell Row",       coeff: 2.38, stat: "STR", names: { cs: "Přítah jednoruční",     pl: "Wiosłowanie hantlą" } },
  { name: "Bicep Curl",         coeff: 4.00, stat: "STR", names: { cs: "Zdvih na biceps",       pl: "Uginanie bicepsa" } },
  { name: "Bicep Curl machine", coeff: 4.00, stat: "STR", names: { cs: "biceps na stroji",       pl: "maszyna do uginania bicepsów" } },
  { name: "Tricep Extension",   coeff: 3.50, stat: "STR", names: { cs: "Tricepsová extenze",    pl: "Prostowanie tricepsa" } },
  { name: "Shrugs",             coeff: 1.20, stat: "STR", names: { cs: "Krčení ramen trapezy",    pl: "wzrusza ramionami" } },

  // ── DEX ──────────────────────────────────────────────────────────────────
  { name: "Pull-up",            coeff: 1.20, stat: "DEX", names: { cs: "Přítah na hrazdě",      pl: "Podciąganie" } },
  { name: "Lat pulldown",       coeff: 1.20, stat: "DEX", names: { cs: "Stahování horní kladky",pl: "ściąganie drążka wyciągu" } },
  { name: "Lunges",             coeff: 1.19, stat: "DEX", names: { cs: "Výpady",                pl: "Wykroki" } },
  { name: "Dip",                coeff: 1.20, stat: "DEX", names: { cs: "Dip",                   pl: "Dip" } },
  { name: "Ab Wheel Rollout",   coeff: 1.24, stat: "DEX", names: { cs: "Kolečko na břicho",     pl: "Rollout kołem" } },
  { name: "Vertical Leg Raises",coeff: 1.17, stat: "DEX", names: { cs: "Zdvihy nohou ve visu",  pl: "Unoszenie nóg w zwisie" } },
  { name: "Push-up",            coeff: 1.32, stat: "DEX", names: { cs: "Kliky",                 pl: "Pompki" } },
  { name: "Leg Curl",           coeff: 2.05, stat: "DEX", names: { cs: "Zakopávání",            pl: "Uginanie nóg" } },
  { name: "Leg Extension",      coeff: 2.05, stat: "DEX", names: { cs: "Extenze nohou",         pl: "Prostowanie nóg" } },
  { name: "Face Pull",          coeff: 2.20, stat: "DEX", names: { cs: "Přítah k obličeji",     pl: "Ściąganie do twarzy" } },
  { name: "Lateral Raise",      coeff: 2.29, stat: "DEX", names: { cs: "Upažení",               pl: "Unoszenie boczne" } },
  { name: "Calf Raise",         coeff: 1.00, stat: "DEX", names: { cs: "Zvedání na špičky",     pl: "Wspięcia na palce" } },
  { name: "Hip trust",          coeff: 0.95, stat: "DEX", names: { cs: "zvedani panve",         pl: "wypychanie bioder " } },
  { name: "Running",            coeff: 28,   stat: "DEX", names: { cs: "Běh",                   pl: "Bieganie" },            running: true },
  { name: "Roller Skating",     coeff: 14,   stat: "DEX", names: { cs: "Bruslení",              pl: "Jazda na rolkach" },     running: true },

  // ── Activity (timed, yields DEX + VIT) ───────────────────────────────────
  { name: "Badminton",          coeff: 2.90, stat: "DEX", names: { cs: "Badminton",              pl: "Badminton" },            timed: true },
  { name: "Volleyball",         coeff: 2.90, stat: "DEX", names: { cs: "Volejbal",               pl: "Siatkówka" },            timed: true },
  { name: "Squash",             coeff: 2.90, stat: "DEX", names: { cs: "Squash",                 pl: "Squash" },               timed: true },

  // ── VIT ──────────────────────────────────────────────────────────────────
  { name: "Farmer's Walk",      coeff: 1.82, stat: "VIT", names: { cs: "Farmářská chůze",       pl: "Spacer farmera" } },
  { name: "Sled Push",          coeff: 1.82, stat: "VIT", names: { cs: "Tažení sáněk",          pl: "Pchání sání" } },
];
