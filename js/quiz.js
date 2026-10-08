/*
 * quiz.js — Module 8: a 10-question knowledge check (multiple choice, visual and practical problems).
 * After every answer: correct / incorrect, a written explanation and, where possible, a picture.
 * The result screen lists the concepts (with links) the learner should revisit.
 */
(function (root) {
  'use strict';
  const VP = root.VP;
  const V = VP.Vec;
  const C = VP.colors;
  const { el, clear, shuffle } = VP.util;
  const { s, t, rich } = VP.i18n;
  const O = { x: 0, y: 0 };

  function defs() {
    return [
      {
        id: 'q1',
        module: 1,
        concept: s('Skalyar və vektor', 'Scalar vs. vector'),
        q: s('Aşağıdakılardan hansı <b>vektordur</b>?', 'Which of these is a <b>vector</b>?'),
        options: [
          { t: s('Temperatur: 20 °C', 'Temperature: 20 °C'), ok: false },
          { t: s('Kütlə: 5 kq', 'Mass: 5 kg'), ok: false },
          { t: s('Sürət vektoru: 60 km/saat şimala', 'Velocity: 60 km/h north'), ok: true },
          { t: s('Vaxt: 3 saniyə', 'Time: 3 seconds'), ok: false },
        ],
        explain: s('Vektorun həm ölçüsü, həm də istiqaməti var. “60 km/saat <b>şimala</b>” istiqamət də verir. Temperatur, kütlə və vaxt isə yalnız ədəddir (skalyar).', 'A vector has both a size and a direction. “60 km/h <b>north</b>” includes a direction. Temperature, mass and time are just numbers (scalars).'),
        picture: { units: 12, arrows: [{ a: { x: -2, y: -3 }, b: { x: -2, y: 3 }, color: C.green, label: s('60 km/saat ↑', '60 km/h ↑'), w: 5 }] },
      },
      {
        id: 'q2',
        module: 1,
        concept: s('Yol və yerdəyişmə', 'Distance vs. displacement'),
        q: s('Sən 4 m şərqə, sonra 4 m qərbə getdin. <b>Yerdəyişmən</b> nə qədərdir?', 'You walk 4 m east and then 4 m west. What is your <b>displacement</b>?'),
        options: [
          { t: s('8 m', '8 m'), ok: false, why: s('8 m — qət olunan yoldur, yerdəyişmə yox.', '8 m is the distance walked, not the displacement.') },
          { t: s('4 m şərqə', '4 m east'), ok: false, why: s('Sonda yenə başlanğıca qayıtmısan.', 'In the end you are back at the start.') },
          { t: s('0 (başlanğıca qayıtdın)', '0 (you are back at the start)'), ok: true },
          { t: s('4 m qərbə', '4 m west'), ok: false, why: s('Eyni məsafəni əks tərəfə gedib ləğv etmisən.', 'You cancelled it by walking the same distance back.') },
        ],
        explain: s('Yerdəyişmə = (4, 0) + (−4, 0) = (0, 0). Yol isə 8 m-dir. Yol skalyardır, yerdəyişmə vektordur.', 'Displacement = (4, 0) + (−4, 0) = (0, 0). The distance is 8 m. Distance is a scalar, displacement is a vector.'),
        picture: { units: 12, arrows: [{ a: { x: -2, y: 1 }, b: { x: 2, y: 1 }, color: C.blue, label: '+4', w: 4.5 }, { a: { x: 2, y: -1 }, b: { x: -2, y: -1 }, color: C.orange, label: '−4', w: 4.5 }], texts: [{ str: s('yol = 8 m · yerdəyişmə = 0', 'distance = 8 m · displacement = 0'), p: { x: 0, y: -4 }, color: C.text }] },
      },
      {
        id: 'q3',
        module: 2,
        concept: s('Vektorun modulu', 'Magnitude'),
        q: s('A = (8, 15) vektorunun <b>modulu</b> |A| nə qədərdir?', 'What is the <b>magnitude</b> |A| of A = (8, 15)?'),
        type: 'num',
        labels: ['|A|'],
        answer: [17],
        tol: 0.01,
        wrong: (v) => (Math.abs(v[0] - 23) < 0.01 ? s('23 = 8 + 15 komponentlərin cəmidir. Modul √(8² + 15²) olmalıdır.', '23 = 8 + 15 is the sum of the components. The magnitude must be √(8² + 15²).') : s('Pifaqor teoremini yoxla: |A| = √(8² + 15²).', 'Check Pythagoras: |A| = √(8² + 15²).')),
        explain: s('|A| = √(64 + 225) = √289 = 17. Komponentlər düzbucaqlı üçbucağın katetləri, vektor isə hipotenuzdur.', '|A| = √(64 + 225) = √289 = 17. The components are the legs of a right triangle and the vector is the hypotenuse.'),
        picture: { units: 20, arrows: [{ a: { x: -6, y: -6 }, b: { x: 2, y: -6 }, color: C.cyan, label: '8', w: 3, dash: [6, 5] }, { a: { x: 2, y: -6 }, b: { x: 2, y: 9 }, color: C.yellow, label: '15', w: 3, dash: [6, 5] }, { a: { x: -6, y: -6 }, b: { x: 2, y: 9 }, color: C.blue, label: '17', w: 5 }] },
      },
      {
        id: 'q4',
        module: 2,
        concept: s('Komponentlər', 'Components'),
        q: s('Şəkildəki vektorun <b>komponentləri</b> hansıdır?', 'What are the <b>components</b> of the vector in the picture?'),
        visual: { units: 12, arrows: [{ a: O, b: { x: -3, y: 2 }, color: C.blue, label: 'A', w: 5 }] },
        options: [
          { t: '(3, 2)', ok: false, why: s('x mənfidir: ox sola baxır.', 'x is negative: the arrow points left.') },
          { t: '(−3, 2)', ok: true },
          { t: '(2, −3)', ok: false, why: s('Komponentlərin yerini dəyişmisən.', 'You swapped the components.') },
          { t: '(−3, −2)', ok: false, why: s('y müsbətdir: ox yuxarı baxır.', 'y is positive: the arrow points up.') },
        ],
        explain: s('Ox 3 vahid sola (x = −3) və 2 vahid yuxarı (y = +2) gedir → A = (−3, 2).', 'The arrow goes 3 units left (x = −3) and 2 units up (y = +2) → A = (−3, 2).'),
        picture: { units: 12, arrows: [{ a: O, b: { x: -3, y: 2 }, color: C.blue, label: 'A', w: 5 }, { a: O, b: { x: -3, y: 0 }, color: C.cyan, dash: [6, 5], w: 3, label: '−3' }, { a: { x: -3, y: 0 }, b: { x: -3, y: 2 }, color: C.yellow, dash: [6, 5], w: 3, label: '+2' }] },
      },
      {
        id: 'q5',
        module: 3,
        concept: s('Vektorların toplanması', 'Vector addition'),
        q: s('Şəkildə A = (2, 3), B = (4, −1). <b>R = A + B</b> nədir?', 'In the picture A = (2, 3), B = (4, −1). What is <b>R = A + B</b>?'),
        visual: { units: 12, arrows: [{ a: O, b: { x: 2, y: 3 }, color: C.blue, label: 'A' }, { a: { x: 2, y: 3 }, b: { x: 6, y: 2 }, color: C.green, label: 'B' }] },
        options: [
          { t: '(6, 2)', ok: true },
          { t: '(6, 4)', ok: false, why: s('y üçün 3 + 1 yazmısan; B-nin y-i −1-dir.', 'You used 3 + 1 for y; B’s y is −1.') },
          { t: '(2, 4)', ok: false, why: s('Yalnız bəzi komponentləri toplamısan.', 'You only added some of the components.') },
          { t: '(−2, 4)', ok: false, why: s('Bu, B − A olar.', 'That would be B − A.') },
        ],
        explain: s('R = (2 + 4, 3 + (−1)) = (6, 2). Uc-uca üsulunda R, A-nın başlanğıcından B-nin ucuna gedir.', 'R = (2 + 4, 3 + (−1)) = (6, 2). In the head-to-tail method R goes from the start of A to the end of B.'),
        picture: { units: 12, arrows: [{ a: O, b: { x: 2, y: 3 }, color: C.blue, label: 'A' }, { a: { x: 2, y: 3 }, b: { x: 6, y: 2 }, color: C.green, label: 'B' }, { a: O, b: { x: 6, y: 2 }, color: C.orange, label: 'R', w: 5.5 }] },
      },
      {
        id: 'q6',
        module: 3,
        concept: s('Perpendikulyar vektorların cəmi', 'Adding perpendicular vectors'),
        q: s('Eyni cismə <b>6 N şərqə</b> və <b>8 N şimala</b> iki qüvvə təsir edir. <b>Nəticəvi qüvvənin modulu</b> neçə N-dur?', 'Two forces act on the same object: <b>6 N east</b> and <b>8 N north</b>. What is the <b>magnitude of the net force</b> in N?'),
        type: 'num',
        labels: ['N'],
        answer: [10],
        tol: 0.01,
        wrong: (v) => (Math.abs(v[0] - 14) < 0.01 ? s('14 = 6 + 8 olar yalnız qüvvələr eyni istiqamətdə olsaydı. Burada onlar perpendikulyardır.', '14 = 6 + 8 would only be right if the forces pointed the same way. Here they are perpendicular.') : s('Nəticə = (6, 8); modulu √(6² + 8²).', 'The net force is (6, 8); its magnitude is √(6² + 8²).')),
        explain: s('ΣF = (6, 0) + (0, 8) = (6, 8); |ΣF| = √(36 + 64) = 10 N. Uzunluqlar sadəcə toplanmır!', 'ΣF = (6, 0) + (0, 8) = (6, 8); |ΣF| = √(36 + 64) = 10 N. The lengths do not simply add!'),
        picture: { units: 16, arrows: [{ a: { x: -3, y: -4 }, b: { x: 3, y: -4 }, color: C.blue, label: '6 N' }, { a: { x: 3, y: -4 }, b: { x: 3, y: 4 }, color: C.green, label: '8 N' }, { a: { x: -3, y: -4 }, b: { x: 3, y: 4 }, color: C.orange, label: '10 N', w: 5.5 }] },
      },
      {
        id: 'q7',
        module: 4,
        concept: s('Yerdəyişmə = son − başlanğıc', 'Displacement = end − start'),
        q: s('P = (2, 3) nöqtəsindən Q = (7, 1) nöqtəsinə <b>yerdəyişmə vektorunu</b> yaz: Q − P = ?', 'Write the <b>displacement vector</b> from P = (2, 3) to Q = (7, 1): Q − P = ?'),
        type: 'num',
        labels: ['x', 'y'],
        answer: [5, -2],
        tol: 0.01,
        wrong: (v) => (Math.abs(v[0] + 5) < 0.01 && Math.abs(v[1] - 2) < 0.01 ? s('Bu, P − Q-dur — əks istiqamət. Yerdəyişmə = son − başlanğıc.', 'That is P − Q — the opposite direction. Displacement = end − start.') : s('Hər komponent üçün çıx: 7 − 2 və 1 − 3.', 'Subtract for each component: 7 − 2 and 1 − 3.')),
        explain: s('Q − P = (7 − 2, 1 − 3) = (5, −2): 5 sağa, 2 aşağı.', 'Q − P = (7 − 2, 1 − 3) = (5, −2): 5 right, 2 down.'),
        visual: { units: 12, dots: [{ p: { x: 2, y: 3 }, color: C.purple, label: 'P' }, { p: { x: 7, y: 1 }, color: C.orange, label: 'Q' }] },
        picture: { units: 12, dots: [{ p: { x: 2, y: 3 }, color: C.purple, label: 'P' }, { p: { x: 7, y: 1 }, color: C.orange, label: 'Q' }], arrows: [{ a: { x: 2, y: 3 }, b: { x: 7, y: 1 }, color: C.green, label: '(5, −2)', w: 5 }] },
      },
      {
        id: 'q8',
        module: 4,
        concept: s('Vektorların çıxılması', 'Vector subtraction'),
        q: s('A = (4, 1) və B = (1, 3) olduqda <b>A − B</b> nədir?', 'For A = (4, 1) and B = (1, 3), what is <b>A − B</b>?'),
        visual: { units: 12, arrows: [{ a: O, b: { x: 4, y: 1 }, color: C.blue, label: 'A' }, { a: O, b: { x: 1, y: 3 }, color: C.green, label: 'B' }] },
        options: [
          { t: '(3, −2)', ok: true },
          { t: '(5, 4)', ok: false, why: s('Bu, A + B-dir.', 'That is A + B.') },
          { t: '(−3, 2)', ok: false, why: s('Bu, B − A-dır. Sıra vacibdir.', 'That is B − A. Order matters.') },
          { t: '(3, 4)', ok: false, why: s('Yalnız x-i düzgün çıxmısan; y-ni də çıx: 1 − 3 = −2.', 'You only subtracted x correctly; subtract y too: 1 − 3 = −2.') },
        ],
        explain: s('A − B = A + (−B) = (4 − 1, 1 − 3) = (3, −2). Bənövşəyi ox B-nin ucundan A-nın ucuna gedir və A − B-yə bərabərdir.', 'A − B = A + (−B) = (4 − 1, 1 − 3) = (3, −2). The purple arrow goes from the tip of B to the tip of A and equals A − B.'),
        picture: { units: 12, arrows: [{ a: O, b: { x: 4, y: 1 }, color: C.blue, label: 'A' }, { a: O, b: { x: 1, y: 3 }, color: C.green, label: 'B' }, { a: { x: 1, y: 3 }, b: { x: 4, y: 1 }, color: C.purple, label: 'A − B', w: 5, dash: [8, 5] }] },
      },
      {
        id: 'q9',
        module: 5,
        concept: s('Qayıq və çay', 'Boat and river'),
        q: s('Qayığın sudakı sürəti <b>(0, 12) m/s</b> (şimala), çayın axını <b>(5, 0) m/s</b> (şərqə). Qayığın sahilə nəzərən <b>sürətinin modulu</b> (m/s) nədir?', 'A boat moves at <b>(0, 12) m/s</b> (north) through a river flowing at <b>(5, 0) m/s</b> (east). What is the boat’s <b>speed relative to the bank</b> (m/s)?'),
        type: 'num',
        labels: ['m/s'],
        answer: [13],
        tol: 0.01,
        wrong: (v) => (Math.abs(v[0] - 17) < 0.01 ? s('17 = 12 + 5 — sürətləri skalyar kimi toplamısan. Əvvəl vektor cəmi (5, 12), sonra modulu.', '17 = 12 + 5 — you added the speeds as plain numbers. Take the vector sum (5, 12) first, then its magnitude.') : s('v = (0, 12) + (5, 0) = (5, 12); |v| = √(5² + 12²).', 'v = (0, 12) + (5, 0) = (5, 12); |v| = √(5² + 12²).')),
        explain: s('v = (5, 12), |v| = √(25 + 144) = 13 m/s. Qayıq şimal-şərq istiqamətində gedir.', 'v = (5, 12), |v| = √(25 + 144) = 13 m/s. The boat travels toward the north-east.'),
        picture: { units: 20, arrows: [{ a: { x: -3, y: -6 }, b: { x: -3, y: 6 }, color: C.blue, label: s('qayıq', 'boat') }, { a: { x: -3, y: 6 }, b: { x: 2, y: 6 }, color: C.cyan, label: s('axın', 'current') }, { a: { x: -3, y: -6 }, b: { x: 2, y: 6 }, color: C.orange, label: '13', w: 5.5 }] },
      },
      {
        id: 'q10',
        module: 6,
        concept: s('Vektorlar niyə lazımdır', 'Why vectors are needed'),
        q: s('İki nəfər qutunu <b>eyni qüvvə</b> ilə, amma <b>əks tərəflərdən</b> itələyir. Qutu niyə tərpənmir?', 'Two people push a box with <b>equal force</b> from <b>opposite sides</b>. Why does the box stay still?'),
        options: [
          { t: s('Əks yönlü bərabər qüvvələrin vektor cəmi sıfırdır', 'The vector sum of equal, opposite forces is zero'), ok: true },
          { t: s('Qüvvələr toplanıb qutunu ağırlaşdırır', 'The forces add up and make the box heavier'), ok: false, why: s('Qüvvələr kütləni dəyişmir; onlar vektor kimi toplanır.', 'Forces do not change the mass; they add as vectors.') },
          { t: s('Qüvvələr heç bir təsir göstərmir', 'The forces have no effect at all'), ok: false, why: s('Qüvvələr təsir edir — sadəcə nəticəsi sıfırdır.', 'The forces do act — their net result is just zero.') },
        ],
        explain: s('(+F) + (−F) = 0. Ədədlərlə “F + F” yazsaq səhv nəticə alarıq; istiqamət olmadan fizikanı düzgün təsvir etmək olmaz — vektorlar da məhz bunun üçün yaradılıb.', '(+F) + (−F) = 0. Adding the numbers “F + F” would give the wrong picture; without direction physics cannot be described correctly — that is exactly why vectors were developed.'),
        picture: { units: 14, arrows: [{ a: { x: -6, y: 0 }, b: { x: -1.2, y: 0 }, color: C.blue, label: 'F', w: 5 }, { a: { x: 6, y: 0 }, b: { x: 1.2, y: 0 }, color: C.green, label: 'F', w: 5 }], texts: [{ str: s('ΣF = 0', 'ΣF = 0'), p: { x: 0, y: 3 }, color: C.orange, size: 18 }], rects: [{ x0: -1, y0: -1, x1: 1, y1: 1, fill: 'rgba(251,146,60,0.25)', stroke: C.orange }] },
      },
    ];
  }

  function mount(host, api) {
    const Q = defs();
    const wrap = el('div', 'quiz');
    host.appendChild(wrap);
    let planes = [];
    let order = [];
    let i = 0;
    let score = 0;
    let missed = [];

    const cleanPlanes = () => {
      planes.forEach((p) => p.destroy());
      planes = [];
    };
    const picture = (parent, spec) => {
      const cv = el('canvas', 'ch__canvas');
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', t('ch.pic'));
      parent.appendChild(cv);
      planes.push(VP.drawStatic(cv, spec));
    };

    function intro() {
      cleanPlanes();
      clear(wrap);
      const rec = api.get();
      const card = el('section', 'card quiz__intro');
      card.appendChild(el('h3', '', t('quiz.title')));
      card.appendChild(el('p', 'lead', t('quiz.intro', { n: Q.length })));
      if (rec && rec.best !== undefined) card.appendChild(el('p', 'muted', t('quiz.best') + ' <b>' + rec.best + ' / ' + Q.length + '</b>'));
      const b = el('button', 'btn btn--accent btn--lg', '▶ ' + t('quiz.start'));
      b.type = 'button';
      b.addEventListener('click', start);
      card.appendChild(b);
      wrap.appendChild(card);
    }
    function start() {
      order = Q.slice();
      i = 0;
      score = 0;
      missed = [];
      question();
    }

    function question() {
      cleanPlanes();
      clear(wrap);
      const d = order[i];
      const head = el('div', 'quiz__head');
      head.innerHTML = '<span class="badge">' + t('quiz.q') + ' ' + (i + 1) + ' / ' + order.length + '</span><div class="progressbar" role="progressbar" aria-valuemin="0" aria-valuemax="' + order.length + '" aria-valuenow="' + i + '"><i style="width:' + (i / order.length) * 100 + '%"></i></div><span class="quiz__score">⭐ ' + score + '</span>';
      const card = el('section', 'card ch__card');
      card.appendChild(el('h3', 'ch__q', rich(d.q)));
      const stage = el('div', 'ch__stage');
      const area = el('div', 'ch__area');
      const fb = el('div', 'fb');
      fb.setAttribute('aria-live', 'polite');
      const exStage = el('div', 'ch__stage');
      const bar = el('div', 'btnrow');
      card.append(stage, area, fb, exStage, bar);
      wrap.append(head, card);
      if (d.visual) picture(stage, d.visual);

      let answered = false;
      const next = el('button', 'btn btn--green', (i === order.length - 1 ? t('quiz.results') : t('ch.next')) + ' →');
      next.type = 'button';
      next.hidden = true;
      next.addEventListener('click', () => {
        if (i === order.length - 1) results();
        else {
          i++;
          question();
        }
      });
      bar.appendChild(next);

      function finish(ok, whyHtml) {
        if (answered) return;
        answered = true;
        if (ok) score++;
        else missed.push(d);
        fb.className = 'fb ' + (ok ? 'ok' : 'bad');
        fb.innerHTML = '<b>' + (ok ? '✔ ' + t('quiz.correct') : '✗ ' + t('quiz.incorrect')) + '</b>' + (!ok && whyHtml ? '<p>' + whyHtml + '</p>' : '') + '<p>' + rich(d.explain) + '</p>';
        if (d.picture) {
          exStage.appendChild(el('p', 'muted small', t('quiz.visual')));
          picture(exStage, d.picture);
        }
        card.querySelectorAll('input,button.opt').forEach((n) => (n.disabled = true));
        if (checkBtn) checkBtn.hidden = true;
        next.hidden = false;
        next.focus();
      }

      let checkBtn = null;
      if (d.type === 'num') {
        const row = el('div', 'numrow');
        const ins = d.labels.map((lab) => {
          const l = el('label', 'numin');
          l.appendChild(el('span', '', lab));
          const inp = el('input');
          inp.type = 'text';
          inp.inputMode = 'decimal';
          inp.autocomplete = 'off';
          inp.setAttribute('aria-label', lab);
          l.appendChild(inp);
          row.appendChild(l);
          return inp;
        });
        area.appendChild(row);
        checkBtn = el('button', 'btn btn--accent', '✓ ' + t('ch.check'));
        checkBtn.type = 'button';
        const submit = () => {
          if (answered) return;
          const vals = ins.map((x) => V.parse(x.value));
          if (vals.some((v) => v === null)) {
            fb.className = 'fb info';
            fb.innerHTML = '<b>' + t('ch.enterNumbers') + '</b>';
            return;
          }
          const ok = vals.every((v, k) => Math.abs(v - d.answer[k]) <= d.tol);
          finish(ok, ok ? '' : d.wrong(vals));
        };
        checkBtn.addEventListener('click', submit);
        ins.forEach((x) => x.addEventListener('keydown', (e) => e.key === 'Enter' && submit()));
        bar.insertBefore(checkBtn, next);
        ins[0].focus();
      } else {
        const list = el('div', 'opts');
        shuffle(d.options).forEach((o) => {
          const b = el('button', 'opt', rich(o.t));
          b.type = 'button';
          b.addEventListener('click', () => {
            if (answered) return;
            b.classList.add(o.ok ? 'is-ok' : 'is-bad');
            if (!o.ok) list.querySelectorAll('button').forEach((x) => x.classList.toggle('is-ok', x.__ok === true));
            finish(o.ok, o.ok ? '' : o.why || '');
          });
          b.__ok = o.ok;
          list.appendChild(b);
        });
        area.appendChild(list);
      }
    }

    function results() {
      cleanPlanes();
      clear(wrap);
      const total = order.length;
      const pct = score / total;
      const prev = api.get();
      const best = Math.max(score, prev && prev.best !== undefined ? prev.best : 0);
      const mods = [];
      missed.forEach((d) => {
        if (!mods.some((m) => m.module === d.module)) mods.push({ module: d.module, concepts: [d.concept] });
        else mods.find((m) => m.module === d.module).concepts.push(d.concept);
      });
      api.save({ best, last: score, total });
      const card = el('section', 'card quiz__result');
      card.appendChild(el('h3', '', '🏁 ' + t('quiz.done')));
      card.appendChild(el('div', 'quiz__big', score + ' <small>/ ' + total + '</small>'));
      card.appendChild(el('p', 'lead', pct >= 0.9 ? t('quiz.msgA') : pct >= 0.6 ? t('quiz.msgB') : t('quiz.msgC')));
      if (mods.length) {
        card.appendChild(el('h4', '', t('quiz.revisit')));
        const ul = el('ul', 'revisit');
        mods.forEach((m) => {
          const mod = VP.lessons.find((l) => l.num === m.module);
          const li = el('li', '', '<a href="#/m/' + m.module + '"><b>' + t('nav.module') + ' ' + m.module + (mod ? ' — ' + VP.tr(mod.title) : '') + '</b></a><span>' + m.concepts.join(', ') + '</span>');
          ul.appendChild(li);
        });
        card.appendChild(ul);
      } else card.appendChild(el('p', 'fb ok', '✔ ' + t('quiz.perfect')));
      const bar = el('div', 'btnrow');
      const again = el('button', 'btn btn--accent', '↺ ' + t('quiz.again'));
      again.type = 'button';
      again.addEventListener('click', start);
      const home = el('a', 'btn btn--ghost', t('nav.home'));
      home.href = '#/';
      bar.append(again, home);
      card.appendChild(bar);
      wrap.appendChild(card);
      api.refresh && api.refresh();
    }

    intro();
    return { destroy: cleanPlanes };
  }

  VP.quiz = { mount, count: 10 };
})(window);
