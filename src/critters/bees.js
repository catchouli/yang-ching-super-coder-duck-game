// Bees that buzz between flowers and spread them around.

import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { findFlowerSpot } from "../world/flowers.js";
import { theme } from "../world/themes.js";

export function makeBees() {
  game.bees = [];
  for (let i = 0; i < 2; i++) {
    game.bees.push({ x: rand(100, W - 100), y: rand(120, H - 150), tx: rand(100, W - 100), ty: rand(120, H - 150), state: "wander", timer: rand(1, 3), target: null, wob: rand(0, 6.28), face: 1 });
  }
}

function moveBeeToward(b, tx, ty, speed, dt) {
  const dx = tx - b.x;
  const dy = ty - b.y;
  const d = Math.hypot(dx, dy);
  if (Math.abs(dx) > 1) b.face = dx > 0 ? 1 : -1;
  if (d < 6) return true;
  b.x += (dx / d) * speed * dt;
  b.y += (dy / d) * speed * dt;
  return false;
}

export function updateBees(dt) {
  if (theme().name === "WINTER" || theme().name === "NIGHT") return;
  for (const b of game.bees) {
    if (game.ecoRush > 0 && game.bulldozer) {
      moveBeeToward(b, game.bulldozer.x + rand(-40, 40), game.bulldozer.y - 40, 180, dt);
      continue;
    }
    if (b.state === "wander") {
      b.tx += Math.sin(game.time * 0.8 + b.wob) * 20 * dt;
      b.ty += Math.cos(game.time * 0.7 + b.wob) * 14 * dt;
      moveBeeToward(b, b.tx, b.ty, 55, dt);
      b.timer -= dt;
      if (b.timer <= 0) {
        b.timer = rand(2, 4);
        const bloomed = game.flowers.filter(f => f.grow >= 1);
        if (bloomed.length && Math.random() < 0.8) {
          b.target = pick(bloomed);
          b.state = "toFlower";
        } else {
          b.tx = rand(80, W - 80);
          b.ty = rand(110, H - 120);
        }
      }
    } else if (b.state === "toFlower") {
      if (!game.flowers.includes(b.target) || b.target.grow < 1) {
        b.state = "wander";
        b.target = null;
        b.timer = 0.5;
        continue;
      }
      const f = b.target;
      const tx = f.x + Math.sin(game.time * 1.5 + f.phase) * (f.grow * 2);
      const ty = f.y - (6 + f.grow * 20) - 4;
      if (moveBeeToward(b, tx, ty, 85, dt)) {
        b.state = "sit";
        b.timer = 2.5;
      }
    } else {
      if (!game.flowers.includes(b.target)) {
        b.state = "wander";
        b.target = null;
        b.timer = 0.5;
        continue;
      }
      b.timer -= dt;
      const f = b.target;
      b.x = f.x + Math.sin(game.time * 1.5 + f.phase) * f.grow * 2 + Math.sin(game.time * 6 + b.wob) * 2;
      b.y = f.y - (6 + f.grow * 20) - 4 + Math.sin(game.time * 20 + b.wob) * 1.5;
      if (b.timer <= 0) {
        f.puff = 0.9;
        if (Math.random() < 0.6 && game.flowers.length < 11) {
          const spot = findFlowerSpot();
          game.flowers.push({ x: spot.x, y: spot.y, petal: pick(["#ff8fb1", "#ffffff", "#ffd6e8", "#d9b3ff"]), grow: 0, puff: 0, phase: rand(0, 6.28) });
        }
        b.state = "wander";
        b.timer = rand(1.5, 3);
        b.tx = rand(80, W - 80);
        b.ty = rand(110, H - 120);
      }
    }
  }
}

export function drawBees() {
  if (theme().name === "WINTER" || theme().name === "NIGHT") return;
  for (const b of game.bees) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(b.face || 1, 1);
    const wing = Math.abs(Math.sin(game.time * 45 + b.wob));
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(-1, -5, 3.5, 4.5 * wing + 1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1.5, -4.5, 3, 3.8 * wing + 1, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd93d";
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b2b2b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-1.5, -4);
    ctx.lineTo(-1.5, 4);
    ctx.moveTo(1.8, -3.8);
    ctx.lineTo(1.8, 3.8);
    ctx.stroke();
    ctx.fillStyle = "#2b2b2b";
    ctx.beginPath();
    ctx.arc(5.2, -1, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-9, -1.5);
    ctx.lineTo(-9, 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
