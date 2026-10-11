// Maisy drives by in a big red bus and sometimes goes fishing.

import { playCrackle, playJingle, playPeep } from "../audio.js";
import { W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { bubbleQueue } from "../draw/bubbles.js";
import { roundRectPath } from "../draw/shapes.js";
import { wordAt } from "../effects/particles.js";

const MAISY_LINES = ["Hello! I'm Maisy!", "Where is my little black cat?", "Carrot!"];

function spawnMaisy() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  game.maisy = {
    x: dir > 0 ? -180 : W + 180,
    y: 528,
    dir,
    stopX: rand(270, 530),
    state: "driving",
    timer: 0,
    offX: 0,
    figX: 0,
    bit: false,
    phase: 0,
    line: pick(MAISY_LINES)
  };
}

export function updateMaisy(dt) {
  game.maisyTimer -= dt;
  if (game.maisyTimer <= 0 && !game.maisy && game.mode === "play") {
    spawnMaisy();
  }
  if (!game.maisy) return;
  const m = game.maisy;
  if (m.state === "driving") {
    m.x += m.dir * 150 * dt;
    m.phase += dt * 10;
    if ((m.dir > 0 && m.x >= m.stopX) || (m.dir < 0 && m.x <= m.stopX)) {
      m.state = "out";
      m.timer = 0.8;
      playJingle();
    }
  } else if (m.state === "out") {
    m.timer -= dt;
    m.offX = Math.min(46, ((0.8 - m.timer) / 0.8) * 46);
    m.figX = m.x + m.dir * m.offX;
    if (m.timer <= 0) {
      m.state = "talking";
      m.timer = 4.5;
    }
  } else if (m.state === "talking") {
    m.offX = 46;
    m.figX = m.x + m.dir * 46;
    m.timer -= dt;
    if (m.timer <= 0) {
      if (game.carrot) {
        m.state = "walkCarrot";
        m.offX = 46;
      } else if (Math.random() < 0.55) {
        m.state = "walkPond";
        m.offX = 46;
      } else {
        m.state = "back";
        m.timer = 0.8;
      }
    }
  } else if (m.state === "walkPond") {
    const dx = 212 - m.figX;
    m.figX += Math.sign(dx) * 120 * dt;
    m.dir = dx >= 0 ? 1 : -1;
    m.phase += dt * 10;
    if (Math.abs(dx) < 6) {
      m.state = "fishing";
      m.timer = 3.5;
      m.bit = false;
      playJingle();
    }
  } else if (m.state === "fishing") {
    m.timer -= dt;
    if (m.timer < 1.2 && !m.bit) {
      m.bit = true;
      game.particles.push({ type: "ring", x: m.figX + m.dir * 40, y: 514, life: 0.6, color: "#bfe8ff", size: 4 });
      playPeep();
    }
    if (Math.random() < 0.06) {
      game.particles.push({ type: "ring", x: m.figX + m.dir * 40, y: 514, life: 0.7, color: "#bfe8ff", size: 3 });
    }
    if (m.timer <= 0) {
      game.particles.push({ type: "fish", x: m.figX + m.dir * 40, y: 512, vx: m.dir * 90, vy: -170, life: 1.1 });
      game.particles.push({ type: "word", text: "I caught one!", x: m.figX, y: m.y - 90, life: 1.5 });
      playJingle();
      for (let i = 0; i < 6; i++) {
        game.particles.push({ type: "spark", x: m.figX + m.dir * 40, y: 512, vx: rand(-60, 60), vy: rand(-140, -60), life: 0.5, color: "#bfe8ff", size: rand(2, 3.5) });
      }
      m.state = "returnBack";
    }
  } else if (m.state === "walkCarrot") {
    if (!game.carrot) {
      m.state = "back";
      m.timer = 0.8;
    } else {
      const dx = game.carrot.x - m.figX;
      m.figX += Math.sign(dx) * 130 * dt;
      m.dir = dx >= 0 ? 1 : -1;
      m.phase += dt * 10;
      if (Math.abs(dx) < 22) {
        m.state = "eating";
        m.timer = 1.8;
        m.biteT = 0.4;
      }
    }
  } else if (m.state === "eating") {
    m.timer -= dt;
    m.biteT -= dt;
    if (m.biteT <= 0 && game.carrot) {
      m.biteT = 0.4;
      game.carrot.bites = Math.min(3, game.carrot.bites + 1);
      playCrackle(0);
      for (let i = 0; i < 4; i++) {
        game.particles.push({ type: "spark", x: game.carrot.x + rand(-8, 8), y: game.carrot.y - rand(0, 10), vx: rand(-50, 50), vy: rand(-80, -20), life: 0.5, color: "#ff8c42", size: rand(1.5, 3) });
      }
    }
    if (m.timer <= 0) {
      game.carrot = null;
      game.carrotTimer = rand(25, 50);
      game.particles.push({ type: "word", text: "yum!", x: m.figX, y: m.y - 84, life: 1.3 });
      playJingle();
      m.state = "returnBack";
    }
  } else if (m.state === "returnBack") {
    const dx = m.x + m.dir * 46 - m.figX;
    if (Math.abs(dx) < 6) {
      m.state = "back";
      m.timer = 0.8;
      m.offX = 46;
    } else {
      m.figX += Math.sign(dx) * 130 * dt;
      m.dir = dx >= 0 ? 1 : -1;
      m.phase += dt * 10;
    }
  } else if (m.state === "back") {
    m.timer -= dt;
    m.offX = Math.max(0, (m.timer / 0.8) * 46);
    m.figX = m.x + m.dir * m.offX;
    if (m.timer <= 0) {
      m.state = "drivingOff";
    }
  } else {
    m.x += m.dir * 190 * dt;
    m.phase += dt * 12;
    if (m.x < -220 || m.x > W + 220) {
      game.maisy = null;
      game.maisyTimer = rand(90, 150);
    }
  }
}

export function drawMaisy() {
  if (!game.maisy) return;
  const m = game.maisy;
  const walking = m.state === "walkCarrot" || m.state === "returnBack";
  const bob = m.state === "talking" ? Math.abs(Math.sin(game.time * 6)) * 4 : walking ? Math.abs(Math.sin(m.phase)) * 3 : 0;
  const hx = m.figX;
  const driving = m.state === "driving" || m.state === "drivingOff";

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(m.x, m.y + 16, 80, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d0342c";
  roundRectPath(m.x - 78, m.y - 62, 156, 76, 8);
  ctx.fill();
  ctx.strokeStyle = "#8f1f1a";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#bfe3f2";
  for (let i = 0; i < 4; i++) {
    roundRectPath(m.x - 66 + i * 34, m.y - 52, 26, 15, 4);
    ctx.fill();
    roundRectPath(m.x - 66 + i * 34, m.y - 26, 26, 15, 4);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  roundRectPath(m.x + m.dir * 58 - 22, m.y - 60, 44, 11, 3);
  ctx.fill();
  ctx.fillStyle = "#d0342c";
  ctx.font = "bold 8px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DUCK GAME", m.x + m.dir * 58, m.y - 54);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath();
  ctx.arc(m.x - m.dir * 66, m.y - 33, 5, 0, Math.PI * 2);
  ctx.fill();
  if (m.state === "out" || m.state === "talking" || m.state === "back") {
    ctx.fillStyle = "#3a2a20";
    roundRectPath(m.x + m.dir * 40 - (m.dir > 0 ? 0 : 14), m.y - 26, 14, 40, 3);
    ctx.fill();
  }
  ctx.fillStyle = "#2b2b2b";
  for (const wx of [m.x - 48, m.x, m.x + 48]) {
    ctx.beginPath();
    ctx.arc(wx, m.y + 14, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#9aa0a6";
  for (const wx of [m.x - 48, m.x, m.x + 48]) {
    ctx.beginPath();
    ctx.arc(wx, m.y + 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (driving) {
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    for (const wx of [m.x - 48, m.x, m.x + 48]) {
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(m.phase) * 4, m.y + 14 - Math.sin(m.phase) * 4);
      ctx.lineTo(wx + Math.cos(m.phase) * 4, m.y + 14 + Math.sin(m.phase) * 4);
      ctx.stroke();
    }
  }

  if (m.offX > 8) {
    const hx = m.x + m.dir * m.offX;
    const bob = m.state === "talking" ? Math.abs(Math.sin(game.time * 6)) * 4 : 0;
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(hx, m.y + 16, 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(hx, m.y - bob);
    ctx.scale(m.dir, 1);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.lineTo(-4, -1);
    ctx.moveTo(4, -8);
    ctx.lineTo(4, -1);
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(-5.5, 1, 5, 2.6, 0, 0, Math.PI * 2);
    ctx.ellipse(5.5, 1, 5, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(-10, -14);
    ctx.quadraticCurveTo(-19, -10, -17, -3);
    ctx.stroke();
    ctx.fillStyle = "#d0342c";
    ctx.beginPath();
    ctx.moveTo(-8, -30);
    ctx.lineTo(8, -30);
    ctx.lineTo(12, -8);
    ctx.lineTo(-12, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-4, -20, 1.6, 0, Math.PI * 2);
    ctx.arc(4, -14, 1.6, 0, Math.PI * 2);
    ctx.arc(0, -25, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -29, 5.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    if (m.state === "fishing") {
      ctx.strokeStyle = "#d0342c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, -28);
      ctx.lineTo(30, 8);
      ctx.stroke();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath();
      ctx.arc(20, -9, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "#d0342c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-8, -26);
      ctx.lineTo(-22, -58);
      ctx.stroke();
      ctx.fillStyle = "#ffd93d";
      ctx.beginPath();
      ctx.arc(-11, -33, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const wave = m.state === "talking" ? Math.sin(game.time * 8) * 0.5 : 0;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(7, -28);
    ctx.lineTo(14, -34 + wave * 8);
    ctx.moveTo(-7, -28);
    ctx.lineTo(-12, -19);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(14, -35 + wave * 8, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-12, -18, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (m.line === "Carrot!" && m.state === "talking") {
      ctx.fillStyle = "#ff8c42";
      ctx.beginPath();
      ctx.moveTo(12, -30 + wave * 8);
      ctx.lineTo(20, -27 + wave * 8);
      ctx.lineTo(15, -22 + wave * 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3e9e4f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, -31 + wave * 8);
      ctx.lineTo(12, -36 + wave * 8);
      ctx.moveTo(16.5, -30 + wave * 8);
      ctx.lineTo(16.5, -36 + wave * 8);
      ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -48, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-10, -62, 7, 0, Math.PI * 2);
    ctx.arc(10, -62, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-5, -50, 2, 0, Math.PI * 2);
    ctx.arc(5, -50, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -43, 3, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -41, 4, 0.25, Math.PI - 0.25);
    ctx.stroke();
    ctx.restore();
    if (m.state === "fishing") {
      const tipX = hx + m.dir * 30;
      const tipY = m.y - bob + 8;
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + m.dir * 10, 514);
      ctx.stroke();
      ctx.fillStyle = "#e63946";
      ctx.beginPath();
      ctx.arc(tipX + m.dir * 10, 514, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(tipX + m.dir * 10, 511.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (m.state === "talking") {
      bubbleQueue.push({ x: hx, top: m.y - 108, text: m.line, font: "bold 15px 'Comic Sans MS', 'Chalkboard SE', cursive", border: "#000", color: "#000", bw: 2.5 });
    }
  }
}

export function onMaisyClick() {
  playJingle();
  wordAt("TOOT TOOT!", game.maisy.x, game.maisy.y - 84);
}
