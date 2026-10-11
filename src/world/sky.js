// The sky: the sun (which gets very excited if you click it), or the moon and stars at night.

import { playWhee } from "../audio.js";
import { W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { rand } from "../util.js";
import { theme } from "./themes.js";

export function onSunClick() {
  game.sunHype = 6;
  playWhee();
  for (let i = 0; i < 10; i++) {
    game.particles.push({
      type: "twinkle",
      x: 700 + rand(-70, 70),
      y: 82 + rand(-70, 70),
      life: rand(0.6, 1.1),
      color: "hsl(" + Math.round(rand(0, 360)) + ", 85%, 70%)",
      size: rand(2.5, 4.5),
      seed: rand(0, 10)
    });
  }
}

export function drawSky() {
  const th = theme();
  if (th.night) {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 26; i++) {
      const sx = (i * 137 + 40) % W;
      const sy = (i * 71 + 20) % 200;
      ctx.globalAlpha = 0.35 + 0.55 * Math.abs(Math.sin(game.time * 1.5 + i));
      ctx.beginPath();
      ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = th.sun;
    ctx.beginPath();
    ctx.arc(700, 82, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();
    ctx.arc(690, 74, 7, 0, Math.PI * 2);
    ctx.arc(710, 92, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const hype = game.sunHype > 0;
    const popT = hype ? Math.min(1, (6 - game.sunHype) / 0.6) : 0;
    const sunR = 38 * (1 + Math.sin(popT * Math.PI) * 0.22 + (hype ? Math.sin(game.time * 7) * 0.05 : 0));
    const sunCol = hype ? "hsl(" + Math.round((game.time * 90) % 360) + ", 85%, 65%)" : th.sun;
    const rayCol = hype ? "hsl(" + Math.round((game.time * 90 + 40) % 360) + ", 85%, 60%)" : th.sun;
    ctx.fillStyle = sunCol;
    ctx.beginPath();
    ctx.arc(700, 82, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rayCol;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    const raySpeed = hype ? 1.8 : 0.15;
    for (let i = 0; i < 12; i++) {
      const a = game.time * raySpeed + (i * Math.PI) / 6;
      const len = hype ? 12 + Math.sin(game.time * 9 + i) * 5 : 12;
      ctx.beginPath();
      ctx.moveTo(700 + Math.cos(a) * (sunR + 10), 82 + Math.sin(a) * (sunR + 10));
      ctx.lineTo(700 + Math.cos(a) * (sunR + 22 + len), 82 + Math.sin(a) * (sunR + 22 + len));
      ctx.stroke();
    }
    if (hype) {
      ctx.strokeStyle = "hsl(" + Math.round((game.time * 90 + 80) % 360) + ", 85%, 70%)";
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(700, 82, sunR + 14 + Math.sin(game.time * 3) * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(-12 + 700, 76, 5, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12 + 700, 76, 5, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(700, 80, 13, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,120,120,0.5)";
      ctx.beginPath();
      ctx.arc(682, 90, 5, 0, Math.PI * 2);
      ctx.arc(718, 90, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
