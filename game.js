// =====================================================================
// Pirates, Zombies & Warriors - main flow
// Puzzle (French vocabulary) -> Gallery (shooting gallery) ->
// Fight (top-down NES). 3 themed stages.
// =====================================================================

const LEVELS = [
  {
    id: 'pirate',
    emoji: '🏴‍☠️',
    title: 'Stage 1: Pirate Cove',
    intro: 'Les pirates ont accosté! Defend the cove!',
    puzzlePool: [
      { sprite: 'pirate',  answer: 'le pirate',         options: ['le pirate', 'le marin', 'le capitaine', 'le voleur'] },
      { sprite: 'ship',    answer: 'le bateau',         options: ['le bateau', 'le radeau', 'la voile', 'le port'] },
      { sprite: 'parrot',  answer: 'le perroquet',      options: ['le perroquet', 'le canari', 'le corbeau', 'le faucon'] },
      { sprite: 'chest',   answer: 'le coffre au trésor', options: ['le coffre au trésor', 'la boîte', 'le sac', 'le tonneau'] },
      { sprite: 'anchor',  answer: 'l\'ancre',          options: ['l\'ancre', 'la chaîne', 'le crochet', 'la corde'] },
      { sprite: 'sword',   answer: 'l\'épée',           options: ['l\'épée', 'le poignard', 'le sabre', 'la dague'] },
    ],
  },
  {
    id: 'zombie',
    emoji: '🧟',
    title: 'Stage 2: Zombie Swamp',
    intro: 'Les morts-vivants se réveillent. Stay sharp!',
    puzzlePool: [
      { sprite: 'zombie', answer: 'le mort-vivant',  options: ['le mort-vivant', 'le fantôme', 'le squelette', 'la sorcière'] },
      { sprite: 'brain',  answer: 'le cerveau',      options: ['le cerveau', 'le cœur', 'le foie', 'l\'estomac'] },
      { sprite: 'moon',   answer: 'la pleine lune',  options: ['la pleine lune', 'le croissant', 'l\'étoile', 'le soleil'] },
      { sprite: 'bone',   answer: 'l\'os',           options: ['l\'os', 'la dent', 'le crâne', 'la côte'] },
      { sprite: 'tomb',   answer: 'la tombe',        options: ['la tombe', 'le cercueil', 'la chapelle', 'la crypte'] },
    ],
  },
  {
    id: 'warrior',
    emoji: '⚔️',
    title: 'Stage 3: Warrior Fields',
    intro: 'Les guerriers chargent! To battle!',
    puzzlePool: [
      { sprite: 'warrior', answer: 'le guerrier',  options: ['le guerrier', 'le chevalier', 'le soldat', 'le seigneur'] },
      { sprite: 'shield',  answer: 'le bouclier',  options: ['le bouclier', 'l\'armure', 'le casque', 'la cotte'] },
      { sprite: 'sword',   answer: 'l\'épée',      options: ['l\'épée', 'la lance', 'la hache', 'l\'arc'] },
      { sprite: 'horse',   answer: 'le cheval',    options: ['le cheval', 'le poney', 'l\'âne', 'le mulet'] },
      { sprite: 'crown',   answer: 'la couronne',  options: ['la couronne', 'le diadème', 'le casque', 'le chapeau'] },
      { sprite: 'castle',  answer: 'le château',   options: ['le château', 'la tour', 'la forteresse', 'le manoir'] },
    ],
  },
];

const PUZZLES_PER_LEVEL = 3;

const STATE = {
  levelIndex: 0,
  totalScore: 0,
  puzzleQueue: [],
  puzzleIndex: 0,
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
  else if (action === 'to-gallery') startGallery();
  else if (action === 'to-fight')   startFight();
  else if (action === 'next-level') { STATE.levelIndex++; startLevel(); }
  else if (action === 'restart')    { STATE.levelIndex = 0; STATE.totalScore = 0; showScreen('screen-title'); }
  else if (action === 'replay-fight') startFight();
});

// ---------------- Title -> Intro ----------------
function startLevel() {
  if (STATE.levelIndex >= LEVELS.length) return showWin();
  const lvl = LEVELS[STATE.levelIndex];
  document.getElementById('intro-emoji').textContent = lvl.emoji;
  document.getElementById('intro-title').textContent = lvl.title;
  document.getElementById('intro-text').textContent = lvl.intro;
  showScreen('screen-intro');
}

// ---------------- Puzzles ----------------
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
  document.getElementById('puzzle-feedback').textContent = '';

  // Render the sprite image into the visual area
  const visual = document.getElementById('puzzle-visual');
  visual.innerHTML = '';
  const img = document.createElement('img');
  img.className = 'puzzle-sprite';
  img.alt = p.answer;
  img.src = spriteToDataURL(p.sprite, 12);
  visual.appendChild(img);

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
    STATE.totalScore += 10;
    STATE.puzzleIndex++;
    if (STATE.puzzleIndex >= STATE.puzzleQueue.length) {
      setTimeout(() => showScreen('screen-gallery-intro'), 1100);
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

// ---------------- Gallery ----------------
function startGallery() {
  showScreen('screen-gallery');
  const canvas = document.getElementById('gallery-canvas');
  Gallery.init(canvas, LEVELS[STATE.levelIndex].id, (result) => {
    STATE.totalScore += result.score;
    document.getElementById('gallery-final-score').textContent = result.score;
    document.getElementById('gallery-result-text').textContent =
      result.score >= 60 ? 'Sharpshooter! 🎯' :
      result.score >= 30 ? 'Nice shooting!' : 'Practice makes perfect!';
    showScreen('screen-gallery-results');
  });
}

// ---------------- Fight ----------------
function startFight() {
  showScreen('screen-fight');
  const canvas = document.getElementById('fight-canvas');
  Fight.init(canvas, LEVELS[STATE.levelIndex].id, (result) => {
    STATE.totalScore += result.score;
    const title = document.getElementById('level-complete-title');
    const text  = document.getElementById('level-complete-text');
    const replayBtn = document.getElementById('replay-fight-btn');
    const nextBtn   = document.getElementById('next-level-btn');
    if (result.win) {
      title.textContent = '🏆 Stage Clear!';
      title.style.color = '#06d6a0';
      text.textContent = `You cleared all 3 waves with ${result.hp} HP left! +${result.score} pts`;
      replayBtn.style.display = 'none';
      nextBtn.style.display = '';
    } else {
      title.textContent = '💀 Game Over';
      title.style.color = '#ff6b6b';
      text.textContent = `You scored ${result.score} pts. Try again?`;
      replayBtn.style.display = '';
      nextBtn.style.display = 'none';
    }
    showScreen('screen-level-complete');
  });
}

// ---------------- Win ----------------
function showWin() {
  document.getElementById('final-game-score').textContent = STATE.totalScore;
  showScreen('screen-win');
}
