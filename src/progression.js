// Duckie's XP and level, which are saved between visits, plus the egg tiers they unlock.

import { playLevelUp, playPlop } from "./audio.js";
import { W, ctx } from "./canvas.js";
import { game } from "./state.js";
import { pick, rand } from "./util.js";
import { LOVE_MAX, say } from "./duck/duck.js";

// Duckie gets a little faster with each level, and when they love you more.
const WALK_SPEED = 120;
const EXCITED_SPEED = 175;

// Higher levels unlock fancier eggs: twins, faster hatching, and eventually rainbow babies.
export const TIERS = [
  { name: "classic", minLvl: 1, fill: "#fff8ec", spot: "#ecdfc2", shade: "#d9c9a8", twins: false, fast: 0 },
  { name: "blue", minLvl: 2, fill: "#a8d8ea", spot: "#7fb8d4", shade: "#6fa8c9", twins: false, fast: 1.5 },
  { name: "pink", minLvl: 3, fill: "#ffc2d4", spot: "#f191ad", shade: "#e08aa8", twins: true, fast: 0 },
  { name: "purple", minLvl: 4, fill: "#c3b1e1", spot: "#9d86c9", shade: "#9d86c9", twins: true, fast: 1.5 },
  { name: "rainbow", minLvl: 5, fill: "#fff", spot: null, shade: "#e8890c", twins: true, fast: 2.5 }
];

export const SKINS = {
  classic: { body: "#ffe873", shade: "#d9b616", wing: "#f7d24f" },
  blue: { body: "#a8d8ea", shade: "#6fa8c9", wing: "#8fc4dc" },
  pink: { body: "#ffc2d4", shade: "#e08aa8", wing: "#f7a8c0" },
  purple: { body: "#c3b1e1", shade: "#9d86c9", wing: "#b3a0d9" }
};

// XP needed to get from each level to the next. Level 6 is as high as it goes.
const XP_NEED = [8, 20, 40, 70, 110];

export const save = { xp: 0, level: 1 };

try {
  const savedData = localStorage.getItem("duckieSave");
  if (savedData) Object.assign(save, JSON.parse(savedData));
} catch (err) {}

function persistSave() {
  try {
    localStorage.setItem("duckieSave", JSON.stringify(save));
  } catch (err) {}
}

export function xpNeed() {
  return save.level >= 6 ? 0 : XP_NEED[save.level - 1];
}

export function gainXP(n) {
  save.xp += n;
  while (save.level < 6 && save.xp >= XP_NEED[save.level - 1]) {
    save.xp -= XP_NEED[save.level - 1];
    save.level++;
    celebrateLevel();
  }
  persistSave();
}

export function pickTier() {
  const unlocked = TIERS.filter(t => save.level >= t.minLvl);
  return Math.random() < 0.6 ? unlocked[unlocked.length - 1] : pick(unlocked);
}

export function walkSpeed() {
  return (WALK_SPEED + (save.level - 1) * 6) * (1 + (game.love / LOVE_MAX) * 0.25);
}

export function excitedSpeed() {
  return (EXCITED_SPEED + (save.level - 1) * 8) * (1 + (game.love / LOVE_MAX) * 0.25);
}

function celebrateLevel() {
  const duck = game.duck;
  game.levelBanner = 2.6;
  duck.hop = 0.5;
  duck.happyTimer = 1.5;
  say("LEVEL UP!");
  playLevelUp();
  for (let i = 0; i < 10; i++) {
    game.particles.push({ type: "heart", x: duck.x + rand(-30, 30), y: duck.y - 30 + rand(-20, 10), life: rand(1, 1.5), size: rand(0.9, 1.6) });
  }
  for (let i = 0; i < 14; i++) {
    game.particles.push({
      type: "spark",
      x: duck.x + rand(-40, 40),
      y: duck.y - 30 + rand(-30, 20),
      vx: rand(-90, 90),
      vy: rand(-140, -30),
      life: rand(0.4, 0.9),
      color: pick(["#ffd93d", "#fff8d0", "#ff8fb1", "#a8d8ea"]),
      size: rand(2, 4.5)
    });
  }
}

export function drawLevelBanner() {
  ctx.globalAlpha = Math.min(1, game.levelBanner * 2.5);
  const bounce = 1 + Math.sin(game.time * 8) * 0.06;
  ctx.save();
  ctx.translate(W / 2, 190);
  ctx.scale(bounce, bounce);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 58px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#b8860b";
  ctx.strokeText("LEVEL " + save.level + "!", 0, 0);
  ctx.fillStyle = "#ffd93d";
  ctx.fillText("LEVEL " + save.level + "!", 0, 0);
  ctx.font = "bold 24px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#2e5a1c";
  ctx.strokeText("DUCKIE IS GETTING STRONGER!", 0, 55);
  ctx.fillStyle = "#fff";
  ctx.fillText("DUCKIE IS GETTING STRONGER!", 0, 55);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.globalAlpha = 1;
}

export function tryResetLevel() {
  if (game.resetArm > 0) {
    Object.assign(save, { xp: 0, level: 1 });
    persistSave();
    game.resetArm = 0;
    say("BACK TO LEVEL 1!");
    playPlop();
  } else {
    game.resetArm = 3;
    say("RESET LEVEL? PRESS R AGAIN!");
  }
}

export function updateProgression(dt) {
  if (game.levelBanner > 0) game.levelBanner -= dt;
  if (game.resetArm > 0) game.resetArm -= dt;
}
