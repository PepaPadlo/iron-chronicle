export const CONFIG = {
  // ── XP & rewards ─────────────────────────────────────────────
  xpDivisor:            11,     // weighted: XP = weight×√reps×sets×coeff×difficultyCoeff / xpDivisor
  sessionBonusXP:       20,     // flat XP added to every logged session
  goldPerXPRatio:       0.5,    // gold = floor(totalXP × ratio)
  staminaPerXPRatio:    2/15,   // stamina = floor(totalXP × ratio)

  // ── Stat gains ────────────────────────────────────────────────
  statGainDivisor:      110,    // stat gain = floor(weight×√reps×sets×coeff×difficultyCoeff / divisor)
  timedStatDivisor:     90,     // timed activity: DEX & VIT each = floor(minutes × coeff / divisor)
  statYieldSTR:         0.3,    // multiplier on stat gain for STR exercises
  statYieldDEX:         0.3,    // multiplier on stat gain for DEX exercises
  statYieldRunning:     2.0,    // multiplier on stat gain for running exercises
  statYieldActivity:    1.7,    // multiplier on stat gain for timed activities
  vitRepThreshold:      15,     // reps >= this on non-VIT exercise grants bonus VIT
  bodyweightMultiplier: 15,     // legacy — kept for safety

  // ── Stamina ───────────────────────────────────────────────────
  staminaCap:           100,
  dungeonStaminaCost:   20,
  startingStamina:      20,

  // ── Weekly quest ──────────────────────────────────────────────
  weeklyTarget:         3,      // sessions needed to complete weekly quest
  questGoldReward:      200,
  questXPReward:        150,

  // ── Combat ────────────────────────────────────────────────────
  baseHP:               80,
  hpPerVIT:             8,
  critChanceCoefficient:80,
  critChanceMax:        95,     // % — crit chance approaches but never reaches this
  critMultiplier:       1.5,
  vitDefenseK:          50,     // damage reduction = VIT / (VIT + vitDefenseK)
  vitDefenseMax:        0.75,   // cap on damage reduction

  // ── Dungeon & bosses ──────────────────────────────────────────
  bossHpMult:           50,
  bossDmgBase:          7,
  bossDefScale:         2,
  dungeonGoldMult:      25,
  dungeonXPMult:        30,
  bossRareDropChance:   0.40,

  // ── Shop ──────────────────────────────────────────────────────
  shopSize:             5,
  startingGold:         50,

  // ── Misc ──────────────────────────────────────────────────────
  volumeSetsForVIT:     12,
};
