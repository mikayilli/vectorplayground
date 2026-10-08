# Vector Playground — learn vectors by experimenting

An interactive, bilingual (Azerbaijani default / English) web app that teaches vectors from zero.
Pure HTML + CSS + vanilla JavaScript + Canvas. **No build step, no dependencies.**

## Run it
Open `index.html` in a browser (double-click). It works from `file://`, because the scripts are
classic `<script>` tags, not ES modules.

## Structure
```
index.html            page shell, loads the scripts in order
css/style.css         dark-navy theme, responsive layout
js/vector-engine.js   pure maths (no DOM): add, sub, scale, magnitude, normalize, dot, angle, polar<->cartesian
js/util.js            DOM / localStorage helpers
js/ui-strings.js      interface text (AZ + EN)
js/i18n.js            language state, tooltip glossary, {{g:term}} markup
js/plane.js           canvas coordinate plane with draggable (touch + keyboard) handles
js/simulations.js     simulation framework + sims for modules 1-4 and 6
js/physics.js         module 5 experiments (walking, boat, forces, aircraft, video game)
js/lessons.js         lesson content for modules 1-6 as data (AZ + EN)
js/challenges.js      module 7: 12 progressive puzzles with scoring and hints
js/quiz.js            module 8: 10-question knowledge check
js/app.js             routing, progress, landing page, lesson renderer, reset dialog
```

## Teaching flow (modules 1-6)
problem -> predict -> experiment -> explanation -> formula (with "Why?") -> challenge.
Every simulation has "Show me an example", "Try it yourself" (a goal that is checked live) and "Reset".

## Accessibility & input
Canvas handles can be dragged with mouse/touch; with the canvas focused, arrow keys move the selected
handle and Enter/Space selects the next one. Sliders and number inputs are native controls.

## Progress
Stored in `localStorage` under `vp.progress.v1` (language under `vp.lang`). "Reset progress" asks for confirmation.

## Maths conventions
y points up; angles are in degrees, counter-clockwise from +x. Zero-length vectors normalise to (0, 0) and have no angle (`null`).
`vector-engine.js` can also be unit-tested in Node (`require('./js/vector-engine.js')`).
