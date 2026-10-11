// The text overlay: score, level, what Duckie is up to.

import { H, W, ctx } from "./canvas.js";
import { save, xpNeed } from "./progression.js";
import { game } from "./state.js";
import { roundRectPath } from "./draw/shapes.js";
import { rideForStage } from "./duck/rides.js";
import { theme } from "./world/themes.js";

function statusText() {
  const duck = game.duck;
  if (duck.tripping > 0) return "WHOOPS! tripped over a log";
  switch (duck.brain) {
    case "seek": return "hunting for pellets";
    case "wander": return "waddling around";
    case "pond": return "going for a sip";
    case "drink": return "sipping... glug glug";
    case "nap": return "napping... zzz";
    case "chase": return "CHASING THE BUTTERFLY!";
    case "toRide": return rideForStage(game.stage) === "coaster" ? "going to the EGG COASTER!" : "going to the " + rideForStage(game.stage).toUpperCase() + "!";
    case "ride": return "RIDING THE EGG COASTER! WHEEE!";
    case "onRide": return "RIDING THE " + (duck.rideKind || "RIDE").toUpperCase() + "!!!";
    case "protest": return "CHASING OFF THE BULLDOZER!!";
    case "stand": return "getting BRAVE...";
    case "flee": return "RUNNING FROM A MEAN GOOSE!!";
    case "brave": return "CHASING THE GOOSE AWAY!!";
    case "collect": return "getting that HAT!";
    case "idle": return duck.hat ? "looking FABULOUS" : "thinking duck thoughts";
  }
  return "being a duck";
}

export function drawHUD() {
  ctx.font = "bold 26px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#2e5a1c";
  ctx.strokeText("STAGE " + game.stage + " (" + theme().name + "): PELLETS " + game.score + " / " + game.goal, 18, 14);
  ctx.fillStyle = "#fff";
  ctx.fillText("STAGE " + game.stage + " (" + theme().name + "): PELLETS " + game.score + " / " + game.goal, 18, 14);

  ctx.font = "bold 16px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.strokeText("BABY DUCKIES: " + game.ducklings.length, 18, 52);
  ctx.fillStyle = "#fff";
  ctx.fillText("BABY DUCKIES: " + game.ducklings.length, 18, 52);

  ctx.strokeText("HAT COLLECTION: " + game.hatCollection, 18, 76);
  ctx.fillStyle = "#fff";
  ctx.fillText("HAT COLLECTION: " + game.hatCollection, 18, 76);

  ctx.strokeText(save.level >= 6 ? "LEVEL 6 - LEGENDARY!" : "LEVEL " + save.level, 18, 100);
  ctx.fillStyle = "#fff";
  ctx.fillText(save.level >= 6 ? "LEVEL 6 - LEGENDARY!" : "LEVEL " + save.level, 18, 100);

  const progress = save.level >= 6 ? 1 : save.xp / xpNeed();
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  roundRectPath(18, 124, 150, 12, 6);
  ctx.fill();
  if (progress > 0) {
    ctx.fillStyle = "#ffd93d";
    roundRectPath(18, 124, Math.max(10, 150 * progress), 12, 6);
    ctx.fill();
  }
  ctx.strokeStyle = "#2e5a1c";
  ctx.lineWidth = 2;
  roundRectPath(18, 124, 150, 12, 6);
  ctx.stroke();

  ctx.font = "bold 16px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.textAlign = "right";
  ctx.strokeText("DUCKIE is " + statusText(), W - 16, 18);
  ctx.fillStyle = "#fff";
  ctx.fillText("DUCKIE is " + statusText(), W - 16, 18);

  ctx.font = "bold 15px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.textAlign = "center";
  ctx.strokeText("Click DUCKIE to say hi! Press R twice to reset your level!", W / 2, H - 34);
  ctx.fillStyle = "#fff";
  ctx.fillText("Click DUCKIE to say hi! Press R twice to reset your level!", W / 2, H - 34);

  ctx.font = "13px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.textAlign = "right";
  ctx.strokeText("M = sound " + (game.muted ? "OFF" : "ON"), W - 14, H - 28);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("M = sound " + (game.muted ? "OFF" : "ON"), W - 14, H - 28);
}
