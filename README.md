# Pirates, Zombies & Warriors

Antonio's battlefield adventure - a NES-style web game designed by a 6-year-old.

## How to play

Open `index.html` in any modern browser. No build step.

```
# easiest: just double-click index.html
# or serve locally:
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Controls

- **Mouse / touch** - shooting gallery and puzzles
- **WASD or arrow keys** - move in the fight
- **Space** - swing your sword

## The game

Three stages - **Pirate Cove**, **Zombie Swamp**, **Warrior Fields**. Each
stage has three parts:

1. **French vocabulary puzzle** - 3 picture-to-word questions per stage. The
   pictures are pixel-art sprites; the answers are real French phrases like
   *le coffre au trésor*, *le mort-vivant*, *la pleine lune*.
2. **Shooting gallery** - carnival-style booth with sliding targets in three
   lanes. 15 shots, 30 seconds. Faster targets = more points (5 / 8 / 10 / 15).
3. **Top-down fight** - tile-based combat with three escalating waves. Wave 3
   includes a boss. You have 6 HP and can pick up hearts dropped by enemies.

Beat all three stages to win.

## Files

- `index.html` - screens and layout
- `style.css` - styling
- `sprites.js` - shared pixel-art sprite atlas + renderer
- `gallery.js` - canvas-based shooting gallery
- `fight.js` - canvas-based top-down combat
- `game.js` - main flow (title, intro, puzzles, screen routing)

All sprites are hand-drawn pixel art (16×16 grids, mostly), rendered to canvas
with crisp-edge scaling for that NES look.
