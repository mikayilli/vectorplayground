/* util.js — tiny DOM / storage helpers shared by every module. */
(function (root) {
  'use strict';
  const VP = (root.VP = root.VP || {});

  const util = {
    // Create an element: el('div', 'card', '<b>html</b>', {attr: value})
    el(tag, cls, html, attrs) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html !== undefined && html !== null) e.innerHTML = html;
      if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    },
    clear(node) {
      while (node.firstChild) node.removeChild(node.firstChild);
    },
    // localStorage can throw (private mode, blocked cookies) — never let that break the app.
    store: {
      get(key, fallback) {
        try {
          const raw = localStorage.getItem(key);
          return raw === null ? fallback : JSON.parse(raw);
        } catch (e) {
          return fallback;
        }
      },
      set(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          /* ignore */
        }
      },
      remove(key) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          /* ignore */
        }
      },
    },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    // Escape text that came from the user before putting it in innerHTML.
    esc(str) {
      return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    // Build a bilingual object: L('az text', 'en text')
    L: (az, en) => ({ az, en }),
  };

  VP.util = util;
  VP.L = util.L;
})(window);
