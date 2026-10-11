// A bulldozer that knocks down trees unless everyone chases it off.

import { playBonk, playHonk, playWhee } from "../audio.js";
import { W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { bubbleQueue } from "../draw/bubbles.js";
import { roundRectPath } from "../draw/shapes.js";
import { say } from "../duck/duck.js";
import { wordAt } from "../effects/particles.js";

function spawnBulldozer() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  game.bulldozer = { x: dir > 0 ? -140 : W + 140, y: 470, dir, state: "drive", speed: 55, roll: 0, fleeClicks: 0, fleeT: 0 };
  wordAt("RUMBLE RUMBLE..", Math.max(80, Math.min(W - 80, game.bulldozer.x)), 400);
}

export function updateBulldozer(dt) {
  game.dozerTimer -= dt;
  if (game.dozerTimer <= 0 && !game.bulldozer && game.mode === "play") {
    spawnBulldozer();
  }
  if (!game.bulldozer) return;
  const b = game.bulldozer;
  b.roll += (b.state === "fleeing" ? 250 : 60) * dt;
  if (Math.random() < 0.12) {
    game.particles.push({ type: "spark", x: b.x - b.dir * 40 + rand(-4, 4), y: b.y - 46, vx: rand(-15, 15) - b.dir * 20, vy: rand(-50, -25), life: 0.7, color: "rgba(120,120,120,0.6)", size: rand(3, 6) });
  }
  if (b.state === "fleeing") {
    b.fleeT += dt;
    const mult = 0.6 + Math.pow(b.fleeT / 5, 2) * 2.2 + b.fleeClicks * 0.25;
    b.x += b.dir * b.speed * mult * dt;
    if ((b.dir > 0 && b.x > W + 150) || (b.dir < 0 && b.x < -150)) {
      game.bulldozer = null;
      game.dozerTimer = rand(50, 90);
      game.ecoRush = 0;
    }
  } else {
    b.x += b.dir * b.speed * dt;
    for (const tr of game.trees) {
      if (tr.state === "alive" && Math.abs(tr.x - (b.x + b.dir * 60)) < 42 && Math.abs(tr.y - b.y) < 70) {
        tr.chop = 2;
        tr.state = "falling";
        tr.t = 0;
        tr.fallDir = b.dir;
        game.ecoMsg = 6.5;
        wordAt("CRUNCH!!", tr.x, tr.y - 60);
        playBonk();
      }
    }
    if ((b.dir > 0 && b.x > W + 150) || (b.dir < 0 && b.x < -150)) {
      game.bulldozer = null;
      game.dozerTimer = rand(50, 90);
      game.ecoRush = 0;
    }
  }
}

export function drawBulldozer() {
  if (!game.bulldozer) return;
  const b = game.bulldozer;
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(b.x, b.y + 20, 70, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(b.dir, 1);
  ctx.fillStyle = "#f4c430";
  roundRectPath(-45, -38, 80, 34, 6);
  ctx.fill();
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#e0b020";
  roundRectPath(-8, -60, 36, 26, 5);
  ctx.fill();
  ctx.strokeStyle = "#b8860b";
  ctx.stroke();
  ctx.fillStyle = "#bfe3f2";
  roundRectPath(-3, -56, 26, 15, 3);
  ctx.fill();
  ctx.fillStyle = "#e8c49a";
  ctx.beginPath();
  ctx.arc(10, -46, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#444";
  ctx.beginPath();
  ctx.arc(10, -48, 5, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#555";
  ctx.fillRect(-42, -52, 7, 16);
  ctx.strokeStyle = "#f4c430";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(35, -30);
  ctx.lineTo(58, -20);
  ctx.stroke();
  ctx.fillStyle = "#8a9199";
  ctx.beginPath();
  ctx.moveTo(52, -28);
  ctx.lineTo(72, -8);
  ctx.lineTo(72, 10);
  ctx.lineTo(46, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5c646b";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#333";
  roundRectPath(-52, -10, 108, 24, 11);
  ctx.fill();
  ctx.fillStyle = "#666";
  for (const wx of [-38, -14, 10, 34]) {
    ctx.beginPath();
    ctx.arc(wx, 2, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#888";
  for (const wx of [-38, -14, 10, 34]) {
    ctx.save();
    ctx.translate(wx, 2);
    ctx.rotate(b.roll);
    ctx.fillStyle = "#888";
    ctx.fillRect(-4, -1.5, 8, 3);
    ctx.fillRect(-1.5, -4, 3, 8);
    ctx.restore();
  }
  ctx.restore();
  if (b.state === "fleeing") {
    bubbleQueue.push({
      x: Math.max(200, Math.min(W - 200, b.x)),
      top: Math.max(24, b.y - 185),
      text: ["And I am not frightened of dying.", "Any time will do, I don't mind.", "Why should I be frightened of dying?", "There's no reason for it.", "You've gotta go sometime."],
      font: "bold 20px 'Comic Sans MS', 'Chalkboard SE', cursive",
      lineH: 23,
      border: "#555",
      color: "#333"
    });
  }
}

export function onBulldozerClick() {
  if (game.bulldozer.state !== "fleeing") {
    game.bulldozer.state = "fleeing";
    game.bulldozer.fleeClicks = 0;
    game.ecoRush = 999;
    say(pick(["GET HIM!", "SAVE THE TREES!", "CHAAARGE!"]));
    playHonk();
    playWhee();
  } else {
    game.bulldozer.fleeClicks++;
  }
}
