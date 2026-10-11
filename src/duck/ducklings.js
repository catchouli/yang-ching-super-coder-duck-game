// Baby duckies that follow Duckie around in a line until they grow up and leave.

import { playPeep, playQuack, playWhee } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { SKINS } from "../progression.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { trackAt } from "./coaster.js";
import { wordAt } from "../effects/particles.js";

export function drawDucklings() {
  for (const dl of game.ducklings) {
    const sk = SKINS[dl.skin] || SKINS.classic;
    const rainbow = dl.skin === "rainbow";
    const hue1 = Math.round((game.time * 70 + dl.waddlePhase * 57) % 360);
    const bodyCol = rainbow ? "hsl(" + hue1 + ", 72%, 66%)" : sk.body;
    const shadeCol = rainbow ? "hsl(" + hue1 + ", 72%, 40%)" : sk.shade;
    const wingCol = rainbow ? "hsl(" + Math.round((hue1 + 40) % 360) + ", 72%, 76%)" : sk.wing;

    const gScale = dl.scale || 0.62;
    const growBob = dl.mode === "grow" ? Math.abs(Math.sin(game.time * 10)) * 4 : 0;

    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(dl.x, dl.y + 18, 14 * (gScale / 0.62), 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(dl.x, dl.y - growBob);
    if (dl.moving) ctx.rotate(Math.sin(dl.waddlePhase) * 0.14);
    ctx.scale(dl.facing * gScale, gScale);

    const f = dl.moving ? Math.sin(dl.waddlePhase) * 5 : 0;
    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.ellipse(-5, 26 + f, 6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 26 - f, 6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.ellipse(0, 10, 17, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shadeCol;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = wingCol;
    ctx.beginPath();
    ctx.ellipse(-2, 11, 8, 5.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.arc(9, -8, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shadeCol;
    ctx.stroke();

    ctx.strokeStyle = shadeCol;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(4, -20);
    ctx.lineTo(2, -25);
    ctx.moveTo(9, -20);
    ctx.lineTo(10, -26);
    ctx.stroke();

    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.moveTo(19, -11);
    ctx.lineTo(31, -6);
    ctx.lineTo(19, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d97f0e";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,130,130,0.45)";
    ctx.beginPath();
    ctx.ellipse(4, 0, 4.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (dl.mode) {
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(13, -11, 2.6, Math.PI, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#2b2b2b";
      ctx.beginPath();
      ctx.arc(13, -11, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(14.2, -12.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function updateDucklings(dt) {
  game.growTimer -= dt;
  if (game.growTimer <= 0 && game.mode === "play" && game.ducklings.length >= 3) {
    game.growTimer = game.ducklings.length > 14 ? 2 : rand(20, 35);
    const candidates = game.ducklings.filter(d => !d.mode);
    if (candidates.length) {
      const lucky = pick(candidates);
      lucky.mode = "grow";
      lucky.growT = 0;
      lucky.scale = 0.62;
    }
  }
  for (let i = game.ducklings.length - 1; i >= 0; i--) {
    const dl = game.ducklings[i];
    if (dl.mode === "grow") {
      dl.growT += dt;
      dl.moving = false;
      dl.scale = 0.62 + Math.min(1, dl.growT / 2.2) * 0.5;
      if (dl.growT >= 2.2) {
        dl.mode = "leave";
        playQuack();
        game.particles.push({ type: "word", text: "QUACK!", x: dl.x, y: dl.y - 40, life: 1.3 });
        for (let j = 0; j < 3; j++) {
          game.particles.push({ type: "heart", x: dl.x + rand(-12, 12), y: dl.y - 24, life: rand(0.9, 1.3), size: rand(0.8, 1.2) });
        }
        const a = rand(0, Math.PI * 2);
        dl.leaveX = dl.x + Math.cos(a) * 900;
        dl.leaveY = dl.y + Math.sin(a) * 900;
      }
      continue;
    }
    if (dl.mode === "leave") {
      const dx = dl.leaveX - dl.x;
      const dy = dl.leaveY - dl.y;
      const d = Math.hypot(dx, dy) || 1;
      dl.x += (dx / d) * 270 * dt;
      dl.y += (dy / d) * 270 * dt;
      if (Math.abs(dx) > 2) dl.facing = dx > 0 ? 1 : -1;
      dl.waddlePhase += dt * 16;
      dl.moving = true;
      if (dl.x < -70 || dl.x > W + 70 || dl.y < -60 || dl.y > H + 60) {
        game.ducklings.splice(i, 1);
      }
      continue;
    }
    if (dl.zoomies > 0) {
      dl.zoomies -= dt;
      dl.zt = (dl.zt || 0) - dt;
      if (dl.zt <= 0) {
        dl.zt = 0.22;
        dl.zang = rand(0, Math.PI * 2);
      }
      dl.x += Math.cos(dl.zang) * 330 * dt;
      dl.y += Math.sin(dl.zang) * 330 * dt;
      if (dl.x < 24 || dl.x > W - 24) dl.zang = Math.PI - dl.zang;
      if (dl.y < 50 || dl.y > H - 30) dl.zang = -dl.zang;
      dl.x = Math.max(24, Math.min(W - 24, dl.x));
      dl.y = Math.max(50, Math.min(H - 30, dl.y));
      dl.facing = Math.cos(dl.zang) >= 0 ? 1 : -1;
      dl.waddlePhase += dt * 20;
      dl.moving = true;
      continue;
    }
    if (game.ecoRush > 0 && game.bulldozer) {
      const dx = game.bulldozer.x - dl.x;
      const dy = game.bulldozer.y - 6 - dl.y;
      const d = Math.hypot(dx, dy) || 1;
      dl.x += (dx / d) * 300 * dt;
      dl.y += (dy / d) * 300 * dt;
      dl.x = Math.max(24, Math.min(W - 24, dl.x));
      dl.y = Math.max(50, Math.min(H - 30, dl.y));
      dl.facing = dx >= 0 ? 1 : -1;
      dl.waddlePhase += dt * 22;
      dl.moving = true;
      if (Math.random() < 0.006) wordAt("peep!!", dl.x, dl.y - 30);
      continue;
    }
    if (game.duck.brain === "ride") {
      // Each baby gets their own car, one behind the other.
      const seat = game.ducklings.slice(0, i).filter(d => !d.mode).length;
      const back = game.rideDist - (seat + 1) * 46;
      const pos = trackAt(back);
      dl.x = pos.x;
      dl.y = pos.y - 6;
      const ahead = trackAt(back + 3);
      dl.facing = ahead.x >= pos.x ? 1 : -1;
      dl.moving = false;
    } else {
      const leader = i === 0 ? game.duck : game.ducklings[i - 1];
      const dx = leader.x - dl.x;
      const dy = leader.y - dl.y;
      const d = Math.hypot(dx, dy);
      dl.moving = false;
      if (d > 34) {
        const speed = Math.min(210, 70 + (d - 34) * 3.5);
        dl.x += (dx / d) * speed * dt;
        dl.y += (dy / d) * speed * dt;
        if (Math.abs(dx) > 2) dl.facing = dx > 0 ? 1 : -1;
        dl.waddlePhase += dt * 13;
        dl.moving = true;
      }
    }
    dl.x = Math.max(24, Math.min(W - 24, dl.x));
    dl.y = Math.max(50, Math.min(H - 30, dl.y));
    dl.peepTimer -= dt;
    if (dl.peepTimer <= 0) {
      dl.peepTimer = rand(6, 14);
      if (game.mode === "play") {
        playPeep();
        game.particles.push({ type: "word", text: "peep!", x: dl.x, y: dl.y - 30, life: 1.2 });
      }
    }
  }
}

export function onDucklingClick(dl) {
  playPeep();
  playWhee();
  dl.zoomies = 2.5;
  dl.zt = 0;
  wordAt("ZOOMIES!", dl.x, dl.y - 34);
  game.particles.push({ type: "heart", x: dl.x, y: dl.y - 20, life: 1, size: 1 });
}
