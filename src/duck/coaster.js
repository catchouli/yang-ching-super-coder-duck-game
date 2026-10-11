// The egg coaster: a random spline track that Duckie and the babies ride around.

import { playWhee } from "../audio.js";
import { ctx } from "../canvas.js";
import { SKINS } from "../progression.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { roundRectPath } from "../draw/shapes.js";
import { say } from "./duck.js";
import { drawHatShape } from "./hats.js";
import { nearPond } from "../world/pond.js";

export function buildTrack() {
  const ring = [];
  const count = Math.floor(rand(9, 12));
  for (let i = 0; i < count; i++) {
    for (let tries = 0; tries < 80; tries++) {
      const p = { x: rand(90, 660), y: rand(95, 455) };
      if (nearPond(p.x, p.y, 30)) continue;
      let ok = true;
      for (const q of ring) {
        if (Math.hypot(p.x - q.x, p.y - q.y) < 80) ok = false;
      }
      if (Math.hypot(p.x - 700, p.y - 485) < 110) ok = false;
      if (ok) {
        ring.push(p);
        break;
      }
    }
  }
  ring.sort((a, b) => Math.atan2(a.y - 330, a.x - 400) - Math.atan2(b.y - 330, b.x - 400));
  const cps = [{ x: 700, y: 485 }, ...ring, { x: rand(600, 645), y: rand(468, 488) }];
  if (Math.random() < 0.7 && ring.length > 2) {
    const lp = ring[Math.floor(rand(0, ring.length))];
    let r = rand(42, 62);
    r = Math.min(r, Math.max(30, (lp.y - 80) / 1.7));
    const loopPts = [];
    for (let a = 0; a < 4; a++) {
      loopPts.push({
        x: lp.x + Math.cos((a / 4) * Math.PI * 2) * r,
        y: lp.y + Math.sin((a / 4) * Math.PI * 2) * r - r * 0.7
      });
    }
    cps.splice(cps.indexOf(lp) + 1, 0, ...loopPts);
  }
  const pts = [];
  const n = cps.length;
  for (let i = 0; i < n; i++) {
    const p0 = cps[(i - 1 + n) % n];
    const p1 = cps[i];
    const p2 = cps[(i + 1) % n];
    const p3 = cps[(i + 2) % n];
    for (let j = 0; j < 24; j++) {
      const t = j / 24;
      const t2 = t * t;
      const t3 = t2 * t;
      pts.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      });
    }
  }
  const cum = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i % pts.length];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = cum[pts.length];
  const ties = [];
  for (let d = 0; d < total; d += 26) {
    const p = pointOnTrack({ pts, cum, total }, d);
    const q = pointOnTrack({ pts, cum, total }, d + 3);
    ties.push({ x: p.x, y: p.y, ang: Math.atan2(q.y - p.y, q.x - p.x) });
  }
  const posts = [];
  for (let d = 60; d < total; d += 170) {
    const p = pointOnTrack({ pts, cum, total }, d);
    if (p.y < 420) posts.push(p);
  }
  return { pts, cum, total, ties, posts };
}

function pointOnTrack(tr, d) {
  d = ((d % tr.total) + tr.total) % tr.total;
  let lo = 0;
  let hi = tr.cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (tr.cum[mid] <= d) lo = mid;
    else hi = mid;
  }
  const a = tr.pts[lo % tr.pts.length];
  const b = tr.pts[(lo + 1) % tr.pts.length];
  const seg = tr.cum[lo + 1] - tr.cum[lo] || 1;
  const t = (d - tr.cum[lo]) / seg;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function trackAt(d) {
  return pointOnTrack(game.track, d);
}

export function drawCoasterTrack() {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#8a5a2b";
  ctx.lineWidth = 5;
  for (const p of game.track.posts) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 6);
    ctx.lineTo(p.x, 548);
    ctx.stroke();
  }
  ctx.beginPath();
  for (let i = 0; i < game.track.pts.length; i++) {
    const p = game.track.pts[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.strokeStyle = "#7a4a21";
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.strokeStyle = "#c9955c";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = "#6b4420";
  ctx.lineWidth = 3;
  for (const t of game.track.ties) {
    ctx.beginPath();
    ctx.moveTo(t.x - Math.sin(t.ang) * 9, t.y + Math.cos(t.ang) * 9);
    ctx.lineTo(t.x + Math.sin(t.ang) * 9, t.y - Math.cos(t.ang) * 9);
    ctx.stroke();
  }
  ctx.fillStyle = "#a9743f";
  roundRectPath(652, 503, 96, 12, 5);
  ctx.fill();
  ctx.strokeStyle = "#6b4420";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#7a4a21";
  ctx.fillRect(660, 515, 7, 22);
  ctx.fillRect(733, 515, 7, 22);
  ctx.fillRect(698, 448, 6, 56);
  ctx.fillStyle = "#d9a05b";
  roundRectPath(650, 432, 104, 26, 8);
  ctx.fill();
  ctx.strokeStyle = "#6b4420";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("EGG COASTER", 702, 446);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

function drawEggCar(x, y, s, golden, isBaby, facing, skin) {
  ctx.save();
  ctx.translate(x, y - 10);
  ctx.scale(s, s);
  ctx.scale(facing, 1);
  const babySk = SKINS[skin || "classic"] || SKINS.classic;
  const rainbow = skin === "rainbow";
  const babyBody = rainbow ? "hsl(" + Math.round((game.time * 70) % 360) + ", 72%, 66%)" : babySk.body;
  const babyShade = rainbow ? "hsl(" + Math.round((game.time * 70) % 360) + ", 72%, 40%)" : babySk.shade;
  const babyWing = rainbow ? "hsl(" + Math.round((game.time * 70 + 40) % 360) + ", 72%, 76%)" : babySk.wing;
  const flap = Math.sin(game.time * 13) * 0.2;
  if (isBaby) {
    ctx.fillStyle = babyBody;
    ctx.beginPath();
    ctx.ellipse(0, 6, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = babyShade;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.translate(-12, 0);
    ctx.rotate(-1 + flap);
    ctx.fillStyle = babyWing;
    ctx.beginPath();
    ctx.ellipse(0, -8, 4.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(12, 0);
    ctx.rotate(1 - flap);
    ctx.fillStyle = babyWing;
    ctx.beginPath();
    ctx.ellipse(0, -8, 4.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = babyBody;
    ctx.beginPath();
    ctx.arc(0, -13, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = babyShade;
    ctx.stroke();
    ctx.strokeStyle = "#d9b616";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-3, -24);
    ctx.lineTo(-5, -29);
    ctx.moveTo(3, -24);
    ctx.lineTo(4, -30);
    ctx.stroke();
    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.moveTo(9, -15);
    ctx.lineTo(21, -10);
    ctx.lineTo(9, -6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2b2b2b";
    ctx.beginPath();
    ctx.arc(4, -16, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(5, -17, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,130,130,0.45)";
    ctx.beginPath();
    ctx.ellipse(-2, -6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#ffd93d";
    ctx.beginPath();
    ctx.ellipse(0, 2, 21, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d9a616";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#f0b429";
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.lineTo(-30, -12);
    ctx.lineTo(-20, 6);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.translate(-14, -5);
    ctx.rotate(-1 + flap);
    ctx.fillStyle = "#f7c948";
    ctx.beginPath();
    ctx.ellipse(0, -9, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d9a616";
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(14, -5);
    ctx.rotate(1 - flap);
    ctx.fillStyle = "#f7c948";
    ctx.beginPath();
    ctx.ellipse(0, -9, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d9a616";
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#ffd93d";
    ctx.beginPath();
    ctx.arc(6, -20, 12.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d9a616";
    ctx.stroke();
    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.moveTo(16, -23);
    ctx.lineTo(30, -17);
    ctx.lineTo(16, -13);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d97f0e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,130,130,0.45)";
    ctx.beginPath();
    ctx.ellipse(3, -12, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b2b2b";
    ctx.beginPath();
    ctx.arc(9, -23, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(10.2, -24.2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    if (game.duck.hat) {
      ctx.save();
      ctx.translate(6, -32);
      drawHatShape(game.duck.hat);
      ctx.restore();
    }
  }
  ctx.fillStyle = golden ? "#ffd94d" : "#fff8ec";
  ctx.beginPath();
  ctx.ellipse(0, 10, 27, 18, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = golden ? "#d9a616" : "#d9c9a8";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = golden ? "#b8860b" : "#c9b894";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-24, 8);
  ctx.lineTo(-14, 3);
  ctx.lineTo(-4, 9);
  ctx.lineTo(6, 3);
  ctx.lineTo(16, 9);
  ctx.lineTo(25, 4);
  ctx.stroke();
  ctx.restore();
}

export function drawRideTrain() {
  const duck = game.duck;
  for (let i = game.ducklings.length - 1; i >= 0; i--) {
    const dl = game.ducklings[i];
    if (dl.mode) continue;
    drawEggCar(dl.x, dl.y, 0.55, false, true, dl.facing, dl.skin);
  }
  drawEggCar(duck.x, duck.y, 1, true, false, duck.facing);
}

// Two laps of the coaster, then back off at the station.
export function updateCoasterRide(dt) {
  const duck = game.duck;
  game.rideDist += 340 * dt;
  const pos = trackAt(game.rideDist);
  duck.x = pos.x;
  duck.y = pos.y - 8;
  const ahead = trackAt(game.rideDist + 4);
  duck.facing = ahead.x >= pos.x ? 1 : -1;
  if (game.rideDist >= (game.rideLaps + 1) * game.track.total) {
    game.rideLaps++;
    if (game.rideLaps >= 2) {
      duck.brain = "idle";
      duck.stateTimer = 1.6;
      duck.x = 675;
      duck.y = 502;
      duck.hop = 0.4;
      say(pick(["AGAIN! AGAIN!", "BEST RIDE EVER!", "SO FUN!!"]));
    } else {
      say("WHEEE!");
      playWhee();
    }
  }
}
