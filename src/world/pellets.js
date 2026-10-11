// Food pellets for Duckie to eat.

import { playPeep, playQuack } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { gainXP } from "../progression.js";
import { stageClear } from "../stage.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { say } from "../duck/duck.js";
import { layEgg } from "../duck/eggs.js";
import { wordAt } from "../effects/particles.js";
import { logCollide } from "./logs.js";
import { nearPond } from "./pond.js";

export const PELLET_COUNT = 5;

const EAT_WORDS = ["QUACK!", "YUM!", "NOM NOM!", "QUACK QUACK!", "TASTY!"];

export function spawnPellet() {
  for (let tries = 0; tries < 300; tries++) {
    const x = rand(60, W - 60);
    const y = rand(80, H - 60);
    if (nearPond(x, y, 20)) continue;
    if (Math.hypot(x - game.duck.x, y - game.duck.y) < 90) continue;
    let bad = false;
    for (const log of game.logs) {
      if (logCollide(x, y, log, 35)) bad = true;
    }
    for (const p of game.pellets) {
      if (Math.hypot(x - p.x, y - p.y) < 50) bad = true;
    }
    if (bad) continue;
    return { x, y, wobble: rand(0, Math.PI * 2) };
  }
  return { x: rand(60, W - 60), y: rand(80, H - 60), wobble: 0 };
}

export function drawPellets() {
  for (const p of game.pellets) {
    const wob = Math.sin(game.time * 3 + p.wobble) * 2;
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 9, 6, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d2a24c";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + wob, 6.5, 8.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a97c33";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(p.x - 2, p.y + wob - 3, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function onPelletClick(index, x, y) {
  game.pellets[index] = spawnPellet();
  playPeep();
  wordAt("NOM!", x, y - 10);
  for (let i = 0; i < 6; i++) {
    game.particles.push({ type: "spark", x, y, vx: rand(-70, 70), vy: rand(-90, -20), life: 0.4, color: "#ffd93d", size: rand(1.5, 3) });
  }
}

// Eats any pellets Duckie is standing on, laying an egg every second one.
export function eatNearbyPellets() {
  const duck = game.duck;
  for (let i = 0; i < game.pellets.length; i++) {
    const p = game.pellets[i];
    if (Math.hypot(duck.x - p.x, duck.y - p.y) < 30) {
      game.score++;
      gainXP(1);
      say(pick(EAT_WORDS));
      playQuack();
      duck.eggCounter++;
      if (duck.eggCounter >= 2) {
        duck.eggCounter = 0;
        layEgg();
      }
      game.pellets[i] = spawnPellet();
      for (let j = 0; j < 7; j++) {
        game.particles.push({
          type: "spark",
          x: p.x,
          y: p.y,
          vx: rand(-90, 90),
          vy: rand(-110, -10),
          life: rand(0.3, 0.6),
          color: pick(["#ffd93d", "#ffb347", "#fff3b0"]),
          size: rand(2, 4)
        });
      }
      game.particles.push({ type: "ring", x: p.x, y: p.y, life: 0.4, color: "#ffffff", size: 6 });
      if (game.score >= game.goal) {
        stageClear();
      }
    }
  }
}
