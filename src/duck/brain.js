// Duckie's brain: deciding what to do next and getting there.

import { playBonk, playQuack } from "../audio.js";
import { H, W } from "../canvas.js";
import { excitedSpeed, walkSpeed } from "../progression.js";
import { game } from "../state.js";
import { pick, rand } from "../util.js";
import { updateCoasterRide } from "./coaster.js";
import { say } from "./duck.js";
import { pickupHat, startCollect } from "./hats.js";
import { startRide, updateGoingToRide, updateOnRide } from "./rides.js";
import { wordAt } from "../effects/particles.js";
import { logCollide } from "../world/logs.js";
import { eatNearbyPellets } from "../world/pellets.js";
import { pondInfo } from "../world/pond.js";

const TRIP_WORDS = ["WHOOPSIE!", "OOF!", "QUACK?!", "BONK!", "WOBBLY!"];

const SPOT_WORDS = ["OHH!", "PELLET!", "FOOD!", "YAY!"];

export function moveToward(tx, ty, speed, dt) {
  const duck = game.duck;
  const dx = tx - duck.x;
  const dy = ty - duck.y;
  const d = Math.hypot(dx, dy);
  if (d < 8) return true;
  duck.x += (dx / d) * speed * dt;
  duck.y += (dy / d) * speed * dt;
  if (Math.abs(dx) > 2) duck.facing = dx > 0 ? 1 : -1;
  duck.waddlePhase += dt * 11;
  duck.moving = true;
  return false;
}

function clampDuck() {
  const duck = game.duck;
  duck.x = Math.max(34, Math.min(W - 34, duck.x));
  duck.y = Math.max(60, Math.min(H - 34, duck.y));
}

function startSeek() {
  const duck = game.duck;
  let best = null;
  let bestD = Infinity;
  for (const p of game.pellets) {
    const d = Math.hypot(p.x - duck.x, p.y - duck.y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  if (!best) {
    startWander();
    return;
  }
  duck.brain = "seek";
  duck.target = { x: best.x, y: best.y };
  if (Math.random() < 0.3) say(pick(SPOT_WORDS), 1);
  game.lastAction = "seek";
}

function startWander() {
  game.duck.brain = "wander";
  game.duck.target = { x: rand(60, W - 60), y: rand(90, H - 60) };
  game.lastAction = "wander";
}

function startPond() {
  const p = pondInfo();
  const a = rand(0, Math.PI * 2);
  game.duck.brain = "pond";
  game.duck.target = {
    x: Math.max(40, Math.min(W - 40, p.x + Math.cos(a) * (p.rx + 30))),
    y: Math.max(60, Math.min(H - 40, p.y + Math.sin(a) * (p.ry + 25)))
  };
  game.lastAction = "pond";
}

function startDrink() {
  const duck = game.duck;
  duck.brain = "drink";
  duck.stateTimer = 2.2;
  duck.drinkTick = 0;
  say("glug glug!", 1.4);
  game.lastAction = "drink";
}

function startNap() {
  const duck = game.duck;
  duck.brain = "nap";
  duck.stateTimer = rand(4, 7);
  duck.napTick = 0.6;
  game.lastAction = "nap";
}

function startChase() {
  game.duck.brain = "chase";
  game.duck.stateTimer = 4;
  say("!!", 0.8);
  game.lastAction = "chase";
}

function startIdle() {
  const duck = game.duck;
  duck.brain = "idle";
  duck.stateTimer = rand(1, 2.5);
  if (Math.random() < 0.4) {
    say("QUACK!");
    playQuack();
  }
  if (Math.random() < 0.5) duck.facing *= -1;
  game.lastAction = "idle";
}

function decide() {
  game.duck.moving = false;
  if (game.groundHat) {
    startCollect();
    return;
  }
  const r = Math.random();
  if (r < 0.4) {
    startSeek();
  } else if (r < 0.52) {
    startPond();
  } else if (r < 0.6) {
    if (game.lastAction === "nap") startWander();
    else startNap();
  } else if (r < 0.7) {
    startChase();
  } else if (r < 0.8) {
    if (game.lastAction === "coaster") startWander();
    else startRide();
  } else if (r < 0.93) {
    startWander();
  } else {
    startIdle();
  }
}

function tripOverLog() {
  const duck = game.duck;
  duck.tripping = 1;
  duck.tripCooldown = 2.2;
  duck.brain = "tripped";
  say(pick(TRIP_WORDS));
  playBonk();
  for (let i = 0; i < 5; i++) {
    game.particles.push({
      type: "spark",
      x: duck.x,
      y: duck.y - 10,
      vx: rand(-70, 70),
      vy: rand(-90, -20),
      life: 0.5,
      color: "#ffe066",
      size: rand(3, 5)
    });
  }
}

// Chasing the butterfly: if Duckie catches up they make friends, and then it flutters off.
function updateChase(dt) {
  const duck = game.duck;
  duck.stateTimer -= dt;
  const d = Math.hypot(game.butterfly.x - duck.x, game.butterfly.y - duck.y);
  if (d < 30 && game.butterfly.flee <= 0) {
    game.butterfly.flee = 1.2;
    game.butterfly.ang = Math.atan2(game.butterfly.y - duck.y, game.butterfly.x - duck.x);
    duck.hop = 0.5;
    say("FRIEND!");
    playQuack();
    for (let i = 0; i < 6; i++) {
      game.particles.push({
        type: "spark",
        x: game.butterfly.x,
        y: game.butterfly.y,
        vx: rand(-80, 80),
        vy: rand(-80, 80),
        life: 0.5,
        color: pick(["#ff8fb1", "#d9b3ff", "#fff"]),
        size: rand(2, 4)
      });
    }
    decide();
  } else {
    const tx = game.butterfly.x - duck.facing * 14;
    const ty = game.butterfly.y + 26;
    if (moveToward(tx, ty, excitedSpeed(), dt) || duck.stateTimer <= 0) decide();
  }
}

// While Duckie is doing one of these, a hat appearing won't distract them.
const TOO_BUSY_FOR_HATS = new Set(["collect", "ride", "toRide", "onRide", "tripped", "flee", "stand", "brave", "protest"]);

// Moves Duckie along according to whatever they're currently doing.
export function updateDuck(dt) {
  const duck = game.duck;
  if (duck.tripping > 0) {
    duck.tripping -= dt;
    duck.dizzyAngle += dt * 9;
    if (duck.tripping <= 0) {
      duck.tripping = 0;
      decide();
    }
    return;
  }

  duck.moving = false;
  if (game.ecoRush > 0 && game.bulldozer && duck.brain !== "protest" && !duck.dragged) {
    duck.brain = "protest";
  }
  if (game.groundHat && !duck.dragged && !TOO_BUSY_FOR_HATS.has(duck.brain)) {
    startCollect();
  }
  if (duck.dragged) {
    duck.x = game.mouseX;
    duck.y = game.mouseY;
  } else {
    runBrain(duck, dt);
  }
  clampDuck();

  // No tripping while on a ride (the logs are on the ground!) or while running about with the goose and bulldozer.
  const canTrip = !["ride", "onRide", "flee", "brave", "protest"].includes(duck.brain);
  if (duck.tripCooldown <= 0 && !duck.dragged && canTrip) {
    for (const log of game.logs) {
      if (logCollide(duck.x, duck.y, log, 12)) {
        // Bounce off the log a bit so Duckie doesn't land on it again straight away.
        const ang = Math.atan2(duck.y - log.y, duck.x - log.x);
        duck.x += Math.cos(ang) * 22;
        duck.y += Math.sin(ang) * 22;
        clampDuck();
        tripOverLog();
        break;
      }
    }
  }

  if (duck.tripping <= 0) {
    eatNearbyPellets();
  }
}

function runBrain(duck, dt) {
  switch (duck.brain) {
    case "seek":
      if (moveToward(duck.target.x, duck.target.y, excitedSpeed(), dt)) decide();
      break;
    case "wander":
      if (moveToward(duck.target.x, duck.target.y, walkSpeed(), dt)) decide();
      break;
    case "pond":
      if (moveToward(duck.target.x, duck.target.y, walkSpeed(), dt)) startDrink();
      break;
    case "drink":
      duck.stateTimer -= dt;
      duck.drinkTick -= dt;
      if (duck.drinkTick <= 0) {
        duck.drinkTick = 0.55;
        game.particles.push({ type: "ring", x: duck.x + duck.facing * 20, y: duck.y + 22, life: 0.6, color: "#bde8ff", size: 5 });
      }
      if (duck.stateTimer <= 0) decide();
      break;
    case "nap":
      duck.stateTimer -= dt;
      duck.napTick -= dt;
      if (duck.napTick <= 0) {
        duck.napTick = 0.8;
        game.particles.push({ type: "zzz", x: duck.x + 16, y: duck.y - 42, life: 1.6 });
      }
      if (duck.stateTimer <= 0) {
        say("QUACK!", 1.2);
        playQuack();
        decide();
      }
      break;
    case "chase":
      updateChase(dt);
      break;
    case "toRide":
      updateGoingToRide(dt);
      break;
    case "onRide":
      updateOnRide(dt);
      break;
    case "ride":
      updateCoasterRide(dt);
      break;
    case "collect":
      if (!game.groundHat) {
        decide();
      } else if (moveToward(game.groundHat.x, game.groundHat.y, excitedSpeed(), dt)) {
        pickupHat();
      }
      break;
    case "protest": {
      const dozer = game.bulldozer;
      if (!dozer || game.ecoRush <= 0) {
        decide();
        break;
      }
      moveToward(dozer.x + (duck.x < dozer.x ? -75 : 75), dozer.y + 8, excitedSpeed() + 40, dt);
      if (Math.random() < 0.015) wordAt(pick(["SAVE THE TREES!", "HEY!!", "NOT OKAY!"]), duck.x, duck.y - 60);
      break;
    }
    case "flee": {
      if (!game.goose) {
        decide();
        break;
      }
      const dx = duck.x - game.goose.x;
      const dy = duck.y - game.goose.y;
      const d = Math.hypot(dx, dy) || 1;
      moveToward(duck.x + (dx / d) * 120, duck.y + (dy / d) * 120, excitedSpeed() + 15, dt);
      break;
    }
    case "stand":
      duck.moving = false;
      break;
    case "brave":
      if (!game.goose) {
        decide();
      } else {
        moveToward(game.goose.x, game.goose.y, excitedSpeed() + 45, dt);
      }
      break;
    case "idle":
      duck.stateTimer -= dt;
      if (duck.stateTimer <= 0) decide();
      break;
    default:
      decide();
  }
}
