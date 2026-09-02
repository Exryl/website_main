let noise2D = null;

import("/vendor/simplex-noise/simplex-noise.js").then(({ createNoise2D }) => {
  noise2D = createNoise2D();
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

function inRadians(degree) {
  return degree * (Math.PI / 180);
}

function resize() {
  const dpr = window.devicePixelRatio;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.resetTransform();
  ctx.scale(dpr, dpr);
}

resize();
window.addEventListener("resize", resize);

const COUNT = 1000;
const pts = [];
const size = 3;

function generate(randomAng) {
  for (let i = 0; i < COUNT; i++) {
    pts.push({
      x: Math.floor(Math.random() * window.innerWidth),
      y: Math.floor(Math.random() * window.innerHeight),
      size: size,
      angle: randomAng ? Math.random() * Math.PI * 2 : 0,
      noiseOffset: Math.random() * 1000,
    });
  }
}

generate(false);

const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);

gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

function draw(x, y, size, alpha) {
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha / 100})`;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlow(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const speed = 0.06; // pixels moved per frame in the current direction
const angle = 270;
let frames = 0;
let last = performance.now();
let lastFrameTime = last;

function loop(now) {
  if (now - last > 500) {
    const fps = Math.round((frames * 1000) / (now - last));
    hud.textContent = `particles: ${COUNT} | canvas: ${canvas.width}x${canvas.height} | fps: ${fps}`;
    frames = 0;
    last = now;
  }

  ctx.clearRect(0, 0, innerWidth, innerHeight);

  const deltaTime = now - lastFrameTime;

  for (const p of pts) {
    if (p.angle != 0) {
      const n = noise2D(p.noiseOffset, now * 0.0002); // scale time down so consecutive frames sample nearby noise values and the dot moves smoother
      p.angle += n * 0.05; // caps max turn-rate per frame so it turns smother (0.05 rad ≈ 3°)

      p.x += Math.cos(p.angle) * speed * deltaTime;
      p.y += Math.sin(p.angle) * speed * deltaTime;
    } else {
      p.x += Math.cos(inRadians(angle)) * speed * deltaTime;
      p.y += Math.sin(inRadians(angle)) * speed * deltaTime;

      if (p.x > innerWidth) {
        p.x = 0;
      }
      if (p.y > innerHeight) {
        p.y = 0;
      }
      if (p.x < 0) {
        p.x = innerWidth;
      }
      if (p.y < 0) {
        p.y = innerHeight;
      }
    }

    draw(p.x, p.y, p.size, 50);

    draw(p.x, p.y, p.size * 2.5, 30);
  }

  frames++;
  lastFrameTime = now;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
