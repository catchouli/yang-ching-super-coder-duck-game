// Hats that appear on the ground for Duckie to collect.

import { playMatrix, playQuack } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { gainXP } from "../progression.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { drawStar, roundRectPath } from "../draw/shapes.js";
import { say } from "./duck.js";
import { initMatrixRain } from "../effects/matrix.js";
import { logCollide } from "../world/logs.js";
import { nearPond } from "../world/pond.js";

const HAT_TYPES = ["tophat", "party", "cowboy", "crown", "wizard", "propeller", "chef", "sombrero", "shades"];

export function drawHatShape(type) {
  switch (type) {
    case "tophat":
      ctx.fillStyle = "#2b2b2b";
      roundRectPath(-16, -4, 32, 5, 2);
      ctx.fill();
      roundRectPath(-10, -20, 20, 18, 3);
      ctx.fill();
      ctx.fillStyle = "#e63946";
      ctx.fillRect(-10, -9, 20, 5);
      break;
    case "party":
      ctx.fillStyle = "#ff6b9d";
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, -24);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffd93d";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6.5, -7);
      ctx.lineTo(6.5, -7);
      ctx.moveTo(-3.5, -15);
      ctx.lineTo(3.5, -15);
      ctx.stroke();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath();
      ctx.arc(0, -25, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "cowboy":
      ctx.fillStyle = "#a9743f";
      ctx.beginPath();
      ctx.ellipse(0, -2, 17, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      roundRectPath(-9, -15, 18, 13, 5);
      ctx.fill();
      ctx.fillStyle = "#6b4420";
      ctx.fillRect(-9, -6, 18, 4);
      break;
    case "crown":
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-12, -12);
      ctx.lineTo(-6, -5);
      ctx.lineTo(0, -16);
      ctx.lineTo(6, -5);
      ctx.lineTo(12, -12);
      ctx.lineTo(12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#c9a300";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#e63946";
      ctx.beginPath();
      ctx.arc(0, -4, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "wizard":
      ctx.fillStyle = "#845ec2";
      ctx.beginPath();
      ctx.ellipse(0, -1, 16, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.lineTo(10, -2);
      ctx.lineTo(2, -27);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      drawStar(2, -13, 3.5);
      break;
    case "propeller": {
      ctx.fillStyle = "#3d8bfd";
      ctx.beginPath();
      ctx.arc(0, -2, 10, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e63946";
      ctx.beginPath();
      ctx.arc(0, -2, 10, Math.PI, Math.PI * 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, -15);
      ctx.stroke();
      ctx.save();
      ctx.translate(0, -16);
      ctx.rotate(game.time * 14);
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath();
      ctx.ellipse(-7, 0, 7, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(7, 0, 7, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#555";
      ctx.beginPath();
      ctx.arc(0, -16, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "chef":
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-7, -12, 6, 0, Math.PI * 2);
      ctx.arc(0, -16, 7, 0, Math.PI * 2);
      ctx.arc(7, -12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-10, -12, 20, 12);
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1.5;
      roundRectPath(-10, -12, 20, 12, 2);
      ctx.stroke();
      break;
    case "shades":
      ctx.fillStyle = "#111";
      roundRectPath(-15, -6, 12, 9, 3);
      ctx.fill();
      roundRectPath(3, -6, 12, 9, 3);
      ctx.fill();
      ctx.fillRect(-3, -4, 6, 3);
      ctx.fillRect(-18, -5, 4, 3);
      ctx.fillRect(14, -5, 4, 3);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-12, -3);
      ctx.lineTo(-8, 1);
      ctx.moveTo(6, -3);
      ctx.lineTo(10, 1);
      ctx.stroke();
      break;
    case "sombrero":
      ctx.fillStyle = "#e0b35c";
      ctx.beginPath();
      ctx.ellipse(0, -2, 19, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -3, 9, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e63946";
      ctx.fillRect(-9, -8, 18, 4);
      ctx.strokeStyle = "#e63946";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -2, 19, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
}

export function drawGroundHat() {
  if (!game.groundHat) return;
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(game.groundHat.x, game.groundHat.y + 4, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(game.groundHat.x, game.groundHat.y - 2 + Math.sin(game.time * 3 + game.groundHat.seed) * 2);
  ctx.rotate(Math.sin(game.time * 1.7 + game.groundHat.seed) * 0.08);
  ctx.scale(1.2, 1.2);
  drawHatShape(game.groundHat.type);
  ctx.restore();
  if ((game.time * 1.3 + game.groundHat.seed) % 1.6 < 0.4) {
    ctx.fillStyle = "#fff8d0";
    drawStar(game.groundHat.x + 13, game.groundHat.y - 20, 4);
  }
}

function spawnHat() {
  for (let tries = 0; tries < 300; tries++) {
    const x = rand(60, W - 60);
    const y = rand(100, H - 60);
    if (nearPond(x, y, 20)) continue;
    if (Math.hypot(x - game.duck.x, y - game.duck.y) < 120) continue;
    let bad = false;
    for (const log of game.logs) {
      if (logCollide(x, y, log, 30)) bad = true;
    }
    for (const p of game.pellets) {
      if (Math.hypot(x - p.x, y - p.y) < 45) bad = true;
    }
    if (bad) continue;
    game.groundHat = { x, y, type: Math.random() < 0.04 ? "shades" : pick(HAT_TYPES.filter(t => t !== "shades")), seed: rand(0, 10) };
    game.hatTimer = 0;
    return;
  }
  game.hatTimer = 5;
}

export function startCollect() {
  game.duck.brain = "collect";
  game.duck.target = { x: game.groundHat.x, y: game.groundHat.y };
  say(pick(["A HAT!!", "OOH! SHINY!", "FOR ME?!"]));
  game.lastAction = "collect";
}

export function pickupHat() {
  const duck = game.duck;
  duck.hat = game.groundHat.type;
  game.hatCollection++;
  duck.hop = 0.5;
  duck.happyTimer = 1.2;
  say(pick(["SO FANCY!", "MY HAT!", "FASHION!!", "SO HANDSOME!"]));
  playQuack();
  gainXP(3);
  if (game.groundHat.type === "shades") {
    game.matrixMode = 10;
    initMatrixRain();
    playMatrix();
    say("WOAH.");
  }
  for (let i = 0; i < 4; i++) {
    game.particles.push({ type: "heart", x: duck.x + rand(-14, 14), y: duck.y - 34, life: rand(0.9, 1.4), size: rand(0.8, 1.3) });
  }
  for (let i = 0; i < 8; i++) {
    game.particles.push({
      type: "spark",
      x: game.groundHat.x,
      y: game.groundHat.y,
      vx: rand(-80, 80),
      vy: rand(-100, -10),
      life: rand(0.3, 0.6),
      color: pick(["#fff8d0", "#ffd93d", "#fff"]),
      size: rand(2, 4)
    });
  }
  game.groundHat = null;
  game.hatTimer = rand(12, 22);
}

export function updateHatSpawner(dt) {
  if (!game.groundHat) {
    game.hatTimer -= dt;
    if (game.hatTimer <= 0) spawnHat();
  }
}
