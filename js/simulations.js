/*
 * simulations.js — simulation framework (VP.sims) + interactive sims for modules 1-4 and 6.
 * Physics experiments (module 5) are in physics.js and use the same framework.
 *
 * A simulation is a factory: (ui, ctx) => { examples?, goals?, reset?, destroy? }
 *   ui  — helpers: ui.plane(), ui.side, ui.loop(), ui.changed(), ui.caption()
 *   ctx — { onGoal() } supplied by the lesson renderer
 * The framework adds the toolbar ("Show me an example", "Try it yourself", "Reset"),
 * example chips, goal tracking and clean-up.
 */
(function (root) {
  'use strict';
  const VP = root.VP;
  const V = VP.Vec;
  const C = VP.colors;
  const { el } = VP.util;
  const { s, t, rich } = VP.i18n;

  const registry = {};
  let active = [];

  /* ---------------- tiny formatting helpers ---------------- */
  const f1 = (n) => V.fmt(n, 1);
  const f2 = (n) => V.fmt(n, 2);
  const vs = (v) => V.fmtVec(v, 2);
  const vecB = (name, color) => '<b class="vec" style="color:' + color + '">' + name + '</b>';
  // "3 units right, 2 units up" in the current language
  function moveText(v) {
    const parts = [];
    if (Math.abs(v.x) > 1e-9) parts.push(f2(Math.abs(v.x)) + ' ' + (v.x > 0 ? s('vahid sağa', 'units right') : s('vahid sola', 'units left')));
    if (Math.abs(v.y) > 1e-9) parts.push(f2(Math.abs(v.y)) + ' ' + (v.y > 0 ? s('vahid yuxarı', 'units up') : s('vahid aşağı', 'units down')));
    return parts.length ? parts.join(s(', ', ', ')) : s('heç yerə (sıfır vektor)', 'nowhere (the zero vector)');
  }
  const sameDir = (a, b) => V.angleBetween(a, b) !== null && V.angleBetween(a, b) < 0.5;

  /* ---------------- UI builders ---------------- */
  function slider(parent, o) {
    const row = el('label', 'ctl');
    const name = el('span', 'ctl__name', o.label);
    const input = el('input');
    input.type = 'range';
    input.min = o.min;
    input.max = o.max;
    input.step = o.step || 1;
    input.value = o.value;
    if (o.color) input.style.setProperty('--accent', o.color);
    const out = el('output', 'ctl__out');
    const show = () => (out.textContent = (o.format ? o.format(+input.value) : f2(+input.value)) + (o.unit || ''));
    input.addEventListener('input', () => {
      show();
      o.onInput(+input.value);
    });
    row.append(name, input, out);
    parent.appendChild(row);
    show();
    return {
      row,
      input,
      set(v) {
        input.value = v;
        show();
      },
      get: () => +input.value,
    };
  }
  function button(parent, text, cls, fn) {
    const b = el('button', 'btn ' + (cls || ''), text);
    b.type = 'button';
    b.addEventListener('click', fn);
    parent.appendChild(b);
    return b;
  }
  // Radio-style group. items: [{value, label}]
  function segmented(parent, items, current, onPick, label) {
    const g = el('div', 'seg');
    g.setAttribute('role', 'group');
    if (label) g.setAttribute('aria-label', label);
    const btns = items.map((it) => {
      const b = el('button', 'seg__btn', it.label);
      b.type = 'button';
      b.addEventListener('click', () => {
        set(it.value);
        onPick(it.value);
      });
      g.appendChild(b);
      return { it, b };
    });
    function set(v) {
      btns.forEach(({ it, b }) => {
        b.setAttribute('aria-pressed', it.value === v ? 'true' : 'false');
        b.classList.toggle('is-on', it.value === v);
      });
    }
    set(current);
    parent.appendChild(g);
    return { root: g, set };
  }
  function toggle(parent, label, checked, onChange) {
    const l = el('label', 'check');
    const i = el('input');
    i.type = 'checkbox';
    i.checked = checked;
    i.addEventListener('change', () => onChange(i.checked));
    l.append(i, el('span', '', label));
    parent.appendChild(l);
    return { input: i, set: (v) => (i.checked = v) };
  }

  /* ---------------- framework ---------------- */
  function register(name, factory) {
    registry[name] = factory;
  }

  function mount(name, host, ctx) {
    const def = registry[name];
    if (!def) throw new Error('Unknown simulation: ' + name);
    const wrap = el('div', 'sim');
    host.appendChild(wrap);
    const toolbar = el('div', 'sim__toolbar');
    const goalBox = el('div', 'sim__goal');
    goalBox.hidden = true;
    const main = el('div', 'sim__main');
    const stage = el('div', 'sim__stage');
    const side = el('div', 'sim__side');
    const caption = el('p', 'sim__caption');
    caption.setAttribute('aria-live', 'polite');
    main.append(stage, side);
    wrap.append(toolbar, goalBox, main, caption);

    const planes = [];
    const cleanups = [];
    let goal = null;
    let goalIdx = -1;
    let goalDone = false;
    let inst = {};

    const ui = {
      stage,
      side,
      wrap,
      plane(opts) {
        const cv = el('canvas', 'sim__canvas');
        cv.setAttribute('role', 'img');
        cv.setAttribute('aria-label', t('sim.canvas'));
        stage.appendChild(cv);
        const p = new VP.Plane(cv, opts);
        planes.push(p);
        return p;
      },
      caption(html) {
        caption.innerHTML = html ? rich(html) : '';
      },
      changed() {
        checkGoal();
      },
      // requestAnimationFrame loop that stops itself when the sim is removed from the page
      loop(fn) {
        let id = 0;
        let last = performance.now();
        let run = true;
        const tick = (now) => {
          if (!run || !wrap.isConnected) return;
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          fn(dt);
          id = requestAnimationFrame(tick);
        };
        id = requestAnimationFrame(tick);
        cleanups.push(() => {
          run = false;
          cancelAnimationFrame(id);
        });
      },
    };

    function checkGoal() {
      if (!goal || goalDone) return;
      let ok = false;
      try {
        ok = !!goal.check();
      } catch (e) {
        ok = false;
      }
      if (!ok) return;
      goalDone = true;
      goalBox.className = 'sim__goal is-done';
      goalBox.innerHTML = '<span class="sim__goal-text"><b>✔ ' + t('goal.done') + '</b> ' + rich(goal.win || '') + '</span>';
      if (inst.goals && inst.goals.length > 1) {
        const nb = el('button', 'btn btn--ghost', t('goal.next'));
        nb.type = 'button';
        nb.addEventListener('click', tryIt);
        goalBox.appendChild(nb);
      }
      if (ctx && ctx.onGoal) ctx.onGoal();
    }
    function showGoal() {
      goalBox.hidden = false;
      goalBox.className = 'sim__goal';
      goalBox.innerHTML = '<span class="sim__goal-text"><b>🎯 ' + t('goal.label') + '</b> ' + rich(goal.text) + '</span>';
      if (goal.hint) {
        const d = el('details', 'sim__hint');
        d.innerHTML = '<summary>' + t('goal.hint') + '</summary><p>' + rich(goal.hint) + '</p>';
        goalBox.appendChild(d);
      }
    }
    function tryIt() {
      if (inst.reset) inst.reset();
      goalIdx = (goalIdx + 1) % inst.goals.length;
      goal = inst.goals[goalIdx];
      goalDone = false;
      showGoal();
      ui.caption('');
      setChip(-1);
      goalBox.scrollIntoView && goalBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    inst = def(ui, ctx) || {};

    // example chips (top of the side panel)
    let exIdx = -1;
    const chipBtns = [];
    function setChip(i) {
      chipBtns.forEach((b, k) => b.classList.toggle('is-on', k === i));
    }
    function applyExample(i) {
      exIdx = i;
      const e = inst.examples[i];
      e.apply();
      ui.caption(e.note || '');
      setChip(i);
    }
    if (inst.examples && inst.examples.length) {
      const row = el('div', 'chips');
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', t('sim.examples'));
      inst.examples.forEach((e, i) => {
        const b = el('button', 'chip', e.label);
        b.type = 'button';
        b.addEventListener('click', () => applyExample(i));
        row.appendChild(b);
        chipBtns.push(b);
      });
      side.insertBefore(row, side.firstChild);
      button(toolbar, '▶ ' + t('sim.example'), 'btn--accent', () => applyExample((exIdx + 1) % inst.examples.length));
    }
    if (inst.goals && inst.goals.length) button(toolbar, '✎ ' + t('sim.try'), 'btn--green', tryIt);
    button(toolbar, '↺ ' + t('sim.reset'), 'btn--ghost', () => {
      if (inst.reset) inst.reset();
      exIdx = -1;
      setChip(-1);
      ui.caption('');
    });

    const handle = {
      destroy() {
        cleanups.forEach((fn) => fn());
        planes.forEach((p) => p.destroy());
        if (inst.destroy) inst.destroy();
      },
    };
    active.push(handle);
    return handle;
  }

  VP.sims = {
    register,
    mount,
    destroyAll() {
      active.forEach((h) => h.destroy());
      active = [];
    },
    // shared with physics.js
    h: { f1, f2, vs, vecB, moveText, slider, button, segmented, toggle, sameDir },
  };

  /* =====================================================================
   * MODULE 1 — "Walk 5 metres": distance vs displacement
   * ===================================================================== */
  register('walk5', (ui, ctx) => {
    const DIRS = { N: { x: 0, y: 1 }, E: { x: 1, y: 0 }, S: { x: 0, y: -1 }, W: { x: -1, y: 0 } };
    const NAME = () => ({ N: s('şimal', 'north'), E: s('şərq', 'east'), S: s('cənub', 'south'), W: s('qərb', 'west') });
    let dir = 'E';
    let len = 5;
    let ring = false;
    let legs = []; // { v, d, m }
    let prog = 0; // distance walked so far along the path (metres)

    const total = () => legs.reduce((a, l) => a + l.m, 0);
    const posAt = (d) => {
      let p = { x: 0, y: 0 };
      let rem = d;
      for (const l of legs) {
        if (rem >= l.m - 1e-9) {
          p = V.add(p, l.v);
          rem -= l.m;
        } else return V.add(p, V.scale(l.v, rem / l.m));
      }
      return p;
    };

    const plane = ui.plane({
      units: 16,
      draw(p) {
        const names = NAME();
        const r = p.range();
        p.text('N', { x: 0, y: r.ymax - 0.8 }, { color: C.muted, size: 15, weight: 800 });
        p.text('S', { x: 0, y: r.ymin + 0.8 }, { color: C.muted, size: 15, weight: 800 });
        p.text('E', { x: r.xmax - 0.8, y: 0 }, { color: C.muted, size: 15, weight: 800, dy: -16 });
        p.text('W', { x: r.xmin + 0.8, y: 0 }, { color: C.muted, size: 15, weight: 800, dy: -16 });
        const here = posAt(prog);
        if (ring) {
          p.circleWorld(here, len, C.purple, 'rgba(167,139,250,0.10)', [7, 6]);
          p.text(s('“' + len + ' m yeri” — harada olduğunu bilmirik!', '“walk ' + len + ' m” — but where to?'), { x: here.x, y: here.y + len + 0.9 }, { color: C.purple, size: 13 });
        }
        // path, drawn up to the current progress
        let start = { x: 0, y: 0 };
        let acc = 0;
        legs.forEach((l, i) => {
          const part = V.clamp((prog - acc) / l.m, 0, 1);
          if (part > 0) p.arrow(start, V.add(start, V.scale(l.v, part)), VP.palette[i % 3], { w: 4, head: 11 });
          start = V.add(start, l.v);
          acc += l.m;
        });
        if (V.mag(here) > 0.05) p.arrow({ x: 0, y: 0 }, here, C.orange, { w: 2.5, dash: [8, 6], label: s('yerdəyişmə', 'displacement'), labelOffset: -16 });
        p.dot({ x: 0, y: 0 }, C.text, 5);
        p.text(s('Başlanğıc', 'Start'), { x: 0, y: 0 }, { dx: 0, dy: 18, size: 12, color: C.muted });
        p.ring(here, C.text, 9, 3);
        p.dot(here, C.green, 7);
        void names;
      },
    });

    const ro = el('div', 'readout');
    const legsBox = el('div', 'legs');
    function update() {
      const here = posAt(prog);
      const walked = Math.min(prog, total());
      const names = NAME();
      ro.innerHTML =
        '<div class="ro-row"><span class="ro-k">' + s('Qət olunan yol', 'Distance walked') + ' <em>(' + s('skalyar', 'scalar') + ')</em></span><b class="ro-v">' + f1(walked) + ' m</b></div>' +
        '<div class="ro-row"><span class="ro-k">' + s('Yerdəyişmə', 'Displacement') + ' <em>(' + s('vektor', 'vector') + ')</em></span><b class="ro-v" style="color:' + C.orange + '">' + vs(here) + ' m</b></div>' +
        '<div class="ro-row"><span class="ro-k">' + s('Yerdəyişmənin modulu', 'Displacement size') + '</span><b class="ro-v">' + f2(V.mag(here)) + ' m</b></div>';
      legsBox.innerHTML = legs.length
        ? legs.map((l) => '<span class="leg">' + l.m + ' m ' + names[l.d] + '</span>').join('<span class="plus">+</span>')
        : '<span class="muted">' + s('Hələ addım atılmayıb.', 'No steps yet.') + '</span>';
      plane.render();
      ui.changed();
    }
    function fit() {
      let m = 6;
      let p = { x: 0, y: 0 };
      legs.forEach((l) => {
        p = V.add(p, l.v);
        m = Math.max(m, Math.abs(p.x), Math.abs(p.y));
      });
      plane.o.units = Math.max(16, 2 * (m + len * (ring ? 1 : 0) + 3));
      plane._scale();
    }

    ui.side.appendChild(el('div', 'ctl__title', s('Hansı istiqamətə?', 'Which direction?')));
    const seg = segmented(ui.side, ['N', 'E', 'S', 'W'].map((k) => ({ value: k, label: { N: '↑ ' + s('Şimal', 'North'), E: '→ ' + s('Şərq', 'East'), S: '↓ ' + s('Cənub', 'South'), W: '← ' + s('Qərb', 'West') }[k] })), dir, (v) => ((dir = v), update()), s('İstiqamət', 'Direction'));
    slider(ui.side, { label: s('Məsafə', 'Distance'), min: 1, max: 8, step: 1, value: len, unit: ' m', format: (v) => v, onInput: (v) => ((len = v), fit(), update()) });
    toggle(ui.side, s('Yalnız “' + 5 + ' metr get” de (istiqaməti gizlət)', 'Only say “walk 5 m” (hide the direction)'), false, (v) => ((ring = v), fit(), update()));
    const act = el('div', 'btnrow');
    button(act, '🚶 ' + s('Get!', 'Walk!'), 'btn--accent', () => {
      legs.push({ v: V.scale(DIRS[dir], len), d: dir, m: len });
      fit();
      update();
    });
    button(act, s('Təmizlə', 'Clear'), 'btn--ghost', () => inst.reset());
    ui.side.appendChild(act);
    ui.side.appendChild(legsBox);
    ui.side.appendChild(ro);

    ui.loop((dt) => {
      if (prog < total()) {
        prog = Math.min(total(), prog + dt * 5);
        update();
      }
    });

    const setLegs = (arr) => {
      legs = arr.map(([d, m]) => ({ v: V.scale(DIRS[d], m), d, m }));
      prog = 0;
      fit();
      update();
    };
    const inst = {
      reset() {
        legs = [];
        prog = 0;
        ring = false;
        fit();
        update();
      },
      examples: [
        { label: s('5 m şimala', '5 m north'), apply: () => setLegs([['N', 5]]), note: s('Qət olunan yol 5 m, yerdəyişmə də 5 m — amma yerdəyişmə <b>şimala</b> olduğunu da bilir.', 'Distance is 5 m and the displacement is also 5 m — but the displacement also knows it is <b>north</b>.') },
        { label: s('5 m şərq + 5 m qərb', '5 m east + 5 m west'), apply: () => setLegs([['E', 5], ['W', 5]]), note: s('Qət olunan yol <b>10 m</b>, amma yerdəyişmə <b>0</b> — başlanğıc nöqtəyə qayıtdın!', 'Distance is <b>10 m</b>, but displacement is <b>0</b> — you are back at the start!') },
        { label: s('3 m şərq + 4 m şimal', '3 m east + 4 m north'), apply: () => setLegs([['E', 3], ['N', 4]]), note: s('Qət olunan yol 7 m, amma yerdəyişmə yalnız <b>5 m</b>: düz ox həmişə daha qısadır (və ya bərabərdir).', 'Distance is 7 m, but the displacement is only <b>5 m</b>: the straight arrow is never longer than the path.') },
      ],
      goals: [
        {
          text: s('8 m-dən çox yol get, amma <b>başladığın nöqtədə</b> dayan (yerdəyişmə = 0).', 'Walk more than 8 m in total but finish <b>exactly where you started</b> (displacement = 0).'),
          hint: s('Bir tərəfə get, sonra eyni məsafəni əks tərəfə get.', 'Walk one way, then the same distance the opposite way.'),
          win: s('Yol uzun idi, yerdəyişmə isə sıfır!', 'Long path, zero displacement!'),
          check: () => legs.length >= 2 && total() >= 8 && prog >= total() - 1e-6 && V.mag(posAt(total())) < 1e-6,
        },
        {
          text: s('Yerdəyişmə düz <b>5 m</b> olsun, amma sən 5 m-dən çox yol get.', 'Make the displacement exactly <b>5 m</b> while walking more than 5 m in total.'),
          hint: s('3 m və 4 m-i yadına sal: biri şərqə, biri şimala.', 'Remember 3 m and 4 m: one east, one north.'),
          win: s('Pifaqor üçbucağı: 3, 4, 5!', 'The 3-4-5 triangle!'),
          check: () => legs.length >= 2 && prog >= total() - 1e-6 && Math.abs(V.mag(posAt(total())) - 5) < 1e-6 && total() > 5.01,
        },
      ],
    };
    inst.reset();
    return inst;
  });

  /* =====================================================================
   * MODULE 1 — draggable arrow: magnitude, angle, components
   * ===================================================================== */
  register('arrow', (ui) => {
    let A = { x: 3, y: 2 };
    let lastAng = V.angleDeg(A);
    let showComp = true;

    const plane = ui.plane({
      units: 12,
      snap: 0.5,
      onChange: () => update(),
      draw(p) {
        const pol = V.toPolar(A);
        if (showComp) p.components({ x: 0, y: 0 }, A);
        if (pol.r > 0.3) {
          p.arc({ x: 0, y: 0 }, 0, pol.deg > 180 ? pol.deg - 360 : pol.deg, 26, C.yellow, 2);
          const mid = (pol.deg > 180 ? pol.deg - 360 : pol.deg) / 2;
          p.text('θ', { x: 0, y: 0 }, { dx: Math.cos(V.rad(mid)) * 42, dy: -Math.sin(V.rad(mid)) * 42, color: C.yellow, size: 14 });
        }
        p.arrow({ x: 0, y: 0 }, A, C.blue, { w: 5, label: 'A', labelSize: 17 });
      },
    });
    plane.setHandles([{ get: () => A, set: (x, y) => (A = { x, y }), color: C.blue, r: 11 }]);

    const ro = el('div', 'readout');
    const sLen = slider(ui.side, {
      label: s('Uzunluq |A|', 'Length |A|'),
      min: 0,
      max: 10,
      step: 0.1,
      value: V.mag(A),
      color: C.blue,
      onInput: (v) => {
        A = V.fromPolar(v, lastAng);
        update(true);
      },
    });
    const sAng = slider(ui.side, {
      label: s('İstiqamət θ', 'Direction θ'),
      min: 0,
      max: 359,
      step: 1,
      value: lastAng,
      unit: '°',
      format: (v) => v,
      color: C.yellow,
      onInput: (v) => {
        lastAng = v;
        A = V.fromPolar(V.mag(A), v);
        update(true);
      },
    });
    toggle(ui.side, s('Komponentləri göstər', 'Show components'), true, (v) => ((showComp = v), plane.render()));
    ui.side.appendChild(ro);

    function update(fromSlider) {
      const pol = V.toPolar(A);
      if (pol.r > 0.05) lastAng = pol.deg;
      if (!fromSlider) {
        sLen.set(Math.min(10, pol.r));
        sAng.set(Math.round(lastAng) % 360);
      }
      ro.innerHTML =
        '<div class="ro-big">' + vecB('A', C.blue) + ' = (' + f2(A.x) + ', ' + f2(A.y) + ')</div>' +
        '<p class="ro-note">' + s('Yəni: ', 'That means: ') + moveText(A) + '.</p>' +
        '<div class="ro-row"><span class="ro-k">' + s('Modul (uzunluq)', 'Magnitude (length)') + '</span><b class="ro-v">|A| = ' + f2(pol.r) + '</b></div>' +
        '<div class="ro-row"><span class="ro-k">' + s('İstiqamət (bucaq)', 'Direction (angle)') + '</span><b class="ro-v">θ = ' + f1(pol.deg) + '°</b></div>' +
        '<div class="ro-row"><span class="ro-k">' + s('Qütb yazılışı', 'Polar notation') + '</span><b class="ro-v">' + f2(pol.r) + ' ∠ ' + f1(pol.deg) + '°</b></div>';
      plane.render();
      ui.changed();
    }
    const set = (x, y) => {
      A = { x, y };
      update();
    };
    const inst = {
      reset() {
        A = { x: 3, y: 2 };
        lastAng = V.angleDeg(A);
        update();
      },
      examples: [
        { label: '(3, 2)', apply: () => set(3, 2), note: s('<b>3</b> vahid sağa, <b>2</b> vahid yuxarı. Ox bu iki addımın birləşməsidir.', '<b>3</b> units right, <b>2</b> units up. The arrow is those two steps combined.') },
        { label: '(−2, 3)', apply: () => set(-2, 3), note: s('Mənfi x — <b>sola</b> gedir. Ox yuxarı-sola baxır, bucaq 90°-dən böyükdür.', 'A negative x means <b>left</b>. The arrow points up-left, so the angle is over 90°.') },
        { label: '(5, 0)', apply: () => set(5, 0), note: s('Şaquli komponent 0: ox düz sağa baxır, θ = 0°.', 'Vertical component is 0: the arrow points straight right, θ = 0°.') },
      ],
      goals: [
        { text: s('<b>A = (−4, 3)</b> vektorunu düzəlt. Uzunluğuna bax!', 'Build the vector <b>A = (−4, 3)</b>. Check its length!'), hint: s('4 vahid sola, 3 vahid yuxarı.', '4 units left, 3 units up.'), win: s('Uzunluq düz 5-dir — 3-4-5 yenə!', 'Its length is exactly 5 — the 3-4-5 again!'), check: () => V.equals(A, { x: -4, y: 3 }, 0.01) },
        { text: s('Düz <b>aşağı</b> baxan, uzunluğu <b>4</b> olan vektor düzəlt.', 'Make a vector pointing straight <b>down</b> with length <b>4</b>.'), hint: s('Üfüqi komponent 0 olmalıdır.', 'The horizontal component must be 0.'), win: s('A = (0, −4), θ = 270°.', 'A = (0, −4), θ = 270°.'), check: () => V.equals(A, { x: 0, y: -4 }, 0.01) },
      ],
    };
    update();
    return inst;
  });

  /* =====================================================================
   * MODULE 2 — Vector Laboratory
   * ===================================================================== */
  register('lab', (ui) => {
    const NAMES = ['A', 'B', 'C', 'D', 'E'];
    const NEXT = [{ x: 2, y: -3 }, { x: -3, y: -2 }, { x: 4, y: -1 }, { x: -1, y: 4 }, { x: 1, y: 2 }];
    const DEFAULT = () => [{ n: 'A', x: 3, y: 2 }, { n: 'B', x: -2, y: 3 }];
    let vecs = DEFAULT();
    let act = 0;
    let showComp = true;
    let showCalc = false;
    let snap = true;

    const colorOf = (v) => VP.palette[NAMES.indexOf(v.n) % VP.palette.length];

    const plane = ui.plane({
      units: 14,
      snap: 0.5,
      onChange: (h) => {
        act = Math.max(0, vecs.indexOf(h.vec));
        refresh();
      },
      draw(p) {
        vecs.forEach((v, i) => {
          const col = colorOf(v);
          const isAct = i === act;
          if (isAct && showComp) p.components({ x: 0, y: 0 }, v);
          p.arrow({ x: 0, y: 0 }, v, col, { w: isAct ? 5 : 3.5, label: v.n, labelSize: 17, alpha: isAct || vecs.length < 3 ? 1 : 0.85 });
          if (isAct && V.mag(v) > 0.3) {
            const ang = V.angleDeg(v);
            const a = ang > 180 ? ang - 360 : ang;
            p.arc({ x: 0, y: 0 }, 0, a, 24, C.yellow, 2);
          }
        });
      },
    });

    const list = el('div', 'veclist');
    const calc = el('div', 'readout calc');
    const rows = []; // { v, xIn, yIn, mag, ang, row }

    function setHandles() {
      plane.setHandles(vecs.map((v) => ({ vec: v, get: () => v, set: (x, y) => { v.x = x; v.y = y; }, color: colorOf(v), r: 10 })));
    }
    function buildRows() {
      list.innerHTML = '';
      rows.length = 0;
      vecs.forEach((v, i) => {
        const row = el('div', 'vrow');
        const name = el('button', 'vrow__name', '<b class="vec">' + v.n + '</b>');
        name.type = 'button';
        name.style.setProperty('--c', colorOf(v));
        name.setAttribute('aria-label', s('Vektor ' + v.n + ' seç', 'Select vector ' + v.n));
        name.addEventListener('click', () => ((act = i), refresh()));
        const mk = (axis) => {
          const wrap = el('label', 'vrow__in');
          wrap.appendChild(el('span', '', axis));
          const inp = el('input');
          inp.type = 'number';
          inp.step = '0.5';
          inp.min = '-9';
          inp.max = '9';
          inp.setAttribute('aria-label', v.n + ' ' + axis);
          inp.addEventListener('input', () => {
            const n = V.parse(inp.value);
            if (n === null) return;
            v[axis] = V.clamp(n, -9, 9);
            act = i;
            refresh(inp);
          });
          wrap.appendChild(inp);
          return { wrap, inp };
        };
        const xi = mk('x');
        const yi = mk('y');
        const info = el('div', 'vrow__info');
        const del = el('button', 'vrow__del', '✕');
        del.type = 'button';
        del.setAttribute('aria-label', s('Vektoru sil', 'Remove vector') + ' ' + v.n);
        del.addEventListener('click', () => {
          vecs.splice(i, 1);
          act = Math.min(act, vecs.length - 1);
          setHandles();
          buildRows();
          refresh();
        });
        row.append(name, xi.wrap, yi.wrap, info, del);
        list.appendChild(row);
        rows.push({ v, xi: xi.inp, yi: yi.inp, info, row });
      });
      addBtn.disabled = vecs.length >= NAMES.length;
    }
    function refresh(skipInput) {
      rows.forEach((r, i) => {
        if (r.xi !== skipInput) r.xi.value = f2(r.v.x);
        if (r.yi !== skipInput) r.yi.value = f2(r.v.y);
        const pol = V.toPolar(r.v);
        r.info.innerHTML = '|' + r.v.n + '| = <b>' + f2(pol.r) + '</b> · θ = <b>' + f1(pol.deg) + '°</b>';
        r.row.classList.toggle('is-active', i === act);
      });
      const v = vecs[act];
      calc.hidden = !showCalc || !v;
      if (v && showCalc) {
        const m = V.mag(v);
        calc.innerHTML =
          '<b>' + s('Hesablama', 'Calculation') + ' — ' + v.n + '</b><br>|' + v.n + '| = √(x² + y²) = √(' + f2(v.x) + '² + ' + f2(v.y) + '²) = √' + f2(v.x * v.x + v.y * v.y) + ' = <b>' + f2(m) + '</b><br>tan θ = y / x = ' + (Math.abs(v.x) < 1e-9 ? s('x = 0: düz yuxarı/aşağı', 'x = 0: straight up/down') : f2(v.y / v.x)) + ' → θ = <b>' + f1(V.angleDeg(v)) + '°</b>';
      }
      plane.render();
      ui.changed();
    }

    const addRow = el('div', 'btnrow');
    const addBtn = button(addRow, '＋ ' + s('Vektor əlavə et', 'Add vector'), 'btn--accent', () => {
      if (vecs.length >= NAMES.length) return;
      const used = vecs.map((v) => v.n);
      const n = NAMES.find((x) => used.indexOf(x) < 0);
      const p = NEXT[(NAMES.indexOf(n) + 1) % NEXT.length];
      vecs.push({ n, x: p.x, y: p.y });
      act = vecs.length - 1;
      setHandles();
      buildRows();
      refresh();
    });
    ui.side.appendChild(addRow);
    ui.side.appendChild(list);
    toggle(ui.side, s('Komponentləri göstər', 'Show components'), true, (v) => ((showComp = v), plane.render()));
    toggle(ui.side, s('Şəbəkəyə yapış', 'Snap to grid'), true, (v) => ((snap = v), (plane.o.snap = v ? 0.5 : 0)));
    toggle(ui.side, s('Hesablamanı göstər', 'Show the calculation'), false, (v) => ((showCalc = v), refresh()));
    ui.side.appendChild(calc);
    const hint = el('p', 'muted small', s('Fikir: uclardakı dairələri sürüşdür, yaxud klaviaturada oxlarla hərəkət etdir (Enter — növbəti vektor).', 'Tip: drag the round handles, or use the arrow keys (Enter switches vector).'));
    ui.side.appendChild(hint);

    const load = (arr) => {
      vecs = arr.map(([x, y], i) => ({ n: NAMES[i], x, y }));
      act = 0;
      setHandles();
      buildRows();
      refresh();
    };
    const inst = {
      reset() {
        vecs = DEFAULT();
        act = 0;
        showComp = true;
        setHandles();
        buildRows();
        refresh();
      },
      examples: [
        { label: s('3-4-5 üçbucağı', '3-4-5 triangle'), apply: () => load([[3, 4]]), note: s('(3, 4): <b>3 + 4 = 7</b> addım atırsan, amma oxun uzunluğu <b>5</b>-dir. Modul komponentlərin cəmi deyil!', '(3, 4): you take <b>3 + 4 = 7</b> steps, but the arrow is only <b>5</b> long. Magnitude is not the sum of the components!') },
        { label: s('Eyni uzunluq, fərqli istiqamət', 'Same length, different direction'), apply: () => load([[5, 0], [3, 4], [-4, 3], [0, -5]]), note: s('Hamısının modulu <b>5</b>-dir, amma istiqamətləri fərqlidir. Modul ≠ istiqamət.', 'All have magnitude <b>5</b> but point in different directions. Magnitude ≠ direction.') },
        { label: s('Eyni istiqamət, fərqli uzunluq', 'Same direction, different length'), apply: () => load([[1, 1], [2, 2], [3, 3]]), note: s('Hamısı 45° istiqamətindədir, amma uzunluqları fərqlidir.', 'All point at 45°, but their lengths differ.') },
      ],
      goals: [
        { text: s('Modulu düz <b>5</b> olan vektor düzəlt, amma o <b>(5, 0)</b> və ya <b>(0, 5)</b> olmasın.', 'Make a vector with magnitude exactly <b>5</b> that is <b>not</b> along an axis.'), hint: s('3 və 4-ü sına.', 'Try 3 and 4.'), win: s('Bir çox fərqli vektorun modulu 5 ola bilər!', 'Many different vectors can have magnitude 5!'), check: () => vecs.some((v) => Math.abs(V.mag(v) - 5) < 0.01 && Math.abs(v.x) > 0.01 && Math.abs(v.y) > 0.01) },
        { text: s('Eyni <b>istiqamətə</b> baxan, amma <b>fərqli uzunluqlu</b> iki vektor düzəlt.', 'Make two vectors that point in the <b>same direction</b> but have <b>different lengths</b>.'), hint: s('Vektor əlavə et; (1, 2) və (2, 4) kimi düşün.', 'Add a vector; think of (1, 2) and (2, 4).'), win: s('Komponentlər eyni nisbətdə böyüyür, istiqamət dəyişmir.', 'The components scale together, so the direction stays the same.'), check: () => vecs.some((a, i) => vecs.some((b, j) => j > i && V.mag(a) > 0.4 && V.mag(b) > 0.4 && sameDir(a, b) && Math.abs(V.mag(a) - V.mag(b)) > 0.5)) },
      ],
    };
    setHandles();
    buildRows();
    refresh();
    return inst;
  });

  /* =====================================================================
   * MODULE 3 — Vector addition (head-to-tail and parallelogram)
   * ===================================================================== */
  register('add', (ui) => {
    let A = { x: 3, y: 1 };
    let B = { x: 1, y: 3 };
    let mode = 'tail';
    let k = 1; // 1 = B drawn at the tip of A (head-to-tail), 0 = B drawn at the origin (parallelogram)
    const O = { x: 0, y: 0 };

    const plane = ui.plane({
      units: 12,
      snap: 0.5,
      onChange: () => update(),
      draw(p) {
        const R = V.add(A, B);
        const Bt = V.scale(A, k); // where B starts
        if (k < 0.999) {
          p.poly([O, A, R, B], 'rgba(167,139,250,' + 0.12 * (1 - k) + ')', null);
          p.seg(B, R, C.blue, 2, [6, 6]);
          p.seg(A, R, C.green, 2, [6, 6]);
        }
        if (k > 0.001) p.arrow(O, B, C.green, { w: 2.5, alpha: 0.3 * k, dash: [4, 6] });
        p.arrow(O, A, C.blue, { w: 4.5, label: 'A', labelSize: 17 });
        p.arrow(Bt, V.add(Bt, B), C.green, { w: 4.5, label: 'B', labelSize: 17 });
        p.arrow(O, R, C.orange, { w: 6, label: 'R = A + B', labelSize: 16, labelOffset: -17 });
        p.dot(R, C.orange, 4);
      },
    });
    plane.setHandles([
      { get: () => A, set: (x, y) => (A = { x, y }), color: C.blue, r: 10 },
      { get: () => V.add(V.scale(A, k), B), set: (x, y) => (B = { x: x - A.x * k, y: y - A.y * k }), color: C.green, r: 10 },
    ]);

    const ro = el('div', 'readout');
    const segm = segmented(ui.side, [{ value: 'tail', label: s('Uc-uca (head-to-tail)', 'Head-to-tail') }, { value: 'para', label: s('Paraleloqram', 'Parallelogram') }], mode, (v) => ((mode = v), update()), s('Üsul', 'Method'));
    ui.side.appendChild(ro);
    let target = 1;
    ui.loop((dt) => {
      target = mode === 'tail' ? 1 : 0;
      if (Math.abs(k - target) > 0.001) {
        k += Math.sign(target - k) * Math.min(Math.abs(target - k), dt * 2.5);
        plane.render();
      }
    });

    function update() {
      const R = V.add(A, B);
      const la = V.mag(A);
      const lb = V.mag(B);
      const lr = V.mag(R);
      const ang = V.angleBetween(A, B);
      let msg;
      if (ang === null) msg = s('Vektorlardan biri sıfırdır.', 'One of the vectors is zero.');
      else if (ang < 0.5) msg = s('Eyni istiqamət: uzunluqlar <b>toplanır</b>.', 'Same direction: the lengths <b>add up</b>.');
      else if (ang > 179.5) msg = s('Əks istiqamət: uzunluqlar bir-birini <b>azaldır</b>.', 'Opposite directions: the lengths <b>cancel</b> each other.');
      else if (Math.abs(ang - 90) < 0.5) msg = s('Perpendikulyar: |R| = √(|A|² + |B|²) — Pifaqor!', 'Perpendicular: |R| = √(|A|² + |B|²) — Pythagoras!');
      else msg = s('Fərqli istiqamətlər: |R| < |A| + |B|. İstiqamət vacibdir!', 'Different directions: |R| < |A| + |B|. Direction matters!');
      ro.innerHTML =
        '<div class="ro-line">' + vecB('A', C.blue) + ' = ' + vs(A) + ' &nbsp; ' + vecB('B', C.green) + ' = ' + vs(B) + '</div>' +
        '<div class="ro-line">' + vecB('R', C.orange) + ' = (A<sub>x</sub> + B<sub>x</sub>, A<sub>y</sub> + B<sub>y</sub>)</div>' +
        '<div class="ro-line ro-big" style="color:' + C.orange + '">R = (' + f2(A.x) + ' + ' + (B.x < 0 ? '(' + f2(B.x) + ')' : f2(B.x)) + ', ' + f2(A.y) + ' + ' + (B.y < 0 ? '(' + f2(B.y) + ')' : f2(B.y)) + ') = ' + vs(R) + '</div>' +
        '<div class="ro-row"><span class="ro-k">|A| + |B|</span><b class="ro-v">' + f2(la) + ' + ' + f2(lb) + ' = ' + f2(la + lb) + '</b></div>' +
        '<div class="ro-row"><span class="ro-k">|R|</span><b class="ro-v" style="color:' + C.orange + '">' + f2(lr) + '</b></div>' +
        '<p class="ro-note">' + msg + '</p>';
      plane.render();
      ui.changed();
    }
    const setAB = (a, b) => {
      A = { x: a[0], y: a[1] };
      B = { x: b[0], y: b[1] };
      update();
    };
    const inst = {
      reset() {
        A = { x: 3, y: 1 };
        B = { x: 1, y: 3 };
        mode = 'tail';
        segm.set('tail');
        update();
      },
      examples: [
        { label: s('Eyni istiqamət', 'Same direction'), apply: () => setAB([3, 0], [2, 0]), note: s('A = (3, 0), B = (2, 0) → R = (5, 0). Uzunluqlar toplandı: 3 + 2 = 5.', 'A = (3, 0), B = (2, 0) → R = (5, 0). The lengths added: 3 + 2 = 5.') },
        { label: s('Əks istiqamət', 'Opposite directions'), apply: () => setAB([3, 0], [-2, 0]), note: s('A = (3, 0), B = (−2, 0) → R = (1, 0): <b>1 vahid sağa</b>. 3 sağa, 2 sola = 1 sağa. Uzunluqlar çıxıldı!', 'A = (3, 0), B = (−2, 0) → R = (1, 0): <b>1 unit right</b>. 3 right and 2 left = 1 right. The lengths subtracted!') },
        { label: s('Perpendikulyar', 'Perpendicular'), apply: () => setAB([3, 0], [0, 4]), note: s('A = (3, 0), B = (0, 4) → R = (3, 4), |R| = <b>5</b> — 3 + 4 = 7 deyil! Bu, düzbucaqlı üçbucaqdır.', 'A = (3, 0), B = (0, 4) → R = (3, 4), |R| = <b>5</b> — not 3 + 4 = 7! It is a right triangle.') },
        { label: s('İxtiyari', 'Arbitrary'), apply: () => setAB([3, 2], [-1, 3]), note: s('A = (3, 2), B = (−1, 3) → R = (2, 5). Komponentlər ayrı-ayrılıqda toplanır.', 'A = (3, 2), B = (−1, 3) → R = (2, 5). Components are added separately.') },
      ],
      goals: [
        { text: s('Nəticə <b>R = (0, 0)</b> olsun, amma A və B sıfır olmasın (|A| ≥ 2).', 'Make the result <b>R = (0, 0)</b> while A and B are not zero (|A| ≥ 2).'), hint: s('B = −A. Bir-birinə qarşı eyni güclə çəkirlər.', 'B = −A. They pull against each other equally.'), win: s('Qarşılıqlı ləğv oldular — vektorlar belə işləyir.', 'They cancelled out — that is how vectors work.'), check: () => V.mag(A) >= 2 && V.isZero(V.add(A, B), 0.01) },
        { text: s('|R| = |A| + |B| olsun (hər ikisi ≥ 2).', 'Make |R| = |A| + |B| (both at least 2 long).'), hint: s('Uzunluqlar yalnız eyni istiqamətdə toplanır.', 'Lengths only add when the vectors point the same way.'), win: s('Yalnız eyni istiqamətdə uzunluqlar toplanır.', 'Only in the same direction do lengths simply add.'), check: () => V.mag(A) >= 2 && V.mag(B) >= 2 && sameDir(A, B) },
        { text: s('R düz <b>yuxarı</b> baxsın (x = 0, y > 0), amma A şaquli olmasın.', 'Make R point straight <b>up</b> (x = 0, y > 0) while A is not vertical.'), hint: s('A-nın üfüqi komponentini B ləğv etməlidir.', 'B must cancel the horizontal part of A.'), win: s('Üfüqi hissələr ləğv oldu, şaquli hissələr qaldı.', 'The horizontal parts cancelled, the vertical parts remained.'), check: () => { const R = V.add(A, B); return Math.abs(R.x) < 0.01 && R.y > 0.9 && Math.abs(A.x) > 0.4; } },
      ],
    };
    update();
    return inst;
  });

  /* =====================================================================
   * MODULE 4 — Vector subtraction: A − B = A + (−B)
   * ===================================================================== */
  register('sub', (ui) => {
    let A = { x: 4, y: 3 };
    let B = { x: 1, y: 2 };
    let mode = 'sub';
    let showDiff = false;
    const O = { x: 0, y: 0 };

    const plane = ui.plane({
      units: 12,
      snap: 0.5,
      onChange: () => update(),
      draw(p) {
        const nB = V.neg(B);
        p.arrow(O, A, C.blue, { w: 4.5, label: 'A', labelSize: 17 });
        p.arrow(O, B, C.green, { w: 4.5, label: 'B', labelSize: 17 });
        if (mode === 'sub') {
          p.arrow(O, nB, C.green, { w: 3, dash: [7, 6], alpha: 0.7, label: '−B', labelSize: 15 });
          p.arrow(A, V.add(A, nB), C.green, { w: 3.5, dash: [7, 6], label: '−B', labelSize: 15 });
          const D = V.sub(A, B);
          p.arrow(O, D, C.orange, { w: 6, label: 'A − B', labelSize: 16, labelOffset: -17 });
          if (showDiff) p.arrow(B, A, C.purple, { w: 3, dash: [3, 7], label: s('B-dən A-ya', 'B → A'), labelSize: 13 });
        } else {
          p.arrow(A, V.add(A, B), C.green, { w: 3.5, dash: [7, 6] });
          p.arrow(O, V.add(A, B), C.orange, { w: 6, label: 'A + B', labelSize: 16, labelOffset: -17 });
        }
      },
    });
    plane.setHandles([
      { get: () => A, set: (x, y) => (A = { x, y }), color: C.blue, r: 10 },
      { get: () => B, set: (x, y) => (B = { x, y }), color: C.green, r: 10 },
    ]);

    const ro = el('div', 'readout');
    const segm = segmented(ui.side, [{ value: 'add', label: 'A + B' }, { value: 'sub', label: 'A − B = A + (−B)' }], mode, (v) => ((mode = v), update()), s('Əməliyyat', 'Operation'));
    const tgDiff = toggle(ui.side, s('“B-dən A-ya” oxunu göstər', 'Show the “B → A” arrow'), false, (v) => ((showDiff = v), plane.render()));
    ui.side.appendChild(ro);

    function update() {
      const nB = V.neg(B);
      const D = V.sub(A, B);
      const Rr = V.add(A, B);
      ro.innerHTML =
        '<div class="ro-line">' + vecB('A', C.blue) + ' = ' + vs(A) + ' &nbsp; ' + vecB('B', C.green) + ' = ' + vs(B) + '</div>' +
        '<div class="ro-line">' + vecB('−B', C.green) + ' = (−B<sub>x</sub>, −B<sub>y</sub>) = ' + vs(nB) + '</div>' +
        (mode === 'sub'
          ? '<div class="ro-line ro-big" style="color:' + C.orange + '">A − B = A + (−B) = (' + f2(A.x) + (nB.x < 0 ? ' − ' + f2(-nB.x) : ' + ' + f2(nB.x)) + ', ' + f2(A.y) + (nB.y < 0 ? ' − ' + f2(-nB.y) : ' + ' + f2(nB.y)) + ') = ' + vs(D) + '</div><div class="ro-row"><span class="ro-k">|A − B|</span><b class="ro-v">' + f2(V.mag(D)) + '</b></div>'
          : '<div class="ro-line ro-big" style="color:' + C.orange + '">A + B = ' + vs(Rr) + '</div><div class="ro-row"><span class="ro-k">|A + B|</span><b class="ro-v">' + f2(V.mag(Rr)) + '</b></div>') +
        '<p class="ro-note">' + (V.isZero(D, 0.01) ? s('A = B olduqda A − B <b>sıfır vektordur</b>.', 'When A = B, A − B is the <b>zero vector</b>.') : s('A − B oxu B-nin ucundan A-nın ucuna gedir.', 'The arrow A − B goes from the tip of B to the tip of A.')) + '</p>';
      plane.render();
      ui.changed();
    }
    const setAB = (a, b) => {
      A = { x: a[0], y: a[1] };
      B = { x: b[0], y: b[1] };
      update();
    };
    const inst = {
      reset() {
        A = { x: 4, y: 3 };
        B = { x: 1, y: 2 };
        mode = 'sub';
        segm.set('sub');
        showDiff = false;
        tgDiff.set(false);
        update();
      },
      examples: [
        { label: s('Əks istiqamətlər', 'Opposite directions'), apply: () => ((mode = 'sub'), segm.set('sub'), setAB([3, 0], [-2, 0])), note: s('A = (3, 0), B = (−2, 0): −B = (2, 0), yəni A − B = (5, 0). Əks yönlü B-ni çıxmaq uzunluğu <b>artırır</b>!', 'A = (3, 0), B = (−2, 0): −B = (2, 0), so A − B = (5, 0). Subtracting an opposite vector makes the result <b>longer</b>!') },
        { label: s('Bərabər vektorlar', 'Equal vectors'), apply: () => ((mode = 'sub'), segm.set('sub'), setAB([2, 3], [2, 3])), note: s('A = B olduqda A − B = (0, 0): fərq yoxdur.', 'When A = B, A − B = (0, 0): there is no difference.') },
        { label: s('Fərq oxu', 'The difference arrow'), apply: () => ((mode = 'sub'), segm.set('sub'), (showDiff = true), tgDiff.set(true), setAB([4, 1], [1, 3])), note: s('A − B = (3, −2). Bənövşəyi ox B-nin ucundan A-nın ucuna gedir və A − B ilə eynidir.', 'A − B = (3, −2). The purple arrow goes from the tip of B to the tip of A and equals A − B.') },
      ],
      goals: [
        { text: s('<b>A − B = (0, 0)</b> olsun (A sıfır olmasın).', 'Make <b>A − B = (0, 0)</b> (A must not be zero).'), hint: s('B-ni A-nın üstünə qoy.', 'Put the tip of B on the tip of A.'), win: s('Bərabər vektorların fərqi sıfırdır.', 'The difference of equal vectors is zero.'), check: () => V.mag(A) >= 1 && V.isZero(V.sub(A, B), 0.01) },
        { text: s('|A − B| həm |A|-dan, həm də |B|-dən <b>böyük</b> olsun.', 'Make |A − B| <b>longer</b> than both |A| and |B|.'), hint: s('Əks istiqamətləri sına.', 'Try opposite directions.'), win: s('B-ni çevirib (−B) əlavə etmək uzunluğu artırdı.', 'Reversing B and adding it made the result longer.'), check: () => { const d = V.mag(V.sub(A, B)); return V.mag(A) >= 1 && V.mag(B) >= 1 && d > V.mag(A) + 0.01 && d > V.mag(B) + 0.01; } },
      ],
    };
    update();
    return inst;
  });

  /* =====================================================================
   * MODULE 4 — Displacement between two points: B − A
   * ===================================================================== */
  register('disp', (ui) => {
    let A = { x: -4, y: -2 };
    let B = { x: 3, y: 3 };
    let showPos = true;
    let showBack = false;
    const O = { x: 0, y: 0 };

    const plane = ui.plane({
      units: 14,
      snap: 1,
      onChange: () => update(),
      draw(p) {
        const D = V.sub(B, A);
        if (showPos) {
          p.arrow(O, A, C.purple, { w: 2.5, dash: [6, 6], alpha: 0.65 });
          p.arrow(O, B, C.orange, { w: 2.5, dash: [6, 6], alpha: 0.65 });
        }
        if (V.mag(D) > 0.3) p.components(A, D);
        if (showBack) p.arrow(B, A, C.cyan, { w: 3, dash: [3, 7], label: 'A − B', labelOffset: 17 });
        p.arrow(A, B, C.green, { w: 5.5, label: 'B − A', labelSize: 16, labelOffset: -17 });
        p.dot(A, C.purple, 7);
        p.dot(B, C.orange, 7);
        p.text(s('A (başlanğıc)', 'A (start)'), A, { dy: 22, color: C.purple });
        p.text(s('B (son)', 'B (end)'), B, { dy: -22, color: C.orange });
      },
    });
    plane.setHandles([
      { get: () => A, set: (x, y) => (A = { x, y }), color: C.purple, r: 10 },
      { get: () => B, set: (x, y) => (B = { x, y }), color: C.orange, r: 10 },
    ]);

    const ro = el('div', 'readout');
    toggle(ui.side, s('A və B mövqe vektorlarını göstər', 'Show the position vectors of A and B'), true, (v) => ((showPos = v), plane.render()));
    toggle(ui.side, s('Geri yolu göstər (B-dən A-ya)', 'Show the way back (B to A)'), false, (v) => ((showBack = v), plane.render()));
    ui.side.appendChild(ro);

    function update() {
      const D = V.sub(B, A);
      ro.innerHTML =
        '<div class="ro-line"><b style="color:' + C.purple + '">A</b> = ' + vs(A) + ' &nbsp; <b style="color:' + C.orange + '">B</b> = ' + vs(B) + '</div>' +
        '<div class="ro-line ro-big" style="color:' + C.green + '">B − A = (' + f2(B.x) + ' − ' + (A.x < 0 ? '(' + f2(A.x) + ')' : f2(A.x)) + ', ' + f2(B.y) + ' − ' + (A.y < 0 ? '(' + f2(A.y) + ')' : f2(A.y)) + ') = ' + vs(D) + '</div>' +
        '<p class="ro-note">' + s('A-dan B-yə getmək üçün: ', 'To get from A to B: ') + moveText(D) + '.</p>' +
        '<div class="ro-row"><span class="ro-k">|B − A| ' + s('(nöqtələr arası məsafə)', '(distance between the points)') + '</span><b class="ro-v">' + f2(V.mag(D)) + '</b></div>' +
        '<div class="ro-row"><span class="ro-k">A − B ' + s('(geri yol)', '(the way back)') + '</span><b class="ro-v">' + vs(V.neg(D)) + '</b></div>';
      plane.render();
      ui.changed();
    }
    const setAB = (a, b) => {
      A = { x: a[0], y: a[1] };
      B = { x: b[0], y: b[1] };
      update();
    };
    const inst = {
      reset() {
        A = { x: -4, y: -2 };
        B = { x: 3, y: 3 };
        showPos = true;
        update();
      },
      examples: [
        { label: s('Ev → Məktəb', 'Home → School'), apply: () => setAB([-4, -2], [3, 3]), note: s('Ev A, məktəb B nöqtəsidir. Yolun vektoru B − A = (7, 5): 7 vahid sağa, 5 yuxarı.', 'Home is A, school is B. The trip vector is B − A = (7, 5): 7 units right, 5 up.') },
        { label: s('Düz sola', 'Straight left'), apply: () => setAB([4, 1], [-3, 1]), note: s('B − A = (−7, 0): yalnız üfüqi hərəkət, <b>sola</b>.', 'B − A = (−7, 0): purely horizontal movement, to the <b>left</b>.') },
        { label: s('Eyni nöqtə', 'Same point'), apply: () => setAB([2, 2], [2, 2]), note: s('A = B olduqda yerdəyişmə (0, 0)-dır: heç yerə getməmisən.', 'When A = B the displacement is (0, 0): you have not moved at all.') },
      ],
      goals: [
        { text: s('Yerdəyişmə <b>B − A = (4, −3)</b> olsun.', 'Make the displacement <b>B − A = (4, −3)</b>.'), hint: s('B = A + (4, −3).', 'B = A + (4, −3).'), win: s('Uzunluğuna bax: düz 5!', 'Check its length: exactly 5!'), check: () => V.equals(V.sub(B, A), { x: 4, y: -3 }, 0.01) },
        { text: s('A və B <b>eyni nöqtədə</b> olsun (başlanğıcdan başqa).', 'Put A and B on the <b>same point</b> (not the origin).'), hint: s('Yerdəyişmə sıfır olmalıdır.', 'The displacement must be zero.'), win: s('B − A = (0, 0).', 'B − A = (0, 0).'), check: () => V.mag(A) > 0.9 && V.isZero(V.sub(B, A), 0.01) },
      ],
    };
    update();
    return inst;
  });

  /* =====================================================================
   * MODULE 6 — Thought experiment: two people push a box
   * ===================================================================== */
  register('pushbox', (ui) => {
    const MASS = 2;
    const SC = 0.2; // world units per newton (arrow length)
    let FL = 6;
    let FR = 2;
    let pushing = false;
    let tt = 0;
    let bx = 0;

    const plane = ui.plane({
      units: 10,
      oy: 0.55,
      ticks: false,
      grid: true,
      axes: false,
      draw(p) {
        p.seg({ x: -20, y: -1.05 }, { x: 20, y: -1.05 }, C.muted, 2);
        // little people
        const person = (x, col, flip) => {
          p.dot({ x, y: 0.55 }, col, 9);
          p.seg({ x, y: 0.4 }, { x, y: -0.7 }, col, 5);
          p.seg({ x, y: 0.1 }, { x: x + flip * 0.55, y: 0.05 }, col, 4);
          p.seg({ x, y: -0.7 }, { x: x - flip * 0.25, y: -1.05 }, col, 4);
          p.seg({ x, y: -0.7 }, { x: x + flip * 0.25, y: -1.05 }, col, 4);
        };
        person(-3.7, C.blue, 1);
        person(3.7, C.green, -1);
        p.rect(bx - 1, -1, bx + 1, 1, 'rgba(251,146,60,0.25)', C.orange);
        p.text(s('qutu', 'box'), { x: bx, y: 0 }, { color: C.orange, size: 13 });
        if (FL > 0) p.arrow({ x: bx - 1 - FL * SC, y: 0 }, { x: bx - 1.02, y: 0 }, C.blue, { w: 5, label: FL + ' N', labelOffset: -18 });
        if (FR > 0) p.arrow({ x: bx + 1 + FR * SC, y: 0 }, { x: bx + 1.02, y: 0 }, C.green, { w: 5, label: FR + ' N', labelOffset: 18 });
        const net = FL - FR;
        if (Math.abs(net) > 0.01) p.arrow({ x: bx, y: 1.8 }, { x: bx + net * SC * 1.5, y: 1.8 }, C.orange, { w: 6, label: s('nəticə ' + Math.abs(net) + ' N', 'net ' + Math.abs(net) + ' N'), labelOffset: -16 });
        else p.text(s('nəticə = 0', 'net = 0'), { x: bx, y: 1.8 }, { color: C.orange, size: 15 });
      },
    });

    const ro = el('div', 'readout');
    const sL = slider(ui.side, { label: s('Sol: mavi', 'Left: blue'), min: 0, max: 10, step: 1, value: FL, unit: ' N', format: (v) => v, color: C.blue, onInput: (v) => ((FL = v), stop(), update()) });
    const sR = slider(ui.side, { label: s('Sağ: yaşıl', 'Right: green'), min: 0, max: 10, step: 1, value: FR, unit: ' N', format: (v) => v, color: C.green, onInput: (v) => ((FR = v), stop(), update()) });
    const act = el('div', 'btnrow');
    button(act, '💪 ' + s('İtələ!', 'Push!'), 'btn--accent', () => {
      bx = 0;
      tt = 0;
      pushing = true;
    });
    ui.side.appendChild(act);
    ui.side.appendChild(ro);

    function stop() {
      pushing = false;
      bx = 0;
    }
    ui.loop((dt) => {
      if (!pushing) return;
      tt += dt;
      const a = (FL - FR) / MASS;
      bx = V.clamp(0.5 * a * tt * tt, -2.6, 2.6);
      if (tt > 1.8) pushing = false;
      plane.render();
    });

    function update() {
      const net = FL - FR;
      ro.innerHTML =
        '<div class="ro-sub">' + s('Yalnız ədədlərlə (istiqamətsiz)', 'Numbers only (no direction)') + '</div>' +
        '<div class="ro-line">' + FL + ' N + ' + FR + ' N = <b>' + (FL + FR) + ' N</b> ' + s('“səy”', 'of “effort”') + '</div>' +
        '<div class="ro-sub">' + s('Vektorlarla (sağ = +, sol = −)', 'With vectors (right = +, left = −)') + '</div>' +
        '<div class="ro-line">(+' + FL + ') + (−' + FR + ') = <b style="color:' + C.orange + '">' + (net > 0 ? '+' : '') + net + ' N</b></div>' +
        '<p class="ro-note">' + (net === 0 ? s('Qüvvələr <b>bir-birini ləğv edir</b> → qutu yerindən tərpənmir (sıfır nəticəvi qüvvə).', 'The forces <b>cancel</b> → the box stays still (zero net force).') : net > 0 ? s('Nəticə <b>sağa</b> yönəlib → qutu sağa sürətlənir.', 'The net force points <b>right</b> → the box accelerates right.') : s('Nəticə <b>sola</b> yönəlib → qutu sola sürətlənir.', 'The net force points <b>left</b> → the box accelerates left.')) + '</p>';
      plane.render();
      ui.changed();
    }
    const setF = (l, r) => {
      FL = l;
      FR = r;
      sL.set(l);
      sR.set(r);
      stop();
      update();
    };
    const inst = {
      reset() {
        setF(6, 2);
      },
      examples: [
        { label: s('Bərabər güc', 'Equal forces'), apply: () => setF(5, 5), note: s('Cəmi 10 N “səy” var, amma qüvvələr əks yönlüdür: (+5) + (−5) = 0. «İtələ!» düyməsini bas.', 'There is 10 N of total “effort”, but the forces are opposite: (+5) + (−5) = 0. Press “Push!”.') },
        { label: s('Fərqli güc', 'Unequal forces'), apply: () => setF(7, 3), note: s('(+7) + (−3) = +4 N: qutu güclü tərəfə doğru gedir.', '(+7) + (−3) = +4 N: the box moves toward the stronger side.') },
        { label: s('Yalnız bir nəfər', 'Only one person'), apply: () => setF(6, 0), note: s('Əks qüvvə yoxdur — nəticə 6 N, tam gücü ilə hərəkət.', 'Nothing pushes back — the net force is 6 N.') },
      ],
      goals: [
        { text: s('Hər ikisi <b>ən azı 4 N</b> itələsin, amma qutu <b>yerindən tərpənməsin</b>.', 'Make both push with <b>at least 4 N</b> but the box <b>stays still</b>.'), hint: s('Qüvvələr bərabər olmalıdır.', 'The forces must be equal.'), win: s('Böyük qüvvələr, sıfır nəticə: istiqamət hər şeyi dəyişir.', 'Big forces, zero result: direction changes everything.'), check: () => FL >= 4 && FL === FR },
        { text: s('Qutu <b>sola</b> getsin.', 'Make the box go <b>left</b>.'), hint: s('Sağdakı güc solundakından böyük olsun.', 'The right-hand push must be stronger.'), win: s('Nəticə sola yönəldi.', 'The net force points left.'), check: () => FR - FL >= 1 },
      ],
    };
    update();
    return inst;
  });
})(window);
