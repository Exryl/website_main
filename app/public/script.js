// Config
const COUNT = 1000;
const DOT_SIZE = 3;
const SPEED = 0.06; // pixels moved per ms in the current direction

let DIRECTION_MODE = "fixed"; // "fixed" | "random"
const DRIFT_ANGLE_DEG = 270;

const GLOW_MODE = "cached"; // "none" | "simple" |"gradient" | "cached"

const REFERENCE_FRAME_MS = 1000 / 60; // This adjust for different turning rates at different fps-es

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

let previousWidth = window.innerWidth;
let previousHeight = window.innerHeight;

function resize() {
  const dpr = window.devicePixelRatio;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.resetTransform();
  ctx.scale(dpr, dpr);

  for (const p of pts) {
    rescaleParticlePosition(p);
  }

  previousWidth = window.innerWidth;
  previousHeight = window.innerHeight;
}

// Noise
let noise2D = null;

async function loadNoise() {
  try {
    const { createNoise2D } =
      await import("/vendor/simplex-noise/simplex-noise.js");
    noise2D = createNoise2D();
  } catch (error) {
    console.log(error);
    DIRECTION_MODE = "fixed";
  }
}

// Particles
const pts = [];

function inRadians(degree) {
  return degree * (Math.PI / 180);
}

function generateParticles() {
  for (let i = 0; i < COUNT; i++) {
    pts.push({
      x: Math.floor(Math.random() * window.innerWidth),
      y: Math.floor(Math.random() * window.innerHeight),
      size: DOT_SIZE,
      alpha: 50,
      angle: DIRECTION_MODE === "random" ? Math.random() * Math.PI * 2 : 0,
      noiseOffset: Math.random() * 1000,
    });
  }
}

function updateParticle(p, now, deltaTime) {
  if (DIRECTION_MODE === "random") {
    const n = noise2D(p.noiseOffset, now * 0.0002); // scale time down so consecutive frames sample nearby noise values and the dot moves smoother
    p.angle += (n * inRadians(3) * deltaTime) / REFERENCE_FRAME_MS; // caps max turn-rate per frame so it turns smother (0.05 rad ≈ 3°)

    p.x += Math.cos(p.angle) * SPEED * deltaTime;
    p.y += Math.sin(p.angle) * SPEED * deltaTime;
  } else {
    p.x += Math.cos(inRadians(DRIFT_ANGLE_DEG)) * SPEED * deltaTime;
    p.y += Math.sin(inRadians(DRIFT_ANGLE_DEG)) * SPEED * deltaTime;
  }

  if (p.x > window.innerWidth) p.x = 0;
  if (p.y > window.innerHeight) p.y = 0;
  if (p.x < 0) p.x = window.innerWidth;
  if (p.y < 0) p.y = window.innerHeight;
}

function rescaleParticlePosition(p) {
  p.x = window.innerWidth * (p.x / previousWidth);
  p.y = window.innerHeight * (p.y / previousHeight);
}

// Drawing
function createGlowGradient(context, cx, cy, radius) {
  const glowGradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
  glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
  glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  return glowGradient;
}

function draw(x, y, size, alpha) {
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha / 100})`;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlow(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = createGlowGradient(ctx, 0, 0, size * 2.5);
  ctx.beginPath();
  ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const glowCanvas = document.getElementById("glowCanvas");
const glowCtx = glowCanvas.getContext("2d");

function drawGlowCache() {
  glowCanvas.width = DOT_SIZE * 5;
  glowCanvas.height = DOT_SIZE * 5;

  glowCtx.fillStyle = createGlowGradient(
    glowCtx,
    glowCanvas.width / 2,
    glowCanvas.height / 2,
    DOT_SIZE * 2.5,
  );
  glowCtx.beginPath();
  glowCtx.arc(
    glowCanvas.width / 2,
    glowCanvas.height / 2,
    DOT_SIZE * 2.5,
    0,
    Math.PI * 2,
  );
  glowCtx.fill();
}

// Animation loop
let fpsWindowStart = performance.now();
let lastFrameTime = fpsWindowStart;

let frames = 0;
let totalProcessingTime = 0;

function updateHud(now) {
  if (now - fpsWindowStart <= 500) return;

  const fps = Math.round((frames * 1000) / (now - fpsWindowStart));
  const avgProcessingTime = totalProcessingTime / frames;

  hud.textContent =
    `particles: ${COUNT} | ` +
    `glow: ${GLOW_MODE} | ` +
    `canvas: ${canvas.width}x${canvas.height} | ` +
    `fps: ${fps} | ` +
    `avg processing: ${avgProcessingTime.toFixed(2)} ms/frame`;

  frames = 0;
  totalProcessingTime = 0;
  fpsWindowStart = now;
}

function loop(now) {
  const start = performance.now();

  const deltaTime = Math.min(
    Math.max(0, now - lastFrameTime),
    REFERENCE_FRAME_MS * 2,
  );

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of pts) {
    updateParticle(p, now, deltaTime);

    switch (GLOW_MODE) {
      case "none":
        draw(p.x, p.y, p.size, p.alpha);
        break;

      case "simple":
        draw(p.x, p.y, p.size, p.alpha);
        draw(p.x, p.y, p.size * 2.5, p.alpha * 0.3);
        break;

      case "gradient":
        draw(p.x, p.y, p.size, p.alpha);
        drawGlow(p.x, p.y, p.size);
        break;

      case "cached":
        draw(p.x, p.y, p.size, p.alpha);
        ctx.drawImage(
          glowCanvas,
          p.x - glowCanvas.width / 2,
          p.y - glowCanvas.height / 2,
        );
        break;
    }
  }

  const processingTime = performance.now() - start;

  totalProcessingTime += processingTime;
  frames++;

  updateHud(now)

  lastFrameTime = now;
  requestAnimationFrame(loop);
}

// Init
async function init() {
  await loadNoise();
  resize();
  generateParticles();
  drawGlowCache();
  window.addEventListener("resize", resize);
  requestAnimationFrame(loop);
}

init();
