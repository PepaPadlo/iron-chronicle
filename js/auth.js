import { store }          from './store.js';
import { STORAGE_KEY }    from './data.js';
import { defaultState, saveState, migrateItems, migrateWeek, loadState, registerCloudPush } from './state.js';
import { generateShopStock } from './items.js';
import { t }               from './i18n.js';
import { renderAll }       from './render.js';
import { toast, showModal, closeModal } from './ui.js';

const SUPABASE_URL = 'https://omkpatswcwqtqwbrblyw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ta3BhdHN3Y3dxdHF3YnJibHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDMzOTUsImV4cCI6MjA5MjUxOTM5NX0.OeKucVxzyHWdg3qjAnW7RXEp8-vWL_g1rS4P4XPRang';

let sbClient    = null;
let currentUser = null;

export function getCurrentUser() { return currentUser; }
export function getSbClient()    { return sbClient; }

function _nameToEmail(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + '@ironchronicle.game';
}

// ── Init ──────────────────────────────────────────────────────
export function initAuth(hasLocalSave) {
  try {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.error('Supabase init failed', e);
  }
  registerCloudPush(pushCloudSave);

  if (!sbClient) {
    if (!hasLocalSave) showWelcomeScreen();
    else if (!store.state.tutorialDone) _startTutorial();
    return;
  }

  sbClient.auth.getSession().then(({ data: { session } }) => {
    currentUser = session?.user ?? null;
    renderAuthUI();
    if (currentUser) {
      loadCloudSave().then(cloudState => {
        if (cloudState) {
          store.state = cloudState;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state));
          renderAll();
        }
        document.getElementById('welcomeScreen').classList.remove('show');
        if (!store.state.tutorialDone) _startTutorial();
      });
    } else if (!hasLocalSave) {
      showWelcomeScreen();
    } else {
      if (!store.state.tutorialDone) _startTutorial();
    }
  });

  sbClient.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user ?? null;
    renderAuthUI();
    if (event === 'SIGNED_IN') {
      loadCloudSave().then(cloudState => {
        if (cloudState) {
          store.state = cloudState;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state));
          renderAll();
          toast(t('toast_cloud_loaded'));
        } else {
          pushCloudSave();
          toast(t('toast_signed_in'));
        }
        dismissWelcomeScreen();
      });
    }
  });
}

// Lazy — avoids circular dep with tutorial.js at module eval time
function _startTutorial() {
  if (window._ironStartTutorial) window._ironStartTutorial();
}

// ── Auth UI ───────────────────────────────────────────────────
export function renderAuthUI() {
  const delBtn    = document.getElementById('btnDeleteAccount');
  const headerAuth = document.getElementById('headerAuth');
  const st        = document.getElementById('saveStatusText');
  if (currentUser) {
    const displayName = currentUser.email.replace(/@ironchronicle\.game$/, '');
    if (st)         st.textContent = t('save_cloud');
    if (delBtn)     delBtn.style.display = '';
    if (headerAuth) headerAuth.innerHTML =
      `<button onclick="window._ironManualSync()" style="background:none;border:none;color:var(--text-dim);font-size:11px;cursor:pointer;font-family:'Cinzel',serif;letter-spacing:1px;padding:4px 4px 4px 0;">${t('btn_sync')}</button>` +
      `<span style="color:var(--border-gold);font-size:11px;"> | </span>` +
      `<button onclick="window._ironSignOut()" style="background:none;border:none;color:var(--text-dim);font-size:11px;cursor:pointer;font-family:'Cinzel',serif;letter-spacing:1px;padding:4px 0;">${displayName} · ${t('btn_sign_out')}</button>`;
  } else {
    if (st)         st.textContent = t('save_local');
    if (delBtn)     delBtn.style.display = 'none';
    if (headerAuth) headerAuth.innerHTML =
      `<button onclick="window._ironShowSignIn()" style="background:none;border:none;color:var(--text-dim);font-size:11px;cursor:pointer;font-family:'Cinzel',serif;letter-spacing:1px;padding:4px 0;">${t('btn_sign_in')}</button>`;
  }
}

// ── Sign-in modal ─────────────────────────────────────────────
export function showSignInModal() {
  document.getElementById('modalTitle').textContent = t('modal_signin_title');
  document.getElementById('modalText').innerHTML =
    `<div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">` +
    `<input id="authName" type="text" placeholder="Character Name" autocomplete="username" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:7px 10px;font-size:14px;border-radius:2px;font-family:'Crimson Text',Georgia,serif;">` +
    `<input id="authPass" type="password" placeholder="Password (min. 6 characters)" autocomplete="current-password" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:7px 10px;font-size:14px;border-radius:2px;font-family:'Crimson Text',Georgia,serif;">` +
    `</div>`;
  document.getElementById('modalInput').style.display = 'none';
  const actionsEl = document.getElementById('modalActions');
  actionsEl.innerHTML = '';
  [
    { label: t('modal_cancel') },
    { label: t('btn_sign_in'), onClick: authSignIn },
    { label: t('btn_create_account'), onClick: authSignUp, primary: true },
  ].forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (a.primary ? 'btn-primary' : 'btn-ghost');
    btn.textContent = a.label;
    btn.addEventListener('click', () => { if (a.onClick) a.onClick(); else closeModal(); });
    actionsEl.appendChild(btn);
  });
  document.getElementById('modalBackdrop').classList.add('show');
}

// ── Cloud save ────────────────────────────────────────────────
export async function loadCloudSave() {
  if (!sbClient || !currentUser) return null;
  try {
    const { data, error } = await sbClient.from('player_saves')
      .select('state').eq('user_id', currentUser.id).single();
    if (error || !data) return null;
    const s = data.state;
    if (s && typeof s === 'object') {
      const def = defaultState();
      for (const k in def) if (!(k in s)) s[k] = def[k];
      return migrateItems(migrateWeek(s));
    }
  } catch (e) { console.error('Cloud load failed', e); }
  return null;
}

export async function pushCloudSave() {
  if (!sbClient || !currentUser) return;
  try {
    await sbClient.from('player_saves').upsert(
      { user_id: currentUser.id, state: store.state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  } catch (e) { console.error('Cloud save failed', e); }
}

// ── Auth actions ──────────────────────────────────────────────
export async function authSignIn() {
  const name = document.getElementById('authName')?.value?.trim();
  const pass = document.getElementById('authPass')?.value;
  if (!name || !pass) { toast(t('toast_enter_credentials')); return; }
  const { error } = await sbClient.auth.signInWithPassword({ email: _nameToEmail(name), password: pass });
  if (error) { toast(t('toast_signin_fail') + error.message); return; }
  closeModal();
}

export async function authSignUp() {
  const name = document.getElementById('authName')?.value?.trim();
  const pass = document.getElementById('authPass')?.value;
  if (!name || !pass) { toast(t('toast_enter_credentials')); return; }
  if (pass.length < 6) { toast(t('toast_pass_short')); return; }
  if (!_nameToEmail(name).split('@')[0]) { toast(t('toast_invalid_name')); return; }
  const { error } = await sbClient.auth.signUp({ email: _nameToEmail(name), password: pass });
  if (error) {
    toast(error.message.includes('already') ? t('toast_name_taken') : t('toast_signup_fail') + error.message);
    return;
  }
  store.state.name = name;
  saveState();
  closeModal();
  toast(t('toast_created'));
}

export async function authSignOut() {
  await sbClient.auth.signOut();
  toast(t('toast_signed_out'));
}

export async function manualCloudSync() {
  await pushCloudSave();
  toast(t('toast_synced'));
}

export function confirmDeleteAccount() {
  showModal(t('modal_del_acc_title'), t('modal_del_acc_body'), [
    { label: t('modal_cancel') },
    { label: t('modal_delete_forever'), async onClick() {
      try {
        await sbClient.from('player_saves').delete().eq('user_id', currentUser.id);
        await sbClient.rpc('delete_own_account');
        await sbClient.auth.signOut();
      } catch (e) { console.error('Delete account failed', e); }
      localStorage.removeItem(STORAGE_KEY);
      store.state = defaultState();
      store.state.shopStock = generateShopStock();
      renderAll();
      showWelcomeScreen();
      toast(t('toast_account_deleted'));
    }}
  ]);
}

// ── Welcome screen ────────────────────────────────────────────
export function showWelcomeScreen() {
  document.getElementById('welcomeChoose').style.display = 'block';
  document.getElementById('welcomeAuth').style.display   = 'none';
  document.getElementById('welcomeScreen').classList.add('show');
}

export function dismissWelcomeScreen() {
  document.getElementById('welcomeScreen').classList.remove('show');
  if (!store.state.tutorialDone) _startTutorial();
}

export function welcomePlayLocal() {
  dismissWelcomeScreen();
}

export function welcomeShowAuth() {
  document.getElementById('welcomeChoose').style.display = 'none';
  document.getElementById('welcomeAuth').style.display   = 'block';
}

export function welcomeBack() {
  document.getElementById('welcomeAuth').style.display   = 'none';
  document.getElementById('welcomeChoose').style.display = 'block';
}

export async function welcomeSignIn() {
  const name = document.getElementById('welcomeName')?.value?.trim();
  const pass = document.getElementById('welcomePass')?.value;
  if (!name || !pass) { toast(t('toast_enter_credentials')); return; }
  const { error } = await sbClient.auth.signInWithPassword({ email: _nameToEmail(name), password: pass });
  if (error) toast(t('toast_signin_fail') + error.message);
}

export async function welcomeSignUp() {
  const name = document.getElementById('welcomeName')?.value?.trim();
  const pass = document.getElementById('welcomePass')?.value;
  if (!name || !pass) { toast(t('toast_enter_credentials')); return; }
  if (pass.length < 6) { toast(t('toast_pass_short')); return; }
  if (!_nameToEmail(name).split('@')[0]) { toast(t('toast_invalid_name')); return; }
  const { error } = await sbClient.auth.signUp({ email: _nameToEmail(name), password: pass });
  if (error) {
    toast(error.message.includes('already') ? t('toast_name_taken') : t('toast_signup_fail') + error.message);
    return;
  }
  store.state.name = name;
  saveState();
  toast(t('toast_created'));
}
