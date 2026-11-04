/* Visual scenes: a seated figure in lotus posture plus step-by-step animations.
   Each scene: { steps: n, render(step) -> { svg, cap } }.  Uses helpers from app.js (window.PKH). */
(function () {
  'use strict';
  var PK = window.PK;
  function H() { return window.PKH; }
  function sa(k) { return H().saOf(k); }
  function gl(k) { return H().glossOf(k); }
  function esc(s) { return H().esc(s); }
  function tx(a) { return H().tx(a); }
  function ui(k) { return H().ui(k); }
  function E(id) { for (var i = 0; i < PK.ELEMENTS.length; i++) if (PK.ELEMENTS[i].id === id) return PK.ELEMENTS[i]; }

  var VB = '-20 -24 440 468';
  var SAT = '#E8B93C', RAJ = '#D2553A', TAM = '#5B5F86', GOLD = '#F4C430';

  /* ---------- The figure ---------- */
  var SHAPES =
    '<path d="M58 354 C56 318 130 298 200 304 C270 298 344 318 342 354 C342 384 282 390 200 382 C118 390 58 384 58 354 Z"/>' +
    '<path d="M154 158 C140 196 152 246 158 308 L242 308 C248 246 260 196 246 158 C232 144 168 144 154 158 Z"/>' +
    '<path d="M156 160 C130 170 117 214 117 256 C117 288 104 312 96 334 L116 344 C130 318 141 292 141 262 C141 230 147 205 162 184 Z"/>' +
    '<path style="transform-origin:0 0;transform-box:view-box" transform="translate(400 0) scale(-1 1)" d="M156 160 C130 170 117 214 117 256 C117 288 104 312 96 334 L116 344 C130 318 141 292 141 262 C141 230 147 205 162 184 Z"/>' +
    '<ellipse cx="104" cy="340" rx="13" ry="9"/><ellipse cx="296" cy="340" rx="13" ry="9"/>' +
    '<rect x="186" y="116" width="28" height="38" rx="10"/>' +
    '<ellipse cx="200" cy="88" rx="31" ry="37"/><ellipse cx="200" cy="50" rx="15" ry="12"/>';
  var DETAILS =
    '<path d="M118 352 C150 336 250 336 282 352"/><path d="M140 340 C160 330 180 332 196 340"/><path d="M260 340 C240 330 220 332 204 340"/>' +
    '<path d="M193 110 q7 4 14 0"/>';
  var EYES_CLOSED = '<path d="M182 90 q7 5 13 0 M205 90 q7 5 13 0"/>';
  var EYES_OPEN = '<ellipse cx="188" cy="89" rx="5" ry="4"/><ellipse cx="212" cy="89" rx="5" ry="4"/><circle cx="188" cy="89" r="2" class="pupil"/><circle cx="212" cy="89" r="2" class="pupil"/>';

  // o: { aura:[{w,color,cls,op}], fill, line, eyes:'open'|'closed'|'none', cls, dim, outlineOnly }
  function figure(o) {
    o = o || {};
    var s = '<g class="figure ' + (o.cls || '') + '">';
    (o.aura || []).forEach(function (a, i) {
      s += '<g class="aura ' + (a.cls || '') + '" style="--i:' + i + '" fill="' + a.color + '" stroke="' + a.color + '" stroke-width="' + a.w + '" stroke-linejoin="round" opacity="' + (a.op === undefined ? 1 : a.op) + '">' + SHAPES + '</g>';
    });
    if (!o.noBody) {
      s += '<g class="fig-line" stroke-width="7" stroke-linejoin="round"' + (o.line ? ' style="fill:' + o.line + ';stroke:' + o.line + '"' : '') + (o.dash ? ' stroke-dasharray="6 7" fill="none"' : '') + '>' + SHAPES + '</g>';
      if (!o.outlineOnly) s += '<g class="fig-fill"' + (o.fill ? ' style="fill:' + o.fill + '"' : '') + '>' + SHAPES + '</g>';
      s += '<g class="fig-detail">' + DETAILS + (o.eyes === 'open' ? '' : o.eyes === 'none' ? '' : EYES_CLOSED) + '</g>';
      if (o.eyes === 'open') s += '<g class="fig-eyes">' + EYES_OPEN + '</g>';
    }
    return s + '</g>';
  }

  /* ---------- Small building blocks ---------- */
  function defs() {
    var d = '<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>' +
      '<radialGradient id="g-light"><stop offset="0" stop-color="#FFF8D6"/><stop offset=".35" stop-color="' + GOLD + '"/><stop offset="1" stop-color="' + GOLD + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="g-seed"><stop offset="0" stop-color="#C9A6FF"/><stop offset=".6" stop-color="#5B3B8C"/><stop offset="1" stop-color="#2A1B45" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="g-mix" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="390">' + PK.ELEMENTS.map(function (e, i) { return '<stop offset="' + (i / 4) + '" stop-color="' + e.color + '" stop-opacity=".55"/>'; }).join('') + '</linearGradient>' +
      '<radialGradient id="g-subtle" gradientUnits="userSpaceOnUse" cx="200" cy="200" r="230"><stop offset="0" stop-color="#9FE7F5" stop-opacity=".95"/><stop offset="1" stop-color="#3BA99C" stop-opacity=".35"/></radialGradient>';
    PK.ELEMENTS.forEach(function (e) {
      d += '<radialGradient id="g-' + e.id + '" cx=".35" cy=".35"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".45" stop-color="' + e.color + '"/><stop offset="1" stop-color="' + e.color + '"/></radialGradient>';
    });
    return d + '</defs>';
  }
  function svg(body, vb) {
    return '<svg class="scene" viewBox="' + (vb || VB) + '" role="img" aria-hidden="true">' + defs() + body + '</svg>';
  }
  function label(x, y, text, o) {
    o = o || {};
    var anchor = o.anchor || (x < 200 ? 'end' : x > 200 ? 'start' : 'middle');
    var dx = anchor === 'end' ? -10 : anchor === 'start' ? 10 : 0;
    return '<text class="lbl ' + (o.cls || '') + '" x="' + (x + dx) + '" y="' + (y + (o.dy || 5)) + '" text-anchor="' + anchor + '"' + (o.delay !== undefined ? ' style="animation-delay:' + o.delay + 's"' : '') + '>' + esc(text) + '</text>';
  }
  function marker(x, y, color, delay, text, o) {
    o = o || {};
    return '<g class="mk pop" style="animation-delay:' + (delay || 0) + 's">' +
      '<circle class="ping" cx="' + x + '" cy="' + y + '" r="9" fill="' + color + '"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (o.r || 6) + '" fill="' + color + '" stroke="#fff" stroke-width="2"/>' +
      (text ? label(x, y, text, o) : '') + '</g>';
  }
  function callout(p, color, delay, text, sub, ty) {
    var x2 = 300;
    return '<g class="pop" style="animation-delay:' + delay + 's">' +
      '<path d="M' + p[0] + ' ' + p[1] + ' L' + (x2 - 10) + ' ' + ty + ' L' + x2 + ' ' + ty + '" fill="none" stroke="' + color + '" stroke-width="2.5"/>' +
      '<circle class="ping" cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="' + color + '"/>' +
      '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="' + color + '" stroke="#fff" stroke-width="2"/>' +
      '<text class="lbl lbl-big" x="' + (x2 + 6) + '" y="' + (ty + 7) + '">' + esc(text) + '</text>' +
      (sub ? '<text class="lbl deity" x="' + (x2 + 6) + '" y="' + (ty + 26) + '">' + esc(sub) + '</text>' : '') + '</g>';
  }
  function orb(cx, cy, r, e, o) {
    o = o || {};
    return '<g class="orb ' + (o.cls || '') + '" style="' + (o.delay !== undefined ? 'animation-delay:' + o.delay + 's;' : '') + '">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#g-' + e.id + ')" />' +
      (o.icon !== false ? '<text class="orb-ic" x="' + cx + '" y="' + (cy + r * 0.33) + '" text-anchor="middle" style="font-size:' + (r * 0.9) + 'px">' + e.icon + '</text>' : '') + '</g>';
  }
  function flow(d, color, delay, o) {
    o = o || {};
    return '<path class="flow ' + (o.cls || '') + '" d="' + d + '" stroke="' + color + '" style="animation-delay:' + (delay || 0) + 's"/>';
  }
  function particles(d, color, n, dur, r) {
    var s = '';
    for (var i = 0; i < n; i++) {
      s += '<circle r="' + (r || 4) + '" fill="' + color + '" opacity=".9"><animateMotion dur="' + dur + 's" begin="' + (i * dur / n).toFixed(2) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    }
    return s;
  }
  function glowAt(x, y, r, color, cls) {
    return '<circle class="glowdot ' + (cls || '') + '" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + color + '" filter="url(#soft)"/>';
  }
  function bigLetter(x, y, t, cls) { return '<text class="bigletter ' + (cls || '') + '" x="' + x + '" y="' + y + '" text-anchor="middle">' + esc(t) + '</text>'; }

  // caption pieces
  function ct(k) { var s = sa(k), g = gl(k); return '<span class="ct"><b>' + esc(s) + '</b>' + (g && g.replace(/\s/g, '') !== s.replace(/\s/g, '') ? '<small>' + esc(g) + '</small>' : '') + '</span>'; }
  function arrow() { return '<span class="ar">→</span>'; }

  /* ---------- Body positions ---------- */
  var P = {
    crown: [200, 34], head: [200, 86], forehead: [200, 68], eyeL: [188, 89], eyeR: [212, 89], earL: [168, 92], earR: [232, 92],
    nose: [200, 101], mouth: [200, 112], throat: [200, 138], heart: [200, 192], navel: [200, 248], base: [200, 300],
    handL: [104, 340], handR: [296, 340], footL: [150, 338], footR: [250, 338], shoulderR: [258, 168], armL: [128, 230], thighL: [96, 360]
  };
  var SENSE = { akasha: 'earR', vayu: 'shoulderR', agni: 'eyeR', jala: 'mouth', prthvi: 'nose' };
  var ACTION = { akasha: 'mouth', vayu: 'handR', agni: 'footR', jala: 'base', prthvi: 'base' };

  /* ---------- Scene: origin ---------- */
  var ORIGIN_POS = [[200, 104], [110, 180], [290, 180], [125, 292], [275, 292]];
  var origin = {
    steps: 7,
    render: function (st) {
      var b = '<circle cx="200" cy="0" r="70" fill="url(#g-light)" class="breathe"/>' + label(200, 2, sa('brahman'), { anchor: 'middle', cls: 'lbl-big' });
      PK.ELEMENTS.forEach(function (e, i) {
        if (st < i + 1) return;
        var p = ORIGIN_POS[i], prev = i === 0 ? [200, 10] : ORIGIN_POS[i - 1];
        b += flow('M' + prev[0] + ' ' + prev[1] + ' L' + p[0] + ' ' + p[1], '#C9B8A0', 0, { cls: i + 1 === st ? 'draw' : '' });
      });
      PK.ELEMENTS.forEach(function (e, i) {
        if (st < i + 1) return;
        var p = ORIGIN_POS[i], fresh = i + 1 === st;
        b += '<g class="' + (fresh ? 'drop' : '') + '">' + orb(p[0], p[1], 32, e) + label(p[0], p[1] + 50, sa(e.id), { anchor: 'middle', cls: 'lbl-big' });
        for (var q = 0; q < e.qualities.length; q++) {
          var own = q === e.qualities.length - 1;
          b += '<circle class="' + (own && fresh ? 'pop' : '') + '" style="animation-delay:.5s" cx="' + (p[0] - (e.qualities.length - 1) * 7 + q * 14) + '" cy="' + (p[1] + 70) + '" r="5" fill="' + (own ? e.color : '#BFB2A0') + '"/>';
        }
        b += '</g>';
      });
      if (st >= 6) b += '<g class="pop">' + label(200, 418, '1 · 2 · 3 · 4 · 5', { anchor: 'middle', cls: 'lbl-big' }) + '</g>';
      var cap;
      if (st === 0) cap = ct('brahman') + ' + ' + ct('maya');
      else if (st <= 5) { var e = PK.ELEMENTS[st - 1]; cap = ct(e.id) + arrow() + ct(e.quality) + '<span class="num">' + st + '</span>'; }
      else cap = esc(ui('s_addsOne'));
      return { svg: svg(b), cap: cap };
    }
  };

  /* ---------- Scene: gunas ---------- */
  var gunas = {
    steps: 6,
    render: function (st) {
      var b = figure({ cls: 'faint' }), cap;
      if (st < 5) {
        var e = PK.ELEMENTS[st], ps = P[SENSE[e.id]], pa = P[ACTION[e.id]];
        var o = [36, 28];
        b += orb(o[0], o[1], 26, e, { cls: 'pop' }) + label(o[0], o[1] + 44, sa(e.id), { anchor: 'middle' });
        if (e.id === 'vayu') b += '<g class="skin-glow">' + figure({ noBody: true, aura: [{ w: 10, color: SAT, op: .55 }] }) + '</g>';
        b += flow('M' + o[0] + ' ' + o[1] + ' C 120 10, ' + (ps[0] + 40) + ' ' + (ps[1] - 70) + ', ' + ps[0] + ' ' + ps[1], SAT, .2, { cls: 'draw' });
        b += flow('M' + o[0] + ' ' + o[1] + ' C 20 160, ' + (pa[0] - 120) + ' ' + pa[1] + ', ' + pa[0] + ' ' + pa[1], RAJ, .9, { cls: 'draw' });
        b += flow('M' + o[0] + ' ' + o[1] + ' C 0 300, 0 420, 60 428', TAM, 1.6, { cls: 'draw' });
        b += callout(ps, SAT, 1.1, sa(e.jnan), null, 70);
        b += callout(pa, RAJ, 1.8, sa(e.karm), null, Math.max(pa[1], 160));
        b += '<g class="pop" style="animation-delay:2.4s">' + orb(76, 428, 13, e, { icon: false }) + label(76, 428, sa('panchikarana'), { anchor: 'start' }) + '</g>';
        b += legend3(0);
        cap = ct(e.id) + '<span class="gsep"><i style="background:' + SAT + '"></i>' + ct(e.jnan) + '</span><span class="gsep"><i style="background:' + RAJ + '"></i>' + ct(e.karm) + '</span>';
      } else {
        PK.ELEMENTS.forEach(function (e, i) {
          var x = 40 + i * 80;
          b += orb(x, 10, 18, e, { icon: false });
          b += flow('M' + x + ' 10 C ' + x + ' 50, 200 30, 200 82', SAT, i * .15, { cls: 'draw' });
          b += flow('M' + x + ' 10 C ' + (x < 200 ? 20 : 380) + ' 120, 200 120, 200 190', RAJ, .8 + i * .15, { cls: 'draw' });
        });
        b += glowAt(200, 82, 26, SAT, 'pulse') + marker(200, 82, SAT, 1, sa('antahkarana'), { anchor: 'start', dy: -16 });
        b += glowAt(200, 192, 30, RAJ, 'pulse') + marker(200, 192, RAJ, 1.8, '5 ' + sa('prana'), { anchor: 'start' });
        b += legend3(0);
        cap = esc(ui('together')) + ': <span class="gsep"><i style="background:' + SAT + '"></i>' + ct('antahkarana') + '</span><span class="gsep"><i style="background:' + RAJ + '"></i>5 ' + ct('prana') + '</span>';
      }
      return { svg: svg(b), cap: cap };
    }
  };
  function legend3(y) {
    return '<g class="legend3">' + [['sattva', SAT], ['rajas', RAJ], ['tamas', TAM]].map(function (g, i) {
      var x = 250 + i * 0; return '<g transform="translate(300 ' + (y + i * 18 - 18) + ')"><rect width="14" height="6" y="-4" rx="3" fill="' + g[1] + '"/><text class="lbl sm" x="20" y="2">' + esc(sa(g[0])) + '</text></g>';
    }).join('') + '</g>';
  }

  /* ---------- Scene: pañcīkaraṇa ---------- */
  function wedge(cx, cy, r, k) { // k = 0..7, 45° each, starting at top going clockwise
    var a0 = (k * 45 - 90) * Math.PI / 180, a1 = ((k + 1) * 45 - 90) * Math.PI / 180;
    return 'M' + cx + ' ' + cy + ' L' + (cx + r * Math.cos(a0)).toFixed(1) + ' ' + (cy + r * Math.sin(a0)).toFixed(1) +
      ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.cos(a1)).toFixed(1) + ' ' + (cy + r * Math.sin(a1)).toFixed(1) + ' Z';
  }
  var pk = {
    steps: 5,
    render: function (st) {
      var b = '', R = 30, Y = 70, xs = [40, 120, 200, 280, 360];
      if (st === 4) b += '<g class="fadein" style="animation-delay:.6s">' + figure({ fill: 'url(#g-mix)' }) + '</g>';
      PK.ELEMENTS.forEach(function (e, i) {
        var cx = xs[i], others = PK.ELEMENTS.filter(function (x) { return x !== e; });
        var g = '<g class="pkorb' + (st === 4 ? ' sink' : '') + '" style="--sx:' + (200 - cx) + 'px;animation-delay:' + (i * .12) + 's">';
        for (var k = 0; k < 8; k++) {
          var half = k >= 2 && k <= 5; // bottom half: wedges 2..5 (right-bottom to left-bottom)
          var dy = 0, dx = 0, col = e.color, cls = '';
          if (half && st >= 1) dy = 10;
          if (half && st >= 2) { var a = ((k * 45 + 22.5 - 90) * Math.PI / 180); dx = Math.cos(a) * 10; dy += Math.sin(a) * 10; }
          if (half && st >= 3) {
            var src = others[k - 2], si = PK.ELEMENTS.indexOf(src);
            col = src.color; cls = 'fly'; dx = 0; dy = 6;
            g += '<path class="' + cls + '" style="--fx:' + (xs[si] - cx) + 'px;--fy:0px;animation-delay:' + (.2 + (k - 2) * .15) + 's" d="' + wedge(cx, Y, R, k) + '" fill="' + col + '" stroke="#fff" stroke-width="1.5" transform="translate(0 ' + dy + ')"/>';
            continue;
          }
          g += '<path class="wd" d="' + wedge(cx, Y, R, k) + '" fill="' + col + '" stroke="#fff" stroke-width="1.5" transform="translate(' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ')"/>';
        }
        g += '</g>';
        b += g + label(cx, Y + 64, sa(e.id), { anchor: 'middle' });
        if (st === 3) b += label(cx, Y + 86, '½ + ⅛×4', { anchor: 'middle', cls: 'sm' });
      });
      if (st < 4) {
        // big recipe diagram for earth below
        var e = PK.ELEMENTS[4], others = PK.ELEMENTS.slice(0, 4), cx = 200, cy = 270, r = 95;
        b += '<g class="fadein">';
        for (var k = 0; k < 8; k++) {
          var half = k >= 2 && k <= 5, col = (st >= 3 && half) ? others[k - 2].color : e.color;
          var off = half && st >= 1 ? 14 : 0, a = ((k * 45 + 22.5 - 90) * Math.PI / 180), ox = st >= 2 && half ? Math.cos(a) * 10 : 0, oy = (st >= 2 && half ? Math.sin(a) * 10 : 0) + off;
          b += '<path class="wd" d="' + wedge(cx, cy, r, k) + '" fill="' + col + '" stroke="var(--bg)" stroke-width="3" transform="translate(' + ox.toFixed(1) + ' ' + oy.toFixed(1) + ')"/>';
        }
        b += '<text class="frac" x="200" y="240" text-anchor="middle">½</text>';
        if (st >= 2) b += '<text class="frac sm" x="148" y="330" text-anchor="middle">⅛</text><text class="frac sm" x="252" y="330" text-anchor="middle">⅛</text><text class="frac sm" x="178" y="372" text-anchor="middle">⅛</text><text class="frac sm" x="222" y="372" text-anchor="middle">⅛</text>';
        b += label(200, 400, sa('prthvi') + (st >= 3 ? ' = ½ ' + sa('prthvi') + ' + ⅛ ' + others.map(function (o) { return sa(o.id); }).join(' + ⅛ ') : ''), { anchor: 'middle', cls: 'sm' }) + '</g>';
      }
      var cap = esc(ui('pk' + st));
      return { svg: svg(b), cap: cap };
    }
  };

  /* ---------- Scene: gross body (25) ---------- */
  var GROSS_POS = {
    akasha: [[150, 54], [250, 54], [146, 112], [254, 112], [200, 8]],
    vayu: [[200, 404], [262, 224], [70, 392], [64, 318], [336, 318]],
    agni: [[200, 248], [200, 138], [148, 276], [212, 89], [236, 64]],
    jala: [[178, 298], [216, 192], [200, 112], [222, 298], [200, 66]],
    prthvi: [[128, 230], [96, 362], [182, 214], [262, 170], [200, 46]]
  };
  var gross = {
    steps: 6,
    render: function (st) {
      var b, cap;
      if (st < 5) {
        var e = PK.ELEMENTS[st];
        b = figure({ aura: [{ w: 18, color: e.color, op: .18 }], fill: 'color-mix(in srgb, ' + e.color + ' 14%, var(--fig-fill))' });
        if (e.id === 'akasha') b += glowAt(200, 80, 60, e.color, 'pulse');
        if (e.id === 'vayu') b += '<g class="sway">' + flow('M70 320 l-20 0 m6 -6 l-6 6 l6 6', e.color, 0, { cls: 'draw thick' }) + flow('M330 320 l20 0 m-6 -6 l6 6 l-6 6', e.color, 0, { cls: 'draw thick' }) + '</g>';
        e.gross.forEach(function (g, i) {
          var p = GROSS_POS[e.id][i];
          b += marker(p[0], p[1], e.color, .25 + i * .3, sa(g), { anchor: p[0] < 200 ? 'end' : p[0] > 200 ? 'start' : 'start', dy: p[0] === 200 ? -12 : 5 });
        });
        b += orb(20, 6, 20, e, { cls: 'pop' });
        cap = ct(e.id) + arrow() + e.gross.map(function (g) { return '<b class="chipc">' + esc(sa(g)) + '</b>'; }).join('');
      } else {
        b = figure({ fill: 'url(#g-mix)' });
        PK.ELEMENTS.forEach(function (e, ei) {
          GROSS_POS[e.id].forEach(function (p, i) { b += '<circle class="pop" style="animation-delay:' + (ei * .25 + i * .05) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + e.color + '" stroke="#fff" stroke-width="2"/>'; });
        });
        b += bigLetter(360, 40, '25', 'num');
        cap = '5 × 5 = <b>25</b> · ' + ct('sthula');
      }
      return { svg: svg(b), cap: cap };
    }
  };

  /* ---------- Scene: subtle body (17) ---------- */
  var subtle = {
    steps: 6,
    render: function (st) {
      var b, cap;
      if (st < 5) {
        var e = PK.ELEMENTS[st], ps = P[SENSE[e.id]], pa = P[ACTION[e.id]];
        b = figure({ fill: 'url(#g-subtle)', cls: 'subtle' });
        if (e.id === 'vayu') b += figure({ noBody: true, aura: [{ w: 12, color: SAT, op: .5, cls: 'pulse' }] });
        b += orb(20, 6, 20, e, { cls: 'pop' });
        b += callout(ps, SAT, .3, sa(e.jnan), sa(e.jnanDeity), 60);
        b += callout(pa, RAJ, 1.1, sa(e.karm), sa(e.karmDeity), Math.max(pa[1], 170));
        cap = ct(e.id) + arrow() + '<span class="gsep"><i style="background:' + SAT + '"></i>' + ct(e.jnan) + '</span><span class="gsep"><i style="background:' + RAJ + '"></i>' + ct(e.karm) + '</span>';
      } else {
        b = figure({ fill: 'url(#g-subtle)', cls: 'subtle' });
        var dots = [], n = 0;
        PK.ELEMENTS.forEach(function (e) { dots.push([P[SENSE[e.id]], SAT]); });
        [P.mouth, P.handL, P.handR, P.footR, P.base].forEach(function (p) { dots.push([[p[0] + (p === P.mouth ? 10 : 0), p[1] + (p === P.mouth ? 6 : 0)], RAJ]); });
        [P.throat, P.heart, P.navel, [200, 276], [236, 220]].forEach(function (p) { dots.push([p, '#3BA99C']); });
        dots.push([[190, 76], '#6C7BD9']); dots.push([[210, 76], '#6C7BD9']);
        dots.forEach(function (d) { b += '<circle class="pop" style="animation-delay:' + (n++ * .12) + 's" cx="' + d[0][0] + '" cy="' + d[0][1] + '" r="7" fill="' + d[1] + '" stroke="#fff" stroke-width="2"/>'; });
        b += bigLetter(360, 40, '17', 'num pop');
        cap = '<span class="gsep"><i style="background:' + SAT + '"></i>5</span>+<span class="gsep"><i style="background:' + RAJ + '"></i>5</span>+<span class="gsep"><i style="background:#3BA99C"></i>5 ' + esc(sa('prana')) + '</span>+<span class="gsep"><i style="background:#6C7BD9"></i>' + esc(sa('manas')) + ', ' + esc(sa('buddhi')) + '</span>= <b>17</b>';
      }
      return { svg: svg(b), cap: cap };
    }
  };

  /* ---------- Scene: inner instrument (rope or snake?) ---------- */
  var inner = {
    steps: 5,
    render: function (st) {
      var b = figure({ eyes: 'open' }), cap;
      var colors = ['#6C7BD9', '#3BA99C', '#E0702E', '#B0569B'];
      // the thing on the path
      var wavy = 'M40 420 C80 396 110 444 150 420 C190 396 220 444 260 420 C290 404 320 410 350 416';
      var straight = 'M40 420 C120 414 260 424 350 416';
      b += '<path class="rope ' + (st >= 2 ? 'straight' : '') + '" d="' + (st >= 2 ? straight : wavy) + '"/>';
      if (st === 0) b += '<circle cx="380" cy="10" r="18" fill="#BFB2A0" opacity=".5"/>' + '<rect x="-20" y="-24" width="440" height="468" fill="#000" opacity=".12"/>';
      if (st >= 1) {
        var a = PK.ANTAH[st - 1];
        var spot = st === 4 ? P.heart : [200, 80];
        b += glowAt(spot[0], spot[1], 30, colors[st - 1], 'pulse');
        b += '<g class="bubble pop"><path d="M250 20 h150 a16 16 0 0 1 16 16 v58 a16 16 0 0 1 -16 16 h-110 l-22 22 l4 -22 h-22 a16 16 0 0 1 -16 -16 v-58 a16 16 0 0 1 16 -16 z" />';
        var sym = ['?', '!', '↺', sa('ahankara').slice(0, 3)][st - 1];
        b += '<text class="bubble-sym" x="326" y="80" text-anchor="middle" style="fill:' + colors[st - 1] + '">' + esc(sym) + '</text></g>';
        b += label(spot[0], spot[1], sa(a.id), { anchor: 'end', cls: 'lbl-big', dy: -36 });
      }
      cap = st === 0 ? esc(ui('s_rope')) : ct(PK.ANTAH[st - 1].id) + '<span class="fnq">' + esc(tx(PK.ANTAH[st - 1].fn)) + '</span>';
      return { svg: svg(b), cap: cap };
    }
  };

  /* ---------- Scene: five prāṇas ---------- */
  var PRANA_PATHS = {
    prana: ['M200 98 L200 192', 'down'],
    apana: ['M200 250 L200 334', 'down'],
    vyana: null,
    udana: ['M200 160 L200 10', 'up'],
    samana: ['M218 248 A18 18 0 1 1 217.9 247.9', 'loop']
  };
  var pranas = {
    steps: 6,
    render: function (st) {
      var b = figure(), cap;
      var list = st < 5 ? [PK.PRANAS[st]] : PK.PRANAS;
      var cols = { prana: '#3BA99C', apana: '#9A6B3F', vyana: '#6C7BD9', udana: '#E0702E', samana: '#D2553A' };
      list.forEach(function (p) {
        var c = cols[p.id];
        if (p.id === 'vyana') {
          b += figure({ noBody: true, aura: [{ w: 14, color: c, op: .35, cls: 'wave' }] });
          ['M200 192 C150 200 120 260 104 340', 'M200 192 C250 200 280 260 296 340', 'M200 192 L200 60', 'M200 192 C170 260 110 330 80 360', 'M200 192 C230 260 290 330 320 360'].forEach(function (d) { b += particles(d, c, 3, 2.2, 3.5); });
        } else {
          var pp = PRANA_PATHS[p.id];
          b += '<path d="' + pp[0] + '" stroke="' + c + '" stroke-width="16" stroke-linecap="round" fill="none" opacity=".18"/>';
          b += particles(pp[0], c, 5, p.id === 'samana' ? 1.6 : 2, 4.5);
        }
      });
      if (st < 5) {
        var p = PK.PRANAS[st], pos = { prana: [200, 150], apana: [200, 300], vyana: [300, 200], udana: [200, 30], samana: [200, 248] }[p.id];
        b += label(pos[0] + 30, pos[1], sa(p.id), { anchor: 'start', cls: 'lbl-big' });
        cap = ct(p.id) + '<span class="fnq">' + esc(tx(p.seat)) + ' · ' + esc(tx(p.fn)) + '</span>';
      } else {
        b += label(230, 30, sa('udana'), { anchor: 'start' }) + label(230, 150, sa('prana'), { anchor: 'start' }) + label(240, 252, sa('samana'), { anchor: 'start' }) + label(230, 316, sa('apana'), { anchor: 'start' }) + label(330, 380, sa('vyana'), { anchor: 'start' });
        cap = esc(ui('together'));
      }
      return { svg: svg(b), cap: cap };
    }
  };

  /* ---------- Scene: three bodies ---------- */
  var STATES = ['jagrat', 'svapna', 'sushupti'], JIVA = ['vishva', 'taijasa', 'prajna'], COSMIC = ['virat', 'hiranyagarbha', 'ishvara'], OM = ['a', 'u', 'm'];
  function sky(st) {
    if (st === 0) return '<g class="fadein"><circle cx="360" cy="10" r="22" fill="#F4B740"/>' + rays(360, 10) + '<path d="M-20 430 L60 380 L110 420 L170 370 L240 430 Z" fill="#9BBF8A" opacity=".5"/><path d="M330 430 l0 -40" stroke="#7A5A3A" stroke-width="6"/><circle cx="330" cy="380" r="22" fill="#7FB069" opacity=".8"/></g>';
    if (st === 1) return '<g class="fadein"><path d="M372 -6 a24 24 0 1 0 14 36 a18 18 0 1 1 -14 -36z" fill="#C9D6F2"/>' + cloud(300, 80) + '</g>';
    return '<rect class="fadein" x="-20" y="-24" width="440" height="468" fill="#0E0B1A" opacity=".55"/>';
  }
  function rays(x, y) { var s = ''; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<line x1="' + (x + Math.cos(a) * 28) + '" y1="' + (y + Math.sin(a) * 28) + '" x2="' + (x + Math.cos(a) * 38) + '" y2="' + (y + Math.sin(a) * 38) + '" stroke="#F4B740" stroke-width="3" stroke-linecap="round"/>'; } return s; }
  function cloud(x, y) {
    return '<g class="bubble pop"><ellipse cx="' + x + '" cy="' + y + '" rx="70" ry="34"/><circle cx="' + (x - 40) + '" cy="' + (y - 18) + '" r="26"/><circle cx="' + (x + 20) + '" cy="' + (y - 28) + '" r="30"/><circle cx="238" cy="132" r="8"/><circle cx="226" cy="148" r="5"/>' +
      '<path d="M' + (x - 40) + ' ' + (y + 6) + ' l18 -24 l18 24z" fill="#9BBF8A" opacity=".8"/><circle cx="' + (x + 25) + '" cy="' + (y - 6) + '" r="10" fill="#F4B740" opacity=".7"/></g>';
  }
  var bodies = {
    steps: 3,
    render: function (st) {
      var b = sky(st);
      if (st === 0) b += figure({ eyes: 'open', fill: '#EAD8C0' });
      if (st === 1) b += figure({ outlineOnly: true, dash: true, line: '#BFB2A0' }) + '<g class="pulse">' + figure({ fill: 'url(#g-subtle)', noBody: false, line: 'transparent', cls: 'shrink' }) + '</g>';
      if (st === 2) b += figure({ outlineOnly: true, dash: true, line: '#6A5F80' }) + glowAt(200, 192, 34, '#7E57C2', 'pulse') + '<circle cx="200" cy="192" r="18" fill="url(#g-seed)" class="pulse"/>';
      b += '<g class="badge pop"><rect x="-10" y="330" width="96" height="96" rx="20"/>' + bigLetter(38, 400, sa(OM[st])) + '</g>';
      b += label(388, 404, sa(JIVA[st]) + ' = ' + sa(COSMIC[st]), { anchor: 'end', cls: 'lbl-big', delay: .6 });
      var cap = ct(['sthula', 'sukshma', 'karana'][st]) + '<span class="gsep">' + ct(STATES[st]) + '</span><span class="gsep">' + ct(JIVA[st]) + '</span>';
      return { svg: svg(b), cap: cap };
    }
  };

  /* ---------- Scene: five sheaths ---------- */
  var KW = [92, 72, 52, 34, 16];
  var koshas = {
    steps: 6,
    render: function (st) {
      var aura = [];
      PK.KOSHAS.forEach(function (k, i) {
        if (i < st - 0 && st > 0 && i < st) { aura.push({ w: KW[i], color: k.color, op: 0, cls: 'peel' }); return; }
        aura.push({ w: KW[i], color: k.color, op: i === st ? .95 : .6 });
      });
      var b = '';
      if (st < 5) {
        b += figure({ aura: aura, cls: st > 0 ? '' : '' });
        b += glowAt(200, 192, 18 + st * 6, GOLD, 'pulse');
        var k = PK.KOSHAS[st];
        var lx = [380, 372, 362, 352, 342][st];
        b += label(lx, 250, sa(k.id).split(' ')[0], { anchor: 'start', cls: 'lbl-xl' });
        b += '<path d="M' + (lx - 4) + ' 244 l-' + (24 - st * 3) + ' 0" stroke="' + k.color + '" stroke-width="3"/>';
        var cap = ct(k.id) + '<span class="fnq">' + esc(tx(I_KOSHA[st])) + '</span>';
        return { svg: svg(b, '-60 -60 520 540'), cap: cap };
      }
      b += '<circle cx="200" cy="190" r="240" fill="url(#g-light)" class="fadein breathe"/>' + figure({ outlineOnly: true, dash: true, line: '#D9B44A' });
      b += label(200, 196, sa('atman'), { anchor: 'middle', cls: 'lbl-big' });
      return { svg: svg(b, '-60 -60 520 540'), cap: esc(ui('s_neti')) };
    }
  };
  var I_KOSHA = [
    ['"I am tall, I am fat"', '"मैं लंबा हूँ, मैं मोटा हूँ"', '"હું ઊંચો છું, હું જાડો છું"', '"मी उंच आहे, मी जाड आहे"'],
    ['"I am hungry, I am tired"', '"मुझे भूख लगी है, मैं थका हूँ"', '"મને ભૂખ લાગી છે, હું થાકી ગયો છું"', '"मला भूक लागली, मी थकलो आहे"'],
    ['"I am upset, I am confused"', '"मैं परेशान हूँ, उलझन में हूँ"', '"હું વ્યથિત છું, મૂંઝવણમાં છું"', '"मी अस्वस्थ आहे, गोंधळलो आहे"'],
    ['"I am clever, I am the doer"', '"मैं बुद्धिमान हूँ, मैं कर्ता हूँ"', '"હું બુદ્ધિશાળી છું, હું કર્તા છું"', '"मी हुशार आहे, मी कर्ता आहे"'],
    ['"I am happy, I slept well"', '"मैं सुखी हूँ, अच्छी नींद आई"', '"હું સુખી છું, સરસ ઊંઘ આવી"', '"मी सुखी आहे, छान झोप लागली"']
  ];

  /* ---------- Scene: witness ---------- */
  var witness = {
    steps: 4,
    render: function (st) {
      var s = st % 3, b = sky(s);
      if (s === 0) b += figure({ eyes: 'open', fill: '#EAD8C0' });
      if (s === 1) b += figure({ fill: 'url(#g-subtle)' }) + cloud(300, 80);
      if (s === 2) b += figure({ outlineOnly: true, dash: true, line: '#6A5F80' });
      b += '<circle cx="200" cy="192" r="70" fill="url(#g-light)" class="breathe"/>' + '<circle cx="200" cy="192" r="10" fill="#FFF8D6" filter="url(#glow)"/>';
      b += label(200, 192, sa('sakshi'), { anchor: 'start', cls: 'lbl-big', dy: -26 });
      if (st === 3) {
        b = '';
        [0, 1, 2].forEach(function (i) {
          b += '<g class="o0" transform="translate(' + (i * 146 - 20) + ' 150) scale(.35)"><g class="pop" style="animation-delay:' + (i * .3) + 's">' + figure({ eyes: i === 0 ? 'open' : 'closed', fill: ['#EAD8C0', 'url(#g-subtle)', '#4A4060'][i] }) + '</g></g>';
          b += label(i * 146 + 50, 312, sa(STATES[i]), { anchor: 'middle', cls: 'lbl-big' });
        });
        b += '<path d="M-10 236 L410 236" stroke="' + GOLD + '" stroke-width="8" stroke-linecap="round" opacity=".9" class="draw-line"/>';
        b += label(200, 400, sa('sakshi') + ' = ' + sa('turiya'), { anchor: 'middle', cls: 'lbl-big' });
        return { svg: svg(b), cap: esc(ui('alwaysLit')) };
      }
      return { svg: svg(b), cap: ct(STATES[s]) + '<span class="gsep">' + ct(JIVA[s]) + '</span><span class="gsep">' + ct('sakshi') + ' ✓</span>' };
    }
  };

  /* ---------- Scene: return (laya) ---------- */
  var laya = {
    steps: 4,
    render: function (st) {
      var b = '';
      if (st === 0) b += sky(0) + figure({ eyes: 'closed', fill: '#EAD8C0' });
      if (st === 1) b += figure({ outlineOnly: true, dash: true, line: '#C9B8A0', cls: 'fadeout' }) + '<g class="pulse">' + figure({ fill: 'url(#g-subtle)', line: 'transparent' }) + '</g>';
      if (st === 2) b += '<g class="collapse">' + figure({ fill: 'url(#g-subtle)', line: 'transparent' }) + '</g>' + '<circle cx="200" cy="192" r="18" fill="url(#g-seed)" class="pop pulse" style="animation-delay:.8s"/>';
      if (st === 3) b += '<circle cx="200" cy="192" r="10" fill="url(#g-light)" class="expand"/>';
      var letters = ['a', 'u', 'm'];
      b += '<g class="omrow">' + letters.map(function (l, i) { return '<text x="' + (140 + i * 60) + '" y="-0" text-anchor="middle" class="omletter' + (i < st ? ' gone' : i === st ? ' cur' : '') + '">' + esc(sa(l)) + '</text>'; }).join('') + '</g>';
      if (st === 3) b += bigLetter(200, 214, sa('om'), 'omsilence');
      return { svg: svg(b), cap: esc(ui('laya' + st)) };
    }
  };

  /* ---------- Hero (home) ---------- */
  function hero() {
    var aura = PK.KOSHAS.map(function (k, i) { return { w: KW[i], color: k.color, op: .28, cls: 'breathe-aura' }; });
    return svg(figure({ aura: aura }) + '<circle cx="200" cy="192" r="40" fill="url(#g-light)" class="breathe"/>', '-60 -60 520 540');
  }

  /* ---------- Map: tap the sheaths ---------- */
  function mapScene(sel) {
    var aura = PK.KOSHAS.map(function (k, i) { return { w: KW[i], color: k.color, op: sel === i ? 1 : .45 }; });
    var b = figure({ aura: aura });
    // invisible hit targets per sheath (bands on the right side)
    PK.KOSHAS.forEach(function (k, i) {
      var y = 120 + i * 52;
      b += '<g class="maptag" tabindex="0" data-act="map" data-v="' + i + '"><rect x="372" y="' + (y - 18) + '" width="140" height="36" rx="18" fill="' + k.color + '" opacity="' + (sel === i ? 1 : .8) + '"/><text x="442" y="' + (y + 6) + '" text-anchor="middle">' + esc(sa(k.id).split(' ')[0]) + '</text></g>';
    });
    b += '<g tabindex="0" data-act="map" data-v="5" class="maptag"><circle cx="200" cy="192" r="26" fill="url(#g-light)"/><circle cx="200" cy="192" r="9" fill="#FFF8D6"/></g>';
    return svg(b, '-60 -60 580 540');
  }

  window.SCENES = {
    origin: origin, gunas: gunas, panchikarana: pk, gross: gross, subtle: subtle, inner: inner,
    pranas: pranas, bodies: bodies, koshas: koshas, witness: witness, laya: laya,
    hero: hero, map: mapScene, figure: figure, svg: svg
  };
})();
