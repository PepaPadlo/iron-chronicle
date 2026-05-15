import { store }  from './store.js';
import { CONFIG }  from './config.js';
import { SLOTS, TIERS, ARMOR_SLOTS, ITEM_NAMES,
         WEAPON_SPRITES, WEAPON_CAT_MAP, OFFHAND_SPRITES,
         JEWELRY_SPRITES, SLOT_SPRITE_CONFIG, RARITY_SELL_MULT } from './data.js';
import { assignItemSprite, makeItemId } from './state.js';

// ── Tier selection ────────────────────────────────────────────
export function pickTierForLevel(playerLevel) {
  const available = TIERS.filter(t => t.levelReq <= playerLevel);
  if (available.length === 0) return TIERS[0];
  const weights = available.map((_, i) => i + 1);
  const sum     = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < available.length; i++) {
    r -= weights[i];
    if (r <= 0) return available[i];
  }
  return available[available.length - 1];
}

// ── Rarity helpers ────────────────────────────────────────────
// Returns the canonical rarity string for any item (handles legacy rare:true items).
export function itemRarity(item) {
  if (item.rarity) return item.rarity;
  if (item.rare)   return 'rare';   // legacy items keep blue
  return 'common';
}

export function itemSellPrice(item) {
  const tier = TIERS.find(t => t.tier === item.tier);
  if (!tier) return 0;
  const mult = RARITY_SELL_MULT[itemRarity(item)] ?? 1;
  return tier.sellPrice * mult;
}

// ── Item generation ───────────────────────────────────────────
// rarity: 'common' | 'uncommon' | 'rare' | 'epic'  (default 'common')
export function generateItem(slotId, forceTier, rarity = 'common') {
  const slot = SLOTS.find(s => s.id === slotId);
  const tier = forceTier || pickTierForLevel(store.state ? store.state.level : 1);

  let possibleStats = slot.stats.slice();
  if (slotId === 'amulet' || slotId === 'weapon' || slotId === 'offhand') {
    possibleStats = [slot.stats[Math.floor(Math.random() * slot.stats.length)]];
  }

  const bonuses = {};
  possibleStats.forEach(stat => {
    let min, max;
    if      (rarity === 'uncommon') { min = tier.uncommonMin; max = tier.uncommonMax; }
    else if (rarity === 'rare')     { min = tier.rareMin;     max = tier.rareMax;     }
    else if (rarity === 'epic')     { min = tier.epicMin;     max = tier.epicMax;     }
    else                            { min = tier.minBonus;    max = tier.maxBonus;    }
    bonuses[stat] = min + Math.floor(Math.random() * (max - min + 1));
    if (slotId === 'amulet') bonuses[stat] = Math.floor(bonuses[stat] * 1.3);
  });

  const prefix   = rarity === 'uncommon' ? '◆ ' : rarity === 'rare' ? '✦ ' : rarity === 'epic' ? '★ ' : '';
  const nameBase = ITEM_NAMES[slotId][Math.floor(Math.random() * ITEM_NAMES[slotId].length)];
  const name     = prefix + tier.name + ' ' + nameBase;

  const item = {
    id:       makeItemId(),
    slotId,
    slotName: slot.name,
    name,
    tier:     tier.tier,
    tierName: tier.name,
    levelReq: tier.levelReq,
    rarity,
    bonuses,
    spriteIdx: null,
  };

  assignItemSprite(item);
  return item;
}

export function formatItemStats(item) {
  return Object.keys(item.bonuses).map(s => '+' + item.bonuses[s] + ' ' + s).join(' · ');
}

export function formatItemStatsDetailed(item) {
  return formatItemStats(item);
}

// ── Sprite → CSS style helpers ────────────────────────────────
export function weaponSpriteStyle(idx, size = 40) {
  const s  = WEAPON_SPRITES[idx];
  const xp = (s.col / 5 * 100).toFixed(3);
  const yp = (s.row / 5 * 100).toFixed(3);
  return `width:${size}px;height:${size}px;background-image:url('${s.img}');background-size:600% 600%;background-position:${xp}% ${yp}%;flex-shrink:0;border-radius:3px;display:inline-block;vertical-align:middle;`;
}

export function offhandSpriteStyle(idx, size = 40) {
  const s  = OFFHAND_SPRITES[idx];
  const xp = (s.col / 5 * 100).toFixed(3);
  const yp = (s.row / 5 * 100).toFixed(3);
  return `width:${size}px;height:${size}px;background-image:url('images/items/offhands.png');background-size:600% 600%;background-position:${xp}% ${yp}%;flex-shrink:0;border-radius:3px;display:inline-block;vertical-align:middle;`;
}

export function jewelrySpriteStyle(idx, size = 40) {
  const s  = JEWELRY_SPRITES[idx];
  const xp = (s.col / 5 * 100).toFixed(3);
  const yp = (s.row / 5 * 100).toFixed(3);
  return `width:${size}px;height:${size}px;background-image:url('images/items/jewelery.png');background-size:600% 600%;background-position:${xp}% ${yp}%;flex-shrink:0;border-radius:3px;display:inline-block;vertical-align:middle;`;
}

export function armorSpriteStyle(slotId, idx, size = 40) {
  const cfg = SLOT_SPRITE_CONFIG[slotId];
  if (!cfg) return '';
  const col = idx % cfg.cols;
  const row = Math.floor(idx / cfg.cols);
  const xp  = (col / (cfg.cols - 1) * 100).toFixed(3);
  const yp  = (row / (cfg.rows - 1) * 100).toFixed(3);
  return `width:${size}px;height:${size}px;background-image:url('${cfg.img}');background-size:${cfg.cols * 100}% ${cfg.rows * 100}%;background-position:${xp}% ${yp}%;flex-shrink:0;border-radius:3px;display:inline-block;vertical-align:middle;`;
}

export function getItemSpriteStyle(item, size) {
  if (item.spriteIdx == null) return null;
  if (item.slotId === 'weapon')  return weaponSpriteStyle(item.spriteIdx, size);
  if (item.slotId === 'offhand') return offhandSpriteStyle(item.spriteIdx, size);
  if (item.slotId === 'amulet' || item.slotId === 'ring1' || item.slotId === 'ring2')
    return jewelrySpriteStyle(item.spriteIdx, size);
  if (ARMOR_SLOTS.indexOf(item.slotId) !== -1)
    return armorSpriteStyle(item.slotId, item.spriteIdx, size);
  return null;
}

export function itemSpriteHtml(item, size = 40) {
  const style = getItemSpriteStyle(item, size);
  return style ? `<div style="${style};margin-right:10px;"></div>` : '';
}

// ── Shop stock ────────────────────────────────────────────────
export function generateShopStock() {
  const stock = [];
  const avail = TIERS.filter(t => t.levelReq <= (store.state ? store.state.level : 1));
  const tier  = avail.length ? avail[avail.length - 1] : TIERS[0];
  for (let i = 0; i < CONFIG.shopSize; i++) {
    const slotId = SLOTS[Math.floor(Math.random() * SLOTS.length)].id;
    stock.push(generateItem(slotId, tier, 'common'));
  }
  return stock;
}
