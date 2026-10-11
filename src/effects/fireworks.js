// Fireworks that Duckie (or you) can set off.

import { playBoom, playCrackle, playPeep } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { drawStar, roundRectPath } from "../draw/shapes.js";
import { logCollide } from "../world/logs.js";
import { nearPond } from "../world/pond.js";

function spawnFirework() {
  for (let tries = 0; tries < 300; tries++) {
    const x = rand(70, W - 70);
    const y = rand(120, H - 70);
    if (nearPond(x, y, 20)) continue;
    if (Math.hypot(x - game.duck.x, y - game.duck.y) < 140) continue;
    let bad = false;
    for (const log of game.logs) {
      if (logCollide(x, y, log, 30)) bad = true;
    }
    for (const p of game.pellets) {
      if (Math.hypot(x - p.x, y - p.y) < 45) bad = true;
    }
    if (game.groundHat && Math.hypot(x - game.groundHat.x, y - game.groundHat.y) < 60) bad = true;
    for (const o of game.fireworks) {
      if (Math.hypot(x - o.x, y - o.y) < 90) bad = true;
    }
    if (bad) continue;
    game.fireworks.push({ x, y, state: "idle", hue: rand(0, 360), vy: 0, ceil: 0 });
    game.fireworkTimer = rand(16, 30);
    return;
  }
  game.fireworkTimer = 6;
}

export function updateFireworks(dt) {
  for (let i = game.fireworks.length - 1; i >= 0; i--) {
    const fw = game.fireworks[i];
    if (fw.state === "idle") {
      if (Math.hypot(game.duck.x - fw.x, game.duck.y - fw.y) < 48) {
        fw.state = "rising";
        fw.vy = -270;
        fw.ceil = rand(90, 220);
        playPeep();
      }
    } else {
      fw.y += fw.vy * dt;
      game.particles.push({ type: "spark", x: fw.x + rand(-2, 2), y: fw.y + 8, vx: rand(-10, 10), vy: rand(10, 40), life: 0.3, color: "#ffd93d", size: rand(1.5, 3) });
      if (fw.y <= fw.ceil) {
        playBoom();
        playCrackle(0.25);
        playCrackle(0.55);
        game.shake = 0.4;
        game.particles.push({ type: "flash", x: fw.x, y: fw.y, life: 0.3, size: 12 });
        game.particles.push({ type: "ring", x: fw.x, y: fw.y, life: 0.55, color: "#fff", size: 8 });
        for (let j = 0; j < 24; j++) {
          const a = (j / 24) * Math.PI * 2 + rand(-0.1, 0.1);
          const sp = rand(60, 130);
          game.particles.push({
            type: "spark",
            x: fw.x,
            y: fw.y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 30,
            life: rand(0.7, 1.1),
            color: pick(["#ffd93d", "#fff3b0", "#ffffff"]),
            size: rand(2, 3.5)
          });
        }
        for (let j = 0; j < 36; j++) {
          const a = rand(0, Math.PI * 2);
          const sp = rand(130, 240);
          game.particles.push({
            type: "spark",
            x: fw.x,
            y: fw.y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 50,
            life: rand(0.8, 1.3),
            color: "hsl(" + Math.round((fw.hue + rand(-35, 35) + 360) % 360) + ", 85%, 65%)",
            size: rand(2.5, 4.5)
          });
        }
        for (let j = 0; j < 12; j++) {
          game.particles.push({
            type: "twinkle",
            x: fw.x + rand(-90, 90),
            y: fw.y + rand(-70, 50),
            life: rand(0.9, 1.5),
            color: pick(["#fff", "#ffd93d", "hsl(" + Math.round((fw.hue + 360) % 360) + ", 85%, 75%)"]),
            size: rand(2.5, 4.5),
            seed: rand(0, 10)
          });
        }
        game.fireworks.splice(i, 1);
        game.fireworkTimer = rand(14, 28);
      }
    }
  }
}

export function drawFireworks() {
  for (const fw of game.fireworks) {
    if (fw.state === "idle") {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(fw.x, fw.y + 4, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7a4a21";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fw.x, fw.y + 2);
      ctx.lineTo(fw.x, fw.y - 10);
      ctx.stroke();
      ctx.fillStyle = "#e63946";
      roundRectPath(fw.x - 4, fw.y - 26, 8, 17, 3);
      ctx.fill();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath();
      ctx.moveTo(fw.x - 4, fw.y - 26);
      ctx.lineTo(fw.x + 4, fw.y - 26);
      ctx.lineTo(fw.x, fw.y - 33);
      ctx.closePath();
      ctx.fill();
      if ((game.time * 4) % 1 < 0.5) {
        ctx.fillStyle = "#fff8d0";
        drawStar(fw.x, fw.y - 36, 3);
      }
    } else {
      ctx.fillStyle = "#e63946";
      roundRectPath(fw.x - 3, fw.y - 6, 6, 12, 2);
      ctx.fill();
      ctx.fillStyle = "#ffb347";
      ctx.beginPath();
      ctx.moveTo(fw.x - 3, fw.y + 6);
      ctx.lineTo(fw.x + 3, fw.y + 6);
      ctx.lineTo(fw.x, fw.y + 14);
      ctx.closePath();
      ctx.fill();
    }
  }
}

export function onFireworkClick(fw) {
  fw.state = "rising";
  fw.vy = -330;
  fw.ceil = Math.max(70, fw.y - rand(150, 280));
  playPeep();
}

export function updateFireworkSpawner(dt) {
  if (game.fireworks.length < 3) {
    game.fireworkTimer -= dt;
    if (game.fireworkTimer <= 0) spawnFirework();
  }
}
