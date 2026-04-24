import { store }          from './store.js';
import { STORAGE_KEY }    from './data.js';
import { defaultState, saveState, migrateWeek } from './state.js';
import { generateShopStock } from './items.js';
import { t }               from './i18n.js';
import { renderAll }       from './render.js';

// ── Toast ─────────────────────────────────────────────────────
let _toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ── Modal ─────────────────────────────────────────────────────
export function showModal(title, text, actions, withInput, inputValue) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalText').innerHTML = text;
  const input = document.getElementById('modalInput');
  input.style.display = withInput ? 'block' : 'none';
  input.value = inputValue || '';
  const actionsEl = document.getElementById('modalActions');
  actionsEl.innerHTML = '';
  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (a.primary ? 'btn-primary' : 'btn-ghost');
    btn.textContent = a.label;
    btn.addEventListener('click', () => {
      if (a.onClick) a.onClick(input.value);
      closeModal();
    });
    actionsEl.appendChild(btn);
  });
  document.getElementById('modalBackdrop').classList.add('show');
}

export function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('show');
}

// ── Data actions ──────────────────────────────────────────────
export function exportData() {
  showModal(t('modal_export_title'), t('modal_export_body'),
    [{ label: t('modal_close') }], true, JSON.stringify(store.state));
}

export function importData() {
  showModal(t('modal_import_title'), t('modal_import_body'), [
    { label: t('modal_cancel') },
    { label: t('modal_import_action'), primary: true, onClick(val) {
      try {
        const imported = JSON.parse(val);
        if (imported && typeof imported === 'object') {
          store.state = migrateWeek(imported);
          saveState();
          renderAll();
          toast(t('toast_imported'));
        } else {
          toast(t('toast_invalid'));
        }
      } catch {
        toast(t('toast_invalid_save'));
      }
    }}
  ], true);
}

export function confirmReset() {
  showModal(t('modal_reset_title'), t('modal_reset_body'), [
    { label: t('modal_cancel') },
    { label: t('modal_reset_all'), onClick() {
      localStorage.removeItem(STORAGE_KEY);
      store.state = defaultState();
      store.state.shopStock = generateShopStock();
      renderAll();
      toast(t('toast_reset'));
      // re-show welcome screen via auth module — imported lazily to avoid circular dep
      const showWelcome = window._ironShowWelcome;
      if (showWelcome) showWelcome();
    }}
  ]);
}

export function forceReload() {
  window.location.replace(location.pathname + '?v=' + Date.now());
}
