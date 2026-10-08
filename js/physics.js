/*
 * physics.js — Module 5 experiments: walking, boat & river, forces, aircraft & wind, video game.
 * Every experiment obeys the same rule: the combined result is the vector SUM of its parts.
 */
(function (root) {
  'use strict';
  const VP = root.VP;
  const V = VP.Vec;
  const C = VP.colors;
  const { el } = VP.util;
  const { s } = VP.i18n;
  const { f1, f2, vs, vecB, slider, button, segmented, toggle, sameDir } = VP.sims.h;
  const register = VP.sims.register;

  // Draw a small arrow-head shaped vehicle at world position `pos`, nose pointing at `deg` (maths angle).
  function vehicle(p, pos, deg, color, size) {
    const c = p.ctx;
    c.save();
    c.translate(p.X(pos.x), p.Y(pos.y));
    c.rotate(-V.rad(deg));
    c.fillStyle = color;
    c.strokeStyle = '#fff';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(size, 0);
    c.lineTo(-size * 0.8, size * 0.7);
    c.lineTo(-size * 0.4, 0);
    c.lineTo(-size * 0.8, -size * 0.7);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }
  const bearingText = (v) => (V.isZero(v, 0.01) ? '—' : f1(V.bearing(v)) + '°');

  /* =====================================================================
   * A — Walking: path vs. displacement (8 compass directions)
   * ===================================================================== */
  register('walk8', (ui) => {
    const DIRS = [
      { a: 0, g: '→' }, { a: 45, g: '↗' }, { a: 90, g: '↑' }, { a: 135, g: '↖' },
      { a: 180, g: '←' }, { a: 225, g: '↙' }, { a: 270, g: '↓' }, { a: 315, g: '↘' },
    ];
    let ang = 0;
    let len = 4;
    let legs = []; // { v, m, g }
    let prog = 0;
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
      units: 18,
      draw(p) {
        const here = posAt(prog);
        let start = { x: 0, y: 0 };
        let acc = 0;
        legs.forEach((l, i) => {
          const part = V.clamp((prog - acc) / l.m, 0, 1);
          if (part > 0) p.arrow(start, V.add(start, V.scale(l.v, part)), VP.palette[i % 3], { w: 4 });
          start = V.add(start, l.v);
          acc += l.m;
        });
        if (V.mag(here) > 0.05) p.arrow({ x: 0, y: 0 }, here, C.orange, { w: 3, dash: [8, 6], label: s('yerdəyişmə', 'displacement'), labelOffset: -16 });
        p.dot({ x: 0, y: 0 }, C.text, 5);
        p.text(s('Başlanğıc', 'Start'), { x: 0, y: 0 }, { dy: 18, size: 12, color: C.muted });
        p.ring(here, C.text, 9, 3);
        p.dot(here, C.green, 7);
      },
    });
    const fit = () => {
      let m = 6;
      let q = { x: 0, y: 0 };
      legs.forEach((l) => {
        q = V.add(q, l.v);
        m = Math.max(m, Math.abs(q.x), Math.abs(q.y));
      });
      plane.o.units = Math.max(18, 2 * (m + 3));
      plane._scale();
    };
    const ro = el('div', 'readout');
    const legsBox = el('div', 'legs');
    function update() {
      const here = posAt(prog);
      const walked = Math.min(prog, total());
      const eff = walked > 0.01 ? V.mag(here) / walked : 1;
      ro.innerHTML =
        '<div class="ro-row"><span class="ro-k">' + s('Qət olunan yol', 'Distance') + ' = Σ|leg|</span><b class="ro-v">' + f1(walked) + ' m</b></div>' +
        '<div class="ro-row"><span class="ro-k">' + s('Yerdəyişmə', 'Displacement') + ' = Σ leg</span><b class="ro-v" style="color:' + C.orange + '">' + vs(here) + '</b></div>' +
        '<div class="ro-row"><span class="ro-k">|' + s('yerdəyişmə', 'displacement') + '|</span><b class="ro-v">' + f2(V.mag(here)) + ' m</b></div>' +
        '<p class="ro-note">' + s('Yerdəyişmə / yol = ', 'Displacement ÷ distance = ') + '<b>' + f2(eff) + '</b> ' + s('(1 yalnız düz xətt boyunca olur).', '(it is 1 only for a straight line).') + '</p>';
      legsBox.innerHTML = legs.length ? legs.map((l) => '<span class="leg">' + l.m + ' m ' + l.g + '</span>').join('<span class="plus">+</span>') : '<span class="muted">' + s('Hələ addım atılmayıb.', 'No steps yet.') + '</span>';
      plane.render();
      ui.changed();
    }
    ui.side.appendChild(el('div', 'ctl__title', s('İstiqamət', 'Direction')));
    const dseg = segmented(ui.side, DIRS.map((d) => ({ value: d.a, label: d.g })), ang, (v) => (ang = v), s('İstiqamət', 'Direction'));
    dseg.root.classList.add('seg--wrap');
    slider(ui.side, { label: s('Addım uzunluğu', 'Leg length'), min: 1, max: 10, step: 1, value: len, unit: ' m', format: (v) => v, onInput: (v) => (len = v) });
    const act = el('div', 'btnrow');
    button(act, '🚶 ' + s('Get!', 'Walk!'), 'btn--accent', () => {
      legs.push({ v: V.fromPolar(len, ang), m: len, g: DIRS.find((d) => d.a === ang).g });
      fit();
      update();
    });
    button(act, '⌫ ' + s('Geri al', 'Undo'), 'btn--ghost', () => {
      legs.pop();
      prog = Math.min(prog, total());
      fit();
      update();
    });
    button(act, s('Təmizlə', 'Clear'), 'btn--ghost', () => inst.reset());
    ui.side.append(act, legsBox, ro);
    ui.loop((dt) => {
      if (prog < total()) {
        prog = Math.min(total(), prog + dt * 6);
        update();
      }
    });
    const setLegs = (arr) => {
      legs = arr.map(([a, m]) => ({ v: V.fromPolar(m, a), m, g: DIRS.find((d) => d.a === a).g }));
      prog = 0;
      fit();
      update();
    };
    const inst = {
      reset() {
        legs = [];
        prog = 0;
        fit();
        update();
      },
      examples: [
        { label: '3 → + 4 ↑', apply: () => setLegs([[0, 3], [90, 4]]), note: s('Yol 7 m, yerdəyişmə 5 m.', 'Distance 7 m, displacement 5 m.') },
        { label: s('Ziqzaq', 'Zig-zag'), apply: () => setLegs([[0, 4], [90, 3], [0, 4], [270, 3]]), note: s('Yol 14 m, yerdəyişmə yalnız 8 m (düz şərqə).', 'Distance 14 m, but the displacement is only 8 m (due east).') },
        { label: s('Kvadrat', 'Square'), apply: () => setLegs([[0, 5], [90, 5], [180, 5], [270, 5]]), note: s('20 m yol, <b>0</b> yerdəyişmə: əvvəl-axır eyni nöqtə.', '20 m of walking, <b>0</b> displacement: same start and end point.') },
      ],
      goals: [
        { text: s('Yol yerdəyişmədən <b>ən azı 3 dəfə</b> uzun olsun (yerdəyişmə 0 olmasın).', 'Make the distance <b>at least 3 times</b> the displacement (displacement not zero).'), hint: s('Üç tərəfi olan “U” formasını sına.', 'Try a “U” shape: three sides.'), win: s('Uzun yol, qısa yerdəyişmə.', 'Long path, short displacement.'), check: () => prog >= total() - 1e-6 && V.mag(posAt(total())) > 0.5 && total() >= 3 * V.mag(posAt(total())) - 1e-6 },
        { text: s('Yerdəyişmə düz <b>(6, 8)</b> olsun (10 m).', 'Make the displacement exactly <b>(6, 8)</b> (10 m).'), hint: s('6 m şərq + 8 m şimal, yaxud başqa kombinasiya.', '6 m east + 8 m north, or another combination.'), win: s('Yol fərqli ola bilər — vektor cəmi eynidir.', 'The path may differ — the vector sum is the same.'), check: () => prog >= total() - 1e-6 && V.equals(posAt(total()), { x: 6, y: 8 }, 0.01) },
      ],
    };
    inst.reset();
    return inst;
  });

  /* =====================================================================
   * B — Boat and river
   * ===================================================================== */
  register('boat', (ui) => {
    const W = 8; // river width in metres
    let b = { x: 0, y: 4 };
    let cur = 3;
    let launch = -1; // animation time, -1 = idle
    let flow = 0;
    const O = { x: 0, y: 0 };
    const ground = () => V.add(b, { x: cur, y: 0 });

    const plane = ui.plane({
      units: 14,
      ox: 0.3,
      oy: 0.2,
      onChange: () => sync(),
      draw(p) {
        const r = p.range();
        const g = ground();
        p.rect(r.xmin, 0, r.xmax, W, 'rgba(34,211,238,0.10)', null);
        p.seg({ x: r.xmin, y: 0 }, { x: r.xmax, y: 0 }, C.green, 3);
        p.seg({ x: r.xmin, y: W }, { x: r.xmax, y: W }, C.green, 3);
        p.text(s('Cənub sahil', 'South bank'), { x: r.xmin + 2.4, y: -0.8 }, { color: C.green, size: 12 });
        p.text(s('Şimal sahil', 'North bank'), { x: r.xmin + 2.4, y: W + 0.8 }, { color: C.green, size: 12 });
        // flowing current marks
        for (let row = 1; row < 4; row++) {
          const y = (row * W) / 4;
          for (let x = Math.floor(r.xmin) - 2; x < r.xmax + 2; x += 3.5) {
            const xx = x + ((flow * cur * 0.6) % 3.5);
            p.arrow({ x: xx, y }, { x: xx + 0.2 + cur * 0.12, y }, C.cyan, { w: 1.5, alpha: cur > 0 ? 0.35 : 0, head: 6 });
          }
        }
        p.text('✕ ' + s('düz qarşı', 'directly across'), { x: 0, y: W }, { dy: -16, color: C.yellow, size: 12 });
        if (g.y > 0.05) {
          const drift = (W * g.x) / g.y;
          p.seg(O, { x: drift, y: W }, C.orange, 2, [7, 6]);
          p.dot({ x: drift, y: W }, C.orange, 6);
          p.text(s('çatır', 'lands'), { x: drift, y: W }, { dy: 17, color: C.orange, size: 12 });
        }
        p.arrow(O, b, C.blue, { w: 4, label: s('qayıq', 'boat'), labelOffset: -17 });
        p.arrow(b, V.add(b, { x: cur, y: 0 }), C.cyan, { w: 4, label: s('axın', 'current'), labelOffset: -16 });
        p.arrow(O, g, C.orange, { w: 6, label: s('nəticə', 'result'), labelOffset: 17 });
        let pos = O;
        if (launch >= 0 && g.y > 0.05) pos = V.scale(g, Math.min(launch, W / g.y));
        vehicle(p, pos, V.angleDeg(b), C.blue, 13);
      },
    });
    plane.setHandles([{ get: () => b, set: (x, y) => (b = { x, y }), color: C.blue, r: 11, constrain: (x, y) => (Math.hypot(x, y) > 8 ? V.scale(V.normalize({ x, y }), 8) : { x, y }) }]);

    const ro = el('div', 'readout');
    const sSp = slider(ui.side, { label: s('Qayığın sürəti', 'Boat speed'), min: 0.5, max: 8, step: 0.1, value: V.mag(b), unit: ' m/s', color: C.blue, onInput: (v) => ((b = V.fromPolar(v, Math.max(V.angleDeg(b), 0.1))), sync(true)) });
    const sAng = slider(ui.side, { label: s('Hədəf istiqaməti', 'Aim direction'), min: 0, max: 180, step: 1, value: 90, unit: '°', format: (v) => v, color: C.yellow, onInput: (v) => ((b = V.fromPolar(V.mag(b), v)), sync(true)) });
    const sCur = slider(ui.side, { label: s('Çayın axını', 'Current speed'), min: 0, max: 6, step: 0.5, value: cur, unit: ' m/s', color: C.cyan, onInput: (v) => ((cur = v), sync(true)) });
    const act = el('div', 'btnrow');
    button(act, '⛵ ' + s('Yola sal!', 'Launch!'), 'btn--accent', () => (launch = 0));
    ui.side.append(act, ro);

    ui.loop((dt) => {
      flow += dt;
      if (launch >= 0) {
        launch += dt * 1.2;
        const g = ground();
        if (g.y <= 0.05 || launch > W / g.y + 0.6) launch = -1;
      }
      plane.render();
    });

    function sync(fromSlider) {
      if (!fromSlider) {
        sSp.set(Math.min(8, V.mag(b)));
        sAng.set(Math.round(V.angleDeg(b)) % 360 > 180 ? 180 : Math.round(V.angleDeg(b)) % 360);
      }
      const g = ground();
      const lines =
        '<div class="ro-line">' + vecB('qayıq', C.blue).replace('qayıq', s('qayıq', 'boat')) + ' = ' + vs(b) + ' m/s</div>' +
        '<div class="ro-line">' + vecB(s('axın', 'current'), C.cyan) + ' = ' + vs({ x: cur, y: 0 }) + ' m/s</div>' +
        '<div class="ro-line ro-big" style="color:' + C.orange + '">' + s('nəticə', 'result') + ' = ' + s('qayıq', 'boat') + ' + ' + s('axın', 'current') + ' = ' + vs(g) + ' m/s</div>' +
        '<div class="ro-row"><span class="ro-k">|' + s('nəticə', 'result') + '|</span><b class="ro-v">' + f2(V.mag(g)) + ' m/s</b></div>';
      if (g.y > 0.05) {
        const tcross = W / g.y;
        ro.innerHTML = lines + '<div class="ro-row"><span class="ro-k">' + s('Keçid vaxtı', 'Crossing time') + ' = ' + W + ' / ' + s('şaquli', 'vertical') + '</span><b class="ro-v">' + f2(tcross) + ' s</b></div>' + '<div class="ro-row"><span class="ro-k">' + s('Axınla sürüşmə', 'Drift downstream') + '</span><b class="ro-v">' + f2(g.x * tcross) + ' m</b></div>';
      } else ro.innerHTML = lines + '<p class="ro-note">' + s('Qayıq qarşı sahilə <b>çatmır</b> — şaquli sürət ≤ 0.', 'The boat <b>never reaches</b> the far bank — its upward speed is ≤ 0.') + '</p>';
      ui.changed();
    }
    const setB = (x, y, c) => {
      b = { x, y };
      cur = c;
      sCur.set(c);
      launch = -1;
      sync();
    };
    const inst = {
      reset() {
        setB(0, 4, 3);
      },
      examples: [
        { label: s('Düz şimala', 'Aim straight north'), apply: () => setB(0, 4, 3), note: s('Qayıq (0, 4), axın (3, 0): nəticə (3, 4) — qayıq <b>axınla sürüşür</b>. «Yola sal!» düyməsini bas.', 'Boat (0, 4), current (3, 0): result (3, 4) — the boat is <b>swept downstream</b>. Press “Launch!”.') },
        { label: s('Axına qarşı yönəl', 'Aim upstream'), apply: () => setB(-3, 4, 3), note: s('Qayıq (−3, 4): üfüqi komponent axını ləğv edir → nəticə (0, 4), düz qarşıya çatır!', 'Boat (−3, 4): its horizontal part cancels the current → result (0, 4), straight across!') },
        { label: s('Axın yoxdur', 'No current'), apply: () => setB(0, 4, 0), note: s('Axın 0 olduqda nəticə qayığın öz sürətidir.', 'With no current the result is just the boat’s own velocity.') },
      ],
      goals: [
        { text: s('Qayığı elə yönəlt ki, axın olsa da <b>düz qarşıya</b> çatsın (sürüşmə ≈ 0).', 'Aim the boat so it lands <b>directly across</b> despite the current (drift ≈ 0).'), hint: s('Axın sağa itələyir — bir az sola yönəl.', 'The current pushes right — aim a little left.'), win: s('Üfüqi komponentlər bir-birini ləğv etdi.', 'The horizontal components cancelled.'), check: () => { const g = ground(); return cur >= 1 && g.y > 0.3 && Math.abs((W * g.x) / g.y) < 0.25; } },
        { text: s('Çayı <b>2 saniyədən tez</b> keç (şaquli sürət > 4), sürüşmə 5 m-dən az olsun.', 'Cross in <b>under 2 s</b> (vertical speed > 4) with less than 5 m of drift.'), hint: s('Daha sürətli qayıq lazımdır və bir az axına qarşı yönəl.', 'You need a faster boat, aimed slightly upstream.'), win: s('Sürətli və dəqiq!', 'Fast and precise!'), check: () => { const g = ground(); return g.y > 4 && Math.abs((W * g.x) / g.y) < 5; } },
      ],
    };
    sync();
    return inst;
  });

  /* =====================================================================
   * C — Forces on an object
   * ===================================================================== */
  register('forces', (ui) => {
    const COL = [C.blue, C.green, C.purple];
    const DEF = () => [{ x: 4, y: 0 }, { x: 0, y: 3 }, { x: -2, y: -1 }];
    let F = DEF();
    let on3 = true;
    let chain = false;
    let released = false;
    let bp = { x: 0, y: 0 };
    let bv = { x: 0, y: 0 };
    const O = { x: 0, y: 0 };
    const used = () => (on3 ? F : F.slice(0, 2));
    const net = () => V.sum(used());

    const plane = ui.plane({
      units: 14,
      snap: 1,
      onChange: () => update(),
      draw(p) {
        const R = net();
        p.rect(-0.6, -0.6, 0.6, 0.6, 'rgba(251,146,60,0.12)', 'rgba(251,146,60,0.5)');
        if (chain) {
          let q = O;
          used().forEach((f, i) => {
            p.arrow(q, V.add(q, f), COL[i], { w: 2.5, dash: [6, 6], alpha: 0.7 });
            q = V.add(q, f);
          });
        }
        used().forEach((f, i) => p.arrow(O, f, COL[i], { w: 4.5, label: 'F' + (i + 1), labelSize: 16 }));
        if (V.mag(R) > 0.05) p.arrow(O, R, C.orange, { w: 6.5, label: s('Σ nəticə', 'Σ net'), labelOffset: -17 });
        if (released || V.mag(bp) > 0.01) {
          p.rect(bp.x - 0.6, bp.y - 0.6, bp.x + 0.6, bp.y + 0.6, 'rgba(251,146,60,0.45)', C.orange);
        }
      },
    });
    const handles = F.map((_, i) => ({ get: () => F[i], set: (x, y) => (F[i] = { x, y }), color: COL[i], r: 10, enabled: () => i < 2 || on3 }));
    plane.setHandles(handles);

    const ro = el('div', 'readout');
    const tg3 = toggle(ui.side, s('Üçüncü qüvvə F₃', 'Third force F₃'), true, (v) => ((on3 = v), stopBox(), update()));
    const tgCh = toggle(ui.side, s('Uc-uca zənciri göstər', 'Show the head-to-tail chain'), false, (v) => ((chain = v), plane.render()));
    const act = el('div', 'btnrow');
    button(act, '▶ ' + s('Qutunu burax', 'Release the box'), 'btn--accent', () => {
      bp = { x: 0, y: 0 };
      bv = { x: 0, y: 0 };
      released = true;
    });
    button(act, '■ ' + s('Dayandır', 'Stop'), 'btn--ghost', stopBox);
    ui.side.append(act, ro);

    function stopBox() {
      released = false;
      bp = { x: 0, y: 0 };
      bv = { x: 0, y: 0 };
      plane.render();
    }
    ui.loop((dt) => {
      if (!released) return;
      const a = V.scale(net(), 1 / 2); // mass = 2 kg
      bv = V.add(bv, V.scale(a, dt));
      bp = V.add(bp, V.scale(bv, dt));
      const r = plane.range();
      if (bp.x < r.xmin || bp.x > r.xmax || bp.y < r.ymin || bp.y > r.ymax) stopBox();
      else plane.render();
    });

    function update() {
      const R = net();
      const bal = V.isZero(R, 0.01);
      ro.innerHTML =
        used().map((f, i) => '<div class="ro-line"><b style="color:' + COL[i] + '">F<sub>' + (i + 1) + '</sub></b> = ' + vs(f) + ' N &nbsp; |F<sub>' + (i + 1) + '</sub>| = ' + f2(V.mag(f)) + '</div>').join('') +
        '<div class="ro-line ro-big" style="color:' + C.orange + '">ΣF = ' + used().map((_, i) => 'F<sub>' + (i + 1) + '</sub>').join(' + ') + ' = ' + vs(R) + ' N</div>' +
        '<div class="status ' + (bal ? 'is-ok' : 'is-warn') + '">' + (bal ? s('✔ Balanslıdır: ΣF = 0 → qutu sükunətdə qalır (və ya düz xətt üzrə sabit sürətlə gedir).', '✔ Balanced: ΣF = 0 → the box stays at rest (or keeps a constant velocity).') : s('Balanssızdır: |ΣF| = ', 'Unbalanced: |ΣF| = ') + f2(V.mag(R)) + ' N, ' + s('qutu bu istiqamətdə sürətlənir: ', 'the box accelerates toward ') + f1(V.angleDeg(R)) + '°') + '</div>';
      plane.render();
      ui.changed();
    }
    const load = (arr, three) => {
      F = arr.map(([x, y]) => ({ x, y }));
      while (F.length < 3) F.push({ x: 0, y: 0 });
      on3 = three;
      tg3.set(three);
      stopBox();
      update();
    };
    const inst = {
      reset() {
        F = DEF();
        on3 = true;
        chain = false;
        tg3.set(true);
        tgCh.set(false);
        stopBox();
        update();
      },
      examples: [
        { label: s('İpdartma (bərabər, əks)', 'Tug of war (equal, opposite)'), apply: () => load([[4, 0], [-4, 0]], false), note: s('F₁ = (4, 0), F₂ = (−4, 0): ΣF = (0, 0). Qüvvələr var, amma <b>nəticə yoxdur</b>.', 'F₁ = (4, 0), F₂ = (−4, 0): ΣF = (0, 0). The forces exist, but the <b>net force is zero</b>.') },
        { label: s('Üç qüvvə balansda', 'Three balanced forces'), apply: () => ((chain = true), tgCh.set(true), load([[4, 0], [-1, 3], [-3, -3]], true)), note: s('Zəncir bağlanır: son uc başlanğıca qayıdır → ΣF = 0.', 'The chain closes: the end returns to the start → ΣF = 0.') },
        { label: s('Balanssız', 'Unbalanced'), apply: () => load([[4, 1], [1, 3]], false), note: s('ΣF = (5, 4). «Qutunu burax» düyməsini bas — qutu nəticənin istiqamətində gedir.', 'ΣF = (5, 4). Press “Release the box” — it moves in the direction of the net force.') },
      ],
      goals: [
        { text: s('Üç qüvvənin hamısı sıfırdan fərqli (|F| ≥ 1) olsun və <b>ΣF = 0</b>.', 'Make all three forces non-zero (|F| ≥ 1) with <b>ΣF = 0</b>.'), hint: s('Zəncirin uc-uca bağlanmasını izlə.', 'Watch for the head-to-tail chain closing.'), win: s('Üçbucaq bağlandı: qüvvələr balansdadır.', 'The triangle closed: the forces are balanced.'), check: () => on3 && F.every((f) => V.mag(f) >= 1) && V.isZero(net(), 0.01) },
        { text: s('Üç qüvvədən istifadə et, nəticə <b>ΣF = (0, 3)</b> olsun.', 'Use all three forces to get <b>ΣF = (0, 3)</b>.'), hint: s('F₃ = (0, 3) − F₁ − F₂.', 'F₃ = (0, 3) − F₁ − F₂.'), win: s('Nəticə düz yuxarı.', 'The net force points straight up.'), check: () => on3 && V.equals(net(), { x: 0, y: 3 }, 0.01) },
      ],
    };
    update();
    return inst;
  });

  /* =====================================================================
   * D — Aircraft and wind
   * ===================================================================== */
  register('aircraft', (ui) => {
    const K = 50; // 1 world unit = 50 km/h
    const DIST = 12; // airport is 12 units = 600 km north
    let a = { x: 0, y: 6 };
    let w = { x: 3, y: 0 };
    let fly = -1;
    const O = { x: 0, y: 0 };
    const g = () => V.add(a, w);

    const plane = ui.plane({
      units: 22,
      oy: 0.1,
      onChange: () => sync(),
      draw(p) {
        const G = g();
        p.rect(-0.5, DIST - 0.4, 0.5, DIST + 0.4, 'rgba(250,204,21,0.25)', C.yellow);
        p.text(s('Hava limanı (600 km şimalda)', 'Airport (600 km north)'), { x: 0, y: DIST }, { dy: -18, color: C.yellow, size: 12 });
        if (G.y > 0.05) {
          const ax = (DIST * G.x) / G.y;
          p.seg(O, { x: ax, y: DIST }, C.orange, 2, [7, 6]);
          p.dot({ x: ax, y: DIST }, C.orange, 5);
        }
        p.arrow(O, a, C.blue, { w: 4, label: s('təyyarə (havaya nəzərən)', 'aircraft (rel. to air)'), labelOffset: -16, labelSize: 12 });
        p.arrow(a, G, C.cyan, { w: 4, label: s('külək', 'wind'), labelOffset: -15 });
        p.arrow(O, G, C.orange, { w: 6, label: s('yerə nəzərən', 'over the ground'), labelOffset: 18, labelSize: 12 });
        const pos = fly >= 0 ? V.scale(G, fly) : O;
        vehicle(p, pos, V.angleDeg(a), '#fff', 13);
      },
    });
    plane.setHandles([
      { get: () => a, set: (x, y) => (a = { x, y }), color: C.blue, r: 11, constrain: (x, y) => (Math.hypot(x, y) > 9 ? V.scale(V.normalize({ x, y }), 9) : { x, y }) },
      { get: () => V.add(a, w), set: (x, y) => (w = { x: x - a.x, y: y - a.y }), color: C.cyan, r: 10 },
    ]);

    const ro = el('div', 'readout');
    const sWs = slider(ui.side, { label: s('Küləyin sürəti', 'Wind speed'), min: 0, max: 6, step: 0.5, value: V.mag(w), color: C.cyan, format: (v) => f1(v * K), unit: ' km/h', onInput: (v) => ((w = V.fromPolar(v, V.mag(w) > 0.01 ? V.angleDeg(w) : 0)), sync(true)) });
    const sWd = slider(ui.side, { label: s('Küləyin istiqaməti', 'Wind blows toward'), min: 0, max: 359, step: 1, value: 0, unit: '°', format: (v) => v, color: C.yellow, onInput: (v) => ((w = V.fromPolar(V.mag(w), v)), sync(true)) });
    const act = el('div', 'btnrow');
    button(act, '✈ ' + s('Uç!', 'Fly!'), 'btn--accent', () => (fly = 0));
    ui.side.append(act, ro);
    ui.loop((dt) => {
      if (fly >= 0) {
        fly += dt * 0.8;
        const G = g();
        if (G.y <= 0.05 || G.y * fly > DIST + 1) fly = -1;
        plane.render();
      }
    });
    function sync(fromSlider) {
      if (!fromSlider) {
        sWs.set(Math.min(6, V.mag(w)));
        sWd.set(Math.round(V.angleDeg(w)) % 360);
      }
      const G = g();
      let tail = '';
      if (G.y > 0.05) {
        const t = DIST / G.y;
        const off = ((DIST * G.x) / G.y) * K;
        tail = '<div class="ro-row"><span class="ro-k">' + s('Hava limanına qədər vaxt', 'Time to the airport') + '</span><b class="ro-v">' + f2(t) + ' ' + s('saat', 'h') + '</b></div>' +
          '<div class="ro-row"><span class="ro-k">' + s('Limana nəzərən yer', 'Arrival offset') + '</span><b class="ro-v">' + (Math.abs(off) < 1 ? s('düz limana', 'on target') : f1(Math.abs(off)) + ' km ' + (off > 0 ? s('şərqdə', 'east') : s('qərbdə', 'west'))) + '</b></div>';
      } else tail = '<p class="ro-note">' + s('Təyyarə şimala <b>irəliləmir</b>.', 'The aircraft is <b>not making progress</b> north.') + '</p>';
      ro.innerHTML =
        '<div class="ro-row"><span class="ro-k">' + s('Burun (kurs)', 'Heading') + '</span><b class="ro-v" style="color:' + C.blue + '">' + bearingText(a) + ' · ' + f1(V.mag(a) * K) + ' km/h</b></div>' +
        '<div class="ro-row"><span class="ro-k">' + s('Külək', 'Wind') + '</span><b class="ro-v" style="color:' + C.cyan + '">' + f1(V.mag(w) * K) + ' km/h → ' + bearingText(w) + '</b></div>' +
        '<div class="ro-line ro-big" style="color:' + C.orange + '">' + s('yerə nəzərən', 'ground') + ' = ' + s('təyyarə', 'aircraft') + ' + ' + s('külək', 'wind') + ' = ' + vs(G) + '</div>' +
        '<div class="ro-row"><span class="ro-k">' + s('Yer sürəti · trayektoriya', 'Ground speed · track') + '</span><b class="ro-v">' + f1(V.mag(G) * K) + ' km/h · ' + bearingText(G) + '</b></div>' +
        tail +
        '<p class="ro-note muted">' + s('İstiqamətlər kompas bucağıdır (0° = şimal, 90° = şərq).', 'Directions are compass bearings (0° = north, 90° = east).') + '</p>';
      ui.changed();
    }
    const setAW = (av, wv) => {
      a = { x: av[0], y: av[1] };
      w = { x: wv[0], y: wv[1] };
      fly = -1;
      sync();
    };
    const inst = {
      reset() {
        setAW([0, 6], [3, 0]);
      },
      examples: [
        { label: s('Düz şimala burun', 'Nose pointing north'), apply: () => setAW([0, 6], [3, 0]), note: s('Burun şimaldadır, amma külək şərqə əsir → yer üzərində trayektoriya <b>şərqə meyllənir</b>. «Uç!» düyməsini bas.', 'The nose points north, but the wind blows east → the ground track <b>drifts east</b>. Press “Fly!”.') },
        { label: s('Küləyə qarşı yönəl', 'Aim into the wind'), apply: () => setAW([-3, 6], [3, 0]), note: s('Burun bir az qərbə yönəlib → külək onu geri çəkir və trayektoriya düz şimaldır. Pilotlar bunu “külək düzəlişi” adlandırır.', 'The nose points a little west → the wind pushes it back onto a straight north track. Pilots call this a wind correction angle.') },
        { label: s('Əks külək', 'Headwind'), apply: () => setAW([0, 6], [0, -3]), note: s('Külək cənubdan şimala qarşı əsir: yer sürəti 6 − 3 = 3 vahid olur — uçuş uzanır.', 'The wind blows against the flight: ground speed is 6 − 3 = 3 units — the flight takes longer.') },
      ],
      goals: [
        { text: s('Trayektoriya <b>düz şimala</b> baxsın (yer sürətinin x komponenti ≈ 0) və hava limanına çatsın.', 'Make the ground track point <b>straight north</b> (ground x-component ≈ 0) so you reach the airport.'), hint: s('Küləyin üfüqi komponentini ləğv et: təyyarəni əks tərəfə çevir.', 'Cancel the wind’s horizontal part: turn the nose the opposite way.'), win: s('Kurs ≠ trayektoriya: düzəliş etdin!', 'Heading ≠ track: you corrected for the wind!'), check: () => { const G = g(); return Math.abs(G.x) < 0.15 && G.y > 1; } },
        { text: s('Hava limanına <b>1,8 saatdan tez</b> çat (düz şimala).', 'Reach the airport in <b>under 1.8 h</b> going straight north.'), hint: s('Yer sürətinin şaquli komponenti > 6,7 olmalıdır — daha sürətli uç.', 'The ground speed north must exceed 6.7 — fly faster.'), win: s('Həm düz, həm sürətli.', 'Straight and fast.'), check: () => { const G = g(); return G.y > 0 && Math.abs(G.x) < 0.5 && DIST / G.y < 1.8; } },
      ],
    };
    sync();
    return inst;
  });

  /* =====================================================================
   * E — Video game: position, velocity, unit vectors
   * ===================================================================== */
  register('game', (ui) => {
    const COINS0 = () => [{ x: -3, y: 2.5, got: false }, { x: 3.5, y: 3, got: false }, { x: 2, y: -3, got: false }];
    let p = { x: 0, y: 0 };
    let raw = { x: 0, y: 0 }; // the vector the player steers with
    let unitMode = false;
    let speed = 3;
    let coins = COINS0();
    let trail = [];
    const vel = () => (unitMode ? V.scale(V.normalize(raw), speed) : raw);

    const plane = ui.plane({
      units: 12,
      snap: 0.5,
      onChange: () => plane.render(),
      draw(pl) {
        const v = vel();
        const r = pl.range();
        pl.rect(r.xmin + 0.4, r.ymin + 0.4, r.xmax - 0.4, r.ymax - 0.4, null, 'rgba(167,139,250,0.35)');
        trail.forEach((q, i) => pl.dot(q, 'rgba(77,163,255,' + (i / trail.length) * 0.4 + ')', 3));
        coins.forEach((c) => {
          if (!c.got) {
            pl.dot(c, C.yellow, 9);
            pl.text('★', c, { color: '#7a5b00', size: 12 });
          }
        });
        if (unitMode && V.mag(raw) > 0.05) {
          pl.arrow(p, V.add(p, raw), C.blue, { w: 2, dash: [6, 6], alpha: 0.6 });
          pl.arrow(p, V.add(p, V.normalize(raw)), C.cyan, { w: 4, label: 'û', labelOffset: 15, labelSize: 15 });
        }
        if (V.mag(v) > 0.05) pl.arrow(p, V.add(p, v), C.green, { w: 5, label: 'v', labelOffset: -15, labelSize: 16 });
        pl.ring(p, '#fff', 13, 3);
        pl.dot(p, C.blue, 11);
        pl.dot({ x: p.x + 0.12, y: p.y + 0.1 }, '#fff', 3);
      },
    });
    plane.setHandles([{ get: () => V.add(p, raw), set: (x, y) => (raw = { x: x - p.x, y: y - p.y }), color: C.blue, r: 11, constrain: (x, y) => { const d = { x: x - p.x, y: y - p.y }; return V.mag(d) > 6 ? V.add(p, V.scale(V.normalize(d), 6)) : { x, y }; } }]);

    const ro = el('div', 'readout');
    const tgU = toggle(ui.side, s('Vahid vektorla idarə: v = û · sürət', 'Steer with a unit vector: v = û · speed'), false, (v) => ((unitMode = v), sSp.row.classList.toggle('is-disabled', !v), (sSp.input.disabled = !v)));
    const sSp = slider(ui.side, { label: s('Sürət', 'Speed'), min: 0.5, max: 6, step: 0.5, value: speed, onInput: (v) => (speed = v) });
    sSp.row.classList.add('is-disabled');
    sSp.input.disabled = true;
    const act = el('div', 'btnrow');
    button(act, '■ ' + s('Dayan', 'Stop'), 'btn--ghost', () => (raw = { x: 0, y: 0 }));
    button(act, '★ ' + s('Sikkələri bərpa et', 'Respawn coins'), 'btn--ghost', () => (coins = COINS0()));
    ui.side.append(act, ro);

    ui.loop((dt) => {
      const v = vel();
      const r = plane.range();
      p = { x: V.clamp(p.x + v.x * dt, r.xmin + 0.5, r.xmax - 0.5), y: V.clamp(p.y + v.y * dt, r.ymin + 0.5, r.ymax - 0.5) };
      if (V.mag(v) > 0.05) {
        trail.push({ x: p.x, y: p.y });
        if (trail.length > 40) trail.shift();
      }
      coins.forEach((c) => {
        if (!c.got && V.dist(c, p) < 0.7) c.got = true;
      });
      const left = coins.filter((c) => !c.got).length;
      ro.innerHTML =
        '<div class="ro-line">' + s('Mövqe', 'Position') + ' <b>p</b> = ' + vs(p) + '</div>' +
        '<div class="ro-line">' + s('Sürət', 'Velocity') + ' <b style="color:' + C.green + '">v</b> = ' + vs(v) + ' &nbsp; |v| = ' + f2(V.mag(v)) + '</div>' +
        (unitMode ? '<div class="ro-line">û = v̂ / |raw| = ' + vs(V.normalize(raw)) + ' &nbsp; |û| = ' + (V.isZero(raw, 0.05) ? '0' : '1') + '</div>' : '<div class="ro-line muted">' + s('Qeyd: çəpinə (3, 3) sürüşdürsən |v| = 4,24 — düzünə (3, 0)-dan <b>tezdir</b>!', 'Note: drag to (3, 3) and |v| = 4.24 — <b>faster</b> than straight (3, 0)!') + '</div>') +
        '<div class="ro-line ro-big">p<sub>' + s('yeni', 'new') + '</sub> = p + v · Δt</div>' +
        '<div class="ro-row"><span class="ro-k">' + s('Qalan sikkələr', 'Coins left') + '</span><b class="ro-v">' + left + ' / 3</b></div>';
      plane.render();
      ui.changed();
    });

    const inst = {
      reset() {
        p = { x: 0, y: 0 };
        raw = { x: 0, y: 0 };
        unitMode = false;
        tgU.set(false);
        sSp.row.classList.add('is-disabled');
        sSp.input.disabled = true;
        coins = COINS0();
        trail = [];
      },
      examples: [
        { label: s('Düz sağa (3, 0)', 'Straight right (3, 0)'), apply: () => ((unitMode = false), tgU.set(false), sSp.row.classList.add('is-disabled'), (sSp.input.disabled = true), (raw = { x: 3, y: 0 })), note: s('v = (3, 0): hər saniyə 3 vahid sağa. Mövqe: p + v·Δt.', 'v = (3, 0): 3 units to the right each second. Position: p + v·Δt.') },
        { label: s('Çəpinə — normallaşdırmadan', 'Diagonal — not normalised'), apply: () => ((unitMode = false), tgU.set(false), sSp.row.classList.add('is-disabled'), (sSp.input.disabled = true), (raw = { x: 3, y: 3 })), note: s('|v| = √18 ≈ 4,24: çəpinə hərəkət <b>daha sürətli</b> oldu — oyunlarda məşhur səhv!', '|v| = √18 ≈ 4.24: diagonal movement became <b>faster</b> — a classic game bug!') },
        { label: s('Çəpinə — vahid vektorla', 'Diagonal — with a unit vector'), apply: () => ((unitMode = true), tgU.set(true), sSp.row.classList.remove('is-disabled'), (sSp.input.disabled = false), (raw = { x: 3, y: 3 })), note: s('û = (0,71; 0,71), |û| = 1. v = û · sürət → istənilən istiqamətdə sürət eynidir.', 'û = (0.71, 0.71), |û| = 1. v = û · speed → the same speed in every direction.') },
      ],
      goals: [{ text: s('Personajı sürükləyərək <b>3 sikkənin hamısını</b> topla.', 'Steer the character with the arrow handle and collect <b>all 3 coins</b>.'), hint: s('Mavi dairəni sürüşdür: ox sürət vektorunu göstərir.', 'Drag the blue handle: the arrow is the velocity vector.'), win: s('Hər kadrda: mövqe += sürət · Δt.', 'Every frame: position += velocity · Δt.'), check: () => coins.every((c) => c.got) }],
    };
    return inst;
  });
})(window);
