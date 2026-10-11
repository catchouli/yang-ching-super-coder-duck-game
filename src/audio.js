// Every sound in the game, synthesised on the fly with Web Audio. No sound files needed!

import { game } from "./state.js";
import { rand } from "./util.js";

let actx = null;

// Browsers won't let a page make noise until you've interacted with it, so this gets called on the
// first click or key press.
export function actxInit() {
  if (!actx) {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (err) {
      actx = null;
    }
  }
  if (actx && actx.state === "suspended") actx.resume();
}

function canPlay() {
  return actx && !game.muted;
}

// Plays one note. The pitch can slide from `freq` to `slideTo` over `slideTime` seconds, and the
// volume fades away to nothing over `fade` seconds. `delay` starts it a bit later than right now.
function tone({ wave, freq, slideTo, slideTime, volume, fade, delay = 0, attack = 0, lowpass = 0 }) {
  const t0 = actx.currentTime + delay;
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + slideTime);
  if (attack) {
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + attack);
  } else {
    gain.gain.setValueAtTime(volume, t0);
  }
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + fade);
  let out = osc;
  if (lowpass) {
    const filter = actx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lowpass;
    out = osc.connect(filter);
  }
  out.connect(gain).connect(actx.destination);
  osc.start(t0);
  osc.stop(t0 + fade + 0.05);
}

// A little tune, one note after another.
function melody(notes, gap, volume, fade) {
  notes.forEach((freq, i) => tone({ wave: "triangle", freq, volume, fade, delay: i * gap }));
}

export function playQuack() {
  if (!canPlay()) return;
  tone({ wave: "sawtooth", freq: 330, slideTo: 170, slideTime: 0.13, volume: 0.18, fade: 0.13, attack: 0.02, lowpass: 1000 });
  tone({ wave: "sawtooth", freq: 290, slideTo: 150, slideTime: 0.1, volume: 0.14, fade: 0.1, attack: 0.02, lowpass: 1000, delay: 0.13 });
}

export function playPeep() {
  if (!canPlay()) return;
  tone({ wave: "sawtooth", freq: 700, slideTo: 430, slideTime: 0.09, volume: 0.09, fade: 0.12, lowpass: 1400 });
}

export function playHonk() {
  if (!canPlay()) return;
  tone({ wave: "sawtooth", freq: 520, slideTo: 240, slideTime: 0.22, volume: 0.16, fade: 0.25 });
}

export function playRibbit() {
  if (!canPlay()) return;
  tone({ wave: "square", freq: 180, slideTo: 115, slideTime: 0.13, volume: 0.06, fade: 0.15 });
}

export function playBonk() {
  if (!canPlay()) return;
  tone({ wave: "sine", freq: 110, slideTo: 45, slideTime: 0.25, volume: 0.25, fade: 0.3 });
  tone({ wave: "sawtooth", freq: 240, slideTo: 80, slideTime: 0.35, volume: 0.1, fade: 0.4, delay: 0.2 });
}

export function playPlop() {
  if (!canPlay()) return;
  tone({ wave: "sine", freq: 260, slideTo: 110, slideTime: 0.14, volume: 0.14, fade: 0.16 });
}

export function playWhee() {
  if (!canPlay()) return;
  tone({ wave: "triangle", freq: 320, slideTo: 980, slideTime: 0.6, volume: 0.12, fade: 0.7, attack: 0.15 });
}

export function playBoom() {
  if (!canPlay()) return;
  tone({ wave: "sine", freq: 150, slideTo: 40, slideTime: 0.45, volume: 0.28, fade: 0.5 });
}

// Five quick random clicks, like a firework fizzling out.
export function playCrackle(delay) {
  if (!canPlay()) return;
  for (let i = 0; i < 5; i++) {
    const at = delay + i * 0.12 + rand(0, 0.05);
    tone({ wave: "square", freq: rand(1400, 2600), volume: 0.05, fade: 0.06, delay: at });
  }
}

// A long downward swoop with computery bleeps over the top.
export function playMatrix() {
  if (!canPlay()) return;
  tone({ wave: "sawtooth", freq: 180, slideTo: 35, slideTime: 1.2, volume: 0.14, fade: 1.3 });
  for (let i = 0; i < 8; i++) {
    tone({ wave: "square", freq: rand(900, 2200), volume: 0.04, fade: 0.07, delay: 0.2 + i * 0.14 });
  }
}

export function playJingle() {
  if (!canPlay()) return;
  melody([392, 494, 587], 0.12, 0.12, 0.25);
}

export function playLevelUp() {
  if (!canPlay()) return;
  melody([392, 523, 659, 784], 0.11, 0.14, 0.3);
}

export function playWin() {
  if (!canPlay()) return;
  melody([523, 659, 784, 1047, 784, 1047], 0.13, 0.15, 0.25);
}
