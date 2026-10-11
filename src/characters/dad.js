// Yang Ching's dad, who would like them to get off the computer.

import { playBonk, playJingle } from "../audio.js";
import { W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { bubbleQueue } from "../draw/bubbles.js";
import { say } from "../duck/duck.js";
import { wordAt } from "../effects/particles.js";

function spawnDad() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  game.dad = {
    x: dir > 0 ? -90 : W + 90,
    y: 520,
    dir,
    stopX: rand(280, 520),
    state: "walking",
    timer: 0,
    phase: 0
  };
  say("HI DAD!!");
  playJingle();
  for (let i = 0; i < 4; i++) {
    game.particles.push({ type: "heart", x: game.duck.x + rand(-16, 16), y: game.duck.y - 34, life: rand(0.9, 1.3), size: rand(0.8, 1.3) });
  }
}

export function updateDad(dt) {
  game.dadTimer -= dt;
  if (game.dadTimer <= 0 && !game.dad && game.mode === "play") {
    spawnDad();
  }
  if (!game.dad) return;
  const d = game.dad;
  if (d.state === "walking") {
    d.x += d.dir * 70 * dt;
    d.phase += dt * 6;
    if ((d.dir > 0 && d.x >= d.stopX) || (d.dir < 0 && d.x <= d.stopX)) {
      d.state = "yelling";
      d.timer = 5;
      playBonk();
    }
  } else if (d.state === "yelling") {
    d.timer -= dt;
    if (d.timer <= 0) {
      d.state = "leaving";
      for (let i = 0; i < 5; i++) {
        game.particles.push({ type: "heart", x: d.x + rand(-24, 24), y: d.y - 74, life: rand(1, 1.5), size: rand(0.9, 1.4) });
      }
    }
  } else {
    d.x += d.dir * 85 * dt;
    d.phase += dt * 7;
    if (d.x < -110 || d.x > W + 110) {
      game.dad = null;
      game.dadTimer = rand(180, 300);
    }
  }
}

export function drawDad() {
  if (!game.dad) return;
  const d = game.dad;
  const yelling = d.state === "yelling";
  const walking = d.state === "walking" || d.state === "leaving";
  const bob = walking ? Math.abs(Math.sin(d.phase)) * 3 : Math.sin(game.time * 2) * 1.5;
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(d.x, d.y + 4, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(d.x, d.y - bob);
  ctx.scale(d.dir, 1);
  ctx.strokeStyle = "#3b6ea5";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  const stride = walking ? Math.sin(d.phase) * 4 : 0;
  ctx.beginPath();
  ctx.moveTo(-5, -12);
  ctx.lineTo(-6 + stride, -1);
  ctx.moveTo(5, -12);
  ctx.lineTo(6 - stride, -1);
  ctx.stroke();
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.ellipse(-7 + stride, 1, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(7 - stride, 1, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd90f";
  ctx.beginPath();
  ctx.arc(0, -34, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#3b6ea5";
  ctx.beginPath();
  ctx.ellipse(0, -18, 22, 11, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.stroke();
  ctx.strokeStyle = "#c9c9c9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-21, -27);
  ctx.lineTo(21, -27);
  ctx.stroke();

  ctx.strokeStyle = "#ffd90f";
  ctx.lineWidth = 6;
  if (yelling) {
    const hx2 = 16 + Math.cos(game.time * 15) * 14;
    const hy2 = -50 + Math.sin(game.time * 15) * 10;
    ctx.beginPath();
    ctx.moveTo(14, -52);
    ctx.lineTo(hx2, hy2);
    ctx.stroke();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx2 + 3, hy2 - 2, 6, -0.8, 0.9);
    ctx.stroke();
    ctx.fillStyle = "#ffd90f";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx2, hy2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    const swing = walking ? Math.sin(d.phase) * 5 : 0;
    ctx.beginPath();
    ctx.moveTo(14, -52);
    ctx.lineTo(17 + swing * 0.4, -36);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-14, -52);
  ctx.quadraticCurveTo(-12, -42, -2, -40);
  ctx.stroke();

  ctx.fillStyle = "#ffd90f";
  ctx.beginPath();
  ctx.arc(0, -68, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, -83);
  ctx.lineTo(-5, -88);
  ctx.moveTo(1, -84);
  ctx.lineTo(0, -89);
  ctx.moveTo(5, -82);
  ctx.lineTo(7, -86);
  ctx.stroke();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(-5, -70, 3.5, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(5, -70, 3.5, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffd90f";
  ctx.beginPath();
  ctx.ellipse(9, -65, 4.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1, -59, 6, 0.2, Math.PI - 0.4);
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.arc(-6, -58, 1, 0, Math.PI * 2);
  ctx.arc(-1, -56.5, 1, 0, Math.PI * 2);
  ctx.arc(4, -56.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (yelling) {
    bubbleQueue.push({
      x: d.x,
      top: d.y - 150,
      text: ["YANG CHING!!!!", "GET OFF THE", "COMPUTER!!!"],
      font: "bold 17px 'Comic Sans MS', 'Chalkboard SE', cursive",
      border: "#000",
      color: "#000",
      bw: 2.5,
      lineH: 20
    });
  }
}

export function onDadClick() {
  playJingle();
  wordAt("^_^", game.dad.x, game.dad.y - 95);
  game.particles.push({ type: "heart", x: game.dad.x + rand(-10, 10), y: game.dad.y - 64, life: 1.2, size: 1.2 });
}
