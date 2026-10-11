// Flocks of little birds that fly over.

import { playPeep } from "../audio.js";
import { W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";

function spawnFlock() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const birds = [];
  const n = Math.floor(rand(5, 9));
  for (let i = 0; i < n; i++) {
    birds.push({ x: dir > 0 ? -30 - i * 26 : W + 30 + i * 26, y: rand(60, 150), vx: dir * 90, vy: 0 });
  }
  const look = pick([
    { body: "#5bc0eb", wing: "#3a9cc4", belly: "#d8f0fb" },
    { body: "#e63946", wing: "#b02534", belly: "#ffd6da" },
    { body: "#ffd93d", wing: "#dbb21a", belly: "#fff3b8" },
    { body: "#9d86c9", wing: "#7a63a8", belly: "#e6dcf7" }
  ]);
  game.flocks.push({ birds, dir, target: { x: rand(200, 600), y: rand(70, 160) }, life: rand(13, 20), look });
}

export function updateFlocks(dt) {
  game.flockTimer -= dt;
  if (game.flockTimer <= 0 && game.flocks.length < 1) {
    spawnFlock();
    game.flockTimer = rand(24, 48);
  }
  for (let f = game.flocks.length - 1; f >= 0; f--) {
    const fl = game.flocks[f];
    if (fl.cursor > 0) {
      fl.cursor -= dt;
      fl.target = { x: game.mouseX, y: game.mouseY };
      if (fl.cursor <= 0) fl.target = { x: rand(200, 600), y: rand(70, 160) };
    } else {
      fl.life -= dt;
      if (fl.life <= 0) fl.target = { x: fl.dir > 0 ? W + 120 : -120, y: rand(60, 150) };
    }
    let cx = 0;
    let cy = 0;
    for (const b of fl.birds) {
      cx += b.x;
      cy += b.y;
    }
    cx /= fl.birds.length;
    cy /= fl.birds.length;
    let allOut = true;
    for (let i = 0; i < fl.birds.length; i++) {
      const b = fl.birds[i];
      if (fl.cursor > 0) {
        b.vx += (game.mouseX - b.x) * 6 * dt;
        b.vy += (game.mouseY - b.y) * 6 * dt;
        const damp = Math.exp(-3.2 * dt);
        b.vx *= damp;
        b.vy *= damp;
        for (let j = 0; j < fl.birds.length; j++) {
          if (j === i) continue;
          const o = fl.birds[j];
          const dx = b.x - o.x;
          const dy = b.y - o.y;
          const d = Math.hypot(dx, dy);
          if (d < 12 && d > 0.01) {
            b.vx += (dx / d) * 90 * dt;
            b.vy += (dy / d) * 90 * dt;
          }
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (fl.life > 0 || (b.x > -80 && b.x < W + 80)) allOut = false;
        continue;
      }
      b.vx += (cx - b.x) * 0.8 * dt;
      b.vy += (cy - b.y) * 0.8 * dt;
      b.vx += (fl.target.x - cx) * 0.4 * dt;
      b.vy += (fl.target.y - cy) * 0.4 * dt;
      for (let j = 0; j < fl.birds.length; j++) {
        if (j === i) continue;
        const o = fl.birds[j];
        const dx = b.x - o.x;
        const dy = b.y - o.y;
        const d = Math.hypot(dx, dy);
        if (d < 24 && d > 0.01) {
          b.vx += (dx / d) * 70 * dt;
          b.vy += (dy / d) * 70 * dt;
        }
      }
      const sp = Math.hypot(b.vx, b.vy) || 1;
      if (sp > 130) {
        b.vx = (b.vx / sp) * 130;
        b.vy = (b.vy / sp) * 130;
      } else if (sp < 55 && fl.life > 0) {
        b.vx = (b.vx / sp) * 55;
        b.vy = (b.vy / sp) * 55;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (fl.life > 0 || (b.x > -80 && b.x < W + 80)) allOut = false;
    }
    if (allOut) game.flocks.splice(f, 1);
  }
}

export function drawFlocks() {
  for (const fl of game.flocks) {
    fl.birds.forEach((b, i) => {
      const flap = Math.sin(game.time * 13 + i * 1.3);
      const facing = b.vx >= 0 ? 1 : -1;
      const tilt = Math.max(-0.35, Math.min(0.35, b.vy * 0.004)) * facing;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(facing, 1);
      ctx.rotate(tilt);
      ctx.fillStyle = fl.look.wing;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-12, -4 + flap * 1.5);
      ctx.lineTo(-12, 4 + flap * 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = fl.look.body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.5, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fl.look.belly;
      ctx.beginPath();
      ctx.ellipse(1.5, 1.8, 4.2, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fl.look.body;
      ctx.beginPath();
      ctx.arc(6.5, -3.5, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff9f1c";
      ctx.beginPath();
      ctx.moveTo(10, -4.5);
      ctx.lineTo(14.5, -3);
      ctx.lineTo(10, -1.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2b2b2b";
      ctx.beginPath();
      ctx.arc(7.6, -4.6, 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(8, -5, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(0, -1.5);
      ctx.rotate(-0.5 + flap * 0.75);
      ctx.fillStyle = fl.look.wing;
      ctx.beginPath();
      ctx.ellipse(-1, -5.5, 3.4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    });
  }
}

export function onFlockClick(flock) {
  flock.cursor = 8;
  playPeep();
  for (let i = 0; i < 5; i++) {
    game.particles.push({ type: "spark", x: flock.birds[0].x, y: flock.birds[0].y, vx: rand(-60, 60), vy: rand(-60, 60), life: 0.5, color: "#bfe3f2", size: rand(2, 3) });
  }
}
