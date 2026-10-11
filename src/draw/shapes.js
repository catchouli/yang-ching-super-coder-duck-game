// Reusable canvas shapes.

import { ctx } from "../canvas.js";

function heartPath() {
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(-9, -4, -5, -10, 0, -5);
  ctx.bezierCurveTo(5, -10, 9, -4, 0, 4);
  ctx.closePath();
}

export function drawHeartShape(x, y, s, fillFrac) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 10, s / 10);
  ctx.save();
  heartPath();
  ctx.clip();
  ctx.fillStyle = "#ff5c8d";
  ctx.fillRect(-10, 4 - 14 * fillFrac - 0.5, 20, 14 * fillFrac + 1);
  ctx.restore();
  heartPath();
  ctx.lineWidth = 1.8 / (s / 10);
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.restore();
}

export function roundRectPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function drawStar(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a2) * r * 0.45, y + Math.sin(a2) * r * 0.45);
  }
  ctx.closePath();
  ctx.fill();
}
