// Sparks, hearts, rings, floating words and all the other little effects.

import { ctx } from "../canvas.js";
import { game } from "../state.js";
import { drawStar } from "../draw/shapes.js";

export function drawParticles() {
  for (const p of game.particles) {
    // Floating words are drawn later with the speech bubbles, so they sit on top.
    if (p.type === "word") continue;
    if (p.type === "spark") {
      ctx.globalAlpha = Math.max(0, p.life * 2) * (0.7 + 0.3 * Math.sin(game.time * 40 + p.x * 7));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "flash") {
      ctx.globalAlpha = Math.max(0, p.life / 0.3) * 0.85;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size + (0.3 - p.life) * 500, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "twinkle") {
      const flick = 0.4 + 0.6 * Math.abs(Math.sin(game.time * 22 + p.seed * 3));
      ctx.globalAlpha = Math.max(0, p.life / 1.4) * flick;
      ctx.fillStyle = p.color;
      drawStar(p.x, p.y, p.size);
    } else if (p.type === "fish") {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx));
      ctx.fillStyle = "#ff9f1c";
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff7b1c";
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(-12, -4);
      ctx.lineTo(-12, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2b2b2b";
      ctx.beginPath();
      ctx.arc(4, -1, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === "ring") {
      ctx.globalAlpha = Math.max(0, p.life * 1.6);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === "zzz") {
      const age = 1.6 - p.life;
      ctx.globalAlpha = Math.max(0, p.life / 1.6);
      ctx.fillStyle = "#6a5acd";
      ctx.font = "bold " + (12 + age * 8) + "px 'Comic Sans MS', 'Chalkboard SE', cursive";
      ctx.fillText("z", p.x, p.y);
    } else if (p.type === "heart") {
      ctx.globalAlpha = Math.max(0, p.life / 1.3);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.size, p.size);
      ctx.fillStyle = "#ff6b9d";
      ctx.beginPath();
      ctx.arc(-2.4, -1.2, 2.6, 0, Math.PI * 2);
      ctx.arc(2.4, -1.2, 2.6, 0, Math.PI * 2);
      ctx.moveTo(-4.8, -0.4);
      ctx.lineTo(4.8, -0.4);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.type === "confetti") {
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

export function wordAt(text, x, y) {
  game.particles.push({ type: "word", text, x, y, life: 1.2 });
}

export function updateParticles(dt) {
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    if (p.type === "spark") {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
    } else if (p.type === "ring") {
      p.size += 90 * dt;
    } else if (p.type === "zzz") {
      p.y -= 26 * dt;
      p.x += Math.sin(game.time * 4 + p.life * 5) * 14 * dt;
    } else if (p.type === "word") {
      p.y -= 22 * dt;
    } else if (p.type === "heart") {
      p.y -= 45 * dt;
      p.x += Math.sin(game.time * 6 + p.life * 7) * 20 * dt;
    } else if (p.type === "twinkle") {
      p.y += 24 * dt;
      p.x += Math.sin(game.time * 3 + p.seed) * 12 * dt;
    } else if (p.type === "fish") {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
    }
    p.life -= dt;
    if (p.life <= 0 && p.type !== "confetti") game.particles.splice(i, 1);
  }
}
