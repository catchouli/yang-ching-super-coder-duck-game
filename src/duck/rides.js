// The playground ride for each stage.

import { playBonk, playPlop, playWhee } from "../audio.js";
import { ctx } from "../canvas.js";
import { walkSpeed } from "../progression.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { drawStar, roundRectPath } from "../draw/shapes.js";
import { moveToward } from "./brain.js";
import { say } from "./duck.js";

export function rideForStage(s) {
  const rides = ["coaster", "catapult", "cannon", "trampoline", "slide"];
  return rides[(s - 1) % rides.length];
}

export function startRide() {
  const duck = game.duck;
  const kind = rideForStage(game.stage);
  duck.rideKind = kind;
  duck.brain = "toRide";
  duck.rideT = 0;
  duck.launched = false;
  duck.spinning = false;
  duck.spinA = 0;
  const spots = {
    coaster: { x: 675, y: 502 },
    catapult: { x: 320, y: 448 },
    cannon: { x: 195, y: 448 },
    trampoline: { x: 450, y: 448 },
    slide: { x: 238, y: 264 }
  };
  duck.target = spots[kind];
  say(kind === "coaster" ? "COASTER TIME!" : pick(["RIDE TIME!", "WHEE!", "MY TURN!"]));
  game.lastAction = "coaster";
}

function endRide() {
  const duck = game.duck;
  duck.brain = "idle";
  duck.stateTimer = 1.6;
  duck.rideKind = null;
  duck.spinning = false;
  game.lastAction = "coaster";
}

function slidePoint(t) {
  const x0 = 210, y0 = 235, cx = 110, cy = 310, x1 = 145, y1 = 498;
  const a = 1 - t;
  return {
    x: a * a * x0 + 2 * a * t * cx + t * t * x1,
    y: a * a * y0 + 2 * a * t * cy + t * t * y1
  };
}

export function drawRide() {
  const kind = rideForStage(game.stage);
  if (kind === "catapult") drawCatapult();
  else if (kind === "cannon") drawCannon();
  else if (kind === "trampoline") drawTrampoline();
  else if (kind === "slide") drawSlide();
}

function drawCatapult() {
  const duck = game.duck;
  let armA = -2.35;
  if (duck.brain === "onRide" && duck.rideKind === "catapult") {
    if (!duck.launched) armA = -2.35 - Math.sin(duck.rideT * 6) * 0.08;
    else armA = -0.6;
  }
  ctx.strokeStyle = "#6b4420";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(285, 448);
  ctx.lineTo(300, 418);
  ctx.moveTo(325, 448);
  ctx.lineTo(300, 418);
  ctx.stroke();
  ctx.save();
  ctx.translate(300, 418);
  ctx.rotate(armA + Math.PI);
  ctx.fillStyle = "#8a5a2b";
  roundRectPath(-56, -4, 58, 8, 3);
  ctx.fill();
  ctx.fillStyle = "#555";
  roundRectPath(0, -9, 14, 18, 3);
  ctx.fill();
  ctx.fillStyle = "#a9743f";
  ctx.beginPath();
  ctx.ellipse(-52, 0, 10, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6b4420";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#5c3a1a";
  ctx.beginPath();
  ctx.arc(300, 418, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawCannon() {
  const duck = game.duck;
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(150, 440, 10, 0, Math.PI * 2);
  ctx.arc(196, 440, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#888";
  ctx.beginPath();
  ctx.arc(150, 440, 4, 0, Math.PI * 2);
  ctx.arc(196, 440, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a4a21";
  roundRectPath(136, 418, 76, 14, 6);
  ctx.fill();
  ctx.save();
  ctx.translate(162, 424);
  ctx.rotate(-0.5);
  ctx.fillStyle = "#555";
  roundRectPath(0, -13, 74, 26, 10);
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#333";
  roundRectPath(70, -15, 8, 30, 3);
  ctx.fill();
  ctx.restore();
  if (duck.brain === "onRide" && duck.rideKind === "cannon" && !duck.launched && (duck.rideT * 6) % 1 < 0.5) {
    ctx.fillStyle = "#ffd93d";
    drawStar(225, 382, 4);
  }
}

function drawTrampoline() {
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(424, 428);
  ctx.lineTo(414, 452);
  ctx.moveTo(476, 428);
  ctx.lineTo(486, 452);
  ctx.stroke();
  ctx.fillStyle = "#3d8bfd";
  ctx.beginPath();
  ctx.ellipse(450, 430, 36, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e63946";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawSlide() {
  ctx.fillStyle = "#5ea83c";
  ctx.beginPath();
  ctx.ellipse(205, 262, 58, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5bc0eb";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i <= 14; i++) {
    const p = slidePoint(i / 14);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.strokeStyle = "#a8e4ff";
  ctx.lineWidth = 4;
  ctx.stroke();
}

// Walking over to the ride, then getting on when Duckie arrives.
export function updateGoingToRide(dt) {
  const duck = game.duck;
  if (moveToward(duck.target.x, duck.target.y, walkSpeed(), dt)) {
    if (duck.rideKind === "coaster") {
      duck.brain = "ride";
      game.rideDist = 0;
      game.rideLaps = 0;
      say("WHEEE!!");
      playWhee();
    } else {
      duck.brain = "onRide";
      duck.rideT = 0;
      duck.x = duck.target.x;
      duck.y = duck.target.y;
      if (duck.rideKind === "trampoline") say("BOING!");
    }
  }
}

// Riding the catapult, cannon, trampoline or slide.
export function updateOnRide(dt) {
  const duck = game.duck;
  duck.rideT += dt;
  const k = duck.rideKind;
  if (k === "catapult" || k === "cannon") {
    if (!duck.launched) {
      if (k === "catapult") {
        duck.x = 300 + Math.cos(-2.35) * 50;
        duck.y = 418 + Math.sin(-2.35) * 50;
        if (duck.rideT >= 0.5) {
          duck.launched = true;
          duck.spinning = true;
          duck.spinA = 0;
          const lx = rand(560, 700);
          const ly = rand(380, 460);
          const T = 1.5;
          duck.fvx = (lx - duck.x) / T;
          duck.fvy = (ly - duck.y) / T - 0.5 * 620 * T;
          duck.flandY = ly;
          say("AAAAA!");
          playWhee();
        }
      } else {
        if (duck.rideT >= 0.8) {
          duck.launched = true;
          duck.spinning = true;
          duck.spinA = 0;
          duck.x = 225;
          duck.y = 385;
          const lx = rand(560, 700);
          const ly = rand(360, 450);
          const T = 1.3;
          duck.fvx = (lx - duck.x) / T;
          duck.fvy = (ly - duck.y) / T - 0.5 * 620 * T;
          duck.flandY = ly;
          playBonk();
          for (let s = 0; s < 10; s++) {
            game.particles.push({ type: "spark", x: 225, y: 385, vx: rand(-60, 60), vy: rand(-60, 20), life: 0.5, color: "#ddd", size: rand(3, 6) });
          }
          say("BLAST OFF!");
        }
      }
    } else {
      duck.x += duck.fvx * dt;
      duck.y += duck.fvy * dt;
      duck.fvy += 620 * dt;
      duck.spinA += dt * 10;
      duck.facing = duck.fvx >= 0 ? 1 : -1;
      if (duck.fvy > 0 && duck.y >= duck.flandY) {
        duck.y = duck.flandY;
        duck.spinning = false;
        playBonk();
        for (let s = 0; s < 8; s++) {
          game.particles.push({ type: "spark", x: duck.x, y: duck.y + 10, vx: rand(-70, 70), vy: rand(-90, -20), life: 0.5, color: "#c9b894", size: rand(2.5, 5) });
        }
        game.particles.push({ type: "ring", x: duck.x, y: duck.y + 10, life: 0.4, color: "#fff", size: 6 });
        say(pick(["SAFE!", "STUCK THE LANDING!", "TADA!"]));
        duck.hop = 0.4;
        endRide();
      }
    }
  } else if (k === "trampoline") {
    duck.facing = 1;
    duck.y = 430 - Math.abs(Math.sin(duck.rideT * 4)) * Math.min(150, 40 + duck.rideT * 60);
    if (duck.rideT >= 2.9) {
      duck.x += 26;
      duck.y = 448;
      say("TADA!");
      endRide();
    }
  } else if (k === "slide") {
    const t = Math.min(1, duck.rideT / 2.2);
    const p = slidePoint(t);
    duck.x = p.x;
    duck.y = p.y;
    duck.facing = 1;
    if (t >= 1) {
      playPlop();
      for (let s = 0; s < 10; s++) {
        game.particles.push({ type: "spark", x: duck.x, y: duck.y, vx: rand(-70, 70), vy: rand(-120, -40), life: 0.5, color: "#a8e4ff", size: rand(2, 4) });
      }
      game.particles.push({ type: "ring", x: duck.x, y: duck.y, life: 0.6, color: "#e8f7ff", size: 6 });
      say("SPLASH!");
      endRide();
    }
  }
}
