// =====================================================================
// Pirates, Zombies & Warriors - Antonio's Battlefield Adventure
// =====================================================================

const LEVELS = [
  {
    id: 'pirate',
    emoji: '🏴‍☠️',
    title: 'Level 1: Pirates',
    intro: 'The pirates have landed on the battlefield! Are you ready, Captain?',
    enemyEmoji: '🏴‍☠️',
    bgEmoji: '⚓',
    puzzle: {
      question: 'How many treasure chests do you see?',
      visual: '💰 💰 💰 💰',
      answer: 4,
      options: [3, 4, 5, 6],
    },
  },
  {
    id: 'zombie',
    emoji: '🧟',
    title: 'Level 2: Zombies',
    intro: 'Zombies are crawling out of the ground. Stay sharp!',
    enemyEmoji: '🧟',
    bgEmoji: '🧠',
    puzzle: {
      question: 'How many zombies are coming?',
      visual: '🧟 🧟 🧟 🧟 🧟',
      answer: 5,
      options: [3, 4, 5, 6],
    },
  },
  {
    id: 'warrior',
    emoji: '⚔️',
    title: 'Level 3: Warriors',
    intro: 'The warriors charge across the battlefield. Defend yourself!',
    enemyEmoji: '🤺',
    bgEmoji: '🛡️',
    puzzle: {
      question: 'How many swords?',
      visual: '⚔️ ⚔️ ⚔️',
      answer: 3,
      options: [2, 3, 4, 5],
    },
  },
];

const STATE = {
  levelIndex: 0,
  totalScore: 0,
  archeryScore: 0,
  arrows: 12,
  hits: 0,
  arrowMarks: [],
  fightLives: 3,
  fightDefeated: 0,
  fightTimer: null,
  fightTimeLeft: 20,
};

// ---------------- Screen helpers ----------------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;
  if (action === 'start')        { STATE.levelIndex = 0; STATE.totalScore = 0; startLevel(); }
  else if (action === 'to-puzzle')  showPuzzle();
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

// ---------------- Puzzle ----------------
function showPuzzle() {
  const lvl = LEVELS[STATE.levelIndex];
  const p = lvl.puzzle;
  document.getElementById('puzzle-question').textContent = p.question;
  document.getElementById('puzzle-visual').textContent = p.visual;
  document.getElementById('puzzle-feedback').textContent = '';

  const opts = document.getElementById('puzzle-options');
  opts.innerHTML = '';
  p.options.forEach((opt) => {
    const b = document.createElement('button');
    b.className = 'option-btn';
    b.textContent = opt;
    b.addEventListener('click', () => onPuzzleAnswer(b, opt, p.answer));
    opts.appendChild(b);
  });

  showScreen('screen-puzzle');
}

function onPuzzleAnswer(btn, choice, correct) {
  const fb = document.getElementById('puzzle-feedback');
  if (choice === correct) {
    btn.classList.add('correct');
    fb.textContent = '🎉 Correct! Time to shoot!';
    fb.style.color = '#06d6a0';
    document.querySelectorAll('.option-btn').forEach((b) => (b.disabled = true));
    setTimeout(startArchery, 1100);
  } else {
    btn.classList.add('wrong');
    fb.textContent = 'Try again!';
    fb.style.color = '#ff6b6b';
    setTimeout(() => {
      btn.classList.remove('wrong');
      btn.disabled = true;
    }, 500);
  }
}

// ---------------- Archery ----------------
function startArchery() {
  STATE.arrows = 12;
  STATE.hits = 0;
  STATE.archeryScore = 0;
  STATE.arrowMarks = [];

  document.getElementById('arrow-count').textContent = STATE.arrows;
  document.getElementById('archery-score').textContent = 0;
  document.getElementById('hit-count').textContent = 0;

  const field = document.getElementById('battlefield');
  field.innerHTML = '';

  const w = window.innerWidth;
  const h = window.innerHeight - 140;
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

    // gentle floating motion
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

  // catch shots that miss every target
  field.addEventListener('click', onMissClick);

  showScreen('screen-archery');
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

function onTargetClick(e, target) {
  e.stopPropagation();
  if (target.classList.contains('hit') || STATE.arrows <= 0) return;

  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const dist = Math.hypot(dx, dy);
  const radius = rect.width / 2;

  let pts = 0;
  let label = '';
  if (dist < radius * 0.20)      { pts = 10; label = 'BULLSEYE! +10'; }
  else if (dist < radius * 0.42) { pts = 7;  label = 'Great! +7'; }
  else if (dist < radius * 0.70) { pts = 4;  label = 'Good +4'; }
  else                           { pts = 1;  label = 'Hit +1'; }

  STATE.archeryScore += pts;
  STATE.hits++;
  STATE.arrows--;
  target.classList.add('hit');

  document.getElementById('archery-score').textContent = STATE.archeryScore;
  document.getElementById('hit-count').textContent = STATE.hits;
  document.getElementById('arrow-count').textContent = STATE.arrows;

  spawnArrowMark(e.clientX, e.clientY);
  spawnPop(e.clientX, e.clientY, label);

  if (STATE.hits === 6 || STATE.arrows === 0) setTimeout(endArchery, 900);
}

function onMissClick(e) {
  if (e.target.id !== 'battlefield') return;
  if (STATE.arrows <= 0) return;
  STATE.arrows--;
  document.getElementById('arrow-count').textContent = STATE.arrows;
  spawnArrowMark(e.clientX, e.clientY);
  spawnPop(e.clientX, e.clientY, 'Miss!');
  if (STATE.arrows === 0) setTimeout(endArchery, 900);
}

function spawnArrowMark(x, y) {
  const m = document.createElement('div');
  m.className = 'arrow-mark';
  m.style.left = x + 'px';
  m.style.top  = y + 'px';
  document.getElementById('battlefield').appendChild(m);
}

function spawnPop(x, y, text) {
  const p = document.createElement('div');
  p.className = 'arrow-pop';
  p.style.left = x + 'px';
  p.style.top  = y + 'px';
  p.textContent = text;
  document.getElementById('battlefield').appendChild(p);
  setTimeout(() => p.remove(), 800);
}

function endArchery() {
  STATE.totalScore += STATE.archeryScore;
  document.getElementById('final-archery-score').textContent = STATE.archeryScore;
  const title = document.getElementById('archery-result-title');
  const text  = document.getElementById('archery-result-text');
  if (STATE.archeryScore >= 40)      { title.textContent = '🌟 AMAZING SHOT!'; text.textContent = 'You earned the right to fight!'; }
  else if (STATE.archeryScore >= 20) { title.textContent = '👏 Nice Shooting!'; text.textContent = 'Time for a fight!'; }
  else                               { title.textContent = '🏹 Good Try!';      text.textContent = 'Let\'s fight anyway!'; }
  showScreen('screen-archery-results');
}

// ---------------- Quick Fight ----------------
function startFight() {
  STATE.fightLives = 3;
  STATE.fightDefeated = 0;
  STATE.fightTimeLeft = 20;
  document.getElementById('lives-count').textContent = STATE.fightLives;
  document.getElementById('defeated-count').textContent = 0;
  document.getElementById('fight-time').textContent = STATE.fightTimeLeft;

  const arena = document.getElementById('fight-arena');
  arena.innerHTML = '';

  showScreen('screen-fight');

  spawnEnemy();
  STATE.fightTimer = setInterval(tickFight, 1000);
}

function tickFight() {
  STATE.fightTimeLeft--;
  document.getElementById('fight-time').textContent = STATE.fightTimeLeft;
  if (STATE.fightTimeLeft <= 0) endFight();
}

function spawnEnemy() {
  if (!STATE.fightTimer || STATE.fightDefeated >= 5 || STATE.fightTimeLeft <= 0) return;
  const lvl = LEVELS[STATE.levelIndex];
  const arena = document.getElementById('fight-arena');
  const w = arena.clientWidth;
  const h = arena.clientHeight;

  const e = document.createElement('div');
  e.className = 'enemy';
  e.textContent = lvl.enemyEmoji;
  e.style.left = (40 + Math.random() * (w - 120)) + 'px';
  e.style.top  = (40 + Math.random() * (h - 120)) + 'px';

  let hp = 2;
  e.addEventListener('click', (ev) => {
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

  // Auto-vanish if not clicked - costs a life
  setTimeout(() => {
    if (!STATE.fightTimer) return;
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
