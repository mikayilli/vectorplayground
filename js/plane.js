/*
 * plane.js — canvas coordinate plane with draggable handles.
 * Works in WORLD coordinates (maths convention, y up). All pixel conversion
 * lives here so simulations only ever talk about vectors, never pixels.
 */
(function (root) {
  'use strict';
  const VP = root.VP;
  const V = VP.Vec;

  const COLORS = {
    blue: '#4da3ff',
    cyan: '#22d3ee',
    green: '#34d399',
    orange: '#fb923c',
    purple: '#a78bfa',
    red: '#f87171',
    yellow: '#facc15',
    text: '#e6edf7',
    muted: '#8ea0bd',
    bg: '#0a1128',
  };
  VP.colors = COLORS;
  // Cycle of distinct vector colours (lab, lessons)
  VP.palette = [COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple, COLORS.cyan, COLORS.red];

  class Plane {
    constructor(canvas, opts) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.o = Object.assign(
        {
          units: 12, // visible vertical units
          ox: 0.5, // origin position as a fraction of canvas width / height
          oy: 0.5,
          snap: 0, // 0 = free dragging, otherwise grid step
          grid: true,
          axes: true,
          ticks: true,
          draw: null, // (plane) => void, called every render
          onChange: null, // (handle) => void, after a handle moved
        },
        opts || {}
      );
      this.handles = [];
      this.sel = 0;
      this.dragging = null;
      this.hasFocus = false;
      this.w = 100;
      this.h = 100;
      this.s = 10;
      this._bind();
      this.resize();
      if (typeof ResizeObserver !== 'undefined') {
        this._ro = new ResizeObserver(() => {
          this.resize();
          this.render();
        });
        this._ro.observe(canvas);
      }
    }

    destroy() {
      if (this._ro) this._ro.disconnect();
    }

    // ---------- geometry ----------
    resize() {
      const r = this.canvas.getBoundingClientRect();
      const w = Math.max(60, Math.round(r.width));
      const h = Math.max(60, Math.round(r.height));
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = w;
      this.h = h;
      this._scale();
    }
    _scale() {
      // pixels per world unit; never let the view get narrower than 0.8 * units
      this.s = Math.min(this.h / this.o.units, this.w / (this.o.units * 0.8));
    }
    setUnits(u) {
      this.o.units = u;
      this._scale();
      this.render();
    }
    X(x) {
      return this.o.ox * this.w + x * this.s;
    }
    Y(y) {
      return this.o.oy * this.h - y * this.s;
    }
    wx(px) {
      return (px - this.o.ox * this.w) / this.s;
    }
    wy(py) {
      return (this.o.oy * this.h - py) / this.s;
    }
    range() {
      return {
        xmin: -(this.o.ox * this.w) / this.s,
        xmax: ((1 - this.o.ox) * this.w) / this.s,
        ymin: -((1 - this.o.oy) * this.h) / this.s,
        ymax: (this.o.oy * this.h) / this.s,
      };
    }

    // ---------- handles & input ----------
    // handle: { get(): {x,y}, set(x, y), color, r?, enabled?(), constrain?(x,y)->{x,y}, label? }
    setHandles(list) {
      this.handles = list;
      if (this.sel >= list.length) this.sel = 0;
      this.render();
    }
    _active() {
      return this.handles.filter((h) => !h.enabled || h.enabled());
    }
    _pt(e) {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    _hit(p, touch) {
      let best = null;
      let bd = Infinity;
      for (const h of this._active()) {
        const g = h.get();
        const d = Math.hypot(this.X(g.x) - p.x, this.Y(g.y) - p.y);
        const lim = (h.r || 10) + (touch ? 16 : 7);
        if (d <= lim && d < bd) {
          best = h;
          bd = d;
        }
      }
      return best;
    }
    _apply(h, x, y) {
      const rg = this.range();
      const m = 0.25;
      x = V.clamp(x, rg.xmin + m, rg.xmax - m);
      y = V.clamp(y, rg.ymin + m, rg.ymax - m);
      if (this.o.snap > 0) {
        x = Math.round(x / this.o.snap) * this.o.snap;
        y = Math.round(y / this.o.snap) * this.o.snap;
      }
      if (h.constrain) {
        const c = h.constrain(x, y);
        x = c.x;
        y = c.y;
      }
      h.set(V.clean(x, 6), V.clean(y, 6));
      if (this.o.onChange) this.o.onChange(h);
      else this.render();
    }
    _bind() {
      const cv = this.canvas;
      cv.style.touchAction = 'none';
      if (!cv.hasAttribute('tabindex')) cv.setAttribute('tabindex', '0');
      cv.addEventListener('pointerdown', (e) => {
        const p = this._pt(e);
        const h = this._hit(p, e.pointerType === 'touch' || e.pointerType === 'pen');
        if (!h) return;
        this.dragging = h;
        this.sel = this.handles.indexOf(h);
        try {
          cv.setPointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
        cv.focus({ preventScroll: true });
        e.preventDefault();
        this._apply(h, this.wx(p.x), this.wy(p.y));
      });
      cv.addEventListener('pointermove', (e) => {
        const p = this._pt(e);
        if (this.dragging) {
          this._apply(this.dragging, this.wx(p.x), this.wy(p.y));
        } else {
          cv.style.cursor = this._hit(p, false) ? 'grab' : 'default';
        }
      });
      const end = () => {
        this.dragging = null;
      };
      cv.addEventListener('pointerup', end);
      cv.addEventListener('pointercancel', end);
      cv.addEventListener('focus', () => {
        this.hasFocus = true;
        this.render();
      });
      cv.addEventListener('blur', () => {
        this.hasFocus = false;
        this.render();
      });
      // Keyboard: arrows move the selected handle, Enter / Space picks the next handle.
      cv.addEventListener('keydown', (e) => {
        const act = this._active();
        if (!act.length) return;
        let h = this.handles[this.sel];
        if (!h || (h.enabled && !h.enabled())) {
          h = act[0];
          this.sel = this.handles.indexOf(h);
        }
        const step = this.o.snap > 0 ? this.o.snap : 0.5;
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
        if (d) {
          const g = h.get();
          this._apply(h, g.x + d[0], g.y + d[1]);
          e.preventDefault();
        } else if (e.key === 'Enter' || e.key === ' ') {
          const i = (act.indexOf(h) + 1) % act.length;
          this.sel = this.handles.indexOf(act[i]);
          this.render();
          e.preventDefault();
        }
      });
    }

    // ---------- rendering ----------
    render() {
      const c = this.ctx;
      c.clearRect(0, 0, this.w, this.h);
      if (this.o.grid) this._grid();
      if (this.o.axes) this._axes();
      if (this.o.draw) this.o.draw(this, c);
      this._drawHandles();
    }
    _grid() {
      const c = this.ctx;
      const r = this.range();
      c.lineWidth = 1;
      for (let x = Math.ceil(r.xmin); x <= Math.floor(r.xmax); x++) {
        c.strokeStyle = x % 5 === 0 ? 'rgba(130,170,255,0.20)' : 'rgba(130,170,255,0.07)';
        const px = Math.round(this.X(x)) + 0.5;
        c.beginPath();
        c.moveTo(px, 0);
        c.lineTo(px, this.h);
        c.stroke();
      }
      for (let y = Math.ceil(r.ymin); y <= Math.floor(r.ymax); y++) {
        c.strokeStyle = y % 5 === 0 ? 'rgba(130,170,255,0.20)' : 'rgba(130,170,255,0.07)';
        const py = Math.round(this.Y(y)) + 0.5;
        c.beginPath();
        c.moveTo(0, py);
        c.lineTo(this.w, py);
        c.stroke();
      }
    }
    _axes() {
      const c = this.ctx;
      const r = this.range();
      const ox = this.X(0);
      const oy = this.Y(0);
      c.strokeStyle = 'rgba(200,215,245,0.55)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, oy);
      c.lineTo(this.w, oy);
      c.moveTo(ox, 0);
      c.lineTo(ox, this.h);
      c.stroke();
      // arrow heads on the axes
      c.fillStyle = 'rgba(200,215,245,0.75)';
      c.beginPath();
      c.moveTo(this.w - 2, oy);
      c.lineTo(this.w - 11, oy - 4);
      c.lineTo(this.w - 11, oy + 4);
      c.fill();
      c.beginPath();
      c.moveTo(ox, 2);
      c.lineTo(ox - 4, 11);
      c.lineTo(ox + 4, 11);
      c.fill();
      c.font = 'italic 600 13px Georgia, serif';
      c.fillStyle = COLORS.muted;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('x', this.w - 12, oy - 13);
      c.fillText('y', ox + 13, 14);
      if (this.o.ticks) {
        const step = this.s >= 34 ? 1 : this.s >= 17 ? 2 : 5;
        c.font = '11px system-ui, sans-serif';
        c.fillStyle = 'rgba(147,164,196,0.9)';
        for (let x = Math.ceil(r.xmin); x <= Math.floor(r.xmax) - 1; x++) {
          if (x === 0 || x % step) continue;
          c.textAlign = 'center';
          c.fillText(String(x), this.X(x), V.clamp(oy + 13, 10, this.h - 6));
        }
        for (let y = Math.ceil(r.ymin); y <= Math.floor(r.ymax) - 1; y++) {
          if (y === 0 || y % step) continue;
          c.textAlign = 'right';
          c.fillText(String(y), V.clamp(ox - 6, 14, this.w - 4), this.Y(y));
        }
      }
      // origin
      c.fillStyle = COLORS.text;
      c.beginPath();
      c.arc(ox, oy, 3.5, 0, Math.PI * 2);
      c.fill();
      c.font = '600 12px system-ui, sans-serif';
      c.fillStyle = COLORS.muted;
      c.textAlign = 'right';
      c.fillText('O', ox - 7, oy + 12);
    }
    _drawHandles() {
      const c = this.ctx;
      this.handles.forEach((h, i) => {
        if (h.enabled && !h.enabled()) return;
        const g = h.get();
        const px = this.X(g.x);
        const py = this.Y(g.y);
        const r = h.r || 9;
        c.fillStyle = h.color || COLORS.blue;
        c.globalAlpha = 0.25;
        c.beginPath();
        c.arc(px, py, r + 6, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
        c.beginPath();
        c.arc(px, py, r, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = 2;
        c.strokeStyle = '#fff';
        c.stroke();
        if (this.hasFocus && i === this.sel) {
          c.setLineDash([4, 3]);
          c.strokeStyle = '#fff';
          c.beginPath();
          c.arc(px, py, r + 9, 0, Math.PI * 2);
          c.stroke();
          c.setLineDash([]);
        }
      });
    }

    // ---------- drawing helpers (world coordinates) ----------
    seg(a, b, color, w, dash) {
      const c = this.ctx;
      c.save();
      c.strokeStyle = color;
      c.lineWidth = w || 2;
      c.lineCap = 'round';
      if (dash) c.setLineDash(dash);
      c.beginPath();
      c.moveTo(this.X(a.x), this.Y(a.y));
      c.lineTo(this.X(b.x), this.Y(b.y));
      c.stroke();
      c.restore();
    }
    arrow(a, b, color, o) {
      o = o || {};
      const c = this.ctx;
      const ax = this.X(a.x);
      const ay = this.Y(a.y);
      const bx = this.X(b.x);
      const by = this.Y(b.y);
      const len = Math.hypot(bx - ax, by - ay);
      const w = o.w || 3.5;
      c.save();
      c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
      c.strokeStyle = color;
      c.fillStyle = color;
      c.lineWidth = w;
      c.lineCap = 'round';
      if (len < 2) {
        c.beginPath();
        c.arc(ax, ay, w, 0, Math.PI * 2);
        c.fill();
      } else {
        const ang = Math.atan2(by - ay, bx - ax);
        const hs = Math.min(o.head || 6 + w * 1.6, len * 0.7);
        const bxs = bx - Math.cos(ang) * hs * 0.8;
        const bys = by - Math.sin(ang) * hs * 0.8;
        if (o.dash) c.setLineDash(o.dash);
        c.beginPath();
        c.moveTo(ax, ay);
        c.lineTo(bxs, bys);
        c.stroke();
        c.setLineDash([]);
        c.beginPath();
        c.moveTo(bx, by);
        c.lineTo(bx - Math.cos(ang - 0.42) * hs, by - Math.sin(ang - 0.42) * hs);
        c.lineTo(bx - Math.cos(ang + 0.42) * hs, by - Math.sin(ang + 0.42) * hs);
        c.closePath();
        c.fill();
      }
      c.restore();
      if (o.label && len >= 2) {
        // place the label beside the middle of the arrow, on the side away from the origin of the view
        const ang = Math.atan2(by - ay, bx - ax);
        const off = o.labelOffset === undefined ? 15 : o.labelOffset;
        const mx = (ax + bx) / 2 + Math.sin(ang) * off;
        const my = (ay + by) / 2 - Math.cos(ang) * off;
        this.textPx(o.label, mx, my, { color: o.labelColor || color, size: o.labelSize || 15, weight: 700 });
      }
    }
    dot(p, color, r) {
      const c = this.ctx;
      c.fillStyle = color;
      c.beginPath();
      c.arc(this.X(p.x), this.Y(p.y), r || 4, 0, Math.PI * 2);
      c.fill();
    }
    ring(p, color, rpx, w) {
      const c = this.ctx;
      c.strokeStyle = color;
      c.lineWidth = w || 2;
      c.beginPath();
      c.arc(this.X(p.x), this.Y(p.y), rpx, 0, Math.PI * 2);
      c.stroke();
    }
    circleWorld(p, rWorld, stroke, fill, dash) {
      const c = this.ctx;
      c.save();
      c.beginPath();
      c.arc(this.X(p.x), this.Y(p.y), rWorld * this.s, 0, Math.PI * 2);
      if (fill) {
        c.fillStyle = fill;
        c.fill();
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = 2;
        if (dash) c.setLineDash(dash);
        c.stroke();
      }
      c.restore();
    }
    poly(points, fill, stroke, w, dash) {
      const c = this.ctx;
      c.save();
      c.beginPath();
      points.forEach((p, i) => (i ? c.lineTo(this.X(p.x), this.Y(p.y)) : c.moveTo(this.X(p.x), this.Y(p.y))));
      c.closePath();
      if (fill) {
        c.fillStyle = fill;
        c.fill();
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = w || 1.5;
        if (dash) c.setLineDash(dash);
        c.stroke();
      }
      c.restore();
    }
    rect(x0, y0, x1, y1, fill, stroke) {
      const c = this.ctx;
      const px = this.X(Math.min(x0, x1));
      const py = this.Y(Math.max(y0, y1));
      const pw = Math.abs(x1 - x0) * this.s;
      const ph = Math.abs(y1 - y0) * this.s;
      if (fill) {
        c.fillStyle = fill;
        c.fillRect(px, py, pw, ph);
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = 1.5;
        c.strokeRect(px, py, pw, ph);
      }
    }
    // Angle arc at `center` from angle d0 to d1 (degrees, counter-clockwise).
    arc(center, d0, d1, rpx, color, w) {
      const c = this.ctx;
      c.save();
      c.strokeStyle = color;
      c.lineWidth = w || 2;
      c.beginPath();
      c.arc(this.X(center.x), this.Y(center.y), rpx, -V.rad(d0), -V.rad(d1), d1 > d0);
      c.stroke();
      c.restore();
    }
    // Small square marking a right angle at `corner`; sx, sy are the signs of the two legs.
    rightMark(corner, sx, sy, size) {
      const c = this.ctx;
      const sz = size || 9;
      const px = this.X(corner.x);
      const py = this.Y(corner.y);
      c.save();
      c.strokeStyle = 'rgba(230,237,247,0.8)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(px + sx * sz, py);
      c.lineTo(px + sx * sz, py - sy * sz);
      c.lineTo(px, py - sy * sz);
      c.stroke();
      c.restore();
    }
    // Text at a world position (dx, dy are pixel offsets).
    text(str, p, o) {
      o = o || {};
      this.textPx(str, this.X(p.x) + (o.dx || 0), this.Y(p.y) + (o.dy || 0), o);
    }
    textPx(str, px, py, o) {
      o = o || {};
      const c = this.ctx;
      c.save();
      c.font = (o.weight || 600) + ' ' + (o.size || 13) + 'px system-ui, sans-serif';
      c.textAlign = o.align || 'center';
      c.textBaseline = o.baseline || 'middle';
      c.lineJoin = 'round';
      c.lineWidth = 4;
      c.strokeStyle = 'rgba(10,17,40,0.85)';
      c.strokeText(str, px, py);
      c.fillStyle = o.color || COLORS.text;
      c.fillText(str, px, py);
      c.restore();
    }
    // Dashed right-triangle showing the x and y components of vector v drawn from `from`.
    components(from, v, o) {
      o = o || {};
      const corner = { x: from.x + v.x, y: from.y };
      const tip = { x: from.x + v.x, y: from.y + v.y };
      this.seg(from, corner, o.colorX || COLORS.cyan, 2.2, [6, 5]);
      this.seg(corner, tip, o.colorY || COLORS.yellow, 2.2, [6, 5]);
      if (Math.abs(v.x) > 0.01 && Math.abs(v.y) > 0.01) this.rightMark(corner, v.x > 0 ? -1 : 1, v.y > 0 ? 1 : -1);
      if (o.labels !== false) {
        if (Math.abs(v.x) > 0.01) this.text(V.fmt(v.x), { x: from.x + v.x / 2, y: from.y }, { color: o.colorX || COLORS.cyan, dy: v.y >= 0 ? 15 : -15 });
        if (Math.abs(v.y) > 0.01) this.text(V.fmt(v.y), corner, { color: o.colorY || COLORS.yellow, dx: v.x >= 0 ? 16 : -16, dy: v.y > 0 ? -v.y * this.s * 0.5 : -v.y * this.s * 0.5 });
      }
    }
  }

  // Draw a static picture (no handles) from a declarative spec. Used by challenges / quiz.
  // spec: { units, ox, oy, arrows:[{a,b,color,label,dash,w}], dots:[{p,color,label}], texts:[{str,p,color}], segs:[{a,b,color,dash}], rects, circles }
  function drawStatic(canvas, spec) {
    const plane = new Plane(canvas, {
      units: spec.units || 10,
      ox: spec.ox === undefined ? 0.5 : spec.ox,
      oy: spec.oy === undefined ? 0.5 : spec.oy,
      ticks: spec.ticks !== false,
      draw(p) {
        (spec.rects || []).forEach((r) => p.rect(r.x0, r.y0, r.x1, r.y1, r.fill, r.stroke));
        (spec.segs || []).forEach((s) => p.seg(s.a, s.b, s.color || COLORS.muted, s.w || 2, s.dash));
        (spec.arrows || []).forEach((a) => p.arrow(a.a, a.b, a.color || COLORS.blue, { label: a.label, dash: a.dash, w: a.w, alpha: a.alpha }));
        (spec.dots || []).forEach((d) => {
          p.dot(d.p, d.color || COLORS.text, d.r || 5);
          if (d.label) p.text(d.label, d.p, { color: d.color || COLORS.text, dy: -14 });
        });
        (spec.texts || []).forEach((t) => p.text(t.str, t.p, { color: t.color, size: t.size, dx: t.dx, dy: t.dy }));
      },
    });
    plane.render();
    return plane;
  }

  VP.Plane = Plane;
  VP.drawStatic = drawStatic;
})(window);
