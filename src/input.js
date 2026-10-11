// Mouse, touch and keyboard handling: working out what you clicked on and poking it.

import { actxInit, playQuack } from "./audio.js";
import { H, canvas } from "./canvas.js";
import { tryResetLevel } from "./progression.js";
import { game } from "./state.js";
import { pick, rand } from "./util.js";
import { onBulldozerClick } from "./characters/bulldozer.js";
import { onDadClick } from "./characters/dad.js";
import { onElonClick } from "./characters/elon.js";
import { onGnomeClick } from "./characters/gnome.js";
import { onMaisyClick } from "./characters/maisy.js";
import { onSnowmanClick } from "./characters/snowman.js";
import { onWizardClick } from "./characters/wizard.js";
import { onButterflyClick } from "./critters/butterfly.js";
import { onFlockClick } from "./critters/flocks.js";
import { onFrogClick } from "./critters/frogs.js";
import { onGooseClick } from "./critters/goose.js";
import { onVisitorClick } from "./critters/visitors.js";
import { petDuck, say } from "./duck/duck.js";
import { onDucklingClick } from "./duck/ducklings.js";
import { onEggClick } from "./duck/eggs.js";
import { onFireworkClick } from "./effects/fireworks.js";
import { onKeanuClick } from "./effects/matrix.js";
import { onCloudClick } from "./world/clouds.js";
import { flowerAt, giveFlower } from "./world/flowers.js";
import { logCollide, onLogClick } from "./world/logs.js";
import { onPelletClick } from "./world/pellets.js";
import { nearPond, onPondClick, pondInfo } from "./world/pond.js";
import { onSunClick } from "./world/sky.js";
import { theme } from "./world/themes.js";
import { onTreeClick } from "./world/trees.js";

// What happens when you click each kind of thing. Each handler gets the thing that was clicked
// (if there is one) and where the click was.
const clickHandlers = {
  sun: onSunClick,
  keanu: onKeanuClick,
  snowman: onSnowmanClick,
  firework: onFireworkClick,
  pond: (_, x, y) => onPondClick(x, y),
  log: onLogClick,
  tree: onTreeClick,
  bulldozer: onBulldozerClick,
  egg: onEggClick,
  frog: onFrogClick,
  goose: onGooseClick,
  wizard: onWizardClick,
  visitor: onVisitorClick,
  butterfly: onButterflyClick,
  elon: (_, x, y) => onElonClick(x, y),
  maisy: onMaisyClick,
  dad: onDadClick,
  bird: onFlockClick,
  gnome: onGnomeClick,
  duckling: onDucklingClick,
  cloud: onCloudClick,
  pellet: onPelletClick,
  duck: petDuck
};

// Finds the thing under the cursor. The order matters: things earlier in the list win when they overlap.
function hitTest(x, y) {
  if (Math.hypot(x - 700, y - 82) < 58) return { kind: "sun" };
  if (game.matrixMode > 0 && !game.keanuGone && !game.keanuFly && Math.hypot(x - 400, y - 430) < 62) return { kind: "keanu" };
  const snowman = game.snowman;
  if (theme().name === "WINTER" && snowman && snowman.state === "calm" && Math.hypot(x - snowman.x, y - (snowman.y - 20)) < 48) {
    return { kind: "snowman" };
  }
  for (const fw of game.fireworks) {
    if (fw.state === "idle" && Math.hypot(x - fw.x, y - fw.y) < 30) return { kind: "firework", target: fw };
  }
  const pond = pondInfo();
  const pdx = (x - pond.x) / pond.rx;
  const pdy = (y - pond.y) / pond.ry;
  if (pdx * pdx + pdy * pdy < 1) return { kind: "pond" };
  for (const log of game.logs) {
    if (logCollide(x, y, log, 8)) return { kind: "log", target: log };
  }
  for (const tree of game.trees) {
    if (tree.state === "alive" && Math.hypot(x - tree.x, y - (tree.y - 45)) < 62) return { kind: "tree", target: tree };
  }
  if (game.bulldozer && Math.hypot(x - game.bulldozer.x, y - game.bulldozer.y + 10) < 78) return { kind: "bulldozer" };
  for (const egg of game.eggs) {
    if (Math.hypot(x - egg.x, y - egg.y) < 16) return { kind: "egg", target: egg };
  }
  for (const frog of game.frogs) {
    if (Math.hypot(x - frog.x, y - frog.y + 6) < 24) return { kind: "frog", target: frog };
  }
  if (game.goose && Math.hypot(x - game.goose.x, y - game.goose.y + 5) < 46) return { kind: "goose" };
  if (game.wizard && Math.hypot(x - game.wizard.x, y - game.wizard.y + 10) < 30) return { kind: "wizard" };
  for (const visitor of game.visitors) {
    if (Math.hypot(x - visitor.x, y - visitor.y + 6) < 26) return { kind: "visitor", target: visitor };
  }
  if (Math.hypot(x - game.butterfly.x, y - game.butterfly.y) < 20) return { kind: "butterfly" };
  if (game.elon && Math.hypot(x - game.elon.x, y - game.elon.y) < 85) return { kind: "elon" };
  if (game.maisy && Math.hypot(x - game.maisy.x, y - game.maisy.y) < 88) return { kind: "maisy" };
  if (game.dad && Math.hypot(x - game.dad.x, y - game.dad.y + 30) < 52) return { kind: "dad" };
  for (const flock of game.flocks) {
    for (const bird of flock.birds) {
      if (Math.hypot(x - bird.x, y - bird.y) < 18) return { kind: "bird", target: flock };
    }
  }
  if (game.gnome && Math.hypot(x - game.gnome.x, y - game.gnome.y + 14) < 28) return { kind: "gnome" };
  for (const duckling of game.ducklings) {
    if (!duckling.mode && Math.hypot(x - duckling.x, y - duckling.y) < 20) return { kind: "duckling", target: duckling };
  }
  for (const cloud of game.clouds) {
    if (Math.hypot(x - cloud.x, y - cloud.y) < 32) return { kind: "cloud", target: cloud };
  }
  for (let i = 0; i < game.pellets.length; i++) {
    if (Math.hypot(x - game.pellets[i].x, y - game.pellets[i].y) < 13) return { kind: "pellet", target: i };
  }
  if (isOverDuck(x, y)) return { kind: "duck" };
  return null;
}

function isOverDuck(x, y) {
  return Math.hypot(x - game.duck.x, y - (game.duck.y - 5)) < 42;
}

// The canvas gets scaled to fit the window, so convert from screen pixels to game pixels.
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height)
  };
}

function onPointerMove(e) {
  const { x, y } = canvasPos(e);
  game.mouseX = x;
  game.mouseY = y;
  if (game.pickedFlower) {
    game.pickedFlower.x = x;
    game.pickedFlower.y = y;
    canvas.style.cursor = "grabbing";
    return;
  }
  if (game.duck.dragged) return;
  canvas.style.cursor = flowerAt(x, y) || hitTest(x, y) ? "pointer" : "default";
}

// Pressing on Duckie picks Duckie up, and pressing on a flower picks it.
function onPointerDown(e) {
  if (game.mode !== "play") return;
  const { x, y } = canvasPos(e);
  game.mouseX = x;
  game.mouseY = y;
  if (isOverDuck(x, y)) {
    canvas.setPointerCapture(e.pointerId);
    game.duck.dragged = true;
    game.duck.moving = false;
    say("QUACK?!");
    playQuack();
    canvas.style.cursor = "grabbing";
    return;
  }
  const flower = flowerAt(x, y);
  if (flower) {
    canvas.setPointerCapture(e.pointerId);
    game.pickedFlower = { f: flower, x, y };
    canvas.style.cursor = "grabbing";
  }
}

// Letting go puts Duckie down, or drops the flower: either on Duckie as a present or back into the ground.
function onPointerUp(e) {
  const duck = game.duck;
  if (duck.dragged) {
    duck.dragged = false;
    duck.hop = 0.4;
    duck.brain = "idle";
    duck.stateTimer = 1;
    say(pick(["WHEE!", "WHAT A RIDE!", "QUACK!"]));
    canvas.style.cursor = "default";
    return;
  }
  if (!game.pickedFlower) return;
  const { x, y } = canvasPos(e);
  const f = game.pickedFlower.f;
  game.flowers.splice(game.flowers.indexOf(f), 1);
  game.pickedFlower = null;
  if (Math.hypot(x - duck.x, y - (duck.y - 10)) < 55) {
    giveFlower();
  } else if (!nearPond(x, y, 10)) {
    game.flowers.push({ x, y: Math.min(H - 20, y), petal: f.petal, grow: 0.85, puff: 0, phase: rand(0, 6.28) });
  }
}

function onClick(e) {
  // Browsers only let us start audio after the player has interacted with the page.
  actxInit();
  if (game.mode !== "play") return;
  const { x, y } = canvasPos(e);
  const hit = hitTest(x, y);
  if (hit) clickHandlers[hit.kind](hit.target, x, y);
}

function onKeyDown(e) {
  actxInit();
  const k = e.key.toLowerCase();
  if (k === " " || k === "enter") e.preventDefault();
  if (k === "m") game.muted = !game.muted;
  if (k === "r") tryResetLevel();
  if (game.mode === "clear" && k === " ") game.clearTimer = 0;
}

export function setupInput() {
  window.addEventListener("keydown", onKeyDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("click", onClick);
}
