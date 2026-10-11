// Speech bubbles. Things queue them up while drawing and they're drawn last so they sit on top.

import { W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { roundRectPath } from "./shapes.js";

export const bubbleQueue = [];

export function drawSpeechBubble(b) {
  ctx.font = b.font;
  const lines = Array.isArray(b.text) ? b.text : [b.text];
  let lw = 0;
  for (const l of lines) lw = Math.max(lw, ctx.measureText(l).width);
  const lineH = b.lineH || 20;
  const w = lw + (b.pad !== undefined ? b.pad * 2 : 24);
  const h = b.h || lines.length * lineH + 10;
  const bx = Math.max(6, Math.min(W - 6 - w, b.x - w / 2));
  const by = b.top;
  ctx.fillStyle = b.bg || "rgba(255,255,255,0.95)";
  roundRectPath(bx, by, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = b.border || "#333";
  ctx.lineWidth = b.bw || 2;
  ctx.stroke();
  const tailX = Math.max(bx + 14, Math.min(bx + w - 14, b.x));
  ctx.fillStyle = b.bg || "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.moveTo(tailX - 7, by + h - 1);
  ctx.lineTo(tailX, by + h + 13);
  ctx.lineTo(tailX + 7, by + h - 1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = b.border || "#333";
  ctx.stroke();
  ctx.fillStyle = b.color || "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((l, i) => {
    ctx.fillText(l, bx + w / 2, by + 5 + lineH * i + lineH / 2);
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

export function drawBubbleLayer() {
  for (const b of bubbleQueue) drawSpeechBubble(b);
  bubbleQueue.length = 0;
  for (const p of game.particles) {
    if (p.type !== "word") continue;
    ctx.globalAlpha = Math.max(0, p.life / 1.2);
    ctx.font = "bold 14px 'Comic Sans MS', 'Chalkboard SE', cursive";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = "#d97f0e";
    ctx.fillText(p.text, p.x, p.y);
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
  }
}
