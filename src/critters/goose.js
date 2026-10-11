// A mean goose who chases Duckie until Duckie stands up to it.

import { playHonk, playQuack } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { say } from "../duck/duck.js";
import { wordAt } from "../effects/particles.js";

function spawnGoose() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const y = Math.max(100, Math.min(H - 80, game.duck.y + rand(-40, 40)));
  game.goose = {
    x: dir > 0 ? -70 : W + 70,
    y,
    dir,
    state: "arrive",
    timer: 0,
    phase: 0,
    exitX: dir > 0 ? W + 90 : -90,
    exitY: y
  };
  playHonk();
  game.particles.push({ type: "word", text: "HONK!!", x: Math.max(40, Math.min(W - 40, game.goose.x)), y: y - 40, life: 1.3 });
}

export function updateGoose(dt) {
  const duck = game.duck;
  game.gooseTimer -= dt;
  if (game.gooseTimer <= 0 && !game.goose && game.mode === "play") {
    spawnGoose();
  }
  if (!game.goose) return;
  const g = game.goose;
  if (game.ecoRush > 0 && game.bulldozer) {
    const dx = game.bulldozer.x - g.x;
    const dy = game.bulldozer.y - g.y;
    const d = Math.hypot(dx, dy) || 1;
    g.x += (dx / d) * 240 * dt;
    g.y += (dy / d) * 240 * dt;
    g.dir = dx >= 0 ? 1 : -1;
    g.phase += dt * 14;
    if (Math.random() < 0.02) wordAt("HONK!!", g.x, g.y - 55);
    return;
  }
  if (g.state === "clickedFlee") {
    g.timer -= dt;
    const dx = g.x - duck.x;
    const dy = g.y - duck.y;
    const d = Math.hypot(dx, dy) || 1;
    g.x = Math.max(30, Math.min(W - 30, g.x + (dx / d) * 210 * dt));
    g.y = Math.max(90, Math.min(H - 60, g.y + (dy / d) * 210 * dt));
    g.dir = dx >= 0 ? 1 : -1;
    g.phase += dt * 13;
    if (g.timer <= 0) {
      if (g.resume === "flee") {
        g.state = "flee";
      } else {
        g.state = "chase";
        g.timer = 3;
        duck.brain = "flee";
        say(pick(["NOT AGAIN!", "OH NO!", "AAAAA!"]));
        playHonk();
      }
    }
    return;
  }
  if (g.state === "arrive") {
    const dx = duck.x - g.x;
    const dy = duck.y - g.y;
    const d = Math.hypot(dx, dy) || 1;
    g.x += (dx / d) * 150 * dt;
    g.y += (dy / d) * 150 * dt;
    g.dir = dx >= 0 ? 1 : -1;
    g.phase += dt * 9;
    if (d < 150) {
      g.state = "chase";
      g.timer = 4;
      duck.brain = "flee";
      say(pick(["AAAAA!", "HELP!", "A GOOSE!!"]));
      playHonk();
    }
  } else if (g.state === "chase") {
    g.timer -= dt;
    const dx = duck.x - g.x;
    const dy = duck.y - g.y;
    const d = Math.hypot(dx, dy) || 1;
    g.x += (dx / d) * 185 * dt;
    g.y += (dy / d) * 185 * dt;
    g.dir = dx >= 0 ? 1 : -1;
    g.phase += dt * 11;
    if (g.timer <= 0) {
      g.state = "standoff";
      g.timer = 1.2;
      duck.brain = "stand";
      duck.moving = false;
      duck.facing = g.x >= duck.x ? 1 : -1;
      duck.hop = 0.4;
      say("HEY!!");
      game.particles.push({ type: "word", text: "HONK?!", x: g.x, y: g.y - 45, life: 1.2 });
    }
  } else if (g.state === "standoff") {
    g.timer -= dt;
    if (g.timer <= 0) {
      g.state = "flee";
      g.exitY = Math.max(100, Math.min(H - 70, g.y));
      duck.brain = "brave";
      say("QUAAAAACK!!");
      playQuack();
      playQuack();
    }
  } else if (g.state === "flee") {
    const dx = g.exitX - g.x;
    const dy = g.exitY - g.y;
    const d = Math.hypot(dx, dy) || 1;
    g.x += (dx / d) * 190 * dt;
    g.y += (dy / d) * 190 * dt;
    g.dir = dx >= 0 ? 1 : -1;
    g.phase += dt * 12;
    if ((g.dir > 0 && g.x > W + 80) || (g.dir < 0 && g.x < -80)) {
      game.goose = null;
      game.gooseTimer = rand(60, 120);
      duck.brain = "idle";
      duck.stateTimer = 1.5;
      duck.hop = 0.5;
      duck.happyTimer = 1.4;
      say(pick(["VICTORY!", "AND STAY OUT!", "MY POND!"]));
      for (let j = 0; j < 5; j++) {
        game.particles.push({ type: "heart", x: duck.x + rand(-16, 16), y: duck.y - 30, life: rand(0.9, 1.3), size: rand(0.8, 1.3) });
      }
    }
  }
}

export function drawGoose() {
  if (!game.goose) return;
  const g = game.goose;
  const moving = g.state !== "standoff";
  const bob = moving ? Math.abs(Math.sin(g.phase)) * 3 : Math.sin(game.time * 2) * 1;
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(g.x, g.y + 20, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(g.x, g.y - bob);
  if (moving) ctx.rotate(Math.sin(g.phase) * 0.06);
  ctx.scale(g.dir * 1.4, 1.4);

  const f = moving ? Math.sin(g.phase) * 5 : 0;
  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.ellipse(-6, 15 + f, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, 15 - f, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#cfcfcf";
  ctx.beginPath();
  ctx.ellipse(0, 2, 19, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#9a9a9a";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#bdbdbd";
  ctx.save();
  ctx.translate(-2, -1);
  ctx.rotate(moving ? Math.sin(g.phase * 1.5) * 0.15 : 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#cfcfcf";
  ctx.beginPath();
  ctx.moveTo(-16, -6);
  ctx.lineTo(-25, -12);
  ctx.lineTo(-18, 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#2b2b2b";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(12, -7);
  ctx.quadraticCurveTo(21, -16, 16, -28);
  ctx.stroke();
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(15, -31, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(16.5, -32.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(17, -32.5, 1.1, 0, Math.PI * 2);
  ctx.fill();
  if (g.state === "chase" || g.state === "arrive") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(12, -37);
    ctx.lineTo(20, -35);
    ctx.stroke();
  }
  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.moveTo(20, -33);
  ctx.lineTo(30, -30);
  ctx.lineTo(20, -27);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function onGooseClick() {
  playHonk();
  wordAt("HONK!!", game.goose.x, game.goose.y - 50);
  if (game.goose.state !== "clickedFlee") {
    game.goose.resume = game.goose.state;
    game.goose.state = "clickedFlee";
    game.goose.timer = 1.5;
  }
}
