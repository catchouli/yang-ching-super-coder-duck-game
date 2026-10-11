// A man in a red car who stops by to say something profound.

import { playHonk, playJingle } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { roundRectPath } from "../draw/shapes.js";
import { wordAt } from "../effects/particles.js";

const ELON_WORDS = [
  "flamethrower",
  "mathematics",
  "mmmm donuts",
  "sandwich",
  "to the moon!",
  "lol",
  ["im gonna put humans", "on MARS!!"],
  ["AI will make a better", "version of the odyssey", "by the end of the year!!"]
];

function spawnElon() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  let y = rand(170, H - 110);
  for (let t = 0; t < 40 && Math.abs(y - 515) < 65; t++) {
    y = rand(170, H - 110);
  }
  const isMark = Math.random() < 0.15;
  game.elon = {
    x: dir > 0 ? -130 : W + 130,
    y,
    dir,
    stopX: rand(230, 570),
    state: "driving",
    timer: 0,
    offX: 0,
    word: isMark ? "mark" : pick(ELON_WORDS),
    isMark,
    phase: 0
  };
}

export function updateElon(dt) {
  game.elonTimer -= dt;
  if (game.elonTimer <= 0 && !game.elon) {
    spawnElon();
  }
  if (!game.elon) return;
  const e = game.elon;
  if (e.state === "driving") {
    e.x += e.dir * 170 * dt;
    e.phase += dt * 14;
    if ((e.dir > 0 && e.x >= e.stopX) || (e.dir < 0 && e.x <= e.stopX)) {
      e.state = "out";
      e.timer = 0.7;
    }
  } else if (e.state === "out") {
    e.timer -= dt;
    e.offX = Math.min(36, ((0.7 - e.timer) / 0.7) * 36);
    if (e.timer <= 0) {
      e.state = "talking";
      e.timer = e.isMark ? 5.5 : 3.6;
      if (e.isMark) playJingle();
    }
  } else if (e.state === "talking") {
    e.offX = 36;
    e.timer -= dt;
    if (e.timer <= 0) {
      e.state = "back";
      e.timer = 0.7;
    }
  } else if (e.state === "back") {
    e.timer -= dt;
    e.offX = Math.max(0, (e.timer / 0.7) * 36);
    if (e.timer <= 0) {
      e.state = "drivingOff";
    }
  } else {
    e.x += e.dir * 210 * dt;
    e.phase += dt * 16;
    if (e.x < -160 || e.x > W + 160) {
      game.elon = null;
      game.elonTimer = rand(75, 140);
    }
  }
}

export function drawElon() {
  if (!game.elon) return;
  const e = game.elon;
  const headX = e.x + e.dir * e.offX;
  const driving = e.state === "driving" || e.state === "drivingOff";
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(e.x, e.y + 16, 52, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e63946";
  roundRectPath(e.x - 42, e.y - 12, 84, 24, 10);
  ctx.fill();
  ctx.strokeStyle = "#a02636";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#e63946";
  roundRectPath(e.x - 24, e.y - 26, 46, 18, 8);
  ctx.fill();
  ctx.fillStyle = "#bfe3f2";
  roundRectPath(e.x - 19, e.y - 23, 36, 12, 4);
  ctx.fill();
  ctx.fillStyle = "#ffd93d";
  ctx.beginPath();
  ctx.moveTo(e.x - 2, e.y - 9);
  ctx.lineTo(e.x + 4, e.y - 9);
  ctx.lineTo(e.x + 1, e.y - 4);
  ctx.lineTo(e.x + 5, e.y - 4);
  ctx.lineTo(e.x - 2, e.y + 4);
  ctx.lineTo(e.x, e.y - 2);
  ctx.lineTo(e.x - 4, e.y - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(e.x - 26, e.y + 13, 9, 0, Math.PI * 2);
  ctx.arc(e.x + 26, e.y + 13, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9aa0a6";
  ctx.beginPath();
  ctx.arc(e.x - 26, e.y + 13, 4, 0, Math.PI * 2);
  ctx.arc(e.x + 26, e.y + 13, 4, 0, Math.PI * 2);
  ctx.fill();
  if (driving) {
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    for (const wx of [e.x - 26, e.x + 26]) {
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(e.phase) * 4, e.y + 13 - Math.sin(e.phase) * 4);
      ctx.lineTo(wx + Math.cos(e.phase) * 4, e.y + 13 + Math.sin(e.phase) * 4);
      ctx.stroke();
    }
  }
  if (e.offX > 8) {
    const bob = e.state === "talking" ? Math.abs(Math.sin(game.time * 3)) * 2 : 0;
    ctx.save();
    ctx.translate(headX, e.y - 4 - bob);
    ctx.strokeStyle = "#3b4a6b";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.lineTo(-3, 10);
    ctx.moveTo(3, 2);
    ctx.lineTo(3, 10);
    ctx.stroke();
    ctx.fillStyle = "#222";
    roundRectPath(-8, -12, 16, 16, 4);
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 4;
    const swing = e.state === "talking" ? Math.sin(game.time * 8) * 3 : 0;
    ctx.beginPath();
    ctx.moveTo(-7, -8);
    ctx.lineTo(-11, -1 + swing);
    ctx.moveTo(7, -8);
    ctx.lineTo(11, -1 - swing);
    ctx.stroke();
    ctx.fillStyle = "#e8b98a";
    ctx.beginPath();
    ctx.arc(0, -19, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = e.isMark ? "#1c1c1c" : "#2b2118";
    ctx.beginPath();
    ctx.arc(0, -21.5, 7.5, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    if (e.isMark) {
      ctx.fillStyle = "#ff5fa8";
      ctx.beginPath();
      ctx.ellipse(-2.6, -18.5, 3, 1.5, 0.25, 0, Math.PI * 2);
      ctx.ellipse(2.6, -18.5, 3, 1.5, -0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#2b2b2b";
    ctx.beginPath();
    ctx.arc(2.5, -20, 1.2, 0, Math.PI * 2);
    ctx.arc(-2, -20, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a3673a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0.5, -17.5, 3, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.restore();
    if (e.state === "talking") {
      if (e.isMark) {
        const lines = ["Hello everybody! My name is", "Markiplier, and welcome back", "to DUCK GAME!"];
        ctx.font = "bold 13px 'Comic Sans MS', 'Chalkboard SE', cursive";
        const bw = 210;
        const bx = headX - bw / 2;
        const by = e.y - 92;
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        roundRectPath(bx, by, bw, 52, 10);
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(headX - 7, by + 51);
        ctx.lineTo(headX, by + 64);
        ctx.lineTo(headX + 7, by + 51);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.stroke();
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        lines.forEach((line, i) => {
          ctx.fillText(line, headX, by + 12 + i * 15);
        });
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
      } else {
        ctx.font = "bold 18px 'Comic Sans MS', 'Chalkboard SE', cursive";
        const tw = ctx.measureText(e.word).width;
        const bw = tw + 24;
        const bx = headX - bw / 2;
        const by = e.y - 62;
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        roundRectPath(bx, by, bw, 30, 10);
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(headX - 7, by + 29);
        ctx.lineTo(headX, by + 42);
        ctx.lineTo(headX + 7, by + 29);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.stroke();
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(e.word, headX, by + 16);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
      }
    }
  }
}

export function onElonClick(x, y) {
  playHonk();
  game.teslaPitch = 4.5;
  game.teslaX = x;
  game.teslaY = y;
  for (let i = 0; i < 6; i++) {
    game.particles.push({
      type: "twinkle",
      x: game.elon.x + rand(-70, 70),
      y: game.elon.y + rand(-40, 10),
      life: rand(0.4, 0.8),
      color: pick(["#ffd93d", "#fff", "#bfe3f2"]),
      size: rand(2, 4),
      seed: rand(0, 10)
    });
  }
  if (game.dad) {
    wordAt("THE ONE I WANT!!", game.dad.x, game.dad.y - 100);
    game.particles.push({ type: "heart", x: game.dad.x, y: game.dad.y - 62, life: 1.3, size: 1.3 });
    playJingle();
  }
}
