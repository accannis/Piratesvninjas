// art.js — marker-cartoon drawing primitives + character/scene art
// All drawings use a wobbly hand-drawn style on cream paper.

const Art = (() => {

  // ---------- Seeded random (deterministic so drawings don't shimmer) ----------
  function srand(seed) {
    let s = (seed | 0) || 1;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) | 0;
      return ((s >>> 0) % 100000) / 100000;
    };
  }

  // ---------- Wobble helpers ----------
  function wobblePolyPath(ctx, pts, amp, seed, close) {
    const r = srand(seed);
    ctx.beginPath();
    const last = close ? pts.length : pts.length - 1;
    let started = false;
    for (let i = 0; i < last; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const segs = Math.max(2, Math.ceil(len / 9));
      for (let j = 0; j < segs; j++) {
        const t = j / segs;
        const w = (r() - 0.5) * 2 * amp;
        const px = x1 + dx * t + nx * w;
        const py = y1 + dy * t + ny * w;
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
    }
    if (close) ctx.closePath();
    else {
      const [ex, ey] = pts[pts.length - 1];
      ctx.lineTo(ex, ey);
    }
  }

  function ellipsePts(cx, cy, rx, ry, n, seed, amp) {
    const r = srand(seed);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wob = (r() - 0.5) * 2 * amp;
      pts.push([cx + Math.cos(a) * (rx + wob), cy + Math.sin(a) * (ry + wob)]);
    }
    return pts;
  }

  // ---------- Public marker primitives ----------
  function line(ctx, x1, y1, x2, y2, color, width = 3, seed = 1, amp = 1.0) {
    ctx.save();
    ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = color; ctx.globalAlpha = 0.92;
    wobblePolyPath(ctx, [[x1, y1], [x2, y2]], amp, seed, false);
    ctx.stroke();
    ctx.restore();
  }

  function poly(ctx, pts, fill, stroke, width = 3, seed = 1, amp = 1.1) {
    ctx.save();
    ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (fill) {
      wobblePolyPath(ctx, pts, amp * 0.6, seed * 7 + 11, true);
      ctx.fillStyle = fill; ctx.globalAlpha = 0.92; ctx.fill();
    }
    if (stroke) {
      wobblePolyPath(ctx, pts, amp, seed, true);
      ctx.strokeStyle = stroke; ctx.globalAlpha = 0.95; ctx.stroke();
    }
    ctx.restore();
  }

  function ellipse(ctx, cx, cy, rx, ry, fill, stroke, width = 3, seed = 1, amp = 1.1) {
    const fillPts = ellipsePts(cx, cy, rx, ry, 28, seed * 5 + 3, amp * 0.5);
    const strokePts = ellipsePts(cx, cy, rx, ry, 36, seed, amp);
    ctx.save();
    ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (fill) {
      wobblePolyPath(ctx, fillPts, 0.4, seed * 9 + 17, true);
      ctx.fillStyle = fill; ctx.globalAlpha = 0.92; ctx.fill();
    }
    if (stroke) {
      wobblePolyPath(ctx, strokePts, amp * 0.4, seed + 41, true);
      ctx.strokeStyle = stroke; ctx.globalAlpha = 0.95; ctx.stroke();
    }
    ctx.restore();
  }

  function rect(ctx, x, y, w, h, fill, stroke, width = 3, seed = 1, amp = 1.1) {
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    poly(ctx, pts, fill, stroke, width, seed, amp);
  }

  // Hatched scribble fill inside a rectangle (clipped) - good for marker fill texture
  function scribbleFill(ctx, x, y, w, h, color, opts = {}) {
    const { density = 6, seed = 1, alpha = 0.55, angle = -0.18 } = opts;
    const r = srand(seed);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 1, y - 1, w + 2, h + 2);
    ctx.clip();
    ctx.lineWidth = density * 0.85;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    const cx = x + w / 2, cy = y + h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.translate(-cx, -cy);
    const pad = Math.max(w, h);
    for (let yy = y - pad; yy < y + h + pad; yy += density * 1.6) {
      const j1 = (r() - 0.5) * 2;
      const j2 = (r() - 0.5) * 2;
      const j3 = (r() - 0.5) * 1.5;
      ctx.beginPath();
      ctx.moveTo(x - pad + j1, yy + j3);
      ctx.lineTo(x + w + pad + j2, yy - j3);
      ctx.stroke();
    }
    ctx.restore();
  }

  return { srand, line, poly, ellipse, rect, scribbleFill, ellipsePts, wobblePolyPath };
})();

// ============================================================================
// Scenery
// ============================================================================
const Scenery = (() => {

  function paperBg(ctx, w, h) {
    ctx.fillStyle = '#fdfcf4';
    ctx.fillRect(0, 0, w, h);
    // faint paper grain - draw a few light dots once
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#3a2a10';
    const r = Art.srand(424242);
    for (let i = 0; i < 220; i++) {
      const x = r() * w, y = r() * h;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.restore();
  }

  function sky(ctx, w, h, color = '#cfe9ff') {
    Art.rect(ctx, -10, -10, w + 20, h * 0.45 + 10, color, null, 0, 31, 0.6);
    Art.scribbleFill(ctx, -10, -10, w + 20, h * 0.45 + 10, color, { density: 7, seed: 23, alpha: 0.35, angle: 0.08 });
  }

  function sun(ctx, x, y, r = 38) {
    Art.ellipse(ctx, x, y, r, r, '#ffe27a', '#f1a738', 4, 7, 1.4);
    // little rays
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x1 = x + Math.cos(a) * (r + 6);
      const y1 = y + Math.sin(a) * (r + 6);
      const x2 = x + Math.cos(a) * (r + 18);
      const y2 = y + Math.sin(a) * (r + 18);
      Art.line(ctx, x1, y1, x2, y2, '#f1a738', 4, 13 + i * 3, 1.0);
    }
  }

  function cloud(ctx, x, y, scale = 1, seed = 1) {
    const s = scale;
    Art.ellipse(ctx, x, y, 36 * s, 18 * s, '#ffffff', '#9bb6c9', 3, seed, 1.0);
    Art.ellipse(ctx, x - 22 * s, y + 4 * s, 22 * s, 14 * s, '#ffffff', '#9bb6c9', 3, seed + 5, 1.0);
    Art.ellipse(ctx, x + 22 * s, y + 4 * s, 22 * s, 14 * s, '#ffffff', '#9bb6c9', 3, seed + 9, 1.0);
  }

  function grass(ctx, w, h, opts = {}) {
    const top = opts.top != null ? opts.top : h - 80;
    const color = opts.color || '#5db44a';
    const dark = opts.dark || '#357a25';
    // base grass area
    Art.rect(ctx, -10, top, w + 20, h - top + 10, color, null, 0, 71, 0.8);
    Art.scribbleFill(ctx, -10, top, w + 20, h - top + 10, dark, { density: 6, seed: 53, alpha: 0.35, angle: -0.5 });
    // grass blades along the top edge
    const r = Art.srand(91);
    for (let x = -10; x < w + 20; x += 5) {
      const blade = 6 + r() * 14;
      const lean = (r() - 0.5) * 6;
      Art.line(ctx, x, top + r() * 4, x + lean, top - blade, dark, 2 + r() * 1.5, x | 0, 0.6);
    }
  }

  // Simple flower at base position (x, y is base of stem)
  function flower(ctx, x, y, kind = 'red', seed = 1) {
    const palette = {
      red:    { petal: '#e23b3b', center: '#f7e64a', stem: '#3a8e2e' },
      pink:   { petal: '#f06ab2', center: '#f7e64a', stem: '#3a8e2e' },
      purple: { petal: '#7a3ec7', center: '#f7e64a', stem: '#3a8e2e' },
      yellow: { petal: '#f4c12a', center: '#e07b22', stem: '#3a8e2e' },
      blue:   { petal: '#3a8ee0', center: '#f7e64a', stem: '#3a8e2e' },
    }[kind];
    const stemLen = 36 + (Art.srand(seed)() * 12);
    Art.line(ctx, x, y, x, y - stemLen, palette.stem, 4, seed, 1.2);
    // 6 petals as a wobbly polygon flower
    const cx = x, cy = y - stemLen;
    const petalR = 16, innerR = 6;
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const r = (i % 2 === 0) ? petalR : innerR;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    Art.poly(ctx, pts, palette.petal, palette.petal, 3, seed + 11, 1.4);
    Art.ellipse(ctx, cx, cy, 5, 5, palette.center, '#7a4a10', 2, seed + 17, 0.6);
  }

  // Tree: trunk + scribbly canopy
  function tree(ctx, x, y, opts = {}) {
    const { scale = 1, seed = 1, kind = 'normal' } = opts;
    const trunkH = 90 * scale, trunkW = 22 * scale;
    const canopyR = 70 * scale;
    const trunkColor = kind === 'dark' ? '#3a230f' : '#7a4a1f';
    const canopyColor = kind === 'dark' ? '#1f4a26' : '#46a23a';
    const canopyOutline = kind === 'dark' ? '#0e2d15' : '#2a6e22';
    // trunk
    const tx = x - trunkW / 2;
    Art.rect(ctx, tx, y - trunkH, trunkW, trunkH, trunkColor, '#3a2310', 3, seed, 1.0);
    Art.scribbleFill(ctx, tx, y - trunkH, trunkW, trunkH, '#3a2310', { density: 4, seed: seed + 5, alpha: 0.25, angle: 1.4 });
    // canopy
    const cy = y - trunkH - canopyR * 0.55;
    Art.ellipse(ctx, x - canopyR * 0.3, cy, canopyR * 0.85, canopyR * 0.7, canopyColor, canopyOutline, 4, seed + 13, 1.5);
    Art.ellipse(ctx, x + canopyR * 0.4, cy + 6, canopyR * 0.8, canopyR * 0.65, canopyColor, canopyOutline, 4, seed + 19, 1.5);
    Art.ellipse(ctx, x, cy - canopyR * 0.3, canopyR * 0.7, canopyR * 0.55, canopyColor, canopyOutline, 4, seed + 27, 1.5);
  }

  function bush(ctx, x, y, scale = 1, seed = 1) {
    const r = 30 * scale;
    Art.ellipse(ctx, x - r * 0.6, y, r * 0.8, r * 0.55, '#5db44a', '#2a6e22', 4, seed, 1.3);
    Art.ellipse(ctx, x + r * 0.6, y, r * 0.8, r * 0.55, '#5db44a', '#2a6e22', 4, seed + 7, 1.3);
    Art.ellipse(ctx, x, y - r * 0.4, r * 0.9, r * 0.7, '#5db44a', '#2a6e22', 4, seed + 13, 1.3);
  }

  function mushroom(ctx, x, y, scale = 1, seed = 1) {
    const s = scale;
    // stem
    Art.rect(ctx, x - 7 * s, y - 22 * s, 14 * s, 22 * s, '#f4ecd2', '#7a5a2a', 3, seed, 1.0);
    // cap
    const capPts = [
      [x - 22 * s, y - 22 * s],
      [x - 14 * s, y - 36 * s],
      [x + 14 * s, y - 36 * s],
      [x + 22 * s, y - 22 * s],
    ];
    Art.poly(ctx, capPts, '#d23838', '#7a1818', 4, seed + 5, 1.3);
    // dots
    Art.ellipse(ctx, x - 8 * s, y - 28 * s, 3 * s, 3 * s, '#fff8e0', null, 0, seed + 11, 0.5);
    Art.ellipse(ctx, x + 6 * s, y - 30 * s, 4 * s, 3 * s, '#fff8e0', null, 0, seed + 17, 0.5);
    Art.ellipse(ctx, x + 1, y - 24 * s, 2.5 * s, 2 * s, '#fff8e0', null, 0, seed + 19, 0.5);
  }

  function castle(ctx, x, y, scale = 1) {
    const s = scale;
    // main wall
    Art.rect(ctx, x - 50 * s, y - 90 * s, 100 * s, 90 * s, '#e6c89a', '#6a4a20', 4, 101, 1.2);
    Art.scribbleFill(ctx, x - 50 * s, y - 90 * s, 100 * s, 90 * s, '#c8a268', { density: 5, seed: 109, alpha: 0.3, angle: 0.6 });
    // towers
    Art.rect(ctx, x - 65 * s, y - 130 * s, 30 * s, 130 * s, '#e6c89a', '#6a4a20', 4, 113, 1.2);
    Art.rect(ctx, x + 35 * s, y - 130 * s, 30 * s, 130 * s, '#e6c89a', '#6a4a20', 4, 117, 1.2);
    // tower roofs
    Art.poly(ctx, [
      [x - 70 * s, y - 130 * s], [x - 50 * s, y - 160 * s], [x - 30 * s, y - 130 * s]
    ], '#c2386a', '#6a1a30', 4, 121, 1.3);
    Art.poly(ctx, [
      [x + 30 * s, y - 130 * s], [x + 50 * s, y - 160 * s], [x + 70 * s, y - 130 * s]
    ], '#c2386a', '#6a1a30', 4, 127, 1.3);
    // door
    Art.rect(ctx, x - 14 * s, y - 50 * s, 28 * s, 50 * s, '#5a3a10', '#2a1a08', 3, 131, 1.0);
    // flag
    Art.line(ctx, x - 50 * s, y - 160 * s, x - 50 * s, y - 185 * s, '#3a2a10', 3, 137, 0.6);
    Art.poly(ctx, [
      [x - 50 * s, y - 185 * s], [x - 30 * s, y - 178 * s], [x - 50 * s, y - 172 * s]
    ], '#e23b3b', '#7a1818', 3, 139, 1.2);
  }

  function rock(ctx, x, y, scale = 1, seed = 1) {
    const pts = [
      [x - 30 * scale, y],
      [x - 22 * scale, y - 22 * scale],
      [x - 6 * scale, y - 28 * scale],
      [x + 16 * scale, y - 24 * scale],
      [x + 28 * scale, y - 8 * scale],
      [x + 24 * scale, y],
    ];
    Art.poly(ctx, pts, '#9aa0a0', '#3a4040', 4, seed, 1.3);
    Art.scribbleFill(ctx, x - 30 * scale, y - 28 * scale, 60 * scale, 28 * scale, '#6a7070', { density: 4, seed: seed + 11, alpha: 0.25, angle: 0.4 });
  }

  function caveBg(ctx, w, h) {
    // dark bluish-black gradient
    ctx.fillStyle = '#1a1024';
    ctx.fillRect(0, 0, w, h);
    Art.scribbleFill(ctx, 0, 0, w, h, '#3a1f4a', { density: 9, seed: 211, alpha: 0.3, angle: 0.2 });
    // ceiling stalactites
    for (let i = 0; i < 8; i++) {
      const x = 60 + i * (w - 120) / 7;
      const len = 30 + (i % 3) * 20;
      Art.poly(ctx, [
        [x - 14, 0], [x + 14, 0], [x, len]
      ], '#2a1a3a', '#0e0518', 3, 233 + i, 1.0);
    }
    // floor
    Art.rect(ctx, -10, h - 70, w + 20, 90, '#2a1a3a', '#0e0518', 4, 251, 1.0);
    // ground stalagmites
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 180;
      const len = 24 + (i % 2) * 16;
      Art.poly(ctx, [
        [x - 14, h - 70], [x + 14, h - 70], [x, h - 70 - len]
      ], '#2a1a3a', '#0e0518', 3, 271 + i, 1.0);
    }
  }

  function firefly(ctx, x, y, time) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.005 + x);
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#fff5a8';
    ctx.beginPath(); ctx.arc(x, y, 2.5 + pulse, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.25 * pulse;
    ctx.beginPath(); ctx.arc(x, y, 7 + pulse * 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  return {
    paperBg, sky, sun, cloud, grass, flower, tree, bush, mushroom,
    castle, rock, caveBg, firefly,
  };
})();

// ============================================================================
// Characters
// ============================================================================
const Characters = (() => {

  // Princess Adrian — based on her own drawing.
  // x, y is FEET position. Faces left if facing=-1.
  function princess(ctx, x, y, opts = {}) {
    const facing = opts.facing || 1;
    const phase = opts.walkPhase || 0;
    const armRaise = opts.armRaise != null ? opts.armRaise : 0.7; // 0..1; raised by default
    const scale = opts.scale || 1;

    ctx.save();
    ctx.translate(x, y);
    const bounce = (Math.sin(phase * Math.PI * 2) * 0.5 + 0.5) * (opts.walking ? 2.5 : 0);
    ctx.translate(0, -bounce);
    ctx.scale(facing * scale, scale);

    const hairColor = '#c8a02a';
    const hairOutline = '#7a5a10';

    // ---------- BACK HAIR (drawn first, behind everything) ----------
    // Long flowing strands hanging down past the dress on each side.
    Art.poly(ctx, [
      [-30, -120], [-58, -90], [-66, -40], [-58, -2], [-40, -10],
      [-32, -40], [-28, -90]
    ], hairColor, hairOutline, 3, 501, 1.4);
    Art.poly(ctx, [
      [30, -120], [58, -90], [66, -40], [58, -2], [40, -10],
      [32, -40], [28, -90]
    ], hairColor, hairOutline, 3, 503, 1.4);
    // hair behind the head/crown
    Art.ellipse(ctx, 0, -118, 32, 28, hairColor, hairOutline, 3, 505, 1.4);

    // ---------- shoes ----------
    const stride = opts.walking ? Math.sin(phase * Math.PI * 2) * 6 : 0;
    Art.poly(ctx, [
      [-14 - stride, 0], [-2 - stride, 0], [3 - stride, -8], [-9 - stride, -8]
    ], '#1ea5c4', '#0f4d63', 3, 301, 1.0);
    Art.poly(ctx, [
      [2 + stride, 0], [18 + stride, 0], [22 + stride, -8], [7 + stride, -8]
    ], '#26b6d4', '#0f4d63', 3, 305, 1.0);

    // ---------- legs (peeking under dress, blue tights) ----------
    Art.rect(ctx, -12, -28, 10, 22, '#26b6d4', '#0f4d63', 2, 311, 0.6);
    Art.rect(ctx, 4, -28, 10, 22, '#26b6d4', '#0f4d63', 2, 313, 0.6);

    // ---------- dress (rainbow vertical stripes in a trapezoid) ----------
    const dressTop = -86, dressBot = -28;
    const topW = 22, botW = 36;
    const dressPts = [
      [-topW, dressTop], [topW, dressTop],
      [botW, dressBot], [-botW, dressBot]
    ];
    Art.poly(ctx, dressPts, '#fdfcf4', '#3a2a10', 3, 321, 1.0);
    // vertical rainbow stripes via clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-topW, dressTop);
    ctx.lineTo(topW, dressTop);
    ctx.lineTo(botW, dressBot);
    ctx.lineTo(-botW, dressBot);
    ctx.closePath();
    ctx.clip();
    const stripeColors = [
      '#3a8ee0', '#e84a4a', '#f4a82a', '#7a3ec7',
      '#2aa860', '#e85aa8', '#1ea5c4', '#f4c12a',
      '#7a3ec7', '#e84a4a', '#3a8ee0',
    ];
    const sw = (botW * 2) / stripeColors.length;
    for (let i = 0; i < stripeColors.length; i++) {
      const cx = -botW + sw * (i + 0.5);
      ctx.save();
      ctx.lineWidth = sw * 0.95;
      ctx.lineCap = 'round';
      ctx.strokeStyle = stripeColors[i];
      ctx.globalAlpha = 0.95;
      const r = Art.srand(331 + i)();
      ctx.beginPath();
      ctx.moveTo(cx * 0.6 + (r - 0.5) * 1.5, dressTop - 2);
      ctx.lineTo(cx + (r - 0.5) * 1.5, dressBot + 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    Art.poly(ctx, dressPts, null, '#3a2a10', 3, 321, 1.0);

    // ---------- arms (in front of dress) ----------
    const ar = armRaise;
    const shL = [-18, -82], shR = [18, -82];
    const handDownL = [-30, -44], handUpL = [-44, -126];
    const handDownR = [30, -44],  handUpR = [44, -126];
    const handL = [
      handDownL[0] * (1 - ar) + handUpL[0] * ar,
      handDownL[1] * (1 - ar) + handUpL[1] * ar
    ];
    const handR = [
      handDownR[0] * (1 - ar) + handUpR[0] * ar,
      handDownR[1] * (1 - ar) + handUpR[1] * ar
    ];
    drawSleeve(ctx, shL[0], shL[1], handL[0], handL[1], 401);
    drawSleeve(ctx, shR[0], shR[1], handR[0], handR[1], 411);
    Art.ellipse(ctx, handL[0], handL[1], 6, 6, '#f4c8a8', '#7a4a2a', 2, 421, 0.6);
    Art.ellipse(ctx, handR[0], handR[1], 6, 6, '#f4c8a8', '#7a4a2a', 2, 423, 0.6);

    // ---------- face ----------
    Art.ellipse(ctx, 0, -120, 18, 22, '#f4c8a8', '#7a4a2a', 3, 531, 0.8);

    // ---------- front hair tufts (only on forehead, above eyes) ----------
    Art.poly(ctx, [
      [-19, -134], [-13, -140], [-4, -134], [4, -140], [13, -134], [19, -138],
      [18, -128], [-18, -128]
    ], hairColor, hairOutline, 2.5, 511, 1.0);
    // eyes (blue)
    Art.ellipse(ctx, -7, -123, 3, 4, '#1ea5c4', '#0f4d63', 1.5, 541, 0.4);
    Art.ellipse(ctx, 7, -123, 3, 4, '#1ea5c4', '#0f4d63', 1.5, 543, 0.4);
    // little nose mark
    Art.line(ctx, 1, -118, 2, -114, '#7a4a2a', 1.5, 547, 0.3);
    // smile (red curve)
    ctx.save();
    ctx.strokeStyle = '#c81e1e'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -110);
    ctx.quadraticCurveTo(0, -104, 6, -110);
    ctx.stroke();
    ctx.restore();

    // ---------- crown (tall, multi-band) ----------
    // crown sits on top of head at y ~ -142
    const cy = -148;
    // base band
    Art.rect(ctx, -18, cy, 36, 8, '#7a3ec7', '#3a1a60', 3, 601, 0.6);
    Art.rect(ctx, -18, cy - 8, 36, 8, '#1ea5c4', '#0f4d63', 3, 603, 0.6);
    Art.rect(ctx, -18, cy - 16, 36, 8, '#2aa860', '#0e4a20', 3, 605, 0.6);
    Art.rect(ctx, -18, cy - 24, 36, 8, '#7a3ec7', '#3a1a60', 3, 607, 0.6);
    // top spikes
    Art.poly(ctx, [
      [-18, cy - 24], [-12, cy - 38], [-6, cy - 24]
    ], '#e84a4a', '#7a1818', 3, 611, 0.8);
    Art.poly(ctx, [
      [-6, cy - 24], [0, cy - 42], [6, cy - 24]
    ], '#e84a4a', '#7a1818', 3, 613, 0.8);
    Art.poly(ctx, [
      [6, cy - 24], [12, cy - 38], [18, cy - 24]
    ], '#e84a4a', '#7a1818', 3, 615, 0.8);
    // jewel dots
    Art.ellipse(ctx, -10, cy + 4, 2, 2, '#f7e64a', null, 0, 621, 0.3);
    Art.ellipse(ctx, 10, cy + 4, 2, 2, '#f7e64a', null, 0, 623, 0.3);

    ctx.restore();
  }

  function drawSleeve(ctx, x1, y1, x2, y2, seed) {
    // Striped sleeve from shoulder to hand
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const px = -uy, py = ux; // perpendicular
    const halfW = 5;
    const a = [x1 + px * halfW, y1 + py * halfW];
    const b = [x1 - px * halfW, y1 - py * halfW];
    const c = [x2 - px * halfW, y2 - py * halfW];
    const d = [x2 + px * halfW, y2 + py * halfW];
    // base
    Art.poly(ctx, [a, b, c, d], '#7a3ec7', '#3a1a60', 3, seed, 0.8);
    // stripes (perpendicular to arm)
    const stripeColors = ['#1ea5c4', '#7a3ec7', '#1ea5c4', '#7a3ec7', '#1ea5c4'];
    const n = 5;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.lineTo(...d); ctx.closePath();
    ctx.clip();
    ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const cx = x1 + ux * len * t, cy = y1 + uy * len * t;
      const sa = [cx + px * (halfW + 2), cy + py * (halfW + 2)];
      const sb = [cx - px * (halfW + 2), cy - py * (halfW + 2)];
      ctx.strokeStyle = stripeColors[i % stripeColors.length];
      ctx.globalAlpha = 0.95;
      ctx.beginPath(); ctx.moveTo(...sa); ctx.lineTo(...sb); ctx.stroke();
    }
    ctx.restore();
    Art.poly(ctx, [a, b, c, d], null, '#3a1a60', 2.5, seed, 0.8);
  }

  // Baby bear — small, cute, brown
  function bear(ctx, x, y, opts = {}) {
    const facing = opts.facing || 1;
    const phase = opts.walkPhase || 0;
    const scale = opts.scale || 1;
    ctx.save();
    ctx.translate(x, y);
    const bounce = (opts.walking ? Math.abs(Math.sin(phase * Math.PI * 2)) * 2 : 0);
    ctx.translate(0, -bounce);
    ctx.scale(facing * scale, scale);
    // body
    Art.ellipse(ctx, 0, -22, 26, 22, '#a06b3a', '#5a3a1a', 4, 701, 1.2);
    // legs
    const stride = opts.walking ? Math.sin(phase * Math.PI * 2) * 4 : 0;
    Art.ellipse(ctx, -12 - stride, -4, 7, 6, '#a06b3a', '#5a3a1a', 3, 711, 0.8);
    Art.ellipse(ctx,  12 + stride, -4, 7, 6, '#a06b3a', '#5a3a1a', 3, 713, 0.8);
    // head
    Art.ellipse(ctx, 18, -38, 18, 16, '#a06b3a', '#5a3a1a', 4, 721, 1.2);
    // ears
    Art.ellipse(ctx, 8, -52, 6, 6, '#a06b3a', '#5a3a1a', 3, 731, 0.6);
    Art.ellipse(ctx, 28, -52, 6, 6, '#a06b3a', '#5a3a1a', 3, 733, 0.6);
    Art.ellipse(ctx, 8, -52, 3, 3, '#f4c8a8', null, 0, 735, 0.3);
    Art.ellipse(ctx, 28, -52, 3, 3, '#f4c8a8', null, 0, 737, 0.3);
    // muzzle
    Art.ellipse(ctx, 22, -32, 8, 6, '#f4dcb8', '#5a3a1a', 2, 741, 0.6);
    // nose
    Art.ellipse(ctx, 24, -36, 2.5, 2, '#2a1a0e', null, 0, 745, 0.3);
    // eyes
    Art.ellipse(ctx, 13, -42, 2, 2.5, '#2a1a0e', null, 0, 751, 0.3);
    Art.ellipse(ctx, 23, -42, 2, 2.5, '#2a1a0e', null, 0, 753, 0.3);
    // smile
    ctx.save();
    ctx.strokeStyle = '#2a1a0e'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(20, -30);
    ctx.quadraticCurveTo(23, -27, 26, -30);
    ctx.stroke();
    ctx.restore();
    // tiny tail
    Art.ellipse(ctx, -22, -22, 4, 4, '#a06b3a', '#5a3a1a', 2, 761, 0.5);
    ctx.restore();
  }

  // Vampire — pale, black cape, red eyes, fangs.
  function vampire(ctx, x, y, opts = {}) {
    const facing = opts.facing || -1;
    const phase = opts.walkPhase || 0;
    const scale = opts.scale || 1;
    const hurt = opts.hurt || 0; // 0..1 fading
    const dead = opts.dead || false;

    ctx.save();
    ctx.translate(x, y);
    if (dead) {
      // collapsed pose
      ctx.translate(0, -10);
      ctx.rotate(Math.PI / 2 * (1 - opts.deathAnim));
    }
    const bounce = (opts.walking ? Math.abs(Math.sin(phase * Math.PI * 2)) * 1.5 : 0);
    ctx.translate(0, -bounce);
    ctx.scale(facing * scale, scale);

    if (hurt > 0) ctx.globalAlpha = 0.6 + 0.4 * Math.sin(hurt * 30);

    // shoes
    Art.poly(ctx, [[-12, 0], [-2, 0], [0, -6], [-10, -6]], '#0e0518', '#000', 2, 801, 0.6);
    Art.poly(ctx, [[2, 0], [12, 0], [10, -6], [0, -6]], '#0e0518', '#000', 2, 803, 0.6);
    // legs (under cape)
    Art.rect(ctx, -10, -34, 8, 28, '#1a1024', '#000', 2, 811, 0.6);
    Art.rect(ctx, 2, -34, 8, 28, '#1a1024', '#000', 2, 813, 0.6);
    // cape (big black bell shape)
    Art.poly(ctx, [
      [-26, -34], [-46, -86], [-30, -98], [30, -98], [46, -86], [26, -34],
      [16, -28], [-16, -28]
    ], '#0e0518', '#000', 4, 821, 1.4);
    // body/torso (red shirt visible)
    Art.rect(ctx, -16, -86, 32, 50, '#7a1818', '#3a0808', 3, 831, 1.0);
    // collar (high vampire collar)
    Art.poly(ctx, [
      [-22, -100], [-26, -78], [-6, -88], [6, -88], [26, -78], [22, -100]
    ], '#0e0518', '#3a0e2a', 3, 841, 1.0);
    // head (pale)
    Art.ellipse(ctx, 0, -110, 18, 22, '#e8e0e8', '#5a3a4a', 3, 851, 1.0);
    // hair (slicked black with widow's peak)
    Art.poly(ctx, [
      [-16, -118], [-18, -126], [-8, -132], [0, -120], [8, -132], [18, -126], [16, -118]
    ], '#0e0518', '#000', 3, 861, 1.0);
    // eyes (red, glowing)
    Art.ellipse(ctx, -6, -112, 2.5, 3, '#e23b3b', '#7a1010', 1.2, 871, 0.4);
    Art.ellipse(ctx,  6, -112, 2.5, 3, '#e23b3b', '#7a1010', 1.2, 873, 0.4);
    // angry brows
    Art.line(ctx, -10, -118, -3, -116, '#0e0518', 2, 881, 0.4);
    Art.line(ctx,  3, -116,  10, -118, '#0e0518', 2, 883, 0.4);
    // mouth + fangs
    ctx.save();
    ctx.strokeStyle = '#3a0e1a'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, -102);
    ctx.quadraticCurveTo(0, -98, 5, -102);
    ctx.stroke();
    // fangs
    ctx.fillStyle = '#fdfcf4'; ctx.strokeStyle = '#3a0e1a'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, -101); ctx.lineTo(-1, -95); ctx.lineTo(-1, -101); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, -101); ctx.lineTo(1, -95); ctx.lineTo(1, -101); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  // Heart icon
  function heart(ctx, x, y, scale = 1, color = '#e84a8e') {
    ctx.save();
    ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = color; ctx.strokeStyle = '#7a1a4a'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-12, -4, -10, -16, 0, -10);
    ctx.bezierCurveTo(10, -16, 12, -4, 0, 6);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // Sparkle
  function sparkle(ctx, x, y, scale = 1, color = '#fff5a8') {
    ctx.save();
    ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = color; ctx.strokeStyle = '#e0a838'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      const lx = Math.cos(a) * 8, ly = Math.sin(a) * 8;
      const px = Math.cos(a + Math.PI / 4) * 2, py = Math.sin(a + Math.PI / 4) * 2;
      if (i === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  return { princess, bear, vampire, heart, sparkle };
})();

// ============================================================================
// UI helpers (speech bubbles, action prompts, title)
// ============================================================================
const UI = (() => {

  // Wraps text into lines that fit in maxWidth
  function wrap(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line); line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Big speech box at the bottom of screen, with speaker name
  function dialogueBox(ctx, w, h, speaker, text) {
    const boxX = 40, boxY = h - 150, boxW = w - 80, boxH = 120;
    // shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(boxX + 6, boxY + 8, boxW, boxH);
    ctx.restore();
    // paper-style box
    Art.rect(ctx, boxX, boxY, boxW, boxH, '#fff8e0', '#3a2a10', 4, 901, 1.4);
    Art.scribbleFill(ctx, boxX, boxY, boxW, boxH, '#f4e4b8', { density: 8, seed: 909, alpha: 0.18, angle: 0.1 });
    // speaker name tag
    if (speaker) {
      ctx.save();
      ctx.font = 'bold 18px "Comic Sans MS", "Marker Felt", system-ui, sans-serif';
      const nameW = Math.min(ctx.measureText(speaker).width + 30, 280);
      ctx.restore();
      Art.rect(ctx, boxX + 14, boxY - 18, nameW, 30, '#ffd86a', '#7a4a10', 3, 911, 1.0);
      ctx.save();
      ctx.font = 'bold 18px "Comic Sans MS", "Marker Felt", system-ui, sans-serif';
      ctx.fillStyle = '#3a2a10';
      ctx.textBaseline = 'middle';
      ctx.fillText(speaker, boxX + 28, boxY - 4);
      ctx.restore();
    }
    // text
    ctx.save();
    ctx.font = '22px "Comic Sans MS", "Marker Felt", system-ui, sans-serif';
    ctx.fillStyle = '#2b1b0e';
    ctx.textBaseline = 'top';
    const lines = wrap(ctx, text, boxW - 40);
    for (let i = 0; i < lines.length && i < 3; i++) {
      ctx.fillText(lines[i], boxX + 22, boxY + 20 + i * 30);
    }
    // "press space" hint
    ctx.font = 'italic 14px "Comic Sans MS", system-ui, sans-serif';
    ctx.fillStyle = '#7a5a30';
    ctx.textAlign = 'right';
    ctx.fillText('press SPACE', boxX + boxW - 18, boxY + boxH - 24);
    ctx.restore();
  }

  // Floating action bubble above an interactable. kind: 'talk'|'pickup'|'use'|'fight'
  function actionPrompt(ctx, x, y, kind, time) {
    const bob = Math.sin(time * 0.005) * 3;
    const cy = y + bob;
    // bubble
    Art.ellipse(ctx, x, cy, 22, 22, '#fff8e0', '#3a2a10', 3, 951, 0.8);
    // tail
    Art.poly(ctx, [
      [x - 4, cy + 18], [x + 4, cy + 18], [x, cy + 28]
    ], '#fff8e0', '#3a2a10', 2, 953, 0.5);
    // icon
    ctx.save();
    ctx.translate(x, cy);
    if (kind === 'talk') {
      // small chat bubble icon
      ctx.fillStyle = '#3a8ee0'; ctx.strokeStyle = '#0f4d63'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -1, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath();
      ctx.arc(-4, -1, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -1, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -1, 1.4, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'pickup') {
      // hand / star
      ctx.fillStyle = '#f4c12a'; ctx.strokeStyle = '#7a4a10'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = -Math.PI / 2 + i * (Math.PI * 2 / 5);
        const a2 = a1 + Math.PI / 5;
        const r1 = 9, r2 = 4;
        const px = Math.cos(a1) * r1, py = Math.sin(a1) * r1;
        const qx = Math.cos(a2) * r2, qy = Math.sin(a2) * r2;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        ctx.lineTo(qx, qy);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (kind === 'fight') {
      // little sword X
      ctx.strokeStyle = '#c81e1e'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7, -7); ctx.lineTo(7, 7);
      ctx.moveTo(7, -7); ctx.lineTo(-7, 7);
      ctx.stroke();
    } else {
      // default exclamation
      ctx.fillStyle = '#c81e1e';
      ctx.beginPath(); ctx.arc(0, 4, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-1.5, -8, 3, 9);
    }
    ctx.restore();
  }

  // "Exit this way →" arrow at edge
  function exitArrow(ctx, x, y, dir, time) {
    const bob = Math.sin(time * 0.004) * 4;
    ctx.save();
    ctx.translate(x + bob * dir, y);
    ctx.scale(dir, 1);
    ctx.fillStyle = '#3a8ee0'; ctx.strokeStyle = '#0f4d63'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, -10); ctx.lineTo(8, -10); ctx.lineTo(8, -20);
    ctx.lineTo(28, 0); ctx.lineTo(8, 20); ctx.lineTo(8, 10); ctx.lineTo(-20, 10);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // Title screen text card
  function titleCard(ctx, w, h, time) {
    // big title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // shadow paper
    Art.rect(ctx, w / 2 - 320, 80, 640, 200, '#fff8e0', '#3a2a10', 5, 1001, 1.6);
    Art.scribbleFill(ctx, w / 2 - 320, 80, 640, 200, '#f4d488', { density: 9, seed: 1011, alpha: 0.22, angle: -0.15 });
    ctx.font = 'bold 48px "Comic Sans MS", "Marker Felt", system-ui, sans-serif';
    ctx.fillStyle = '#c2386a';
    ctx.fillText('Princess Adrian', w / 2, 150);
    ctx.font = 'bold 36px "Comic Sans MS", system-ui, sans-serif';
    ctx.fillStyle = '#3a2a10';
    ctx.fillText('and the Baby Bear', w / 2, 210);
    ctx.font = 'italic 22px "Comic Sans MS", system-ui, sans-serif';
    ctx.fillStyle = '#7a4a20';
    ctx.fillText('a story by Adrian, age 5', w / 2, 256);

    // start prompt — put inside its own little card on the left
    const pulse = 0.7 + 0.3 * Math.sin(time * 0.005);
    Art.rect(ctx, 60, h - 110, 380, 60, '#fff8e0', '#3a2a10', 4, 1031, 1.2);
    ctx.font = 'bold 22px "Comic Sans MS", system-ui, sans-serif';
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#3a2a10';
    ctx.fillText('Press ENTER or click to begin', 250, h - 80);
    ctx.restore();
  }

  function endingCard(ctx, w, h) {
    Art.rect(ctx, w / 2 - 280, h / 2 - 100, 560, 200, '#fff8e0', '#3a2a10', 5, 1101, 1.6);
    Art.scribbleFill(ctx, w / 2 - 280, h / 2 - 100, 560, 200, '#f4c8e0', { density: 9, seed: 1111, alpha: 0.22, angle: 0.15 });
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 56px "Comic Sans MS", system-ui, sans-serif';
    ctx.fillStyle = '#c2386a';
    ctx.fillText('The End', w / 2, h / 2 - 30);
    ctx.font = '22px "Comic Sans MS", system-ui, sans-serif';
    ctx.fillStyle = '#3a2a10';
    ctx.fillText('Adrian and the baby bear lived happily ever after.', w / 2, h / 2 + 22);
    ctx.font = 'italic 18px "Comic Sans MS", system-ui, sans-serif';
    ctx.fillStyle = '#7a4a20';
    ctx.fillText('Press ENTER to play again', w / 2, h / 2 + 60);
    ctx.restore();
  }

  return { dialogueBox, actionPrompt, exitArrow, titleCard, endingCard, wrap };
})();
