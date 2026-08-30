const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

const COUNT = 1000;
const pts = [];
for (let i = 0; i < COUNT; i++) {
  pts.push({
    x: Math.floor(Math.random() * window.innerWidth),
    y: Math.floor(Math.random() * window.innerHeight),
  });
}

function draw(x, y) {
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

let frames = 0;
let last = performance.now();

function loop(now) {
  frames++;
  if (now - last > 500) {
    hud.textContent = `particles: ${COUNT} | canvas: ${canvas.width}×${canvas.height} | frames: ${frames}`;
    frames = 0;
    last = now;
  }

  ctx.clearRect(0, 0, innerWidth, innerHeight);

  for (const p of pts) {
    draw(p.x, p.y);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
