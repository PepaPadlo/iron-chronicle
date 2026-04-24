// Pure DOM visual effects — no game-state imports needed.

export function triggerSlash(el, isCrit) {
  const s = document.createElement('div');
  s.className = 'slash-effect' + (isCrit ? ' crit' : '');
  el.appendChild(s);
  void s.offsetWidth;
  s.classList.add('show');
  s.addEventListener('animationend', () => s.remove(), { once: true });
}

export function triggerDamageNumber(el, amount, isCrit) {
  const d = document.createElement('div');
  d.className = 'damage-number' + (isCrit ? ' crit' : '');
  d.textContent = amount;
  el.appendChild(d);
  void d.offsetWidth;
  d.classList.add('show');
  d.addEventListener('animationend', () => d.remove(), { once: true });
}

export function triggerShake(el) {
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

export function triggerScreenFlash(type) {
  const el = document.getElementById('screenFlash');
  el.classList.remove('hit', 'crit', 'power', 'iron', 'cry');
  void el.offsetWidth;
  el.classList.add(type);
  el.addEventListener('transitionend', () => el.classList.remove('hit', 'crit', 'power', 'iron', 'cry'), { once: true });
}

export function triggerPowerSlash(bossEl, isCrit) {
  const player = document.getElementById('playerCombatant');

  const c = document.createElement('div');
  c.className = 'power-charge';
  player.appendChild(c);
  void c.offsetWidth;
  c.classList.add('show');
  c.addEventListener('animationend', () => c.remove(), { once: true });

  const s1 = document.createElement('div');
  s1.className = 'slash-effect power' + (isCrit ? ' crit' : '');
  bossEl.appendChild(s1);
  void s1.offsetWidth;
  s1.classList.add('show');
  s1.addEventListener('animationend', () => s1.remove(), { once: true });

  const s2 = document.createElement('div');
  s2.className = 'slash-effect power-2';
  bossEl.appendChild(s2);
  void s2.offsetWidth;
  s2.classList.add('show');
  s2.addEventListener('animationend', () => s2.remove(), { once: true });

  triggerScreenFlash(isCrit ? 'crit' : 'power');
}

export function triggerCrySlash(bossEl, isCrit) {
  const s = document.createElement('div');
  s.className = 'slash-effect cry-attack' + (isCrit ? ' crit' : '');
  bossEl.appendChild(s);
  void s.offsetWidth;
  s.classList.add('show');
  s.addEventListener('animationend', () => s.remove(), { once: true });
}

export function triggerBarrierRipple(playerEl) {
  const r = document.createElement('div');
  r.className = 'barrier-ripple';
  playerEl.appendChild(r);
  void r.offsetWidth;
  r.classList.add('show');
  r.addEventListener('animationend', () => r.remove(), { once: true });

  const f = document.createElement('div');
  f.className = 'iron-flash';
  playerEl.appendChild(f);
  void f.offsetWidth;
  f.classList.add('show');
  f.addEventListener('animationend', () => f.remove(), { once: true });
}

export function triggerIronActivate(playerEl) {
  const f = document.createElement('div');
  f.className = 'iron-flash';
  playerEl.appendChild(f);
  void f.offsetWidth;
  f.classList.add('show');
  f.addEventListener('animationend', () => f.remove(), { once: true });
}

export function triggerCryActivate(playerEl) {
  const b = document.createElement('div');
  b.className = 'cry-burst';
  playerEl.appendChild(b);
  void b.offsetWidth;
  b.classList.add('show');
  b.addEventListener('animationend', () => b.remove(), { once: true });
}
