// =====================================================================
// art.js - cartoon SVG art (Plants vs Zombies / Adventure Time vibe)
// Each entry is an SVG string with viewBox 0 0 100 100. Bold outlines,
// flat colors, slight shading. Used in:
//   - Puzzles: injected directly into the DOM (vector, crisp at any size)
//   - Gallery / Fight: pre-loaded as Image and drawn onto canvas
// =====================================================================

const ART = {};

// ---- Helper: stroke style used everywhere ----
const _S = 'stroke="#1a1a2e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

// =================== CHARACTERS ===================

ART.hero = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="82" rx="24" ry="13" fill="#5a7ec2" ${_S}/>
  <rect x="30" y="74" width="40" height="6" fill="#3e5a96" ${_S}/>
  <circle cx="50" cy="46" r="22" fill="#ffd9a8" ${_S}/>
  <path d="M 28 38 Q 28 14 50 14 Q 72 14 72 38 Z" fill="#9aa0ac" ${_S}/>
  <ellipse cx="50" cy="38" rx="22" ry="3.5" fill="#6a7078" ${_S}/>
  <circle cx="34" cy="30" r="1.6" fill="#5a6068"/>
  <circle cx="66" cy="30" r="1.6" fill="#5a6068"/>
  <circle cx="50" cy="22" r="1.6" fill="#5a6068"/>
  <path d="M 50 14 Q 62 2 70 8 Q 60 12 50 18 Z" fill="#cc2222" ${_S}/>
  <circle cx="42" cy="50" r="4.5" fill="#fff" ${_S}/>
  <circle cx="58" cy="50" r="4.5" fill="#fff" ${_S}/>
  <circle cx="43" cy="51" r="2.2" fill="#1a1a2e"/>
  <circle cx="59" cy="51" r="2.2" fill="#1a1a2e"/>
  <path d="M 44 62 Q 50 67 56 62" fill="none" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="36" cy="58" r="3" fill="#ffb0a0" opacity="0.6"/>
  <circle cx="64" cy="58" r="3" fill="#ffb0a0" opacity="0.6"/>
</svg>`;

ART.pirate = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="80" rx="24" ry="14" fill="#5a3a1a" ${_S}/>
  <rect x="30" y="72" width="40" height="7" fill="#ffd700" ${_S}/>
  <circle cx="55" cy="76" r="2" fill="#1a1a2e"/>
  <circle cx="50" cy="42" r="22" fill="#ffd9a8" ${_S}/>
  <path d="M 28 36 Q 50 14 72 36 Q 65 30 50 24 Q 35 30 28 36 Z" fill="#cc2222" ${_S}/>
  <circle cx="38" cy="30" r="1.8" fill="#fff"/>
  <circle cx="50" cy="26" r="1.8" fill="#fff"/>
  <circle cx="62" cy="30" r="1.8" fill="#fff"/>
  <ellipse cx="40" cy="46" rx="9" ry="7" fill="#1a1a2e"/>
  <line x1="22" y1="40" x2="50" y2="46" stroke="#1a1a2e" stroke-width="2.5"/>
  <circle cx="60" cy="46" r="4" fill="#fff" ${_S}/>
  <circle cx="61" cy="47" r="2" fill="#1a1a2e"/>
  <path d="M 32 56 Q 28 70 40 66 Q 50 72 60 66 Q 72 70 68 56 Q 50 60 32 56 Z" fill="#3a200a" ${_S}/>
  <path d="M 46 60 Q 50 64 54 60" fill="none" stroke="#1a1a2e" stroke-width="2.2"/>
</svg>`;

ART.zombie = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="80" rx="22" ry="14" fill="#4a6a3a" ${_S}/>
  <path d="M 32 70 L 30 80 M 68 70 L 70 80 M 50 72 L 48 82" stroke="#1a1a2e" stroke-width="2"/>
  <circle cx="50" cy="40" r="22" fill="#7fb55c" ${_S}/>
  <path d="M 28 30 Q 32 26 36 30 M 50 26 Q 54 22 58 26 M 64 30 Q 68 26 72 30" fill="none" stroke="#1a1a2e" stroke-width="2"/>
  <ellipse cx="42" cy="42" rx="6" ry="5" fill="#fff" ${_S}/>
  <ellipse cx="58" cy="44" rx="5" ry="4" fill="#fff" ${_S}/>
  <circle cx="42" cy="42" r="2.5" fill="#cc2222"/>
  <circle cx="58" cy="44" r="2" fill="#cc2222"/>
  <path d="M 38 58 L 42 62 L 46 58 L 50 62 L 54 58 L 58 62 L 62 58" fill="#fff" ${_S}/>
  <ellipse cx="35" cy="48" rx="3" ry="2" fill="#5a8a3a" opacity="0.7"/>
  <ellipse cx="64" cy="36" rx="3" ry="2" fill="#5a8a3a" opacity="0.7"/>
  <line x1="40" y1="52" x2="48" y2="56" stroke="#1a1a2e" stroke-width="1.5"/>
</svg>`;

ART.warrior = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="82" rx="26" ry="14" fill="#a4a8b0" ${_S}/>
  <path d="M 26 76 L 74 76 L 70 86 L 30 86 Z" fill="#7a7e88" ${_S}/>
  <circle cx="50" cy="40" r="24" fill="#cfd2d8" ${_S}/>
  <rect x="26" y="36" width="48" height="14" fill="#1a1a2e"/>
  <rect x="32" y="40" width="6" height="6" fill="#cc2222"/>
  <rect x="62" y="40" width="6" height="6" fill="#cc2222"/>
  <path d="M 42 36 L 42 50 M 50 36 L 50 50 M 58 36 L 58 50" stroke="#7a7e88" stroke-width="2"/>
  <path d="M 34 18 Q 50 8 66 18 L 64 26 L 50 22 L 36 26 Z" fill="#7a7e88" ${_S}/>
  <path d="M 50 6 Q 56 2 60 8 L 56 14 Z" fill="#cc2222" ${_S}/>
  <path d="M 38 60 Q 50 66 62 60" fill="none" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

ART.bossPirate = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="84" rx="32" ry="14" fill="#3a200a" ${_S}/>
  <rect x="22" y="74" width="56" height="9" fill="#ffd700" ${_S}/>
  <circle cx="40" cy="78" r="2.5" fill="#1a1a2e"/>
  <circle cx="60" cy="78" r="2.5" fill="#1a1a2e"/>
  <circle cx="50" cy="40" r="28" fill="#ffd9a8" ${_S}/>
  <path d="M 22 32 Q 50 6 78 32 Q 70 24 50 18 Q 30 24 22 32 Z" fill="#8b0000" ${_S}/>
  <circle cx="32" cy="24" r="2" fill="#fff"/>
  <circle cx="50" cy="18" r="2" fill="#fff"/>
  <circle cx="68" cy="24" r="2" fill="#fff"/>
  <ellipse cx="38" cy="46" rx="11" ry="9" fill="#1a1a2e"/>
  <line x1="18" y1="38" x2="50" y2="46" stroke="#1a1a2e" stroke-width="3"/>
  <circle cx="62" cy="46" r="5" fill="#fff" ${_S}/>
  <circle cx="63" cy="47" r="2.5" fill="#cc2222"/>
  <circle cx="63" cy="47" r="1.2" fill="#1a1a2e"/>
  <path d="M 26 56 Q 22 80 40 70 Q 50 78 60 70 Q 78 80 74 56 Q 50 64 26 56 Z" fill="#1a1a0a" ${_S}/>
  <path d="M 42 64 L 46 70 L 50 66 L 54 70 L 58 64" fill="#fff" ${_S}/>
</svg>`;

// =================== ITEMS ===================

ART.chest = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 14 50 Q 14 30 50 30 Q 86 30 86 50 L 86 50 L 14 50 Z" fill="#a0552a" ${_S}/>
  <rect x="14" y="48" width="72" height="38" fill="#7a3f1a" ${_S}/>
  <rect x="14" y="48" width="72" height="6" fill="#ffd700" ${_S}/>
  <rect x="14" y="62" width="72" height="6" fill="#ffd700" ${_S}/>
  <rect x="42" y="56" width="16" height="16" fill="#ffd700" ${_S}/>
  <circle cx="50" cy="64" r="3" fill="#1a1a2e"/>
  <rect x="20" y="40" width="6" height="10" fill="#5a2d0c"/>
  <rect x="74" y="40" width="6" height="10" fill="#5a2d0c"/>
</svg>`;

ART.ship = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 50 14 L 50 56" stroke="#5a3a1a" stroke-width="3.5"/>
  <path d="M 50 18 L 80 22 L 50 32 Z" fill="#cc2222" ${_S}/>
  <path d="M 26 36 Q 50 28 74 36 L 70 50 Q 50 46 30 50 Z" fill="#fff" ${_S}/>
  <path d="M 14 56 L 86 56 L 78 78 Q 50 86 22 78 Z" fill="#7a3f1a" ${_S}/>
  <rect x="20" y="60" width="60" height="6" fill="#5a2d0c"/>
  <circle cx="32" cy="68" r="2.5" fill="#ffd700" ${_S}/>
  <circle cx="50" cy="68" r="2.5" fill="#ffd700" ${_S}/>
  <circle cx="68" cy="68" r="2.5" fill="#ffd700" ${_S}/>
  <path d="M 6 84 Q 20 80 36 84 Q 50 88 64 84 Q 80 80 94 84" fill="none" stroke="#3366cc" stroke-width="3.5"/>
  <path d="M 4 92 Q 20 88 36 92 Q 50 96 64 92 Q 80 88 96 92" fill="none" stroke="#3366cc" stroke-width="3.5"/>
</svg>`;

ART.parrot = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="56" rx="22" ry="26" fill="#b91c1c" ${_S}/>
  <ellipse cx="50" cy="56" rx="14" ry="20" fill="#fff5cc"/>
  <circle cx="50" cy="32" r="16" fill="#b91c1c" ${_S}/>
  <circle cx="46" cy="30" r="3.5" fill="#fff" ${_S}/>
  <circle cx="46" cy="30" r="1.6" fill="#1a1a2e"/>
  <path d="M 56 34 L 70 32 L 64 38 L 56 38 Z" fill="#ffb000" ${_S}/>
  <ellipse cx="30" cy="56" rx="10" ry="14" fill="#3fbf3f" ${_S}/>
  <ellipse cx="70" cy="58" rx="9" ry="13" fill="#3fbf3f" ${_S}/>
  <path d="M 44 80 Q 40 92 36 90 M 50 82 Q 50 92 50 92 M 56 80 Q 60 92 64 90" fill="none" stroke="#3366cc" stroke-width="4"/>
</svg>`;

ART.anchor = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="20" r="10" fill="none" stroke="#7a8088" stroke-width="6"/>
  <line x1="50" y1="30" x2="50" y2="80" stroke="#7a8088" stroke-width="8" stroke-linecap="round"/>
  <line x1="34" y1="42" x2="66" y2="42" stroke="#7a8088" stroke-width="6" stroke-linecap="round"/>
  <path d="M 18 64 Q 22 84 50 86 Q 78 84 82 64 L 76 70 Q 60 76 50 76 Q 40 76 24 70 Z" fill="#7a8088" ${_S}/>
  <circle cx="50" cy="20" r="3" fill="none" ${_S}/>
</svg>`;

ART.sword = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 50 6 L 56 60 L 50 68 L 44 60 Z" fill="#dfe2e8" ${_S}/>
  <path d="M 48 12 L 50 56" stroke="#a4a8b0" stroke-width="2"/>
  <rect x="30" y="60" width="40" height="8" fill="#ffd700" ${_S}/>
  <rect x="46" y="68" width="8" height="22" fill="#7a3f1a" ${_S}/>
  <circle cx="50" cy="92" r="6" fill="#ffd700" ${_S}/>
</svg>`;

ART.brain = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 14 56 Q 10 36 30 28 Q 38 18 50 22 Q 62 18 70 28 Q 90 36 86 56 Q 86 76 50 80 Q 14 76 14 56 Z" fill="#ffaad4" ${_S}/>
  <line x1="50" y1="22" x2="50" y2="78" stroke="#cc6699" stroke-width="3"/>
  <path d="M 26 48 Q 30 42 36 48 Q 30 54 26 48 Z" fill="none" stroke="#cc6699" stroke-width="2"/>
  <path d="M 64 48 Q 70 42 76 48 Q 70 54 64 48 Z" fill="none" stroke="#cc6699" stroke-width="2"/>
  <path d="M 30 60 Q 36 56 42 60 Q 36 64 30 60 Z" fill="none" stroke="#cc6699" stroke-width="2"/>
  <path d="M 58 60 Q 64 56 70 60 Q 64 64 58 60 Z" fill="none" stroke="#cc6699" stroke-width="2"/>
  <path d="M 36 36 Q 42 34 46 36 M 54 36 Q 58 34 64 36" fill="none" stroke="#cc6699" stroke-width="2"/>
</svg>`;

ART.moon = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="44" cy="50" r="34" fill="#fff5b0" ${_S}/>
  <circle cx="58" cy="46" r="30" fill="#1a1a2e"/>
  <circle cx="32" cy="38" r="3" fill="#e0d090"/>
  <circle cx="38" cy="58" r="2" fill="#e0d090"/>
  <circle cx="26" cy="56" r="2.5" fill="#e0d090"/>
  <circle cx="80" cy="20" r="1.5" fill="#fff"/>
  <circle cx="86" cy="34" r="1.5" fill="#fff"/>
  <circle cx="78" cy="76" r="1.5" fill="#fff"/>
</svg>`;

ART.bone = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="22" cy="28" r="10" fill="#f4f0d8" ${_S}/>
  <circle cx="34" cy="22" r="9" fill="#f4f0d8" ${_S}/>
  <circle cx="78" cy="72" r="10" fill="#f4f0d8" ${_S}/>
  <circle cx="66" cy="78" r="9" fill="#f4f0d8" ${_S}/>
  <path d="M 26 30 L 76 70 L 72 78 L 22 38 Z" fill="#f4f0d8" ${_S}/>
  <line x1="34" y1="38" x2="64" y2="62" stroke="#c8c4a8" stroke-width="2"/>
</svg>`;

ART.tomb = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="78" width="88" height="14" fill="#5a8a3a" ${_S}/>
  <path d="M 22 76 Q 22 26 50 26 Q 78 26 78 76 Z" fill="#a4a8b0" ${_S}/>
  <rect x="46" y="38" width="8" height="20" fill="#7a7e88" ${_S}/>
  <rect x="38" y="44" width="24" height="8" fill="#7a7e88" ${_S}/>
  <text x="50" y="72" font-family="serif" font-size="10" font-weight="bold" fill="#1a1a2e" text-anchor="middle">RIP</text>
  <path d="M 6 90 Q 14 84 22 90 M 30 90 Q 38 84 46 90 M 54 90 Q 62 84 70 90 M 78 90 Q 86 84 94 90" fill="none" stroke="#1a661a" stroke-width="2"/>
</svg>`;

ART.shield = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 18 18 L 50 14 L 82 18 L 80 56 Q 70 84 50 92 Q 30 84 20 56 Z" fill="#3366cc" ${_S}/>
  <path d="M 26 26 L 50 22 L 74 26 L 72 54 Q 64 76 50 84 Q 36 76 28 54 Z" fill="none" stroke="#7099dd" stroke-width="2"/>
  <rect x="44" y="32" width="12" height="40" fill="#ffd700" ${_S}/>
  <rect x="32" y="46" width="36" height="12" fill="#ffd700" ${_S}/>
</svg>`;

ART.horse = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="58" rx="32" ry="18" fill="#a0552a" ${_S}/>
  <ellipse cx="80" cy="42" rx="14" ry="12" fill="#a0552a" ${_S}/>
  <path d="M 78 32 L 76 22 L 84 30 M 86 32 L 90 22 L 90 32" fill="#a0552a" ${_S}/>
  <circle cx="84" cy="42" r="2.2" fill="#1a1a2e"/>
  <path d="M 82 50 L 86 50 M 84 48 L 84 52" stroke="#1a1a2e" stroke-width="1.5"/>
  <path d="M 58 38 Q 56 26 50 28 Q 46 24 44 32 Q 38 28 36 36 L 40 50" fill="#3a200a" ${_S}/>
  <rect x="26" y="74" width="6" height="16" fill="#a0552a" ${_S}/>
  <rect x="42" y="74" width="6" height="16" fill="#a0552a" ${_S}/>
  <rect x="56" y="74" width="6" height="16" fill="#a0552a" ${_S}/>
  <rect x="68" y="74" width="6" height="16" fill="#a0552a" ${_S}/>
</svg>`;

ART.crown = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 14 70 L 22 30 L 36 56 L 50 22 L 64 56 L 78 30 L 86 70 Z" fill="#ffd700" ${_S}/>
  <rect x="14" y="68" width="72" height="10" fill="#ffaa00" ${_S}/>
  <circle cx="22" cy="30" r="4" fill="#cc2222" ${_S}/>
  <circle cx="50" cy="22" r="5" fill="#3fbf3f" ${_S}/>
  <circle cx="78" cy="30" r="4" fill="#3366cc" ${_S}/>
  <circle cx="34" cy="74" r="2.5" fill="#cc2222"/>
  <circle cx="50" cy="74" r="2.5" fill="#3fbf3f"/>
  <circle cx="66" cy="74" r="2.5" fill="#3366cc"/>
</svg>`;

ART.castle = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="40" width="80" height="48" fill="#a4a8b0" ${_S}/>
  <rect x="6"  y="20" width="18" height="68" fill="#a4a8b0" ${_S}/>
  <rect x="76" y="20" width="18" height="68" fill="#a4a8b0" ${_S}/>
  <path d="M 6 22 L 6 14 L 12 14 L 12 18 L 18 18 L 18 14 L 24 14 L 24 22 Z" fill="#a4a8b0" ${_S}/>
  <path d="M 76 22 L 76 14 L 82 14 L 82 18 L 88 18 L 88 14 L 94 14 L 94 22 Z" fill="#a4a8b0" ${_S}/>
  <path d="M 10 42 L 10 34 L 18 34 L 18 38 L 26 38 L 26 34 L 34 34 L 34 38 L 42 38 L 42 34 L 50 34 L 50 38 L 58 38 L 58 34 L 66 34 L 66 38 L 74 38 L 74 34 L 82 34 L 82 38 L 90 38 L 90 42 Z" fill="#a4a8b0" ${_S}/>
  <rect x="10"  y="6" width="6" height="10" fill="#cc2222"/>
  <rect x="80" y="6" width="6" height="10" fill="#cc2222"/>
  <path d="M 40 88 L 40 64 Q 50 56 60 64 L 60 88 Z" fill="#5a2d0c" ${_S}/>
  <circle cx="56" cy="76" r="1.8" fill="#ffd700"/>
  <rect x="14" y="46" width="6" height="10" fill="#1a1a2e"/>
  <rect x="80" y="46" width="6" height="10" fill="#1a1a2e"/>
</svg>`;

// =================== TILES (used as repeating textures) ===================

ART.grass = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#5fb13e"/>
  <rect width="100" height="100" fill="#4d9831" opacity="0.3"/>
  <path d="M 12 28 L 14 22 L 16 28 Z M 30 70 L 32 64 L 34 70 Z M 56 14 L 58 8 L 60 14 Z M 78 50 L 80 44 L 82 50 Z M 70 86 L 72 80 L 74 86 Z M 22 50 L 24 44 L 26 50 Z M 88 22 L 90 16 L 92 22 Z" fill="#3a7a22"/>
  <circle cx="48" cy="86" r="1" fill="#3a7a22"/>
  <circle cx="60" cy="40" r="1" fill="#3a7a22"/>
  <circle cx="14" cy="80" r="1" fill="#3a7a22"/>
</svg>`;

ART.sand = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#e8c97a"/>
  <circle cx="20" cy="30" r="2" fill="#c4a85a"/>
  <circle cx="62" cy="22" r="1.5" fill="#c4a85a"/>
  <circle cx="84" cy="48" r="2" fill="#c4a85a"/>
  <circle cx="40" cy="66" r="1.5" fill="#c4a85a"/>
  <circle cx="14" cy="78" r="2" fill="#c4a85a"/>
  <circle cx="76" cy="82" r="1.5" fill="#c4a85a"/>
  <circle cx="50" cy="44" r="1.2" fill="#c4a85a"/>
  <path d="M 4 60 Q 30 56 60 62 Q 80 64 96 60" fill="none" stroke="#d4b86a" stroke-width="1.5"/>
</svg>`;

ART.dirt = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#8b5a2b"/>
  <ellipse cx="20" cy="22" rx="6" ry="3" fill="#6a431d"/>
  <ellipse cx="68" cy="36" rx="5" ry="2.5" fill="#6a431d"/>
  <ellipse cx="34" cy="58" rx="7" ry="3" fill="#6a431d"/>
  <ellipse cx="80" cy="72" rx="6" ry="3" fill="#6a431d"/>
  <ellipse cx="14" cy="80" rx="4" ry="2" fill="#6a431d"/>
  <circle cx="50" cy="44" r="1.5" fill="#3a200a"/>
  <circle cx="74" cy="14" r="1.5" fill="#3a200a"/>
  <circle cx="22" cy="44" r="1.5" fill="#3a200a"/>
</svg>`;

ART.tree = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="42" y="58" width="16" height="36" fill="#7a3f1a" ${_S}/>
  <line x1="48" y1="64" x2="48" y2="86" stroke="#5a2d0c" stroke-width="1.5"/>
  <line x1="54" y1="64" x2="54" y2="86" stroke="#5a2d0c" stroke-width="1.5"/>
  <circle cx="50" cy="42" r="32" fill="#3fbf3f" ${_S}/>
  <circle cx="36" cy="32" r="14" fill="#3fbf3f" ${_S}/>
  <circle cx="64" cy="32" r="14" fill="#3fbf3f" ${_S}/>
  <circle cx="42" cy="46" r="3" fill="#1a661a" opacity="0.5"/>
  <circle cx="60" cy="38" r="3" fill="#1a661a" opacity="0.5"/>
  <circle cx="50" cy="22" r="3" fill="#5fdf5f" opacity="0.7"/>
</svg>`;

ART.rock = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 14 78 Q 8 56 24 44 Q 36 30 56 36 Q 84 38 88 60 Q 90 80 76 84 Q 50 90 24 86 Z" fill="#9098a4" ${_S}/>
  <path d="M 28 60 Q 36 52 48 56 Q 56 50 60 60" fill="none" stroke="#6a7280" stroke-width="2"/>
  <circle cx="36" cy="46" r="2" fill="#6a7280"/>
  <circle cx="64" cy="50" r="1.8" fill="#6a7280"/>
  <ellipse cx="48" cy="40" rx="6" ry="2" fill="#a8b0bc" opacity="0.7"/>
</svg>`;

// =================== GALLERY TARGETS ===================

ART.targetDuck = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="44" y="74" width="12" height="22" fill="#7a3f1a" ${_S}/>
  <ellipse cx="50" cy="60" rx="34" ry="18" fill="#ffd700" ${_S}/>
  <circle cx="68" cy="40" r="18" fill="#ffd700" ${_S}/>
  <circle cx="72" cy="36" r="3.5" fill="#fff" ${_S}/>
  <circle cx="73" cy="37" r="1.8" fill="#1a1a2e"/>
  <path d="M 84 42 L 96 40 L 88 50 L 82 48 Z" fill="#ff8800" ${_S}/>
</svg>`;

ART.targetSkull = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="44" y="76" width="12" height="20" fill="#7a3f1a" ${_S}/>
  <circle cx="50" cy="44" r="32" fill="#f4f0d8" ${_S}/>
  <ellipse cx="50" cy="62" rx="20" ry="14" fill="#f4f0d8" ${_S}/>
  <circle cx="38" cy="42" r="7" fill="#1a1a2e"/>
  <circle cx="62" cy="42" r="7" fill="#1a1a2e"/>
  <circle cx="38" cy="42" r="2" fill="#cc2222"/>
  <circle cx="62" cy="42" r="2" fill="#cc2222"/>
  <path d="M 46 56 L 50 64 L 54 56 Z" fill="#1a1a2e"/>
  <path d="M 38 70 L 42 76 L 46 70 L 50 76 L 54 70 L 58 76 L 62 70" fill="none" stroke="#1a1a2e" stroke-width="2"/>
</svg>`;

ART.targetShield = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="44" y="80" width="12" height="16" fill="#7a3f1a" ${_S}/>
  <path d="M 18 16 L 50 12 L 82 16 L 80 50 Q 70 76 50 84 Q 30 76 20 50 Z" fill="#3366cc" ${_S}/>
  <rect x="44" y="28" width="12" height="38" fill="#cc2222" ${_S}/>
  <rect x="32" y="40" width="36" height="14" fill="#cc2222" ${_S}/>
  <circle cx="50" cy="46" r="4" fill="#ffd700"/>
</svg>`;

ART.slash = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 14 86 Q 30 50 88 14 L 80 22 Q 36 60 22 86 Z" fill="#fff" stroke="#ffd700" stroke-width="3"/>
  <path d="M 22 80 Q 40 56 78 26" fill="none" stroke="#ffd700" stroke-width="2.5"/>
</svg>`;

// =================== LOADER ===================

const ART_IMAGES = {};

function preloadArt(callback) {
  const names = Object.keys(ART);
  let loaded = 0;
  if (names.length === 0) { callback(); return; }
  names.forEach((name) => {
    const img = new Image();
    img.onload = img.onerror = () => {
      loaded++;
      if (loaded === names.length) callback();
    };
    const svg = ART[name];
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    ART_IMAGES[name] = img;
  });
}

function getArtImage(name) {
  return ART_IMAGES[name];
}

function getArtSVG(name) {
  return ART[name] || '';
}

window.ART = ART;
window.ART_IMAGES = ART_IMAGES;
window.preloadArt = preloadArt;
window.getArtImage = getArtImage;
window.getArtSVG = getArtSVG;
