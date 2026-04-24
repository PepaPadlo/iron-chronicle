import { store } from './store.js';

let _audioCtx = null;

function _getAudioCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

export function playSound(name) {
  if (store.state && store.state.soundMuted) return;
  const ctx = _getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  switch (name) {
    case 'hit': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
      g.gain.setValueAtTime(0.4, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.15);
      break;
    }
    case 'crit': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(60, t);
      o.frequency.exponentialRampToValueAtTime(220, t + 0.05);
      o.frequency.exponentialRampToValueAtTime(80, t + 0.3);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.35);
      break;
    }
    case 'bossHit': {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(80, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
      f.type = 'lowpass'; f.frequency.value = 200;
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.3);
      break;
    }
    case 'victory': {
      const od = ctx.createOscillator(), gd = ctx.createGain();
      od.type = 'sine';
      od.frequency.setValueAtTime(80, t);
      od.frequency.exponentialRampToValueAtTime(30, t + 0.3);
      gd.gain.setValueAtTime(0.5, t);
      gd.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      od.connect(gd); gd.connect(ctx.destination);
      od.start(t); od.stop(t + 0.35);
      [110, 165, 220].forEach((freq, i) => {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        const s = t + 0.3 + i * 0.35, hold = i === 2 ? 1.2 : 0.65;
        o.type = 'sawtooth'; o.frequency.value = freq;
        f.type = 'lowpass'; f.frequency.value = 600; f.Q.value = 1;
        g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.35, s + 0.07);
        g.gain.setValueAtTime(0.35, s + 0.2); g.gain.exponentialRampToValueAtTime(0.001, s + hold);
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        o.start(s); o.stop(s + hold + 0.05);
      });
      break;
    }
    case 'defeat': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(380, t);
      o.frequency.exponentialRampToValueAtTime(90, t + 0.9);
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 1.0);
      break;
    }
    case 'levelup': {
      [165, 247, 330, 392].forEach((freq, i) => {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        const s = t + i * 0.25;
        o.type = 'sawtooth'; o.frequency.value = freq;
        f.type = 'lowpass'; f.frequency.value = 700; f.Q.value = 1;
        g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.3, s + 0.05);
        g.gain.setValueAtTime(0.3, s + 0.18); g.gain.exponentialRampToValueAtTime(0.001, s + 0.65);
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        o.start(s); o.stop(s + 0.7);
      });
      break;
    }
    case 'gold': {
      const o1 = ctx.createOscillator(), g1 = ctx.createGain();
      o1.type = 'sine'; o1.frequency.value = 180;
      g1.gain.setValueAtTime(0, t); g1.gain.linearRampToValueAtTime(0.45, t + 0.008);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      o1.connect(g1); g1.connect(ctx.destination); o1.start(t); o1.stop(t + 1.8);

      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = 468;
      g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(0.2, t + 0.006);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      o2.connect(g2); g2.connect(ctx.destination); o2.start(t); o2.stop(t + 0.9);

      const o3 = ctx.createOscillator(), g3 = ctx.createGain();
      o3.type = 'sine'; o3.frequency.value = 1200;
      g3.gain.setValueAtTime(0.15, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      o3.connect(g3); g3.connect(ctx.destination); o3.start(t); o3.stop(t + 0.05);
      break;
    }
  }
}
