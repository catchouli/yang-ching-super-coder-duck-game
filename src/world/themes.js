// Each stage has a theme (season or time of day).

import { game } from "../state.js";

export const THEMES = [
  { name: "SPRING", grass1: "#7ec850", grass2: "#74bd4a", water: "#5bc0eb", waterLine: "#4aa8d8", sun: "#ffdd55", night: false, weather: null },
  { name: "AUTUMN", grass1: "#d9a24a", grass2: "#cf9640", water: "#5bc0eb", waterLine: "#4aa8d8", sun: "#ffc04d", night: false, weather: "leaves" },
  { name: "WINTER", grass1: "#eef4f8", grass2: "#dfe9f0", water: "#9cc8e0", waterLine: "#7fb0cc", sun: "#ffe9a8", night: false, weather: "snow" },
  { name: "NIGHT", grass1: "#3e7a4e", grass2: "#356b44", water: "#2e5a7a", waterLine: "#254a66", sun: "#f5f0d8", night: true, weather: null },
  { name: "CHERRY", grass1: "#f5b8cf", grass2: "#eba3bf", water: "#5bc0eb", waterLine: "#4aa8d8", sun: "#ffdd55", night: false, weather: "petals" }
];

export function theme() {
  return THEMES[(game.stage - 1) % THEMES.length];
}
