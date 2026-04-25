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
      { sprite: 'pirate', answer: 'le pirate', options: ['le pirate', 'le marin', 'le capitaine', 'le voleur'],
        wrongEmoji: '🌊',
        wrongEnding: 'The pirates think you\'re a sea monster! SPLASH! You walk the plank into the cold ocean. The end!' },
      { sprite: 'ship', answer: 'le bateau', options: ['le bateau', 'le radeau', 'la voile', 'le port'],
        wrongEmoji: '🏝️',
        wrongEnding: 'You point at the wrong boat and miss the ride home! Marooned on a tiny island with only one coconut. The end!' },
      { sprite: 'parrot', answer: 'le perroquet', options: ['le perroquet', 'le canari', 'le corbeau', 'le faucon'],
        wrongEmoji: '🗝️',
        wrongEnding: 'The parrot squawks "INTRUDER! INTRUDER!" The captain throws you in the brig. Bread and water for a year! The end!' },
      { sprite: 'chest', answer: 'le coffre au trésor', options: ['le coffre au trésor', 'la boîte', 'le sac', 'le tonneau'],
        wrongEmoji: '🔒',
        wrongEnding: 'You give the wrong magic word and the chest snaps shut on your fingers! The pirates lock you INSIDE the chest. The end!' },
      { sprite: 'anchor', answer: 'l\'ancre', options: ['l\'ancre', 'la chaîne', 'le crochet', 'la corde'],
        wrongEmoji: '🦶',
        wrongEnding: 'You touch the wrong heavy thing - CLUNK! The anchor falls right on your foot. No fighting today, off to bed! The end!' },
      { sprite: 'sword', answer: 'l\'épée', options: ['l\'épée', 'le poignard', 'le sabre', 'la dague'],
        wrongEmoji: '🍌',
        wrongEnding: 'You grab a banana for the duel. The pirate giggles, then beats you in three swings! The end!' },
    ],
  },
  {
    id: 'zombie',
    emoji: '🧟',
    title: 'Stage 2: Zombie Swamp',
    intro: 'Les morts-vivants se réveillent. Stay sharp!',
    puzzlePool: [
      { sprite: 'zombie', answer: 'le mort-vivant', options: ['le mort-vivant', 'le fantôme', 'le squelette', 'la sorcière'],
        wrongEmoji: '🧠',
        wrongEnding: 'You don\'t recognize a zombie? It sneaks up and CHOMP! Now YOU\'RE a zombie too. Brains... brains... The end!' },
      { sprite: 'brain', answer: 'le cerveau', options: ['le cerveau', 'le cœur', 'le foie', 'l\'estomac'],
        wrongEmoji: '🏃',
        wrongEnding: 'The zombies hear the wrong word and think you have brains for them. They chase you all night long! The end!' },
      { sprite: 'moon', answer: 'la pleine lune', options: ['la pleine lune', 'le croissant', 'l\'étoile', 'le soleil'],
        wrongEmoji: '😴',
        wrongEnding: 'You fall asleep under the wrong moonlight and wake up... next month! Everyone wonders where you went. The end!' },
      { sprite: 'bone', answer: 'l\'os', options: ['l\'os', 'la dent', 'le crâne', 'la côte'],
        wrongEmoji: '💀',
        wrongEnding: 'You step on the wrong thing in the dark - CRACK! The zombies come running! Run away forever! The end!' },
      { sprite: 'tomb', answer: 'la tombe', options: ['la tombe', 'le cercueil', 'la chapelle', 'la crypte'],
        wrongEmoji: '👻',
        wrongEnding: 'You take the wrong path through the graveyard and get totally lost. The ghosts keep you company forever. The end!' },
    ],
  },
  {
    id: 'warrior',
    emoji: '⚔️',
    title: 'Stage 3: Warrior Fields',
    intro: 'Les guerriers chargent! To battle!',
    puzzlePool: [
      { sprite: 'warrior', answer: 'le guerrier', options: ['le guerrier', 'le chevalier', 'le soldat', 'le seigneur'],
        wrongEmoji: '🚪',
        wrongEnding: 'The warriors think you\'re a spy from the enemy castle! Off to the dungeon. Cold floors, no toys! The end!' },
      { sprite: 'shield', answer: 'le bouclier', options: ['le bouclier', 'l\'armure', 'le casque', 'la cotte'],
        wrongEmoji: '🏹',
        wrongEnding: 'You hold up the wrong thing and the arrows whoosh right past! Time to run away really fast! The end!' },
      { sprite: 'sword', answer: 'l\'épée', options: ['l\'épée', 'la lance', 'la hache', 'l\'arc'],
        wrongEmoji: '🥄',
        wrongEnding: 'You bring a soup spoon to the sword fight. The other warrior just laughs and laughs. Embarrassing! The end!' },
      { sprite: 'horse', answer: 'le cheval', options: ['le cheval', 'le poney', 'l\'âne', 'le mulet'],
        wrongEmoji: '🌅',
        wrongEnding: 'You jump on the wrong animal and it gallops the WRONG way - all the way to a faraway kingdom! The end!' },
      { sprite: 'crown', answer: 'la couronne', options: ['la couronne', 'le diadème', 'le casque', 'le chapeau'],
        wrongEmoji: '👑',
        wrongEnding: 'You don\'t recognize the king\'s crown? Banished from the kingdom! Pack a sandwich, you\'re walking far. The end!' },
      { sprite: 'castle', answer: 'le château', options: ['le château', 'la tour', 'la forteresse', 'le manoir'],
        wrongEmoji: '🚩',
        wrongEnding: 'You walk into the WRONG castle - the enemy\'s! They greet you with chains and a "welcome to your new home." The end!' },
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

// Preload all SVG art before allowing gameplay so canvas drawImage works.
let _artReady = false;
preloadArt(() => { _artReady = true; });

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;
  if (action === 'start')           { STATE.levelIndex = 0; STATE.totalScore = 0; startLevel(); }
  else if (action === 'to-puzzle')  startPuzzleRound();
  else if (action === 'to-gallery') startGallery();
  else if (action === 'to-fight')   startFight();
  else if (action === 'next-level') { STATE.levelIndex++; startLevel(); }
  else if (action === 'restart')      { STATE.levelIndex = 0; STATE.totalScore = 0; showScreen('screen-title'); }
  else if (action === 'replay-fight') startFight();
  else if (action === 'retry-stage')  startLevel();
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

  // Inject the SVG directly so it stays vector-crisp at any size.
  const visual = document.getElementById('puzzle-visual');
  visual.innerHTML = `<div class="puzzle-sprite">${getArtSVG(p.sprite)}</div>`;

  const opts = document.getElementById('puzzle-options');
  opts.innerHTML = '';
  shuffle(p.options).forEach((opt) => {
    const b = document.createElement('button');
    b.className = 'option-btn wide';
    b.textContent = opt;
    b.addEventListener('click', () => onPuzzleAnswer(b, opt, p));
    opts.appendChild(b);
  });
}

function onPuzzleAnswer(btn, choice, puzzle) {
  const fb = document.getElementById('puzzle-feedback');
  if (choice === puzzle.answer) {
    btn.classList.add('correct');
    fb.textContent = '🎉 Bravo! ' + puzzle.answer;
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
    // CHOOSE-YOUR-OWN-ADVENTURE: wrong answer = unique bad ending = restart stage
    btn.classList.add('wrong');
    document.querySelectorAll('#puzzle-options .option-btn').forEach((b) => (b.disabled = true));
    setTimeout(() => showBadEnding(puzzle, choice), 600);
  }
}

function showBadEnding(puzzle, choice) {
  document.getElementById('bad-emoji').textContent = puzzle.wrongEmoji || '💀';
  document.getElementById('bad-ending-pick').textContent =
    `You picked: "${choice}"  -  but it was "${puzzle.answer}"`;
  document.getElementById('bad-ending-text').textContent = puzzle.wrongEnding;
  showScreen('screen-bad-ending');
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
