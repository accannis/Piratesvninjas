# Pirates, Zombies & Warriors

Antonio's battlefield adventure - a web game designed by a 6-year-old.

## How to play

Open `index.html` in any modern browser. No build step, no install.

```
# easiest: just double-click index.html
# or serve locally:
python3 -m http.server 8000
# then visit http://localhost:8000
```

## The game

Three levels - **Pirates**, **Zombies**, and **Warriors**. Each level has the
same three steps:

1. **Puzzle** - answer a question to earn the right to fight.
2. **Archery** - 6 targets, 12 arrows. The closer you click to the center, the
   more points you score. Bullseye = 10, then 7, 4, 1.
3. **Quick fight** - tap the enemies before they escape. Defeat all 5 to win
   the level.

Beat all three levels to win the game.

## Files

- `index.html` - all game screens
- `style.css` - styling (kid-friendly: big buttons, bright colors)
- `game.js` - game logic
