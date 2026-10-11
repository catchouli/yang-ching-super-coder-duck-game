// Flowers that grow, get pollinated by bees and can be picked and given to Duckie.

import { playQuack } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { LOVE_MAX, say } from "../duck/duck.js";
import { logCollide } from "./logs.js";
import { nearPond } from "./pond.js";
import { theme } from "./themes.js";

export function findFlowerSpot() {
  for (let t = 0; t < 100; t++) {
    const x = rand(50, W - 50);
    const y = rand(170, H - 30);
    if (nearPond(x, y, 12)) continue;
    let bad = false;
    for (const log of game.logs) {
      if (logCollide(x, y, log, 10)) bad = true;
    }
    if (bad) continue;
    return { x, y };
  }
  return { x: rand(50, W - 50), y: rand(170, H - 30) };
}

export function makeFlowers() {
  game.flowers = [];
  for (let i = 0; i < 8; i++) {
    const spot = findFlowerSpot();
    game.flowers.push({ x: spot.x, y: spot.y, petal: pick(["#ff8fb1", "#ffffff", "#ffd6e8", "#d9b3ff"]), grow: rand(0.2, 1), puff: 0, phase: rand(0, 6.28) });
  }
}

export function updateFlowers(dt) {
  const dormant = theme().name === "WINTER" || theme().name === "NIGHT";
  for (const f of game.flowers) {
    if (f.puff > 0) f.puff -= dt;
    if (!dormant && f.grow < 1) f.grow = Math.min(1, f.grow + dt * rand(0.12, 0.2));
  }
  if (!dormant) {
    game.flowerSeedTimer -= dt;
    if (game.flowerSeedTimer <= 0 && game.flowers.length < 11) {
      game.flowerSeedTimer = rand(8, 15);
      const spot = findFlowerSpot();
      game.flowers.push({ x: spot.x, y: spot.y, petal: pick(["#ff8fb1", "#ffffff", "#ffd6e8", "#d9b3ff"]), grow: 0, puff: 0, phase: rand(0, 6.28) });
    }
  }
}

export function giveFlower() {
  const duck = game.duck;
  game.love = Math.min(LOVE_MAX, game.love + 1);
  game.loveShow = 4;
  duck.hop = 0.5;
  duck.happyTimer = 1.5;
  say(pick(["FOR ME?!", "FLOWERS!!", "SO SWEET!", "THANK YOU!"]));
  playQuack();
  for (let i = 0; i < 5; i++) {
    game.particles.push({ type: "heart", x: duck.x + rand(-16, 16), y: duck.y - 30, life: rand(0.9, 1.3), size: rand(0.8, 1.4) });
  }
}

// The fully grown flower under the cursor, if there is one.
export function flowerAt(x, y) {
  for (const f of game.flowers) {
    if (f.grow < 0.85) continue;
    const h = 6 + f.grow * 20;
    const sway = Math.sin(game.time * 1.5 + f.phase) * f.grow * 2;
    if (Math.hypot(x - (f.x + sway), y - (f.y - h)) < 22) return f;
  }
  return null;
}

export function drawPickedFlower() {
  if (!game.pickedFlower) return;
  const f = game.pickedFlower.f;
  const x = game.pickedFlower.x;
  const y = game.pickedFlower.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(game.time * 3) * 0.1);
  ctx.strokeStyle = "#3e7a2e";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.fillStyle = "#4c9a3d";
  ctx.beginPath();
  ctx.ellipse(-4, 8, 4, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = f.petal;
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + 0.3 + game.time;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 5, Math.sin(a) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ffd93d";
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Flowers are dormant in winter and at night, so they disappear until the next stage.
export function drawFlowers() {
  if (theme().name === "WINTER" || theme().name === "NIGHT") return;
  for (const f of game.flowers) {
    const g = f.grow;
    const h = 6 + g * 20;
    const sway = Math.sin(game.time * 1.5 + f.phase) * g * 2;
    const topX = f.x + sway;
    const topY = f.y - h;
    ctx.strokeStyle = "#3e7a2e";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.quadraticCurveTo(f.x + sway * 0.5, f.y - h * 0.5, topX, topY);
    ctx.stroke();
    if (g > 0.35) {
      ctx.fillStyle = "#4c9a3d";
      const lx = f.x + (topX - f.x) * 0.55;
      const ly = f.y - h * 0.55;
      const ls = Math.min(1, g * 1.6);
      ctx.beginPath();
      ctx.ellipse(lx - 4, ly, 4 * ls, 2, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(lx + 4, ly - 3, 4 * ls, 2, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (g < 0.55) {
      ctx.fillStyle = "#4c9a3d";
      ctx.beginPath();
      ctx.arc(topX, topY, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const ps = Math.min(1, (g - 0.55) / 0.45);
      ctx.fillStyle = f.petal;
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 + 0.3;
        ctx.beginPath();
        ctx.arc(topX + Math.cos(a) * 5 * ps, topY + Math.sin(a) * 5 * ps, 4 * ps, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath();
      ctx.arc(topX, topY, 3.5 * ps, 0, Math.PI * 2);
      ctx.fill();
      if (f.puff > 0) {
        ctx.globalAlpha = Math.max(0, f.puff);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(topX, topY, 8 + (0.9 - f.puff) * 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
}
