// game.js — main game loop, scenes, input, dialogue.

(() => {
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const GROUND_Y = H - 60;     // princess feet baseline
  const PRINCESS_W = 70;       // hit width for screen edge transitions

  // ---------------- Game state ----------------
  const state = {
    mode: 'title',               // title | play | dialogue | cutscene | ending
    sceneId: 'garden',
    princess: { x: W / 2, facing: 1, walking: false, walkPhase: 0, armRaise: 0 },
    bearWith: false,             // is the bear following princess?
    bearLost: false,             // bear has been lost in the forest
    bearReunited: false,
    vampireDefeated: false,
    flowersPicked: 0,
    keys: { left: false, right: false },
    time: 0,
    dialogue: null,              // { lines: [...], idx, onEnd }
    cutscene: null,              // { tick, total, draw, onEnd }
    flash: 0,                    // brief screen flash (e.g. attack)
    fade: { v: 0, dir: 0 },      // 0 visible, 1 black; dir +1 fading out, -1 fading in
    pendingScene: null,
  };

  // ---------------- Scenes ----------------
  // Each scene defines: drawBg(ctx, t), npcs/items as interactables.
  // Interactable: { x, y, kind: 'talk'|'pickup', label, action(state) }
  // Exits: { left: 'sceneId', right: 'sceneId', leftCondition?, rightCondition? }

  const scenes = {

    // ---- 1. Garden ----
    garden: {
      name: 'Castle Garden',
      enter(s) { /* no-op */ },
      drawBg(ctx, t) {
        Scenery.paperBg(ctx, W, H);
        Scenery.sky(ctx, W, H, '#cfe9ff');
        Scenery.sun(ctx, 110, 90, 42);
        Scenery.cloud(ctx, 380, 80, 1.0, 1);
        Scenery.cloud(ctx, 720, 110, 0.9, 11);
        // distant castle on left
        Scenery.castle(ctx, 130, GROUND_Y - 10, 0.9);
        // bushes
        Scenery.bush(ctx, 320, GROUND_Y - 6, 1.0, 7);
        Scenery.bush(ctx, 820, GROUND_Y - 6, 1.2, 13);
        // grass
        Scenery.grass(ctx, W, H, { top: GROUND_Y - 6 });
        // flowers (don't draw picked ones)
        const pf = state.flowersPicked;
        const flowerSpots = [
          [220, GROUND_Y, 'red', 1],
          [300, GROUND_Y + 2, 'pink', 2],
          [560, GROUND_Y + 4, 'purple', 3],
          [620, GROUND_Y, 'yellow', 4],
          [700, GROUND_Y + 3, 'red', 5],
          [870, GROUND_Y, 'pink', 6],
        ];
        flowerSpots.forEach((f, i) => {
          if (i < pf) return;
          Scenery.flower(ctx, f[0], f[1], f[2], f[3]);
        });
      },
      interactables() {
        // pick a flower if any remain
        const list = [];
        if (state.flowersPicked < 3) {
          list.push({
            x: 560, y: GROUND_Y - 30, kind: 'pickup', label: 'pick flower',
            radius: 70,
            action: () => {
              state.flowersPicked++;
              startDialogue([
                { speaker: 'Princess Adrian', text: 'A pretty flower for my crown!' },
              ]);
            },
          });
        }
        // castle
        list.push({
          x: 130, y: GROUND_Y - 90, kind: 'talk', label: 'castle',
          radius: 90,
          action: () => startDialogue([
            { speaker: 'Princess Adrian', text: 'My castle! Today I am going on an adventure in the flowers.' },
          ]),
        });
        return list;
      },
      exits: { right: 'forest' },
    },

    // ---- 2. Forest edge ----
    forest: {
      name: 'Forest Edge',
      enter(s) {},
      drawBg(ctx, t) {
        Scenery.paperBg(ctx, W, H);
        Scenery.sky(ctx, W, H, '#bfe0d4');
        Scenery.cloud(ctx, 250, 70, 0.8, 21);
        // back trees
        Scenery.tree(ctx, 100, GROUND_Y, { scale: 1.1, seed: 31 });
        Scenery.tree(ctx, 860, GROUND_Y, { scale: 1.2, seed: 37 });
        Scenery.tree(ctx, 740, GROUND_Y - 4, { scale: 0.9, seed: 41 });
        // path
        ctx.save();
        ctx.fillStyle = '#d8b878';
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 30);
        ctx.lineTo(W, GROUND_Y + 30);
        ctx.lineTo(W, GROUND_Y + 80);
        ctx.lineTo(0, GROUND_Y + 80);
        ctx.fill();
        ctx.restore();
        Scenery.grass(ctx, W, H, { top: GROUND_Y - 6 });
        // flowers along path
        Scenery.flower(ctx, 280, GROUND_Y + 4, 'pink', 51);
        Scenery.flower(ctx, 600, GROUND_Y + 6, 'purple', 53);
        // a butterfly cue when bear is with us
        if (state.bearWith && !state.bearLost) {
          drawButterfly(ctx, 720 + Math.sin(state.time * 0.003) * 30, 280 + Math.cos(state.time * 0.004) * 18, state.time);
        }
      },
      interactables() {
        const list = [];
        if (!state.bearWith && !state.bearReunited) {
          // baby bear at first meeting — branching choice
          list.push({
            x: 480, y: GROUND_Y - 40, kind: 'talk', label: 'baby bear', radius: 90,
            action: () => startDialogue([
              { speaker: 'Princess Adrian', text: 'Oh! A baby bear. Hi there!' },
              { speaker: 'Baby Bear', text: 'Hi! I am all alone. Will you be my friend?', choices: [
                {
                  label: 'Yes! Of course!',
                  effect: () => { state.bearWith = true; },
                  branch: [
                    { speaker: 'Princess Adrian', text: 'Of course! Come on, let\'s explore together!' },
                    { speaker: 'Baby Bear', text: 'Yay! I love you, Princess.' },
                  ],
                },
                {
                  label: 'No, you smell funny.',
                  effect: () => {
                    state.bearRefused = true;
                    state.pendingBadEnding = 'alone';
                  },
                  branch: [
                    { speaker: 'Baby Bear', text: '...okay. Goodbye.' },
                    { speaker: 'Princess Adrian', text: 'Wait — I didn\'t mean it!' },
                    { speaker: 'Princess Adrian', text: '(the baby bear runs into the woods, crying)' },
                  ],
                },
                {
                  label: 'Maybe... let me think.',
                  branch: [
                    { speaker: 'Baby Bear', text: 'Pleeease? I\'ll be a good friend!' },
                  ],
                },
              ]},
            ]),
          });
        }
        return list;
      },
      // draw npcs that aren't interactable but visible (the bear when met)
      drawNpcs(ctx, t) {
        if (!state.bearWith && !state.bearReunited) {
          Characters.bear(ctx, 480, GROUND_Y, { facing: -1, scale: 0.95 });
        }
      },
      exits: { left: 'garden', right: 'deepForest' },
    },

    // ---- 3. Deep forest ----
    deepForest: {
      name: 'Deep Forest',
      enter(s) {
        // First time entering with bear: trigger lost-bear cutscene
        if (state.bearWith && !state.bearLost) {
          // queue cutscene after fade-in
          setTimeout(() => triggerBearLost(), 350);
        }
      },
      drawBg(ctx, t) {
        Scenery.paperBg(ctx, W, H);
        Scenery.sky(ctx, W, H, '#a8d4c0');
        Scenery.tree(ctx, 80, GROUND_Y, { scale: 1.4, seed: 71 });
        Scenery.tree(ctx, 240, GROUND_Y - 4, { scale: 1.1, seed: 73 });
        Scenery.tree(ctx, 480, GROUND_Y, { scale: 1.3, seed: 77 });
        Scenery.tree(ctx, 720, GROUND_Y - 6, { scale: 1.0, seed: 79 });
        Scenery.tree(ctx, 880, GROUND_Y, { scale: 1.4, seed: 83 });
        Scenery.grass(ctx, W, H, { top: GROUND_Y - 6, color: '#4a9a3a', dark: '#1f5a16' });
        Scenery.mushroom(ctx, 360, GROUND_Y + 6, 1.0, 91);
        Scenery.mushroom(ctx, 600, GROUND_Y + 4, 1.2, 93);
      },
      interactables() {
        const list = [];
        list.push({
          x: 360, y: GROUND_Y - 40, kind: 'talk', label: 'mushrooms', radius: 70,
          action: () => startDialogue([
            { speaker: 'Princess Adrian', text: 'Pretty red mushrooms! I won\'t eat those.' },
          ]),
        });
        return list;
      },
      drawNpcs() {},
      // can only go further right after bear was lost
      exits: { left: 'forest', right: 'darkWoods' },
      canExit(dir) {
        if (dir === 'right') return state.bearLost;
        return true;
      },
    },

    // ---- 4. Dark Woods ----
    darkWoods: {
      name: 'Dark Woods',
      enter() {},
      drawBg(ctx, t) {
        Scenery.paperBg(ctx, W, H);
        // dusky purple sky reaching down past the trees
        Art.rect(ctx, -10, -10, W + 20, GROUND_Y + 10, '#6a4a8a', null, 0, 131, 0.6);
        Art.scribbleFill(ctx, -10, -10, W + 20, GROUND_Y + 10, '#3a2a5a', { density: 8, seed: 137, alpha: 0.4, angle: 0.1 });
        // moon
        Art.ellipse(ctx, 800, 100, 36, 36, '#fff5d6', '#c8a86a', 3, 141, 0.8);
        Art.ellipse(ctx, 790, 92, 8, 6, '#6a4a8a', null, 0, 143, 0.4);
        // dark trees
        Scenery.tree(ctx, 80, GROUND_Y, { scale: 1.4, seed: 151, kind: 'dark' });
        Scenery.tree(ctx, 240, GROUND_Y - 4, { scale: 1.2, seed: 153, kind: 'dark' });
        Scenery.tree(ctx, 720, GROUND_Y, { scale: 1.4, seed: 157, kind: 'dark' });
        Scenery.tree(ctx, 880, GROUND_Y, { scale: 1.3, seed: 161, kind: 'dark' });
        // dark grass
        Scenery.grass(ctx, W, H, { top: GROUND_Y - 6, color: '#2a5a3a', dark: '#0e3a18' });
        // fireflies
        const positions = [[160, 280], [520, 220], [610, 310], [840, 250]];
        positions.forEach(([x, y]) => Scenery.firefly(ctx, x, y, t));
      },
      interactables() {
        const list = [];
        if (state.bearLost && !state.bearReunited) {
          list.push({
            x: 500, y: GROUND_Y - 40, kind: 'talk', label: 'baby bear', radius: 110,
            action: () => startDialogue([
              { speaker: 'Princess Adrian', text: 'Baby Bear! I found you!' },
              { speaker: 'Baby Bear', text: 'I got lost. I am so glad you came back for me!' },
              { speaker: 'Princess Adrian', text: 'I will never lose you again. Let\'s go.' },
            ], () => { state.bearReunited = true; state.bearWith = true; state.bearLost = false; }),
          });
        }
        return list;
      },
      drawNpcs(ctx, t) {
        if (state.bearLost && !state.bearReunited) {
          // bear hiding behind a tree (slightly visible)
          Characters.bear(ctx, 500, GROUND_Y, { facing: 1, scale: 0.85 });
        }
      },
      exits: { left: 'deepForest', right: 'cave' },
      canExit(dir) {
        if (dir === 'right') return state.bearReunited;
        return true;
      },
    },

    // ---- 5. Vampire's Cave ----
    cave: {
      name: "Vampire's Cave",
      enter() {
        if (!state.vampireDefeated && !state._vampireGreeted) {
          setTimeout(() => triggerVampireMeet(), 400);
        }
      },
      drawBg(ctx, t) {
        Scenery.caveBg(ctx, W, H);
      },
      interactables() {
        const list = [];
        if (!state.vampireDefeated) {
          // re-trigger the choice dialogue if the player walks back up to the vampire
          list.push({
            x: 760, y: GROUND_Y - 80, kind: 'talk', label: 'vampire', radius: 130,
            action: () => triggerVampireMeet(),
          });
        } else {
          list.push({
            x: 700, y: GROUND_Y - 50, kind: 'talk', label: 'baby bear', radius: 110,
            action: () => startDialogue([
              { speaker: 'Princess Adrian', text: 'You beat the vampire! You are my hero, Baby Bear.' },
              { speaker: 'Baby Bear', text: 'I will always protect you, Princess.' },
            ]),
          });
        }
        return list;
      },
      drawNpcs(ctx, t) {
        if (!state.vampireDefeated) {
          Characters.vampire(ctx, 760, GROUND_Y, { facing: -1, scale: 1.1 });
        } else if (state._deathAnim < 1) {
          // dead animation
          Characters.vampire(ctx, 760, GROUND_Y, { facing: -1, scale: 1.1, dead: true, deathAnim: state._deathAnim });
        }
      },
      exits: { left: 'darkWoods', right: 'ending' },
      canExit(dir) {
        if (dir === 'right') return state.vampireDefeated;
        return true;
      },
    },

    // ---- 6. Happy Ending (back in flowers) ----
    ending: {
      name: 'Happily Ever After',
      enter() {
        // trigger the "The End" overlay after a moment
        setTimeout(() => { state.mode = 'ending'; }, 2200);
      },
      drawBg(ctx, t) {
        Scenery.paperBg(ctx, W, H);
        Scenery.sky(ctx, W, H, '#ffd6e8');
        Scenery.sun(ctx, W - 110, 100, 44);
        Scenery.cloud(ctx, 300, 90, 1.0, 201);
        Scenery.cloud(ctx, 620, 70, 0.9, 211);
        Scenery.castle(ctx, W - 130, GROUND_Y - 10, 0.9);
        Scenery.bush(ctx, 200, GROUND_Y - 6, 1.0, 221);
        Scenery.grass(ctx, W, H, { top: GROUND_Y - 6 });
        const flowers = [
          [120, 'red'], [180, 'pink'], [320, 'purple'], [400, 'yellow'],
          [520, 'red'], [620, 'pink'], [780, 'purple'], [860, 'red'],
        ];
        flowers.forEach(([x, k], i) => Scenery.flower(ctx, x, GROUND_Y + 2, k, 231 + i));
        // hearts floating
        for (let i = 0; i < 5; i++) {
          const hx = 100 + i * 180 + Math.sin(t * 0.002 + i) * 20;
          const hy = 200 + Math.sin(t * 0.003 + i * 1.3) * 30;
          Characters.heart(ctx, hx, hy, 1.5);
        }
      },
      interactables() { return []; },
      drawNpcs() {},
      exits: {},
    },
  };

  // ---------------- Helpers ----------------

  function drawButterfly(ctx, x, y, t) {
    const flap = Math.sin(t * 0.02) * 0.6;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#f06ab2'; ctx.strokeStyle = '#7a1a4a'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-6, 0, 8, 5 + flap * 3, -0.3, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(6, 0, 8, 5 + flap * 3, 0.3, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a1a30';
    ctx.beginPath(); ctx.ellipse(0, 0, 1.5, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ---------------- Dialogue ----------------
  // A dialogue line is { speaker, text }, optionally with:
  //   choices: [ { label, branch?: [more lines], effect?: () => void } ]
  // When a choice is picked, the chosen branch lines are spliced in after
  // the current line, the effect runs, and dialogue continues.
  function startDialogue(lines, onEnd) {
    state.dialogue = {
      lines,
      idx: 0,
      selectedChoice: 0,
      onEnd: onEnd || null,
      lastChange: state.time,
      choiceHits: [],
    };
    state.mode = 'dialogue';
  }

  // Minimum time a line stays on screen (ms) before SPACE can advance — stops
  // accidental skip-thru when a kid leans on the space bar.
  const MIN_LINE_DWELL_MS = 250;

  function currentLine() {
    return state.dialogue && state.dialogue.lines[state.dialogue.idx];
  }

  function endDialogue() {
    const cb = state.dialogue && state.dialogue.onEnd;
    state.dialogue = null;
    state.mode = 'play';
    if (cb) cb();
    // If a choice queued a deferred bad ending or cutscene, fire it now.
    if (state.pendingBadEnding) {
      const t = state.pendingBadEnding;
      state.pendingBadEnding = null;
      triggerBadEnding(t);
    } else if (state.pendingAfterDialogue) {
      const fn = state.pendingAfterDialogue;
      state.pendingAfterDialogue = null;
      fn();
    }
  }

  function advanceDialogue() {
    if (!state.dialogue) return;
    const line = currentLine();
    if (line && line.choices) {
      pickChoice(state.dialogue.selectedChoice);
      return;
    }
    if (state.time - state.dialogue.lastChange < MIN_LINE_DWELL_MS) return;
    state.dialogue.idx++;
    state.dialogue.selectedChoice = 0;
    state.dialogue.lastChange = state.time;
    if (state.dialogue.idx >= state.dialogue.lines.length) endDialogue();
  }

  function pickChoice(idx) {
    if (!state.dialogue) return;
    if (state.time - state.dialogue.lastChange < MIN_LINE_DWELL_MS) return;
    const line = currentLine();
    if (!line || !line.choices) return;
    const choice = line.choices[idx];
    if (!choice) return;
    const branch = choice.branch || [];
    state.dialogue.lines.splice(state.dialogue.idx + 1, 0, ...branch);
    const eff = choice.effect;
    state.dialogue.idx++;
    state.dialogue.selectedChoice = 0;
    state.dialogue.lastChange = state.time;
    if (eff) eff();
    if (!state.dialogue) return;
    if (state.dialogue.idx >= state.dialogue.lines.length) endDialogue();
  }

  function moveSelection(dir) {
    if (!state.dialogue) return;
    const line = currentLine();
    if (!line || !line.choices) return;
    const n = line.choices.length;
    state.dialogue.selectedChoice = (state.dialogue.selectedChoice + dir + n) % n;
  }

  // ---------------- Cutscenes ----------------
  function triggerBearLost() {
    let phase = 0;
    state.cutscene = {
      tick: 0,
      draw(ctx, t, dt) {
        // bear runs off chasing butterfly to the right
        const cs = state.cutscene;
        cs.tick += dt;
        const p = Math.min(1, cs.tick / 1500);
        const bx = 480 + p * 600;
        const by = GROUND_Y - p * 0;
        // butterfly fleeing
        drawButterfly(ctx, bx + 80, by - 80 + Math.sin(cs.tick * 0.01) * 10, t);
        Characters.bear(ctx, bx, by, { facing: 1, scale: 0.9, walking: true, walkPhase: cs.tick / 200 });
      },
      onEnd() {
        state.bearWith = false;
        state.bearLost = true;
        startDialogue([
          { speaker: 'Princess Adrian', text: 'Wait — Baby Bear! Come back!' },
          { speaker: '???', text: 'What should the princess do?', choices: [
            {
              label: 'I\'ll find you, Baby Bear!',
              branch: [
                { speaker: 'Princess Adrian', text: 'Don\'t worry, I\'ll find you, my friend!' },
              ],
            },
            {
              label: 'Forget him, I\'ll go alone.',
              effect: () => { state.pendingBadEnding = 'lost'; },
              branch: [
                { speaker: 'Princess Adrian', text: 'Hmph. Who needs a silly bear anyway.' },
                { speaker: 'Princess Adrian', text: '(the woods grow dark and tangled around her)' },
              ],
            },
          ]},
        ]);
      },
      total: 1700,
    };
    state.mode = 'cutscene';
  }

  function triggerVampireMeet() {
    state._vampireGreeted = true;
    const choices = [];
    if (state.bearWith) {
      choices.push({
        label: 'Baby Bear, get him!',
        effect: () => {
          // queue the fight cutscene to start after dialogue closes
          state.pendingAfterDialogue = () => triggerVampireFight();
        },
        branch: [
          { speaker: 'Baby Bear', text: 'Stay back, Princess. I\'ll get him!' },
        ],
      });
    }
    choices.push({
      label: 'I\'ll fight him myself!',
      effect: () => { state.pendingBadEnding = 'vampire'; },
      branch: [
        { speaker: 'Princess Adrian', text: 'Take that, vampire!' },
        { speaker: 'Vampire', text: 'Foolish princess... CHOMP!' },
      ],
    });
    choices.push({
      label: 'Run away!',
      effect: () => { state.pendingBadEnding = 'frog'; },
      branch: [
        { speaker: 'Princess Adrian', text: 'Eep! I\'m out of here!' },
        { speaker: 'Vampire', text: 'You can\'t escape my magic spell!' },
      ],
    });
    startDialogue([
      { speaker: 'Vampire', text: 'MWAHAHA! Who dares enter my cave?' },
      { speaker: 'Princess Adrian', text: 'Eek! A vampire!' },
      { speaker: '???', text: 'What does the princess do?', choices },
    ]);
  }

  function triggerVampireFight() {
    state._deathAnim = 0;
    state.flash = 1;
    state.cutscene = {
      tick: 0,
      total: 2200,
      draw(ctx, t, dt) {
        const cs = state.cutscene;
        cs.tick += dt;
        const p = Math.min(1, cs.tick / cs.total);
        // bear charges from the princess toward the vampire
        const startX = state.princess.x + 30, endX = 720;
        const bx = startX + (endX - startX) * Math.min(1, p * 1.5);
        Characters.bear(ctx, bx, GROUND_Y, { facing: 1, scale: 1.0, walking: true, walkPhase: cs.tick / 120 });
        // attack flashes
        if (p > 0.5) {
          for (let i = 0; i < 3; i++) {
            const sx = 720 + Math.cos(t * 0.05 + i) * 30;
            const sy = GROUND_Y - 60 + Math.sin(t * 0.05 + i) * 30;
            Characters.sparkle(ctx, sx, sy, 1.4, '#ffe27a');
          }
        }
        // vampire shaking + fading
        const shakeX = p > 0.4 ? Math.sin(t * 0.08) * 6 : 0;
        const fade = p > 0.7 ? (p - 0.7) / 0.3 : 0;
        Characters.vampire(ctx, 760 + shakeX, GROUND_Y, {
          facing: -1, scale: 1.1, hurt: p > 0.4 ? 1 : 0,
          dead: false,
        });
        if (fade > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(255,255,255,${fade * 0.5})`;
          ctx.fillRect(700, GROUND_Y - 130, 120, 140);
          ctx.restore();
        }
      },
      onEnd() {
        state.vampireDefeated = true;
        state._deathAnim = 0;
        // play death animation in scene's drawNpcs
        const dieStart = performance.now();
        const animate = () => {
          state._deathAnim = Math.min(1, (performance.now() - dieStart) / 800);
          if (state._deathAnim < 1) requestAnimationFrame(animate);
        };
        animate();
        startDialogue([
          { speaker: 'Baby Bear', text: 'Take that, vampire!' },
          { speaker: 'Vampire', text: 'Aaaargh... defeated by... a baby...' },
          { speaker: 'Princess Adrian', text: 'You did it, Baby Bear! You saved us!' },
        ]);
      },
    };
    state.mode = 'cutscene';
  }

  // ---------------- Scene transitions ----------------
  function changeScene(id) {
    state.fade.dir = 1; // fade to black
    state.pendingScene = id;
  }
  function applyPendingScene() {
    state.sceneId = state.pendingScene;
    state.pendingScene = null;
    const dir = state._lastExitDir;
    if (dir === 'right') state.princess.x = 80;
    else if (dir === 'left') state.princess.x = W - 80;
    else state.princess.x = W / 2;
    state.princess.facing = dir === 'left' ? -1 : 1;
    state.fade.dir = -1; // fade in
    const sc = scenes[state.sceneId];
    if (sc.enter) sc.enter(state);
  }

  // ---------------- Input ----------------
  document.addEventListener('keydown', (e) => {
    // movement keys can repeat (we use held-state, not per-press)
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = true;

    // ignore key-repeats for action keys — kids hold space and skip dialogue
    if (e.repeat) return;

    if (e.code === 'Space') {
      e.preventDefault();
      handleAction();
      return;
    }
    if (e.key === 'Enter') {
      if (state.mode === 'title') startGame();
      else if (state.mode === 'ending' || state.mode === 'badEnding') resetGame();
      else handleAction();
      return;
    }
    // dialogue choice navigation
    if (state.mode === 'dialogue' && state.dialogue) {
      const line = currentLine();
      if (line && line.choices) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          moveSelection(-1); return;
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          moveSelection(1); return;
        }
        // 1, 2, 3 jump to a choice and pick it
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= line.choices.length) {
          state.dialogue.selectedChoice = num - 1;
          pickChoice(num - 1);
          return;
        }
      }
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = false;
  });
  canvas.addEventListener('pointerdown', (e) => {
    if (state.mode === 'title') { startGame(); return; }
    if (state.mode === 'ending' || state.mode === 'badEnding') { resetGame(); return; }
    if (state.mode === 'dialogue') {
      // hit-test choice rects if currently on a choice line
      const line = currentLine();
      if (line && line.choices && state.dialogue.choiceHits.length) {
        const rect = canvas.getBoundingClientRect();
        const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const sy = (e.clientY - rect.top) * (canvas.height / rect.height);
        for (const hr of state.dialogue.choiceHits) {
          if (sx >= hr.x && sx <= hr.x + hr.w && sy >= hr.y && sy <= hr.y + hr.h) {
            state.dialogue.selectedChoice = hr.index;
            pickChoice(hr.index);
            return;
          }
        }
      }
      advanceDialogue();
      return;
    }
    handleAction();
  });

  function handleAction() {
    if (state.mode === 'dialogue') { advanceDialogue(); return; }
    if (state.mode !== 'play') return;
    // find nearest interactable in proximity
    const sc = scenes[state.sceneId];
    const items = sc.interactables ? sc.interactables() : [];
    let nearest = null, ndist = Infinity;
    for (const it of items) {
      const d = Math.abs(it.x - state.princess.x);
      if (d < (it.radius || 80) && d < ndist) { nearest = it; ndist = d; }
    }
    if (nearest) nearest.action();
  }

  function startGame() {
    state.mode = 'play';
    state.sceneId = 'garden';
    state.princess.x = 280;
    state.princess.facing = 1;
    state.bearRefused = false;
    if (scenes.garden.enter) scenes.garden.enter(state);
  }

  function triggerBadEnding(type) {
    state.dialogue = null;
    state.cutscene = null;
    state.badEndingType = type;
    state.mode = 'badEnding';
  }

  function resetGame() {
    Object.assign(state, {
      mode: 'title', sceneId: 'garden',
      bearWith: false, bearLost: false, bearReunited: false,
      bearRefused: false,
      vampireDefeated: false, _vampireGreeted: false, _deathAnim: 1,
      flowersPicked: 0,
      keys: { left: false, right: false },
      dialogue: null, cutscene: null, flash: 0,
      fade: { v: 0, dir: 0 }, pendingScene: null,
      badEndingType: null,
      pendingBadEnding: null, pendingAfterDialogue: null,
      time: state.time,
    });
    state.princess = { x: W / 2, facing: 1, walking: false, walkPhase: 0, armRaise: 0 };
  }

  // ---------------- Update ----------------
  function update(dt) {
    state.time += dt;

    if (state.mode === 'play') {
      const sp = 0.22 * dt; // px per ms
      let moved = false;
      if (state.keys.left) {
        state.princess.x -= sp;
        state.princess.facing = -1;
        moved = true;
      }
      if (state.keys.right) {
        state.princess.x += sp;
        state.princess.facing = 1;
        moved = true;
      }
      state.princess.walking = moved;
      if (moved) state.princess.walkPhase += dt / 280;

      // edge transitions
      const sc = scenes[state.sceneId];
      if (state.princess.x < 30 && sc.exits.left) {
        if (!sc.canExit || sc.canExit('left')) {
          state._lastExitDir = 'left';
          changeScene(sc.exits.left);
        } else {
          state.princess.x = 30;
        }
      }
      if (state.princess.x > W - 30 && sc.exits.right) {
        if (!sc.canExit || sc.canExit('right')) {
          state._lastExitDir = 'right';
          changeScene(sc.exits.right);
        } else {
          state.princess.x = W - 30;
        }
      }
      // clamp inside if no exit
      if (state.princess.x < 30 && !sc.exits.left) state.princess.x = 30;
      if (state.princess.x > W - 30 && !sc.exits.right) state.princess.x = W - 30;
    }

    if (state.mode === 'cutscene' && state.cutscene) {
      if (state.cutscene.tick >= state.cutscene.total) {
        const cs = state.cutscene;
        state.cutscene = null;
        state.mode = 'play';
        if (cs.onEnd) cs.onEnd();
      }
    }

    // fade
    if (state.fade.dir > 0) {
      state.fade.v += dt / 220;
      if (state.fade.v >= 1) {
        state.fade.v = 1;
        state.fade.dir = 0;
        if (state.pendingScene) applyPendingScene();
      }
    } else if (state.fade.dir < 0) {
      state.fade.v -= dt / 220;
      if (state.fade.v <= 0) { state.fade.v = 0; state.fade.dir = 0; }
    }
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt / 300);
  }

  // ---------------- Draw ----------------
  function draw() {
    const t = state.time;
    if (state.mode === 'title') {
      scenes.garden.drawBg(ctx, t);
      // characters in lower-right, away from start prompt
      Characters.bear(ctx, W - 250, GROUND_Y, { facing: 1, scale: 0.9 });
      Characters.princess(ctx, W - 160, GROUND_Y, { facing: -1, armRaise: 1 });
      UI.titleCard(ctx, W, H, t);
      return;
    }

    const sc = scenes[state.sceneId];
    sc.drawBg(ctx, t);

    // companion bear (if following)
    if (state.bearWith && state.mode !== 'cutscene') {
      const bx = state.princess.x - state.princess.facing * 60;
      Characters.bear(ctx, bx, GROUND_Y, {
        facing: state.princess.facing,
        scale: 0.85,
        walking: state.princess.walking,
        walkPhase: state.princess.walkPhase + 0.15,
      });
    }

    // scene NPCs
    if (sc.drawNpcs) sc.drawNpcs(ctx, t);

    // princess
    Characters.princess(ctx, state.princess.x, GROUND_Y, {
      facing: state.princess.facing,
      walking: state.princess.walking,
      walkPhase: state.princess.walkPhase,
      armRaise: state.princess.armRaise,
    });

    // cutscene overlay
    if (state.mode === 'cutscene' && state.cutscene) {
      state.cutscene.draw(ctx, t, 16);
    }

    // action prompts
    if (state.mode === 'play') {
      const items = sc.interactables ? sc.interactables() : [];
      let nearest = null, ndist = Infinity;
      for (const it of items) {
        const d = Math.abs(it.x - state.princess.x);
        if (d < (it.radius || 80) && d < ndist) { nearest = it; ndist = d; }
      }
      if (nearest) {
        UI.actionPrompt(ctx, nearest.x, nearest.y - 40, nearest.kind, t);
      }
      // exit arrows
      if (sc.exits.left && (!sc.canExit || sc.canExit('left'))) {
        UI.exitArrow(ctx, 40, GROUND_Y - 80, -1, t);
      }
      if (sc.exits.right && (!sc.canExit || sc.canExit('right'))) {
        UI.exitArrow(ctx, W - 40, GROUND_Y - 80, 1, t);
      }
    }

    // dialogue box
    if (state.mode === 'dialogue' && state.dialogue) {
      const line = state.dialogue.lines[state.dialogue.idx];
      const hits = UI.dialogueBox(ctx, W, H, line.speaker, line.text, {
        choices: line.choices,
        selectedChoice: state.dialogue.selectedChoice,
      });
      state.dialogue.choiceHits = hits || [];
    }

    // scene name plate (top)
    if (state.mode === 'play') {
      ctx.save();
      ctx.font = 'italic 18px "Comic Sans MS", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(58,42,16,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(sc.name, W / 2, 28);
      ctx.restore();
    }

    // attack flash
    if (state.flash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.4})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // fade
    if (state.fade.v > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0,0,0,${state.fade.v})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // ending overlay
    if (state.mode === 'ending') {
      UI.endingCard(ctx, W, H);
    }
    if (state.mode === 'badEnding') {
      UI.badEndingCard(ctx, W, H, state.badEndingType);
    }
  }

  // ---------------- Main loop ----------------
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(60, now - last);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
