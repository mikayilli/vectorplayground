/*
 * app.js — routing, progress (localStorage), landing page, the generic lesson renderer,
 * language switching, tooltips and the reset dialog.
 */
(function (root) {
  'use strict';
  const VP = root.VP;
  const V = VP.Vec;
  const C = VP.colors;
  const { el, clear, store } = VP.util;
  const { t, tr, rich, s } = VP.i18n;
  const $ = (sel, scope) => (scope || document).querySelector(sel);

  /* ------------------------------------------------------------------ progress */
  const KEY = 'vp.progress.v1';
  const NUM_MODULES = 8;
  const blank = () => ({ goals: {}, challenges: {}, quiz: null, visited: {} });
  let P = Object.assign(blank(), store.get(KEY, {}));
  ['goals', 'challenges', 'visited'].forEach((k) => {
    if (!P[k] || typeof P[k] !== 'object') P[k] = {};
  });
  const persist = () => store.set(KEY, P);

  const lessonOf = (n) => VP.lessons.find((l) => l.num === n);
  function simIds(lesson) {
    const ids = [];
    const walk = (steps) => steps.forEach((st) => st.type === 'sim' && ids.push(st.id));
    if (lesson.steps) walk(lesson.steps);
    (lesson.variants || []).forEach((v) => walk(v.steps));
    return ids;
  }
  function moduleDone(n) {
    if (n <= 6) {
      const ids = simIds(lessonOf(n));
      return ids.length > 0 && ids.every((id) => P.goals[id]);
    }
    if (n === 7) return Object.keys(P.challenges).length >= VP.challenges.count;
    return !!(P.quiz && P.quiz.best !== undefined);
  }
  const doneCount = () => {
    let c = 0;
    for (let n = 1; n <= NUM_MODULES; n++) if (moduleDone(n)) c++;
    return c;
  };
  const nextModule = () => {
    for (let n = 1; n <= NUM_MODULES; n++) if (!moduleDone(n)) return n;
    return 1;
  };
  const started = () => doneCount() > 0 || Object.keys(P.goals).length > 0 || Object.keys(P.challenges).length > 0;

  function modInfo(n) {
    const l = lessonOf(n);
    if (l) return { title: tr(l.title), sub: tr(l.subtitle), color: l.color };
    return { title: t('m' + n + '.title'), sub: t('m' + n + '.sub'), color: n === 7 ? '#f472b6' : '#c4b5fd' };
  }

  /* ------------------------------------------------------------------ chrome (nav, progress pill) */
  let currentModule = 0; // 0 = home
  function buildNav() {
    const nav = $('#nav');
    clear(nav);
    const mk = (href, html, cur, title) => {
      const a = el('a', 'nav__a' + (cur ? ' is-cur' : ''), html);
      a.href = href;
      if (cur) a.setAttribute('aria-current', 'page');
      if (title) a.title = title;
      nav.appendChild(a);
    };
    mk('#/', '<span class="nav__n">⌂</span><span class="nav__t">' + t('nav.home') + '</span>', currentModule === 0);
    for (let n = 1; n <= NUM_MODULES; n++) {
      const info = modInfo(n);
      const done = moduleDone(n);
      mk('#/m/' + n, '<span class="nav__n' + (done ? ' is-done' : '') + '">' + (done ? '✓' : n) + '</span><span class="nav__t">' + info.title + '</span>', currentModule === n, info.title);
    }
  }
  function refreshChrome() {
    buildNav();
    const d = doneCount();
    $('#progText').textContent = d + ' / ' + NUM_MODULES;
    $('#progBar').style.width = (d / NUM_MODULES) * 100 + '%';
    $('#progressPill').setAttribute('aria-label', t('nav.progress') + ': ' + d + ' / ' + NUM_MODULES);
    const st = $('#modStatus');
    if (st) updateModuleStatus(st);
    document.querySelectorAll('.home-card').forEach((c) => {
      const n = +c.getAttribute('data-n');
      c.classList.toggle('is-done', moduleDone(n));
    });
  }
  // The "goals completed" chip in a lesson header
  function updateModuleStatus(node) {
    const n = currentModule;
    if (n < 1 || n > 6) return;
    const ids = simIds(lessonOf(n));
    const got = ids.filter((id) => P.goals[id]).length;
    node.className = 'mhead__status' + (got === ids.length ? ' is-done' : '');
    node.innerHTML = got === ids.length ? '✔ ' + t('lesson.complete') : '🎯 ' + t('lesson.goals', { a: got, b: ids.length });
  }

  /* ------------------------------------------------------------------ page plumbing */
  let cleanups = [];
  function destroyPage() {
    VP.sims.destroyAll();
    cleanups.forEach((fn) => fn());
    cleanups = [];
  }
  function route() {
    destroyPage();
    const m = (location.hash || '#/').match(/^#\/m\/(\d)$/);
    const n = m ? +m[1] : 0;
    currentModule = n >= 1 && n <= NUM_MODULES ? n : 0;
    if (currentModule) showModule(currentModule);
    else showHome();
    refreshChrome();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------ landing page */
  function showHome() {
    const app = $('#app');
    clear(app);
    document.title = 'Vector Playground';
    const hero = el('section', 'hero');
    const next = nextModule();
    hero.innerHTML =
      '<div class="hero__text">' +
      '<p class="eyebrow">' + t('home.eyebrow') + '</p>' +
      '<h1>Vector <span>Playground</span></h1>' +
      '<p class="hero__sub">' + t('home.sub') + '</p>' +
      '<div class="hero__cta"><a class="btn btn--accent btn--lg" id="startBtn" href="#/m/' + (started() ? next : 1) + '">' + (started() ? t('home.continue') : t('home.start')) + ' →</a>' +
      '<button class="btn btn--ghost btn--lg" id="heroEx" type="button">▶ ' + t('sim.example') + '</button></div>' +
      '<p class="muted small">' + t('home.note') + '</p></div>' +
      '<div class="hero__lab card"><div class="sim__stage hero__stage"></div><div class="readout" id="heroRo"></div><p class="muted small">' + t('home.drag') + '</p></div>';
    app.appendChild(hero);

    // interactive hero: two draggable vectors and their sum
    let A = { x: 3, y: 1 };
    let B = { x: 1, y: 3 };
    const cv = el('canvas', 'sim__canvas');
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', t('sim.canvas'));
    $('.hero__stage', hero).appendChild(cv);
    const O = { x: 0, y: 0 };
    const plane = new VP.Plane(cv, {
      units: 10,
      snap: 0.5,
      onChange: () => upd(),
      draw(p) {
        const R = V.add(A, B);
        p.arrow(O, A, C.blue, { w: 4, label: 'A', labelSize: 16 });
        p.arrow(A, R, C.green, { w: 4, label: 'B', labelSize: 16 });
        p.arrow(O, R, C.orange, { w: 6, label: 'A + B', labelSize: 15, labelOffset: -16 });
      },
    });
    plane.setHandles([
      { get: () => A, set: (x, y) => (A = { x, y }), color: C.blue, r: 11 },
      { get: () => V.add(A, B), set: (x, y) => (B = { x: x - A.x, y: y - A.y }), color: C.green, r: 11 },
    ]);
    const upd = () => {
      const R = V.add(A, B);
      $('#heroRo').innerHTML = '<span style="color:' + C.blue + '">A</span> = ' + V.fmtVec(A) + ' &nbsp; <span style="color:' + C.green + '">B</span> = ' + V.fmtVec(B) + ' &nbsp; <b style="color:' + C.orange + '">A + B = ' + V.fmtVec(R) + '</b>';
      plane.render();
    };
    upd();
    cleanups.push(() => plane.destroy());
    const presets = [[[3, 0], [2, 0]], [[3, 0], [-2, 0]], [[3, 0], [0, 4]], [[3, 1], [1, 3]]];
    let pi = 0;
    $('#heroEx').addEventListener('click', () => {
      const p = presets[pi++ % presets.length];
      A = { x: p[0][0], y: p[0][1] };
      B = { x: p[1][0], y: p[1][1] };
      upd();
    });

    // how you learn
    const how = el('section', 'how');
    how.appendChild(el('h2', '', t('home.how')));
    const ol = el('ol', 'how__list');
    ['problem', 'predict', 'experiment', 'result', 'why', 'formula', 'challenge'].forEach((k) => ol.appendChild(el('li', '', '<b>' + t('how.' + k) + '</b><span>' + t('how.' + k + '.d') + '</span>')));
    how.appendChild(ol);
    app.appendChild(how);

    // module grid
    const mods = el('section', 'modules');
    mods.appendChild(el('h2', '', t('home.modules')));
    const grid = el('div', 'modules__grid');
    for (let n = 1; n <= NUM_MODULES; n++) {
      const info = modInfo(n);
      const a = el('a', 'home-card' + (moduleDone(n) ? ' is-done' : ''), '<span class="home-card__n" style="background:' + info.color + '">' + n + '</span><span class="home-card__t">' + info.title + '</span><span class="home-card__s">' + info.sub + '</span><span class="home-card__ok">✔ ' + t('lesson.complete') + '</span>');
      a.href = '#/m/' + n;
      a.setAttribute('data-n', n);
      a.style.setProperty('--c', info.color);
      grid.appendChild(a);
    }
    mods.appendChild(grid);
    app.appendChild(mods);
  }

  /* ------------------------------------------------------------------ module page */
  function showModule(n) {
    const app = $('#app');
    clear(app);
    const info = modInfo(n);
    document.title = info.title + ' · Vector Playground';
    P.visited['m' + n] = true;
    persist();
    const head = el('section', 'mhead');
    head.style.setProperty('--c', info.color);
    head.innerHTML = '<a class="crumb" href="#/">← ' + t('nav.home') + '</a><div class="mhead__row"><span class="mhead__num">' + n + '</span><div><h1>' + info.title + '</h1><p>' + info.sub + '</p></div></div><div id="modStatus" class="mhead__status"></div>';
    app.appendChild(head);
    const body = el('div', 'mbody');
    app.appendChild(body);
    body.style.setProperty('--c', info.color);

    if (n === 7) {
      const intro = el('section', 'card');
      intro.innerHTML = '<p class="lead">' + t('m7.intro') + '</p><ul class="rules"><li>' + t('m7.r1') + '</li><li>' + t('m7.r2') + '</li><li>' + t('m7.r3') + '</li></ul>';
      body.appendChild(intro);
      const host = el('div', '');
      body.appendChild(host);
      const h = VP.challenges.mount(host, {
        get: () => P.challenges,
        save: (id, rec) => {
          P.challenges[id] = rec;
          persist();
          refreshChrome();
        },
        clear: () => {
          P.challenges = {};
          persist();
          refreshChrome();
        },
        refresh: refreshChrome,
      });
      cleanups.push(h.destroy);
    } else if (n === 8) {
      const host = el('div', '');
      body.appendChild(host);
      const h = VP.quiz.mount(host, {
        get: () => P.quiz,
        save: (r) => {
          P.quiz = r;
          persist();
          refreshChrome();
        },
        refresh: refreshChrome,
      });
      cleanups.push(h.destroy);
    } else {
      renderLesson(lessonOf(n), body);
    }

    // next / previous module
    const nav = el('div', 'pager');
    if (n > 1) nav.appendChild(el('a', 'btn btn--ghost', '← ' + modInfo(n - 1).title)).href = '#/m/' + (n - 1);
    if (n < NUM_MODULES) nav.appendChild(el('a', 'btn btn--accent', modInfo(n + 1).title + ' →')).href = '#/m/' + (n + 1);
    app.appendChild(nav);
  }

  /* ------------------------------------------------------------------ lesson renderer */
  function renderLesson(lesson, body) {
    const onGoal = (id) => () => {
      if (!P.goals[id]) {
        P.goals[id] = true;
        persist();
      }
      refreshChrome();
    };
    if (lesson.variants) {
      const tabs = el('div', 'tabs');
      tabs.setAttribute('role', 'tablist');
      const panel = el('div', 'tabpanel');
      panel.setAttribute('role', 'tabpanel');
      body.append(tabs, panel);
      const btns = lesson.variants.map((v, i) => {
        const b = el('button', 'tab', tr(v.label));
        b.type = 'button';
        b.setAttribute('role', 'tab');
        const sid = simIds({ steps: v.steps })[0];
        if (sid && P.goals[sid]) b.classList.add('is-done');
        b.addEventListener('click', () => select(i));
        tabs.appendChild(b);
        return b;
      });
      const select = (i) => {
        VP.sims.destroyAll();
        btns.forEach((b, k) => {
          b.setAttribute('aria-selected', k === i ? 'true' : 'false');
          b.classList.toggle('is-on', k === i);
          const sid = simIds({ steps: lesson.variants[k].steps })[0];
          b.classList.toggle('is-done', !!(sid && P.goals[sid]));
        });
        clear(panel);
        renderSteps(panel, lesson.variants[i].steps, onGoal);
      };
      select(0);
      // keep tab "done" badges fresh
      const tabRefresh = () => btns.forEach((b, k) => {
        const sid = simIds({ steps: lesson.variants[k].steps })[0];
        b.classList.toggle('is-done', !!(sid && P.goals[sid]));
      });
      const wrapGoal = onGoal;
      void wrapGoal;
      lesson.__tabRefresh = tabRefresh;
    } else renderSteps(body, lesson.steps, onGoal);
  }

  const STEP_LABEL = { problem: 'problem', predict: 'predict', sim: 'experiment', explain: 'why', table: 'compare', formula: 'formula', challenge: 'challenge', timeline: 'history' };

  function renderSteps(container, steps, onGoal) {
    let k = 0;
    steps.forEach((st) => {
      k++;
      const sec = el('section', 'card step step--' + st.type);
      sec.appendChild(el('div', 'step__label', '<span class="step__n">' + k + '</span>' + t('step.' + STEP_LABEL[st.type])));
      if (st.title) sec.appendChild(el('h2', 'step__title', rich(st.title)));
      container.appendChild(sec);
      ({ problem: stepText, explain: stepText, predict: stepPredict, sim: stepSim, table: stepTable, formula: stepFormula, challenge: stepChallenge, timeline: stepTimeline }[st.type])(sec, st, onGoal);
    });
  }

  function stepText(sec, st) {
    sec.appendChild(el('div', 'prose', rich(st.body)));
  }

  function stepSim(sec, st, onGoal) {
    if (st.intro) sec.appendChild(el('p', 'step__intro', rich(st.intro)));
    const host = el('div', 'simhost');
    sec.appendChild(host);
    VP.sims.mount(st.sim, host, {
      onGoal: () => {
        onGoal(st.id)();
        const lesson = VP.lessons.find((l) => l.num === currentModule);
        if (lesson && lesson.__tabRefresh) lesson.__tabRefresh();
      },
    });
  }

  function stepTable(sec, st) {
    const tb = el('table', 'cmp');
    tb.innerHTML = '<thead><tr><th>' + rich(st.head[0]) + '</th><th>' + rich(st.head[1]) + '</th></tr></thead><tbody>' + st.rows.map((r) => '<tr><td>' + rich(r[0]) + '</td><td>' + rich(r[1]) + '</td></tr>').join('') + '</tbody>';
    const w = el('div', 'tablewrap');
    w.appendChild(tb);
    sec.appendChild(w);
    if (st.note) sec.appendChild(el('p', 'note', rich(st.note)));
  }

  function stepPredict(sec, st) {
    sec.appendChild(el('p', 'predict__q', rich(st.q)));
    const list = el('div', 'opts');
    const fb = el('div', 'fb');
    fb.setAttribute('aria-live', 'polite');
    let solved = false;
    st.options.forEach((o, i) => {
      const b = el('button', 'opt', '<span class="opt__k">' + String.fromCharCode(65 + i) + '</span><span>' + rich(o.t) + '</span>');
      b.type = 'button';
      b.addEventListener('click', () => {
        if (solved) return;
        if (o.ok) {
          solved = true;
          b.classList.add('is-ok');
          list.querySelectorAll('button').forEach((x) => (x.disabled = true));
          fb.className = 'fb ok';
          fb.innerHTML = '<b>✔ ' + t('predict.right') + '</b> ' + rich(o.why) + (st.after ? '<p class="next-step">👉 ' + rich(st.after) + '</p>' : '');
        } else {
          b.classList.add('is-bad');
          b.disabled = true;
          fb.className = 'fb bad';
          fb.innerHTML = '<b>' + t('predict.wrong') + '</b> ' + rich(o.why) + '<p class="muted small">' + t('predict.tryAgain') + '</p>';
        }
      });
      list.appendChild(b);
    });
    sec.append(list, fb);
  }

  function stepFormula(sec, st) {
    st.items.forEach((it) => {
      const box = el('div', 'formula');
      box.appendChild(el('div', 'formula__label', rich(it.label)));
      box.appendChild(el('div', 'formula__tex', tr(it.tex)));
      const bar = el('div', 'btnrow');
      const why = el('div', 'formula__panel');
      why.hidden = true;
      why.innerHTML = '<b>' + t('formula.why') + '</b>' + rich(it.why);
      const ex = el('div', 'formula__panel formula__panel--ex');
      ex.hidden = true;
      ex.innerHTML = '<b>' + t('sim.example') + ':</b> ' + rich(it.example);
      const mkToggle = (label, panel, cls) => {
        const b = el('button', 'btn btn--ghost ' + cls, label);
        b.type = 'button';
        b.setAttribute('aria-expanded', 'false');
        b.addEventListener('click', () => {
          panel.hidden = !panel.hidden;
          b.setAttribute('aria-expanded', String(!panel.hidden));
          b.classList.toggle('is-on', !panel.hidden);
        });
        bar.appendChild(b);
      };
      mkToggle('? ' + t('formula.whyBtn'), why, 'btn--why');
      mkToggle('▶ ' + t('sim.example'), ex, '');
      box.append(bar, why, ex);
      sec.appendChild(box);
    });
  }

  function stepChallenge(sec, st) {
    sec.appendChild(el('p', 'predict__q', rich(st.q)));
    const fb = el('div', 'fb');
    fb.setAttribute('aria-live', 'polite');
    const bar = el('div', 'btnrow');
    let solved = false;
    const hint = el('button', 'btn btn--ghost', '💡 ' + t('ch.hint'));
    hint.type = 'button';
    hint.addEventListener('click', () => {
      fb.className = 'fb info';
      fb.innerHTML = '<b>💡 ' + t('ch.hint') + ':</b> ' + rich(st.hint);
    });
    const win = () => {
      solved = true;
      fb.className = 'fb ok';
      fb.innerHTML = '<b>✔ ' + t('ch.correct') + '</b><p>' + rich(st.explain) + '</p>';
      sec.querySelectorAll('input,button.opt').forEach((n) => (n.disabled = true));
      check && (check.disabled = true);
    };
    const lose = () => {
      fb.className = 'fb bad';
      fb.innerHTML = '<b>' + t('predict.wrong') + '</b><p>' + t('predict.tryAgain') + '</p>';
    };
    let check = null;
    if (st.kind === 'choice') {
      const list = el('div', 'opts');
      st.options.forEach((o) => {
        const b = el('button', 'opt', rich(o.t));
        b.type = 'button';
        b.addEventListener('click', () => {
          if (solved) return;
          if (o.ok) {
            b.classList.add('is-ok');
            win();
          } else {
            b.classList.add('is-bad');
            b.disabled = true;
            lose();
          }
        });
        list.appendChild(b);
      });
      sec.appendChild(list);
      bar.appendChild(hint);
    } else {
      const labels = st.kind === 'vec' ? ['x', 'y'] : ['='];
      const row = el('div', 'numrow');
      const ins = labels.map((lab) => {
        const l = el('label', 'numin');
        l.appendChild(el('span', '', lab));
        const i = el('input');
        i.type = 'text';
        i.inputMode = 'decimal';
        i.autocomplete = 'off';
        i.setAttribute('aria-label', lab);
        l.appendChild(i);
        row.appendChild(l);
        return i;
      });
      sec.appendChild(row);
      check = el('button', 'btn btn--accent', '✓ ' + t('ch.check'));
      check.type = 'button';
      const submit = () => {
        if (solved) return;
        const vals = ins.map((i) => V.parse(i.value));
        if (vals.some((v) => v === null)) {
          fb.className = 'fb info';
          fb.innerHTML = '<b>' + t('ch.enterNumbers') + '</b>';
          return;
        }
        if (vals.every((v, i) => Math.abs(v - st.answer[i]) <= st.tol)) win();
        else lose();
      };
      check.addEventListener('click', submit);
      ins.forEach((i) => i.addEventListener('keydown', (e) => e.key === 'Enter' && submit()));
      bar.append(check, hint);
    }
    sec.append(bar, fb);
  }

  function stepTimeline(sec, st) {
    const ol = el('ol', 'timeline');
    st.items.forEach((it, i) => {
      const li = el('li', 'timeline__item');
      const b = el('button', 'timeline__btn', '<span class="timeline__year">' + tr(it.year) + '</span><span class="timeline__title">' + tr(it.title) + '</span><span class="timeline__chev" aria-hidden="true">▾</span>');
      b.type = 'button';
      const body = el('div', 'timeline__body', rich(it.body));
      const open = (v) => {
        body.hidden = !v;
        b.setAttribute('aria-expanded', String(v));
        li.classList.toggle('is-open', v);
      };
      open(i === 0);
      b.addEventListener('click', () => open(body.hidden));
      li.append(b, body);
      ol.appendChild(li);
    });
    sec.appendChild(ol);
    if (st.note) sec.appendChild(el('p', 'note', rich(st.note)));
  }

  /* ------------------------------------------------------------------ tooltips */
  function initTooltips() {
    const tip = $('#tooltip');
    let cur = null;
    const show = (target) => {
      cur = target;
      tip.textContent = target.getAttribute('data-tip');
      tip.hidden = false;
      const r = target.getBoundingClientRect();
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      let left = r.left + r.width / 2 - w / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
      let top = r.top - h - 8;
      if (top < 8) top = r.bottom + 8;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
    };
    const hide = () => {
      cur = null;
      tip.hidden = true;
    };
    const find = (e) => (e.target.closest ? e.target.closest('.tip') : null);
    document.addEventListener('mouseover', (e) => {
      const x = find(e);
      if (x) show(x);
    });
    document.addEventListener('mouseout', (e) => find(e) && hide());
    document.addEventListener('focusin', (e) => {
      const x = find(e);
      if (x) show(x);
    });
    document.addEventListener('focusout', (e) => find(e) && hide());
    document.addEventListener('click', (e) => {
      const x = find(e);
      if (x) (cur === x ? hide() : show(x));
      else hide();
    });
    document.addEventListener('keydown', (e) => e.key === 'Escape' && hide());
    window.addEventListener('scroll', hide, { passive: true });
  }

  /* ------------------------------------------------------------------ language + reset */
  function syncLangButtons() {
    document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === VP.i18n.lang)));
  }
  function initChrome() {
    document.documentElement.lang = VP.i18n.lang;
    document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => VP.i18n.setLang(b.getAttribute('data-lang'))));
    VP.i18n.onChange(() => {
      syncLangButtons();
      route();
    });
    syncLangButtons();

    const dlg = $('#confirmDlg');
    $('#resetBtn').addEventListener('click', () => {
      if (dlg && dlg.showModal) dlg.showModal();
      else if (root.confirm(t('reset.text'))) doReset();
    });
    if (dlg) {
      $('#resetCancel').addEventListener('click', () => dlg.close());
      $('#resetOk').addEventListener('click', () => {
        dlg.close();
        doReset();
      });
    }
    function doReset() {
      P = blank();
      store.remove(KEY);
      persist();
      location.hash = '#/';
      route();
    }
  }

  function init() {
    VP.i18n.applyStatic(document);
    initChrome();
    initTooltips();
    window.addEventListener('hashchange', route);
    route();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
