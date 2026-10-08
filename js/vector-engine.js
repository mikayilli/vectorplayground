/*
 * vector-engine.js — pure vector math. No DOM, no rendering.
 * Vectors are plain objects { x, y }. Every function returns a NEW object
 * and never mutates its inputs. Y axis points UP (standard maths convention).
 */
(function (root) {
  'use strict';

  const EPS = 1e-9;
  const toNum = (n) => (Number.isFinite(+n) ? +n : 0);
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;

  // Removes floating-point dust (1e-17) and the "-0" artefact.
  function clean(n, digits) {
    const p = Math.pow(10, digits === undefined ? 10 : digits);
    const r = Math.round(toNum(n) * p) / p;
    return r === 0 ? 0 : r;
  }

  const Vec = {
    EPS,

    create: (x, y) => ({ x: toNum(x), y: toNum(y) }),
    clone: (v) => ({ x: v.x, y: v.y }),
    zero: () => ({ x: 0, y: 0 }),

    add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
    sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
    neg: (v) => ({ x: -v.x || 0, y: -v.y || 0 }),
    scale: (v, k) => ({ x: v.x * k, y: v.y * k }),
    sum: (list) => list.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 }),
    lerp: (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }),

    mag: (v) => Math.hypot(v.x, v.y),
    magSq: (v) => v.x * v.x + v.y * v.y,
    dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
    isZero: (v, eps) => Math.hypot(v.x, v.y) < (eps === undefined ? EPS : eps),
    equals: (a, b, eps) => Math.hypot(a.x - b.x, a.y - b.y) < (eps === undefined ? 1e-6 : eps),

    // Unit vector. A zero-length vector has no direction, so we return (0, 0)
    // instead of dividing by zero and producing NaN.
    normalize(v) {
      const m = Math.hypot(v.x, v.y);
      return m < EPS ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
    },

    // Dot product (optional advanced content).
    dot: (a, b) => a.x * b.x + a.y * b.y,

    // Angle between two vectors in degrees [0, 180]; null if either is zero.
    angleBetween(a, b) {
      const ma = Math.hypot(a.x, a.y);
      const mb = Math.hypot(b.x, b.y);
      if (ma < EPS || mb < EPS) return null;
      // atan2(|cross|, dot) is numerically stable. acos(dot / (|a||b|)) loses precision near
      // 0° and 180° (and can even receive a cosine slightly outside [-1, 1] and return NaN).
      const cross = a.x * b.y - a.y * b.x;
      return clean(deg(Math.atan2(Math.abs(cross), a.x * b.x + a.y * b.y)), 8);
    },

    // Polar <-> Cartesian. Angles are in degrees, counter-clockwise from +x.
    toPolar(v) {
      const r = Math.hypot(v.x, v.y);
      if (r < EPS) return { r: 0, deg: 0 };
      let d = deg(Math.atan2(v.y, v.x));
      if (d < 0) d += 360;
      d = clean(d, 8);
      return { r, deg: d >= 360 ? 0 : d };
    },
    angleDeg: (v) => Vec.toPolar(v).deg,
    fromPolar: (r, d) => ({ x: clean(toNum(r) * Math.cos(rad(d)), 12), y: clean(toNum(r) * Math.sin(rad(d)), 12) }),

    // Compass bearing: 0 = north, 90 = east (clockwise). Used for aviation / navigation.
    bearing(v) {
      if (Vec.isZero(v)) return 0;
      const b = 90 - Vec.toPolar(v).deg;
      return clean(((b % 360) + 360) % 360, 8);
    },

    // Total length of a polyline vs. straight-line displacement (distance vs displacement).
    pathLength(points) {
      let s = 0;
      for (let i = 1; i < points.length; i++) s += Vec.dist(points[i - 1], points[i]);
      return s;
    },
    displacement: (points) => (points.length < 2 ? { x: 0, y: 0 } : Vec.sub(points[points.length - 1], points[0])),

    // ---- number helpers ----
    clean,
    clamp: (n, lo, hi) => Math.min(hi, Math.max(lo, n)),
    rad,
    deg,
    // Format a number: max `d` decimals, no trailing zeros, no "-0".
    fmt(n, d) {
      const v = clean(n, d === undefined ? 1 : d);
      return String(v);
    },
    fmtVec(v, d) {
      return '(' + Vec.fmt(v.x, d) + ', ' + Vec.fmt(v.y, d) + ')';
    },
    // Safe number parsing for user input (accepts "2,5"). Returns null when invalid.
    parse(value) {
      if (typeof value === 'number') return Number.isFinite(value) ? value : null;
      const n = parseFloat(String(value).trim().replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    },
  };

  root.VP = root.VP || {};
  root.VP.Vec = Vec;
  if (typeof module !== 'undefined' && module.exports) module.exports = Vec;
})(typeof window !== 'undefined' ? window : globalThis);
