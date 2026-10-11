// A wizard who finds it all most peculiar, and is very ticklish.

import { playJingle, playMatrix, playPeep } from "../audio.js";
import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { bubbleQueue } from "../draw/bubbles.js";
import { drawStar } from "../draw/shapes.js";
import { wordAt } from "../effects/particles.js";
import { logCollide } from "../world/logs.js";
import { nearPond } from "../world/pond.js";

const WIZARD_LINE = "HMMM. MOST PECULIAR";

function spawnWizard() {
  for (let tries = 0; tries < 300; tries++) {
    const x = rand(90, W - 90);
    const y = rand(120, H - 90);
    if (nearPond(x, y, 30)) continue;
    if (Math.hypot(x - game.duck.x, y - game.duck.y) < 110) continue;
    let bad = false;
    for (const log of game.logs) {
      if (logCollide(x, y, log, 35)) bad = true;
    }
    for (const fw of game.fireworks) {
      if (Math.hypot(x - fw.x, y - fw.y) < 70) bad = true;
    }
    if (game.groundHat && Math.hypot(x - game.groundHat.x, y - game.groundHat.y) < 70) bad = true;
    if (bad) continue;
    game.wizard = { x, y, state: "appear", timer: 0.5, tickles: 0, giggle: 0, giggleLine: "" };
    return;
  }
  game.wizardTimer = 8;
}

export function updateWizard(dt) {
  game.wizardTimer -= dt;
  if (game.wizardTimer <= 0 && !game.wizard) {
    spawnWizard();
  }
  if (!game.wizard) return;
  const w = game.wizard;
  w.timer -= dt;
  if (w.giggle > 0) {
    w.giggle -= dt;
    if (Math.random() < 0.25) {
      game.particles.push({ type: "twinkle", x: w.x + rand(-24, 24), y: w.y + rand(-55, 15), life: 0.5, color: "#e1bee7", size: rand(1.5, 3), seed: rand(0, 10) });
    }
    return;
  }
  if (w.state === "appear") {
    for (let i = 0; i < 2; i++) {
      game.particles.push({
        type: "twinkle",
        x: w.x + rand(-26, 26),
        y: w.y + rand(-50, 20),
        life: rand(0.4, 0.8),
        color: pick(["#b388ff", "#845ec2", "#e1bee7", "#fff"]),
        size: rand(2, 4),
        seed: rand(0, 10)
      });
    }
    if (w.timer <= 0) {
      w.state = "talk";
      w.timer = 4.5;
    }
  } else if (w.state === "talk") {
    if (Math.random() < 0.05) {
      game.particles.push({
        type: "twinkle",
        x: w.x + rand(-20, 20),
        y: w.y - rand(10, 50),
        life: rand(0.5, 0.9),
        color: "#b388ff",
        size: rand(1.5, 3),
        seed: rand(0, 10)
      });
    }
    if (w.timer <= 0) {
      w.state = "vanish";
      w.timer = 0.6;
    }
  } else {
    for (let i = 0; i < 2; i++) {
      game.particles.push({
        type: "twinkle",
        x: w.x + rand(-26, 26),
        y: w.y + rand(-60, 20),
        life: rand(0.4, 0.8),
        color: pick(["#b388ff", "#845ec2", "#e1bee7", "#fff"]),
        size: rand(2, 4),
        seed: rand(0, 10)
      });
    }
    if (w.timer <= 0) {
      game.wizard = null;
      game.wizardTimer = rand(35, 70);
    }
  }
}

export function drawWizard() {
  if (!game.wizard) return;
  const w = game.wizard;
  let a = 1;
  let s = 1;
  if (w.state === "appear") {
    const p = 1 - w.timer / 0.5;
    a = p;
    s = 0.4 + p * 0.6;
  } else if (w.state === "vanish") {
    const p = w.timer / 0.6;
    a = p;
    s = 0.4 + p * 0.6;
  }
  ctx.save();
  ctx.translate(w.x, w.y + Math.sin(game.time * 2) * 2);
  if (w.giggle > 0) ctx.translate(rand(-3, 3), rand(-1, 1));
  ctx.globalAlpha = a;
  ctx.scale(s, s);

  ctx.strokeStyle = "#7a4a21";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(16, 14);
  ctx.lineTo(16, -32);
  ctx.stroke();
  const orbPulse = 7 + Math.sin(game.time * 4) * 1.5;
  ctx.fillStyle = "rgba(179,136,255,0.35)";
  ctx.beginPath();
  ctx.arc(16, -38, orbPulse + 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b388ff";
  ctx.beginPath();
  ctx.arc(16, -38, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(14.5, -39.5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#845ec2";
  ctx.beginPath();
  ctx.moveTo(-13, -24);
  ctx.lineTo(13, -24);
  ctx.lineTo(20, 16);
  ctx.lineTo(-20, 16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a4a9c";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "#6a4a9c";
  ctx.beginPath();
  ctx.moveTo(-17, 10);
  ctx.lineTo(17, 10);
  ctx.stroke();
  ctx.fillStyle = "#ffd93d";
  drawStar(-8, 0, 2.5);
  drawStar(6, 5, 2);

  ctx.fillStyle = "#e8c49a";
  ctx.beginPath();
  ctx.arc(0, -31, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#845ec2";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-3.2, -32, 2, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(3.2, -32, 2, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(-5, -24, 5, 0, Math.PI * 2);
  ctx.arc(5, -24, 5, 0, Math.PI * 2);
  ctx.arc(0, -20, 6, 0, Math.PI * 2);
  ctx.arc(-2, -15, 4, 0, Math.PI * 2);
  ctx.arc(2, -15, 4, 0, Math.PI * 2);
  ctx.fill();

  if (w.state === "talk") {
    const stroke = Math.sin(game.time * 3) * 3;
    ctx.strokeStyle = "#845ec2";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, -20);
    ctx.lineTo(-3 + stroke * 0.3, -24 - stroke * 0.2);
    ctx.stroke();
    ctx.fillStyle = "#e8c49a";
    ctx.beginPath();
    ctx.arc(-2 + stroke * 0.3, -24 - stroke * 0.2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#6a4a9c";
  ctx.beginPath();
  ctx.ellipse(0, -39, 15, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#845ec2";
  ctx.beginPath();
  ctx.moveTo(-10, -40);
  ctx.lineTo(10, -40);
  ctx.lineTo(7, -62);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a4a9c";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#ffd93d";
  drawStar(1, -48, 3);
  if (game.spellMode > 0) {
    const pulse = 10 + Math.sin(game.time * 12) * 4;
    ctx.strokeStyle = "hsl(" + Math.round((game.time * 200) % 360) + ", 85%, 70%)";
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(16, -38, pulse + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 2; i++) {
      const oa = game.time * 6 + i * Math.PI;
      ctx.fillStyle = "#ffd93d";
      drawStar(16 + Math.cos(oa) * (pulse + 12), -38 + Math.sin(oa) * (pulse + 12), 4);
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1;

  if (w.giggle > 0) {
    bubbleQueue.push({ x: w.x, top: w.y - 100, text: w.giggleLine, font: "bold 14px 'Comic Sans MS', 'Chalkboard SE', cursive", border: "#6a4a9c", color: "#6a4a9c" });
  } else if (w.state === "talk" && w.timer > 1) {
    bubbleQueue.push({ x: w.x, top: w.y - 100, text: WIZARD_LINE, font: "bold 14px 'Comic Sans MS', 'Chalkboard SE', cursive", border: "#6a4a9c", color: "#6a4a9c" });
  }
}

export function onWizardClick() {
  game.wizard.tickles = (game.wizard.tickles || 0) + 1;
  if (game.wizard.tickles >= 3 && game.spellMode <= 0) {
    game.wizard.tickles = 0;
    game.wizard.giggle = 0;
    game.spellMode = 5;
    game.shake = 0.5;
    playMatrix();
    playJingle();
    wordAt(pick(["WIBBLY WOBBLY WONDEROUS!!", "ABRA-KA-DUCK-BRA!!", "HOCUS POCUS PECULIARUS!!"]), game.wizard.x, game.wizard.y - 76);
    for (let i = 0; i < 24; i++) {
      game.particles.push({
        type: "twinkle",
        x: game.wizard.x + rand(-40, 40),
        y: game.wizard.y + rand(-70, 30),
        life: rand(0.5, 1.1),
        color: pick(["#b388ff", "#ffd93d", "#5bc0eb", "#ff8fb1", "#fff"]),
        size: rand(2, 5),
        seed: rand(0, 10)
      });
    }
    game.particles.push({ type: "flash", x: game.wizard.x, y: game.wizard.y - 30, life: 0.3, size: 14 });
  } else {
    game.wizard.giggle = 2;
    game.wizard.giggleLine = pick(["AHAHA!! STOP!!", "HEHEHE!! THAT TICKLES!!", "HEE HEE!! NO MORE!!"]);
    playPeep();
    playPeep();
    for (let i = 0; i < 8; i++) {
      game.particles.push({
        type: "twinkle",
        x: game.wizard.x + rand(-26, 26),
        y: game.wizard.y + rand(-60, 20),
        life: rand(0.4, 0.9),
        color: pick(["#b388ff", "#e1bee7", "#fff"]),
        size: rand(2, 4),
        seed: rand(0, 10)
      });
    }
  }
}

// The wizard's spell makes the whole screen go wibbly for a few seconds.
export function updateSpell(dt) {
  if (game.spellMode <= 0) return;
  game.spellMode -= dt;
  game.shake = Math.max(game.shake, 0.06);
  if (Math.random() < 0.5) {
    game.particles.push({
      type: "spark",
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-60, 60),
      vy: rand(-80, 20),
      life: rand(0.4, 0.9),
      color: "hsl(" + Math.round(rand(0, 360)) + ", 85%, 65%)",
      size: rand(2, 5)
    });
  }
  if (Math.random() < 0.15) {
    game.particles.push({ type: "twinkle", x: rand(0, W), y: rand(0, H), life: rand(0.4, 0.8), color: pick(["#fff", "#ffd93d", "#b388ff", "#5bc0eb"]), size: rand(2, 4), seed: rand(0, 10) });
  }
}

// A rainbow tint over the whole screen while the spell lasts, with the odd flash.
export function drawSpellFlash() {
  if (game.spellMode <= 0) return;
  ctx.fillStyle = "hsla(" + Math.round((game.time * 260) % 360) + ", 85%, 60%, 0.1)";
  ctx.fillRect(0, 0, W, H);
  if (Math.random() < 0.1) {
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(0, 0, W, H);
  }
}
