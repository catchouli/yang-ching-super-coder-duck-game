// Sets up a fresh game.

import { game } from "./state.js";
import { rand } from "./util.js";
import { makeBees } from "./critters/bees.js";
import { makeButterfly } from "./critters/butterfly.js";
import { makeFrogs } from "./critters/frogs.js";
import { buildTrack } from "./duck/coaster.js";
import { makeDuck } from "./duck/duck.js";
import { makeClouds } from "./world/clouds.js";
import { makeFlowers } from "./world/flowers.js";
import { placeLogs } from "./world/logs.js";
import { PELLET_COUNT, spawnPellet } from "./world/pellets.js";
import { makeTrees } from "./world/trees.js";
import { makeWeather } from "./world/weather.js";

export function reset() {
  game.score = 0;
  game.pellets = [];
  game.particles = [];
  game.eggs = [];
  game.ducklings = [];
  game.groundHat = null;
  game.hatTimer = 10;
  game.hatCollection = 0;
  game.visitors = [];
  game.visitorTimer = rand(10, 20);
  game.stage = 1;
  game.goal = 15;
  game.elon = null;
  game.elonTimer = rand(45, 90);
  game.fireworks = [];
  game.fireworkTimer = rand(12, 24);
  game.flocks = [];
  game.flockTimer = rand(14, 26);
  game.growTimer = rand(18, 30);
  game.wizard = null;
  game.wizardTimer = rand(15, 30);
  game.goose = null;
  game.gooseTimer = rand(40, 80);
  game.maisy = null;
  game.maisyTimer = rand(60, 100);
  game.carrot = null;
  game.carrotTimer = rand(15, 35);
  game.pondHits = 0;
  game.pondCooldown = 0;
  game.dad = null;
  game.dadTimer = rand(150, 260);
  game.gnome = null;
  game.gnomeTimer = rand(40, 80);
  game.ecoMsg = 0;
  game.bulldozer = null;
  game.dozerTimer = rand(40, 70);
  game.ecoRush = 0;
  makeWeather();
  game.duck = makeDuck();
  game.track = buildTrack();
  game.rideDist = 0;
  game.butterfly = makeButterfly();
  placeLogs();
  makeClouds();
  makeFlowers();
  makeBees();
  makeFrogs();
  makeTrees();
  game.flowerSeedTimer = rand(6, 12);
  for (let i = 0; i < PELLET_COUNT; i++) {
    game.pellets.push(spawnPellet());
  }
  game.lastAction = "";
  game.mode = "play";
}
