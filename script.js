const { Engine, Render, Runner, Bodies, Body, World, Events, Mouse, MouseConstraint, Composite } = Matter;

const FONT_FAMILY = 'Helvetica, Arial, sans-serif';
const FONT_WEIGHT = '500';
const WALL_T = 100;
const LEFT_MARGIN = 40;
const BASE_FONT = 200; // design-time font size (at 1440px wide)

// Measure letter widths
const mc = document.createElement('canvas');
const mctx = mc.getContext('2d');
function measureChar(ch, size) {
  mctx.font = `${FONT_WEIGHT} ${size}px ${FONT_FAMILY}`;
  return mctx.measureText(ch).width;
}

// --- Engine (lives forever, gets reset on resize) ---
const engine = Engine.create({ gravity: { y: 2.5 } });
const world = engine.world;
let render, mouseConstraint, runner;
let spawnTimers = [];

function getFontSize(w) {
  // Scale font proportionally, clamped between 32px and 120px
  return Math.max(32, Math.min(BASE_FONT, Math.floor(w / 12)));
}

function buildLineData(str, fontSize) {
  let total = 0;
  const chars = [];
  for (const ch of str) {
    const w = measureChar(ch, fontSize);
    chars.push({ ch, w, x: total });
    total += w;
  }
  return { chars, total };
}

function init() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const FONT_SIZE = getFontSize(W);

  // --- Clear old timers ---
  spawnTimers.forEach(t => clearTimeout(t));
  spawnTimers = [];

  // --- Tear down old render ---
  if (render) {
    Render.stop(render);
    render.canvas.remove();
    render.canvas = null;
    render.context = null;
    render.textures = {};
  }
  if (runner) {
    Runner.stop(runner);
  }

  // Clear world bodies (keep engine)
  World.clear(world, false);
  Engine.clear(engine);
  engine.gravity.y = 2.5;

  // --- New renderer ---
  render = Render.create({
    element: document.body,
    engine,
    options: {
      width: W,
      height: H,
      background: '#000000',
      wireframes: false,
      pixelRatio: window.devicePixelRatio || 1,
    }
  });

  Render.run(render);
  runner = Runner.create();
  Runner.run(runner, engine);

  // Walls
  World.add(world, [
    Bodies.rectangle(W / 2, H + WALL_T / 2, W * 4, WALL_T, { isStatic: true, render: { fillStyle: '#000' } }),
    Bodies.rectangle(-WALL_T / 2, H / 2, WALL_T, H * 4,    { isStatic: true, render: { fillStyle: '#000' } }),
    Bodies.rectangle(W + WALL_T / 2, H / 2, WALL_T, H * 4, { isStatic: true, render: { fillStyle: '#000' } }),
  ]);

  // Mouse drag
  const mouse = Mouse.create(render.canvas);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } }
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;

  // Letter bodies
  const bodies = [];
  const d1 = buildLineData('FRANCIS', FONT_SIZE);
  const d2 = buildLineData('FITZGERALD', FONT_SIZE);

  function spawnChar({ ch, w, x }, lineIndex, totalDelay) {
    const t = setTimeout(() => {
      const centerX = LEFT_MARGIN + x + w / 2;
      const spawnY = -(FONT_SIZE * 1.5) - lineIndex * FONT_SIZE * 0.5 - Math.random() * 60;
      const initAngle = (Math.random() - 0.5) * 0.4;

      const b = Bodies.rectangle(centerX, spawnY, w * 0.80, FONT_SIZE * 0.75, {
        restitution: 0.20,
        friction: 0.55,
        frictionAir: 0.008,
        frictionStatic: 0.5,
        density: 0.004,
        angle: initAngle,
        render: { fillStyle: 'rgba(0,0,0,0)' },
      });

      b._ch = ch;
      b._h = FONT_SIZE;

      World.add(world, b);
      bodies.push(b);
    }, totalDelay);
    spawnTimers.push(t);
  }

  let delay = 0;
  d2.chars.forEach((c, i) => {
    spawnChar(c, 1, delay);
    delay += 90 + Math.random() * 70;
  });
  delay += 120;
  d1.chars.forEach((c, i) => {
    spawnChar(c, 0, delay);
    delay += 90 + Math.random() * 70;
  });

  // Draw letters
  Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    for (const b of bodies) {
      if (!b._ch) continue;
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(b.angle);
      ctx.font = `${FONT_WEIGHT} ${b._h}px ${FONT_FAMILY}`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b._ch, 0, 0);
      ctx.restore();
    }
  });
}

// Debounced resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(init, 250);
});

document.fonts.ready.then(init);