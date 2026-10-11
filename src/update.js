// The per-frame update that ticks everything in the world.

import { updateProgression } from "./progression.js";
import { updateStageClear } from "./stage.js";
import { game } from "./state.js";
import { updateBulldozer } from "./characters/bulldozer.js";
import { updateDad } from "./characters/dad.js";
import { updateElon } from "./characters/elon.js";
import { updateGnome } from "./characters/gnome.js";
import { updateMaisy } from "./characters/maisy.js";
import { updateSnowman } from "./characters/snowman.js";
import { updateSpell, updateWizard } from "./characters/wizard.js";
import { updateBees } from "./critters/bees.js";
import { updateButterfly } from "./critters/butterfly.js";
import { updateFlocks } from "./critters/flocks.js";
import { updateFrogs } from "./critters/frogs.js";
import { updateGoose } from "./critters/goose.js";
import { updateVisitors } from "./critters/visitors.js";
import { updateDuck } from "./duck/brain.js";
import { updateDuckTimers } from "./duck/duck.js";
import { updateDucklings } from "./duck/ducklings.js";
import { updateEggs } from "./duck/eggs.js";
import { updateHatSpawner } from "./duck/hats.js";
import { updateFireworkSpawner, updateFireworks } from "./effects/fireworks.js";
import { updateMatrix } from "./effects/matrix.js";
import { updateParticles } from "./effects/particles.js";
import { updateClouds } from "./world/clouds.js";
import { updateFlowers } from "./world/flowers.js";
import { updateLogs } from "./world/logs.js";
import { updateTrees } from "./world/trees.js";
import { updateWeather } from "./world/weather.js";

export function update(dt) {
  game.time += dt;

  // The world keeps ticking along even during the stage clear celebration.
  updateClouds(dt);
  updateButterfly(dt);
  updateEggs(dt);
  updateDucklings(dt);
  updateVisitors(dt);
  updateElon(dt);
  updateWizard(dt);
  updateLogs(dt);
  updateTrees(dt);
  updateBulldozer(dt);
  updateSnowman(dt);
  updateGoose(dt);
  updateMaisy(dt);
  updateDad(dt);
  updateGnome(dt);
  updateFlowers(dt);
  updateBees(dt);
  updateFrogs(dt);
  updateWeather(dt);
  updateFireworks(dt);
  updateFlocks(dt);

  // Count down the short-lived effects.
  if (game.shake > 0) game.shake -= dt;
  if (game.sunHype > 0) game.sunHype -= dt;
  if (game.ecoMsg > 0) game.ecoMsg -= dt;
  if (game.fineMsg > 0) game.fineMsg -= dt;
  if (game.pondCooldown > 0) game.pondCooldown -= dt;
  if (game.loveShow > 0) game.loveShow -= dt;
  if (game.teslaPitch > 0) game.teslaPitch -= dt;
  updateSpell(dt);
  updateMatrix(dt);

  if (game.mode === "clear") {
    updateStageClear(dt);
    return;
  }

  updateDuckTimers(dt);
  updateHatSpawner(dt);
  updateProgression(dt);
  updateFireworkSpawner(dt);
  updateDuck(dt);
  updateParticles(dt);
}
