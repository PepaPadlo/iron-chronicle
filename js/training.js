import { store }          from './store.js';
import { CONFIG }          from './config.js';
import { EXERCISES }       from './exercises.js';
import { NARRATIVES } from './data.js';
import { checkLevelUp, saveState, getLevelData, parseWeight } from './state.js';
import { t, exName }       from './i18n.js';
import { playSound }       from './audio.js';
import { renderAll, switchTab } from './render.js';
import { toast, showModal }     from './ui.js';

// ── Consistency streak ────────────────────────────────────────
const STREAK_WINDOW = 7 * 24 * 60 * 60 * 1000;

function sameCalendarDay(tsA, tsB) {
  const a = new Date(tsA), b = new Date(tsB);
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function getPreviewMult(name) {
  const entry = store.state.exerciseStreaks?.[name];
  if (!entry || entry.lastDone === 0) return 1.0;
  const now = Date.now();
  if (now - entry.lastDone > STREAK_WINDOW) return 1.0;
  if (sameCalendarDay(entry.lastDone, now)) return entry.mult;
  return Math.min(1.5, Math.round((entry.mult + 0.05) * 100) / 100);
}

// ── XP / stat helpers ─────────────────────────────────────────
export function calcExerciseXP(ex) {
  const exercise = EXERCISES.find(e => e.name === ex.name);
  if (!exercise) return 0;
  if (exercise.timed || exercise.running)
    return Math.round(ex.reps * exercise.coeff);
  return Math.round(ex.weight * Math.sqrt(ex.reps) * ex.sets * exercise.coeff * exercise.difficultyCoeff / CONFIG.xpDivisor);
}

export function calcStatGain(ex) {
  const exercise = EXERCISES.find(e => e.name === ex.name);
  if (!exercise) return 0;
  if (exercise.timed || exercise.running) {
    const raw = ex.reps * exercise.coeff / CONFIG.timedStatDivisor;
    return exercise.running
      ? Math.floor(raw * CONFIG.statYieldRunning)
      : Math.floor(raw * CONFIG.statYieldActivity);
  }
  const effort = ex.weight * Math.sqrt(ex.reps) * ex.sets * exercise.coeff * exercise.difficultyCoeff;
  const gain   = Math.floor(effort / CONFIG.statGainDivisor);
  if (exercise.stat === 'STR') return Math.floor(gain * CONFIG.statYieldSTR);
  if (exercise.stat === 'DEX') return Math.floor(gain * CONFIG.statYieldDEX);
  return gain;
}

// ── Exercise form helpers ─────────────────────────────────────
function updateExerciseForm(entryDiv) {
  const name     = entryDiv.querySelector('.ex-name').value;
  const exercise = EXERCISES.find(e => e.name === name);
  if (!exercise) return;
  const weightGroup = entryDiv.querySelector('.ex-weight-group');
  const setsGroup   = entryDiv.querySelector('.ex-sets-group');
  const repsLabel   = entryDiv.querySelector('.ex-reps-label');
  const repsInput   = entryDiv.querySelector('.ex-reps');
  const perSetBar   = entryDiv.querySelector('.per-set-bar');
  if (exercise.timed) {
    weightGroup.style.display = 'none';
    setsGroup.style.display   = 'none';
    repsLabel.textContent     = 'Time (min)';
    repsInput.setAttribute('max', '480');
    if (perSetBar) perSetBar.style.display = 'none';
  } else if (exercise.running) {
    weightGroup.style.display = 'none';
    setsGroup.style.display   = 'none';
    repsLabel.textContent     = 'Distance (km)';
    repsInput.setAttribute('max', '500');
    if (perSetBar) perSetBar.style.display = 'none';
  } else {
    weightGroup.style.display = '';
    setsGroup.style.display   = '';
    repsLabel.textContent     = 'Reps';
    repsInput.setAttribute('max', '100');
    if (perSetBar) perSetBar.style.display = '';
  }
}

function updateStatIcons(entryDiv) {
  const name     = entryDiv.querySelector('.ex-name').value;
  const exercise = EXERCISES.find(e => e.name === name);
  const span     = entryDiv.querySelector('.stat-icons');
  if (!span) return;
  if (!exercise) { span.textContent = ''; return; }
  let icons = '';
  if (exercise.stat === 'STR') icons += '💪';
  if (exercise.stat === 'DEX') icons += '🏃';
  if (exercise.stat === 'VIT') icons += '❤️';
  if (exercise.timed)          icons += '❤️';
  span.textContent = icons;
}

function updateStreakBadge(entryDiv) {
  const name  = entryDiv.querySelector('.ex-name').value;
  const badge = entryDiv.querySelector('.streak-badge');
  if (!badge) return;
  const mult = getPreviewMult(name);
  if (mult > 1.0) {
    badge.textContent   = '×' + mult.toFixed(2);
    badge.style.display = '';
  } else {
    badge.style.display = 'none';
  }
}

function updatePreview(entryDiv) {
  const name     = entryDiv.querySelector('.ex-name').value;
  const exercise = EXERCISES.find(e => e.name === name);
  if (!exercise) return;
  const mult    = getPreviewMult(name);
  const preview = entryDiv.querySelector('.xp-preview');
  if (!preview) return;

  const perSets = entryDiv._perSets;
  let xp = 0, statGain = 0, vitBonus = 0;

  if (perSets && perSets.length > 0) {
    perSets.forEach(s => {
      const ex = { name, weight: s.weight, reps: s.reps, sets: 1 };
      xp       += Math.round(calcExerciseXP(ex) * mult);
      const g   = Math.round(calcStatGain(ex) * mult);
      statGain += g;
      if (!exercise.timed && !exercise.running && s.reps >= CONFIG.vitRepThreshold && exercise.stat !== 'VIT' && g > 0)
        vitBonus += Math.max(1, Math.floor(g * 0.3));
    });
  } else {
    const weight = parseWeight(entryDiv.querySelector('.ex-weight').value);
    const reps   = parseInt(entryDiv.querySelector('.ex-reps').value) || 0;
    const sets   = parseInt(entryDiv.querySelector('.ex-sets').value) || 0;
    xp       = Math.round(calcExerciseXP({ name, weight, reps, sets }) * mult);
    statGain = Math.round(calcStatGain({ name, weight, reps, sets }) * mult);
    if (!exercise.timed && !exercise.running && reps >= CONFIG.vitRepThreshold && exercise.stat !== 'VIT' && statGain > 0)
      vitBonus = Math.max(1, Math.floor(statGain * 0.3));
  }

  const staminaGain = Math.floor(xp * CONFIG.staminaPerXPRatio);
  const goldGain    = Math.floor(xp * CONFIG.goldPerXPRatio);
  let text = xp > 0 ? '+' + xp + ' XP' : '';
  if (goldGain > 0)    text += ' · +' + goldGain + ' gold';
  if (staminaGain > 0) text += ' · +' + staminaGain + ' stamina';
  if (exercise.timed) {
    if (statGain > 0) text += ' · +' + statGain + ' VIT';
  } else {
    if (statGain > 0) text += ' · +' + statGain + ' ' + exercise.stat;
    if (vitBonus > 0) text += ' · +' + vitBonus + ' VIT';
  }
  if (mult > 1.0) text += ' · ×' + mult.toFixed(2) + ' streak';
  preview.textContent = text;
}

// ── Per-set modal ─────────────────────────────────────────────
let _perSetTarget = null;

function openPerSetModal(entryDiv) {
  _perSetTarget = entryDiv;
  const name     = entryDiv.querySelector('.ex-name').value;
  const exercise = EXERCISES.find(e => e.name === name);
  document.getElementById('perSetExName').textContent = exercise ? exName(exercise) : name;

  const existing = entryDiv._perSets;
  let seed;
  if (existing && existing.length > 0) {
    seed = existing;
  } else {
    const w = parseWeight(entryDiv.querySelector('.ex-weight').value) || 60;
    const r = parseInt(entryDiv.querySelector('.ex-reps').value) || 8;
    const s = parseInt(entryDiv.querySelector('.ex-sets').value) || 3;
    seed    = Array.from({ length: s }, () => ({ weight: w, reps: r }));
  }
  document.getElementById('perSetRows').innerHTML = '';
  seed.forEach(s => _addPerSetRow(s.weight, s.reps));
  document.getElementById('perSetBackdrop').classList.add('show');
}

function closePerSetModal() {
  document.getElementById('perSetBackdrop').classList.remove('show');
  _perSetTarget = null;
}

function _addPerSetRow(weight, reps) {
  const container = document.getElementById('perSetRows');
  const idx  = container.children.length;
  const row  = document.createElement('div');
  row.className = 'per-set-row';
  row.innerHTML =
    `<span class="per-set-num">SET ${idx + 1}</span>` +
    `<input type="text" inputmode="decimal" class="per-set-weight" value="${weight}">` +
    `<span class="per-set-unit">kg ×</span>` +
    `<input type="number" class="per-set-reps" value="${reps}" min="1" max="200">` +
    `<span class="per-set-unit">reps</span>` +
    `<button class="per-set-remove-btn" title="Remove">✕</button>`;
  row.querySelector('.per-set-remove-btn').addEventListener('click', () => {
    row.remove();
    _renumberPerSetRows();
  });
  container.appendChild(row);
}

function _renumberPerSetRows() {
  document.querySelectorAll('#perSetRows .per-set-row').forEach((row, i) => {
    row.querySelector('.per-set-num').textContent = 'SET ' + (i + 1);
  });
}

function _applyPerSets() {
  if (!_perSetTarget) return;
  const rows = document.querySelectorAll('#perSetRows .per-set-row');
  const sets = Array.from(rows).map(row => ({
    weight: parseWeight(row.querySelector('.per-set-weight').value),
    reps:   parseInt(row.querySelector('.per-set-reps').value) || 1,
  })).filter(s => s.reps > 0);
  _perSetTarget._perSets = sets.length > 0 ? sets : null;
  _updatePerSetDisplay(_perSetTarget);
  updatePreview(_perSetTarget);
  closePerSetModal();
}

function _updatePerSetDisplay(entryDiv) {
  const sets    = entryDiv._perSets;
  const bar     = entryDiv.querySelector('.per-set-bar');
  const btn     = entryDiv.querySelector('.per-set-btn');
  const summary = entryDiv.querySelector('.per-set-summary');
  const formRow = entryDiv.querySelector('.form-row');
  if (!bar) return;
  if (sets && sets.length > 0) {
    formRow.style.display   = 'none';
    btn.style.display       = 'none';
    const text = sets.map(s => s.weight + '×' + s.reps).join(', ');
    summary.innerHTML =
      `<span class="per-set-active-label">${sets.length} SETS ·</span>` +
      `<span>${text}</span>` +
      `<button class="per-set-edit-btn">edit</button>` +
      `<button class="per-set-clear-btn">✕</button>`;
    summary.style.display = 'flex';
    summary.querySelector('.per-set-edit-btn').addEventListener('click', () => openPerSetModal(entryDiv));
    summary.querySelector('.per-set-clear-btn').addEventListener('click', () => {
      entryDiv._perSets = null;
      formRow.style.display = '';
      btn.style.display     = '';
      summary.style.display = 'none';
      updatePreview(entryDiv);
    });
  } else {
    formRow.style.display   = '';
    btn.style.display       = '';
    summary.style.display   = 'none';
  }
}

export function initPerSetModal() {
  document.getElementById('perSetAddBtn').addEventListener('click', () => _addPerSetRow(60, 8));
  document.getElementById('perSetApplyBtn').addEventListener('click', _applyPerSets);
  document.getElementById('perSetCancelBtn').addEventListener('click', closePerSetModal);
  document.getElementById('perSetBackdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) closePerSetModal();
  });
}

// ── Exercise counter ──────────────────────────────────────────
let exerciseCounter = 0;

export function addExercise() {
  exerciseCounter++;
  const id      = exerciseCounter;
  const options = EXERCISES.map(e =>
    `<option value="${e.name}">${exName(e)}${e.running ? ' ' + t('ex_run_suffix') : e.timed ? ' ' + t('ex_activity_suffix') : ''}</option>`
  ).join('');

  const div = document.createElement('div');
  div.className      = 'exercise-entry';
  div.dataset.entryId = id;
  div.innerHTML =
    `<div class="exercise-entry-header"><span class="exercise-num">${t('ex_label')} ${id}</span><span class="stat-icons"></span><span class="streak-badge" style="display:none"></span><button class="remove-btn" title="Remove">✕</button></div>` +
    `<div class="form-row">` +
      `<div class="form-group"><label>${t('ex_exercise')}</label><select class="ex-name">${options}</select></div>` +
      `<div class="form-group ex-weight-group"><label>${t('ex_weight')}</label><input type="text" inputmode="decimal" class="ex-weight" value="60"></div>` +
      `<div class="form-group"><label class="ex-reps-label">${t('ex_reps')}</label><input type="number" class="ex-reps" value="8" min="1" max="100"></div>` +
      `<div class="form-group ex-sets-group"><label>${t('ex_sets')}</label><input type="number" class="ex-sets" value="3" min="1" max="20"></div>` +
    `</div>` +
    `<div class="per-set-bar"><button class="per-set-btn">↗ per-set entry</button><div class="per-set-summary"></div></div>` +
    `<div class="xp-preview"></div>`;

  document.getElementById('exerciseList').appendChild(div);
  div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
  div.querySelectorAll('.ex-name,.ex-weight,.ex-reps,.ex-sets').forEach(inp => {
    inp.addEventListener('input', () => updatePreview(div));
    inp.addEventListener('change', () => updatePreview(div));
  });
  div.querySelector('.ex-name').addEventListener('change', () => {
    div._perSets = null;
    updateExerciseForm(div);
    _updatePerSetDisplay(div);
    updatePreview(div);
    updateStreakBadge(div);
    updateStatIcons(div);
  });
  div.querySelector('.per-set-btn').addEventListener('click', () => openPerSetModal(div));
  updateExerciseForm(div);
  updatePreview(div);
  updateStreakBadge(div);
  updateStatIcons(div);
}

function gatherExercises() {
  const result = [];
  document.querySelectorAll('.exercise-entry').forEach(entry => {
    const name     = entry.querySelector('.ex-name').value;
    const exercise = EXERCISES.find(e => e.name === name);
    const perSets  = entry._perSets;
    if (perSets && perSets.length > 0) {
      if (name) result.push({ name, perSets });
    } else {
      const weight = parseWeight(entry.querySelector('.ex-weight').value);
      const reps   = parseInt(entry.querySelector('.ex-reps').value) || 0;
      const sets   = (exercise && (exercise.running || exercise.timed))
        ? 1
        : (parseInt(entry.querySelector('.ex-sets').value) || 0);
      if (name && reps > 0 && sets > 0) result.push({ name, weight, reps, sets });
    }
  });
  return result;
}

// ── Log workout ───────────────────────────────────────────────
export function logWorkout() {
  const exercises = gatherExercises();
  if (exercises.length === 0) { toast('Add at least one exercise.'); return; }

  // ── Update streak entries, collect applied multipliers ───────
  const s = store.state;
  if (!s.exerciseStreaks) s.exerciseStreaks = {};
  const now = Date.now();
  const streakMults = {};
  exercises.forEach(ex => {
    const entry = s.exerciseStreaks[ex.name] || { mult: 1.0, lastDone: 0 };
    if (entry.lastDone > 0) {
      if (now - entry.lastDone > STREAK_WINDOW)
        entry.mult = 1.0;
      else if (!sameCalendarDay(entry.lastDone, now))
        entry.mult = Math.min(1.5, Math.round((entry.mult + 0.05) * 100) / 100);
      // same calendar day: mult stays unchanged
    }
    entry.lastDone = now;
    s.exerciseStreaks[ex.name] = entry;
    streakMults[ex.name] = entry.mult;
  });

  let totalXP = 0;
  const statGains = { STR: 0, DEX: 0, VIT: 0 };
  exercises.forEach(ex => {
    const mult     = streakMults[ex.name] ?? 1.0;
    const exercise = EXERCISES.find(e => e.name === ex.name);
    const sets     = ex.perSets
      ? ex.perSets.map(s => ({ name: ex.name, weight: s.weight, reps: s.reps, sets: 1 }))
      : [ex];
    sets.forEach(unitEx => {
      totalXP += Math.round(calcExerciseXP(unitEx) * mult);
      if (exercise) {
        const gain = Math.round(calcStatGain(unitEx) * mult);
        statGains[exercise.stat] += gain;
        if (exercise.timed) {
          statGains.VIT += gain;
        } else if (!exercise.timed && !exercise.running && unitEx.reps >= CONFIG.vitRepThreshold && exercise.stat !== 'VIT' && gain > 0) {
          statGains.VIT += Math.max(1, Math.floor(gain * 0.3));
        }
      }
    });
  });

  totalXP += CONFIG.sessionBonusXP;
  const goldEarned    = Math.floor(totalXP * CONFIG.goldPerXPRatio);
  const staminaEarned = Math.floor(totalXP * CONFIG.staminaPerXPRatio);

  // Track distinct training days for the weekly quest
  if (!s.weekTrainingDays) s.weekTrainingDays = [];
  const d = new Date(now);
  const todayKey = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  if (!s.weekTrainingDays.includes(todayKey)) s.weekTrainingDays.push(todayKey);

  let questBonusXP    = 0;
  let questGoldEarned = 0;
  let questJustDone   = false;
  const questStreakMult = Math.min(1.5, Math.round((1.0 + s.streak * 0.1) * 10) / 10);
  if (s.weekTrainingDays.length >= CONFIG.weeklyTarget && !s.questCompleted) {
    s.questCompleted  = true;
    questBonusXP      = Math.round(CONFIG.questXPReward  * questStreakMult);
    questGoldEarned   = Math.round(CONFIG.questGoldReward * questStreakMult);
    s.gold           += questGoldEarned;
    totalXP          += questBonusXP;
    questJustDone     = true;
  }

  s.totalSessions++;
  s.gold    += goldEarned;
  s.stamina  = Math.min(CONFIG.staminaCap, s.stamina + staminaEarned);
  s.str     += statGains.STR;
  s.dex     += statGains.DEX;
  s.vit     += statGains.VIT;
  s.xp      += totalXP;

  const { leveled, newAbility } = checkLevelUp();

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  s.history.unshift({
    date,
    exercises: exercises.map(ex => {
      const info = EXERCISES.find(x => x.name === ex.name);
      const dn   = info ? exName(info) : ex.name;
      if (ex.perSets) return dn + ': ' + ex.perSets.map(s => s.reps + '@' + s.weight + 'kg').join(', ');
      if (info && info.timed)   return dn + ' ' + ex.reps + 'min';
      if (info && info.running) return dn + ' ' + ex.reps + 'km';
      return dn + ' ' + ex.sets + '×' + ex.reps + '@' + ex.weight + 'kg';
    }),
    xp: totalXP - questBonusXP,
  });
  if (questJustDone) {
    s.history.unshift({
      date,
      type: 'quest',
      boss: s.currentWeeklyBoss,
      xp:   questBonusXP,
      gold: questGoldEarned,
    });
  }
  if (s.history.length > 30) s.history.pop();

  saveState();
  playSound('gold');
  showNarrative(totalXP, goldEarned, staminaEarned, statGains, questJustDone, questBonusXP, questGoldEarned);
  queueRewardPopup('session', { xp: totalXP - questBonusXP, gold: goldEarned, stamina: staminaEarned, stats: statGains });
  if (questJustDone) queueRewardPopup('quest', { boss: s.currentWeeklyBoss, streak: s.streak + 1, xp: questBonusXP, gold: questGoldEarned, streakMult: questStreakMult });
  if (leveled)       queueRewardPopup('levelup', { ability: newAbility });

  document.getElementById('exerciseList').innerHTML = '';
  exerciseCounter = 0;
  addExercise();
  renderAll();
  switchTab('main');
  setTimeout(showNextRewardPopup, 400);
}

// ── Narrative ─────────────────────────────────────────────────
function showNarrative(xp, gold, stamina, stats, questDone, questBonus, questGold) {
  const text = NARRATIVES[Math.floor(Math.random() * NARRATIVES.length)];
  document.getElementById('narrativeText').textContent = '"' + text + '"';
  let rewards = `<span class="reward-chip xp">+${xp} XP</span>`;
  rewards += `<span class="reward-chip gold">+${gold} ${t('reward_gold')}</span>`;
  rewards += `<span class="reward-chip stamina">+${stamina} ${t('lbl_stamina')}</span>`;
  if (stats.STR > 0) rewards += `<span class="reward-chip stat">+${stats.STR} STR</span>`;
  if (stats.DEX > 0) rewards += `<span class="reward-chip stat">+${stats.DEX} DEX</span>`;
  if (stats.VIT > 0) rewards += `<span class="reward-chip stat">+${stats.VIT} VIT</span>`;
  if (questDone) rewards += `<span class="reward-chip gold">✦ QUEST! +${questGold}g +${questBonus} XP</span>`;
  document.getElementById('narrativeRewards').innerHTML = rewards;
  const box = document.getElementById('narrativeBox');
  box.classList.remove('visible');
  void box.offsetWidth;
  box.classList.add('visible');
  setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

// ── Level-up flash ────────────────────────────────────────────
export function showLevelUp(newAbility) {
  const data = getLevelData(store.state.level);
  document.getElementById('levelUpSub').textContent      = t('levelup_reached').replace('{level}', store.state.level);
  document.getElementById('levelUpNewTitle').textContent = '✦ ' + data.title + ' ✦';
  document.getElementById('levelUpAbility').textContent  = newAbility ? t('levelup_new_ability').replace('{name}', newAbility.name) : '';
  document.getElementById('levelUpFlash').classList.add('show');
  playSound('levelup');
}

export function dismissLevelUp() {
  document.getElementById('levelUpFlash').classList.remove('show');
  setTimeout(showNextRewardPopup, 300);
}

// ── Reward popup queue ────────────────────────────────────────
let rewardPopupQueue = [];

function queueRewardPopup(type, data) {
  rewardPopupQueue.push({ type, data });
}

function showNextRewardPopup() {
  if (rewardPopupQueue.length === 0) return;
  const { type, data } = rewardPopupQueue.shift();
  if (type === 'levelup') { showLevelUp(data.ability); return; }
  const titleEl = document.getElementById('rewardPopupTitle');
  const subEl   = document.getElementById('rewardPopupSub');
  const bodyEl  = document.getElementById('rewardPopupBody');
  let rows = '';
  if (type === 'session') {
    titleEl.textContent = t('reward_title');
    subEl.textContent   = t('reward_forge');
    rows += `<div class="reward-popup-row"><span>${t('lbl_experience')}</span><span>+${data.xp} XP</span></div>`;
    rows += `<div class="reward-popup-row"><span>${t('reward_gold')}</span><span>+${data.gold}</span></div>`;
    rows += `<div class="reward-popup-row"><span>${t('lbl_stamina')}</span><span>+${data.stamina}</span></div>`;
    if (data.stats.STR > 0) rows += `<div class="reward-popup-row"><span>${t('lbl_strength')}</span><span>+${data.stats.STR}</span></div>`;
    if (data.stats.DEX > 0) rows += `<div class="reward-popup-row"><span>${t('lbl_dexterity')}</span><span>+${data.stats.DEX}</span></div>`;
    if (data.stats.VIT > 0) rows += `<div class="reward-popup-row"><span>${t('lbl_vitality')}</span><span>+${data.stats.VIT}</span></div>`;
  } else if (type === 'quest') {
    titleEl.textContent = t('reward_weekly_title');
    subEl.textContent   = t('reward_weekly_falls').replace('{boss}', data.boss);
    rows += `<div class="reward-popup-row"><span>${t('reward_bonus_gold')}</span><span>+${data.gold}</span></div>`;
    rows += `<div class="reward-popup-row"><span>${t('reward_bonus_xp')}</span><span>+${data.xp}</span></div>`;
    if (data.streakMult > 1.0) rows += `<div class="reward-popup-row" style="color:var(--gold-light)"><span>${t('reward_streak_bonus')}</span><span>+${Math.round((data.streakMult - 1) * 100)}%</span></div>`;
    rows += `<div class="reward-popup-row"><span>${t('reward_streak')}</span><span>${data.streak} ${t('reward_weeks')}</span></div>`;
  }
  bodyEl.innerHTML = rows;
  document.getElementById('rewardPopup').classList.add('show');
}

export function dismissRewardPopup() {
  document.getElementById('rewardPopup').classList.remove('show');
  setTimeout(showNextRewardPopup, 300);
}

// ── Templates ─────────────────────────────────────────────────
export function saveTemplate() {
  const exercises = gatherExercises();
  if (exercises.length === 0) { toast(t('toast_tpl_no_exercises')); return; }
  showModal(t('modal_save_tpl_title'), t('modal_save_tpl_body'), [
    { label: t('modal_cancel') },
    { label: t('modal_save'), primary: true, onClick(val) {
      const name = val.trim();
      if (!name) { toast(t('toast_tpl_no_name')); return; }
      if (!store.state.savedTemplates) store.state.savedTemplates = [];
      store.state.savedTemplates.push({ name, exercises });
      saveState();
      renderAll();
      toast(t('toast_tpl_saved'));
    }}
  ], true, '');
}

export function loadTemplate() {
  const sel = document.getElementById('templateSelect');
  if (!sel) return;
  const tpl = store.state.savedTemplates[parseInt(sel.value)];
  if (!tpl) return;
  const list = document.getElementById('exerciseList');
  list.innerHTML = '';
  exerciseCounter = 0;
  tpl.exercises.forEach(ex => {
    addExercise();
    const entries = document.querySelectorAll('.exercise-entry');
    const div     = entries[entries.length - 1];
    const nameEl   = div.querySelector('.ex-name');
    const weightEl = div.querySelector('.ex-weight');
    const repsEl   = div.querySelector('.ex-reps');
    const setsEl   = div.querySelector('.ex-sets');
    if (nameEl)   nameEl.value   = ex.name;
    if (weightEl) weightEl.value = ex.weight;
    if (repsEl)   repsEl.value   = ex.reps;
    if (setsEl)   setsEl.value   = ex.sets;
    updateExerciseForm(div);
    updatePreview(div);
  });
  toast(t('toast_tpl_loaded'));
}

export function deleteTemplate() {
  const sel = document.getElementById('templateSelect');
  if (!sel) return;
  const idx = parseInt(sel.value);
  const tpl = store.state.savedTemplates[idx];
  if (!tpl) return;
  showModal(t('modal_del_tpl_title'), t('modal_del_tpl_body'), [
    { label: t('modal_cancel') },
    { label: t('modal_delete_action'), onClick() {
      store.state.savedTemplates.splice(idx, 1);
      saveState();
      renderAll();
      toast(t('toast_tpl_deleted'));
    }}
  ]);
}
