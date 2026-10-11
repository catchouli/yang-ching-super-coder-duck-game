// Clouds drifting across the sky.

import { playPlop } from "../audio.js";
import { W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { theme } from "./themes.js";

export function makeClouds() {
  game.clouds = [];
  for (let i = 0; i < 3; i++) {
    game.clouds.push({ x: rand(0, W), y: rand(40, 140), v: rand(8, 20), s: rand(0.8, 1.4) });
  }
}

export function onCloudClick(cloud) {
  cloud.rain = 1.6;
  playPlop();
}

export function updateClouds(dt) {
  for (const c of game.clouds) {
    c.x += c.v * dt;
    if (c.x > W + 120) c.x = -120;
    if (c.rain > 0) {
      c.rain -= dt;
      if (Math.random() < 0.4) {
        game.particles.push({ type: "spark", x: c.x + rand(-22, 22), y: c.y + 22, vx: rand(-8, 8), vy: rand(90, 150), life: 0.5, color: "#9cd0ee", size: rand(1.5, 2.8) });
      }
    }
  }
}

export function drawClouds() {
  const th = theme();
  for (const c of game.clouds) {
    ctx.fillStyle = c.rain > 0 ? "rgba(140,150,175,0.95)" : th.night ? "rgba(200,210,230,0.5)" : "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 22 * c.s, 0, Math.PI * 2);
    ctx.arc(c.x + 26 * c.s, c.y + 6 * c.s, 18 * c.s, 0, Math.PI * 2);
    ctx.arc(c.x - 26 * c.s, c.y + 6 * c.s, 16 * c.s, 0, Math.PI * 2);
    ctx.fill();
  }
}
