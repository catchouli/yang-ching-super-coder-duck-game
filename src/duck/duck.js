// Duckie: their state, how they're drawn and how much they love you.

import { playQuack } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { save } from "../progression.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { bubbleQueue } from "../draw/bubbles.js";
import { drawHeartShape, drawStar } from "../draw/shapes.js";
import { drawHatShape } from "./hats.js";

export const LOVE_MAX = 20;

export function makeDuck() {
  return {
    x: W / 2,
    y: H / 2,
    facing: 1,
    waddlePhase: 0,
    moving: false,
    tripping: 0,
    tripCooldown: 0,
    dizzyAngle: 0,
    bubbleText: "",
    bubbleTimer: 0,
    blinkTimer: rand(2, 5),
    blinking: 0,
    brain: "idle",
    target: { x: W / 2, y: H / 2 },
    stateTimer: 1,
    drinkTick: 0,
    napTick: 0,
    hop: 0,
    happyTimer: 0,
    hat: null,
    rideKind: null,
    rideT: 0,
    launched: false,
    spinning: false,
    spinA: 0,
    fvx: 0,
    fvy: 0,
    flandY: 0,
    eggCounter: 0
  };
}

export function say(text, dur) {
  game.duck.bubbleText = text;
  game.duck.bubbleTimer = dur || 1.2;
}

export function petDuck() {
  const duck = game.duck;
  duck.happyTimer = 1.3;
  duck.hop = 0.5;
  game.love = Math.min(LOVE_MAX, game.love + 0.5);
  game.loveShow = 4;
  say(pick(["QUACK!", "HI YOU!", "HEHE!", "QUACK QUACK!", "YAY!"]));
  playQuack();
  for (let i = 0; i < 4; i++) {
    game.particles.push({ type: "heart", x: duck.x + rand(-14, 14), y: duck.y - 30, life: rand(0.9, 1.4), size: rand(0.8, 1.3) });
  }
}

export function drawLoveHeart() {
  if (game.loveShow <= 0 || game.love <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, game.loveShow * 1.5);
  const hx = game.duck.x + 36;
  const hy = game.duck.y - 55 + Math.sin(game.time * 3) * 3;
  drawHeartShape(hx, hy, 11 + (game.love / LOVE_MAX) * 15, game.love / LOVE_MAX);
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function drawDuck() {
  const duck = game.duck;
  const spin = duck.tripping > 0 ? (1 - duck.tripping) * Math.PI * 2 : duck.spinning ? duck.spinA : 0;
  const tilt = duck.tripping > 0 || duck.spinning ? spin : duck.moving ? Math.sin(duck.waddlePhase) * 0.13 : Math.sin(game.time * 2) * 0.03;
  let bob = duck.moving ? Math.abs(Math.cos(duck.waddlePhase)) * 3 : Math.sin(game.time * 2) * 1.2;
  if (duck.brain === "drink") bob += Math.abs(Math.sin(game.time * 6)) * 5;
  if (duck.hop > 0) bob -= Math.sin((1 - duck.hop / 0.5) * Math.PI) * 22;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(duck.x, duck.y + 27, 23, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(duck.x, duck.y - bob);
  ctx.rotate(tilt);
  const duckScale = 1 + (save.level - 1) * 0.05;
  ctx.scale(duck.facing * duckScale, duckScale);

  const footA = duck.moving ? Math.sin(duck.waddlePhase) * 5 : 0;
  const footB = duck.moving ? -Math.sin(duck.waddlePhase) * 5 : 0;
  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.ellipse(-6, 19 + footA, 6, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, 19 + footB, 6, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f0b429";
  ctx.beginPath();
  ctx.moveTo(-18, -4);
  ctx.lineTo(-33, -15);
  ctx.lineTo(-22, 5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd93d";
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d9a616";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.translate(-2, 3);
  ctx.rotate(-0.35 + Math.sin(duck.waddlePhase) * 0.12);
  ctx.fillStyle = "#f7c948";
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d9a616";
  ctx.stroke();
  ctx.restore();

  const headBob = Math.sin(duck.waddlePhase) * 1.5;
  ctx.fillStyle = "#ffd93d";
  ctx.beginPath();
  ctx.arc(14, -19 + headBob, 12.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d9a616";
  ctx.stroke();

  const happy = duck.happyTimer > 0;
  if (happy) {
    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.moveTo(24, -22 + headBob);
    ctx.lineTo(40, -17 + headBob);
    ctx.lineTo(24, -13 + headBob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e8890c";
    ctx.beginPath();
    ctx.moveTo(24, -13 + headBob);
    ctx.lineTo(36, -11.5 + headBob);
    ctx.lineTo(24, -9 + headBob);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.moveTo(24, -22 + headBob);
    ctx.lineTo(39, -16 + headBob);
    ctx.lineTo(24, -12 + headBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d97f0e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.fillStyle = happy ? "rgba(255,110,110,0.6)" : "rgba(255,130,130,0.45)";
  ctx.beginPath();
  ctx.ellipse(11, -11 + headBob, happy ? 5 : 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const eyesClosed = duck.blinking > 0 || duck.brain === "nap";
  if (happy && !eyesClosed) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(17, -21 + headBob, 3.2, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else if (eyesClosed) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, -21 + headBob);
    ctx.lineTo(20, -21 + headBob);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#2b2b2b";
    ctx.beginPath();
    ctx.arc(17, -22 + headBob, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(18.2, -23.2 + headBob, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (duck.hat) {
    ctx.save();
    ctx.translate(14, -31 + headBob);
    drawHatShape(duck.hat);
    ctx.restore();
  }
  ctx.restore();

  if (duck.tripping > 0.35) {
    for (let i = 0; i < 3; i++) {
      const a = duck.dizzyAngle + (i * Math.PI * 2) / 3;
      ctx.fillStyle = "#ffe066";
      drawStar(duck.x + Math.cos(a) * 26, duck.y - 58 + Math.sin(a) * 8, 6);
    }
  }

  if (duck.bubbleTimer > 0) {
    bubbleQueue.push({ x: duck.x, top: duck.y - 92, text: duck.bubbleText, font: "bold 18px 'Comic Sans MS', 'Chalkboard SE', cursive" });
  }
}

export function updateDuckTimers(dt) {
  const duck = game.duck;
  duck.blinkTimer -= dt;
  if (duck.blinkTimer <= 0) {
    duck.blinking = 0.13;
    duck.blinkTimer = rand(2, 5);
  }
  if (duck.blinking > 0) duck.blinking -= dt;

  if (duck.bubbleTimer > 0) duck.bubbleTimer -= dt;
  if (duck.tripCooldown > 0) duck.tripCooldown -= dt;
  if (duck.hop > 0) duck.hop -= dt;
  if (duck.happyTimer > 0) duck.happyTimer -= dt;
  if (save.level >= 5 && game.mode === "play" && duck.tripping <= 0) {
    game.sparkleTick -= dt;
    if (game.sparkleTick <= 0) {
      game.sparkleTick = 1.1;
      game.particles.push({ type: "spark", x: duck.x + rand(-18, 18), y: duck.y - rand(10, 46), vx: rand(-8, 8), vy: -28, life: 0.7, color: "#fff8d0", size: rand(2, 3.5) });
    }
  }
}
