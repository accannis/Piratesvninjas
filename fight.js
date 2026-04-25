// =====================================================================
// fight.js - top-down NES-style combat
// Player moves with WASD/arrows, attacks with space.
// 3 waves per stage, escalating difficulty, boss in wave 3.
// =====================================================================

const Fight = (() => {
  const SCALE = 3;          // pixel scale for sprites
  const TILE = 16 * SCALE;  // tile size in screen pixels
  const COLS = 16;
  const ROWS = 11;
  const W = COLS * TILE;
  const H = ROWS * TILE;
  const HUD_H = 56;

  let canvas, ctx;
  let state;
  let rafId = null;
  let onComplete = null;

  const STAGE_CONFIG = {
    pirate:  { tile: 'sand',  enemy: 'pirate',  enemySpeed: 1.0, enemyHP: 1, label: 'PIRATE COVE' },
    zombie:  { tile: 'grass', enemy: 'zombie',  enemySpeed: 0.8, enemyHP: 2, label: 'ZOMBIE SWAMP' },
    warrior: { tile: 'dirt',  enemy: 'warrior', enemySpeed: 1.2, enemyHP: 2, label: 'WARRIOR FIELDS' },
  };

  const WAVE_PLAN = [
    { count: 3, speedMult: 1.0, hpAdd: 0 },
    { count: 5, speedMult: 1.15, hpAdd: 0 },
    { count: 6, speedMult: 1.3,  hpAdd: 1, boss: true },
  ];

  function init(canvasEl, stageId, callback) {
    canvas = canvasEl;
    onComplete = callback;
    canvas.width = W;
    canvas.height = H + HUD_H;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const cfg = STAGE_CONFIG[stageId] || STAGE_CONFIG.pirate;

    state = {
      stageId,
      cfg,
      keys: {},
      player: {
        x: W / 2 - TILE / 2,
        y: H / 2 - TILE / 2,
        w: TILE,
        h: TILE,
        speed: 2.4,
        dir: 'down',
        hp: 6, maxHP: 6,
        attackCooldown: 0,
        attackTimer: 0,        // visible slash duration
        attackHitbox: null,
        invuln: 0,
        bobFrame: 0,
      },
      enemies: [],
      effects: [],
      pickups: [],
      decor: generateDecor(stageId),
      wave: 0,
      waveActive: false,
      enemiesToSpawn: 0,
      waveBannerTimer: 0,
      waveBannerText: '',
      score: 0,
      done: false,
      lastTime: performance.now(),
      win: false,
    };

    bindEvents();
    startNextWave();
    rafId = requestAnimationFrame(loop);
  }

  function generateDecor(stageId) {
    const items = [];
    const decorSprites = stageId === 'zombie'
      ? ['tomb', 'tree', 'rock']
      : stageId === 'warrior'
        ? ['rock', 'rock', 'tree']
        : ['rock', 'tree', 'rock'];
    for (let i = 0; i < 8; i++) {
      const x = 20 + Math.random() * (W - 60);
      const y = 20 + Math.random() * (H - 60);
      // keep clear of center where player spawns
      if (Math.hypot(x - W / 2, y - H / 2) < TILE * 2.5) continue;
      items.push({
        sprite: decorSprites[Math.floor(Math.random() * decorSprites.length)],
        x, y,
      });
    }
    return items;
  }

  function bindEvents() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }
  function unbindEvents() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }
  function onKeyDown(e) {
    if (!state || state.done) return;
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    state.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') tryAttack();
  }
  function onKeyUp(e) {
    if (!state) return;
    state.keys[e.key.toLowerCase()] = false;
  }

  function tryAttack() {
    const p = state.player;
    if (p.attackCooldown > 0) return;
    p.attackCooldown = 350;
    p.attackTimer = 250;
    // hitbox in front of player
    const hb = { w: TILE, h: TILE };
    if (p.dir === 'up')    { hb.x = p.x; hb.y = p.y - TILE; }
    if (p.dir === 'down')  { hb.x = p.x; hb.y = p.y + TILE; }
    if (p.dir === 'left')  { hb.x = p.x - TILE; hb.y = p.y; }
    if (p.dir === 'right') { hb.x = p.x + TILE; hb.y = p.y; }
    p.attackHitbox = hb;
    state.effects.push({ type: 'slash', x: hb.x, y: hb.y, dir: p.dir, life: 220 });
  }

  function startNextWave() {
    state.wave++;
    if (state.wave > WAVE_PLAN.length) {
      state.win = true;
      state.waveBannerText = 'STAGE CLEAR!';
      state.waveBannerTimer = 2000;
      setTimeout(() => end(), 2200);
      return;
    }
    const plan = WAVE_PLAN[state.wave - 1];
    state.waveActive = true;
    state.waveBannerText = `WAVE ${state.wave}!`;
    state.waveBannerTimer = 1500;

    // spawn enemies after banner
    setTimeout(() => spawnWave(plan), 1200);
  }

  function spawnWave(plan) {
    if (state.done) return;
    const total = plan.count + (plan.boss ? 1 : 0);
    state.enemiesToSpawn = total;
    for (let i = 0; i < plan.count; i++) {
      setTimeout(() => {
        if (state.done) return;
        spawnEnemy({ speedMult: plan.speedMult, hpAdd: plan.hpAdd, boss: false });
        state.enemiesToSpawn--;
      }, i * 200);
    }
    if (plan.boss) {
      setTimeout(() => {
        if (state.done) return;
        spawnEnemy({ speedMult: 0.7, hpAdd: 4, boss: true });
        state.enemiesToSpawn--;
      }, plan.count * 200);
    }
  }

  function spawnEnemy(opts) {
    // spawn at random screen edge
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * W; y = -TILE; }
    if (side === 1) { x = Math.random() * W; y = H; }
    if (side === 2) { x = -TILE; y = Math.random() * H; }
    if (side === 3) { x = W; y = Math.random() * H; }

    const baseHP = state.cfg.enemyHP + (opts.hpAdd || 0);
    const baseSpeed = state.cfg.enemySpeed * (opts.speedMult || 1);
    const sprite = opts.boss
      ? (state.cfg.enemy === 'pirate' ? 'bossPirate' : state.cfg.enemy)
      : state.cfg.enemy;
    // bossPirate is already 24x24 logical; regular sprites get 1.5x scale.
    const renderScale = opts.boss
      ? (sprite === 'bossPirate' ? SCALE : SCALE * 1.5)
      : SCALE;

    state.enemies.push({
      x, y,
      w: opts.boss ? TILE * 1.5 : TILE,
      h: opts.boss ? TILE * 1.5 : TILE,
      sprite,
      renderScale,
      isBoss: !!opts.boss,
      speed: baseSpeed * 0.7, // slower for kid difficulty
      hp: opts.boss ? baseHP * 3 : baseHP,
      maxHP: opts.boss ? baseHP * 3 : baseHP,
      flash: 0,
      knockback: { x: 0, y: 0 },
    });
  }

  function loop(now) {
    const dt = Math.min(50, now - state.lastTime);
    state.lastTime = now;
    update(dt);
    render();
    if (!state.done) rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    const p = state.player;
    if (state.waveBannerTimer > 0) state.waveBannerTimer -= dt;

    // Movement
    let dx = 0, dy = 0;
    if (state.keys['arrowup'] || state.keys['w']) dy -= 1;
    if (state.keys['arrowdown'] || state.keys['s']) dy += 1;
    if (state.keys['arrowleft'] || state.keys['a']) dx -= 1;
    if (state.keys['arrowright'] || state.keys['d']) dx += 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
    if (dx < 0) p.dir = 'left';
    else if (dx > 0) p.dir = 'right';
    else if (dy < 0) p.dir = 'up';
    else if (dy > 0) p.dir = 'down';
    p.x += dx * p.speed * (dt / 16);
    p.y += dy * p.speed * (dt / 16);
    p.x = Math.max(0, Math.min(W - p.w, p.x));
    p.y = Math.max(0, Math.min(H - p.h, p.y));
    if (dx || dy) p.bobFrame += dt;

    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    if (p.attackTimer > 0) p.attackTimer -= dt;
    else p.attackHitbox = null;
    if (p.invuln > 0) p.invuln -= dt;

    // Auto-attack with space hold (already handled on keydown, but also allow rapid)
    if (state.keys[' '] && p.attackCooldown <= 0) tryAttack();

    // Update enemies
    for (const e of state.enemies) {
      if (e.flash > 0) e.flash -= dt;
      // chase player
      const cx = p.x + p.w / 2 - (e.x + e.w / 2);
      const cy = p.y + p.h / 2 - (e.y + e.h / 2);
      const d = Math.hypot(cx, cy) || 1;
      e.x += (cx / d) * e.speed * (dt / 16) + e.knockback.x;
      e.y += (cy / d) * e.speed * (dt / 16) + e.knockback.y;
      e.knockback.x *= 0.8;
      e.knockback.y *= 0.8;

      // damage to player
      if (p.invuln <= 0 && rectsOverlap(e, p)) {
        p.hp -= 1;
        p.invuln = 1000;
        // knock player back
        p.x -= (cx / d) * 12;
        p.y -= (cy / d) * 12;
        if (p.hp <= 0) {
          state.win = false;
          state.waveBannerText = 'GAME OVER';
          state.waveBannerTimer = 2000;
          setTimeout(() => end(), 2100);
          state.done = true;
        }
      }

      // damaged by attack
      if (p.attackHitbox && rectsOverlap(e, p.attackHitbox) && e.flash <= 0) {
        e.hp -= 1;
        e.flash = 200;
        e.knockback.x = (-cx / d) * 6;
        e.knockback.y = (-cy / d) * 6;
        state.effects.push({
          type: 'pop', x: e.x + e.w / 2, y: e.y, text: e.isBoss ? '-1' : 'HIT', life: 500,
          color: e.isBoss ? '#ff6b6b' : '#ffd700',
        });
        if (e.hp <= 0) {
          e.dead = true;
          state.score += e.isBoss ? 50 : 10;
          state.effects.push({ type: 'pop', x: e.x + e.w / 2, y: e.y, text: e.isBoss ? '+50' : '+10', life: 700, color: '#ffd700' });
          // chance to drop heart
          if (Math.random() < 0.25 || e.isBoss) {
            state.pickups.push({ type: 'heart', x: e.x + e.w / 2 - 8, y: e.y + e.h / 2 - 8, life: 8000 });
          }
        }
      }
    }
    state.enemies = state.enemies.filter((e) => !e.dead);

    // Pickups
    for (const pk of state.pickups) {
      pk.life -= dt;
      const r = { x: pk.x, y: pk.y, w: 16, h: 16 };
      if (rectsOverlap(r, p)) {
        if (pk.type === 'heart' && p.hp < p.maxHP) {
          p.hp = Math.min(p.maxHP, p.hp + 1);
          state.effects.push({ type: 'pop', x: pk.x, y: pk.y, text: '+❤', life: 600, color: '#ff6b6b' });
          pk.taken = true;
        }
      }
    }
    state.pickups = state.pickups.filter((pk) => !pk.taken && pk.life > 0);

    // Effects
    for (const fx of state.effects) fx.life -= dt;
    state.effects = state.effects.filter((fx) => fx.life > 0);

    // Wave check: all enemies spawned and all defeated
    if (state.waveActive && state.enemiesToSpawn === 0 &&
        state.enemies.length === 0 && state.waveBannerTimer <= 0) {
      state.waveActive = false;
      setTimeout(() => { if (!state.done) startNextWave(); }, 1000);
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function render() {
    // Tiled ground
    const tileName = state.cfg.tile;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        drawSprite(ctx, tileName, c * TILE, r * TILE, SCALE);
      }
    }

    // Decor (rocks, trees, tombs)
    for (const d of state.decor) {
      drawSprite(ctx, d.sprite, d.x, d.y, SCALE);
    }

    // Pickups
    for (const pk of state.pickups) {
      const blink = pk.life < 2000 && Math.floor(pk.life / 150) % 2 === 0;
      if (blink) continue;
      ctx.fillStyle = '#cc2222';
      // little heart
      ctx.fillRect(pk.x + 2, pk.y + 4, 4, 4);
      ctx.fillRect(pk.x + 10, pk.y + 4, 4, 4);
      ctx.fillRect(pk.x + 2, pk.y + 8, 12, 4);
      ctx.fillRect(pk.x + 4, pk.y + 12, 8, 2);
      ctx.fillRect(pk.x + 6, pk.y + 14, 4, 2);
    }

    // Enemies
    for (const e of state.enemies) {
      const tint = e.flash > 0 ? '#ffffff' : null;
      drawSprite(ctx, e.sprite, e.x, e.y, e.renderScale, { tint });
      // HP bar above
      if (e.maxHP > 1) {
        const bw = e.w;
        ctx.fillStyle = '#000';
        ctx.fillRect(e.x, e.y - 6, bw, 4);
        ctx.fillStyle = '#cc2222';
        ctx.fillRect(e.x + 1, e.y - 5, (bw - 2) * (e.hp / e.maxHP), 2);
      }
    }

    // Player (with bob)
    const p = state.player;
    const flicker = p.invuln > 0 && Math.floor(p.invuln / 100) % 2 === 0;
    if (!flicker) {
      const bob = Math.floor(Math.sin(p.bobFrame / 100) * 2);
      drawSprite(ctx, 'hero', p.x, p.y + bob, SCALE, {
        flip: p.dir === 'left',
      });
      // facing indicator: tiny sword in attack direction
      if (p.attackTimer > 0 && p.attackHitbox) {
        drawSprite(ctx, 'slash', p.attackHitbox.x, p.attackHitbox.y, SCALE);
      }
    }

    // Effects
    for (const fx of state.effects) {
      if (fx.type === 'pop') {
        const alpha = fx.life / 700;
        const lift = (700 - fx.life) / 700 * 20;
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000';
        ctx.fillText(fx.text, fx.x + 1, fx.y - lift + 1);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = fx.color;
        ctx.fillText(fx.text, fx.x, fx.y - lift);
        ctx.globalAlpha = 1;
      }
    }

    // HUD
    drawHUD();

    // Wave banner
    if (state.waveBannerTimer > 0) {
      const a = Math.min(1, state.waveBannerTimer / 1000);
      ctx.fillStyle = `rgba(0,0,0,${0.6 * a})`;
      ctx.fillRect(0, H / 2 - 50, W, 100);
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255,215,0,${a})`;
      ctx.fillText(state.waveBannerText, W / 2, H / 2 + 18);
    }
  }

  function drawHUD() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, H, W, HUD_H);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, H, W, 2);

    // hearts
    const p = state.player;
    for (let i = 0; i < p.maxHP; i++) {
      const hx = 14 + i * 26;
      const hy = H + 16;
      ctx.fillStyle = i < p.hp ? '#cc2222' : '#444';
      ctx.fillRect(hx + 2, hy + 2, 4, 4);
      ctx.fillRect(hx + 12, hy + 2, 4, 4);
      ctx.fillRect(hx + 2, hy + 6, 14, 4);
      ctx.fillRect(hx + 4, hy + 10, 10, 2);
      ctx.fillRect(hx + 6, hy + 12, 6, 2);
      ctx.fillRect(hx + 8, hy + 14, 2, 2);
    }

    // wave indicator
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${state.cfg.label}  -  WAVE ${Math.min(state.wave, WAVE_PLAN.length)} / ${WAVE_PLAN.length}`, W / 2, H + 30);

    // score
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`SCORE: ${state.score}`, W - 14, H + 30);

    // controls hint
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#aaa';
    ctx.fillText('WASD / arrows: move    SPACE: attack', 14, H + 48);
  }

  function end() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
    state.done = true;
    unbindEvents();
    if (onComplete) onComplete({ win: state.win, score: state.score, hp: state.player.hp });
  }

  return { init, end };
})();

window.Fight = Fight;
