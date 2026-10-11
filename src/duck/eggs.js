// Eggs that Duckie lays and that hatch into ducklings.

import { playPeep, playPlop } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { TIERS, pickTier } from "../progression.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { drawStar } from "../draw/shapes.js";
import { say } from "./duck.js";

export function layEgg() {
  const duck = game.duck;
  const golden = Math.random() < 0.25;
  const tier = pickTier();
  game.eggs.push({
    x: Math.max(30, Math.min(W - 30, duck.x - duck.facing * 30)),
    y: Math.max(50, Math.min(H - 40, duck.y + 12)),
    timer: 0,
    hatching: false,
    golden,
    tier: tier.name
  });
  duck.hop = 0.35;
  say(golden ? "GOLDEN EGG!" : tier.name === "rainbow" ? "RAINBOW EGG!!" : "EGG!");
  playPlop();
}

function hatchDuckling(egg, ox) {
  game.ducklings.push({
    x: egg.x + (ox || 0),
    y: egg.y,
    facing: 1,
    waddlePhase: rand(0, Math.PI * 2),
    moving: false,
    peepTimer: rand(2, 5),
    skin: egg.tier || "classic"
  });
  game.particles.push({ type: "word", text: "peep!", x: egg.x + (ox || 0), y: egg.y - 30, life: 1.2 });
}

export function updateEggs(dt) {
  for (let i = game.eggs.length - 1; i >= 0; i--) {
    const egg = game.eggs[i];
    const tier = TIERS.find(t => t.name === egg.tier) || TIERS[0];
    egg.timer += dt;
    if (!egg.hatching && egg.timer >= 5 - tier.fast) {
      egg.hatching = true;
      egg.timer = 0;
    }
    if (egg.hatching && egg.timer >= 1.5) {
      const count = 1 + (tier.twins ? 1 : 0) + (egg.golden ? 1 : 0);
      const offs = count === 1 ? [0] : count === 2 ? [-16, 8] : [-24, 0, 14];
      for (const ox of offs) hatchDuckling(egg, ox);
      if (count >= 3) game.particles.push({ type: "word", text: "TRIPLE!!", x: egg.x, y: egg.y - 52, life: 1.4 });
      else if (count === 2) game.particles.push({ type: "word", text: "TWINS!", x: egg.x, y: egg.y - 52, life: 1.4 });
      playPeep();
      playPeep();
      for (let j = 0; j < 8 + count * 3; j++) {
        game.particles.push({
          type: "spark",
          x: egg.x,
          y: egg.y,
          vx: rand(-80, 80),
          vy: rand(-100, -10),
          life: rand(0.3, 0.6),
          color: pick(["#fff8ec", "#ffe873", "#fff"]),
          size: rand(2, 4)
        });
      }
      game.eggs.splice(i, 1);
    }
  }
}

export function drawEggs() {
  for (const egg of game.eggs) {
    const tier = TIERS.find(t => t.name === egg.tier) || TIERS[0];
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(egg.x, egg.y + 13, 10, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(egg.x, egg.y);
    if (egg.hatching) {
      ctx.translate(rand(-1.5, 1.5), 0);
    } else if (egg.timer % 2.5 < 0.35) {
      ctx.rotate(Math.sin(egg.timer * 40) * 0.09);
    }
    ctx.fillStyle = egg.golden ? "#ffd94d" : tier.name === "rainbow" ? "hsl(" + Math.round((game.time * 80) % 360) + ", 75%, 72%)" : tier.fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10.5, 13.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = egg.golden ? "#d9a616" : tier.shade;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (tier.spot && !egg.golden) {
      ctx.fillStyle = tier.spot;
      ctx.beginPath();
      ctx.arc(-3.5, -3, 2, 0, Math.PI * 2);
      ctx.arc(4, 2, 1.6, 0, Math.PI * 2);
      ctx.arc(-1, 6, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tier.name === "rainbow" && !egg.hatching) {
      ctx.fillStyle = "#fff";
      drawStar(Math.cos(game.time * 3) * 13, -10, 3.5);
    }
    if (egg.golden) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath();
      ctx.ellipse(-3.5, -5, 2.5, 4.5, -0.5, 0, Math.PI * 2);
      ctx.fill();
      if (!egg.hatching && (egg.timer % 1) < 0.5) {
        ctx.fillStyle = "#fff8d0";
        drawStar(10, -14, 5);
      }
    }
    if (egg.hatching) {
      ctx.strokeStyle = egg.golden ? "#b8860b" : tier.shade;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(-2, -4);
      ctx.lineTo(2, -7);
      ctx.lineTo(5, -2);
      ctx.stroke();
      if (egg.timer > 0.8) {
        ctx.beginPath();
        ctx.moveTo(-7, 3);
        ctx.lineTo(-3, 6);
        ctx.lineTo(1, 3);
        ctx.lineTo(6, 6);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

export function onEggClick(egg) {
  egg.hatching = true;
  egg.timer = 1.49;
  playPeep();
}
