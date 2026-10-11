// Logs that roll slowly down the field and trip Duckie up.

import { playPeep } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { roundRectPath } from "../draw/shapes.js";
import { wordAt } from "../effects/particles.js";

export function logCollide(x, y, log, pad) {
  const dx = (x - log.x) / (log.rx + pad);
  const dy = (y - log.y) / (log.ry + pad);
  return dx * dx + dy * dy <= 1;
}

export function placeLogs() {
  game.logs = [];
  const count = 5;
  const xs = [];
  for (let i = 0; i < count; i++) {
    let x = rand(120, W - 120);
    for (let t = 0; t < 80; t++) {
      x = rand(120, W - 120);
      if (xs.every(o => Math.abs(o - x) > 105)) break;
    }
    xs.push(x);
    game.logs.push({
      x,
      y: -70 + i * ((H + 180) / count) + rand(-40, 40),
      rx: rand(48, 64),
      ry: 26,
      v: rand(11, 20),
      roll: rand(0, 6.28),
      tilt: rand(-0.06, 0.06),
      rings: Math.floor(rand(2, 5))
    });
  }
}

export function updateLogs(dt) {
  for (const log of game.logs) {
    log.y += log.v * dt;
    log.roll += (log.v * dt) / 22;
    if (log.y - log.ry > H + 40) {
      log.y = -log.ry - rand(30, 160);
      let x = rand(120, W - 120);
      for (let t = 0; t < 30 && Math.abs(x - game.duck.x) < 140; t++) {
        x = rand(120, W - 120);
      }
      log.x = x;
      log.v = rand(11, 20);
      log.roll = rand(0, 6.28);
      log.tilt = rand(-0.06, 0.06);
    }
  }
}

export function drawLogs() {
  for (const log of game.logs) {
    ctx.save();
    ctx.translate(log.x, log.y);
    ctx.rotate(log.tilt);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(0, log.ry + 10, log.rx + 4, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8b5a2b";
    roundRectPath(-log.rx, -log.ry, log.rx * 2, log.ry * 2, log.ry * 0.8);
    ctx.fill();
    ctx.strokeStyle = "#6b4420";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.strokeStyle = "#74491f";
    ctx.lineWidth = 2;
    for (let i = 0; i < log.rings; i++) {
      const yy = -log.ry + 8 + i * ((log.ry * 2 - 16) / Math.max(1, log.rings - 1));
      const span = log.rx * 2 - 50;
      const dashX = -log.rx + 25 + ((((log.roll * 20 + i * 57) % span) + span) % span);
      ctx.beginPath();
      ctx.moveTo(dashX - 11, yy);
      ctx.lineTo(dashX + 11, yy);
      ctx.stroke();
    }
    ctx.fillStyle = "#c89b6a";
    ctx.beginPath();
    ctx.ellipse(log.rx - 14, 0, 10, log.ry - 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "#9c7146";
    ctx.beginPath();
    ctx.ellipse(log.rx - 14, 0, 5, log.ry * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(log.rx - 14, 0, 2, log.ry * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(log.rx - 14, 0);
    ctx.rotate(log.roll);
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -log.ry * 0.55);
    ctx.lineTo(0, log.ry * 0.55);
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
}

export function onLogClick(log) {
  log.v = 520;
  wordAt("ZOOM!", log.x, log.y - 40);
  playPeep();
  for (let i = 0; i < 6; i++) {
    game.particles.push({ type: "spark", x: log.x, y: log.y + 20, vx: rand(-60, 60), vy: rand(-70, -10), life: 0.4, color: "#c9b894", size: rand(2, 4) });
  }
}
