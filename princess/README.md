# Princess Adrian and the Baby Bear

A marker-cartoon adventure game designed by Adrian, age 5.

## Story

Princess Adrian goes for a walk in her flowery garden. She meets a baby bear
in the forest, and they become friends. The baby bear chases a butterfly and
gets lost — but Adrian finds him again deep in the woods! Together they
stumble into a vampire's cave… and the brave baby bear defeats the vampire.
Happily ever after!

## How to play

Open `index.html` in any modern browser. No build step.

```
# easiest: just double-click index.html
# or serve locally:
python3 -m http.server 8000
# then visit http://localhost:8000/princess/
```

## Controls

- **← →** or **A / D** — walk
- **SPACE** or **click** — talk to characters / pick things up / advance dialogue
- **ENTER** — start the game / play again

When the princess gets near something she can interact with, a little floating
icon appears (talk bubble, star for picking up, sword for fight). Press SPACE
to do the action.

Walk to the edge of a screen with a blue arrow to move to the next area.

## Files

- `index.html` — page + canvas
- `style.css` — page styling
- `art.js` — marker-style drawing primitives, characters (princess, bear,
  vampire), scenery (flowers, trees, castle, cave), and UI (speech bubbles)
- `game.js` — game state, six scenes, input, dialogue, cutscenes, main loop

All art is drawn live to a canvas with a wobbly hand-drawn-marker style — no
image assets.
