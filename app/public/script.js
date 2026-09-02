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

  canvas.style.width = window.innerWidth;
  canvas.style.height = window.innerHeight;

  ctx.scale(dpr, dpr)
}

resize();
window.addEventListener("resize", resize);

const COUNT = 1000;
const pts = [];

function generate(randomAng) {
  for (let i = 0; i < COUNT; i++) {
    pts.push({
      x: Math.floor(Math.random() * window.innerWidth),
      y: Math.floor(Math.random() * window.innerHeight),
      size: 3,
      angle: randomAng ? Math.random() * Math.PI * 2 : 0,
      noiseOffset: Math.random() * 1000,
    });
  }
}

generate(false);

function draw(x, y, size, glow) {
  if (glow) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);

    ctx.fillStyle = gradient;

    gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else {
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  }
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
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
    
    draw(p.x, p.y, p.size, false);
    draw(p.x, p.y, p.size * 2.5, false);
  }
  
  frames++;
  lastFrameTime = now;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
