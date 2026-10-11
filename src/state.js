// All of the game's mutable state lives here so every module can share it. Most of it gets
// (re)initialised in reset(). Lots of things count down with timers, which are in seconds.

export const game = {
  // "play" normally, or "clear" while the stage clear banner is up
  mode: null,
  time: 0,
  stage: 1,
  score: 0,
  goal: 15,
  clearTimer: 0,
  muted: false,
  mouseX: 400,
  mouseY: 300,

  // Duckie and family
  duck: null,
  lastAction: "",
  eggs: [],
  ducklings: [],
  growTimer: 25,
  love: 0,
  loveShow: 0,
  groundHat: null,
  hatTimer: 10,
  hatCollection: 0,
  sparkleTick: 0,

  // The egg coaster
  track: null,
  rideDist: 0,
  rideLaps: 0,

  // Scenery
  pellets: null,
  logs: null,
  trees: [],
  flowers: null,
  flowerSeedTimer: 8,
  pickedFlower: null,
  clouds: null,
  weather: [],
  snowman: null,
  pondHits: 0,
  pondCooldown: 0,

  // Wildlife
  butterfly: null,
  bees: [],
  frogs: [],
  visitors: [],
  visitorTimer: 12,
  flocks: [],
  flockTimer: 18,
  goose: null,
  gooseTimer: 50,

  // Characters who drop by now and then
  elon: null,
  elonTimer: 60,
  teslaPitch: 0,
  teslaX: 0,
  teslaY: 0,
  maisy: null,
  maisyTimer: 70,
  // Maisy will walk over and eat a carrot if there's one lying around, but nothing puts one there yet.
  carrot: null,
  carrotTimer: 25,
  dad: null,
  dadTimer: 150,
  gnome: null,
  gnomeTimer: 45,
  wizard: null,
  wizardTimer: 20,
  spellMode: 0,
  bulldozer: null,
  dozerTimer: 45,
  // Set while everyone is chasing the bulldozer off
  ecoRush: 0,

  // Effects and pop-ups
  particles: null,
  fireworks: [],
  fireworkTimer: 14,
  shake: 0,
  sunHype: 0,
  levelBanner: 0,
  resetArm: 0,
  ecoMsg: 0,
  fineMsg: 0,
  matrixMode: 0,
  matrixCols: null,
  keanuFly: 0,
  keanuGone: false
};
