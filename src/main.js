// Entry point: sets up the game, starts the loop and makes the title wobble.

import "./style.css";
import { setupInput } from "./input.js";
import { draw } from "./render.js";
import { reset } from "./reset.js";
import { update } from "./update.js";

let lastTime = 0;

function loop(t) {
  // Cap the time step so a long pause (like switching tabs) doesn't make everything jump.
  const dt = Math.min((t - lastTime) / 1000, 0.05);
  lastTime = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// Splits the text into one span per letter so they can each bob around on their own.
function bubbleize(id, colors) {
  const el = document.getElementById(id);
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach((ch, i) => {
    const s = document.createElement("span");
    s.textContent = ch === " " ? " " : ch;
    s.style.setProperty("--i", i);
    if (ch !== " ") s.style.color = colors[i % colors.length];
    el.appendChild(s);
  });
}

bubbleize("title", ["#ff5fa8", "#ffd93d", "#5bc0eb", "#7ec850", "#ff9f1c", "#d9b3ff"]);
bubbleize("subtitle", ["#ffffff", "#ffe9a8"]);
setupInput();
reset();
requestAnimationFrame(loop);
