// =====================================================================
// Pirates, Zombies & Warriors - Antonio's Battlefield Adventure
// =====================================================================

// Each level has a pool of French vocabulary puzzles.
// Player must answer 3 puzzles correctly per level.
const LEVELS = [
  {
    id: 'pirate',
    emoji: '🏴‍☠️',
    title: 'Level 1: Pirates',
    intro: 'The pirates have landed on the battlefield! Are you ready, Captain?',
    enemyEmoji: '🏴‍☠️',
    computerAccuracy: 0.55, // higher = worse aim
    puzzlePool: [
      { image: '🏴‍☠️', answer: 'un pirate',     options: ['un pirate', 'un bateau', 'un trésor', 'une île'] },
      { image: '⚓',     answer: 'une ancre',     options: ['une ancre', 'une épée', 'un bateau', 'un perroquet'] },
      { image: '🦜',     answer: 'un perroquet',  options: ['un perroquet', 'un cheval', 'un poisson', 'un chien'] },
      { image: '💰',     answer: 'un trésor',     options: ['un trésor', 'une carte', 'un coffre', 'un canon'] },
      { image: '🏝️',    answer: 'une île',       options: ['une île', 'la mer', 'la plage', 'la montagne'] },
      { image: '🚢',     answer: 'un bateau',     options: ['un bateau', 'une voiture', 'un train', 'un avion'] },
      { image: '🗺️',    answer: 'une carte',     options: ['une carte', 'un livre', 'une lettre', 'un dessin'] },
    ],
  },
  {
    id: 'zombie',
    emoji: '🧟',
    title: 'Level 2: Zombies',
    intro: 'Zombies are crawling out of the ground. Stay sharp!',
    enemyEmoji: '🧟',
    computerAccuracy: 0.40,
    puzzlePool: [
      { image: '🧟',   answer: 'un zombie',  options: ['un zombie', 'un fantôme', 'un monstre', 'un sorcier'] },
      { image: '🧠',   answer: 'un cerveau', options: ['un cerveau', 'un cœur', 'un os', 'un œil'] },
      { image: '🌙',   answer: 'la lune',    options: ['la lune', 'le soleil', 'une étoile', 'un nuage'] },
      { image: '👁️',  answer: 'un œil',     options: ['un œil', 'une oreille', 'une bouche', 'un nez'] },
      { image: '🦴',   answer: 'un os',      options: ['un os', 'une dent', 'un doigt', 'une main'] },
      { image: '🪦',   answer: 'une tombe',  options: ['une tombe', 'une maison', 'une église', 'un parc'] },
      { image: '🌃',   answer: 'la nuit',    options: ['la nuit', 'le jour', 'le matin', 'le soir'] },
    ],
  },
  {
    id: 'warrior',
    emoji: '⚔️',
    title: 'Level 3: Warriors',
    intro: 'The warriors charge across the battlefield. Defend yourself!',
    enemyEmoji: '🤺',
    computerAccuracy: 0.28,
    puzzlePool: [
      { image: '⚔️',  answer: 'une épée',     options: ['une épée', 'une hache', 'une lance', 'un arc'] },
      { image: '🛡️',  answer: 'un bouclier',  options: ['un bouclier', 'un casque', 'une armure', 'une cape'] },
      { image: '🐎',   answer: 'un cheval',    options: ['un cheval', 'un chien', 'un loup', 'un dragon'] },
      { image: '👑',   answer: 'une couronne', options: ['une couronne', 'un chapeau', 'un casque', 'une bague'] },
      { image: '🏰',   answer: 'un château',   options: ['un château', 'une maison', 'une tour', 'un pont'] },
      { image: '🪓',   answer: 'une hache',    options: ['une hache', 'une épée', 'un marteau', 'une scie'] },
      { image: '🏹',   answer: 'un arc',       options: ['un arc', 'une flèche', 'une lance', 'un fusil'] },
    ],
  },
];

const PUZZLES_PER_LEVEL = 3;

const STATE = {
  levelIndex: 0,
  totalScore: 0,
  // puzzle
  puzzleQueue: [],
  puzzleIndex: 0,
  // archery
  playerScore: 0,
  computerScore: 0,
  playerArrows: 6,
  computerArrows: 6,
  isPlayerTurn: true,
  archeryBusy: false,
  // fight
  fightActive: false,
  fightLives: 3,
  fightDefeated: 0,
  fightTimer: null,
  fightTimeLeft: 20,
};

// ---------------- Utilities ----------------
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------- Screen helpers ----------------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;
  if (action === 'start')           { STATE.levelIndex = 0; STATE.totalScore = 0; startLevel(); }
  else if (action === 'to-puzzle')  startPuzzleRound();
  else if (action === 'to-fight')   startFight();
  else if (action === 'next-level') { STATE.levelIndex++; startLevel(); }
  else if (action === 'restart')    { STATE.levelIndex = 0; STATE.totalScore = 0; showScreen('screen-title'); }
});

// ---------------- Level intro ----------------
function startLevel() {
  if (STATE.levelIndex >= LEVELS.length) return showWin();
  const lvl = LEVELS[STATE.levelIndex];
  document.getElementById('intro-emoji').textContent = lvl.emoji;
  document.getElementById('intro-title').textContent = lvl.title;
  document.getElementById('intro-text').textContent = lvl.intro;
  showScreen('screen-intro');
}

// ---------------- Puzzles (French vocabulary) ----------------
function startPuzzleRound() {
  const lvl = LEVELS[STATE.levelIndex];
  STATE.puzzleQueue = shuffle(lvl.puzzlePool).slice(0, PUZZLES_PER_LEVEL);
  STATE.puzzleIndex = 0;
  showScreen('screen-puzzle');
  renderPuzzle();
}

function renderPuzzle() {
  const p = STATE.puzzleQueue[STATE.puzzleIndex];
  document.getElementById('puzzle-progress').textContent =
    `Question ${STATE.puzzleIndex + 1} / ${PUZZLES_PER_LEVEL}`;
  document.getElementById('puzzle-question').textContent = 'Comment dit-on ça en français?';
  document.getElementById('puzzle-visual').textContent = p.image;
  document.getElementById('puzzle-feedback').textContent = '';

  const opts = document.getElementById('puzzle-options');
  opts.innerHTML = '';
  shuffle(p.options).forEach((opt) => {
    const b = document.createElement('button');
    b.className = 'option-btn wide';
    b.textContent = opt;
    b.addEventListener('click', () => onPuzzleAnswer(b, opt, p.answer));
    opts.appendChild(b);
  });
}

function onPuzzleAnswer(btn, choice, correct) {
  const fb = document.getElementById('puzzle-feedback');
  if (choice === correct) {
    btn.classList.add('correct');
    fb.textContent = '🎉 Bravo! ' + correct;
    fb.style.color = '#06d6a0';
    document.querySelectorAll('#puzzle-options .option-btn').forEach((b) => (b.disabled = true));
    STATE.totalScore += 5;
    STATE.puzzleIndex++;
    if (STATE.puzzleIndex >= STATE.puzzleQueue.length) {
      setTimeout(startArchery, 1100);
    } else {
      setTimeout(renderPuzzle, 1100);
    }
  } else {
    btn.classList.add('wrong');
    btn.disabled = true;
    fb.textContent = 'Non! Essaie encore.';
    fb.style.color = '#ff6b6b';
    setTimeout(() => btn.classList.remove('wrong'), 500);
  }
}

// ---------------- Archery (player vs computer) ----------------
function startArchery() {
  STATE.playerScore = 0;
  STATE.computerScore = 0;
  STATE.playerArrows = 6;
  STATE.computerArrows = 6;
  STATE.isPlayerTurn = true;
  STATE.archeryBusy = false;

  updateArcheryHUD();

  const field = document.getElementById('battlefield');
  field.innerHTML = '';

  const w = window.innerWidth;
  const h = window.innerHeight - 160;
  const positions = scatterPositions(6, w, h, 110);

  positions.forEach((pos, i) => {
    const t = document.createElement('div');
    t.className = 'target';
    t.style.left = pos.x + 'px';
    t.style.top  = pos.y + 'px';
    t.dataset.idx = i;
    t.innerHTML = `
      <div class="ring outer"></div>
      <div class="ring middle"></div>
      <div class="ring inner"></div>
      <div class="ring bull"></div>
    `;
    t.addEventListener('click', (e) => onTargetClick(e, t));
    field.appendChild(t);

    const drift = 8 + Math.random() * 12;
    const dur = 2 + Math.random() * 2;
    t.animate(
      [
        { transform: `translate(0, 0)` },
        { transform: `translate(${drift}px, -${drift}px)` },
        { transform: `translate(0, 0)` },
      ],
      { duration: dur * 1000, iterations: Infinity, easing: 'ease-in-out' }
    );
  });

  field.onclick = onMissClick;

  showScreen('screen-archery');
  setTurnBanner('👉 YOUR TURN');
}

function updateArcheryHUD() {
  document.getElementById('player-score').textContent = STATE.playerScore;
  document.getElementById('computer-score').textContent = STATE.computerScore;
  document.getElementById('player-arrows').textContent = STATE.playerArrows;
  document.getElementById('computer-arrows').textContent = STATE.computerArrows;
}

function setTurnBanner(text) {
  const el = document.getElementById('turn-banner');
  el.textContent = text;
  el.classList.remove('flash');
  void el.offsetWidth; // restart animation
  el.classList.add('flash');
}

function scatterPositions(count, w, h, size) {
  const out = [];
  let tries = 0;
  while (out.length < count && tries < 500) {
    tries++;
    const x = 20 + Math.random() * (w - size - 40);
    const y = 20 + Math.random() * (h - size - 40);
    const ok = out.every((p) => Math.hypot(p.x - x, p.y - y) > size + 10);
    if (ok) out.push({ x, y });
  }
  return out;
}

function scoreForDistance(dist, radius) {
  if (dist < radius * 0.20) return { pts: 10, label: 'BULLSEYE!' };
  if (dist < radius * 0.42) return { pts: 7,  label: 'Great!' };
  if (dist < radius * 0.70) return { pts: 4,  label: 'Good' };
  return { pts: 1, label: 'Edge' };
}

function onTargetClick(e, target) {
  e.stopPropagation();
  if (!STATE.isPlayerTurn || STATE.archeryBusy || STATE.playerArrows <= 0) return;

  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
  const { pts, label } = scoreForDistance(dist, rect.width / 2);

  STATE.playerScore += pts;
  STATE.playerArrows--;
  spawnArrowMark(e.clientX, e.clientY, 'player');
  spawnPop(e.clientX, e.clientY, `+${pts} ${label}`, 'player');
  updateArcheryHUD();
  endTurn();
}

function onMissClick(e) {
  if (e.target.id !== 'battlefield') return;
  if (!STATE.isPlayerTurn || STATE.archeryBusy || STATE.playerArrows <= 0) return;
  STATE.playerArrows--;
  spawnArrowMark(e.clientX, e.clientY, 'player');
  spawnPop(e.clientX, e.clientY, 'MISS!', 'player');
  updateArcheryHUD();
  endTurn();
}

function endTurn() {
  if (STATE.playerArrows === 0 && STATE.computerArrows === 0) {
    setTimeout(endArchery, 900);
    return;
  }
  STATE.isPlayerTurn = !STATE.isPlayerTurn;
  if (STATE.isPlayerTurn && STATE.playerArrows === 0)   STATE.isPlayerTurn = false;
  if (!STATE.isPlayerTurn && STATE.computerArrows === 0) STATE.isPlayerTurn = true;

  if (STATE.isPlayerTurn) {
    setTurnBanner('👉 YOUR TURN');
  } else {
    setTurnBanner('🤖 COMPUTER\'S TURN');
    STATE.archeryBusy = true;
    setTimeout(computerShot, 900);
  }
}

function computerShot() {
  const targets = document.querySelectorAll('#battlefield .target');
  if (!targets.length) { STATE.archeryBusy = false; return; }

  const accuracy = LEVELS[STATE.levelIndex].computerAccuracy;
  const target = targets[Math.floor(Math.random() * targets.length)];
  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radius = rect.width / 2;

  // Computer aim: random offset from center, scaled by (1 - skill)
  // accuracy=0 → perfect bullseye, accuracy=1 → anywhere on target
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * radius * accuracy;
  const x = cx + Math.cos(angle) * r;
  const y = cy + Math.sin(angle) * r;

  // Animate a flying arrow from the bottom edge to (x, y)
  const arrow = document.createElement('div');
  arrow.className = 'flying-arrow';
  arrow.textContent = '🏹';
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight + 40;
  arrow.style.left = startX + 'px';
  arrow.style.top  = startY + 'px';
  document.getElementById('battlefield').appendChild(arrow);

  const dx = x - startX;
  const dy = y - startY;
  const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
  arrow.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;

  requestAnimationFrame(() => {
    arrow.style.transition = 'left 0.7s ease-out, top 0.7s ease-out';
    arrow.style.left = x + 'px';
    arrow.style.top  = y + 'px';
  });

  setTimeout(() => {
    arrow.remove();
    const { pts, label } = scoreForDistance(r, radius);
    STATE.computerScore += pts;
    STATE.computerArrows--;
    spawnArrowMark(x, y, 'computer');
    spawnPop(x, y, `+${pts} ${label}`, 'computer');
    updateArcheryHUD();
    STATE.archeryBusy = false;
    endTurn();
  }, 750);
}

function spawnArrowMark(x, y, who) {
  const m = document.createElement('div');
  m.className = 'arrow-mark ' + who;
  m.style.left = x + 'px';
  m.style.top  = y + 'px';
  document.getElementById('battlefield').appendChild(m);
}

function spawnPop(x, y, text, who) {
  const p = document.createElement('div');
  p.className = 'arrow-pop ' + who;
  p.style.left = x + 'px';
  p.style.top  = y + 'px';
  p.textContent = text;
  document.getElementById('battlefield').appendChild(p);
  setTimeout(() => p.remove(), 900);
}

function endArchery() {
  STATE.totalScore += STATE.playerScore;
  document.getElementById('final-player-score').textContent = STATE.playerScore;
  document.getElementById('final-computer-score').textContent = STATE.computerScore;
  const title = document.getElementById('archery-result-title');
  const text  = document.getElementById('archery-result-text');
  if (STATE.playerScore > STATE.computerScore) {
    title.textContent = '🏆 YOU WIN!';
    title.style.color = '#06d6a0';
    text.textContent  = 'You out-shot the computer! Time to fight!';
    STATE.totalScore += 20; // bonus
  } else if (STATE.playerScore === STATE.computerScore) {
    title.textContent = '🤝 TIE GAME';
    title.style.color = '#ffd700';
    text.textContent  = 'Even match! The fight is on!';
  } else {
    title.textContent = '🤖 Computer Wins';
    title.style.color = '#ff6b6b';
    text.textContent  = 'Tough round. The fight isn\'t over yet!';
  }
  showScreen('screen-archery-results');
}

// ---------------- Quick Fight ----------------
function startFight() {
  STATE.fightActive = true;
  STATE.fightLives = 3;
  STATE.fightDefeated = 0;
  STATE.fightTimeLeft = 20;
  document.getElementById('lives-count').textContent = STATE.fightLives;
  document.getElementById('defeated-count').textContent = 0;
  document.getElementById('fight-time').textContent = STATE.fightTimeLeft;

  const arena = document.getElementById('fight-arena');
  arena.innerHTML = '';

  showScreen('screen-fight');

  // IMPORTANT: start the timer BEFORE spawning, since spawnEnemy guards on fightActive
  STATE.fightTimer = setInterval(tickFight, 1000);
  spawnEnemy();
  // Spawn a couple more in quick succession so the arena feels alive
  setTimeout(spawnEnemy, 600);
  setTimeout(spawnEnemy, 1300);
}

function tickFight() {
  STATE.fightTimeLeft--;
  document.getElementById('fight-time').textContent = STATE.fightTimeLeft;
  if (STATE.fightTimeLeft <= 0) endFight();
}

function spawnEnemy() {
  if (!STATE.fightActive) return;
  if (STATE.fightDefeated >= 5 || STATE.fightTimeLeft <= 0) return;

  const lvl = LEVELS[STATE.levelIndex];
  const arena = document.getElementById('fight-arena');
  const w = arena.clientWidth;
  const h = arena.clientHeight;

  const e = document.createElement('div');
  e.className = 'enemy';
  e.textContent = lvl.enemyEmoji;
  e.style.left = (40 + Math.random() * Math.max(20, w - 120)) + 'px';
  e.style.top  = (40 + Math.random() * Math.max(20, h - 120)) + 'px';

  let hp = 2;
  e.addEventListener('click', (ev) => {
    ev.stopPropagation();
    hp--;
    spawnDamagePop(ev.clientX, ev.clientY, hp > 0 ? 'HIT!' : 'KO!');
    if (hp <= 0) {
      e.classList.add('defeated');
      STATE.fightDefeated++;
      document.getElementById('defeated-count').textContent = STATE.fightDefeated;
      setTimeout(() => e.remove(), 500);
      if (STATE.fightDefeated >= 5) return endFight();
      setTimeout(spawnEnemy, 300);
    }
  });

  arena.appendChild(e);

  setTimeout(() => {
    if (!STATE.fightActive) return;
    if (e.isConnected && !e.classList.contains('defeated')) {
      e.remove();
      STATE.fightLives--;
      document.getElementById('lives-count').textContent = Math.max(0, STATE.fightLives);
      if (STATE.fightLives <= 0) return endFight();
      spawnEnemy();
    }
  }, 3500);
}

function spawnDamagePop(x, y, text) {
  const p = document.createElement('div');
  p.className = 'damage-pop';
  p.style.left = x + 'px';
  p.style.top  = y + 'px';
  p.textContent = text;
  document.getElementById('fight-arena').appendChild(p);
  setTimeout(() => p.remove(), 600);
}

function endFight() {
  if (!STATE.fightActive) return;
  STATE.fightActive = false;
  clearInterval(STATE.fightTimer);
  STATE.fightTimer = null;
  document.getElementById('fight-arena').innerHTML = '';

  const fightPts = STATE.fightDefeated * 10 + Math.max(0, STATE.fightLives) * 5;
  STATE.totalScore += fightPts;

  const title = document.getElementById('level-complete-title');
  const text  = document.getElementById('level-complete-text');
  if (STATE.fightDefeated >= 5) {
    title.textContent = '🏆 Victory!';
    text.textContent  = `You defeated all the ${LEVELS[STATE.levelIndex].id}s! +${fightPts} points`;
  } else {
    title.textContent = '⚔️ Battle Over';
    text.textContent  = `You defeated ${STATE.fightDefeated} ${LEVELS[STATE.levelIndex].id}s. +${fightPts} points`;
  }
  showScreen('screen-level-complete');
}

// ---------------- Win ----------------
function showWin() {
  document.getElementById('final-game-score').textContent = STATE.totalScore;
  showScreen('screen-win');
}
