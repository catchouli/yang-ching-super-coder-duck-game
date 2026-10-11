// Stage clear celebrations and moving on to the next stage.

import { playWin } from "./audio.js";
import { H, W, ctx } from "./canvas.js";
import { gainXP } from "./progression.js";
import { game } from "./state.js";
import { pick, rand } from "./util.js";
import { say } from "./duck/duck.js";
import { PELLET_COUNT, spawnPellet } from "./world/pellets.js";
import { THEMES } from "./world/themes.js";
import { makeWeather } from "./world/weather.js";

export function stageClear() {
  game.mode = "clear";
  game.clearTimer = 4.5;
  playWin();
  gainXP(5);
  say("STAGE CLEAR!");
  for (let c = 0; c < 130; c++) {
    game.particles.push({
      type: "confetti",
      x: rand(0, W),
      y: rand(-350, -10),
      vx: rand(-25, 25),
      vy: rand(90, 220) / 60,
      rot: rand(0, Math.PI * 2),
      vr: rand(-4, 4),
      color: pick(["#ff8fb1", "#ffd93d", "#7ec850", "#5bc0eb", "#d9b3ff", "#ff9f1c"]),
      size: rand(5, 9)
    });
  }
}

function advanceStage() {
  game.stage++;
  game.goal = 15 + (game.stage - 1) * 5;
  game.score = 0;
  game.pellets = [];
  for (let i = 0; i < PELLET_COUNT; i++) {
    game.pellets.push(spawnPellet());
  }
  makeWeather();
  game.duck.brain = "idle";
  game.duck.stateTimer = 1.2;
  game.mode = "play";
}

export function drawStageClear() {
  const bounce = 1 + Math.sin(game.time * 6) * 0.05;
  ctx.save();
  ctx.translate(W / 2, H / 2 - 80);
  ctx.scale(bounce, bounce);
  ctx.font = "bold 58px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#b8860b";
  ctx.strokeText("STAGE " + game.stage + " CLEAR!", 0, 0);
  ctx.fillStyle = "#ffd93d";
  ctx.fillText("STAGE " + game.stage + " CLEAR!", 0, 0);
  ctx.font = "bold 24px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#2e5a1c";
  ctx.strokeText("next up: stage " + (game.stage + 1) + " - " + THEMES[game.stage % THEMES.length].name + "!", 0, 55);
  ctx.fillStyle = "#fff";
  ctx.fillText("next up: stage " + (game.stage + 1) + " - " + THEMES[game.stage % THEMES.length].name + "!", 0, 55);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

// While the stage clear banner is up, only the confetti moves.
export function updateStageClear(dt) {
    for (const p of game.particles) {
      if (p.type !== "confetti") continue;
      p.y += p.vy * dt * 60;
      p.x += p.vx * dt * 60;
      p.rot += p.vr * dt;
      if (p.y > H + 20) {
        p.y = -20;
        p.x = rand(0, W);
      }
    }
    game.clearTimer -= dt;
    if (game.clearTimer <= 0) advanceStage();
}
