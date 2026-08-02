import { store }          from './store.js';
import { CONFIG }          from './config.js';
import { SLOTS, TIERS, ARMOR_SLOTS,
         DUNGEON_BOSSES, ABILITIES, LEVELS }  from './data.js';
import { getCombatStats, getLevelData,
         getCurrentLevelXP, getCurrentLevelMax, getStaminaCap } from './state.js';
import { getItemSpriteStyle, itemSpriteHtml,
         weaponSpriteStyle, offhandSpriteStyle,
         jewelrySpriteStyle, armorSpriteStyle,
         formatItemStats, formatItemStatsDetailed,
         itemRarity, itemSellPrice, itemUpgradeCost } from './items.js';

function _rarityClass(item) {
  const r = itemRarity(item);
  return r !== 'common' ? r : '';
}
function _rarityColor(item) {
  const r = itemRarity(item);
  if (r === 'epic')     return 'var(--epic-purple)';
  if (r === 'rare')     return 'var(--rare-blue)';
  if (r === 'uncommon') return 'var(--uncommon-green)';
  return 'var(--text)';
}
function _rarityLabel(item) {
  const r = itemRarity(item);
  if (r === 'epic')     return 'Epic';
  if (r === 'rare')     return 'Rare';
  if (r === 'uncommon') return 'Uncommon';
  return '';
}
function _rarityGem(item) {
  const r = itemRarity(item);
  return r !== 'common' ? `<svg class="rarity-gem ${r}"><use href="#icon-gem" xlink:href="#icon-gem"/></svg>` : '';
}
import { t, exName }       from './i18n.js';
import { EXERCISES }       from './exercises.js';

// ── Tab / selective rendering ─────────────────────────────────
let currentTab = 'main';

const TAB_RENDERERS = {
  main:     () => { renderCharacter(); renderQuest(); },
  stats:    renderStats,
  train:    renderTrain,
  dungeons: renderDungeons,
  gear:     () => { renderGear(); renderInventory(); },
  shop:     () => { renderShop(); renderBlacksmith(); },
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
  return slotId === 'ring1' ? 'icon-ring' : 'icon-' + slotId;
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
  const tip   = document.getElementById('gearTooltip');
  const tier  = TIERS.find(tr => tr.tier === item.tier);
  const rc    = _rarityClass(item);
  const rl    = _rarityLabel(item);
  const stats = Object.keys(item.bonuses).map(s =>
    `<div class="gear-tooltip-stat">+${item.bonuses[s]} ${s}</div>`).join('');
  tip.innerHTML =
    _itemTooltipSprite(item) +
    `<div class="gear-tooltip-name${rc ? ' ' + rc : ''}">` +
      _rarityGem(item) + item.name.replace(/^[◆✦★]\s*/, '') +
    `</div><div class="gear-tooltip-meta">` +
      item.slotName + ' · ' + tier.name +
      (rl ? ` · <span style="color:${_rarityColor(item)}">${rl}</span>` : '') +
      ' · iLvl ' + item.levelReq +
    `</div>` + stats;
  tip.classList.add('show');
  _positionTooltip(e);
}

export function showItemTooltip(item, e) {
  const tip  = document.getElementById('gearTooltip');
  const tier = TIERS.find(tr => tr.tier === item.tier);
  const rc   = _rarityClass(item);
  const rl   = _rarityLabel(item);
  const stats = Object.keys(item.bonuses).map(s =>
    `<div class="gear-tooltip-stat">+${item.bonuses[s]} ${s}</div>`).join('');

  let compareHtml = '';
  const equippedItem = item.slotId === 'ring1'
    ? store.state.equipped.ring1
    : store.state.equipped[item.slotId];
  if (equippedItem) {
    const erc    = _rarityClass(equippedItem);
    const eStats = Object.keys(equippedItem.bonuses).map(s =>
      `<div class="gear-tooltip-stat">+${equippedItem.bonuses[s]} ${s}</div>`).join('');
    compareHtml =
      `<div class="gear-tooltip-divider">${t('tooltip_equipped')}</div>` +
      _itemTooltipSprite(equippedItem) +
      `<div class="gear-tooltip-name${erc ? ' ' + erc : ''}">` +
        _rarityGem(equippedItem) + equippedItem.name.replace(/^[◆✦★]\s*/, '') +
      `</div>` + eStats;
  }

  tip.innerHTML =
    _itemTooltipSprite(item) +
    `<div class="gear-tooltip-name${rc ? ' ' + rc : ''}">` +
      _rarityGem(item) + item.name.replace(/^[◆✦★]\s*/, '') +
    `</div><div class="gear-tooltip-meta">` +
      item.slotName + ' · ' + tier.name +
      (rl ? ` · <span style="color:${_rarityColor(item)}">${rl}</span>` : '') +
      ' · iLvl ' + item.levelReq +
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
  const staminaCap = getStaminaCap();
  document.getElementById('staminaBar').style.width  = (s.stamina / staminaCap * 100) + '%';
  document.getElementById('staminaText').textContent = s.stamina + ' / ' + staminaCap;
  const runInfoEl = document.getElementById('staminaRunInfo');
  if (runInfoEl) {
    const totalKm   = s.totalRunningKm || 0;
    const bonus     = Math.floor(totalKm / 5);
    const kmToNext  = 5 - (totalKm % 5);
    runInfoEl.textContent = bonus > 0
      ? `+${bonus} from running · ${kmToNext}km → +1 cap`
      : `Every 5km run = +1 max stamina · ${kmToNext}km to first`;
  }
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

  const portraitImg = document.getElementById('charPortrait');
  if (portraitImg) {
    const stage = Math.min(18, s.level);
    const src   = 'images/character_levels/level_' + String(stage).padStart(2, '0') + '.png';
    if (!avatarProgressionPlayed) {
      avatarProgressionPlayed  = true;
      avatarProgressionPending = true;
      playAvatarProgression(portraitImg, stage).then(() => {
        avatarProgressionPending = false;
        // A cloud sync (or other state change) may have landed mid-animation —
        // re-check the live level now that the scripted sequence is done.
        const finalStage = Math.min(18, store.state.level);
        const finalSrc = 'images/character_levels/level_' + String(finalStage).padStart(2, '0') + '.png';
        if (!portraitImg.src.endsWith(finalSrc)) portraitImg.src = finalSrc;
      });
    } else if (!avatarProgressionPending && !portraitImg.src.endsWith(src)) {
      portraitImg.src = src;
    }
  }
}

let avatarProgressionPlayed  = false;
let avatarProgressionPending = false;

function playAvatarProgression(imgEl, targetStage) {
  const frame = n => 'images/character_levels/level_' + String(n).padStart(2, '0') + '.png';
  if (targetStage <= 1) { imgEl.src = frame(1); return Promise.resolve(); }

  // Preload every frame first — swapping img.src on a timer without this
  // means frames still in flight over the network can arrive late or out
  // of order, making the sequence look glitchy instead of a clean step-through.
  const urls = [];
  for (let i = 1; i <= targetStage; i++) urls.push(frame(i));
  return Promise.all(urls.map(src => new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  }))).then(() => new Promise(resolve => {
    let stage = 1;
    imgEl.src = frame(1);
    const timer = setInterval(() => {
      stage++;
      imgEl.src = frame(stage);
      if (stage >= targetStage) { clearInterval(timer); resolve(); }
    }, 300);
  }));
}

function renderQuest() {
  const s      = store.state;
  const target = CONFIG.weeklyTarget;
  const done   = (s.weekTrainingDays || []).length;
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

  const weekEnd   = s.weekStart + 7 * 24 * 60 * 60 * 1000;
  const remaining = weekEnd - Date.now();
  const days      = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours     = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const timeStr   = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  document.getElementById('questTimer').textContent = `Resets in ${timeStr}`;
}

// ── History tab (per-exercise progress) ─────────────────────────
let historySelectedExercise = null;

export function setHistoryExercise(name) {
  historySelectedExercise = name;
  renderHistory();
}

// name -> array of { date, ts, weight, reps, sets, perSets }, newest first
function collectExerciseLogs() {
  const s   = store.state;
  const map = {};
  (s.history || []).forEach(h => {
    if (!h.log) return;
    h.log.forEach(entry => {
      if (!map[entry.name]) map[entry.name] = [];
      map[entry.name].push({ date: h.date, ts: h.ts || 0, ...entry });
    });
  });
  Object.values(map).forEach(list => list.sort((a, b) => b.ts - a.ts));
  return map;
}

// Single comparable number per entry: total volume for weighted lifts,
// distance/duration for running & timed activities.
function entryMetric(entry, info) {
  if (info && (info.running || info.timed)) return entry.reps || 0;
  if (entry.perSets && entry.perSets.length)
    return entry.perSets.reduce((sum, st) => sum + (st.weight || 0) * (st.reps || 0), 0);
  return (entry.weight || 0) * (entry.reps || 0) * (entry.sets || 0);
}

function renderHistory() {
  const panel  = document.getElementById('historyPanel');
  const logMap = collectExerciseLogs();
  const names  = Object.keys(logMap);

  if (names.length === 0) {
    panel.innerHTML = `<div class="empty-state">${t('history_empty')}</div>`;
    return;
  }

  const order = EXERCISES.map(e => e.name);
  names.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  if (!historySelectedExercise || !logMap[historySelectedExercise])
    historySelectedExercise = names[0];

  const info    = EXERCISES.find(e => e.name === historySelectedExercise);
  const entries = logMap[historySelectedExercise];
  const isTimeBased = info && (info.running || info.timed);
  const valueHeader  = info && info.running ? t('hist_col_distance')
                      : info && info.timed  ? t('hist_col_duration')
                      : t('hist_col_volume');

  const selectHtml = `<select id="historyExerciseSelect" class="history-exercise-select">` +
    names.map(n => {
      const exInfo = EXERCISES.find(e => e.name === n);
      const label  = exInfo ? exName(exInfo) : n;
      return `<option value="${n}" ${n === historySelectedExercise ? 'selected' : ''}>${label}</option>`;
    }).join('') + `</select>`;

  // All-time best for this exercise — powers the data-bar width (magnitude, whole history).
  const bestVal = entries.reduce((max, e) => Math.max(max, entryMetric(e, info)), 0);

  const rowsHtml = entries.map((entry, i) => {
    const val  = entryMetric(entry, info);
    const prev = entries[i + 1];
    let trendClass = 'trend-flat', pctHtml = `<span class="hist-pct hist-pct-flat">${t('hist_no_baseline')}</span>`;
    if (prev) {
      const prevVal = entryMetric(prev, info);
      if (val > prevVal)      trendClass = 'trend-up';
      else if (val < prevVal) trendClass = 'trend-down';
      const pct = prevVal > 0 ? Math.round((val - prevVal) / prevVal * 100) : null;
      pctHtml = pct === null ? '' : `<span class="hist-pct hist-pct-${trendClass}">${pct > 0 ? '+' : ''}${pct}%</span>`;
    }

    let cols = '';
    if (!isTimeBased) {
      let weightCell, repsCell, setsCell;
      if (entry.perSets && entry.perSets.length) {
        weightCell = entry.perSets.map(st => st.weight).join('/');
        repsCell   = entry.perSets.map(st => st.reps).join('/');
        setsCell   = entry.perSets.length;
      } else {
        weightCell = entry.weight;
        repsCell   = entry.reps;
        setsCell   = entry.sets;
      }
      cols = `<td>${weightCell}</td><td>${repsCell}</td><td>${setsCell}</td>`;
    }

    // Data-bar fill = this session's share of the all-time best for this exercise.
    const barPct = bestVal > 0 ? Math.max(3, Math.round(val / bestVal * 100)) : 0;

    return `<tr class="hist-row ${trendClass}">` +
      `<td class="hist-trend-dot"><span></span></td>` +
      `<td>${entry.date}</td>` +
      cols +
      `<td><div class="data-bar-cell" style="background:linear-gradient(to right, var(--data-bar-fill) ${barPct}%, transparent ${barPct}%)">` +
        `<span class="data-bar-value">${val}</span>` +
      `</div></td>` +
      `<td class="hist-pct-cell">${pctHtml}</td>` +
      `</tr>`;
  }).join('');

  panel.innerHTML =
    `<div class="history-select-row"><label for="historyExerciseSelect">${t('hist_pick_exercise')}</label>${selectHtml}</div>` +
    `<div class="history-table-wrap"><table class="history-table">` +
    `<thead><tr><th></th><th>${t('hist_col_date')}</th>` +
    (isTimeBased ? '' : `<th>${t('ex_weight')}</th><th>${t('ex_reps')}</th><th>${t('ex_sets')}</th>`) +
    `<th>${valueHeader}</th><th></th></tr></thead>` +
    `<tbody>${rowsHtml}</tbody>` +
    `</table></div>`;
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
      `<div><div class="stat-label" style="margin-bottom:2px;">${t('stat_stamina')}</div><div style="color:var(--green-light);font-family:Cinzel,serif;font-size:18px;">${s.stamina} / ${getStaminaCap()}</div><div style="font-size:11px;color:var(--text-dim);">${t('stat_dungeon_entry')} ${CONFIG.dungeonStaminaCost}</div></div>` +
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
function renderPendingSessions() {
  const pending = store.state.pendingSessions || [];
  const panel   = document.getElementById('pendingSessionsPanel');
  const list    = document.getElementById('pendingSessionsList');
  if (!panel || !list) return;
  if (pending.length === 0) {
    panel.style.display = 'none';
    list.innerHTML = '';
    return;
  }
  panel.style.display = '';
  list.innerHTML = pending.map(p =>
    `<div class="pending-session-row">` +
      `<div class="pending-session-info">` +
        `<div class="pending-session-date">${p.date}</div>` +
        `<div class="pending-session-exercises">${(p.summary || []).join(' · ')}</div>` +
      `</div>` +
      `<div class="pending-session-actions">` +
        `<button class="btn btn-primary btn-sm" data-complete-pending="${p.id}">${t('btn_complete_session')}</button>` +
        `<button class="remove-btn" title="${t('modal_delete_action')}" data-discard-pending="${p.id}">✕</button>` +
      `</div>` +
    `</div>`
  ).join('');
}

function renderTrain() {
  renderPendingSessions();
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
  if (staminaText) staminaText.textContent = s.stamina + ' / ' + getStaminaCap();
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
  if (item.slotId === 'amulet' || item.slotId === 'ring1')
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
    const rc = item ? _rarityClass(item) : '';
    div.className = 'equip-slot' + (item ? ' has-item' : '') + (rc ? ' ' + rc : '');
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
    const sellPrice = itemSellPrice(item);
    const rc        = _rarityClass(item);
    const div = document.createElement('div');
    div.className = 'inventory-item' + (rc ? ' ' + rc : '');
    const slotIcon = `<svg class="svg-icon svg-icon-sm" style="color:var(--text-dim);margin-right:6px;"><use href="#${slotIconId(item.slotId)}" xlink:href="#${slotIconId(item.slotId)}"/></svg>`;
    div.innerHTML =
      itemSpriteHtml(item, 40) +
      `<div class="inv-info">` +
        `<div class="inv-name${rc ? ' ' + rc : ''}">${_rarityGem(item)}${item.name.replace(/^[◆✦★]\s*/, '')}</div>` +
        `<div class="inv-stats">${slotIcon}${item.slotName} · ${formatItemStatsDetailed(item)} · iLvl ${item.levelReq}</div>` +
      `</div>` +
      `<div class="inv-actions">` +
        `<button class="btn btn-primary btn-sm" data-equip="${item.id}">${t('inv_equip')}</button>` +
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
      const div = document.createElement('div');
      div.className = 'shop-item';
      const slotIcon = `<svg class="svg-icon svg-icon-sm" style="color:var(--text-dim);margin-right:6px;"><use href="#${slotIconId(item.slotId)}" xlink:href="#${slotIconId(item.slotId)}"/></svg>`;
      div.innerHTML =
        itemSpriteHtml(item, 40) +
        `<div class="inv-info">` +
          `<div class="inv-name">${item.name}</div>` +
          `<div class="inv-stats">${slotIcon}${item.slotName} · ${formatItemStatsDetailed(item)} · iLvl ${item.levelReq}</div>` +
        `</div>` +
        `<button class="btn btn-primary btn-sm"${!canAfford ? ' disabled' : ''} data-buy="${idx}">${tier.shopPrice}g</button>`;
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
      const src = item ? _rarityClass(item) : '';
      div.className = 'equip-slot' + (item ? ' has-item' : '') + (src ? ' ' + src : '');
      div.dataset.slot = slot.id;
      const sp  = _spriteStyle(item, 36);
      const ico = sp ? `<div style="${sp}"></div>` : svgUse(slotIconId(slot.id));
      div.innerHTML = ico + `<div class="slot-label">${slot.name}</div>`;
      if (item) _addTooltipListeners(div, e => showGearTooltip(item, e));
      shopEquipGrid.appendChild(div);
    });
  }
}

// ── Blacksmith — upgrade equipped/inventory item stats ─────────
function renderBlacksmith() {
  const s     = store.state;
  const panel = document.getElementById('blacksmithList');
  if (!panel) return;

  const entries = [];
  SLOTS.forEach(slot => {
    const item = s.equipped[slot.id];
    if (item) entries.push({ item, equipped: true });
  });
  s.inventory.forEach(item => entries.push({ item, equipped: false }));

  if (entries.length === 0) {
    panel.innerHTML = `<div class="empty-state">${t('blacksmith_empty')}</div>`;
    return;
  }

  panel.innerHTML = '';
  entries.forEach(({ item, equipped }) => {
    const rc   = _rarityClass(item);
    const cost = itemUpgradeCost(item);
    const div  = document.createElement('div');
    div.className = 'blacksmith-item' + (rc ? ' ' + rc : '') + (equipped ? ' bs-equipped' : '');
    const slotIcon = `<svg class="svg-icon svg-icon-sm" style="color:var(--text-dim);margin-right:4px;"><use href="#${slotIconId(item.slotId)}" xlink:href="#${slotIconId(item.slotId)}"/></svg>`;
    const upgradeBtns = Object.keys(item.bonuses).map(stat => {
      const canAfford = s.gold >= cost;
      return `<button class="btn btn-ghost btn-xs" data-upgrade-item="${item.id}" data-upgrade-stat="${stat}"${!canAfford ? ' disabled' : ''}>+1 ${stat} · ${cost}g</button>`;
    }).join('');
    div.innerHTML =
      `<div class="bs-item-header">` +
        itemSpriteHtml(item, 32) +
        `<div class="inv-info">` +
          `<div class="inv-name${rc ? ' ' + rc : ''}">${_rarityGem(item)}${item.name.replace(/^[◆✦★]\s*/, '')}</div>` +
          `<div class="inv-stats">${slotIcon}${item.slotName} · ${formatItemStatsDetailed(item)}</div>` +
        `</div>` +
        (equipped ? `<span class="bs-equipped-badge">${t('lbl_equipped_badge')}</span>` : '') +
      `</div>` +
      `<div class="bs-upgrade-row">${upgradeBtns}</div>`;
    _addTooltipListeners(div, e => showItemTooltip(item, e));
    panel.appendChild(div);
  });
}
