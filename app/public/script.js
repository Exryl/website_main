const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

function draw() {
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.beginPath();
  ctx.arc(
    Math.floor(Math.random() * window.innerWidth),
    Math.floor(Math.random() * window.innerHeight),
    3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

let frames = 0;
let last = performance.now();

function loop(now) {
  frames++;
  if (now - last > 500) {
    hud.textContent = `particles: Soon™ | canvas: ${canvas.width}×${canvas.height} | frames: ${frames}`;
    frames = 0;
    last = now;
  }
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
draw();
