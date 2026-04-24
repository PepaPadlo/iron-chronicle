import { store }  from './store.js';
import { CONFIG }  from './config.js';
import { SLOTS, TIERS, ARMOR_SLOTS, ITEM_NAMES,
         WEAPON_SPRITES, WEAPON_CAT_MAP, OFFHAND_SPRITES,
         JEWELRY_SPRITES, SLOT_SPRITE_CONFIG } from './data.js';
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

// ── Item generation ───────────────────────────────────────────
// Sprite is resolved via the shared assignItemSprite — no duplicate logic.
export function generateItem(slotId, forceTier, forceRare, rareChance) {
  const slot   = SLOTS.find(s => s.id === slotId);
  const tier   = forceTier || pickTierForLevel(store.state ? store.state.level : 1);
  const isRare = typeof forceRare === 'boolean' ? forceRare : (Math.random() < (rareChance || 0));

  let possibleStats = slot.stats.slice();
  if (slotId === 'amulet' || slotId === 'weapon' || slotId === 'offhand') {
    possibleStats = [slot.stats[Math.floor(Math.random() * slot.stats.length)]];
  }

  const bonuses = {};
  possibleStats.forEach(stat => {
    const min = isRare ? tier.rareMinBonus : tier.minBonus;
    const max = isRare ? tier.rareMaxBonus : tier.maxBonus;
    bonuses[stat] = min + Math.floor(Math.random() * (max - min + 1));
    if (slotId === 'amulet') bonuses[stat] = Math.floor(bonuses[stat] * 1.3);
  });

  const nameBase = ITEM_NAMES[slotId][Math.floor(Math.random() * ITEM_NAMES[slotId].length)];
  const baseName = tier.name + ' ' + nameBase;
  const name     = isRare ? '✦ ' + baseName : baseName;

  const item = {
    id:       makeItemId(),
    slotId,
    slotName: slot.name,
    name,
    tier:     tier.tier,
    tierName: tier.name,
    levelReq: tier.levelReq,
    rare:     isRare,
    bonuses,
    spriteIdx: null,
  };

  // Single call — no duplicated sprite logic
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
    stock.push(generateItem(slotId, tier, false));
  }
  return stock;
}
