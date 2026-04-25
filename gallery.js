// =====================================================================
// gallery.js - canvas-based shooting gallery
// Wooden booth aesthetic, three lanes with sliding targets, crosshair,
// limited ammo, time-based score chase.
// =====================================================================

const Gallery = (() => {
  const SCALE = 4;
  const W = 640;   // logical canvas width
  const H = 400;   // logical canvas height
  const LANES_Y = [110, 200, 290];

  let canvas, ctx;
  let state;
  let rafId = null;
  let onComplete = null;

  // Per-stage target type pools (sprite names + point values)
  const STAGE_TARGETS = {
    pirate:  [{ name: 'targetDuck',   pts: 5,  speed: 1.4 },
              { name: 'targetSkull',  pts: 10, speed: 2.0 },
              { name: 'targetShield', pts: 8,  speed: 1.6 }],
    zombie:  [{ name: 'targetSkull',  pts: 10, speed: 1.8 },
              { name: 'targetSkull',  pts: 15, speed: 2.6 },
              { name: 'targetDuck',   pts: 5,  speed: 1.2 }],
    warrior: [{ name: 'targetShield', pts: 10, speed: 2.2 },
              { name: 'targetSkull',  pts: 15, speed: 2.8 },
              { name: 'targetShield', pts: 20, speed: 3.4 }],
  };

  function init(canvasEl, stageId, callback) {
    canvas = canvasEl;
    onComplete = callback;
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    state = {
      stageId,
      score: 0,
      ammo: 15,
      timeLeft: 30,
      lastTime: performance.now(),
      mouseX: W / 2,
      mouseY: H / 2,
      targets: [],
      pops: [],
      shotMarks: [],
      spawnTimer: 0,
      done: false,
      countdown: 3000,
    };

    spawnInitialTargets();
    bindEvents();
    rafId = requestAnimationFrame(loop);
  }

  function spawnInitialTargets() {
    const pool = STAGE_TARGETS[state.stageId] || STAGE_TARGETS.pirate;
    LANES_Y.forEach((y, i) => {
      const def = pool[i % pool.length];
      state.targets.push(makeTarget(def, y, i));
    });
  }

  function makeTarget(def, y, laneIdx) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const x = dir > 0 ? -50 : W + 50;
    return {
      sprite: def.name,
      pts: def.pts,
      speed: def.speed * (1 + Math.random() * 0.2),
      x, y,
      dir,
      laneIdx,
      width: 16 * SCALE,
      height: 16 * SCALE,
      hit: false,
      hitTimer: 0,
      hitText: '',
    };
  }

  function bindEvents() {
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onShoot);
    canvas.addEventListener('touchmove', onTouch, { passive: false });
    canvas.addEventListener('touchstart', onTouch, { passive: false });
  }

  function unbindEvents() {
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mousedown', onShoot);
    canvas.removeEventListener('touchmove', onTouch);
    canvas.removeEventListener('touchstart', onTouch);
  }

  function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  }

  function onMove(e) {
    const p = getCanvasCoords(e.clientX, e.clientY);
    state.mouseX = p.x; state.mouseY = p.y;
  }

  function onTouch(e) {
    e.preventDefault();
    const t = e.touches[0]; if (!t) return;
    const p = getCanvasCoords(t.clientX, t.clientY);
    state.mouseX = p.x; state.mouseY = p.y;
    if (e.type === 'touchstart') tryShoot();
  }

  function onShoot() { tryShoot(); }

  function tryShoot() {
    if (state.done || state.countdown > 0 || state.ammo <= 0) return;
    state.ammo--;
    state.shotMarks.push({ x: state.mouseX, y: state.mouseY, life: 400 });

    let hit = null;
    let bestArea = -1;
    for (const t of state.targets) {
      if (t.hit) continue;
      if (state.mouseX >= t.x && state.mouseX <= t.x + t.width &&
          state.mouseY >= t.y && state.mouseY <= t.y + t.height) {
        // pick the topmost (highest lane number wins)
        if (t.laneIdx > bestArea) { bestArea = t.laneIdx; hit = t; }
      }
    }
    if (hit) {
      hit.hit = true;
      hit.hitTimer = 600;
      hit.hitText = `+${hit.pts}`;
      state.score += hit.pts;
      state.pops.push({ x: hit.x + hit.width / 2, y: hit.y, text: `+${hit.pts}`, life: 700, color: '#ffd700' });
    } else {
      state.pops.push({ x: state.mouseX, y: state.mouseY, text: 'MISS', life: 500, color: '#ff6b6b' });
    }

    if (state.ammo <= 0) finishSoon();
  }

  function finishSoon() {
    setTimeout(end, 800);
  }

  function loop(now) {
    const dt = Math.min(50, now - state.lastTime);
    state.lastTime = now;
    update(dt);
    render();
    if (!state.done) rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    if (state.countdown > 0) { state.countdown -= dt; return; }

    state.timeLeft -= dt / 1000;
    if (state.timeLeft <= 0) { state.timeLeft = 0; finishSoon(); state.done = true; }

    // Move targets
    for (const t of state.targets) {
      if (t.hitTimer > 0) {
        t.hitTimer -= dt;
        if (t.hitTimer <= 0) respawnLane(t);
        continue;
      }
      t.x += t.dir * t.speed * (dt / 16);
      if (t.dir > 0 && t.x > W + 60) { t.dir = -1; t.x = W + 60; respawnLane(t, true); }
      if (t.dir < 0 && t.x < -60)    { t.dir = 1;  t.x = -60;    respawnLane(t, true); }
    }

    // Spawn extra targets from time to time
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.targets.length < 6) {
      const pool = STAGE_TARGETS[state.stageId] || STAGE_TARGETS.pirate;
      const def = pool[Math.floor(Math.random() * pool.length)];
      const lane = Math.floor(Math.random() * LANES_Y.length);
      state.targets.push(makeTarget(def, LANES_Y[lane], lane));
      state.spawnTimer = 1500 + Math.random() * 1500;
    }

    // Pops
    for (const p of state.pops) p.life -= dt;
    state.pops = state.pops.filter((p) => p.life > 0);
    for (const m of state.shotMarks) m.life -= dt;
    state.shotMarks = state.shotMarks.filter((m) => m.life > 0);
  }

  function respawnLane(t, swap) {
    const pool = STAGE_TARGETS[state.stageId] || STAGE_TARGETS.pirate;
    const def = pool[Math.floor(Math.random() * pool.length)];
    const dir = Math.random() < 0.5 ? 1 : -1;
    t.sprite = def.name;
    t.pts = def.pts;
    t.speed = def.speed * (1 + Math.random() * 0.3);
    t.dir = dir;
    t.x = dir > 0 ? -50 : W + 50;
    t.hit = false;
    t.hitTimer = 0;
  }

  function render() {
    // Sky background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    // Wooden booth backdrop
    drawWoodPanel(0, 60, W, H - 60);

    // Striped curtain banner at top
    drawCurtain();

    // Title sign
    drawSign();

    // Lanes (back panels)
    for (let i = 0; i < LANES_Y.length; i++) {
      const ly = LANES_Y[i];
      ctx.fillStyle = i % 2 === 0 ? '#3a2818' : '#2a1808';
      ctx.fillRect(0, ly + 50, W, 14);
      // shelf line
      ctx.fillStyle = '#5a3a20';
      ctx.fillRect(0, ly + 64, W, 4);
    }

    // Targets
    for (const t of state.targets) {
      let drawX = t.x; let drawY = t.y;
      if (t.hitTimer > 0) {
        // wobble + drop
        const fall = (600 - t.hitTimer) / 600;
        drawY = t.y + fall * 30;
        ctx.save();
        ctx.translate(drawX + t.width / 2, drawY + t.height / 2);
        ctx.rotate(fall * Math.PI);
        ctx.translate(-t.width / 2, -t.height / 2);
        drawSprite(ctx, t.sprite, 0, 0, SCALE);
        ctx.restore();
      } else {
        drawSprite(ctx, t.sprite, drawX, drawY, SCALE, { flip: t.dir < 0 });
      }
    }

    // Shot marks
    for (const m of state.shotMarks) {
      const alpha = m.life / 400;
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pops (floating text)
    for (const p of state.pops) {
      const alpha = p.life / 700;
      const lift = (700 - p.life) / 700 * 30;
      ctx.font = 'bold 24px "Press Start 2P", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(p.text, p.x + 2, p.y - lift + 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillText(p.text, p.x, p.y - lift);
      ctx.globalAlpha = 1;
    }

    // HUD
    drawHUD();

    // Crosshair
    drawCrosshair(state.mouseX, state.mouseY);

    // Countdown overlay
    if (state.countdown > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = 'bold 96px sans-serif';
      ctx.textAlign = 'center';
      const num = Math.ceil(state.countdown / 1000);
      ctx.fillStyle = '#ffd700';
      ctx.fillText(String(num), W / 2, H / 2 + 30);
    }
  }

  function drawWoodPanel(x, y, w, h) {
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(x, y, w, h);
    // wood grain stripes
    ctx.fillStyle = '#4a2e18';
    for (let i = 0; i < h; i += 30) {
      ctx.fillRect(x, y + i, w, 2);
    }
    ctx.fillStyle = '#6a4a30';
    for (let i = 15; i < h; i += 30) {
      ctx.fillRect(x, y + i, w, 1);
    }
    // border
    ctx.strokeStyle = '#2a1808';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
  }

  function drawCurtain() {
    const stripeW = 20;
    for (let x = 0; x < W; x += stripeW) {
      ctx.fillStyle = (x / stripeW) % 2 === 0 ? '#cc2222' : '#ffd700';
      ctx.fillRect(x, 0, stripeW, 60);
    }
    // bottom scallops
    ctx.fillStyle = '#1a1a2e';
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath();
      ctx.arc(x + 15, 60, 12, 0, Math.PI);
      ctx.fill();
    }
  }

  function drawSign() {
    const sx = W / 2 - 110, sy = 5, sw = 220, sh = 40;
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHOOTING GALLERY', W / 2, sy + 27);
  }

  function drawHUD() {
    const hudY = H - 32;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, hudY, W, 32);
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(`AMMO: ${state.ammo}`, 14, hudY + 22);
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE: ${state.score}`, W / 2, hudY + 22);
    ctx.fillStyle = state.timeLeft < 10 ? '#ff6b6b' : '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(`TIME: ${Math.ceil(state.timeLeft)}`, W - 14, hudY + 22);
  }

  function drawCrosshair(x, y) {
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 22, y); ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y);  ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22); ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8);  ctx.lineTo(x, y + 22);
    ctx.stroke();
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }

  function end() {
    if (state.done && rafId === null) return;
    state.done = true;
    cancelAnimationFrame(rafId);
    rafId = null;
    unbindEvents();
    if (onComplete) onComplete({ score: state.score, ammoLeft: state.ammo });
  }

  return { init, end };
})();

window.Gallery = Gallery;
