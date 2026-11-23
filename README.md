# LAST FUEL — Week 1, Milestone 6: Keyboard movement

## Run
Open a terminal in this folder and run:

```bash
py -m http.server 8000
```

Then open http://localhost:8000

## Controls
- W / Arrow Up: forward (+Z)
- S / Arrow Down: backward (-Z)
- A / Arrow Left: left (-X)
- D / Arrow Right: right (+X)
- Shift: run
- R: reset player position

## What changed
- Full-screen game view: removed the development dashboard and camera sliders.
- Keyboard-controlled astronaut movement.
- Diagonal movement is normalized.
- Player is kept inside the playable area's approximate bounds.
- Smooth third-person camera follow.
- Astronaut's component meshes move and rotate together.
- Wireframe renderer no longer draws vertex dots and clips edges against the camera near plane.

## Technical notes
Movement is updated using delta time, so speed is measured in world units per second rather than pixels per frame. The camera uses exponential interpolation to follow the player smoothly. No external 3D library is used.
