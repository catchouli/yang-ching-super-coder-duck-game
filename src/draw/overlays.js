// Big notices that pop up over the game when you do something you probably shouldn't.

// Shown when a tree gets chopped down.
import { W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { drawSpeechBubble } from "./bubbles.js";
import { roundRectPath } from "./shapes.js";

export function drawEcoMessage() {
  if (game.ecoMsg <= 0) return;
  const a = Math.max(0, Math.min(1, game.ecoMsg * 3, (6.5 - game.ecoMsg) * 2));
  game.shake = Math.max(game.shake, 0.1);
  ctx.globalAlpha = a;
  ctx.save();
  ctx.translate(W / 2, 248);
  ctx.scale(1 + Math.sin(game.time * 10) * 0.02, 1 + Math.sin(game.time * 10) * 0.02);
  ctx.fillStyle = "rgba(60, 0, 0, 0.85)";
  roundRectPath(-330, -66, 660, 132, 14);
  ctx.fill();
  ctx.strokeStyle = "#ff3b3b";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = Math.floor(game.time * 6) % 2 ? "#ffd93d" : "#ff5c5c";
  ctx.beginPath();
  ctx.arc(-300, -44, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 22px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.fillStyle = Math.floor(game.time * 6) % 2 ? "#ffd93d" : "#ff5c5c";
  ctx.fillText("!!! DEFORESTATION THREATENS US ALL !!!", 0, -42);
  ctx.font = "bold 14px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.fillStyle = "#fff";
  ctx.fillText("TREES MAKE OXYGEN, HOMES FOR ANIMALS, AND SHADE!", 0, -12);
  ctx.fillText("CHOPPING THEM ALL DOWN LEAVES NOWHERE FOR FOREST FRIENDS TO LIVE!", 0, 10);
  ctx.fillStyle = "#7cff8a";
  ctx.fillText("PLANT NEW TREES - THE EARTH IS COUNTING ON YOU, SUPER CODER!", 0, 32);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.restore();
  ctx.globalAlpha = 1;
}

// Shown if you keep scaring the fish out of the pond.
export function drawFineNotice() {
  if (game.fineMsg <= 0) return;
  const a = Math.max(0, Math.min(1, game.fineMsg * 2, (6 - game.fineMsg) * 2));
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  roundRectPath(W / 2 - 260, 190, 520, 118, 12);
  ctx.fill();
  ctx.strokeStyle = "#1c3f6e";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 20px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.fillStyle = "#1c3f6e";
  ctx.fillText("~~~ OVERFISHING NOTICE ~~~", W / 2, 216);
  ctx.font = "bold 17px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.fillStyle = "#b02020";
  ctx.fillText("YOU HAVE BEEN FINED 5 DOLLARS", W / 2, 248);
  ctx.fillText("FOR OVERFISHING.", W / 2, 274);
  ctx.save();
  ctx.translate(W / 2 + 175, 236);
  ctx.rotate(-0.3);
  ctx.strokeStyle = "rgba(200, 30, 30, 0.85)";
  ctx.lineWidth = 3;
  roundRectPath(-46, -17, 92, 34, 6);
  ctx.stroke();
  ctx.fillStyle = "rgba(200, 30, 30, 0.85)";
  ctx.font = "bold 20px 'Comic Sans MS', 'Chalkboard SE', cursive";
  ctx.fillText("FINED", 0, 1);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.globalAlpha = 1;
}

// What the man in the car says when you click on him.
export function drawTeslaPitch() {
  if (game.teslaPitch <= 0) return;
  const a = Math.max(0, Math.min(1, game.teslaPitch * 2, (4.5 - game.teslaPitch) * 3));
  ctx.globalAlpha = a;
  drawSpeechBubble({ x: game.teslaX, top: game.teslaY - 46, text: ["Buy a new Tesla", "Model 3 Roadster today!!!!"], font: "bold 15px 'Comic Sans MS', 'Chalkboard SE', cursive", lineH: 18, border: "#b8860b", color: "#8a5a00" });
  ctx.globalAlpha = 1;
}
