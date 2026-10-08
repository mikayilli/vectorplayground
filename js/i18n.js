/*
 * i18n.js — language state, translation helpers and the tooltip glossary.
 * UI strings live in ui-strings.js (VP.UI). Lesson content lives in lessons.js
 * as { az, en } pairs. Maths symbols are never translated.
 */
(function (root) {
  'use strict';
  const VP = root.VP;
  const { store } = VP.util;

  const LANGS = ['az', 'en'];
  let lang = store.get('vp.lang', 'az');
  if (LANGS.indexOf(lang) < 0) lang = 'az';
  const listeners = [];

  // Glossary for hover / focus tooltips. In text use {{g:key}} to get the translated, underlined term.
  const GLOSSARY = {
    vector: { az: ['vektor', 'Həm ölçüsü (uzunluğu), həm də istiqaməti olan kəmiyyət. Oxla göstərilir.'], en: ['vector', 'A quantity with both a size (length) and a direction. Drawn as an arrow.'] },
    scalar: { az: ['skalyar', 'Yalnız ölçüsü olan, istiqaməti olmayan kəmiyyət. Məsələn: vaxt, kütlə, temperatur.'], en: ['scalar', 'A quantity with a size only, no direction. For example time, mass, temperature.'] },
    magnitude: { az: ['modul', 'Vektorun uzunluğu — onun “nə qədər” olduğunu göstərir. |A| ilə yazılır.'], en: ['magnitude', 'The length of a vector: “how much” of it there is. Written |A|.'] },
    direction: { az: ['istiqamət', 'Vektorun hara baxdığı. Adətən x oxundan saat əqrəbinin əksinə ölçülən bucaqla verilir.'], en: ['direction', 'Where the vector points. Usually given as an angle measured counter-clockwise from the x-axis.'] },
    component: { az: ['komponent', 'Vektorun x oxu (üfüqi) və y oxu (şaquli) boyunca olan hissələri.'], en: ['component', 'The parts of a vector along the x-axis (horizontal) and y-axis (vertical).'] },
    origin: { az: ['koordinat başlanğıcı', 'Oxların kəsişdiyi (0, 0) nöqtəsi.'], en: ['origin', 'The point (0, 0) where the axes cross.'] },
    displacement: { az: ['yerdəyişmə', 'Başlanğıc nöqtədən son nöqtəyə çəkilən ox: nə qədər və hansı istiqamətdə yer dəyişdiyini göstərir.'], en: ['displacement', 'The arrow from the start point to the end point: how far and in which direction you moved.'] },
    distance: { az: ['qət olunan yol', 'Gedilən bütün yolun ümumi uzunluğu. İstiqaməti yoxdur (skalyardır).'], en: ['distance', 'The total length of the path travelled. It has no direction (it is a scalar).'] },
    speed: { az: ['sürət (skalyar)', 'Nə qədər tez hərəkət etdiyin — istiqamətsiz. Məsələn: 60 km/saat.'], en: ['speed', 'How fast you move, with no direction. For example 60 km/h.'] },
    velocity: { az: ['sürət vektoru', 'Sürət və istiqamət birlikdə. Məsələn: 60 km/saat şimala.'], en: ['velocity', 'Speed together with direction. For example 60 km/h north.'] },
    resultant: { az: ['nəticəvi vektor', 'Bir neçə vektorun cəminin nəticəsi — onların birgə təsirini əvəz edən tək vektor.'], en: ['resultant', 'The single vector that is the result of adding several vectors; it replaces their combined effect.'] },
    tail: { az: ['başlanğıc', 'Oxun başladığı nöqtə.'], en: ['tail', 'The point where the arrow starts.'] },
    head: { az: ['uc', 'Oxun ucu — oxun bitdiyi, ox başlığı olan nöqtə.'], en: ['head', 'The tip of the arrow, where the arrowhead is.'] },
    position: { az: ['mövqe vektoru', 'Koordinat başlanğıcından nöqtəyə çəkilən ox. Nöqtənin yerini göstərir.'], en: ['position vector', 'The arrow from the origin to a point. It tells you where the point is.'] },
    pythagoras: { az: ['Pifaqor teoremi', 'Düzbucaqlı üçbucaqda: a² + b² = c², burada c — hipotenuzdur.'], en: ['Pythagorean theorem', 'In a right triangle: a² + b² = c², where c is the hypotenuse.'] },
    netforce: { az: ['nəticəvi qüvvə', 'Cisimə təsir edən bütün qüvvələrin vektor cəmi.'], en: ['net force', 'The vector sum of all forces acting on an object.'] },
    unit: { az: ['vahid vektor', 'Uzunluğu 1 olan, yalnız istiqaməti göstərən vektor.'], en: ['unit vector', 'A vector of length 1 that only tells you a direction.'] },
    dot: { az: ['skalyar hasil', 'İki vektordan bir ədəd alınan əməl: A·B = AxBx + AyBy. (İrəli səviyyə)'], en: ['dot product', 'An operation that turns two vectors into one number: A·B = AxBx + AyBy. (Advanced)'] },
  };

  const i18n = {
    LANGS,
    get lang() {
      return lang;
    },
    setLang(l) {
      if (LANGS.indexOf(l) < 0 || l === lang) return;
      lang = l;
      store.set('vp.lang', l);
      document.documentElement.lang = l;
      i18n.applyStatic(document);
      listeners.forEach((fn) => fn(l));
    },
    onChange(fn) {
      listeners.push(fn);
    },
    // Pick the string for the current language right now.
    s: (az, en) => (lang === 'az' ? az : en),
    // Translate a { az, en } object (or pass through a plain string).
    tr(x) {
      if (x === undefined || x === null) return '';
      if (typeof x === 'string') return x;
      return x[lang] !== undefined ? x[lang] : x.az !== undefined ? x.az : x.en || '';
    },
    // UI dictionary lookup with {param} interpolation.
    t(key, params) {
      const e = VP.UI && VP.UI[key];
      if (!e) {
        if (root.console) console.warn('[i18n] missing key:', key);
        return key;
      }
      let str = e[lang] !== undefined ? e[lang] : e.en;
      if (params) str = str.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined ? params[k] : m));
      return str;
    },
    // Turn {{g:term}} into a tooltip span. Content is trusted (authored in this repo).
    rich(text) {
      return i18n.tr(text).replace(/\{\{g:(\w+)(?:\|([^}]*))?\}\}/g, (m, key, label) => {
        const g = GLOSSARY[key];
        if (!g) return label || key;
        const [name, def] = g[lang];
        return '<span class="tip" tabindex="0" role="note" data-tip="' + def.replace(/"/g, '&quot;') + '">' + (label || name) + '</span>';
      });
    },
    // Fill data-i18n / data-i18n-aria / data-i18n-title attributes in a subtree.
    applyStatic(scope) {
      scope.querySelectorAll('[data-i18n]').forEach((n) => {
        n.innerHTML = i18n.rich(i18n.t(n.getAttribute('data-i18n')));
      });
      scope.querySelectorAll('[data-i18n-aria]').forEach((n) => n.setAttribute('aria-label', i18n.t(n.getAttribute('data-i18n-aria'))));
      scope.querySelectorAll('[data-i18n-title]').forEach((n) => n.setAttribute('title', i18n.t(n.getAttribute('data-i18n-title'))));
    },
  };

  VP.i18n = i18n;
  VP.s = i18n.s;
  VP.t = i18n.t;
  VP.tr = i18n.tr;
})(window);
