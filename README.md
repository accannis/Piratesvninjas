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

1. **French vocabulary** - 3 questions per level. See a picture, pick the
   French word. Get all 3 right to advance.
2. **Archery vs computer** - you get 6 arrows, the computer gets 6. Take turns
   shooting. Closer to the center = more points (bullseye = 10, then 7, 4, 1).
   Beat the computer for a 20-point bonus. The computer gets harder each level.
3. **Quick fight** - tap 5 enemies before they escape. You have 3 lives and
   20 seconds.

Beat all three levels to win the game.

## Files

- `index.html` - all game screens
- `style.css` - styling (kid-friendly: big buttons, bright colors)
- `game.js` - game logic
