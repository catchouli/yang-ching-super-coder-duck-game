// The butterfly Duckie likes to chase.

import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";

export function makeButterfly() {
  return { x: rand(200, W - 200), y: rand(120, H - 200), ang: rand(0, Math.PI * 2), flee: 0 };
}

export function updateButterfly(dt) {
  const b = game.butterfly;
  const speed = b.flee > 0 ? 260 : 55;
  if (b.flee > 0) b.flee -= dt;
  b.ang += rand(-2, 2) * dt;
  if (b.x < 30) b.ang = rand(-0.6, 0.6);
  if (b.x > W - 30) b.ang = Math.PI + rand(-0.6, 0.6);
  if (b.y < 80) b.ang = rand(0.9, 2.2);
  if (b.y > H - 40) b.ang = -rand(0.9, 2.2);
  b.x += Math.cos(b.ang) * speed * dt;
  b.y += Math.sin(b.ang) * speed * dt;
}

export function drawButterfly() {
  const b = game.butterfly;
  const flap = Math.abs(Math.sin(game.time * 18));
  ctx.save();
  ctx.translate(b.x, b.y + Math.sin(game.time * 3) * 3);
  ctx.fillStyle = "#d9b3ff";
  ctx.beginPath();
  ctx.ellipse(-5, 0, 7, 9 * flap + 2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5, 0, 7, 9 * flap + 2, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9c6fd9";
  ctx.beginPath();
  ctx.ellipse(-4, 3, 3.5, 4.5 * flap + 1, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, 3, 3.5, 4.5 * flap + 1, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a4a6a";
  ctx.beginPath();
  ctx.ellipse(0, 0, 2, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a4a6a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(-3, -11);
  ctx.moveTo(0, -6);
  ctx.lineTo(3, -11);
  ctx.stroke();
  ctx.restore();
}

export function onButterflyClick() {
  game.butterfly.ang = rand(0, Math.PI * 2);
  for (let i = 0; i < 6; i++) {
    game.particles.push({ type: "spark", x: game.butterfly.x, y: game.butterfly.y, vx: rand(-70, 70), vy: rand(-70, 70), life: 0.5, color: pick(["#ff8fb1", "#d9b3ff", "#fff"]), size: rand(2, 3.5) });
  }
}
