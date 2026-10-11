// Bunnies and squirrels that run across the field.

import { playPeep } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { wordAt } from "../effects/particles.js";

function spawnVisitor() {
  const kind = pick(["bunny", "squirrel"]);
  const dir = Math.random() < 0.5 ? 1 : -1;
  let y = rand(140, H - 80);
  for (let t = 0; t < 40 && Math.abs(y - 515) < 58; t++) {
    y = rand(140, H - 80);
  }
  game.visitors.push({
    kind,
    dir,
    x: dir > 0 ? -50 : W + 50,
    y,
    speed: kind === "bunny" ? rand(110, 150) : rand(130, 170),
    phase: rand(0, Math.PI * 2),
    state: "run",
    pauseAt: Math.random() < 0.5 ? rand(280, 520) : null,
    pauseTimer: 0,
    chase: 0,
    body: kind === "bunny" ? pick(["#fdf6ec", "#e8d5c0", "#cbb391"]) : pick(["#b5773a", "#96602c"])
  });
}

export function updateVisitors(dt) {
  game.visitorTimer -= dt;
  if (game.visitorTimer <= 0 && game.visitors.length < 2) {
    spawnVisitor();
    game.visitorTimer = rand(16, 34);
  }
  for (let i = game.visitors.length - 1; i >= 0; i--) {
    const v = game.visitors[i];
    if (v.chase > 0) {
      v.chase -= dt;
      if (game.ecoRush > 0 && game.bulldozer) v.chase = Math.max(v.chase, 0.3);
      const tx = game.ecoRush > 0 && game.bulldozer ? game.bulldozer.x : game.mouseX;
      const ty = game.ecoRush > 0 && game.bulldozer ? game.bulldozer.y : game.mouseY;
      const dx = tx - v.x;
      const dy = ty - v.y;
      const d = Math.hypot(dx, dy) || 1;
      v.x = Math.max(24, Math.min(W - 24, v.x + (dx / d) * 145 * dt));
      v.y = Math.max(70, Math.min(H - 30, v.y + (dy / d) * 145 * dt));
      v.dir = dx >= 0 ? 1 : -1;
      v.phase += dt * 12;
      if (v.chase <= 0) {
        v.state = "run";
        v.pauseAt = null;
      }
      continue;
    }
    if (v.state === "pause") {
      v.pauseTimer -= dt;
      if (v.pauseTimer <= 0) v.state = "run";
    } else {
      v.x += v.dir * v.speed * dt;
      v.phase += dt * (v.kind === "bunny" ? 7 : 10);
      if (v.pauseAt !== null && ((v.dir > 0 && v.x >= v.pauseAt) || (v.dir < 0 && v.x <= v.pauseAt))) {
        v.state = "pause";
        v.pauseTimer = rand(0.9, 1.7);
        v.pauseAt = null;
      }
    }
    if (v.x < -70 || v.x > W + 70) game.visitors.splice(i, 1);
  }
}

export function drawVisitors() {
  for (const v of game.visitors) {
    const hopY = v.kind === "bunny" ? -Math.abs(Math.sin(v.phase)) * 13 : -Math.abs(Math.sin(v.phase)) * 5;
    ctx.fillStyle = "rgba(0,0,0,0.13)";
    ctx.beginPath();
    ctx.ellipse(v.x, v.y + 12, 15, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(v.x, v.y + hopY);
    if (v.chase > 0) ctx.translate(Math.sin(game.time * 40) * 2, Math.sin(game.time * 33) * 2);
    ctx.scale(v.dir, 1);
    if (v.kind === "bunny") {
      const earTwitch = v.state === "pause" || v.chase > 0 ? Math.sin(game.time * 18) * 0.15 : 0;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-14, -2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(11, -12, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(8, -19);
      ctx.rotate(-0.25 + earTwitch);
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.ellipse(0, -7, 3.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffb6c1";
      ctx.beginPath();
      ctx.ellipse(0, -6.5, 1.6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(14, -18);
      ctx.rotate(0.2 - earTwitch);
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.ellipse(0, -7, 3.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffb6c1";
      ctx.beginPath();
      ctx.ellipse(0, -6.5, 1.6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (v.chase > 0) {
        ctx.strokeStyle = "#2b2b2b";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(14, -12.5, 2.4, Math.PI, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.arc(14, -13, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ff9bb0";
      ctx.beginPath();
      ctx.arc(19, -11, 1.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const tailBob = Math.sin(v.phase * 0.8) * 3;
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.arc(-14, -10 + tailBob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-19, -19 + tailBob, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8c99b";
      ctx.beginPath();
      ctx.ellipse(2, 2, 8, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = v.body;
      ctx.beginPath();
      ctx.arc(10, -11, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(7, -18, 3, 0, Math.PI * 2);
      ctx.fill();
      if (v.chase > 0) {
        ctx.strokeStyle = "#2b2b2b";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(13, -11.5, 2.2, Math.PI, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.arc(13, -12, 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(13.6, -12.6, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#4a2c14";
      ctx.beginPath();
      ctx.arc(17.5, -9.5, 1.4, 0, Math.PI * 2);
      ctx.fill();
      if (v.state === "pause") {
        ctx.fillStyle = "#c98a3d";
        ctx.beginPath();
        ctx.ellipse(16, -2, 3, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7a4a21";
        ctx.beginPath();
        ctx.ellipse(16, -5, 3.2, 1.8, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

export function onVisitorClick(v) {
  v.chase = 6;
  v.state = "chase";
  playPeep();
  wordAt("^_^", v.x, v.y - 36);
  for (let i = 0; i < 4; i++) {
    game.particles.push({ type: "heart", x: v.x + rand(-10, 10), y: v.y - 24, life: rand(0.8, 1.2), size: rand(0.7, 1.1) });
  }
}
