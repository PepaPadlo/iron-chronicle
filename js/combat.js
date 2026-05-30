import { store }         from './store.js';
import { CONFIG }         from './config.js';
import { ABILITIES, TIERS, SLOTS, DUNGEON_BOSSES } from './data.js';
import { getCombatStats, saveState, checkLevelUp, getStaminaCap } from './state.js';
import { generateItem }   from './items.js';
import { playSound }      from './audio.js';
import { triggerSlash, triggerDamageNumber, triggerShake, triggerScreenFlash,
         triggerPowerSlash, triggerCrySlash, triggerBarrierRipple,
         triggerIronActivate, triggerCryActivate } from './fx.js';
import { t }              from './i18n.js';
import { renderAll, switchTab } from './render.js';
import { showLevelUp }    from './training.js';

// Module-level combat state — only this module reads/writes it.
let combat = null;

export function getCombat()      { return combat; }
export function clearCombat()    { combat = null; }

// ── Combat log ────────────────────────────────────────────────
function addLog(html) {
  combat.log.push('<div class="combat-log-line">' + html + '</div>');
  if (combat.log.length > 50) combat.log.shift();
}

// ── Render combat overlay ─────────────────────────────────────
export function renderCombat() {
  if (!combat) return;
  document.getElementById('bossHpBar').style.width   = Math.max(0, combat.bossHP / combat.bossMaxHP * 100) + '%';
  document.getElementById('bossHpText').textContent  = Math.max(0, combat.bossHP) + ' / ' + combat.bossMaxHP + ' HP';
  document.getElementById('playerHpBar').style.width = Math.max(0, combat.playerHP / combat.playerMaxHP * 100) + '%';
  document.getElementById('playerHpText').textContent = Math.max(0, combat.playerHP) + ' / ' + combat.playerMaxHP + ' HP';
  const sCap = getStaminaCap();
  document.getElementById('playerStaminaBar').style.width = (combat.playerStamina / sCap * 100) + '%';
  document.getElementById('playerStaminaText').textContent = combat.playerStamina + ' / ' + sCap + ' Stamina';
  const logEl = document.getElementById('combatLog');
  logEl.innerHTML = combat.log.join('');
  logEl.scrollTop = logEl.scrollHeight;

  const playerEl = document.getElementById('playerCombatant');
  if (playerEl) {
    playerEl.classList.toggle('aura-iron', combat.effects.ironTurns > 0);
    playerEl.classList.toggle('aura-cry',  combat.effects.cryTurns > 0);
  }

  // Ability buttons — re-render each turn (small list, acceptable)
  const grid = document.getElementById('abilityGrid');
  grid.innerHTML = '';
  ABILITIES.forEach(ab => {
    if (store.state.level < ab.unlockLvl) return;
    const btn = document.createElement('button');
    btn.className = 'ability-btn';
    btn.disabled  = combat.playerStamina < ab.cost || combat.ended || combat.waiting ||
                    (ab.effect === 'leech'    && combat.effects.leechActive) ||
                    (ab.effect === 'unbroken' && combat.effects.unbrokenUsed);
    btn.innerHTML = `<div class="ability-name">${ab.name}</div>` +
                    `<div class="ability-cost">${ab.cost === 0 ? 'Free' : ab.cost + ' stamina'}</div>` +
                    `<div class="ability-desc">${ab.desc}</div>`;
    btn.addEventListener('click', () => useAbility(ab.id));
    grid.appendChild(btn);
  });

  const fleeBtn = document.createElement('button');
  fleeBtn.className = 'ability-btn';
  fleeBtn.disabled  = combat.ended || combat.waiting;
  fleeBtn.innerHTML = '<div class="ability-name" style="color:var(--red-light)">Flee</div>' +
                      '<div class="ability-cost">Retreat</div>' +
                      '<div class="ability-desc">Abandon. No reward.</div>';
  fleeBtn.addEventListener('click', () => endCombat(false, true));
  grid.appendChild(fleeBtn);
}

// ── Enter dungeon ─────────────────────────────────────────────
export function enterDungeon(level) {
  if (store.state.stamina < CONFIG.dungeonStaminaCost) { _toast('Not enough stamina.'); return; }
  if (level > store.state.dungeonsCleared + 1)         { _toast('Clear the previous trial first.'); return; }

  store.state.stamina -= CONFIG.dungeonStaminaCost;
  saveState();

  const stats  = getCombatStats();
  const bossHP = CONFIG.bossHpMult * level * level;
  const bossDmg = CONFIG.bossDmgBase + level * level;
  const bossDef = level * CONFIG.bossDefScale;

  combat = {
    level,
    bossName:      DUNGEON_BOSSES[level - 1],
    bossHP,
    bossMaxHP:     bossHP,
    bossDmg,
    bossDef,
    playerHP:      stats.maxHP,
    playerMaxHP:   stats.maxHP,
    playerStamina: store.state.stamina,
    stats,
    log:           [],
    effects:       { powerNext: false, ironTurns: 0, cryTurns: 0, unbrokenUsed: false, unbrokenActive: false, leechActive: false },
    ended:         false,
    waiting:       false,
  };

  document.getElementById('combatResultArea').innerHTML = '';
  document.getElementById('combatActions').style.display = 'block';
  document.getElementById('combatOverlay').classList.add('show');
  document.getElementById('combatTitle').textContent    = t('combat_title') + ' ' + level;
  document.getElementById('combatSubtitle').textContent = t('combat_face_boss').replace('{boss}', combat.bossName);
  document.getElementById('bossName').textContent       = combat.bossName;

  const bossImg = document.getElementById('bossPortrait');
  bossImg.style.display = 'block';
  bossImg.src = 'images/bosses/boss_' + level + '.jpg';

  addLog('<span class="log-info">You descend into the trial. ' + combat.bossName + ' stirs.</span>');
  renderCombat();
}

// ── Damage calculation ────────────────────────────────────────
function calcCritChance(dex) {
  return CONFIG.critChanceMax * (1 - Math.exp(-dex / CONFIG.critChanceCoefficient));
}

function calcPlayerDamage(stats, bossDef, mult) {
  const critChance = calcCritChance(stats.DEX);
  const crit = (Math.random() * 100) < critChance;
  let base = (stats.STR * 1) + (1 + Math.floor(Math.random() * Math.max(1, stats.DEX))) - bossDef;
  base = Math.max(1, base);
  let dmg = Math.floor(base * mult);
  if (crit) dmg = Math.floor(dmg * CONFIG.critMultiplier);
  return { damage: dmg, crit };
}

// ── Visual hit dispatch ───────────────────────────────────────
function combatHit(targetIsBoss, amount, isCrit, abilityEffect) {
  if (targetIsBoss) {
    const boss = document.getElementById('bossCombatant');
    if (abilityEffect === 'power')    { triggerPowerSlash(boss, isCrit); }
    else if (abilityEffect === 'cry') { triggerCrySlash(boss, isCrit); triggerScreenFlash('cry'); }
    else                              { triggerSlash(boss, isCrit); if (isCrit) triggerScreenFlash('crit'); }
    triggerDamageNumber(boss, amount, isCrit);
    playSound(isCrit ? 'crit' : 'hit');
  } else {
    const player = document.getElementById('playerCombatant');
    if (combat && combat.effects.ironTurns > 0) { triggerBarrierRipple(player); triggerScreenFlash('iron'); }
    else                                        { triggerSlash(player, false); triggerScreenFlash('hit'); }
    triggerDamageNumber(player, amount, false);
    triggerShake(player);
    playSound('bossHit');
  }
}

// ── Ability use ───────────────────────────────────────────────
export function useAbility(abilityId) {
  if (!combat || combat.ended) return;
  const ab = ABILITIES.find(a => a.id === abilityId);
  if (!ab || combat.playerStamina < ab.cost) return;

  combat.playerStamina -= ab.cost;
  let dmgMult = 1, recoil = 0;

  if (ab.effect === 'power')   dmgMult = 2;
  if (ab.effect === 'reckless') { dmgMult = 3; recoil = 20; }
  if (combat.effects.cryTurns > 0 && (ab.effect === 'basic' || ab.effect === 'power' || ab.effect === 'reckless'))
    dmgMult *= 1.5;

  if (ab.effect === 'iron') {
    combat.effects.ironTurns = 6;
    triggerIronActivate(document.getElementById('playerCombatant'));
    addLog('<span class="log-player">You brace yourself — your skin hardens for 3 turns.</span>');
  } else if (ab.effect === 'cry') {
    combat.effects.cryTurns = 6;
    triggerCryActivate(document.getElementById('playerCombatant'));
    addLog('<span class="log-player">You unleash a fierce battle cry! +50% damage for 3 turns.</span>');
  } else if (ab.effect === 'leech') {
    combat.effects.leechActive = true;
    addLog('<span class="log-player">Blood Pact sealed. Your critical strikes will drain life.</span>');
  } else if (ab.effect === 'unbroken') {
    if (!combat.effects.unbrokenUsed) {
      combat.effects.unbrokenActive = true;
      combat.effects.unbrokenUsed   = true;
      addLog('<span class="log-player">Your resolve hardens. You will not fall easily.</span>');
    } else {
      addLog('<span class="log-info">Unbroken has already been invoked.</span>');
      combat.playerStamina += ab.cost;
    }
  } else {
    const r          = calcPlayerDamage(combat.stats, combat.bossDef, dmgMult);
    combat.bossHP   -= r.damage;
    const hitEffect  = ab.effect === 'power' ? 'power' : (combat.effects.cryTurns > 0 ? 'cry' : undefined);
    combatHit(true, r.damage, r.crit, hitEffect);
    if (r.crit) {
      addLog('<span class="log-crit">CRITICAL! Your ' + ab.name + ' deals ' + r.damage + ' damage!</span>');
      if (combat.effects.leechActive) {
        const leech = Math.max(1, Math.floor(r.damage * 0.05));
        combat.playerHP = Math.min(combat.playerMaxHP, combat.playerHP + leech);
        addLog('<span class="log-dodge">Blood Pact: +' + leech + ' HP.</span>');
      }
    } else {
      addLog('<span class="log-player">Your ' + ab.name + ' hits for ' + r.damage + ' damage.</span>');
    }
    if (combat.effects.cryTurns > 0) combat.effects.cryTurns--;
    if (recoil > 0) {
      combat.playerHP -= recoil;
      addLog('<span class="log-info">You take ' + recoil + ' recoil damage.</span>');
    }
  }

  if (combat.bossHP <= 0) { endCombat(true); return; }
  combat.waiting = true;
  renderCombat();
  setTimeout(() => {
    if (!combat || combat.ended) return;
    bossTurn();
    combat.waiting = false;
    renderCombat();
  }, 1000);
}

// ── Boss turn ─────────────────────────────────────────────────
function bossTurn() {
  if (combat.ended || combat.bossHP <= 0) return;
  const vitPct = Math.min(CONFIG.vitDefenseMax, combat.stats.VIT / (combat.stats.VIT + CONFIG.vitDefenseK));
  let dmg = Math.max(1, Math.round(combat.bossDmg * (1 - vitPct)));

  if (combat.effects.ironTurns > 0) {
    dmg = Math.ceil(dmg * 0.5);
    combat.effects.ironTurns--;
    addLog('<span class="log-dodge">Iron Skin absorbs half the blow!</span>');
  }
  combat.playerHP -= dmg;
  combatHit(false, dmg, false);
  addLog('<span class="log-boss">' + combat.bossName + ' strikes you for ' + dmg + ' damage.</span>');

  if (combat.playerHP <= 0) {
    if (combat.effects.unbrokenActive) {
      combat.playerHP = Math.ceil(combat.playerMaxHP * 0.5);
      combat.effects.unbrokenActive = false;
      addLog('<span class="log-crit">LAST STAND! You rise with ' + combat.playerHP + ' HP!</span>');
    } else {
      endCombat(false);
    }
  }
}

// ── End / exit ────────────────────────────────────────────────
export function endCombat(won, fled) {
  combat.ended = true;
  document.getElementById('combatActions').style.display = 'none';
  let html = '';

  if (won) {
    const goldWin = combat.level * CONFIG.dungeonGoldMult;
    const xpWin   = combat.level * CONFIG.dungeonXPMult;
    store.state.gold += goldWin;
    store.state.xp   += xpWin;
    if (combat.level > store.state.dungeonsCleared) store.state.dungeonsCleared = combat.level;
    if (!store.state.dungeonsClearedThisWeek.includes(combat.level))
      store.state.dungeonsClearedThisWeek.push(combat.level);

    const dropCount    = 2 + Math.floor(Math.random() * 2);   // 2–3 items
    const bossTier     = TIERS[Math.min(Math.floor((combat.level - 1) / 2), TIERS.length - 1)];
    const itemsDropped = [];
    for (let i = 0; i < dropCount; i++) {
      const slotId = SLOTS[Math.floor(Math.random() * SLOTS.length)].id;
      const roll   = Math.random();
      const rarity = roll < CONFIG.bossDropEpic     ? 'epic'
                   : roll < CONFIG.bossDropEpic + CONFIG.bossDropRare ? 'rare'
                   : 'uncommon';
      itemsDropped.push(generateItem(slotId, bossTier, rarity));
    }
    itemsDropped.forEach(item => store.state.inventory.push(item));

    const { leveled, newAbility } = checkLevelUp();
    playSound('victory');

    const rarityColor = r => r === 'epic' ? 'var(--epic-purple)' : r === 'rare' ? 'var(--rare-blue)' : r === 'uncommon' ? 'var(--uncommon-green)' : 'var(--text)';
    const topRarity   = itemsDropped.reduce((best, i) => {
      const order = { epic:3, rare:2, uncommon:1, common:0 };
      return (order[i.rarity] ?? 0) > (order[best] ?? 0) ? i.rarity : best;
    }, 'uncommon');
    const borderColor = rarityColor(topRarity);
    const itemsHtml   = itemsDropped.map(item => {
      const { itemSpriteHtml, formatItemStats } = _itemHelpers();
      const col = rarityColor(item.rarity);
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">` +
             itemSpriteHtml(item, 40) +
             `<div><div style="color:${col};font-size:14px;">` +
             item.name.replace(/^[◆✦★]\s*/, '') +
             `</div><div style="font-size:11px;color:var(--text-dim);margin-top:2px;">${formatItemStats(item)}</div></div></div>`;
    }).join('');

    html = `<div class="combat-result win"><div class="result-title">VICTORY</div>` +
           `<div style="margin-bottom:10px;font-style:italic;color:var(--text-dim);">${combat.bossName} falls before you.</div>` +
           `<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;">` +
           `<span class="reward-chip xp">+${xpWin} XP</span><span class="reward-chip gold">+${goldWin} Gold</span></div>` +
           `<div style="padding:10px;border:1px solid ${borderColor};margin-bottom:10px;border-radius:1px;">` +
           `<div style="font-family:Cinzel,serif;font-size:11px;color:var(--text-dim);letter-spacing:1px;margin-bottom:6px;">ITEMS FOUND (${dropCount})</div>` +
           itemsHtml +
           `</div><button class="btn btn-primary" id="btnExitCombat">Leave the Depths</button></div>`;

    saveState();
    if (leveled) setTimeout(() => showLevelUp(newAbility), 1500);
  } else {
    playSound('defeat');
    html = `<div class="combat-result lose"><div class="result-title">${fled ? 'FLED' : 'DEFEAT'}</div>` +
           `<div style="margin-bottom:14px;font-style:italic;color:var(--text-dim);">` +
           (fled ? 'You withdraw into the dark.' : 'You fall. Return stronger.') +
           `</div><button class="btn btn-primary" id="btnExitCombat">Return to the Surface</button></div>`;
    saveState();
  }

  document.getElementById('combatResultArea').innerHTML = html;
  document.getElementById('btnExitCombat').addEventListener('click', exitCombat);
  renderCombat();
}

export function exitCombat() {
  document.getElementById('combatOverlay').classList.remove('show');
  combat = null;
  renderAll();
}

// Lazy helpers to avoid circular deps at module eval time
function _itemHelpers() {
  // items.js is already loaded by this point
  const mod = _itemHelpersCache;
  return mod;
}
let _itemHelpersCache = null;
export function setItemHelpers(h) { _itemHelpersCache = h; }

// Lazy toast (ui.js loaded by main.js)
let _toast = msg => alert(msg);
export function setToast(fn) { _toast = fn; }
