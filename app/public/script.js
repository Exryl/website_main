import { createNoise2D } from "/vendor/simplex-noise/simplex-noise.js";

const noise2D = createNoise2D();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

function inRadians(degree) {
  return degree * (Math.PI / 180);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

const COUNT = 1;
const pts = [];
for (let i = 0; i < COUNT; i++) {
  pts.push({
    x: Math.floor(Math.random() * window.innerWidth),
    y: Math.floor(Math.random() * window.innerHeight),
    angle: Math.random() * Math.PI * 2,
    noiseOffset: Math.random() * 1000,
  });
}

function draw(x, y) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

const speed = 0.9;
let frames = 0;
let last = performance.now();

function loop(now) {
  if (now - last > 500) {
    const fps = Math.round((frames * 1000) / (now - last));
    hud.textContent = `particles: ${COUNT} | canvas: ${canvas.width}×${canvas.height} | fps: ${fps}`;
    frames = 0;
    last = now;
  }

  ctx.clearRect(0, 0, innerWidth, innerHeight);

  for (const p of pts) {
    const n = noise2D(p.noiseOffset, now * 0.0002);
    p.angle += n * 0.05;

    p.x += Math.cos(p.angle) * speed;
    p.y += Math.sin(p.angle) * speed;

    draw(p.x, p.y);
  }

  frames++;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
