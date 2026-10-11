// The per-frame draw, which layers everything in the right order.

import { H, W, ctx } from "./canvas.js";
import { drawHUD } from "./hud.js";
import { drawLevelBanner } from "./progression.js";
import { drawStageClear } from "./stage.js";
import { game } from "./state.js";
import { rand } from "./util.js";
import { drawBulldozer } from "./characters/bulldozer.js";
import { drawDad } from "./characters/dad.js";
import { drawElon } from "./characters/elon.js";
import { drawGnome } from "./characters/gnome.js";
import { drawMaisy } from "./characters/maisy.js";
import { drawSpellFlash, drawWizard } from "./characters/wizard.js";
import { drawBees } from "./critters/bees.js";
import { drawButterfly } from "./critters/butterfly.js";
import { drawFlocks } from "./critters/flocks.js";
import { drawFrogs } from "./critters/frogs.js";
import { drawGoose } from "./critters/goose.js";
import { drawVisitors } from "./critters/visitors.js";
import { drawBackground } from "./draw/background.js";
import { drawBubbleLayer, drawSpeechBubble } from "./draw/bubbles.js";
import { drawEcoMessage, drawFineNotice, drawTeslaPitch } from "./draw/overlays.js";
import { roundRectPath } from "./draw/shapes.js";
import { drawCoasterTrack, drawRideTrain } from "./duck/coaster.js";
import { drawDuck, drawLoveHeart } from "./duck/duck.js";
import { drawDucklings } from "./duck/ducklings.js";
import { drawEggs } from "./duck/eggs.js";
import { drawGroundHat } from "./duck/hats.js";
import { drawRide, rideForStage } from "./duck/rides.js";
import { drawFireworks } from "./effects/fireworks.js";
import { drawKeanu, drawMatrix, drawMatrixRain } from "./effects/matrix.js";
import { drawParticles } from "./effects/particles.js";
import { drawPickedFlower } from "./world/flowers.js";
import { drawLogs } from "./world/logs.js";
import { drawPellets } from "./world/pellets.js";
import { drawTrees } from "./world/trees.js";

export function draw() {
  const duck = game.duck;
  ctx.save();
  // Screen shake, and the wibbly-wobbly effect while the wizard's spell is active.
  if (game.shake > 0) {
    ctx.translate(rand(-1, 1) * game.shake * 14, rand(-1, 1) * game.shake * 14);
  }
  if (game.spellMode > 0) {
    ctx.translate(W / 2, H / 2);
    ctx.transform(1, Math.sin(game.time * 8) * 0.05, Math.sin(game.time * 6.5) * 0.05, 1, 0, 0);
    ctx.translate(-W / 2, -H / 2);
    ctx.translate(Math.sin(game.time * 5) * 8, Math.cos(game.time * 4.5) * 6);
  }
  // The scenery and everything on the ground, roughly back to front.
  drawBackground();
  drawFrogs();
  drawTrees();
  drawBulldozer();
  drawBees();
  if (rideForStage(game.stage) === "coaster") drawCoasterTrack();
  drawRide();
  drawLogs();
  drawPellets();
  drawGroundHat();
  drawFireworks();
  drawEggs();
  drawVisitors();
  drawElon();
  drawWizard();
  drawGoose();
  drawMaisy();
  drawDad();
  drawGnome();
  drawParticles();
  // On the coaster, Duckie and the babies are drawn sitting in their egg cars.
  if (duck.brain === "ride") {
    drawRideTrain();
  } else {
    if (!(duck.brain === "onRide" && duck.rideKind === "cannon" && !duck.launched)) drawDuck();
    drawDucklings();
  }
  drawLoveHeart();
  drawFlocks();
  drawButterfly();
  drawPickedFlower();
  drawMatrix();
  drawSpellFlash();

  // Text and banners on top of everything else.
  drawHUD();
  if (game.levelBanner > 0) drawLevelBanner();
  if (game.mode === "clear") drawStageClear();
  drawEcoMessage();
  drawFineNotice();
  drawBubbleLayer();
  drawTeslaPitch();
  ctx.restore();
}
