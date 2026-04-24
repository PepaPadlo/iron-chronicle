import { store }          from './store.js';
import { CONFIG }          from './config.js';
import { STORAGE_KEY }     from './data.js';
import { loadState, saveState, parseWeight } from './state.js';
import { TIERS, RARE_SELL_MULT } from './data.js';
import { generateShopStock } from './items.js';
import { t }               from './i18n.js';
import { renderAll, switchTab, hideGearTooltip } from './render.js';
import { enterDungeon, exitCombat, setToast, setItemHelpers } from './combat.js';
import { addExercise, logWorkout, saveTemplate, loadTemplate, deleteTemplate,
         showLevelUp, dismissLevelUp, dismissRewardPopup } from './training.js';
import { toast, showModal, closeModal, exportData, importData, confirmReset, forceReload } from './ui.js';
import { initAuth, renderAuthUI, showWelcomeScreen, showSignInModal,
         welcomePlayLocal, welcomeShowAuth, welcomeBack, welcomeSignIn, welcomeSignUp,
         manualCloudSync, authSignOut, confirmDeleteAccount } from './auth.js';
import { startTutorial, pickTutorialLang, nextTutorialStep, skipTutorial, endTutorial } from './tutorial.js';
import { itemSpriteHtml, formatItemStats } from './items.js';

// ── Wire lazy registrations ───────────────────────────────────
setToast(toast);
setItemHelpers({ itemSpriteHtml, formatItemStats });

// ── Item actions (small — live here, called via event delegation) ──
function buyItem(idx) {
  const item = store.state.shopStock[idx];
  if (!item) return;
  const tier = TIERS.find(t => t.tier === item.tier);
  if (store.state.gold < tier.shopPrice) { toast('Not enough gold.'); return; }
  if (store.state.level < item.levelReq) { toast('Requires level ' + item.levelReq + '.'); return; }
  store.state.gold -= tier.shopPrice;
  store.state.inventory.push(item);
  store.state.shopStock.splice(idx, 1);
  saveState();
  renderAll();
  toast('Purchased ' + item.name + '.');
}

function equipItem(itemId) {
  const idx = store.state.inventory.findIndex(i => i.id === itemId);
  if (idx < 0) return;
  const item = store.state.inventory[idx];
  if (store.state.level < item.levelReq) { toast('Requires level ' + item.levelReq + '.'); return; }
  let targetSlot = item.slotId;
  if (item.slotId === 'ring1' || item.slotId === 'ring2') {
    if (!store.state.equipped.ring1) targetSlot = 'ring1';
    else if (!store.state.equipped.ring2) targetSlot = 'ring2';
    else targetSlot = 'ring1';
  }
  item.slotId = targetSlot;
  const current = store.state.equipped[targetSlot];
  store.state.inventory.splice(idx, 1);
  if (current) store.state.inventory.push(current);
  store.state.equipped[targetSlot] = item;
  saveState();
  renderAll();
}

function unequipItem(slotId) {
  const item = store.state.equipped[slotId];
  if (!item) return;
  store.state.inventory.push(item);
  delete store.state.equipped[slotId];
  saveState();
  renderAll();
}

function sellItem(itemId) {
  const idx = store.state.inventory.findIndex(i => i.id === itemId);
  if (idx < 0) return;
  const item  = store.state.inventory[idx];
  const tier  = TIERS.find(t => t.tier === item.tier);
  const price = item.rare ? tier.sellPrice * RARE_SELL_MULT : tier.sellPrice;
  store.state.gold += price;
  store.state.inventory.splice(idx, 1);
  saveState();
  renderAll();
  toast('Sold for ' + price + ' gold.');
}

function refreshShop() {
  store.state.shopStock = generateShopStock();
  saveState();
  renderAll();
  toast(t('toast_shop_refresh'));
}

// ── Event delegation ──────────────────────────────────────────
function setupEventDelegation() {
  // Tab bar
  document.getElementById('tabBar').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab && tab.dataset.tab) switchTab(tab.dataset.tab);
  });

  // Dungeon list — enter
  document.getElementById('dungeonList').addEventListener('click', e => {
    const btn = e.target.closest('[data-enter-level]');
    if (btn) enterDungeon(parseInt(btn.dataset.enterLevel));
  });

  // Inventory — equip / sell
  document.getElementById('inventoryList').addEventListener('click', e => {
    const equip = e.target.closest('[data-equip]');
    if (equip) { equipItem(equip.dataset.equip); return; }
    const sell = e.target.closest('[data-sell]');
    if (sell) sellItem(sell.dataset.sell);
  });

  // Shop — buy
  document.getElementById('shopList').addEventListener('click', e => {
    const btn = e.target.closest('[data-buy]');
    if (btn) buyItem(parseInt(btn.dataset.buy));
  });

  // Gear grid — unequip
  document.getElementById('equipGrid').addEventListener('click', e => {
    const slot = e.target.closest('[data-unequip]');
    if (slot) unequipItem(slot.dataset.unequip);
  });

  // Language switcher
  document.getElementById('langSwitcher').addEventListener('click', e => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    store.state.tutorialLang = btn.dataset.lang;
    saveState();
    renderAll();
  });

  // Global touch — hide tooltip
  document.addEventListener('touchstart', () => hideGearTooltip(), { passive: true });
}

// ── Init ──────────────────────────────────────────────────────
function init() {
  try {
    const hasLocalSave = !!localStorage.getItem(STORAGE_KEY);
    store.state = loadState();

    if (!store.state.shopStock || store.state.shopStock.length === 0) {
      store.state.shopStock = generateShopStock();
    }

    document.getElementById('gameVersion').textContent = 'v0.21 · 2026-04-24';

    // Static button listeners
    document.getElementById('btnAddExercise').addEventListener('click', addExercise);
    document.getElementById('btnLogWorkout').addEventListener('click', logWorkout);
    document.getElementById('btnSaveTemplate').addEventListener('click', saveTemplate);
    document.getElementById('btnLoadTemplate').addEventListener('click', loadTemplate);
    document.getElementById('btnDeleteTemplate').addEventListener('click', deleteTemplate);
    document.getElementById('btnExport').addEventListener('click', exportData);
    document.getElementById('btnImport').addEventListener('click', importData);
    document.getElementById('btnForceReload').addEventListener('click', forceReload);
    document.getElementById('btnReset').addEventListener('click', confirmReset);
    document.getElementById('btnDeleteAccount').addEventListener('click', confirmDeleteAccount);
    document.getElementById('btnDismissLevelUp').addEventListener('click', dismissLevelUp);
    document.getElementById('btnDismissReward').addEventListener('click', dismissRewardPopup);
    document.getElementById('btnRefreshShop').addEventListener('click', refreshShop);
    document.getElementById('modalBackdrop').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Sound toggle
    const soundBtn = document.getElementById('btnSoundToggle');
    soundBtn.textContent = t(store.state.soundMuted ? 'btn_sound_off' : 'btn_sound_on');
    soundBtn.addEventListener('click', () => {
      store.state.soundMuted = !store.state.soundMuted;
      soundBtn.textContent = t(store.state.soundMuted ? 'btn_sound_off' : 'btn_sound_on');
      saveState();
    });

    // Body weight
    const bwInput = document.getElementById('bodyWeightInput');
    if (bwInput) {
      bwInput.value = store.state.bodyWeight || 75;
      bwInput.addEventListener('change', () => {
        store.state.bodyWeight = parseFloat(bwInput.value) || 75;
        saveState();
      });
    }

    // Tutorial buttons
    document.getElementById('tutNextBtn')?.addEventListener('click', nextTutorialStep);
    document.getElementById('tutSkipBtn')?.addEventListener('click', skipTutorial);

    setupEventDelegation();
    addExercise();
    renderAll();
    renderAuthUI();
    saveState();

    // Expose window functions required by inline HTML onclick attributes
    window._ironShowWelcome  = showWelcomeScreen;
    window._ironStartTutorial = startTutorial;
    window._ironManualSync   = manualCloudSync;
    window._ironSignOut      = authSignOut;
    window._ironShowSignIn   = showSignInModal;

    // Also expose for legacy onclick= attributes in HTML that can't be easily changed
    window.pickTutorialLang   = pickTutorialLang;
    window.welcomePlayLocal   = welcomePlayLocal;
    window.welcomeShowAuth    = welcomeShowAuth;
    window.welcomeBack        = welcomeBack;
    window.welcomeSignIn      = welcomeSignIn;
    window.welcomeSignUp      = welcomeSignUp;
    window.exitCombat         = exitCombat;

    initAuth(hasLocalSave);
  } catch (e) {
    document.body.innerHTML =
      `<div style="padding:20px;color:#e8b84b;font-family:monospace;background:#0a0805;min-height:100vh;">` +
      `<h2 style="margin-bottom:12px;">Error loading Iron Chronicle</h2>` +
      `<pre style="font-size:12px;color:#c04040;white-space:pre-wrap;">${e.message}</pre>` +
      `<p style="margin-top:12px;color:#7a6a50;">Please screenshot this and report it.</p></div>`;
  }
}

// Module scripts are deferred by default — DOM is ready
init();
