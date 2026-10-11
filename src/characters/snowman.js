// The winter snowman, who does not like being poked.

import { playBonk } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { wordAt } from "../effects/particles.js";
import { theme } from "../world/themes.js";

export function updateSnowman(dt) {
  if (!game.snowman || theme().name !== "WINTER") return;
  if (game.snowman.state === "angry") {
    game.snowman.timer -= dt;
    const dx = game.mouseX - game.snowman.x;
    const dy = game.mouseY - game.snowman.y;
    const d = Math.hypot(dx, dy) || 1;
    game.snowman.x = Math.max(30, Math.min(W - 30, game.snowman.x + (dx / d) * 130 * dt));
    game.snowman.y = Math.max(60, Math.min(H - 20, game.snowman.y + (dy / d) * 130 * dt));
    if (Math.random() < 0.15) {
      game.particles.push({ type: "spark", x: game.snowman.x + rand(-16, 16), y: game.snowman.y + 24, vx: rand(-25, 25), vy: rand(-45, -10), life: 0.4, color: "#fff", size: rand(1.5, 3) });
    }
    if (game.snowman.timer <= 0) game.snowman.state = "return";
  } else if (game.snowman.state === "return") {
    const dx = 250 - game.snowman.x;
    const dy = 250 - game.snowman.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) {
      game.snowman.x = 250;
      game.snowman.y = 250;
      game.snowman.state = "calm";
    } else {
      game.snowman.x += (dx / d) * 90 * dt;
      game.snowman.y += (dy / d) * 90 * dt;
    }
  }
}

export function onSnowmanClick() {
  game.snowman.state = "angry";
  game.snowman.timer = 8;
  playBonk();
  wordAt("GRRR!!", game.snowman.x, game.snowman.y - 70);
}

export function drawSnowman() {
  if (theme().name !== "WINTER" || !game.snowman) return;
  const sm = game.snowman;
  const angry = sm.state === "angry";
  const shakeX = angry ? Math.sin(game.time * 30) * 1.5 : 0;
  const tilt = angry ? Math.sin(game.time * 8) * 0.08 : 0;
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(sm.x, sm.y + 34, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(sm.x + shakeX, sm.y);
  ctx.rotate(tilt);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#c8d4dc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -42, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(-6, -46, 2.2, 0, Math.PI * 2);
  ctx.arc(6, -46, 2.2, 0, Math.PI * 2);
  ctx.fill();
  if (angry) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-11, -54);
    ctx.lineTo(-3, -50);
    ctx.moveTo(11, -54);
    ctx.lineTo(3, -50);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -35, 4.5, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.strokeStyle = "#e63946";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      const aa = (i * Math.PI) / 2 + Math.PI / 4 + Math.sin(game.time * 12) * 0.15;
      ctx.beginPath();
      ctx.moveTo(26 + Math.cos(aa) * 4, -60 + Math.sin(aa) * 4);
      ctx.lineTo(26 + Math.cos(aa) * 9, -60 + Math.sin(aa) * 9);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -36, 5, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(16, -40);
  ctx.lineTo(0, -38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(0, -8, 2.2, 0, Math.PI * 2);
  ctx.arc(0, 2, 2.2, 0, Math.PI * 2);
  ctx.arc(0, 12, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a4a21";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-24, -10);
  ctx.lineTo(-44, -22);
  ctx.moveTo(24, -10);
  ctx.lineTo(44, -20);
  ctx.stroke();
  ctx.fillStyle = "#e63946";
  ctx.fillRect(-14, -30, 28, 7);
  ctx.fillRect(-6, -26, 8, 14);
  ctx.restore();
}
