import { store }          from './store.js';
import { CONFIG }          from './config.js';
import { SLOTS, TIERS, ARMOR_SLOTS, RARE_SELL_MULT,
         DUNGEON_BOSSES, ABILITIES, LEVELS }  from './data.js';
import { getCombatStats, getLevelData,
         getCurrentLevelXP, getCurrentLevelMax } from './state.js';
import { getItemSpriteStyle, itemSpriteHtml,
         weaponSpriteStyle, offhandSpriteStyle,
         jewelrySpriteStyle, armorSpriteStyle,
         formatItemStats, formatItemStatsDetailed } from './items.js';
import { t }               from './i18n.js';

// ── Tab / selective rendering ─────────────────────────────────
let currentTab = 'main';

const TAB_RENDERERS = {
  main:     () => { renderCharacter(); renderQuest(); },
  stats:    renderStats,
  train:    renderTrain,
  dungeons: renderDungeons,
  gear:     () => { renderGear(); renderInventory(); },
  shop:     renderShop,
  history:  renderHistory,
};

export function switchTab(tabId) {
  hideGearTooltip();
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const tabBtn     = document.querySelector(`.tab[data-tab="${tabId}"]`);
  const tabContent = document.getElementById('tab-' + tabId);
  if (tabBtn)     tabBtn.classList.add('active');
  if (tabContent) tabContent.classList.add('active');
  currentTab = tabId;
  renderCurrentTab();
  window.scrollTo(0, 0);
}

function renderCurrentTab() {
  applyTranslations();
  const fn = TAB_RENDERERS[currentTab];
  if (fn) fn();
}

export function renderAll() {
  renderCurrentTab();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  const lang = store.state?.tutorialLang || 'en';
  document.querySelectorAll('#langSwitcher [data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ── Slot / SVG helpers ────────────────────────────────────────
function slotIconId(slotId) {
  return (slotId === 'ring1' || slotId === 'ring2') ? 'icon-ring' : 'icon-' + slotId;
}
function svgUse(id) {
  return `<svg class="slot-icon"><use href="#${id}" xlink:href="#${id}"/></svg>`;
}

// ── Tooltip ───────────────────────────────────────────────────
let _lastTouchTime    = 0;
let _tooltipTouchSrc  = null;

function _itemTooltipSprite(item) {
  const style = getItemSpriteStyle(item, 80);
  return style ? `<div class="gear-tooltip-sprite"><div style="${style}"></div></div>` : '';
}

export function showGearTooltip(item, e) {
  const tip  = document.getElementById('gearTooltip');
  const tier = TIERS.find(tr => tr.tier === item.tier);
  const gem  = item.rare ? '<svg class="rarity-gem"><use href="#icon-gem" xlink:href="#icon-gem"/></svg>' : '';
  const stats = Object.keys(item.bonuses).map(s =>
    `<div class="gear-tooltip-stat">+${item.bonuses[s]} ${s}</div>`).join('');
  tip.innerHTML =
    _itemTooltipSprite(item) +
    `<div class="gear-tooltip-name${item.rare ? ' rare' : ''}">` +
      gem + item.name.replace(/^✦\s*/, '') +
    `</div><div class="gear-tooltip-meta">` +
      item.slotName + ' · ' + tier.name +
      (item.rare ? ' · <span style="color:var(--rare-blue)">Rare</span>' : '') +
      ' · Req Lv ' + item.levelReq +
    `</div>` + stats;
  tip.classList.add('show');
  _positionTooltip(e);
}

export function showItemTooltip(item, e) {
  const tip  = document.getElementById('gearTooltip');
  const tier = TIERS.find(tr => tr.tier === item.tier);
  const gem  = item.rare ? '<svg class="rarity-gem"><use href="#icon-gem" xlink:href="#icon-gem"/></svg>' : '';
  const stats = Object.keys(item.bonuses).map(s =>
    `<div class="gear-tooltip-stat">+${item.bonuses[s]} ${s}</div>`).join('');

  let compareHtml = '';
  const equippedSlotId = (item.slotId === 'ring1' || item.slotId === 'ring2') ? null : item.slotId;
  const equippedItem   = equippedSlotId
    ? store.state.equipped[equippedSlotId]
    : (store.state.equipped.ring1 || store.state.equipped.ring2);
  if (equippedItem) {
    const eGem   = equippedItem.rare ? '<svg class="rarity-gem"><use href="#icon-gem" xlink:href="#icon-gem"/></svg>' : '';
    const eStats = Object.keys(equippedItem.bonuses).map(s =>
      `<div class="gear-tooltip-stat">+${equippedItem.bonuses[s]} ${s}</div>`).join('');
    compareHtml =
      `<div class="gear-tooltip-divider">${t('tooltip_equipped')}</div>` +
      _itemTooltipSprite(equippedItem) +
      `<div class="gear-tooltip-name${equippedItem.rare ? ' rare' : ''}">` +
        eGem + equippedItem.name.replace(/^✦\s*/, '') +
      `</div>` + eStats;
  }

  tip.innerHTML =
    _itemTooltipSprite(item) +
    `<div class="gear-tooltip-name${item.rare ? ' rare' : ''}">` +
      gem + item.name.replace(/^✦\s*/, '') +
    `</div><div class="gear-tooltip-meta">` +
      item.slotName + ' · ' + tier.name +
      (item.rare ? ' · <span style="color:var(--rare-blue)">Rare</span>' : '') +
      ' · ' + t('tooltip_req_lv') + ' ' + item.levelReq +
    `</div>` + stats + compareHtml;
  tip.classList.add('show');
  _positionTooltip(e);
}

export function hideGearTooltip() {
  document.getElementById('gearTooltip').classList.remove('show');
}

function _positionTooltip(e) {
  const tip = document.getElementById('gearTooltip');
  const pad = 14;
  let x = e.clientX + pad, y = e.clientY - pad;
  if (x + tip.offsetWidth  > window.innerWidth  - 8) x = e.clientX - tip.offsetWidth - pad;
  if (y + tip.offsetHeight > window.innerHeight - 8) y = window.innerHeight - tip.offsetHeight - 8;
  if (y < 8) y = 8;
  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';
}

function _positionTooltipAtEl(el) {
  const tip  = document.getElementById('gearTooltip');
  const rect = el.getBoundingClientRect();
  let x = Math.max(8, Math.min(window.innerWidth / 2 - tip.offsetWidth / 2, window.innerWidth - tip.offsetWidth - 8));
  let y = rect.top - tip.offsetHeight - 10;
  if (y < 8) y = rect.bottom + 10;
  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';
}

function _addTooltipListeners(div, showFn) {
  div.addEventListener('mouseenter', e => { if (Date.now() - _lastTouchTime < 500) return; showFn(e); });
  div.addEventListener('mousemove',  e => { if (Date.now() - _lastTouchTime < 500) return; _positionTooltip(e); });
  div.addEventListener('mouseleave', () => { if (Date.now() - _lastTouchTime < 500) return; hideGearTooltip(); });
  div.addEventListener('touchstart', e => {
    _lastTouchTime = Date.now();
    e.stopPropagation();
    if (_tooltipTouchSrc === div) { hideGearTooltip(); _tooltipTouchSrc = null; }
    else {
      const touch = e.touches[0];
      showFn({ clientX: touch.clientX, clientY: touch.clientY });
      _positionTooltipAtEl(div);
      _tooltipTouchSrc = div;
    }
  });
}

// ── Character (main tab) ──────────────────────────────────────
function renderCharacter() {
  const s     = store.state;
  const data  = getLevelData(s.level);
  const stats = getCombatStats();
  document.getElementById('charName').textContent   = s.name;
  document.getElementById('charTitle').textContent  = '— ' + data.title + ' —';
  document.getElementById('levelBadge').textContent = 'LEVEL ' + s.level;
  const curXP = getCurrentLevelXP();
  const maxXP = getCurrentLevelMax();
  const xpPct = s.level >= LEVELS.length ? 100 : Math.min(100, (curXP / maxXP) * 100);
  document.getElementById('xpBar').style.width   = xpPct + '%';
  document.getElementById('xpText').textContent  = s.level >= LEVELS.length ? 'MAX LEVEL' : curXP + ' / ' + maxXP + ' XP';
  document.getElementById('staminaBar').style.width  = (s.stamina / CONFIG.staminaCap * 100) + '%';
  document.getElementById('staminaText').textContent = s.stamina + ' / ' + CONFIG.staminaCap;
  document.getElementById('strVal').textContent = stats.STR;
  document.getElementById('dexVal').textContent = stats.DEX;
  document.getElementById('vitVal').textContent = stats.VIT;
  const strB = stats.STR - s.str, dexB = stats.DEX - s.dex, vitB = stats.VIT - s.vit;
  document.getElementById('strBonus').textContent = strB > 0 ? '+' + strB + ' gear' : '';
  document.getElementById('dexBonus').textContent = dexB > 0 ? '+' + dexB + ' gear' : '';
  document.getElementById('vitBonus').textContent = vitB > 0 ? '+' + vitB + ' gear' : '';
  document.getElementById('goldVal').textContent    = s.gold;
  document.getElementById('streakVal').textContent  = s.streak;
  document.getElementById('totalVal').textContent   = s.totalSessions;
}

function renderQuest() {
  const s      = store.state;
  const target = CONFIG.weeklyTarget;
  const done   = s.weekSessions;
  document.getElementById('questDesc').textContent = t('quest_desc')
    .replace('{boss}', s.currentWeeklyBoss).replace('{n}', target);
  const pips = document.getElementById('questPips');
  pips.innerHTML = '';
  for (let i = 0; i < target; i++) {
    const pip = document.createElement('div');
    pip.className = 'quest-pip' + (i < done ? ' done' : (i === done ? ' active' : ''));
    pip.textContent = i < done ? '⚔' : '○';
    pips.appendChild(pip);
  }
  const mult  = Math.min(1.5, Math.round((1.0 + s.streak * 0.1) * 10) / 10);
  const isMax = mult >= 1.5;
  const pct   = Math.round((mult - 1) * 100);

  document.getElementById('questEmblem').innerHTML = isMax
    ? `<img src="images/emblem.png" class="quest-emblem" alt="Max Streak">`
    : '';

  if (s.questCompleted) {
    document.getElementById('questReward').innerHTML =
      `<span style="color:var(--green-light)">${t('quest_completed').replace('{n}', s.streak)}</span>`;
  } else {
    const gold = Math.round(CONFIG.questGoldReward * mult);
    const xp   = Math.round(CONFIG.questXPReward   * mult);
    const base = t('quest_reward').replace('{gold}', gold).replace('{xp}', xp);
    document.getElementById('questReward').innerHTML = mult > 1.0
      ? base + ` <span style="color:var(--gold-light);font-size:11px;">✦ +${pct}%</span>`
      : base;
  }
}

// ── History tab ───────────────────────────────────────────────
function renderHistory() {
  const panel = document.getElementById('historyPanel');
  const s     = store.state;
  if (s.history.length === 0) {
    panel.innerHTML = `<div class="empty-state">${t('history_empty')}</div>`;
    return;
  }
  panel.innerHTML = s.history.map(h => {
    if (h.type === 'quest') {
      return `<div class="history-entry history-quest">` +
        `<div style="flex:1;min-width:0;"><div class="history-date">${h.date}</div>` +
        `<div class="history-exercises history-quest-label">✦ ${t('reward_weekly_title')}</div>` +
        `<div class="history-quest-boss">${h.boss}</div></div>` +
        `<div class="history-xp history-quest-xp">+${h.xp} XP · +${h.gold} ${t('reward_gold')}</div>` +
        `</div>`;
    }
    return `<div class="history-entry">` +
      `<div style="flex:1;min-width:0;"><div class="history-date">${h.date}</div>` +
      `<div class="history-exercises">${h.exercises.join(' · ')}</div></div>` +
      `<div class="history-xp">+${h.xp} XP</div>` +
      `</div>`;
  }).join('');
}

// ── Stats tab ─────────────────────────────────────────────────
function calcCritChance(dex) {
  return CONFIG.critChanceMax * (1 - Math.exp(-dex / CONFIG.critChanceCoefficient));
}

function renderStats() {
  const s      = store.state;
  const stats  = getCombatStats();
  const gear   = stats.gearRaw;
  const crit   = calcCritChance(stats.DEX);
  const minDmg = Math.max(1, stats.STR + 1);
  const maxDmg = Math.max(1, stats.STR + stats.DEX);
  const vitPct = (Math.min(CONFIG.vitDefenseMax, stats.VIT / (stats.VIT + CONFIG.vitDefenseK)) * 100).toFixed(1);

  const statsPanel = document.getElementById('statsPanel');
  if (statsPanel) {
    statsPanel.innerHTML =
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:14px;">` +
      `<div><div class="stat-label" style="margin-bottom:2px;">${t('stat_maxhp')}</div><div style="color:var(--red-light);font-family:Cinzel,serif;font-size:18px;">${stats.maxHP}</div></div>` +
      `<div><div class="stat-label" style="margin-bottom:2px;">${t('stat_damage')}</div><div style="color:var(--text-bright);font-family:Cinzel,serif;font-size:18px;">${minDmg} – ${maxDmg}</div><div style="font-size:11px;color:var(--text-dim);">${t('stat_before_defense')}</div></div>` +
      `<div><div class="stat-label" style="margin-bottom:2px;">${t('stat_crit')}</div><div style="color:var(--gold-light);font-family:Cinzel,serif;font-size:18px;">${crit.toFixed(1)}%</div><div style="font-size:11px;color:var(--text-dim);">×${CONFIG.critMultiplier} ${t('stat_crit_mult')}</div></div>` +
      `<div><div class="stat-label" style="margin-bottom:2px;">${t('stat_reduction')}</div><div style="color:var(--green-light);font-family:Cinzel,serif;font-size:18px;">${vitPct}%</div><div style="font-size:11px;color:var(--text-dim);">${t('stat_from_vit')} ${stats.VIT} · ${t('stat_max')} ${CONFIG.vitDefenseMax * 100}%</div></div>` +
      `<div><div class="stat-label" style="margin-bottom:2px;">${t('stat_stamina')}</div><div style="color:var(--green-light);font-family:Cinzel,serif;font-size:18px;">${s.stamina} / ${CONFIG.staminaCap}</div><div style="font-size:11px;color:var(--text-dim);">${t('stat_dungeon_entry')} ${CONFIG.dungeonStaminaCost}</div></div>` +
      `<div><div class="stat-label" style="margin-bottom:2px;">${t('stat_trials')}</div><div style="color:var(--gold-light);font-family:Cinzel,serif;font-size:18px;">${s.dungeonsCleared} / ${DUNGEON_BOSSES.length}</div></div>` +
      `</div>`;
  }

  const basePanel = document.getElementById('baseStatsPanel');
  if (basePanel) {
    basePanel.innerHTML =
      `<div style="font-size:13px;color:var(--text-dim);margin-bottom:12px;">${t('stat_earned')}</div>` +
      `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">` +
        `<div class="stat-chip"><div class="stat-chip-label">${t('lbl_strength')}</div><div class="stat-chip-val">${s.str}</div></div>` +
        `<div class="stat-chip"><div class="stat-chip-label">${t('lbl_dexterity')}</div><div class="stat-chip-val">${s.dex}</div></div>` +
        `<div class="stat-chip"><div class="stat-chip-label">${t('lbl_vitality')}</div><div class="stat-chip-val">${s.vit}</div></div>` +
      `</div><div style="border-top:1px solid var(--border);padding-top:12px;font-size:13px;line-height:1.7;">` +
        `<div style="margin-bottom:10px;"><span style="color:var(--gold-light);font-family:Cinzel,serif;letter-spacing:1px;">${t('stat_str_header')}</span><br><span style="color:var(--text-dim);">${t('stat_str_desc')}</span></div>` +
        `<div style="margin-bottom:10px;"><span style="color:var(--gold-light);font-family:Cinzel,serif;letter-spacing:1px;">${t('stat_dex_header')}</span><br><span style="color:var(--text-dim);">${t('stat_dex_desc')}</span></div>` +
        `<div><span style="color:var(--gold-light);font-family:Cinzel,serif;letter-spacing:1px;">${t('stat_vit_header')}</span><br><span style="color:var(--text-dim);">${t('stat_vit_desc').replace('{hpPerVIT}', CONFIG.hpPerVIT).replace('{vitDefenseK}', CONFIG.vitDefenseK).replace('{vitDefenseMax}', CONFIG.vitDefenseMax * 100).replace('{vitRepThreshold}', CONFIG.vitRepThreshold)}</span></div>` +
      `</div>`;
  }

  const gearPanel = document.getElementById('gearStatsPanel');
  if (gearPanel) {
    gearPanel.innerHTML =
      `<div style="font-size:13px;color:var(--text-dim);margin-bottom:10px;">${t('stat_gear_hint')}</div>` +
      `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:14px;">` +
        `<div style="padding:8px;background:var(--bg3);border:1px solid var(--border);"><div class="stat-label">${t('stat_str_from')}</div><div style="color:var(--green-light);font-family:Cinzel,serif;font-size:16px;">+${gear.STR}</div></div>` +
        `<div style="padding:8px;background:var(--bg3);border:1px solid var(--border);"><div class="stat-label">${t('stat_dex_from')}</div><div style="color:var(--green-light);font-family:Cinzel,serif;font-size:16px;">+${gear.DEX}</div></div>` +
        `<div style="padding:8px;background:var(--bg3);border:1px solid var(--border);"><div class="stat-label">${t('stat_vit_from')}</div><div style="color:var(--green-light);font-family:Cinzel,serif;font-size:16px;">+${gear.VIT}</div></div>` +
      `</div>`;
  }

  const abPanel = document.getElementById('abilitiesPanel');
  if (abPanel) {
    abPanel.innerHTML = ABILITIES.map(ab => {
      const unlocked = s.level >= ab.unlockLvl;
      return `<div style="padding:10px 0;border-bottom:1px solid var(--border);opacity:${unlocked ? '1' : '0.4'};">` +
        `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;">` +
          `<span style="font-family:Cinzel,serif;font-size:13px;color:${unlocked ? 'var(--gold-light)' : 'var(--text-dim)'};letter-spacing:1px;">${ab.name}</span>` +
          `<span style="font-size:11px;color:var(--text-dim);">${unlocked ? (ab.cost === 0 ? t('ab_free') : ab.cost + ' ' + t('ab_stamina')) : t('ab_unlocks_at') + ' ' + ab.unlockLvl}</span>` +
        `</div><div style="font-size:12px;color:var(--text-dim);font-style:italic;margin-top:2px;">${ab.desc}</div></div>`;
    }).join('');
  }

  const lvlPanel = document.getElementById('levelsPanel');
  if (lvlPanel) {
    let cumXP = 0;
    let rows = `<div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:0;font-size:12px;">` +
      `<div style="padding:4px 8px 4px 0;color:var(--text-dim);letter-spacing:1px;font-family:Cinzel,serif;border-bottom:1px solid var(--border);">LVL</div>` +
      `<div style="padding:4px 8px;color:var(--text-dim);letter-spacing:1px;font-family:Cinzel,serif;border-bottom:1px solid var(--border);">TITLE</div>` +
      `<div style="padding:4px 8px;color:var(--text-dim);letter-spacing:1px;font-family:Cinzel,serif;border-bottom:1px solid var(--border);text-align:right;">XP NEEDED</div>` +
      `<div style="padding:4px 0 4px 8px;color:var(--text-dim);letter-spacing:1px;font-family:Cinzel,serif;border-bottom:1px solid var(--border);text-align:right;">TOTAL XP</div>`;
    LEVELS.forEach(lv => {
      const isCur  = s.level === lv.level;
      const isPast = s.level > lv.level;
      const isMax  = lv.xpNeeded === 999999;
      const color  = isCur ? 'var(--gold-light)' : isPast ? 'var(--green-light)' : 'var(--text)';
      const mark   = isCur ? ' ◀' : '';
      rows += `<div style="padding:5px 8px 5px 0;border-bottom:1px solid var(--border);color:${color};font-family:Cinzel,serif;">${lv.level}${mark}</div>`;
      rows += `<div style="padding:5px 8px;border-bottom:1px solid var(--border);color:${color};">${lv.title}</div>`;
      rows += `<div style="padding:5px 8px;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:right;">${isMax ? '—' : lv.xpNeeded.toLocaleString()}</div>`;
      rows += `<div style="padding:5px 0 5px 8px;border-bottom:1px solid var(--border);color:var(--text-dim);text-align:right;">${isMax ? '—' : cumXP.toLocaleString()}</div>`;
      if (!isMax) cumXP += lv.xpNeeded;
    });
    rows += '</div>';
    lvlPanel.innerHTML = rows;
  }
}

// ── Train tab ─────────────────────────────────────────────────
function renderTrain() {
  const templates = store.state.savedTemplates || [];
  const list      = document.getElementById('templatesList');
  const empty     = document.getElementById('templatesEmpty');
  const loadRow   = document.getElementById('templateLoadRow');
  if (!list) return;
  if (templates.length === 0) {
    list.innerHTML = '';
    if (empty)   empty.style.display = '';
    if (loadRow) loadRow.style.display = 'none';
    return;
  }
  if (empty)   empty.style.display = 'none';
  if (loadRow) loadRow.style.display = '';
  list.innerHTML =
    `<select id="templateSelect" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:6px 8px;font-size:14px;border-radius:2px;font-family:'Crimson Text',Georgia,serif;">` +
    templates.map((tpl, i) =>
      `<option value="${i}">${tpl.name} (${tpl.exercises.length} exercise${tpl.exercises.length !== 1 ? 's' : ''})</option>`
    ).join('') +
    `</select>`;
}

// ── Dungeons tab ──────────────────────────────────────────────
function renderDungeons() {
  const s = store.state;
  const staminaText = document.getElementById('dungeonStaminaText');
  if (staminaText) staminaText.textContent = s.stamina + ' / ' + CONFIG.staminaCap;
  const staminaCost = document.getElementById('dungeonStaminaCost');
  if (staminaCost) staminaCost.textContent = CONFIG.dungeonStaminaCost;

  const list = document.getElementById('dungeonList');
  list.innerHTML = '';
  DUNGEON_BOSSES.forEach((boss, i) => {
    const level   = i + 1;
    const unlocked = level <= s.dungeonsCleared + 1;
    const cleared  = level <= s.dungeonsCleared;
    const bossHP   = CONFIG.bossHpMult * level * level;
    const bossDmg  = CONFIG.bossDmgBase + level * level;
    const div = document.createElement('div');
    div.className = 'dungeon-item' + (!unlocked ? ' locked' : '') + (cleared ? ' cleared' : '');
    div.innerHTML =
      `<img class="dungeon-thumb" src="images/bosses/boss_${level}.jpg" alt="" onerror="this.style.display='none'">` +
      `<div class="dungeon-info">` +
        `<div class="dungeon-level-badge">${t('dungeon_trial')} ${level}</div>` +
        `<div class="dungeon-name">${boss}</div>` +
        `<div class="dungeon-meta">${bossHP} HP · ${bossDmg} DMG${cleared ? ' · <span style="color:var(--green-light)">' + t('dungeon_cleared') + '</span>' : ''}</div>` +
      `</div>` +
      `<button class="btn ${unlocked ? 'btn-primary' : 'btn-ghost'} btn-sm"` +
        `${(!unlocked || s.stamina < CONFIG.dungeonStaminaCost) ? ' disabled' : ''}` +
        ` data-enter-level="${level}">` +
        (!unlocked ? t('dungeon_locked') : s.stamina < CONFIG.dungeonStaminaCost ? t('dungeon_low_stamina') : t('dungeon_enter')) +
      `</button>`;
    list.appendChild(div);
  });
}

// ── Gear + Inventory tab ──────────────────────────────────────
function _spriteStyle(item, size) {
  if (!item || item.spriteIdx == null) return null;
  if (item.slotId === 'weapon')  return weaponSpriteStyle(item.spriteIdx, size);
  if (item.slotId === 'offhand') return offhandSpriteStyle(item.spriteIdx, size);
  if (item.slotId === 'amulet' || item.slotId === 'ring1' || item.slotId === 'ring2')
    return jewelrySpriteStyle(item.spriteIdx, size);
  if (ARMOR_SLOTS.indexOf(item.slotId) !== -1) return armorSpriteStyle(item.slotId, item.spriteIdx, size);
  return null;
}

function renderGear() {
  const grid = document.getElementById('equipGrid');
  grid.innerHTML = '';
  SLOTS.forEach(slot => {
    const item = store.state.equipped[slot.id];
    const div  = document.createElement('div');
    div.className = 'equip-slot' + (item ? ' has-item' : '') + (item && item.rare ? ' rare' : '');
    div.dataset.slot = slot.id;
    const sp  = _spriteStyle(item, 36);
    const ico = sp ? `<div style="${sp}"></div>` : svgUse(slotIconId(slot.id));
    div.innerHTML = ico + `<div class="slot-label">${slot.name}</div>`;
    if (item) {
      div.dataset.unequip = slot.id;
      _addTooltipListeners(div, e => showGearTooltip(item, e));
    }
    grid.appendChild(div);
  });
}

function renderInventory() {
  const panel = document.getElementById('inventoryList');
  const s     = store.state;
  if (s.inventory.length === 0) {
    panel.innerHTML = `<div class="empty-state">${t('inv_empty')}</div>`;
    return;
  }
  panel.innerHTML = '';
  s.inventory.forEach(item => {
    const tier     = TIERS.find(tr => tr.tier === item.tier);
    const sellPrice = item.rare ? tier.sellPrice * RARE_SELL_MULT : tier.sellPrice;
    const canEquip  = s.level >= item.levelReq;
    const div = document.createElement('div');
    div.className = 'inventory-item' + (item.rare ? ' rare' : '');
    const gem      = item.rare ? '<svg class="rarity-gem"><use href="#icon-gem" xlink:href="#icon-gem"/></svg>' : '';
    const slotIcon = `<svg class="svg-icon svg-icon-sm" style="color:var(--text-dim);margin-right:6px;"><use href="#${slotIconId(item.slotId)}" xlink:href="#${slotIconId(item.slotId)}"/></svg>`;
    div.innerHTML =
      itemSpriteHtml(item, 40) +
      `<div class="inv-info">` +
        `<div class="inv-name ${item.rare ? 'rare' : ''}">${gem}${item.name.replace(/^✦\s*/, '')}</div>` +
        `<div class="inv-stats">${slotIcon}${item.slotName} · ${formatItemStatsDetailed(item)} · ${t('inv_req_lvl')} ${item.levelReq}</div>` +
      `</div>` +
      `<div class="inv-actions">` +
        `<button class="btn btn-primary btn-sm"${!canEquip ? ' disabled' : ''} data-equip="${item.id}">${t('inv_equip')}</button>` +
        `<button class="btn btn-ghost btn-sm" data-sell="${item.id}">${t('inv_sell')} ${sellPrice}g</button>` +
      `</div>`;
    _addTooltipListeners(div, e => showItemTooltip(item, e));
    panel.appendChild(div);
  });
}

// ── Shop tab ──────────────────────────────────────────────────
function renderShop() {
  const s     = store.state;
  const panel = document.getElementById('shopList');
  const goldEl = document.getElementById('shopGoldDisplay');
  if (goldEl) goldEl.innerHTML =
    `<svg class="currency-svg gold-icon" style="width:14px;height:14px;vertical-align:-3px;margin-right:3px;"><use href="#icon-gold" xlink:href="#icon-gold"/></svg>` +
    `Your Gold: <strong>${s.gold}</strong>`;

  if (!s.shopStock || s.shopStock.length === 0) {
    panel.innerHTML = `<div class="empty-state">${t('shop_empty')}</div>`;
  } else {
    panel.innerHTML = '';
    s.shopStock.forEach((item, idx) => {
      const tier      = TIERS.find(tr => tr.tier === item.tier);
      const canAfford = s.gold >= tier.shopPrice;
      const canLevel  = s.level >= item.levelReq;
      const div = document.createElement('div');
      div.className = 'shop-item';
      const slotIcon = `<svg class="svg-icon svg-icon-sm" style="color:var(--text-dim);margin-right:6px;"><use href="#${slotIconId(item.slotId)}" xlink:href="#${slotIconId(item.slotId)}"/></svg>`;
      div.innerHTML =
        itemSpriteHtml(item, 40) +
        `<div class="inv-info">` +
          `<div class="inv-name">${item.name}</div>` +
          `<div class="inv-stats">${slotIcon}${item.slotName} · ${formatItemStatsDetailed(item)} · ${t('inv_req_lvl')} ${item.levelReq}</div>` +
        `</div>` +
        `<button class="btn btn-primary btn-sm"${(!canAfford || !canLevel) ? ' disabled' : ''} data-buy="${idx}">${tier.shopPrice}g</button>`;
      _addTooltipListeners(div, e => showItemTooltip(item, e));
      panel.appendChild(div);
    });
  }

  const shopEquipGrid = document.getElementById('shopEquipGrid');
  if (shopEquipGrid) {
    shopEquipGrid.innerHTML = '';
    SLOTS.forEach(slot => {
      const item = s.equipped[slot.id];
      const div  = document.createElement('div');
      div.className = 'equip-slot' + (item ? ' has-item' : '') + (item && item.rare ? ' rare' : '');
      div.dataset.slot = slot.id;
      const sp  = _spriteStyle(item, 36);
      const ico = sp ? `<div style="${sp}"></div>` : svgUse(slotIconId(slot.id));
      div.innerHTML = ico + `<div class="slot-label">${slot.name}</div>`;
      if (item) _addTooltipListeners(div, e => showGearTooltip(item, e));
      shopEquipGrid.appendChild(div);
    });
  }
}
