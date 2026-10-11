// Frogs that hop around the pond.

import { playRibbit } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { wordAt } from "../effects/particles.js";
import { nearPond, pondInfo } from "../world/pond.js";

export function makeFrogs() {
  game.frogs = [];
  for (let i = 0; i < 2; i++) {
    const spot = i === 0 ? { x: pondInfo().x + 45, y: pondInfo().y - 15 } : frogSpot();
    game.frogs.push({ x: spot.x, y: spot.y, state: "sit", timer: rand(1, 3), fromX: spot.x, fromY: spot.y, toX: spot.x, toY: spot.y, hopT: 1, blink: 0, blinkTimer: rand(2, 5), croakTimer: rand(2, 6), croak: 0, dir: 1, pad: i === 0 });
  }
}

function frogSpot() {
  const p = pondInfo();
  for (let t = 0; t < 120; t++) {
    const a = rand(0, Math.PI * 2);
    const x = Math.max(30, Math.min(W - 30, p.x + Math.cos(a) * rand(105, 155)));
    const y = Math.max(80, Math.min(H - 25, p.y + Math.sin(a) * rand(60, 90)));
    if (!nearPond(x, y, 6)) return { x, y };
  }
  return { x: p.x + 180, y: p.y - 60 };
}

export function updateFrogs(dt) {
  for (const f of game.frogs) {
    f.blinkTimer -= dt;
    if (f.blinkTimer <= 0) {
      f.blink = 0.12;
      f.blinkTimer = rand(2, 5);
    }
    if (f.blink > 0) f.blink -= dt;
    f.croakTimer -= dt;
    if (f.croakTimer <= 0 && f.state === "sit") {
      f.croakTimer = rand(3, 7);
      f.croak = 0.8;
      game.particles.push({ type: "word", text: "ribbit..", x: f.x + rand(-6, 6), y: f.y - 30, life: 1.1 });
      playRibbit();
    }
    if (f.croak > 0) f.croak -= dt;
    if (f.state === "sit") {
      f.timer -= dt;
      if (game.ecoRush > 0 && game.bulldozer) f.timer = Math.min(f.timer, 0.12);
      if (f.timer <= 0) {
        let spot;
        if (game.ecoRush > 0 && game.bulldozer) {
          spot = { x: Math.max(30, Math.min(W - 30, game.bulldozer.x + rand(-60, 20))), y: Math.max(80, Math.min(H - 25, game.bulldozer.y + rand(-15, 35))) };
        } else if (Math.random() < 0.3) {
          spot = { x: f.x, y: f.y };
        } else if (f.pad && Math.random() < 0.4) {
          spot = { x: pondInfo().x + 45, y: pondInfo().y - 15 };
        } else {
          spot = frogSpot();
        }
        f.fromX = f.x;
        f.fromY = f.y;
        f.toX = spot.x;
        f.toY = spot.y;
        f.hopT = 0;
        f.state = "hop";
        f.dir = f.toX >= f.x ? 1 : -1;
      }
    } else {
      f.hopT += dt / 0.55;
      if (f.hopT >= 1) {
        f.hopT = 1;
        f.x = f.toX;
        f.y = f.toY;
        f.state = "sit";
        f.timer = rand(1.2, 2.8);
      }
    }
  }
}

export function drawFrogs() {
  for (const f of game.frogs) {
    const jumping = f.state === "hop";
    let jy = 0;
    let squash = 1;
    if (jumping) {
      jy = -Math.sin(f.hopT * Math.PI) * 22;
      squash = 1 + Math.sin(f.hopT * Math.PI) * 0.18;
    } else {
      squash = 1 + Math.sin(game.time * 3 + f.x) * 0.04;
    }
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(f.x, f.y + 7, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(f.x, f.y + jy);
    ctx.scale(f.dir * 1.55, 1.55);
    ctx.fillStyle = "#5fae4e";
    ctx.beginPath();
    ctx.ellipse(0, -5, 11 / squash, 8 * squash, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4a8a3c";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#d8f0c8";
    ctx.beginPath();
    ctx.ellipse(0, -1.5, 7.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5fae4e";
    ctx.beginPath();
    ctx.arc(-5, -14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-5, -14, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -14, 2.6, 0, Math.PI * 2);
    ctx.fill();
    if (f.blink > 0) {
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-6.5, -14);
      ctx.lineTo(-3.5, -14);
      ctx.moveTo(3.5, -14);
      ctx.lineTo(6.5, -14);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#2b2b2b";
      ctx.beginPath();
      ctx.arc(-4.5, -14, 1.3, 0, Math.PI * 2);
      ctx.arc(5.5, -14, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#3d7a30";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(2, -7);
    ctx.lineTo(7, -7.5);
    ctx.stroke();
    if (f.croak > 0) {
      ctx.fillStyle = "#fbf3c0";
      ctx.beginPath();
      ctx.arc(4, -3, 2.5 + Math.abs(Math.sin(game.time * 18)) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#5fae4e";
    ctx.beginPath();
    ctx.ellipse(-6, 2, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, 2, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function onFrogClick(fr) {
  fr.croak = 0.9;
  wordAt("ribbit!!", fr.x, fr.y - 34);
  playRibbit();
  const spot = frogSpot();
  fr.fromX = fr.x;
  fr.fromY = fr.y;
  fr.toX = spot.x;
  fr.toY = spot.y;
  fr.hopT = 0;
  fr.state = "hop";
  fr.dir = fr.toX >= fr.x ? 1 : -1;
}
