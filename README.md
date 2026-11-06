# Ragdoll Lab

A small, self-contained 2D ragdoll playground that runs in your browser. The simulation uses Verlet integration, distance constraints, and simple particle collisions—no game engine or dependencies required.

## Play

Open `index.html` in a modern browser, or serve this folder locally (for example, `python -m http.server 8000`) and visit `http://localhost:8000`.

## Controls

- Drag any body part to grab and toss the ragdoll.
- **New ragdoll** / `R` adds another ragdoll.
- **Big shove** / `Space` gives everyone a randomized push.
- **Gravity: on/off** toggles gravity.
- **Pause** / `P` freezes or resumes the simulation.
- **Reset** clears the scene and starts over.

## Project layout

- `index.html` — page structure and controls.
- `styles.css` — responsive visual styling.
- `src/main.js` — canvas, input, and game loop.
- `src/physics.js` — particles, constraints, integration, and collisions.
- `src/ragdoll.js` — ragdoll construction and drawing.
