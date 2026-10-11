// The pond in the bottom left.

import { playPeep, playPlop } from "../audio.js";
import { ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { wordAt } from "../effects/particles.js";
import { theme } from "./themes.js";

export function pondInfo() {
  return { x: 120, y: 515, rx: 95, ry: 42 };
}

export function nearPond(x, y, dist) {
  const p = pondInfo();
  const dx = (x - p.x) / (p.rx + dist);
  const dy = (y - p.y) / (p.ry + dist);
  return dx * dx + dy * dy < 1;
}

export function onPondClick(x, y) {
  const p = pondInfo();
  for (let i = 0; i < 14; i++) {
    game.particles.push({ type: "fish", x: p.x + rand(-45, 45), y: p.y + rand(-12, 12), vx: rand(-170, 170), vy: rand(-280, -120), life: 1.3 });
  }
  for (let i = 0; i < 3; i++) {
    game.particles.push({ type: "ring", x: p.x + rand(-40, 40), y: p.y + rand(-15, 15), life: 0.6, color: "#bfe8ff", size: 6 });
  }
  for (let i = 0; i < 8; i++) {
    game.particles.push({ type: "spark", x: p.x + rand(-40, 40), y: p.y, vx: rand(-80, 80), vy: rand(-150, -60), life: 0.5, color: "#bfe8ff", size: rand(2, 3.5) });
  }
  playPlop();
  playPeep();
  wordAt("SPLASH!", x, y - 24);
  if (game.pondCooldown <= 0) {
    game.pondHits++;
    if (game.pondHits >= 5) {
      game.pondHits = 0;
      game.fineMsg = 6;
      game.pondCooldown = 60;
    }
  }
}

export function drawPond() {
  const th = theme();
  const p = pondInfo();
  ctx.fillStyle = th.water;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = th.waterLine;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(p.x - 25, p.y - 8, 18, 5, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(p.x + 30, p.y + 12, 24, 6, 0.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#3e9e4f";
  ctx.beginPath();
  ctx.ellipse(p.x + 45, p.y - 15, 16, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8fb1";
  ctx.beginPath();
  ctx.arc(p.x + 45, p.y - 19, 4, 0, Math.PI * 2);
  ctx.fill();
}
