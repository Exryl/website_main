// Config
const COUNT = 1000;
const DOT_SIZE = 3;
const SPEED = 0.06; // pixels moved per frame in the current direction
const DRIFT_ANGLE_DEG = 270;
const RANDOM_ANGLE = false;

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

function resize() {
  const dpr = window.devicePixelRatio;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.resetTransform();
  ctx.scale(dpr, dpr);
}

// Noise
let noise2D = null;

function loadNoise() {
  import("/vendor/simplex-noise/simplex-noise.js").then(({ createNoise2D }) => {
    noise2D = createNoise2D();
  });
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
      angle: RANDOM_ANGLE ? Math.random() * Math.PI * 2 : 0,
      noiseOffset: Math.random() * 1000,
    });
  }
}

function updateParticle(p, now, deltaTime) {
  if (p.angle !== 0) {
    const n = noise2D(p.noiseOffset, now * 0.0002); // scale time down so consecutive frames sample nearby noise values and the dot moves smoother
    p.angle += n * 0.05; // caps max turn-rate per frame so it turns smother (0.05 rad ≈ 3°)

    p.x += Math.cos(p.angle) * SPEED * deltaTime;
    p.y += Math.sin(p.angle) * SPEED * deltaTime;
    return;
  }

  p.x += Math.cos(inRadians(DRIFT_ANGLE_DEG)) * SPEED * deltaTime;
  p.y += Math.sin(inRadians(DRIFT_ANGLE_DEG)) * SPEED * deltaTime;

  if (p.x > window.innerWidth) p.x = 0;
  if (p.y > window.innerHeight) p.y = 0;
  if (p.x < 0) p.x = window.innerWidth;
  if (p.y < 0) p.y = window.innerHeight;
}

// Drawing
const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, DOT_SIZE * 2.5);
glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

function draw(x, y, size, alpha) {
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha / 100})`;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlow(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Animation loop
let frames = 0;
let fpsWindowStart = performance.now();
let lastFrameTime = fpsWindowStart;

function updateHud(now) {
  if (now - fpsWindowStart <= 500) return;

  const fps = Math.round((frames * 1000) / (now - fpsWindowStart));
  hud.textContent = `particles: ${COUNT} | canvas: ${canvas.width}x${canvas.height} | fps: ${fps}`;
  frames = 0;
  fpsWindowStart = now;
}

function loop(now) {
  updateHud(now);

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const deltaTime = now - lastFrameTime;

  for (const p of pts) {
    updateParticle(p, now, deltaTime);

    draw(p.x, p.y, p.size, p.alpha);
    draw(p.x, p.y, p.size * 2.5, p.alpha * 0.3);
  }

  frames++;
  lastFrameTime = now;
  requestAnimationFrame(loop);
}

// Init
loadNoise();
resize();
generateParticles();
window.addEventListener("resize", resize);
requestAnimationFrame(loop);
