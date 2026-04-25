import { store }  from './store.js';
import { CONFIG }  from './config.js';
import { LEVELS, ABILITIES, TIERS, WEEKLY_BOSSES, ARMOR_SLOTS,
         WEAPON_SPRITES, WEAPON_CAT_MAP, OFFHAND_SPRITES, OFFHAND_CAT_MAP,
         JEWELRY_SPRITES, SLOT_SPRITE_CONFIG, ITEM_NAMES, STORAGE_KEY } from './data.js';

// ── Cloud-push registration (avoids circular dep with auth.js) ─
let _cloudPush = () => {};
export function registerCloudPush(fn) { _cloudPush = fn; }

// ── ID generation ─────────────────────────────────────────────
let _itemIdCounter = 1;
export function makeItemId() {
  _itemIdCounter++;
  return 'it_' + Date.now().toString(36) + '_' + _itemIdCounter;
}

// ── Week helpers ──────────────────────────────────────────────
export function getWeekStart() {
  const d    = new Date();
  const day  = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon  = new Date(d.setDate(diff));
  mon.setHours(0, 0, 0, 0);
  return mon.getTime();
}

// ── Default state ─────────────────────────────────────────────
export function defaultState() {
  return {
    name:                 'The Wanderer',
    level:                1,
    xp:                   0,
    gold:                 CONFIG.startingGold,
    stamina:              CONFIG.startingStamina,
    str:                  1,
    dex:                  1,
    vit:                  1,
    weekSessions:         0,
    weekStart:            getWeekStart(),
    streak:               0,
    totalSessions:        0,
    currentWeeklyBoss:    WEEKLY_BOSSES[Math.floor(Math.random() * WEEKLY_BOSSES.length)],
    questCompleted:       false,
    history:              [],
    inventory:            [],
    equipped:             {},
    dungeonsCleared:      0,
    dungeonsClearedThisWeek: [],
    shopStock:            [],
    soundMuted:           false,
    bodyWeight:           75,
    tutorialDone:         false,
    tutorialLang:         null,
    savedTemplates:       [],
    exerciseStreaks:      {},
  };
}

// ── Sprite assignment — single unified function ───────────────
// Mutates item.spriteIdx in-place; skips items that already have one.
export function assignItemSprite(item) {
  if (!item || item.spriteIdx != null) return;
  const tierNorm = (item.tier - 1) / (TIERS.length - 1); // normalised 0→1

  if (item.slotId === 'weapon') {
    const nameBase = ITEM_NAMES.weapon.find(n => item.name.indexOf(n) !== -1) || 'Blade';
    const cat      = WEAPON_CAT_MAP[nameBase] || 'sword';
    const opts     = WEAPON_SPRITES.reduce((a, s, i) => { if (s.cat === cat) a.push(i); return a; }, []);
    item.spriteIdx = opts[Math.floor(Math.random() * opts.length)];

  } else if (item.slotId === 'offhand') {
    const nameBase = ITEM_NAMES.offhand.find(n => item.name.indexOf(n) !== -1) || 'Shield';
    const cat      = OFFHAND_CAT_MAP[nameBase] || 'shield';
    const cands    = OFFHAND_SPRITES.map((s, i) => ({ s, i }))
                       .filter(x => x.s.cat === cat)
                       .sort((a, b) => a.s.row - b.s.row || a.s.col - b.s.col);
    item.spriteIdx = cands[Math.round(tierNorm * (cands.length - 1))].i;

  } else if (item.slotId === 'amulet' || item.slotId === 'ring1' || item.slotId === 'ring2') {
    const cat   = item.slotId === 'amulet' ? 'amulet' : 'ring';
    const cands = JEWELRY_SPRITES.map((s, i) => ({ s, i }))
                    .filter(x => x.s.cat === cat)
                    .sort((a, b) => a.s.row - b.s.row || a.s.col - b.s.col);
    item.spriteIdx = cands[Math.round(tierNorm * (cands.length - 1))].i;

  } else if (ARMOR_SLOTS.indexOf(item.slotId) !== -1) {
    const cfg = SLOT_SPRITE_CONFIG[item.slotId];
    if (cfg) {
      const row = Math.round(tierNorm * (cfg.rows - 1));
      item.spriteIdx = row * cfg.cols + Math.floor(Math.random() * cfg.cols);
    }
  }
}

// ── Migrations ────────────────────────────────────────────────
export function migrateItems(s) {
  if (s.inventory) s.inventory.forEach(assignItemSprite);
  if (s.equipped)  Object.values(s.equipped).forEach(assignItemSprite);
  if (s.shopStock) s.shopStock.forEach(assignItemSprite);
  return s;
}

export function migrateWeek(s) {
  const currentWeek = getWeekStart();
  if (s.weekStart !== currentWeek) {
    if (s.weekSessions >= CONFIG.weeklyTarget) s.streak = (s.streak || 0) + 1;
    else s.streak = 0;
    s.weekSessions   = 0;
    s.weekStart      = currentWeek;
    s.questCompleted = false;
    s.currentWeeklyBoss = WEEKLY_BOSSES[Math.floor(Math.random() * WEEKLY_BOSSES.length)];
    s.dungeonsClearedThisWeek = [];
  }
  return s;
}

// ── Load / save ───────────────────────────────────────────────
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s === 'object') {
        const def = defaultState();
        for (const k in def) if (!(k in s)) s[k] = def[k];
        return migrateItems(migrateWeek(s));
      }
    }
  } catch (e) { console.error('load failed', e); }
  return defaultState();
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state));
  } catch (e) { console.error('save failed', e); }
  _cloudPush();
}

// ── Derived stats ─────────────────────────────────────────────
export function getGearBonus() {
  const bonus = { STR: 0, DEX: 0, VIT: 0 };
  for (const slotId in store.state.equipped) {
    const item = store.state.equipped[slotId];
    if (!item) continue;
    for (const stat in item.bonuses) {
      if (bonus[stat] !== undefined) bonus[stat] += item.bonuses[stat];
    }
  }
  return bonus;
}

export function getCombatStats() {
  const gear = getGearBonus();
  const str  = store.state.str + gear.STR;
  const dex  = store.state.dex + gear.DEX;
  const vit  = store.state.vit + gear.VIT;
  return {
    STR:     str,
    DEX:     dex,
    VIT:     vit,
    armor:   0,
    maxHP:   CONFIG.baseHP + vit * CONFIG.hpPerVIT,
    gearRaw: gear,
  };
}

// ── XP helpers ────────────────────────────────────────────────
export function getLevelData(level) {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)];
}

export function xpForLevelStart(level) {
  let total = 0;
  for (let i = 0; i < level - 1; i++) total += LEVELS[i].xpNeeded;
  return total;
}

export function getCurrentLevelXP()  { return store.state.xp - xpForLevelStart(store.state.level); }
export function getCurrentLevelMax() { return getLevelData(store.state.level).xpNeeded; }

export function checkLevelUp() {
  const prevLevel = store.state.level;
  let newAbility  = null;
  while (store.state.level < LEVELS.length) {
    if (getCurrentLevelXP() >= getLevelData(store.state.level).xpNeeded) {
      store.state.level++;
      const ability = ABILITIES.find(a => a.unlockLvl === store.state.level);
      if (ability) newAbility = ability;
    } else break;
  }
  return { leveled: store.state.level > prevLevel, newAbility };
}

export function parseWeight(str) {
  const s = String(str).replace(/\s/g, '');
  if (!/^[\d.+\-]+$/.test(s)) return parseFloat(s) || 0;
  return s.split(/(?=[+\-])/).reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
}
