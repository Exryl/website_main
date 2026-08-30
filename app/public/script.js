const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

function draw() {
  ctx.fillStyle = "rgb(255 255 255)";
  ctx.beginPath();
  ctx.arc(75, 75, 3, 0, Math.PI * 2);
  ctx.fill();
}

draw();
