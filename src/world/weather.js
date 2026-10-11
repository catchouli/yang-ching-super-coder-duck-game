// Falling snow, leaves and petals.

import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { theme } from "./themes.js";

export function makeWeather() {
  game.weather = [];
  game.snowman = { x: 250, y: 250, state: "calm", timer: 0 };
  const w = theme().weather;
  if (!w) return;
  for (let i = 0; i < 34; i++) {
    game.weather.push({
      x: rand(0, W),
      y: rand(0, H),
      v: w === "snow" ? rand(25, 50) : rand(40, 75),
      sway: rand(0, 6.28),
      size: rand(2, 4.5),
      leaf: pick(["#d97f2e", "#c9542e", "#b8860b", "#e0a030"])
    });
  }
}

export function updateWeather(dt) {
  for (const f of game.weather) {
    f.y += f.v * dt;
    f.x += Math.sin(game.time * 2 + f.sway) * 18 * dt;
    if (f.y > H + 12) {
      f.y = -12;
      f.x = rand(0, W);
    }
  }
}

export function drawWeather() {
  const w = theme().weather;
  if (!w) return;
  for (const f of game.weather) {
    if (w === "snow") {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (w === "leaves") {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(game.time * 2 + f.sway);
      ctx.fillStyle = f.leaf;
      ctx.fillRect(-f.size, -f.size / 2, f.size * 2, f.size);
      ctx.restore();
    } else {
      ctx.fillStyle = "#ffb7d5";
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, f.size + 1, f.size * 0.6, Math.sin(game.time * 2 + f.sway), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
