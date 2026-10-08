/*
 * challenges.js — Module 7: twelve progressively harder vector puzzles.
 * Scoring: 100 points, minus 25 per wrong attempt, minus 20 for using the hint (never below 20).
 * After 2 wrong attempts the answer can be revealed (0 points). Wrong answers are always explained.
 *
 * Challenge definitions are built by defs() at mount time, so s(az, en) picks the current language.
 */
(function (root) {
  'use strict';
  const VP = root.VP;
  const V = VP.Vec;
  const C = VP.colors;
  const { el, clear } = VP.util;
  const { s, t, rich } = VP.i18n;
  const f2 = (n) => V.fmt(n, 2);
  const vs = (v) => V.fmtVec(v, 2);
  const O = { x: 0, y: 0 };

  const MAX_PTS = 100;

  function defs() {
    return [
      /* 1 — same vector? */
      {
        id: 'ch1',
        level: 1,
        type: 'choice',
        q: s('Narıncı <b>R</b> oxu ilə <b>eyni vektor</b> hansıdır? (Vektor başlanğıc nöqtədən asılı deyil.)', 'Which arrow is the <b>same vector</b> as the orange <b>R</b>? (A vector does not depend on where it starts.)'),
        visual: {
          units: 14,
          arrows: [
            { a: { x: -7, y: -3 }, b: { x: -4, y: -1 }, color: C.orange, label: 'R', w: 5 },
            { a: { x: 0, y: 3 }, b: { x: 3, y: 5 }, color: C.blue, label: 'A' },
            { a: { x: 1, y: -4 }, b: { x: 4, y: -1 }, color: C.green, label: 'B' },
            { a: { x: -4, y: 4 }, b: { x: -1, y: 2 }, color: C.purple, label: 'C' },
            { a: { x: 3, y: -4 }, b: { x: 5, y: -1 }, color: C.cyan, label: 'D' },
          ],
        },
        options: [
          { t: 'A', ok: true },
          { t: 'B', ok: false, why: s('B-nin komponentləri (3, 3)-dür — R = (3, 2)-dən daha uzundur.', 'B has components (3, 3) — it is longer than R = (3, 2).') },
          { t: 'C', ok: false, why: s('C (3, −2) aşağı baxır; R isə yuxarı baxır. İstiqamət fərqlidir.', 'C is (3, −2) and points down; R points up. The direction is different.') },
          { t: 'D', ok: false, why: s('D = (2, 3): komponentlər yerini dəyişib. Uzunluq eynidir, istiqamət isə yox.', 'D = (2, 3): the components are swapped. The length is the same but the direction is not.') },
        ],
        hint: s('R-in komponentlərini say: neçə sağa, neçə yuxarı?', 'Count R’s components: how far right, how far up?'),
        explain: s('A da R kimi 3 sağa və 2 yuxarı gedir → hər ikisi (3, 2). Vektor yalnız uzunluq və istiqamətlə təyin olunur, harada çəkildiyi vacib deyil.', 'A also goes 3 right and 2 up → both are (3, 2). A vector is defined only by its length and direction, not by where it is drawn.'),
      },
      /* 2 — negative vector */
      {
        id: 'ch2',
        level: 1,
        type: 'choice',
        q: s('B = (−2, 5) olarsa, <b>−B</b> hansıdır?', 'If B = (−2, 5), what is <b>−B</b>?'),
        options: [
          { t: '(2, −5)', ok: true },
          { t: '(−2, −5)', ok: false, why: s('Yalnız y-in işarəsini dəyişmisən. −B üçün hər iki komponentin işarəsi dəyişməlidir.', 'You only flipped y. For −B both components change sign.') },
          { t: '(2, 5)', ok: false, why: s('Yalnız x-in işarəsi dəyişib. y də dəyişməlidir.', 'Only x flipped. y has to flip too.') },
          { t: '(5, −2)', ok: false, why: s('Bu, komponentlərin yerini dəyişməkdir — başqa əməliyyatdır.', 'That swaps the components — a different operation.') },
        ],
        hint: s('−B, B-nin tam əks istiqamətidir.', '−B points exactly the opposite way to B.'),
        explain: s('−B = (−(−2), −5) = (2, −5). Əks vektor eyni uzunluğa malikdir, amma tam əks istiqamətə baxır.', '−B = (−(−2), −5) = (2, −5). The opposite vector has the same length but points the exact opposite way.'),
      },
      /* 3 — magnitude */
      {
        id: 'ch3',
        level: 2,
        type: 'num',
        q: s('A = (5, 12) vektorunun <b>modulunu</b> tap: |A| = ?', 'Find the <b>magnitude</b> of A = (5, 12): |A| = ?'),
        labels: ['|A|'],
        answer: [13],
        tol: 0.01,
        hint: s('Pifaqor: |A| = √(x² + y²).', 'Pythagoras: |A| = √(x² + y²).'),
        wrongMsg: (v) => (Math.abs(v[0] - 17) < 0.01 ? s('17 = 5 + 12 komponentlərin cəmidir. Modul isə √(5² + 12²) olmalıdır.', '17 = 5 + 12 is the sum of the components. The magnitude must be √(5² + 12²).') : s('|A| = √(5² + 12²) = √(25 + 144) ifadəsini yenidən hesabla.', 'Recalculate |A| = √(5² + 12²) = √(25 + 144).')),
        explain: s('|A| = √(25 + 144) = √169 = 13.', '|A| = √(25 + 144) = √169 = 13.'),
      },
      /* 4 — displacement */
      {
        id: 'ch4',
        level: 2,
        type: 'num',
        q: s('P nöqtəsindən Q nöqtəsinə <b>yerdəyişmə vektorunu</b> yaz: Q − P = ?', 'Write the <b>displacement vector</b> from point P to point Q: Q − P = ?'),
        visual: { units: 14, dots: [{ p: { x: 1, y: 2 }, color: C.purple, label: 'P (1, 2)' }, { p: { x: 5, y: 5 }, color: C.orange, label: 'Q (5, 5)' }], arrows: [{ a: { x: 1, y: 2 }, b: { x: 5, y: 5 }, color: C.green, dash: [7, 6], w: 3 }] },
        labels: ['x', 'y'],
        answer: [4, 3],
        tol: 0.01,
        hint: s('Son − başlanğıc: Q − P.', 'End − start: Q − P.'),
        wrongMsg: (v) => (Math.abs(v[0] + 4) < 0.01 && Math.abs(v[1] + 3) < 0.01 ? s('Bu, P − Q-dur (əks istiqamət). Yerdəyişmə = <b>son − başlanğıc</b>.', 'That is P − Q (the opposite direction). Displacement = <b>end − start</b>.') : s('Hər komponenti ayrıca çıx: 5 − 1 və 5 − 2.', 'Subtract each component separately: 5 − 1 and 5 − 2.')),
        explain: s('Q − P = (5 − 1, 5 − 2) = (4, 3): 4 sağa, 3 yuxarı. Uzunluq √(16 + 9) = 5.', 'Q − P = (5 − 1, 5 − 2) = (4, 3): 4 right, 3 up. Its length is √(16 + 9) = 5.'),
      },
      /* 5 — resultant choice */
      {
        id: 'ch5',
        level: 2,
        type: 'choice',
        q: s('A = (2, 3) və B = (−1, 2) olduqda <b>nəticəvi vektor</b> R = A + B hansıdır?', 'For A = (2, 3) and B = (−1, 2), which is the <b>resultant</b> R = A + B?'),
        visual: { units: 14, arrows: [{ a: O, b: { x: 2, y: 3 }, color: C.blue, label: 'A' }, { a: { x: 2, y: 3 }, b: { x: 1, y: 5 }, color: C.green, label: 'B' }] },
        options: [
          { t: '(1, 5)', ok: true },
          { t: '(3, 5)', ok: false, why: s('x üçün 2 + 1 yazmısan, amma B-nin x-i −1-dir: 2 + (−1) = 1.', 'You used 2 + 1 for x, but B’s x is −1: 2 + (−1) = 1.') },
          { t: '(3, 1)', ok: false, why: s('Bu, A − B-dir. Burada toplama tələb olunur.', 'That is A − B. Here we need addition.') },
          { t: '(−2, 6)', ok: false, why: s('Bu qiymət komponentləri toplamaqla alınmır — x + x və y + y hesabla.', 'That value does not come from adding the components — compute x + x and y + y.') },
        ],
        hint: s('Komponentləri ayrı-ayrılıqda topla: x + x, y + y.', 'Add the components separately: x + x, y + y.'),
        explain: s('R = (2 + (−1), 3 + 2) = (1, 5). Şəkildə B, A-nın ucundan başlayır və ucu (1, 5)-də bitir.', 'R = (2 + (−1), 3 + 2) = (1, 5). In the picture B starts at the tip of A and ends at (1, 5).'),
      },
      /* 6 — reach the target (drag) */
      {
        id: 'ch6',
        level: 3,
        type: 'drag',
        q: s('A hərəkətindən sonra B hərəkətini seç ki, <b>A + B hədəfə (★) çatsın</b>. B-nin yaşıl ucunu sürüşdür.', 'After move A, choose move B so that <b>A + B reaches the target (★)</b>. Drag the green tip of B.'),
        build() {
          const A = { x: 3, y: 1 };
          const T = { x: 5, y: 4 };
          let B = { x: 1, y: 1 };
          return {
            units: 12,
            snap: 1,
            draw(p) {
              p.text('★', T, { color: C.yellow, size: 28 });
              p.arrow(O, A, C.blue, { w: 4.5, label: 'A', labelSize: 16 });
              p.arrow(A, V.add(A, B), C.green, { w: 4.5, label: 'B', labelSize: 16 });
              p.arrow(O, V.add(A, B), C.orange, { w: 3, dash: [7, 6], label: 'R' });
            },
            handles: [{ get: () => V.add(A, B), set: (x, y) => (B = { x: x - A.x, y: y - A.y }), color: C.green, r: 11 }],
            info: () => 'A = ' + vs(A) + ' · B = ' + vs(B) + ' · R = A + B = ' + vs(V.add(A, B)),
            check: () => V.equals(V.add(A, B), T, 0.01),
            wrong: () => {
              const d = V.sub(T, V.add(A, B));
              return s('Hazırda R = ' + vs(V.add(A, B)) + '. Hədəfə çatmaq üçün hələ ' + vs(d) + ' çatmır. B = hədəf − A olmalıdır.', 'Right now R = ' + vs(V.add(A, B)) + '. You are still ' + vs(d) + ' away from the target. B must be target − A.');
            },
          };
        },
        hint: s('B = hədəf − A = (5, 4) − (3, 1).', 'B = target − A = (5, 4) − (3, 1).'),
        explain: s('B = T − A = (5 − 3, 4 − 1) = (2, 3). Onda A + B = (5, 4) = hədəf.', 'B = T − A = (5 − 3, 4 − 1) = (2, 3). Then A + B = (5, 4) = the target.'),
      },
      /* 7 — subtraction choice */
      {
        id: 'ch7',
        level: 3,
        type: 'choice',
        q: s('A = (5, 4) və B = (2, 1) olduqda <b>A − B</b> nədir?', 'For A = (5, 4) and B = (2, 1), what is <b>A − B</b>?'),
        visual: { units: 14, arrows: [{ a: O, b: { x: 5, y: 4 }, color: C.blue, label: 'A' }, { a: O, b: { x: 2, y: 1 }, color: C.green, label: 'B' }, { a: { x: 2, y: 1 }, b: { x: 5, y: 4 }, color: C.orange, dash: [6, 6], w: 3 }] },
        options: [
          { t: '(3, 3)', ok: true },
          { t: '(7, 5)', ok: false, why: s('Bu, A + B-dir. Burada çıxma var.', 'That is A + B. This question asks for subtraction.') },
          { t: '(−3, −3)', ok: false, why: s('Bu, B − A-dır. Sıra vacibdir: A − B oxu B-dən A-ya gedir.', 'That is B − A. Order matters: A − B goes from B to A.') },
          { t: '(3, 5)', ok: false, why: s('Birinci komponenti düzgün çıxmısan (5 − 2 = 3), ikincini isə 4 + 1 kimi toplamısan. İkincidə də çıx: 4 − 1 = 3.', 'You subtracted the first component correctly (5 − 2 = 3) but added the second (4 + 1). Subtract it too: 4 − 1 = 3.') },
        ],
        hint: s('A − B = A + (−B). Hər komponentdən çıx.', 'A − B = A + (−B). Subtract each component.'),
        explain: s('A − B = (5 − 2, 4 − 1) = (3, 3). Şəkildəki qırıq xətt B-nin ucundan A-nın ucuna gedən oxdur — o da (3, 3)-dür.', 'A − B = (5 − 2, 4 − 1) = (3, 3). The dashed arrow in the picture goes from the tip of B to the tip of A — it is also (3, 3).'),
      },
      /* 8 — boat ground speed */
      {
        id: 'ch8',
        level: 3,
        type: 'num',
        q: s('Qayıq sudakı sürəti <b>(0, 4) m/s</b> (şimala), çayın axını isə <b>(3, 0) m/s</b> (şərqə). Qayığın sahilə nəzərən <b>sürətinin modulu</b> (m/s) nə qədərdir?', 'A boat moves at <b>(0, 4) m/s</b> (north) through water that flows at <b>(3, 0) m/s</b> (east). What is the boat’s <b>speed relative to the bank</b> (m/s)?'),
        labels: ['m/s'],
        answer: [5],
        tol: 0.01,
        hint: s('Əvvəl vektorları topla, sonra modulunu tap.', 'Add the vectors first, then find the magnitude.'),
        wrongMsg: (v) => (Math.abs(v[0] - 7) < 0.01 ? s('7 = 3 + 4 skalyar cəmdir. Sürətlər vektordur: əvvəl topla (3, 4), sonra modul √(9 + 16).', '7 = 3 + 4 is a plain sum. Velocities are vectors: add them first (3, 4), then take the magnitude √(9 + 16).') : s('Nəticəvi sürət (3, 4); modulunu hesabla: √(3² + 4²).', 'The resultant velocity is (3, 4); calculate its magnitude: √(3² + 4²).')),
        explain: s('v = (0, 4) + (3, 0) = (3, 4); |v| = √(9 + 16) = 5 m/s.', 'v = (0, 4) + (3, 0) = (3, 4); |v| = √(9 + 16) = 5 m/s.'),
      },
      /* 9 — balance forces (drag) */
      {
        id: 'ch9',
        level: 4,
        type: 'drag',
        q: s('Qutuya <b>F₁ = (3, 2)</b> və <b>F₂ = (−1, 3)</b> qüvvələri təsir edir. <b>F₃</b>-ü elə seç ki, qüvvələr <b>balansda</b> olsun (ΣF = 0).', 'Forces <b>F₁ = (3, 2)</b> and <b>F₂ = (−1, 3)</b> act on a box. Choose <b>F₃</b> so the forces are <b>balanced</b> (ΣF = 0).'),
        build() {
          const F1 = { x: 3, y: 2 };
          const F2 = { x: -1, y: 3 };
          let F3 = { x: 0, y: -2 };
          return {
            units: 14,
            snap: 1,
            draw(p) {
              p.rect(-0.5, -0.5, 0.5, 0.5, 'rgba(251,146,60,0.15)', C.orange);
              p.arrow(O, F1, C.blue, { w: 4.5, label: 'F₁', labelSize: 15 });
              p.arrow(O, F2, C.green, { w: 4.5, label: 'F₂', labelSize: 15 });
              p.arrow(O, F3, C.purple, { w: 4.5, label: 'F₃', labelSize: 15 });
              const R = V.sum([F1, F2, F3]);
              if (V.mag(R) > 0.05) p.arrow(O, R, C.orange, { w: 3, dash: [7, 6], label: 'ΣF' });
            },
            handles: [{ get: () => F3, set: (x, y) => (F3 = { x, y }), color: C.purple, r: 11 }],
            info: () => 'F₃ = ' + vs(F3) + ' · ΣF = ' + vs(V.sum([F1, F2, F3])),
            check: () => V.isZero(V.sum([F1, F2, F3]), 0.01),
            wrong: () => s('Hazırda ΣF = ' + vs(V.sum([F1, F2, F3])) + '. Balans üçün F₃ = −(F₁ + F₂) olmalıdır.', 'Right now ΣF = ' + vs(V.sum([F1, F2, F3])) + '. For balance F₃ must equal −(F₁ + F₂).'),
          };
        },
        hint: s('F₁ + F₂ = (2, 5). F₃ bunun əksi olmalıdır.', 'F₁ + F₂ = (2, 5). F₃ must be the opposite of that.'),
        explain: s('F₁ + F₂ = (2, 5), buna görə F₃ = (−2, −5). Onda ΣF = (0, 0): qutu tərpənmir.', 'F₁ + F₂ = (2, 5), so F₃ = (−2, −5). Then ΣF = (0, 0): the box stays still.'),
      },
      /* 10 — aircraft and wind (drag) */
      {
        id: 'ch10',
        level: 4,
        type: 'drag',
        q: s('Külək <b>qərbə (−4, 0)</b> əsir. Təyyarə yerə nəzərən <b>düz şimala, (0, 5)</b> getməlidir. Təyyarənin <b>havaya nəzərən</b> sürətini (mavi ucu) seç.', 'The wind blows <b>west (−4, 0)</b>. The aircraft must move <b>straight north, (0, 5)</b>, relative to the ground. Choose its velocity <b>relative to the air</b> (the blue tip).'),
        build() {
          const W = { x: -4, y: 0 };
          let a = { x: 0, y: 5 };
          const G = () => V.add(a, W);
          return {
            units: 14,
            snap: 1,
            draw(p) {
              p.dot({ x: 0, y: 5 }, C.yellow, 6);
              p.text(s('hədəf (0, 5)', 'target (0, 5)'), { x: 0, y: 5 }, { dx: 50, dy: 0, color: C.yellow, size: 12 });
              p.arrow(O, a, C.blue, { w: 4.5, label: s('hava', 'air'), labelSize: 14 });
              p.arrow(a, G(), C.cyan, { w: 4, label: s('külək', 'wind'), labelSize: 14 });
              p.arrow(O, G(), C.orange, { w: 5.5, label: s('yer', 'ground'), labelSize: 14, labelOffset: -16 });
            },
            handles: [{ get: () => a, set: (x, y) => (a = { x, y }), color: C.blue, r: 11 }],
            info: () => s('hava', 'air') + ' = ' + vs(a) + ' · ' + s('yer', 'ground') + ' = ' + s('hava + külək', 'air + wind') + ' = ' + vs(G()),
            check: () => V.equals(G(), { x: 0, y: 5 }, 0.01),
            wrong: () => s('Hazırda yerə nəzərən sürət ' + vs(G()) + '. Külək x-i −4 qədər dəyişdirir; onu ləğv etmək üçün x = +4 lazımdır.', 'Right now the ground velocity is ' + vs(G()) + '. The wind changes x by −4; to cancel it you need x = +4.'),
          };
        },
        hint: s('yer = hava + külək → hava = yer − külək.', 'ground = air + wind → air = ground − wind.'),
        explain: s('hava = (0, 5) − (−4, 0) = (4, 5). Təyyarə küləyə qarşı (şərqə) yönəlir ki, külək onu geri qaytarsın və yer üzərində düz şimala getsin.', 'air = (0, 5) − (−4, 0) = (4, 5). The aircraft aims into the wind (east) so the wind pushes it back onto a straight northward track.'),
      },
      /* 11 — path through obstacles */
      {
        id: 'ch11',
        level: 5,
        type: 'path',
        q: s('Personajı <b>S</b>-dən <b>★</b>-a çatdır. Hərəkət vektorlarını seç — <b>divarlara</b> (qırmızı) toxunma. Hərəkətlərin vektor cəmi lazım olan yerdəyişməyə bərabər olmalıdır.', 'Get the character from <b>S</b> to <b>★</b>. Pick movement vectors and avoid the <b>walls</b> (red). The vector sum of your moves must equal the needed displacement.'),
        grid: { x0: -3, x1: 3, y0: -2, y1: 2, start: { x: -3, y: -2 }, goal: { x: 3, y: 2 }, walls: [[-1, -2], [-1, -1], [-1, 0], [1, 2], [1, 1], [1, 0]] },
        moves: [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [0, 2], [1, 1], [-1, -1], [-2, 0], [0, -2]],
        hint: s('Lazım olan yerdəyişmə = ★ − S = (6, 4). Əvvəl yuxarı qalx, sonra divarların arasından keç.', 'Needed displacement = ★ − S = (6, 4). Go up first, then slip between the walls.'),
        explain: s('Məsələn: (0, 2), (0, 1), (2, 0), (1, 0), (0, −2), (2, 0), (1, 1), (0, 2) → cəm (6, 4). Əsas fikir: hərəkətlərin sırası yolu dəyişir, amma cəm həmişə eynidir.', 'For example: (0, 2), (0, 1), (2, 0), (1, 0), (0, −2), (2, 0), (1, 1), (0, 2) → sum (6, 4). Key idea: the order of the moves changes the path, but the sum is always the same.'),
      },
      /* 12 — reverse problem */
      {
        id: 'ch12',
        level: 5,
        type: 'num',
        q: s('<b>A + B = (7, 1)</b> və <b>B = (2, 4)</b> olduqda <b>A</b> vektorunu tap.', 'If <b>A + B = (7, 1)</b> and <b>B = (2, 4)</b>, find the vector <b>A</b>.'),
        labels: ['x', 'y'],
        answer: [5, -3],
        tol: 0.01,
        hint: s('A = (A + B) − B. Çıxmaq toplamanın əksidir.', 'A = (A + B) − B. Subtraction undoes addition.'),
        wrongMsg: (v) => (Math.abs(v[0] - 9) < 0.01 && Math.abs(v[1] - 5) < 0.01 ? s('(9, 5) = (A + B) + B. Burada B-ni <b>çıxmaq</b> lazımdır.', '(9, 5) = (A + B) + B. You need to <b>subtract</b> B here.') : s('Hər komponent üçün: A = (A + B) − B → 7 − 2 və 1 − 4.', 'For each component: A = (A + B) − B → 7 − 2 and 1 − 4.')),
        explain: s('A = (7, 1) − (2, 4) = (5, −3). Yoxla: (5, −3) + (2, 4) = (7, 1) ✔.', 'A = (7, 1) − (2, 4) = (5, −3). Check: (5, −3) + (2, 4) = (7, 1) ✔.'),
      },
    ];
  }

  /* ------------------------------------------------------------------ */
  function mount(host, api) {
    const D = defs();
    const wrap = el('div', 'ch');
    host.appendChild(wrap);
    let idx = Math.max(0, D.findIndex((d) => !api.get()[d.id]));
    let allDone = D.every((d) => api.get()[d.id]);
    if (allDone) idx = D.length;
    let cleanup = () => {};
    const timers = [];
    const later = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.push(id);
    };

    const total = () => D.reduce((a, d) => a + ((api.get()[d.id] || {}).pts || 0), 0);

    function strip() {
      const bar = el('div', 'ch__top');
      const dots = el('div', 'ch__strip');
      dots.setAttribute('role', 'group');
      dots.setAttribute('aria-label', t('ch.progress'));
      D.forEach((d, i) => {
        const rec = api.get()[d.id];
        const b = el('button', 'ch__dot' + (i === idx ? ' is-cur' : '') + (rec ? (rec.revealed ? ' is-rev' : ' is-done') : ''), String(i + 1));
        b.type = 'button';
        b.setAttribute('aria-label', t('ch.goto', { n: i + 1 }));
        b.addEventListener('click', () => go(i));
        dots.appendChild(b);
      });
      const sc = el('div', 'ch__score', '⭐ <b>' + total() + '</b> / ' + D.length * MAX_PTS);
      bar.append(dots, sc);
      return bar;
    }
    function go(i) {
      idx = i;
      render();
    }
    function render() {
      cleanup();
      cleanup = () => {};
      timers.splice(0).forEach(clearTimeout);
      clear(wrap);
      wrap.appendChild(strip());
      if (idx >= D.length) summary();
      else play(D[idx]);
      api.refresh && api.refresh();
    }

    /* ------------------------------ play one challenge ------------------------------ */
    function play(d) {
      const prior = api.get()[d.id];
      let wrong = 0;
      let hintUsed = false;
      let solved = !!prior;
      const card = el('section', 'card ch__card');
      const lvl = '★'.repeat(d.level) + '☆'.repeat(5 - d.level);
      card.appendChild(el('div', 'ch__meta', '<span class="badge">' + t('ch.challenge') + ' ' + (idx + 1) + ' / ' + D.length + '</span><span class="ch__lvl" title="' + t('ch.level') + '">' + lvl + '</span>'));
      card.appendChild(el('h3', 'ch__q', rich(d.q)));
      const stage = el('div', 'ch__stage');
      const area = el('div', 'ch__area');
      const info = el('div', 'ch__info');
      const fb = el('div', 'fb');
      fb.setAttribute('aria-live', 'polite');
      const bar = el('div', 'btnrow');
      card.append(stage, info, area, fb, bar);
      wrap.appendChild(card);

      const hintBtn = el('button', 'btn btn--ghost', '💡 ' + t('ch.hint'));
      hintBtn.type = 'button';
      const checkBtn = el('button', 'btn btn--accent', '✓ ' + t('ch.check'));
      checkBtn.type = 'button';
      const showBtn = el('button', 'btn btn--ghost', t('ch.show'));
      showBtn.type = 'button';
      showBtn.hidden = true;
      const prevBtn = el('button', 'btn btn--ghost', '← ' + t('ch.prev'));
      prevBtn.type = 'button';
      const nextBtn = el('button', 'btn btn--green', t('ch.next') + ' →');
      nextBtn.type = 'button';
      nextBtn.disabled = !solved;
      prevBtn.disabled = idx === 0;
      prevBtn.addEventListener('click', () => go(idx - 1));
      nextBtn.addEventListener('click', () => go(idx + 1));
      bar.append(hintBtn, checkBtn, showBtn, prevBtn, nextBtn);
      if (d.type === 'choice') checkBtn.hidden = true;

      hintBtn.addEventListener('click', () => {
        hintUsed = true;
        fb.className = 'fb info';
        fb.innerHTML = '<b>💡 ' + t('ch.hint') + ':</b> ' + rich(d.hint) + (solved ? '' : '<p class="muted small">' + t('ch.hintCost') + '</p>');
      });

      const lockInputs = () => {
        card.querySelectorAll('input,button.opt,button.mv').forEach((n) => (n.disabled = true));
        checkBtn.disabled = true;
        showBtn.hidden = true;
        nextBtn.disabled = false;
      };
      function win() {
        if (solved) return;
        solved = true;
        const pts = Math.max(20, MAX_PTS - 25 * wrong - (hintUsed ? 20 : 0));
        api.save(d.id, { pts });
        fb.className = 'fb ok';
        fb.innerHTML = '<b>✔ ' + t('ch.correct') + ' +' + pts + ' ' + t('ch.pts') + '</b><p>' + rich(d.explain) + '</p>';
        lockInputs();
        strip2();
      }
      function lose(msg) {
        if (solved) return;
        wrong++;
        fb.className = 'fb bad';
        fb.innerHTML = '<b>✗ ' + t('ch.notQuite') + '</b><p>' + (msg || '') + '</p><p class="muted small">' + t('ch.tryAgain') + '</p>';
        if (wrong >= 2) showBtn.hidden = false;
      }
      showBtn.addEventListener('click', () => {
        solved = true;
        api.save(d.id, { pts: 0, revealed: true });
        fb.className = 'fb info';
        fb.innerHTML = '<b>' + t('ch.answerIs') + '</b><p>' + rich(d.explain) + '</p>';
        lockInputs();
        strip2();
      });
      // refresh the progress strip + score after a result
      function strip2() {
        const old = wrap.querySelector('.ch__top');
        if (old) wrap.replaceChild(strip(), old);
        api.refresh && api.refresh();
      }

      if (prior) {
        fb.className = 'fb ' + (prior.revealed ? 'info' : 'ok');
        fb.innerHTML = '<b>' + (prior.revealed ? t('ch.answerIs') : '✔ ' + t('ch.solved') + ' · ' + prior.pts + ' ' + t('ch.pts')) + '</b><p>' + rich(d.explain) + '</p>';
        checkBtn.hidden = true;
        hintBtn.hidden = true;
      }

      /* ---- type: visual (static picture) ---- */
      if (d.visual) {
        const cv = el('canvas', 'ch__canvas');
        cv.setAttribute('role', 'img');
        cv.setAttribute('aria-label', t('ch.pic'));
        stage.appendChild(cv);
        const pl = VP.drawStatic(cv, d.visual);
        cleanup = ((old) => () => {
          old();
          pl.destroy();
        })(cleanup);
      }

      /* ---- type: choice ---- */
      if (d.type === 'choice') {
        const list = el('div', 'opts');
        d.options.forEach((o) => {
          const b = el('button', 'opt', rich(o.t));
          b.type = 'button';
          if (prior && o.ok) b.classList.add('is-ok');
          b.disabled = !!prior;
          b.addEventListener('click', () => {
            if (solved) return;
            if (o.ok) {
              b.classList.add('is-ok');
              win();
            } else {
              b.classList.add('is-bad');
              b.disabled = true;
              lose(o.why);
            }
          });
          list.appendChild(b);
        });
        area.appendChild(list);
      }

      /* ---- type: num ---- */
      if (d.type === 'num') {
        const row = el('div', 'numrow');
        const ins = d.labels.map((lab) => {
          const l = el('label', 'numin');
          l.appendChild(el('span', '', lab));
          const i = el('input');
          i.type = 'text';
          i.inputMode = 'decimal';
          i.autocomplete = 'off';
          i.setAttribute('aria-label', lab);
          if (prior) i.value = d.answer[d.labels.indexOf(lab)];
          l.appendChild(i);
          row.appendChild(l);
          return i;
        });
        area.appendChild(row);
        if (prior) ins.forEach((i) => (i.disabled = true));
        const submit = () => {
          if (solved) return;
          const vals = ins.map((i) => V.parse(i.value));
          if (vals.some((v) => v === null)) {
            fb.className = 'fb info';
            fb.innerHTML = '<b>' + t('ch.enterNumbers') + '</b>';
            return;
          }
          const ok = vals.every((v, k) => Math.abs(v - d.answer[k]) <= d.tol);
          if (ok) win();
          else lose(d.wrongMsg ? d.wrongMsg(vals) : '');
        };
        checkBtn.addEventListener('click', submit);
        ins.forEach((i) => i.addEventListener('keydown', (e) => e.key === 'Enter' && submit()));
      }

      /* ---- type: drag (interactive plane) ---- */
      if (d.type === 'drag') {
        const spec = d.build();
        const cv = el('canvas', 'ch__canvas');
        cv.setAttribute('role', 'img');
        cv.setAttribute('aria-label', t('sim.canvas'));
        stage.appendChild(cv);
        const upd = () => (info.textContent = spec.info());
        const plane = new VP.Plane(cv, { units: spec.units, snap: spec.snap, draw: spec.draw, onChange: () => (plane.render(), upd()) });
        plane.setHandles(spec.handles);
        upd();
        cleanup = ((old) => () => {
          old();
          plane.destroy();
        })(cleanup);
        if (prior) {
          checkBtn.hidden = true;
          plane.o.snap = 1;
        }
        checkBtn.addEventListener('click', () => {
          if (solved) return;
          if (spec.check()) win();
          else lose(spec.wrong());
        });
        if (solved) plane.handles = [];
        const lock = lockInputs;
        // freeze dragging once solved
        const freeze = () => {
          plane.handles = [];
          plane.render();
        };
        checkBtn.addEventListener('click', () => solved && freeze());
        showBtn.addEventListener('click', freeze);
        void lock;
      }

      /* ---- type: path (grid navigation) ---- */
      if (d.type === 'path') buildPath(d, { stage, area, info, checkBtn, win, lose, solved: () => solved, prior, lockInputs, later, setCleanup: (fn) => (cleanup = ((old) => () => { old(); fn(); })(cleanup)) });
    }

    /* ------------------------------ path challenge ------------------------------ */
    function buildPath(d, k) {
      const g = d.grid;
      const walls = new Set(g.walls.map((w) => w[0] + ',' + w[1]));
      const isWall = (x, y) => walls.has(x + ',' + y);
      let queue = [];
      let pos = { x: g.start.x, y: g.start.y };
      let crash = null;
      let running = false;
      const need = V.sub(g.goal, g.start);

      const cv = el('canvas', 'ch__canvas');
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', t('ch.pic'));
      k.stage.appendChild(cv);
      const plane = new VP.Plane(cv, {
        units: 9,
        axes: false,
        ticks: false,
        grid: false,
        draw(p) {
          for (let x = g.x0; x <= g.x1; x++)
            for (let y = g.y0; y <= g.y1; y++) {
              const w = isWall(x, y);
              p.rect(x - 0.5, y - 0.5, x + 0.5, y + 0.5, w ? 'rgba(248,113,113,0.45)' : 'rgba(130,170,255,0.06)', w ? C.red : 'rgba(130,170,255,0.25)');
            }
          p.text('S', g.start, { color: C.green, size: 18, weight: 800 });
          p.text('★', g.goal, { color: C.yellow, size: 26 });
          // planned path
          let q = { x: g.start.x, y: g.start.y };
          queue.forEach((m, i) => {
            const nq = V.add(q, m);
            p.arrow(q, nq, VP.palette[i % VP.palette.length], { w: 3, alpha: 0.75, head: 9 });
            q = nq;
          });
          p.ring(pos, '#fff', 13, 3);
          p.dot(pos, crash ? C.red : C.blue, 10);
        },
      });
      k.setCleanup(() => plane.destroy());
      plane.render();

      const sum = () => V.sum(queue);
      const qBox = el('div', 'legs');
      const status = () => {
        const sm = sum();
        k.info.innerHTML = t('ch.moveSum') + ' <b>' + vs(sm) + '</b> · ' + t('ch.needed') + ' <b>' + vs(need) + '</b>';
        qBox.innerHTML = queue.length ? queue.map((m, i) => '<button type="button" class="leg leg--btn" data-i="' + i + '" aria-label="' + t('ch.remove') + '">' + vs({ x: m.x, y: m.y }) + ' ✕</button>').join('<span class="plus">+</span>') : '<span class="muted">' + t('ch.noMoves') + '</span>';
        qBox.querySelectorAll('button').forEach((b) =>
          b.addEventListener('click', () => {
            if (running || k.solved()) return;
            queue.splice(+b.getAttribute('data-i'), 1);
            reset(false);
          })
        );
      };
      const reset = (clearQ) => {
        if (clearQ) queue = [];
        pos = { x: g.start.x, y: g.start.y };
        crash = null;
        status();
        plane.render();
      };
      const pal = el('div', 'palette');
      pal.setAttribute('role', 'group');
      pal.setAttribute('aria-label', t('ch.moves'));
      d.moves.forEach((m) => {
        const b = el('button', 'mv', '(' + m[0] + ', ' + m[1] + ')');
        b.type = 'button';
        b.disabled = !!k.prior;
        b.addEventListener('click', () => {
          if (running || k.solved()) return;
          queue.push({ x: m[0], y: m[1] });
          reset(false);
        });
        pal.appendChild(b);
      });
      const ctr = el('div', 'btnrow');
      const undo = el('button', 'btn btn--ghost', '⌫ ' + t('ch.undo'));
      undo.type = 'button';
      undo.addEventListener('click', () => {
        if (running || k.solved()) return;
        queue.pop();
        reset(false);
      });
      const clr = el('button', 'btn btn--ghost', t('ch.clear'));
      clr.type = 'button';
      clr.addEventListener('click', () => {
        if (running || k.solved()) return;
        reset(true);
      });
      ctr.append(undo, clr);
      k.area.append(pal, ctr, qBox);
      k.checkBtn.textContent = '▶ ' + t('ch.run');
      status();
      if (k.prior) {
        queue = [];
      }

      // Run: step through every cell of each move; stop at the first wall.
      k.checkBtn.addEventListener('click', () => {
        if (running || k.solved()) return;
        if (!queue.length) {
          k.lose(t('ch.noMoves'));
          return;
        }
        running = true;
        crash = null;
        pos = { x: g.start.x, y: g.start.y };
        const cells = [];
        let cur = { x: g.start.x, y: g.start.y };
        let hit = false;
        let hitMove = 0;
        queue.forEach((m, mi) => {
          if (hit) return;
          const n = Math.max(Math.abs(m.x), Math.abs(m.y));
          for (let i = 1; i <= n; i++) {
            const c = { x: cur.x + (m.x * i) / n, y: cur.y + (m.y * i) / n };
            const outside = c.x < g.x0 || c.x > g.x1 || c.y < g.y0 || c.y > g.y1;
            cells.push(c);
            if (outside || isWall(c.x, c.y)) {
              hit = true;
              hitMove = mi + 1;
              crash = c;
              return;
            }
          }
          cur = V.add(cur, m);
        });
        let step = 0;
        const tick = () => {
          if (step < cells.length) {
            pos = cells[step++];
            plane.render();
            k.later(tick, 220);
          } else {
            running = false;
            if (hit) {
              k.lose(t('ch.crash', { n: hitMove }) + ' ' + s('Yolu dəyiş: hərəkətlərin sırası vacibdir!', 'Change the route: the order of the moves matters!'));
            } else if (V.equals(cur, g.goal, 1e-6)) {
              k.win();
            } else {
              k.lose(t('ch.missed', { s: vs(V.sum(queue)), n: vs(need) }));
            }
          }
        };
        tick();
      });
    }

    /* ------------------------------ summary ------------------------------ */
    function summary() {
      const pts = total();
      const maxPts = D.length * MAX_PTS;
      const stars = pts >= maxPts * 0.8 ? 3 : pts >= maxPts * 0.5 ? 2 : pts >= maxPts * 0.25 ? 1 : 0;
      const card = el('section', 'card ch__summary');
      card.appendChild(el('h3', '', '🏁 ' + t('ch.finish')));
      card.appendChild(el('div', 'ch__stars', '★'.repeat(stars) + '<span class="off">' + '★'.repeat(3 - stars) + '</span>'));
      card.appendChild(el('p', 'lead', t('ch.total') + ' <b>' + pts + ' / ' + maxPts + '</b>'));
      const msg = stars === 3 ? t('ch.msg3') : stars === 2 ? t('ch.msg2') : t('ch.msg1');
      card.appendChild(el('p', '', msg));
      const tbl = el('div', 'ch__tbl');
      D.forEach((d, i) => {
        const r = api.get()[d.id] || {};
        const row = el('button', 'ch__row', '<span>' + (i + 1) + '</span><span class="ch__rowq">' + rich(d.q).replace(/<[^>]+>/g, '').slice(0, 70) + '…</span><b>' + (r.revealed ? t('ch.revealed') : (r.pts || 0) + ' ' + t('ch.pts')) + '</b>');
        row.type = 'button';
        row.addEventListener('click', () => go(i));
        tbl.appendChild(row);
      });
      card.appendChild(tbl);
      const bar = el('div', 'btnrow');
      const again = el('button', 'btn btn--accent', '↺ ' + t('ch.again'));
      again.type = 'button';
      again.addEventListener('click', () => {
        api.clear();
        idx = 0;
        render();
      });
      const nxt = el('a', 'btn btn--green', t('ch.toQuiz') + ' →');
      nxt.href = '#/m/8';
      bar.append(again, nxt);
      card.appendChild(bar);
      wrap.appendChild(card);
    }

    render();
    return {
      destroy() {
        cleanup();
        timers.splice(0).forEach(clearTimeout);
      },
    };
  }

  VP.challenges = { mount, count: 12 };
})(window);
