const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function draw() {
  ctx.fillStyle = "rgb(255 255 255)";
  ctx.beginPath();
  ctx.moveTo(75, 50);
  ctx.lineTo(100, 75);
  ctx.lineTo(100, 25);
  ctx.fill();
}

draw();
