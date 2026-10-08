/*
 * lessons.js — all teaching content for modules 1-6 as data (Azerbaijani + English).
 * The renderer in app.js turns these steps into the learning flow:
 *   problem → predict → experiment (sim) → explain → formula (+ Why?) → challenge
 * Text may contain light HTML and {{g:term}} glossary tooltips.
 * Modules 7 (challenges) and 8 (quiz) have their own files.
 */
(function (root) {
  'use strict';
  const VP = root.VP;
  const L = VP.L;

  const lessons = [
    /* ================================================================ 1 */
    {
      id: 'm1',
      num: 1,
      color: '#4da3ff',
      title: L('Vektor nədir?', 'What Is a Vector?'),
      subtitle: L('Ədəd kifayət etmir — istiqamət də lazımdır', 'A number is not enough — direction matters too'),
      steps: [
        {
          type: 'problem',
          title: L('Real həyat sualı', 'A real-life question'),
          body: L(
            `<p class="lead">Mən sənə deyirəm: <b>“5 metr get.”</b></p><p>Haraya getməli olduğunu bilirsən? Yəqin ki, yox: şimala? şərqə? geriyə? Bəzən yalnız <b>ədəd</b> kifayət etmir — <b>istiqamət</b> də lazımdır.</p>`,
            `<p class="lead">I tell you: <b>“Walk 5 meters.”</b></p><p>Do you know where to go? Probably not — north? east? back? Sometimes a <b>number</b> is not enough — you need a <b>direction</b> too.</p>`
          ),
        },
        {
          type: 'predict',
          q: L('5 metr getdikdən sonra neçə fərqli yerdə ola bilərsən?', 'After walking 5 meters, how many different places could you end up?'),
          options: [
            { t: L('Yalnız bir yerdə', 'Exactly one place'), ok: false, why: L('İstiqamət verilməyibsə, istənilən tərəfə gedə bilərsən.', 'If no direction is given, you can walk any way you like.') },
            { t: L('Başlanğıcdan 5 m aralıdakı sonsuz sayda nöqtənin birində', 'Any one of infinitely many points 5 m from the start'), ok: true, why: L('Düzdür! Bu nöqtələr radiusu 5 m olan çevrə əmələ gətirir.', 'Right! Those points form a circle of radius 5 m.') },
            { t: L('Heç yerdə — yerimi dəyişmirəm', 'Nowhere — I have not moved'), ok: false, why: L('5 metr getdin, yəni yerin dəyişdi.', 'You walked 5 meters, so your position did change.') },
          ],
          after: L('İndi özün yoxla: aşağıdakı təcrübədə “yalnız ‘5 m get’ de” seçimini işə sal.', 'Now test it yourself: in the experiment below, switch on “Only say walk 5 m”.'),
        },
        {
          type: 'sim',
          sim: 'walk5',
          id: 'm1-walk',
          title: L('Təcrübə: 5 metr get', 'Experiment: walk 5 meters'),
          intro: L('İstiqaməti seç, məsafəni təyin et və <b>Get!</b> düyməsini bas. Hazır nümunələrə də bax.', 'Pick a direction, set the distance and press <b>Walk!</b>. Try the ready-made examples too.'),
        },
        {
          type: 'explain',
          title: L('Nə baş verdi? Yol ≠ yerdəyişmə', 'What happened? Distance ≠ displacement'),
          body: L(
            `<p>İki fərqli sual var:</p><ul><li><b>{{g:distance}}</b> — cəmi nə qədər yol getdin? Bu, sadəcə ədəddir.</li><li><b>{{g:displacement}}</b> — başlanğıcdan sona çəkilən ox: nə qədər <b>və hansı istiqamətdə</b> yer dəyişdin?</li></ul><p>5 m şərqə, sonra 5 m qərbə getsən: yol = <b>10 m</b>, yerdəyişmə = <b>0</b>. Ayaqların yorulub, amma yerin dəyişməyib!</p>`,
            `<p>There are two different questions:</p><ul><li><b>{{g:distance}}</b> — how much ground did you cover in total? Just a number.</li><li><b>{{g:displacement}}</b> — the arrow from start to end: how far <b>and in which direction</b> did you move?</li></ul><p>Walk 5 m east and then 5 m west: distance = <b>10 m</b>, displacement = <b>0</b>. Your legs are tired, but your position has not changed!</p>`
          ),
        },
        {
          type: 'table',
          title: L('Skalyar və vektor', 'Scalar and vector'),
          head: [L('{{g:scalar}} — yalnız ölçü', '{{g:scalar}} — size only'), L('{{g:vector}} — ölçü + istiqamət', '{{g:vector}} — size + direction')],
          rows: [
            [L('Qət olunan yol: 120 m', 'Distance: 120 m'), L('Yerdəyişmə: 120 m şimala', 'Displacement: 120 m north')],
            [L('Sürət: 60 km/saat', 'Speed: 60 km/h'), L('Sürət vektoru: 60 km/saat şərqə', 'Velocity: 60 km/h east')],
            [L('Vaxt, kütlə, temperatur', 'Time, mass, temperature'), L('Qüvvə, təcil', 'Force, acceleration')],
          ],
          note: L('Hər kəmiyyət vektor deyil! Temperaturun və ya kütlənin “istiqaməti” yoxdur.', 'Not every quantity is a vector! Temperature or mass has no “direction”.'),
        },
        {
          type: 'explain',
          title: L('Vektor = modul + istiqamət', 'Vector = magnitude + direction'),
          body: L(
            `<p>{{g:vector}} iki məlumatı birləşdirir:</p><ul><li>{{g:magnitude}} — nə qədər (oxun uzunluğu)</li><li>{{g:direction}} — hara (oxun baxdığı tərəf)</li></ul><p><b>Sürət və sürət vektoru:</b> “60 km/saat” yalnız {{g:speed}}dir. “60 km/saat <b>şimala</b>” isə {{g:velocity}}dir. Maşın dairəvi yolda sabit 60 km/saat sürətlə getsə, sürəti dəyişmir, amma istiqaməti hər an dəyişdiyi üçün <b>sürət vektoru dəyişir</b>.</p>`,
            `<p>A {{g:vector}} combines two pieces of information:</p><ul><li>{{g:magnitude}} — how much (the arrow’s length)</li><li>{{g:direction}} — which way (where the arrow points)</li></ul><p><b>Speed vs. velocity:</b> “60 km/h” is only {{g:speed}}. “60 km/h <b>north</b>” is {{g:velocity}}. A car going round a circle at a steady 60 km/h keeps its speed, but its direction keeps changing — so its <b>velocity changes</b>.</p>`
          ),
        },
        {
          type: 'sim',
          sim: 'arrow',
          id: 'm1-arrow',
          title: L('Oxu sürüşdür', 'Drag the arrow'),
          intro: L('Mavi dairəni sürüşdürərək istiqaməti, sürgülərlə uzunluğu və bucağı dəyiş. Ədədlərin necə dəyişdiyinə bax.', 'Drag the blue handle to change the direction, or use the sliders for length and angle. Watch how the numbers change.'),
        },
        {
          type: 'explain',
          title: L('Komponent yazılışı', 'Component notation'),
          body: L(
            `<p>Vektoru ox kimi çəkirik, amma onu iki ədədlə də yaza bilərik: <b>A = (3, 2)</b>.</p><p>Bu o deməkdir: başlanğıcdan <b>3 vahid üfüqi</b> (sağa) və <b>2 vahid şaquli</b> (yuxarı) get. Bu iki ədəd vektorun {{g:component}}ləridir.</p><p>Oxun uzunluğu və istiqaməti bu iki ədədin içində gizlidir. Mənfi ədəd əks tərəf deməkdir: <b>(−2, 3)</b> = 2 sola, 3 yuxarı.</p>`,
            `<p>We draw a vector as an arrow, but we can also write it with two numbers: <b>A = (3, 2)</b>.</p><p>It means: from the start, go <b>3 units horizontally</b> (right) and <b>2 units vertically</b> (up). These two numbers are the vector’s {{g:component}}s.</p><p>The arrow’s length and direction are hidden inside these two numbers. A negative number means the opposite way: <b>(−2, 3)</b> = 2 left, 3 up.</p>`
          ),
        },
        {
          type: 'challenge',
          kind: 'choice',
          q: L('Hansı vektor <b>4 vahid sola</b> və <b>1 vahid yuxarı</b> hərəkət edir?', 'Which vector moves <b>4 units left</b> and <b>1 unit up</b>?'),
          options: [
            { t: '(4, 1)', ok: false },
            { t: '(−4, 1)', ok: true },
            { t: '(1, −4)', ok: false },
            { t: '(−4, −1)', ok: false },
          ],
          hint: L('Sola getmək x-in mənfi olması deməkdir.', 'Going left means x is negative.'),
          explain: L('Sol → x = −4, yuxarı → y = +1. Cavab: (−4, 1). İlk ədəd həmişə üfüqi, ikinci ədəd şaquli hərəkətdir.', 'Left → x = −4, up → y = +1. Answer: (−4, 1). The first number is always horizontal, the second vertical.'),
        },
      ],
    },

    /* ================================================================ 2 */
    {
      id: 'm2',
      num: 2,
      color: '#22d3ee',
      title: L('Vektor laboratoriyası', 'The Vector Laboratory'),
      subtitle: L('Vektorları yarat, sürüşdür və ölç', 'Create, drag and measure vectors'),
      steps: [
        {
          type: 'problem',
          title: L('Xəzinə xəritəsi', 'The treasure map'),
          body: L(
            `<p class="lead">Xəritədə yazılıb: <b>3 addım şərqə, sonra 4 addım şimala</b>.</p><p>Xəzinə sənə düz xətt boyunca nə qədər uzaqdadır?</p>`,
            `<p class="lead">The map says: <b>3 steps east, then 4 steps north</b>.</p><p>How far is the treasure from you in a straight line?</p>`
          ),
        },
        {
          type: 'predict',
          q: L('Düz xətt məsafəsi nə qədərdir?', 'What is the straight-line distance?'),
          options: [
            { t: L('7 addım', '7 steps'), ok: false, why: L('7 — getdiyin yoldur. Düz xətt daha qısadır.', '7 is the path you walk. The straight line is shorter.') },
            { t: L('5 addım', '5 steps'), ok: true, why: L('Düzdür! Səbəbini bir azdan görəcəksən.', 'Correct! You will see why in a moment.') },
            { t: L('12 addım', '12 steps'), ok: false, why: L('12 = 3 · 4 — vurmağın burada mənası yoxdur.', '12 = 3 · 4 — multiplying makes no sense here.') },
            { t: L('3,5 addım', '3.5 steps'), ok: false, why: L('Bu, 3 və 4-ün ortasıdır — amma uzunluq belə tapılmır.', 'That is the middle of 3 and 4 — but lengths are not found like that.') },
          ],
          after: L('Laboratoriyada yoxla: “3-4-5 üçbucağı” nümunəsini seç.', 'Check it in the lab: pick the “3-4-5 triangle” example.'),
        },
        {
          type: 'sim',
          sim: 'lab',
          id: 'm2-lab',
          title: L('Vektor laboratoriyası', 'Vector Laboratory'),
          intro: L('Vektorların uclarını sürüşdür. <b>Vektor əlavə et</b> ilə yenisini yarat, ✕ ilə sil. Bütün dəyərlərin dərhal dəyişdiyinə fikir ver.', 'Drag the vector tips. Use <b>Add vector</b> to create more and ✕ to remove them. Notice how all values update at once.'),
        },
        {
          type: 'explain',
          title: L('Dörd əsas anlayış', 'Four key ideas'),
          body: L(
            `<ul class="legend"><li><i style="background:#22d3ee"></i><b>X {{g:component|komponenti}}</b> — nə qədər sağa (+) və ya sola (−).</li><li><i style="background:#facc15"></i><b>Y {{g:component|komponenti}}</b> — nə qədər yuxarı (+) və ya aşağı (−).</li><li><i style="background:#4da3ff"></i><b>{{g:magnitude}}</b> — oxun uzunluğu, |A|.</li><li><i style="background:#fb923c"></i><b>{{g:direction}}</b> — x oxundan saat əqrəbinin əksinə ölçülən bucaq θ.</li></ul><p class="warn"><b>Diqqət:</b> modul komponentlərin cəmi deyil! (3, 4) üçün 3 + 4 = 7, amma ox cəmi <b>5</b> uzunluğundadır.</p>`,
            `<ul class="legend"><li><i style="background:#22d3ee"></i><b>X {{g:component}}</b> — how far right (+) or left (−).</li><li><i style="background:#facc15"></i><b>Y {{g:component}}</b> — how far up (+) or down (−).</li><li><i style="background:#4da3ff"></i><b>{{g:magnitude}}</b> — the length of the arrow, |A|.</li><li><i style="background:#fb923c"></i><b>{{g:direction}}</b> — the angle θ measured counter-clockwise from the x-axis.</li></ul><p class="warn"><b>Careful:</b> magnitude is not the sum of the components! For (3, 4), 3 + 4 = 7, but the arrow is only <b>5</b> long.</p>`
          ),
        },
        {
          type: 'formula',
          items: [
            {
              label: L('Modul (uzunluq)', 'Magnitude (length)'),
              tex: '|A| = √(x² + y²)',
              why: L(
                `<p>Vektorun komponentləri <b>düzbucaqlı üçbucağın</b> iki katetini yaradır, oxun özü isə hipotenuzdur.</p><p>{{g:pythagoras}} deyir: hipotenuz² = katet² + katet². Yəni |A|² = x² + y², buradan |A| = √(x² + y²).</p>`,
                `<p>The components form the two legs of a <b>right triangle</b>, and the arrow itself is the hypotenuse.</p><p>The {{g:pythagoras}} says: hypotenuse² = leg² + leg². So |A|² = x² + y², and therefore |A| = √(x² + y²).</p>`
              ),
              example: L('A = (3, 4): |A| = √(3² + 4²) = √(9 + 16) = √25 = <b>5</b>', 'A = (3, 4): |A| = √(3² + 4²) = √(9 + 16) = √25 = <b>5</b>'),
            },
            {
              label: L('İstiqamət (bucaq)', 'Direction (angle)'),
              tex: 'tan θ = y / x',
              why: L(
                `<p>Eyni düzbucaqlı üçbucaqda bucağın tangensi = qarşı kateti / bitişik katetə. Qarşı katet — y, bitişik katet — x.</p><p>Kalkulyatorun <b>atan2(y, x)</b> funksiyası dördbucaqları (hansı kvadrantda olduğunu) da düzgün müəyyən edir.</p>`,
                `<p>In the same right triangle, the tangent of the angle = opposite / adjacent. The opposite side is y, the adjacent side is x.</p><p>The <b>atan2(y, x)</b> function on a calculator also works out the correct quadrant for you.</p>`
              ),
              example: L('A = (3, 4): tan θ = 4/3 ≈ 1,33 → θ ≈ <b>53,1°</b>', 'A = (3, 4): tan θ = 4/3 ≈ 1.33 → θ ≈ <b>53.1°</b>'),
            },
          ],
        },
        {
          type: 'challenge',
          kind: 'num',
          q: L('A = (6, 8) vektorunun modulunu tap: |A| = ?', 'Find the magnitude of A = (6, 8): |A| = ?'),
          answer: [10],
          tol: 0.01,
          hint: L('√(6² + 8²) hesabla.', 'Calculate √(6² + 8²).'),
          explain: L('|A| = √(36 + 64) = √100 = 10. (3, 4)-ün iki misli olduğu üçün uzunluq da iki misli: 2 · 5 = 10.', '|A| = √(36 + 64) = √100 = 10. It is double (3, 4), so the length is double too: 2 · 5 = 10.'),
        },
      ],
    },

    /* ================================================================ 3 */
    {
      id: 'm3',
      num: 3,
      color: '#fb923c',
      title: L('Vektorların toplanması', 'Vector Addition'),
      subtitle: L('Birgə təsir: istiqamət hər şeyi dəyişir', 'Combined effect: direction changes everything'),
      steps: [
        {
          type: 'problem',
          title: L('Sürükləyən dost', 'The friend walking'),
          body: L(
            `<p class="lead">Dostun <b>3 addım sağa</b>, sonra <b>2 addım sola</b> gedir.</p><p>Başlanğıc nöqtəyə nəzərən haradadır? Bu iki hərəkəti necə birləşdirək?</p>`,
            `<p class="lead">Your friend walks <b>3 steps right</b>, then <b>2 steps left</b>.</p><p>Where are they relative to the start? How do we combine the two moves?</p>`
          ),
        },
        {
          type: 'predict',
          q: L('A vektoru 3 vahid sağa, B vektoru 2 vahid sola baxır. R = A + B necə olacaq?', 'A points 3 units right and B points 2 units left. What will R = A + B be?'),
          options: [
            { t: L('5 vahid sağa', '5 units right'), ok: false, why: L('Uzunluqları sadəcə toplamaq olmaz — istiqamət vacibdir.', 'You cannot just add the lengths — direction matters.') },
            { t: L('1 vahid sağa', '1 unit right'), ok: true, why: L('Düzdür: 3 sağa, 2 sola = 1 sağa.', 'Correct: 3 right and 2 left = 1 right.') },
            { t: L('1 vahid sola', '1 unit left'), ok: false, why: L('Sağa gedən hissə daha böyükdür, ona görə nəticə sağa baxır.', 'The rightward part is bigger, so the result points right.') },
            { t: L('0', '0'), ok: false, why: L('Yalnız uzunluqlar bərabər olsaydı sıfır olardı.', 'It would be zero only if the lengths were equal.') },
          ],
          after: L('İndi yoxla: “Əks istiqamət” nümunəsini seç.', 'Now check it: pick the “Opposite directions” example.'),
        },
        {
          type: 'sim',
          sim: 'add',
          id: 'm3-add',
          title: L('Vektorları topla', 'Add the vectors'),
          intro: L('A və B-nin uclarını sürüşdür. İki üsul arasında keçid et və nəticə <b>R</b>-in necə yarandığını izlə.', 'Drag the tips of A and B. Switch between the two methods and watch how the result <b>R</b> is built.'),
        },
        {
          type: 'explain',
          title: L('İki üsul, bir nəticə', 'Two methods, one result'),
          body: L(
            `<p><b>Uc-uca (head-to-tail):</b> B vektorunu elə köçür ki, onun {{g:tail}}ı A-nın {{g:head}}ına qoşulsun. {{g:resultant}} — A-nın başlanğıcından B-nin ucuna çəkilən oxdur. Bu, “əvvəl A, sonra B” hərəkətinin qısa yoludur.</p><p><b>Paraleloqram:</b> A və B eyni nöqtədən başlayır. Onlardan paraleloqram qurulur və <b>diaqonal</b> nəticəni verir. Bu, iki qüvvənin eyni anda təsirinə bənzəyir.</p><p>İki üsul <b>eyni</b> nəticəni verir, çünki paraleloqramın qarşı tərəfləri paralel və bərabərdir.</p>`,
            `<p><b>Head-to-tail:</b> move B so its {{g:tail}} sits on the {{g:head}} of A. The {{g:resultant}} is the arrow from the start of A to the end of B. It is the shortcut for “first A, then B”.</p><p><b>Parallelogram:</b> A and B start at the same point. Build a parallelogram from them and the <b>diagonal</b> is the result. It resembles two forces acting at the same time.</p><p>Both methods give the <b>same</b> result, because opposite sides of a parallelogram are parallel and equal.</p>`
          ),
        },
        {
          type: 'challenge',
          kind: 'choice',
          q: L('Uzunluqları 3 və 4 olan iki vektorun cəminin uzunluğu nə vaxt 7 olur?', 'When does the sum of two vectors of lengths 3 and 4 have length 7?'),
          options: [
            { t: L('Həmişə', 'Always'), ok: false },
            { t: L('Yalnız eyni istiqamətə baxanda', 'Only when they point in the same direction'), ok: true },
            { t: L('Heç vaxt', 'Never'), ok: false },
            { t: L('Yalnız perpendikulyar olanda', 'Only when they are perpendicular'), ok: false },
          ],
          hint: L('Eyni, əks və perpendikulyar halları simulyasiyada sına.', 'Try the same, opposite and perpendicular cases in the simulation.'),
          explain: L('Eyni istiqamət: 3 + 4 = 7. Əks istiqamət: 4 − 3 = 1. Perpendikulyar: √(3² + 4²) = 5. Vektor toplanması “istiqamətli kəmiyyətlərin birləşməsidir”.', 'Same direction: 3 + 4 = 7. Opposite: 4 − 3 = 1. Perpendicular: √(3² + 4²) = 5. Vector addition combines quantities that have direction.'),
        },
        {
          type: 'formula',
          items: [
            {
              label: L('Komponentlərlə toplama', 'Adding by components'),
              tex: 'R = A + B = (Aₓ + Bₓ, Aᵧ + Bᵧ)',
              why: L(
                `<p>Üfüqi hərəkətlər yalnız üfüqi hərəkətlərlə, şaquli hərəkətlər yalnız şaquli hərəkətlərlə birləşir — onlar bir-birindən asılı deyil.</p><p>A = (3, 1) və B = (1, 3): sağa 3 + 1 = 4, yuxarı 1 + 3 = 4. Beləliklə R = (4, 4).</p>`,
                `<p>Horizontal moves only combine with horizontal moves, and vertical with vertical — they are independent of each other.</p><p>A = (3, 1) and B = (1, 3): right 3 + 1 = 4, up 1 + 3 = 4. So R = (4, 4).</p>`
              ),
              example: L('A = (2, 3), B = (4, −1) → R = (2 + 4, 3 + (−1)) = <b>(6, 2)</b>', 'A = (2, 3), B = (4, −1) → R = (2 + 4, 3 + (−1)) = <b>(6, 2)</b>'),
            },
          ],
        },
        {
          type: 'explain',
          title: L('İstiqamət vacibdir', 'Direction matters'),
          body: L(
            `<p>Ümumi halda <b>|R| ≠ |A| + |B|</b>. Əslində həmişə |R| ≤ |A| + |B|:</p><ul><li>Eyni istiqamət → uzunluqlar <b>toplanır</b>.</li><li>Əks istiqamət → uzunluqlar <b>çıxılır</b>.</li><li>Perpendikulyar → |R| = √(|A|² + |B|²).</li></ul><p>Çünki vektor toplanması <b>istiqamətli kəmiyyətləri</b> birləşdirir, sadə ədədləri yox.</p>`,
            `<p>In general <b>|R| ≠ |A| + |B|</b>. In fact |R| ≤ |A| + |B| always:</p><ul><li>Same direction → the lengths <b>add</b>.</li><li>Opposite direction → the lengths <b>subtract</b>.</li><li>Perpendicular → |R| = √(|A|² + |B|²).</li></ul><p>That is because vector addition combines <b>quantities with direction</b>, not plain numbers.</p>`
          ),
        },
        {
          type: 'challenge',
          kind: 'vec',
          q: L('A = (2, −1) və B = (−5, 4) olduqda R = A + B = ?', 'For A = (2, −1) and B = (−5, 4), R = A + B = ?'),
          answer: [-3, 3],
          tol: 0.01,
          hint: L('x-ləri ayrıca, y-ləri ayrıca topla.', 'Add the x-values and the y-values separately.'),
          explain: L('x: 2 + (−5) = −3; y: −1 + 4 = 3. R = (−3, 3).', 'x: 2 + (−5) = −3; y: −1 + 4 = 3. R = (−3, 3).'),
        },
      ],
    },

    /* ================================================================ 4 */
    {
      id: 'm4',
      num: 4,
      color: '#a78bfa',
      title: L('Vektorların çıxılması', 'Vector Subtraction'),
      subtitle: L('Çıxmaq — əksini əlavə etməkdir', 'Subtracting is adding the opposite'),
      steps: [
        {
          type: 'problem',
          title: L('Evdən məktəbə', 'From home to school'),
          body: L(
            `<p class="lead">Xəritədə ev (A) və məktəb (B) nöqtələri var.</p><p>Evdən məktəbə getmək üçün <b>hansı hərəkəti</b> etməlisən? İki vektor arasındakı “fərqi” necə tapaq?</p>`,
            `<p class="lead">On a map you have your home (A) and your school (B).</p><p>Which <b>move</b> takes you from home to school? How do we find the “difference” between two vectors?</p>`
          ),
        },
        {
          type: 'predict',
          q: L('A vektoru 3 vahid sağa, B vektoru 2 vahid sağa baxır. A − B nədir?', 'A points 3 units right and B points 2 units right. What is A − B?'),
          options: [
            { t: L('1 vahid sağa', '1 unit right'), ok: true, why: L('Düzdür: 3 − 2 = 1 sağa.', 'Correct: 3 − 2 = 1 to the right.') },
            { t: L('5 vahid sağa', '5 units right'), ok: false, why: L('Bu, A + B olardı.', 'That would be A + B.') },
            { t: L('1 vahid sola', '1 unit left'), ok: false, why: L('Bu, B − A olardı — sıra vacibdir!', 'That would be B − A — order matters!') },
          ],
          after: L('Bəs vektorlar əks istiqamətdə olsa? Aşağıda sına.', 'What if the vectors point in opposite directions? Try it below.'),
        },
        {
          type: 'explain',
          title: L('Əsas fikir: A − B = A + (−B)', 'Key idea: A − B = A + (−B)'),
          body: L(
            `<p><b>−B</b> — B-nin <b>əks istiqamətə</b> çevrilmiş halıdır (hər iki komponentin işarəsi dəyişir). B = (1, 2) olarsa, −B = (−1, −2).</p><p>Çıxmaq elə “əksini əlavə etmək”dir: əvvəl B-ni çevir, sonra topla.</p>`,
            `<p><b>−B</b> is B turned to the <b>opposite direction</b> (both components change sign). If B = (1, 2) then −B = (−1, −2).</p><p>Subtracting is just “adding the opposite”: flip B first, then add.</p>`
          ),
        },
        {
          type: 'sim',
          sim: 'sub',
          id: 'm4-sub',
          title: L('B və −B', 'B and −B'),
          intro: L('A + B və A − B arasında keçid et. Çevrilmiş −B-nin nəticəni necə dəyişdiyinə bax.', 'Switch between A + B and A − B. See how the flipped −B changes the result.'),
        },
        {
          type: 'formula',
          items: [
            {
              label: L('Çıxma', 'Subtraction'),
              tex: 'A − B = A + (−B) = (Aₓ − Bₓ, Aᵧ − Bᵧ)',
              why: L(
                `<p>Çıxmanı toplamaya çevirdik: −B əlavə edirik. Komponentlərlə bu, sadəcə x-dən x-i, y-dən y-i çıxmaqdır.</p><p>Xüsusi hal: A = B olduqda A − B = (0, 0) — fərq yoxdur. Həm də A − B oxu <b>B-nin ucundan A-nın ucuna</b> gedir.</p>`,
                `<p>We turned subtraction into addition: we add −B. With components it simply means x minus x and y minus y.</p><p>Special case: when A = B, A − B = (0, 0) — no difference. Also, the arrow A − B goes <b>from the tip of B to the tip of A</b>.</p>`
              ),
              example: L('A = (4, 3), B = (1, 2) → A − B = (4 − 1, 3 − 2) = <b>(3, 1)</b>', 'A = (4, 3), B = (1, 2) → A − B = (4 − 1, 3 − 2) = <b>(3, 1)</b>'),
            },
          ],
        },
        {
          type: 'explain',
          title: L('Mövqe vektorları və yerdəyişmə', 'Position vectors and displacement'),
          body: L(
            `<p>Nöqtənin yerini {{g:position}}u ilə yazmaq olar — başlanğıcdan o nöqtəyə çəkilən ox.</p><p>A nöqtəsindən B nöqtəsinə gedəndə yerdəyişmə = <b>son − başlanğıc = B − A</b>. Nöqtələri sürüşdür və yerdəyişmə oxuna bax.</p>`,
            `<p>A point’s location can be written as its {{g:position}} — the arrow from the origin to that point.</p><p>Going from point A to point B, the displacement = <b>end − start = B − A</b>. Move the points and watch the displacement arrow.</p>`
          ),
        },
        {
          type: 'sim',
          sim: 'disp',
          id: 'm4-disp',
          title: L('Nöqtədən nöqtəyə', 'From point to point'),
          intro: L('A (başlanğıc) və B (son) nöqtələrini şəbəkədə sürüşdür. Yerdəyişmə oxu və komponentləri dərhal görünür.', 'Move the points A (start) and B (end) on the grid. The displacement arrow and its components update at once.'),
        },
        {
          type: 'formula',
          items: [
            {
              label: L('A-dan B-yə yerdəyişmə', 'Displacement from A to B'),
              tex: 'd = B − A',
              why: L(
                `<p>A-dan B-yə getmək üçün: əvvəl A-dan başlanğıca qayıt (−A), sonra başlanğıcdan B-yə get (+B). Cəmi: −A + B = B − A.</p><p>Qayda: <b>son − başlanğıc</b>. Əks səmtə getsən, nəticə əks işarəli olur: A − B.</p>`,
                `<p>To go from A to B: first go back from A to the origin (−A), then from the origin to B (+B). Total: −A + B = B − A.</p><p>Rule: <b>end − start</b>. Going the other way gives the opposite sign: A − B.</p>`
              ),
              example: L('A = (−4, −2), B = (3, 3) → d = (3 − (−4), 3 − (−2)) = <b>(7, 5)</b>', 'A = (−4, −2), B = (3, 3) → d = (3 − (−4), 3 − (−2)) = <b>(7, 5)</b>'),
            },
          ],
        },
        {
          type: 'challenge',
          kind: 'vec',
          q: L('P = (1, 2) nöqtəsindən Q = (5, −1) nöqtəsinə yerdəyişmə nədir?', 'What is the displacement from P = (1, 2) to Q = (5, −1)?'),
          answer: [4, -3],
          tol: 0.01,
          hint: L('Son − başlanğıc: Q − P.', 'End − start: Q − P.'),
          explain: L('Q − P = (5 − 1, −1 − 2) = (4, −3): 4 sağa, 3 aşağı.', 'Q − P = (5 − 1, −1 − 2) = (4, −3): 4 right, 3 down.'),
        },
      ],
    },

    /* ================================================================ 5 */
    {
      id: 'm5',
      num: 5,
      color: '#34d399',
      title: L('Real fizika', 'Real-World Physics'),
      subtitle: L('Vektorlar nə üçün lazımdır? Beş təcrübə', 'Why are vectors useful? Five experiments'),
      variants: [
        {
          id: 'walk',
          label: L('A · Gəzinti', 'A · Walking'),
          steps: [
            { type: 'problem', title: L('Quş və piyada', 'The bird and the walker'), body: L(`<p class="lead">Sən <b>3 blok şərqə</b>, sonra <b>4 blok şimala</b> gedirsən. Quş isə başlanğıcdan son nöqtəyə düz xətlə uçur.</p><p>Quş nə qədər məsafə qət edir?</p>`, `<p class="lead">You walk <b>3 blocks east</b>, then <b>4 blocks north</b>. A bird flies in a straight line from start to finish.</p><p>How far does the bird fly?</p>`) },
            {
              type: 'predict',
              q: L('Başlanğıc və son nöqtə arasındakı düz xətt məsafəsi nə qədərdir?', 'What is the straight-line distance between start and finish?'),
              options: [
                { t: L('7 blok', '7 blocks'), ok: false, why: L('7 — sənin getdiyin yoldur (qət olunan yol).', '7 is the path you walked (the distance).') },
                { t: L('5 blok', '5 blocks'), ok: true, why: L('Düzdür — yerdəyişmənin modulu √(3² + 4²) = 5.', 'Correct — the size of the displacement is √(3² + 4²) = 5.') },
                { t: L('1 blok', '1 block'), ok: false, why: L('4 − 3 burada mənasızdır: istiqamətlər fərqlidir.', '4 − 3 makes no sense here: the directions differ.') },
              ],
              after: L('Təcrübədə yoxla və öz yollarını qur.', 'Test it in the experiment and build your own paths.'),
            },
            { type: 'sim', sim: 'walk8', id: 'm5-walk', title: L('Təcrübə A: gəzinti', 'Experiment A: walking'), intro: L('Addımlar əlavə et və <b>qət olunan yolu</b> ilə <b>yerdəyişməni</b> müqayisə et.', 'Add steps and compare the <b>distance</b> with the <b>displacement</b>.') },
            { type: 'explain', title: L('Yol və yerdəyişmə', 'Distance and displacement'), body: L(`<p>Yol bütün addımların uzunluqlarının cəmidir (skalyar). Yerdəyişmə isə addımların <b>vektor cəmidir</b>. Yol həmişə yerdəyişmənin modulundan böyük və ya ona bərabərdir.</p><p>Qısa yolu seçən GPS elə yerdəyişməni minimuma endirməyə çalışmır — yolu minimuma endirir. İkisi fərqli məsələdir!</p>`, `<p>Distance is the sum of the lengths of all steps (a scalar). Displacement is the <b>vector sum</b> of the steps. Distance is always at least as big as the size of the displacement.</p>`) },
            { type: 'formula', items: [{ label: L('Ümumi yerdəyişmə', 'Total displacement'), tex: 'D = L₁ + L₂ + … + Lₙ', why: L(`<p>Hər addım bir vektordur. Ardıcıl addımlar uc-uca toplanır — bu, əvvəlki modulda öyrəndiyin toplama ilə eynidir.</p>`, `<p>Each step is a vector. Consecutive steps add head-to-tail — the same addition you learned in the earlier module.</p>`), example: L('(3, 0) + (0, 4) = <b>(3, 4)</b>, |D| = 5 · yol = 3 + 4 = 7', '(3, 0) + (0, 4) = <b>(3, 4)</b>, |D| = 5 · distance = 3 + 4 = 7') }] },
          ],
        },
        {
          id: 'boat',
          label: L('B · Qayıq və çay', 'B · Boat & river'),
          steps: [
            { type: 'problem', title: L('Çayı keçmək', 'Crossing the river'), body: L(`<p class="lead">Çay şərqə doğru <b>3 m/s</b> sürətlə axır. Sən qayığı düz <b>şimala</b>, <b>4 m/s</b> sürətlə sürürsən.</p><p>Düz qarşı sahilə çıxacaqsan?</p>`, `<p class="lead">The river flows east at <b>3 m/s</b>. You steer the boat straight <b>north</b> at <b>4 m/s</b>.</p><p>Will you land straight across?</p>`) },
            {
              type: 'predict',
              q: L('Qayıq harada sahilə çıxacaq?', 'Where will the boat reach the bank?'),
              options: [
                { t: L('Düz qarşıda', 'Straight across'), ok: false, why: L('Axın qayığı yanlara aparır.', 'The current carries the boat sideways.') },
                { t: L('Axın istiqamətində, aşağıda', 'Downstream, in the direction of the current'), ok: true, why: L('Düzdür — qayıq həm irəli, həm də axınla gedir.', 'Correct — the boat moves forward and with the current.') },
                { t: L('Axının əksinə, yuxarıda', 'Upstream, against the current'), ok: false, why: L('Axın qayığı yuxarı yox, aşağı aparır.', 'The current pushes the boat down, not up.') },
              ],
              after: L('«Yola sal!» düyməsi ilə izlə.', 'Watch it with the “Launch!” button.'),
            },
            { type: 'sim', sim: 'boat', id: 'm5-boat', title: L('Təcrübə B: qayıq və çay', 'Experiment B: boat and river'), intro: L('Qayığın istiqamətini və sürətini, çayın axınını dəyiş. Mavi dairəni sürüşdürə bilərsən.', 'Change the boat’s direction and speed and the current. You can drag the blue handle.') },
            { type: 'explain', title: L('Sürətlər toplanır', 'Velocities add'), body: L(`<p>Qayığın <b>sudakı</b> sürəti və suyun <b>sahilə nəzərən</b> sürəti toplanaraq qayığın <b>sahilə nəzərən</b> sürətini verir.</p><p>Çayı keçmə vaxtı yalnız <b>şaquli</b> komponentdən asılıdır. Axının yaratdığı sürüşmə = üfüqi sürət · vaxt. Axına qarşı bir az yönəlsən, üfüqi komponent ləğv olunar və düz qarşıya çıxarsan.</p>`, `<p>The boat’s velocity <b>relative to the water</b> and the water’s velocity <b>relative to the bank</b> add up to the boat’s velocity <b>relative to the bank</b>.</p><p>The crossing time depends only on the <b>vertical</b> component. The drift = horizontal speed · time. Aim slightly upstream and the horizontal parts cancel, so you land straight across.</p>`) },
            { type: 'formula', items: [{ label: L('Nəticəvi sürət', 'Resultant velocity'), tex: L('v_yer = v_qayıq + v_axın', 'v_ground = v_boat + v_current'), why: L(`<p>Sürət vektordur, ona görə iki sürət vektor kimi toplanır: komponentlər ayrıca.</p>`, `<p>Velocity is a vector, so two velocities add like vectors: component by component.</p>`), example: L('(0, 4) + (3, 0) = <b>(3, 4)</b> · sürət = √(9 + 16) = 5 m/s', '(0, 4) + (3, 0) = <b>(3, 4)</b> · speed = √(9 + 16) = 5 m/s') }] },
          ],
        },
        {
          id: 'forces',
          label: L('C · Qüvvələr', 'C · Forces'),
          steps: [
            { type: 'problem', title: L('Dartış və tarazlıq', 'Pulling and balance'), body: L(`<p class="lead">İki uşaq oyuncaq arabanı əks tərəflərə <b>eyni güclə</b> dartır.</p><p>Araba hərəkət edəcək?</p>`, `<p class="lead">Two kids pull a toy wagon in opposite directions with <b>equal force</b>.</p><p>Will the wagon move?</p>`) },
            {
              type: 'predict',
              q: L('Bərabər və əks yönlü iki qüvvənin nəticəvi qüvvəsi nədir?', 'What is the net force of two equal and opposite forces?'),
              options: [
                { t: L('Qüvvələrin cəmi (ikiqat)', 'Double the force'), ok: false, why: L('Qüvvələr əks yönlüdür, toplanmır — ləğv olunur.', 'The forces are opposite, so they cancel instead of adding.') },
                { t: L('Sıfır', 'Zero'), ok: true, why: L('Düzdür: (+F) + (−F) = 0.', 'Correct: (+F) + (−F) = 0.') },
                { t: L('Bir qüvvənin yarısı', 'Half of one force'), ok: false, why: L('Belə qayda yoxdur.', 'There is no such rule.') },
              ],
              after: L('Qüvvələrin uclarını sürüşdür və xüsusi halları sına.', 'Drag the force tips and try the special cases.'),
            },
            { type: 'sim', sim: 'forces', id: 'm5-forces', title: L('Təcrübə C: qüvvələr', 'Experiment C: forces'), intro: L('Hər qüvvənin ucunu sürüşdür. Nəticəvi qüvvəyə (narıncı) və balans vəziyyətinə bax.', 'Drag the tip of each force. Watch the net force (orange) and the balance status.') },
            { type: 'explain', title: L('Balanslı qüvvələr', 'Balanced forces'), body: L(`<p>{{g:netforce}} — bütün qüvvələrin vektor cəmidir. Əgər o <b>sıfırdırsa</b>, cisim sükunətdə qalır (və ya sabit sürətlə düz xətt üzrə hərəkət edir).</p><p><b>Sıfır nəticə ≠ sıfır qüvvə!</b> Qutuya təsir edən qüvvələr var, sadəcə onlar bir-birini ləğv edir. Uc-uca zənciri göstərsən, balans zamanı onun bağlandığını görərsən.</p>`, `<p>The {{g:netforce}} is the vector sum of all forces. If it is <b>zero</b>, the object stays at rest (or moves in a straight line at constant speed).</p><p><b>Zero net force ≠ no forces!</b> Forces act on the box; they just cancel each other. Turn on the head-to-tail chain and you will see it close up when the forces balance.</p>`) },
            { type: 'formula', items: [{ label: L('Nəticəvi qüvvə', 'Net force'), tex: 'ΣF = F₁ + F₂ + F₃ + …', why: L(`<p>Hər qüvvə vektordur; təsirlərini birləşdirmək üçün toplanır. Balans: ΣF = (0, 0).</p>`, `<p>Each force is a vector; to combine their effects we add them. Balance means ΣF = (0, 0).</p>`), example: L('(4, 0) + (−1, 3) + (−3, −3) = <b>(0, 0)</b>', '(4, 0) + (−1, 3) + (−3, −3) = <b>(0, 0)</b>') }] },
          ],
        },
        {
          id: 'air',
          label: L('D · Təyyarə və külək', 'D · Aircraft & wind'),
          steps: [
            { type: 'problem', title: L('Külək və uçuş', 'Wind and flight'), body: L(`<p class="lead">Təyyarə hava ilə müqayisədə <b>şimala</b> uçur. Eyni vaxtda <b>şərqə doğru</b> külək əsir.</p><p>Yerə nəzərən təyyarə hara gedir?</p>`, `<p class="lead">An aircraft flies <b>north</b> relative to the air. At the same time the wind blows <b>east</b>.</p><p>Where does the aircraft go relative to the ground?</p>`) },
            {
              type: 'predict',
              q: L('Yer üzərində təyyarənin trayektoriyası necə olacaq?', 'What will the aircraft’s path over the ground look like?'),
              options: [
                { t: L('Düz şimala', 'Straight north'), ok: false, why: L('Külək təyyarəni yana itələyir.', 'The wind pushes the aircraft sideways.') },
                { t: L('Şimal-şərqə doğru meylli', 'Tilted toward the north-east'), ok: true, why: L('Düzdür: şimala sürət + şərqə külək = şimal-şərq.', 'Correct: northward velocity + eastward wind = north-east.') },
                { t: L('Düz şərqə', 'Straight east'), ok: false, why: L('Təyyarənin öz sürəti də var, o da hesaba daxildir.', 'The aircraft has its own velocity too, and it counts.') },
              ],
              after: L('Küləyi dəyiş və hava limanına çatmağa çalış.', 'Change the wind and try to reach the airport.'),
            },
            { type: 'sim', sim: 'aircraft', id: 'm5-air', title: L('Təcrübə D: təyyarə və külək', 'Experiment D: aircraft and wind'), intro: L('Mavi dairə təyyarənin havaya nəzərən sürətini, açıq mavi dairə küləyi dəyişir. Narıncı ox yerə nəzərən real hərəkətdir.', 'The blue handle sets the velocity relative to the air, the cyan handle sets the wind. The orange arrow is the real motion over the ground.') },
            { type: 'explain', title: L('Kurs ≠ trayektoriya', 'Heading ≠ track'), body: L(`<p>Təyyarənin buruna baxdığı istiqamət (<b>kurs</b>) ilə yerə nəzərən getdiyi istiqamət (<b>trayektoriya</b>) fərqli ola bilər.</p><p>Pilotlar küləyə qarşı bir az yönəlir — həmin qədər üfüqi komponent külək komponentini ləğv edir.</p>`, `<p>The direction the nose points (<b>heading</b>) can be different from the direction the aircraft actually moves over the ground (<b>track</b>).</p><p>Pilots point slightly into the wind — that horizontal part cancels the wind’s horizontal part.</p>`) },
            { type: 'formula', items: [{ label: L('Yerə nəzərən sürət', 'Ground velocity'), tex: L('v_yer = v_hava + v_külək', 'v_ground = v_air + v_wind'), why: L(`<p>Eyni qayda: iki sürət vektoru toplanır. Burada təyyarənin “havaya nəzərən” sürəti ilə küləyin “yerə nəzərən” sürəti birləşir.</p>`, `<p>Same rule: two velocity vectors add. Here the aircraft’s velocity “relative to the air” and the wind’s velocity “relative to the ground” combine.</p>`), example: L('(0, 300) + (50, 0) = <b>(50, 300)</b> km/saat', '(0, 300) + (50, 0) = <b>(50, 300)</b> km/h') }] },
          ],
        },
        {
          id: 'game',
          label: L('E · Video oyun', 'E · Video games'),
          steps: [
            { type: 'problem', title: L('Oyun personajı necə hərəkət edir?', 'How does a game character move?'), body: L(`<p class="lead">Oyunda personaj saniyədə 60 dəfə yeni yerdə çəkilir.</p><p>Kompüter hər dəfə yeni yeri necə hesablayır?</p>`, `<p class="lead">In a game the character is redrawn 60 times per second.</p><p>How does the computer work out the new position each time?</p>`) },
            {
              type: 'predict',
              q: L('Oyun mühərriki personajın yeni mövqeyini necə tapır?', 'How does a game engine find the character’s new position?'),
              options: [
                { t: L('Köhnə mövqeyə sürət · vaxt vektorunu əlavə edir', 'It adds the velocity · time vector to the old position'), ok: true, why: L('Düzdür: p_yeni = p + v · Δt.', 'Correct: p_new = p + v · Δt.') },
                { t: L('Personajı təsadüfi yerə atır', 'It teleports the character randomly'), ok: false, why: L('Hərəkət hamar olmalıdır.', 'Movement has to be smooth.') },
                { t: L('Yalnız bir ədəd saxlayır, istiqaməti yox', 'It stores one number only, no direction'), ok: false, why: L('İstiqamətsiz personaj hara gedəcəyini bilməzdi.', 'Without direction the character would not know where to go.') },
              ],
              after: L('Personajı idarə et və sikkələri topla.', 'Steer the character and collect the coins.'),
            },
            { type: 'sim', sim: 'game', id: 'm5-game', title: L('Təcrübə E: video oyun', 'Experiment E: video game'), intro: L('Mavi dairəni sürüşdür (və ya klaviaturada oxlardan istifadə et — əvvəlcə kətana kliklə): bu, sürət vektorudur. Sikkələri topla!', 'Drag the blue handle (or click the canvas and use the arrow keys): it is the velocity vector. Collect the coins!') },
            { type: 'explain', title: L('Oyun mühərrikləri vektorlardan necə istifadə edir', 'How game engines use vectors'), body: L(`<ul><li><b>Mövqe</b> — vektordur: p = (x, y).</li><li><b>Hərəkət</b> — hər kadrda p = p + v · Δt.</li><li><b>Fizika</b> — qüvvələr toplanır, təcil, sonra sürət, sonra mövqe dəyişir.</li><li><b>Düzgün sürət</b> — çəpinə hərəkətdə vektoru <b>vahid vektora</b> çevirib (û = v / |v|) sürətə vururlar, yoxsa çəpinə getmək 41% sürətli olardı.</li></ul>`, `<ul><li><b>Position</b> is a vector: p = (x, y).</li><li><b>Movement</b> — each frame p = p + v · Δt.</li><li><b>Physics</b> — forces are added, which changes acceleration, then velocity, then position.</li><li><b>Fair speed</b> — for diagonal movement the vector is turned into a <b>{{g:unit}}</b> (û = v / |v|) and multiplied by the speed; otherwise diagonal movement would be 41% faster.</li></ul>`) },
            { type: 'formula', items: [{ label: L('Mövqenin yenilənməsi', 'Position update'), tex: L('p_yeni = p + v · Δt', 'p_new = p + v · Δt'), why: L(`<p>v · Δt — vektorun ədədə vurulmasıdır (skalyar vurma): vektorun istiqaməti saxlanır, uzunluğu Δt qədər dəyişir. Bu, kiçik zaman ərzindəki yerdəyişmədir.</p>`, `<p>v · Δt is a vector multiplied by a number (scalar multiplication): the direction is kept, the length is scaled by Δt. It is the displacement in a short time.</p>`), example: L('p = (1, 2), v = (3, 0), Δt = 0,5 → p_yeni = (1 + 1,5; 2 + 0) = <b>(2,5; 2)</b>', 'p = (1, 2), v = (3, 0), Δt = 0.5 → p_new = (1 + 1.5, 2 + 0) = <b>(2.5, 2)</b>') }] },
          ],
        },
      ],
    },

    /* ================================================================ 6 */
    {
      id: 'm6',
      num: 6,
      color: '#facc15',
      title: L('Vektorlar niyə mövcuddur?', 'Why Do Vectors Exist?'),
      subtitle: L('“Vektorların mövcud olmasına kim qərar verdi?”', '“Who decided that vectors should exist?”'),
      steps: [
        {
          type: 'problem',
          title: L('Böyük sual', 'The big question'),
          body: L(`<p class="lead"><b>Vektorlar haradan gəlib? Kimsə onlara “olsun” deyib?</b></p><p>Təbiətdə vektorlar “var”dırmı, yoxsa onlar insanların yaratdığı dildir?</p>`, `<p class="lead"><b>Where do vectors come from? Did someone declare “let there be vectors”?</b></p><p>Do vectors “exist” in nature, or are they a language that people created?</p>`),
        },
        {
          type: 'explain',
          title: L('Heç kim təbiətə vektor əlavə etməyib', 'Nobody added vectors to nature'),
          body: L(`<p>Cisimlər itələnəndə, külək əsəndə, biz yer dəyişəndə təbiət <b>istiqamətdən asılı</b> davranır. Bunu hamı görürdü; çətinlik onu <b>eyni qaydada, səhvsiz təsvir etməkdə</b> idi.</p><p>Vektorlar məhz bunun üçün insanların inkişaf etdirdiyi <b>riyazi alətdir</b>: həm ölçüsü, həm də istiqaməti olan kəmiyyətləri təsvir edən ortaq dil. Təbiət vektor “seçməyib” — biz istiqamətli hadisələri düzgün təsvir etmək üçün onları qurmuşuq.</p>`, `<p>When things are pushed, the wind blows or we move, nature behaves in a way that <b>depends on direction</b>. Everybody could see that; the difficulty was describing it <b>consistently and without mistakes</b>.</p><p>Vectors are the <b>mathematical tool</b> people developed for exactly that: a shared language for quantities with both a size and a direction. Nature did not “choose” vectors — we built them to describe directional phenomena properly.</p>`),
        },
        {
          type: 'explain',
          title: L('Niyə təkcə ədədlər kifayət etmir?', 'Why are plain numbers not enough?'),
          body: L(`<p>“5 metr” yeri demir. “10 N qüvvə” qutunun hara gedəcəyini demir. Eyni iki ədəd — 5 və 5 — istiqamətdən asılı olaraq 10, 0 və ya 7 verə bilər.</p><p>Ədədlər “<b>nə qədər</b>”i deyir; vektorlar “nə qədər <b>və hara</b>”nı.</p>`, `<p>“5 meters” does not say where. “A 10 N force” does not say where the box will go. The same two numbers — 5 and 5 — can give 10, 0 or 7 depending on direction.</p><p>Numbers tell you “<b>how much</b>”; vectors tell you “how much <b>and which way</b>”.</p>`),
        },
        {
          type: 'predict',
          q: L('<b>Fikir təcrübəsi:</b> İki nəfər qutunu <b>eyni qüvvə</b> ilə, amma <b>əks tərəflərdən</b> itələyir. Niyə qutu yerindən tərpənməyə bilər?', '<b>Thought experiment:</b> Two people push a box with <b>equal forces</b> from <b>opposite sides</b>. Why might the box remain still?'),
          options: [
            { t: L('Qüvvələr əks yönlü olduğu üçün bir-birini ləğv edir', 'The forces point opposite ways, so they cancel each other'), ok: true, why: L('Düzdür! Vektor cəmi sıfırdır.', 'Correct! The vector sum is zero.') },
            { t: L('Bir nəfər digərindən güclüdür', 'One person is stronger than the other'), ok: false, why: L('Qüvvələr bərabərdir.', 'The forces are equal.') },
            { t: L('Qüvvə heç vaxt cismi tərpədə bilməz', 'A force can never move an object'), ok: false, why: L('Balanssız qüvvə cismi hərəkətə gətirir.', 'An unbalanced force does move an object.') },
          ],
          after: L('İndi sınaqdan keçir: qüvvələri dəyiş və «İtələ!» düyməsini bas.', 'Now experiment: change the forces and press “Push!”.'),
        },
        { type: 'sim', sim: 'pushbox', id: 'm6-push', title: L('Qutunu itələ', 'Push the box'), intro: L('İki nəfərin qüvvəsini sürgülərlə dəyiş. Yalnız ədədlərlə və vektorlarla hesabları müqayisə et.', 'Change the two people’s forces with the sliders. Compare the numbers-only calculation with the vector calculation.') },
        {
          type: 'explain',
          title: L('Vektor izahı', 'The vector explanation'),
          body: L(`<p>Bir qüvvə sağa (<b>+5</b>), digəri sola (<b>−5</b>). Vektor cəmi: <b>(+5) + (−5) = 0</b>. Nəticə qüvvəsi sıfırdır — qutu tərpənmir.</p><p>Yalnız ədədlərlə “5 + 5 = 10” deyərdik. Bu, “10 N-lıq təsir var” kimi yanlış təəssürat yaradardı. İstiqamət olmadan fizikanı düzgün təsvir etmək mümkün deyil.</p>`, `<p>One force points right (<b>+5</b>), the other left (<b>−5</b>). The vector sum is <b>(+5) + (−5) = 0</b>. The net force is zero — the box stays still.</p><p>With plain numbers we would say “5 + 5 = 10”, giving the wrong impression that there is “10 N of effect”. Without direction we cannot describe the physics correctly.</p>`),
        },
        {
          type: 'timeline',
          title: L('Qısa tarix', 'A short history'),
          items: [
            { year: L('Qədim dövr', 'Antiquity'), title: L('Həndəsə və mexanika', 'Geometry and mechanics'), body: L('Qədim yunanlar həndəsə və mexanika (məsələn, qaldıraclar) ilə məşğul olurdu. Hərəkətləri və qüvvələri həndəsi şəkildə birləşdirmək fikirləri artıq o vaxtlar ortaya çıxırdı — hələ “vektor” sözü yox idi.', 'Ancient Greeks studied geometry and mechanics (levers, for example). Ideas about combining motions and forces geometrically were already appearing — although the word “vector” did not exist yet.') },
            { year: '1687', title: L('Nyuton', 'Newton'), body: L('Nyutonun “Principia” əsəri hərəkəti və qüvvələri riyazi dillə təsvir etdi. Orada qüvvələrin və hərəkətlərin paraleloqram qaydası ilə birləşməsi də göstərilir. Müasir vektor yazılışı hələ yox idi, amma ideya hazır idi.', 'Newton’s “Principia” described motion and forces in mathematical language. It also shows forces and motions combining by the parallelogram rule. Modern vector notation did not exist yet, but the idea was in place.') },
            { year: L('1840-cı illər', '1840s'), title: L('Hamilton və Qrassman', 'Hamilton and Grassmann'), body: L('Hamilton kvaternionları təklif etdi və “vektor” terminini bu çərçivədə işlətdi. Qrassman isə istiqamətli kəmiyyətlər üçün çox ölçülü cəbr qurdu. Hər ikisi müstəqil olaraq müasir vektor fikirlərinə töhfə verdi.', 'Hamilton introduced quaternions and used the term “vector” within that framework. Grassmann independently built a multi-dimensional algebra for directed quantities. Both contributed ideas that lead to modern vectors.') },
            { year: L('1880-ci illər', '1880s'), title: L('Gibbs və Heaviside', 'Gibbs and Heaviside'), body: L('Gibbs və Heaviside kvaternionlardan fizikaya daha əlverişli, sadə bir yazılış ayırdılar — bu gün işlətdiyimiz <b>vektor analizi</b> (skalyar və vektor hasili və s.). Fizika və mühəndislikdə istifadə olunan müasir vektor yazılışı əsasən onların işindən gəlir.', 'Gibbs and Heaviside extracted a simpler notation more suited to physics from quaternions — the <b>vector analysis</b> we use today (dot and cross products and more). The modern vector notation used in physics and engineering comes mostly from their work.') },
            { year: L('Bu gün', 'Today'), title: L('Hər yerdə', 'Everywhere'), body: L('Fizika, mühəndislik, kompüter qrafikası, video oyunlar, süni intellekt — hər yerdə vektorlardan istifadə olunur.', 'Physics, engineering, computer graphics, video games, artificial intelligence — vectors are used everywhere.') },
          ],
          note: L('Müasir vektor anlayışını tək bir nəfər icad etməyib: o, əsrlər boyu bir çox insanın töhfəsi ilə formalaşıb.', 'No single person invented the modern idea of a vector: it grew over centuries through the work of many people.'),
        },
        {
          type: 'challenge',
          kind: 'choice',
          q: L('Vektorlar haqqında hansı fikir doğrudur?', 'Which statement about vectors is correct?'),
          options: [
            { t: L('Vektorlar istiqamətli hadisələri təsvir etmək üçün insanların inkişaf etdirdiyi riyazi dildir', 'Vectors are a mathematical language people developed to describe directional phenomena'), ok: true },
            { t: L('Vektorları tək bir alim icad edib', 'A single scientist invented vectors'), ok: false },
            { t: L('Hər fiziki kəmiyyət vektordur', 'Every physical quantity is a vector'), ok: false },
          ],
          hint: L('Qısa tarixə və “skalyar” anlayışına qayıt.', 'Go back to the short history and to the idea of a scalar.'),
          explain: L('Vektor anlayışı əsrlər boyu bir çox insanın töhfəsi ilə formalaşıb. Həm də hər kəmiyyət vektor deyil: vaxt, kütlə, temperatur skalyardır.', 'The vector concept grew over centuries through the work of many people. And not every quantity is a vector: time, mass and temperature are scalars.'),
        },
      ],
    },
  ];

  VP.lessons = lessons;
})(window);
