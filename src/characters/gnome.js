// A lost gnome.

import { playPeep } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { bubbleQueue } from "../draw/bubbles.js";
import { roundRectPath } from "../draw/shapes.js";
import { wordAt } from "../effects/particles.js";

function spawnGnome() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  let y = rand(150, H - 90);
  for (let t = 0; t < 40 && Math.abs(y - 515) < 60; t++) {
    y = rand(150, H - 90);
  }
  game.gnome = {
    x: dir > 0 ? -50 : W + 50,
    y,
    dir,
    speed: 75,
    boost: 0,
    line: "I'm a gnome, how did I get here?",
    talkTimer: 1e9,
    phase: rand(0, 6.28)
  };
}

export function updateGnome(dt) {
  game.gnomeTimer -= dt;
  if (game.gnomeTimer <= 0 && !game.gnome && game.mode === "play") {
    spawnGnome();
  }
  if (!game.gnome) return;
  const g = game.gnome;
  if (g.boost > 0) g.boost -= dt;
  g.x += g.dir * g.speed * (g.boost > 0 ? 2.2 : 1) * dt;
  g.phase += dt * 8 * (g.boost > 0 ? 1.8 : 1);
  if (g.talkTimer > 0) g.talkTimer -= dt;
  if ((g.dir > 0 && g.x > W + 60) || (g.dir < 0 && g.x < -60)) {
    game.gnome = null;
    game.gnomeTimer = rand(60, 120);
  }
}

export function drawGnome() {
  if (!game.gnome) return;
  const g = game.gnome;
  const bob = Math.abs(Math.sin(g.phase)) * 2.5;
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(g.x, g.y + 2, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(g.x, g.y - bob);
  ctx.scale(g.dir, 1);
  ctx.strokeStyle = "#4a3b2a";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  const stride = Math.sin(g.phase) * 3.5;
  ctx.beginPath();
  ctx.moveTo(-3, -10);
  ctx.lineTo(-4 + stride, -1);
  ctx.moveTo(3, -10);
  ctx.lineTo(4 - stride, -1);
  ctx.stroke();
  ctx.fillStyle = "#6b4420";
  ctx.beginPath();
  ctx.ellipse(-5 + stride, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5 - stride, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#38a3a5";
  ctx.beginPath();
  ctx.moveTo(-10, -30);
  ctx.lineTo(10, -30);
  ctx.lineTo(12, -8);
  ctx.lineTo(-12, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#23706e";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#23706e";
  ctx.fillRect(-11, -19, 22, 4);
  ctx.fillStyle = "#ffd93d";
  ctx.fillRect(-2, -19.5, 4, 5);
  const swing = Math.sin(g.phase) * 3.5;
  ctx.strokeStyle = "#38a3a5";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-9, -28);
  ctx.lineTo(-13, -19 + swing);
  ctx.moveTo(9, -28);
  ctx.lineTo(13, -19 - swing);
  ctx.stroke();
  ctx.fillStyle = "#e8c49a";
  ctx.beginPath();
  ctx.arc(-13, -18 + swing, 2.5, 0, Math.PI * 2);
  ctx.arc(13, -18 - swing, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e8c49a";
  ctx.beginPath();
  ctx.arc(0, -46, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c99a6a";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#e8c49a";
  ctx.beginPath();
  ctx.moveTo(-10, -48);
  ctx.lineTo(-19, -52);
  ctx.lineTo(-10, -42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c99a6a";
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-1, -47, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -47, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(220, 40, 40, 0.85)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-2.6, -49.2);
  ctx.lineTo(-0.8, -48.2);
  ctx.moveTo(-0.2, -49);
  ctx.lineTo(-1.2, -47.4);
  ctx.moveTo(4.2, -49.2);
  ctx.lineTo(6.2, -48.2);
  ctx.moveTo(7, -49);
  ctx.lineTo(6.2, -47.4);
  ctx.stroke();
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(-0.8, -47, 1.4, 0, Math.PI * 2);
  ctx.arc(6.2, -47, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff9bb0";
  ctx.beginPath();
  ctx.arc(9.5, -43.5, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e8c49a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(11.5, -40);
  ctx.lineTo(20, -52);
  ctx.stroke();
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.arc(21, -54, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(20, -55, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3e8e41";
  ctx.beginPath();
  ctx.moveTo(-15, -55);
  ctx.lineTo(15, -55);
  ctx.quadraticCurveTo(11, -72, 19, -80);
  ctx.quadraticCurveTo(3, -79, 1, -60);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2f6b28";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#2f6b28";
  roundRectPath(-15, -58, 30, 5, 2);
  ctx.fill();
  ctx.restore();
  if (g.talkTimer > 0) {
    bubbleQueue.push({ x: g.x, top: g.y - 92, text: g.line, font: "bold 14px 'Comic Sans MS', 'Chalkboard SE', cursive", border: "#2f6b28", color: "#2f6b28" });
  }
}

export function onGnomeClick() {
  game.gnome.line = "stay away from me lucky charms!!!!";
  game.gnome.talkTimer = 1e9;
  game.gnome.boost = 2;
  playPeep();
  wordAt("!!", game.gnome.x, game.gnome.y - 58);
}
