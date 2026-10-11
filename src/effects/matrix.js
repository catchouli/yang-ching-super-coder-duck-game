// What happens when Duckie finds the sunglasses.

import { playMatrix, playWhee } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { bubbleQueue } from "../draw/bubbles.js";
import { roundRectPath } from "../draw/shapes.js";

const MATRIX_CHARS = "01アカサタナハマヤラABCXYZ<>#$%*+";

function randChar() {
  return MATRIX_CHARS.charAt(Math.floor(rand(0, MATRIX_CHARS.length)));
}

export function initMatrixRain() {
  game.matrixCols = [];
  for (let i = 0; i < 28; i++) {
    const glyphs = [];
    for (let j = 0; j < 14; j++) glyphs.push(randChar());
    game.matrixCols.push({ x: (i + 0.5) * (W / 28) + rand(-8, 8), y: rand(-400, -20), v: rand(80, 240), glyphs, t: rand(0, 0.15) });
  }
}

function updateMatrixRain(dt) {
  if (!game.matrixCols) initMatrixRain();
  for (const col of game.matrixCols) {
    col.y += col.v * dt;
    col.t -= dt;
    if (col.t <= 0) {
      col.t = 0.12;
      col.glyphs[Math.floor(rand(0, col.glyphs.length))] = randChar();
    }
    if (col.y - col.glyphs.length * 16 > H + 40) {
      col.y = rand(-300, -60);
      col.v = rand(80, 240);
    }
  }
}

// Darkens the screen and draws the rain and the man in the long coat over the top.
export function drawMatrix() {
  if (game.matrixMode <= 0) return;
  ctx.fillStyle = "rgba(0, 12, 0, 0.72)";
  ctx.fillRect(0, 0, W, H);
  drawMatrixRain();
  drawKeanu();
}

export function drawMatrixRain() {
  if (!game.matrixCols) return;
  ctx.font = "15px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const col of game.matrixCols) {
    for (let i = 0; i < col.glyphs.length; i++) {
      const gy = col.y - i * 16;
      if (gy < -20 || gy > H + 20) continue;
      if (i === 0) {
        ctx.fillStyle = "#ccffcc";
        ctx.globalAlpha = 1;
        ctx.fillText(col.glyphs[i], col.x, gy);
      } else {
        ctx.globalAlpha = Math.max(0.08, 0.75 - i * 0.055);
        ctx.fillStyle = "#33dd55";
        ctx.fillText(col.glyphs[i], col.x, gy);
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

export function drawKeanu() {
  if (game.keanuGone) return;
  let a = 1;
  if (game.keanuFly <= 0) {
    if (game.matrixMode > 8.5) a = (10 - game.matrixMode) / 1.5;
    else if (game.matrixMode < 1.5) a = game.matrixMode / 1.5;
  }
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  if (game.keanuFly > 0) {
    const p = 1 - game.keanuFly / 1.2;
    ctx.translate(400 + p * 550, 430 - p * 420);
    ctx.rotate(p * 22);
  } else {
    ctx.translate(400, 430);
  }
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(-22, -34);
  ctx.lineTo(22, -34);
  ctx.lineTo(30, 18);
  ctx.lineTo(-30, 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "#2e2e2e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, -20);
  ctx.lineTo(2, -8);
  ctx.moveTo(14, -20);
  ctx.lineTo(-2, -8);
  ctx.stroke();
  ctx.fillStyle = "#e8c49a";
  ctx.beginPath();
  ctx.arc(0, -46, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.arc(0, -50, 13, Math.PI * 0.95, Math.PI * 2.05);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-13, -50);
  ctx.quadraticCurveTo(-18, -38, -14, -28);
  ctx.quadraticCurveTo(-11, -36, -11, -44);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(13, -50);
  ctx.quadraticCurveTo(18, -38, 14, -28);
  ctx.quadraticCurveTo(11, -36, 11, -44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#111";
  roundRectPath(-10, -51, 20, 7, 3);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-8, -49);
  ctx.lineTo(-3, -46);
  ctx.stroke();
  ctx.strokeStyle = "#8a6a4a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-4, -38);
  ctx.lineTo(4, -38);
  ctx.stroke();
  ctx.restore();

  if (!game.keanuFly && !game.keanuGone && game.matrixMode < 8 && game.matrixMode > 2) {
    bubbleQueue.push({ x: 400, top: 330, text: "MATRIX!!!!", font: "bold 26px monospace", bg: "rgba(0, 20, 0, 0.92)", border: "#33dd55", color: "#66ff77", bw: 2.5, pad: 15, h: 44 });
  }
  ctx.globalAlpha = 1;
}

export function onKeanuClick() {
  bubbleQueue.push({ x: 400, top: 296, text: "THE ONE PIECE IS REALLLLLL!!!", font: "bold 18px monospace", bg: "rgba(0, 20, 0, 0.92)", border: "#33dd55", color: "#66ff77", bw: 2.5, pad: 12 });
  playMatrix();
  playWhee();
  game.keanuFly = 1.2;
  game.matrixMode = Math.min(game.matrixMode, 1.7);
}

export function updateMatrix(dt) {
  if (game.keanuFly > 0) {
    game.keanuFly -= dt;
    const p = 1 - game.keanuFly / 1.2;
    if (Math.random() < 0.5) {
      game.particles.push({ type: "spark", x: 400 + p * 550 + rand(-20, 20), y: 430 - p * 420 + rand(-20, 20), vx: rand(-40, 40), vy: rand(-40, 40), life: 0.5, color: "#33dd55", size: rand(2, 4) });
    }
    if (game.keanuFly <= 0) game.keanuGone = true;
  }
  if (game.matrixMode > 0) {
    game.matrixMode -= dt;
    updateMatrixRain(dt);
  }
}
