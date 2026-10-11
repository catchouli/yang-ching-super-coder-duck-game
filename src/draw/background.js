// The grass, sky, pond and other scenery.

import { H, W, ctx } from "../canvas.js";
import { game } from "../state.js";
import { drawSnowman } from "../characters/snowman.js";
import { drawClouds } from "../world/clouds.js";
import { drawFlowers } from "../world/flowers.js";
import { drawPond, pondInfo } from "../world/pond.js";
import { drawSky } from "../world/sky.js";
import { theme } from "../world/themes.js";
import { drawWeather } from "../world/weather.js";
export function drawBackground() {
  const th = theme();
  ctx.fillStyle = th.grass1;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = th.grass2;
  for (let y = 0; y < H; y += 120) {
    ctx.fillRect(0, y, W, 60);
  }

  drawSky();
  drawClouds();
  drawPond();
  drawSnowman();
  drawFlowers();
  drawWeather();
}
