// Apple trees, which can be chopped down (please don't).

import { playBonk } from "../audio.js";
import { ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { roundRectPath } from "../draw/shapes.js";
import { say } from "../duck/duck.js";
import { wordAt } from "../effects/particles.js";
import { logCollide } from "./logs.js";
import { nearPond } from "./pond.js";

export function makeTrees() {
  game.trees = [];
  let tries = 0;
  while (game.trees.length < 3 && tries < 400) {
    tries++;
    const x = rand(160, 640);
    const y = rand(180, 400);
    if (nearPond(x, y, 120)) continue;
    if (Math.hypot(x - 700, y - 500) < 170) continue;
    let bad = false;
    for (const t of game.trees) {
      if (Math.hypot(x - t.x, y - t.y) < 190) bad = true;
    }
    for (const l of game.logs) {
      if (logCollide(x, y, l, 40)) bad = true;
    }
    if (bad) continue;
    game.trees.push({ x, y, chop: 0, state: "alive", t: 0, regrow: 0, grow: 1, shake: 0, fallDir: 1, sway: rand(0, 6.28) });
  }
}

export function updateTrees(dt) {
  for (const tr of game.trees) {
    if (tr.shake > 0) tr.shake -= dt;
    if (tr.state === "falling") {
      tr.t += dt / 0.6;
      if (Math.random() < 0.4) {
        game.particles.push({ type: "spark", x: tr.x + tr.fallDir * 40 + rand(-30, 30), y: tr.y - 40 + rand(-25, 25), vx: rand(-40, 40), vy: rand(-30, 30), life: 0.6, color: pick(["#4caf50", "#3e8e41"]), size: rand(2, 4) });
      }
      if (tr.t >= 1) {
        tr.t = 1;
        tr.state = "stump";
        tr.regrow = rand(35, 50);
        game.logs.push({ x: tr.x + tr.fallDir * 60, y: tr.y - 6, rx: 55, ry: 26, v: 300, roll: 0, tilt: 0, rings: 3 });
        playBonk();
        for (let i = 0; i < 14; i++) {
          game.particles.push({ type: "spark", x: tr.x + tr.fallDir * 80 + rand(-20, 20), y: tr.y - 6 + rand(-10, 10), vx: rand(-60, 60), vy: rand(-90, -20), life: rand(0.4, 0.7), color: pick(["#4caf50", "#3e8e41", "#c9b894"]), size: rand(2, 4) });
        }
      }
    } else if (tr.state === "stump") {
      tr.regrow -= dt;
      if (tr.regrow <= 0) {
        tr.state = "growing";
        tr.grow = 0.15;
      }
    } else if (tr.state === "growing") {
      tr.grow += dt / 4;
      if (tr.grow >= 1) {
        tr.grow = 1;
        tr.state = "alive";
        tr.chop = 0;
        for (let i = 0; i < 10; i++) {
          game.particles.push({ type: "twinkle", x: tr.x + rand(-40, 40), y: tr.y - rand(20, 90), life: rand(0.5, 1), color: pick(["#4caf50", "#fff", "#ffd93d"]), size: rand(2, 4), seed: rand(0, 10) });
        }
      }
    }
  }
}

export function drawTrees() {
  for (const tr of game.trees) {
    const shk = tr.shake > 0 ? rand(-3, 3) : 0;
    if (tr.state === "stump") {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(tr.x, tr.y + 4, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8b5a2b";
      roundRectPath(tr.x - 12, tr.y - 14, 24, 18, 5);
      ctx.fill();
      ctx.strokeStyle = "#6b4420";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#c89b6a";
      ctx.beginPath();
      ctx.ellipse(tr.x, tr.y - 14, 11, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#9c7146";
      ctx.beginPath();
      ctx.ellipse(tr.x, tr.y - 14, 6, 2.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }
    const g = tr.state === "growing" ? tr.grow : 1;
    let rot = 0;
    if (tr.state === "falling") {
      const e = tr.t * tr.t;
      rot = e * (Math.PI / 2) * tr.fallDir;
    } else {
      rot = Math.sin(game.time * 0.8 + tr.sway) * 0.02;
    }
    ctx.save();
    ctx.translate(tr.x + shk, tr.y);
    ctx.rotate(rot);
    ctx.scale(g, g);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath();
    ctx.ellipse(0, 2, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8b5a2b";
    roundRectPath(-8, -58, 16, 58, 5);
    ctx.fill();
    ctx.strokeStyle = "#6b4420";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#3e8e41";
    ctx.beginPath();
    ctx.moveTo(3, -66);
    ctx.arc(-17, -66, 20, 0, Math.PI * 2);
    ctx.moveTo(37, -66);
    ctx.arc(17, -66, 20, 0, Math.PI * 2);
    ctx.moveTo(26, -84);
    ctx.arc(0, -84, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4caf50";
    ctx.beginPath();
    ctx.moveTo(6, -74);
    ctx.arc(-8, -74, 14, 0, Math.PI * 2);
    ctx.moveTo(22, -80);
    ctx.arc(10, -80, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e63946";
    for (const ap of [[-14, -70], [12, -62], [2, -92]]) {
      ctx.beginPath();
      ctx.arc(ap[0], ap[1], 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function onTreeClick(tr) {
  tr.chop++;
  tr.shake = 0.3;
  playBonk();
  wordAt("CHOP!", tr.x, tr.y - 85);
  for (let i = 0; i < 6; i++) {
    game.particles.push({ type: "spark", x: tr.x + rand(-12, 12), y: tr.y - rand(30, 55), vx: rand(-60, 60), vy: rand(-80, -20), life: 0.5, color: pick(["#c9b894", "#8b5a2b"]), size: rand(2, 3.5) });
  }
  if (tr.chop >= 2) {
    tr.state = "falling";
    tr.t = 0;
    tr.fallDir = Math.random() < 0.5 ? 1 : -1;
    game.ecoMsg = 6.5;
    say(pick(["OH NO! THE TREES!", "NOT THE FOREST!"]));
  }
}
