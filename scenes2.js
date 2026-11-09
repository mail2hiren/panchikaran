/* v2 scenes: the seeker, Sat-Chit-Ānanda, Om Tat Sat, and one illustrated story per chapter.
   Same contract as scenes.js: { steps, render(step) -> { svg, cap } }. Captions are [en, hi, gu, mr]. */
(function () {
  'use strict';
  var PK = window.PK, S = window.SCENES, K = S._k;
  function H() { return window.PKH; }
  function sa(k) { return H().saOf(k); }
  function esc(s) { return H().esc(s); }
  function L(a) { return H().tx(a); }
  function scr(s) { return H().script(s); }
  var GOLD = K.GOLD, LINE = 'var(--fig-line)';

  /* ---------- Drawing kit ---------- */
  function T(x, y, t, o) { o = o || {}; if (!o.anchor) o.anchor = 'middle'; return K.label(x, y, t, o); }
  function mini(x, y, s, o, cls) {
    return '<g class="o0" transform="translate(' + x + ' ' + y + ') scale(' + s + ') translate(-200 -200)"><g class="' + (cls || '') + '">' + K.figure(o || {}) + '</g></g>';
  }
  function halo(x, y, r, cls) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#g-light)" class="' + (cls || 'breathe') + '"/>'; }
  function guru(x, y, s, o) {
    return halo(x, y - 112 * s, 70 * s + 18) + mini(x, y, s, Object.assign({ fill: '#F3D9B1' }, o || {}));
  }
  function bub(x, y, sym, color, delay) {
    return '<g class="bubble pop" style="animation-delay:' + (delay || 0) + 's"><circle cx="' + x + '" cy="' + y + '" r="24"/>' +
      '<text class="bsym" x="' + x + '" y="' + (y + 10) + '" text-anchor="middle" style="fill:' + (color || 'var(--accent)') + '">' + esc(sym) + '</text></g>';
  }
  function at(x, y, s, inner, cls) {
    return '<g class="o0" transform="translate(' + x + ' ' + y + ')' + (s && s !== 1 ? ' scale(' + s + ')' : '') + '"><g class="' + (cls || '') + '">' + inner + '</g></g>';
  }
  var POT = '<path d="M-24 -58 L24 -58 L20 -46 Q62 -26 60 6 Q56 48 0 52 Q-56 48 -60 6 Q-62 -26 -20 -46 Z" fill="FILL" stroke="' + LINE + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M-30 -60 L30 -60" stroke="' + LINE + '" stroke-width="6" stroke-linecap="round"/>';
  function pot(x, y, s, fill, cls) { return at(x, y, s, POT.replace('FILL', fill || '#C77B4A'), cls); }
  function sun(x, y, r, cls) {
    var s = '<g class="' + (cls || '') + '"><circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.9) + '" fill="url(#g-light)" opacity=".7"/>';
    for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s += '<line x1="' + (x + Math.cos(a) * r * 1.25).toFixed(1) + '" y1="' + (y + Math.sin(a) * r * 1.25).toFixed(1) + '" x2="' + (x + Math.cos(a) * r * 1.6).toFixed(1) + '" y2="' + (y + Math.sin(a) * r * 1.6).toFixed(1) + '" stroke="#F4B740" stroke-width="4" stroke-linecap="round"/>'; }
    return s + '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#F4B740"/></g>';
  }
  function moon(x, y, r) { return '<path d="M' + x + ' ' + (y - r) + ' a' + r + ' ' + r + ' 0 1 0 ' + (r * .6) + ' ' + (r * 1.85) + ' a' + (r * .78) + ' ' + (r * .78) + ' 0 1 1 ' + (-r * .6) + ' ' + (-r * 1.85) + 'z" fill="#C9D6F2" stroke="#8FA3CF" stroke-width="2"/>'; }
  function waves(x, y, w, n, color) {
    var s = '';
    for (var j = 0; j < (n || 2); j++) {
      var d = 'M' + x + ' ' + (y + j * 14);
      for (var i = 0; i < w / 40; i++) d += ' q10 -9 20 0 t20 0';
      s += '<path d="' + d + '" fill="none" stroke="' + (color || '#2F86C8') + '" stroke-width="4" stroke-linecap="round" opacity="' + (1 - j * .3) + '"/>';
    }
    return s;
  }
  function grass(x, y) { return '<path d="M' + x + ' ' + y + ' C' + (x - 4) + ' ' + (y - 30) + ' ' + (x + 8) + ' ' + (y - 60) + ' ' + (x + 2) + ' ' + (y - 90) + ' C' + (x + 14) + ' ' + (y - 60) + ' ' + (x + 6) + ' ' + (y - 28) + ' ' + (x + 8) + ' ' + y + 'Z" fill="#6FAE4E" stroke="#3E7A2C" stroke-width="2"/>'; }
  function flame(x, y, s, cls) {
    return at(x, y, s, '<path d="M0 -40 C18 -18 26 -6 20 12 C16 26 -16 26 -20 12 C-26 -6 -18 -18 0 -40Z" fill="#E0702E"/><path d="M0 -14 C8 -4 10 4 8 12 C5 20 -5 20 -8 12 C-10 4 -8 -4 0 -14Z" fill="#F4C430"/>', cls || 'flicker');
  }
  function jewel(x, y, c) { return '<path d="M' + x + ' ' + (y - 20) + ' l18 14 l-18 26 l-18 -26 z" fill="' + c + '" stroke="#fff" stroke-width="2"/><path d="M' + (x - 18) + ' ' + (y - 6) + ' h36" stroke="#fff" stroke-width="1.5" opacity=".7"/>'; }
  function coin(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="12" fill="#F4C430" stroke="#B8860B" stroke-width="2"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" class="tiny" fill="#8B6508">₹</text>'; }
  function crown(x, y) { return '<path d="M' + (x - 20) + ' ' + (y + 10) + ' l0 -22 l10 10 l10 -16 l10 16 l10 -10 l0 22 z" fill="#F4C430" stroke="#B8860B" stroke-width="2"/>'; }
  function note(x, y) { return '<text x="' + x + '" y="' + y + '" class="musicnote" text-anchor="middle">♪</text>'; }
  function beast(x, y, s, horns) { // a simple four-legged animal facing left
    return at(x, y, s, '<g fill="#B9A58C" stroke="' + LINE + '" stroke-width="3" stroke-linejoin="round">' +
      '<rect x="-40" y="-22" width="80" height="40" rx="18"/><path d="M-36 -10 L-62 -34 L-74 -18 L-48 4 Z"/>' +
      '<path d="M-30 14 v32 M-12 16 v30 M16 16 v30 M32 14 v32" fill="none" stroke-width="6" stroke-linecap="round"/>' +
      (horns ? '<path d="M-66 -30 l-6 -16 M-58 -36 l4 -16" fill="none" stroke-width="4" stroke-linecap="round"/>' : '<path d="M-52 -30 q14 -8 24 6" fill="none" stroke-width="4"/>') +
      '<path d="M40 -8 q16 8 10 30" fill="none" stroke-width="4" stroke-linecap="round"/></g>');
  }
  function cross(x, y, r, d) { return '<g class="pop" style="animation-delay:' + (d || 0) + 's"><path d="M' + (x - r) + ' ' + (y - r) + ' L' + (x + r) + ' ' + (y + r) + ' M' + (x + r) + ' ' + (y - r) + ' L' + (x - r) + ' ' + (y + r) + '" stroke="#D2553A" stroke-width="7" stroke-linecap="round"/></g>'; }
  function tick(x, y, d) { return '<g class="pop" style="animation-delay:' + (d || 0) + 's"><path d="M' + (x - 16) + ' ' + y + ' l12 12 l22 -26" fill="none" stroke="#3B9A5A" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  function arrowLine(x1, y1, x2, y2, c, d) {
    var a = Math.atan2(y2 - y1, x2 - x1), h = 12;
    return '<g class="fadein" style="animation-delay:' + (d || 0) + 's"><path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M' + x2 + ' ' + y2 + ' L' + (x2 - h * Math.cos(a - .45)).toFixed(1) + ' ' + (y2 - h * Math.sin(a - .45)).toFixed(1) + ' M' + x2 + ' ' + y2 + ' L' + (x2 - h * Math.cos(a + .45)).toFixed(1) + ' ' + (y2 - h * Math.sin(a + .45)).toFixed(1) + '" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/></g>';
  }
  function card(x, y, w, h, color, big, small, d) {
    return '<g class="pop" style="animation-delay:' + (d || 0) + 's"><rect class="card-r" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="16" style="stroke:' + color + '"/>' +
      '<text class="sk" x="' + (x + w / 2) + '" y="' + (y + h / 2 + (small ? 0 : 8)) + '" text-anchor="middle" style="fill:' + color + '">' + esc(big) + '</text>' +
      (small ? '<text class="lbl sm" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 28) + '" text-anchor="middle">' + esc(small) + '</text>' : '') + '</g>';
  }
  function big(x, y, t, cls, d) { return '<text class="sk ' + (cls || '') + '" x="' + x + '" y="' + y + '" text-anchor="middle"' + (d !== undefined ? ' style="animation-delay:' + d + 's"' : '') + '>' + esc(t) + '</text>'; }
  function ct(k) { return K.ct(k); }
  function fnq(a) { return '<span class="fnq">' + esc(L(a)) + '</span>'; }
  function num(n) { return '<span class="num">' + n + '</span>'; }
  function story(frames) {
    return { steps: frames.length, render: function (st) { var f = frames[st]; return { svg: K.svg(f.d()), cap: esc(L(f.c)) }; } };
  }
  var SKY_SPACE = '<rect x="-20" y="-24" width="440" height="468" fill="#BFE0F5" opacity=".3"/>';

  /* ======================= The seeker ======================= */
  var STEP_TOP = [350, 280, 210, 140], STEP_COL = ['#6C7BD9', '#3BA99C', '#E0702E', '#B0569B'];
  var STEP_KEY = ['viveka', 'vairagya', 'shatsampatti', 'mumukshutva'];
  function stairs(lit, dim) {
    var s = '<g' + (dim ? ' opacity=".25"' : '') + '>';
    STEP_TOP.forEach(function (top, i) {
      var x = 60 + i * 76;
      s += '<rect x="' + x + '" y="' + top + '" width="' + (440 - x) + '" height="' + (444 - top) + '" rx="6" fill="' + (i < lit ? STEP_COL[i] : 'var(--surface2)') + '" opacity="' + (i < lit ? (i === lit - 1 ? .95 : .55) : 1) + '" stroke="var(--line)" stroke-width="2"/>';
      s += '<text class="lbl sm steplbl" x="' + (x + 38) + '" y="' + (top + 26) + '" text-anchor="middle">' + esc(sa(STEP_KEY[i])) + '</text>';
    });
    return s + '</g>';
  }
  function seekerAt(i) { return i < 0 ? mini(24, 398, .22, {}) : mini(i === 3 ? 318 : 98 + i * 76, STEP_TOP[i] - 44, .22, {}); }
  function sticks(x, y) { return '<g stroke="#8B5A2B" stroke-width="3" stroke-linecap="round"><path d="M' + x + ' ' + y + ' l26 -10 M' + x + ' ' + (y + 5) + ' l26 -8 M' + x + ' ' + (y + 10) + ' l26 -6"/></g>'; }
  var TREASURES = [['shama', '#6C7BD9'], ['dama', '#3BA99C'], ['uparati', '#9A6B3F'], ['titiksha', '#E0702E'], ['shraddha', '#D2553A'], ['samadhana', '#B0569B']];
  var BOW = ['Bow · ask · serve', 'प्रणिपात · परिप्रश्न · सेवा', 'પ્રણિપાત · પરિપ્રશ્ન · સેવા', 'प्रणिपात · परिप्रश्न · सेवा'];
  var MILK = ['milk', 'दूध', 'દૂધ', 'दूध'], WATER = ['water', 'पानी', 'પાણી', 'पाणी'];
  var seeker = {
    steps: 7,
    render: function (st) {
      var b = '', cap;
      if (st <= 4) {
        b += stairs(st) + guru(382, 92, .24);
        b += T(382, 4, sa('guru'), { cls: 'lbl-big' });
        b += seekerAt(st - 1);
      }
      if (st === 0) {
        b += sticks(2, 428);
        b += '<path d="M40 360 C120 300 260 120 340 100" fill="none" stroke="' + GOLD + '" stroke-width="3" stroke-dasharray="6 8" class="fadein"/>';
        b += T(150, 60, L(BOW), { cls: 'lbl-big', delay: .4 });
        cap = ct('guru') + fnq(BOW);
      } else if (st === 1) { // swan: milk from water
        b += '<g class="pop"><ellipse cx="96" cy="118" rx="74" ry="18" fill="#2F86C8" opacity=".35"/>' +
          '<path d="M44 100 Q60 128 122 118 Q152 112 160 86 Q132 100 112 94 Q80 86 44 100Z" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>' +
          '<path d="M118 98 Q98 52 120 30 Q136 18 142 32" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M118 98 Q98 52 120 30 Q136 18 142 32" fill="none" stroke="' + LINE + '" stroke-width="2"/>' +
          '<path d="M141 31 l14 4 l-12 5z" fill="#E0702E"/><circle cx="134" cy="27" r="2.5" fill="' + LINE + '"/></g>';
        b += '<circle cx="164" cy="44" r="7" fill="#fff" stroke="#ccc" class="pop" style="animation-delay:.6s"/>' + T(176, 48, L(MILK), { anchor: 'start', delay: .6 });
        b += T(96, 152, L(WATER), { delay: .9 });
        cap = ct('viveka') + num(1);
      } else if (st === 2) { // the pleasant drifts away
        b += '<g class="driftaway">' + coin(40, 90) + coin(64, 70) + crown(110, 60) + note(160, 90) + note(176, 66) + beast(60, 140, .45, true) + '</g>';
        b += T(100, 190, sa('preyas'), { cls: 'faint' }) + T(250, 170, sa('shreyas') + ' →', { cls: 'lbl-big', delay: .8 });
        cap = ct('vairagya') + num(2);
      } else if (st === 3) {
        TREASURES.forEach(function (t, i) {
          var x = 34 + (i % 3) * 78, y = 34 + Math.floor(i / 3) * 96;
          b += '<g class="pop" style="animation-delay:' + (i * .35) + 's">' + jewel(x, y, t[1]) + '</g>' + T(x, y + 42, sa(t[0]), { delay: i * .35 });
        });
        cap = ct('shatsampatti') + num(3);
      } else if (st === 4) {
        b += flame(318, 54, .55);
        b += '<ellipse cx="80" cy="80" rx="80" ry="34" fill="#2F86C8" opacity=".4"/>' + waves(20, 70, 120, 2);
        b += arrowLine(290, 90, 170, 84, '#2F86C8', .3);
        cap = ct('mumukshutva') + num(4);
      } else if (st === 5) {
        b += stairs(4, true);
        [['adhikari', '#6C7BD9'], ['vishaya', '#3BA99C'], ['prayojana', '#E0702E'], ['sambandha', '#B0569B']].forEach(function (a, i) {
          b += card(i % 2 ? 210 : 0, i < 2 ? 20 : 210, 190, 160, a[1], sa(a[0]), H().glossOf(a[0]), i * .3);
        });
        cap = ['adhikari', 'vishaya', 'prayojana', 'sambandha'].map(ct).join('');
      } else {
        b += '<g class="pop"><circle cx="70" cy="200" r="54" fill="var(--surface2)"/>' + mini(70, 206, .2, {}) + '<path d="M106 180 q14 20 0 40 M118 170 q22 30 0 60" fill="none" stroke="' + GOLD + '" stroke-width="4" stroke-linecap="round"/></g>';
        b += '<g class="pop" style="animation-delay:.6s"><circle cx="200" cy="200" r="54" fill="var(--surface2)"/><text class="bsym" x="200" y="222" text-anchor="middle" style="font-size:64px;fill:var(--accent)">?→!</text></g>';
        b += '<g class="pop" style="animation-delay:1.2s"><circle cx="330" cy="200" r="54" fill="var(--surface2)"/>' + halo(330, 190, 46) + mini(330, 210, .22, {}) + '</g>';
        b += arrowLine(128, 200, 142, 200, LINE, .4) + arrowLine(258, 200, 272, 200, LINE, 1);
        b += T(70, 290, sa('shravana'), { cls: 'lbl-big' }) + T(200, 290, sa('manana'), { cls: 'lbl-big', delay: .6 }) + T(330, 290, sa('nididhyasana'), { cls: 'lbl-big', delay: 1.2 });
        cap = ct('shravana') + K.arrow() + ct('manana') + K.arrow() + ct('nididhyasana');
      }
      return { svg: K.svg(b), cap: cap };
    }
  };

  /* ======================= Sat · Chit · Ānanda ======================= */
  var DEAR = [['wealth', 'धन', 'ધન', 'धन'], ['family', 'परिवार', 'પરિવાર', 'कुटुंब'], ['body', 'शरीर', 'શરીર', 'शरीर']];
  var SEER = ['Seer', 'द्रष्टा', 'દ્રષ્ટા', 'द्रष्टा'], SEEN = ['Seen', 'दृश्य', 'દૃશ્ય', 'दृश्य'];
  var satchit = {
    steps: 7,
    render: function (st) {
      var b = '', cap;
      if (st === 0) {
        b += '<rect x="-10" y="170" width="420" height="70" rx="35" fill="' + GOLD + '" opacity=".35" class="fadein"/>';
        b += T(200, 150, sa('asti') + ' · ' + sa('sat'), { cls: 'lbl-xl' });
        b += '<g class="pop"><path d="M40 238 q-10 -40 30 -46 q40 -4 34 40 z" fill="#A0784E" stroke="' + LINE + '" stroke-width="3"/></g>';
        b += pot(200, 220, .8, '#C77B4A', 'pop') ;
        b += '<g class="pop" style="animation-delay:.6s"><path d="M310 236 l20 -30 l14 30z M340 236 l18 -22 l12 22z M300 220 l14 -12 l6 16z" fill="#C77B4A" stroke="' + LINE + '" stroke-width="3"/></g>';
        b += arrowLine(110, 290, 150, 290, LINE, .2) + arrowLine(250, 290, 290, 290, LINE, .5);
        cap = ct('sat') + ' = ' + ct('asti');
      } else if (st === 1) {
        b += sun(200, 40, 34, 'pop');
        b += mini(70, 300, .3, { eyes: 'open' }) + K.cloud(200, 300) + '<path d="M330 260 a26 26 0 1 0 18 42 a20 20 0 1 1 -18 -42z" fill="#4A4060"/>';
        [[70, 250], [200, 270], [335, 270]].forEach(function (p, i) { b += K.flow('M200 80 L' + p[0] + ' ' + p[1], '#F4B740', i * .2, { cls: 'draw' }); });
        b += T(200, 410, sa('bhati') + ' · ' + sa('chit'), { cls: 'lbl-xl' });
        cap = ct('chit') + ' = ' + ct('bhati');
      } else if (st === 2) {
        [170, 125, 80].forEach(function (r, i) { b += '<circle cx="200" cy="210" r="' + r + '" fill="none" stroke="#B0569B" stroke-width="' + (6 + i * 4) + '" opacity="' + (.25 + i * .2) + '" class="pop" style="animation-delay:' + (i * .3) + 's"/>'; b += T(200, 210 - r + 6, L(DEAR[i]), { delay: i * .3 }); });
        b += halo(200, 210, 60) + T(200, 216, sa('atman'), { cls: 'lbl-big', delay: 1 });
        b += T(200, 420, sa('priya') + ' · ' + sa('ananda'), { cls: 'lbl-xl' });
        cap = ct('ananda') + ' = ' + ct('priya');
      } else if (st === 3) {
        b += '<rect x="0" y="40" width="180" height="300" rx="20" fill="' + GOLD + '" opacity=".22"/><rect x="220" y="40" width="180" height="300" rx="20" fill="#888" opacity=".18"/>';
        b += T(90, 74, L(SEER), { cls: 'lbl-big' }) + T(310, 74, L(SEEN), { cls: 'lbl-big' });
        [['sat', 'asat'], ['chit', 'jada'], ['ananda', 'duhkha']].forEach(function (p, i) {
          var y = 140 + i * 70;
          b += T(90, y, sa(p[0]), { cls: 'lbl-xl', delay: i * .4 }) + T(310, y, sa(p[1]), { cls: 'lbl-xl faint', delay: i * .4 + .2 });
          b += '<text class="lbl" x="200" y="' + (y + 4) + '" text-anchor="middle" style="animation-delay:' + (i * .4 + .2) + 's">⇄</text>';
        });
        b += T(90, 380, sa('atman'), { cls: 'lbl-big' }) + T(310, 380, sa('anatma'), { cls: 'lbl-big' });
        cap = ct('atman') + ' ⇄ ' + ct('anatma');
      } else if (st === 4) {
        b += pot(200, 230, 1.5, '#C77B4A');
        [['asti', 90], ['bhati', 160], ['priya', 230]].forEach(function (p, i) { b += '<g class="pop" style="animation-delay:' + (i * .4) + 's"><rect x="-10" y="' + (p[1] - 22) + '" width="96" height="40" rx="20" fill="' + GOLD + '"/></g>' + T(38, p[1] + 2, sa(p[0]), { cls: 'lbl-big', delay: i * .4 }); });
        [['nama', 140], ['akara', 230]].forEach(function (p, i) { b += '<g class="pop" style="animation-delay:' + (1.4 + i * .4) + 's"><rect x="314" y="' + (p[1] - 22) + '" width="96" height="40" rx="20" fill="#9A9A9A"/></g>' + T(362, p[1] + 2, sa(p[0]), { cls: 'lbl-big', delay: 1.4 + i * .4 }); });
        b += T(38, 300, sa('brahman'), { delay: 1.2 }) + T(362, 300, L(['world', 'जगत', 'જગત', 'जग']), { delay: 2.2 });
        cap = ct('asti') + ct('bhati') + ct('priya') + ' | ' + ct('nama') + ct('akara');
      } else if (st === 5) {
        b += sun(200, 50, 36) + T(300, 56, sa('ananda'), { cls: 'lbl-big', anchor: 'start' });
        b += '<ellipse cx="200" cy="340" rx="150" ry="42" fill="#2F86C8" opacity=".45"/>';
        b += '<g class="sway"><circle cx="200" cy="340" r="22" fill="#F4B740" opacity=".75"/>' + waves(110, 336, 180, 2, '#BFE0F5') + '</g>';
        b += T(200, 410, sa('anandamaya'), { cls: 'lbl-big' });
        cap = ct('anandamaya') + ' ≠ ' + ct('ananda');
      } else {
        b += '<g opacity=".8"><path d="M30 250 l60 -50 l60 50 z" fill="#C77B4A"/><rect x="42" y="250" width="96" height="70" fill="#E8CBA0" stroke="' + LINE + '" stroke-width="2"/>' +
          '<path d="M86 196 q8 -14 20 -6 l10 -2 l-8 6 q-4 10 -18 8z" fill="#222"/></g>';
        b += T(90, 350, sa('tatastha'), { cls: 'sm' });
        b += big(290, 140, scr('सत्यं'), 'pop') + big(290, 220, scr('ज्ञानम्'), 'pop', .5) + big(290, 300, scr('अनन्तं'), 'pop', 1) + big(290, 380, scr('ब्रह्म'), 'pop', 1.5);
        b += T(290, 60, sa('svarupa'), { cls: 'sm' });
        cap = ct('tatastha') + ' · ' + ct('svarupa');
      }
      return { svg: K.svg(b), cap: cap };
    }
  };

  /* ======================= Om Tat Sat ======================= */
  var VEDA = [['Ṛg · Aitareya', 'ऋग्वेद · ऐतरेय', 'ઋગ્વેદ · ઐતરેય', 'ऋग्वेद · ऐतरेय'], ['Yajur · Bṛhadāraṇyaka', 'यजुर्वेद · बृहदारण्यक', 'યજુર્વેદ · બૃહદારણ્યક', 'यजुर्वेद · बृहदारण्यक'],
    ['Sāma · Chāndogya', 'सामवेद · छांदोग्य', 'સામવેદ · છાંદોગ્ય', 'सामवेद · छांदोग्य'], ['Atharva · Māṇḍūkya', 'अथर्ववेद · मांडूक्य', 'અથર્વવેદ · માંડૂક્ય', 'अथर्ववेद · मांडूक्य']];
  var REAL = ['real', 'वास्तविक', 'વાસ્તવિક', 'वास्तव'], GOOD = ['good', 'शुभ', 'શુભ', 'शुभ'];
  var omtatsat = {
    steps: 7,
    render: function (st) {
      var b = '', cap;
      if (st === 0) {
        b += halo(200, 200, 160);
        b += big(80, 230, sa('om'), 'huge pop') + big(200, 230, sa('tat'), 'huge pop', .6) + big(320, 230, sa('sat'), 'huge pop', 1.2);
        cap = ct('om') + ct('tat') + ct('sat');
      } else if (st === 1) {
        b += big(200, 110, sa('om'), 'huge');
        ['a', 'u', 'm'].forEach(function (k, i) { var x = 60 + i * 95; b += big(x, 260, sa(k), 'pop', i * .4) + T(x, 300, sa(['jagrat', 'svapna', 'sushupti'][i]), { delay: i * .4 }); });
        b += '<circle cx="345" cy="244" r="20" fill="none" stroke="' + GOLD + '" stroke-width="4" class="pop" style="animation-delay:1.2s"/>' + T(345, 300, sa('turiya'), { delay: 1.2 });
        cap = ct('om') + ' = ' + ct('a') + ct('u') + ct('m') + ' + ' + ct('turiya');
      } else if (st === 2) {
        b += big(200, 110, sa('tat'), 'huge');
        b += halo(300, 250, 70) + T(300, 256, '?', { cls: 'lbl-xl' });
        b += '<g class="pop" style="animation-delay:.5s"><circle cx="100" cy="290" r="34" fill="#D2553A"/><path d="M100 256 q10 -18 26 -14 q-8 14 -26 14z" fill="#6FAE4E"/></g>' + cross(100, 290, 40, 1);
        cap = ct('tat');
      } else if (st === 3) {
        b += big(200, 110, sa('sat'), 'huge');
        b += '<g class="pop" style="animation-delay:.3s"><rect x="40" y="200" width="150" height="56" rx="28" fill="' + GOLD + '"/></g>' + T(115, 234, L(REAL), { cls: 'lbl-big', delay: .3 });
        b += '<g class="pop" style="animation-delay:.7s"><rect x="210" y="200" width="150" height="56" rx="28" fill="' + GOLD + '"/></g>' + T(285, 234, L(GOOD), { cls: 'lbl-big', delay: .7 });
        b += T(200, 340, sa('asat') + ' ← ' + sa('shraddha') + ' ✕', { cls: 'lbl-big faint', delay: 1.2 });
        cap = ct('sat') + ' · ' + ct('asat');
      } else if (st === 4) {
        ['mv1', 'mv2', 'mv3', 'mv4'].forEach(function (k, i) { b += card(i % 2 ? 206 : -6, i < 2 ? 20 : 214, 200, 180, ['#6C7BD9', '#3BA99C', '#E0702E', '#B0569B'][i], sa(k), L(VEDA[i]), i * .35); });
        cap = ct('mahavakya') + ' × 4';
      } else if (st === 5) {
        b += '<circle cx="110" cy="200" r="100" fill="#6C7BD9" opacity=".18" class="aura peel" style="animation-delay:1s"/>';
        for (var i = 0; i < 14; i++) b += '<circle cx="' + (110 + Math.cos(i * 2.4) * (30 + i * 4.5)).toFixed(1) + '" cy="' + (200 + Math.sin(i * 2.4) * (30 + i * 4.5)).toFixed(1) + '" r="2.5" fill="#6C7BD9" class="fadeout"/>';
        b += mini(310, 220, .3, {}, 'fadeout');
        b += T(110, 330, sa('ishvara'), { cls: 'lbl-big' }) + T(310, 330, L(['jīva', 'जीव', 'જીવ', 'जीव']), { cls: 'lbl-big' });
        b += '<circle cx="200" cy="200" r="16" fill="#FFF8D6" filter="url(#glow)" class="pop" style="animation-delay:1.8s"/>' + halo(200, 200, 70);
        b += T(200, 400, sa('mv3'), { cls: 'lbl-xl', delay: 2 });
        cap = ct('mv3');
      } else {
        [['origin', 'tanmatra'], ['bodies', 'sthula'], ['koshas', 'annamaya']].forEach(function (p, i) {
          var y = 60 + i * 80;
          b += '<g class="pop" style="animation-delay:' + (i * .3) + 's"><rect x="30" y="' + (y - 28) + '" width="200" height="52" rx="14" fill="var(--surface2)" stroke="var(--line)" stroke-width="2"/></g>' + T(130, y + 4, sa(p[1]).split(' ')[0], { cls: 'lbl-big', delay: i * .3 });
          b += '<g class="fadein" style="animation-delay:' + (1.4 + i * .3) + 's"><path d="M40 ' + y + ' L220 ' + y + '" stroke="#D2553A" stroke-width="5" stroke-linecap="round"/></g>';
        });
        b += T(130, 290, sa('adhyaropa') + ' → ' + sa('apavada'), { cls: 'lbl-big', delay: 1 });
        b += halo(320, 140, 70) + '<circle cx="320" cy="140" r="12" fill="#FFF8D6" filter="url(#glow)"/>' + T(320, 240, sa('atman'), { cls: 'lbl-big', delay: 2 });
        b += big(200, 400, sa('om') + ' ' + sa('tat') + ' ' + sa('sat'), 'pop', 2.4);
        cap = ct('adhyaropa') + K.arrow() + ct('apavada');
      }
      return { svg: K.svg(b), cap: cap };
    }
  };

  /* ======================= Stories ======================= */
  var DARK = '#3B3550';
  var story_seeker = story([
    { c: ['"Father, to whom will you give me?"', '"पिताजी, मुझे किसे देंगे?"', '"પિતાજી, મને કોને આપશો?"', '"बाबा, मला कोणाला द्याल?"'],
      d: function () { return mini(110, 240, .42, { fill: '#E2C9A6' }) + beast(250, 380, .6, true) + beast(360, 390, .5, true) + mini(310, 200, .24, { eyes: 'open' }) + bub(350, 100, '?', null, .6); } },
    { c: ['Three nights at Yama\'s door', 'यम के द्वार पर तीन रातें', 'યમના દ્વારે ત્રણ રાત', 'यमाच्या दारात तीन रात्री'],
      d: function () { return '<rect x="-20" y="-24" width="440" height="468" fill="#0E0B1A" opacity=".45"/><rect x="270" y="90" width="120" height="330" rx="8" fill="' + DARK + '" stroke="#6A5F80" stroke-width="4"/><circle cx="292" cy="260" r="6" fill="#B8A7D9"/>' +
        mini(160, 320, .3, {}) + [40, 110, 180].map(function (x, i) { return '<g class="pop" style="animation-delay:' + (i * .5) + 's">' + moon(x, 30, 16) + '</g>'; }).join('') + T(110, 90, '3', { cls: 'lbl-xl', delay: 1.6 }); } },
    { c: ['Yama offers wealth, long life, kingdoms, music', 'यम धन, आयु, राज्य, संगीत देते हैं', 'યમ ધન, આયુષ્ય, રાજ્ય, સંગીત આપે છે', 'यम धन, आयुष्य, राज्य, संगीत देतात'],
      d: function () { return halo(300, 150, 90, 'pulse') + mini(300, 240, .42, { fill: DARK, line: '#8C7BB0' }) + T(300, 410, sa('d_mrityu').split(' ')[0], { cls: 'lbl-big' }) + mini(80, 320, .26, { eyes: 'open' }) +
        '<g class="pop" style="animation-delay:.5s">' + coin(150, 120) + coin(176, 104) + crown(150, 60) + note(210, 70) + note(226, 46) + beast(170, 200, .4, true) + '</g>'; } },
    { c: ['"Keep them. I want only the truth."', '"इन्हें रखिए। मुझे केवल सत्य चाहिए।"', '"તમે જ રાખો. મને માત્ર સત્ય જોઈએ."', '"हे तुम्हीच ठेवा. मला फक्त सत्य हवे."'],
      d: function () { return mini(300, 240, .42, { fill: DARK, line: '#8C7BB0' }) + halo(90, 250, 60) + mini(90, 320, .26, { eyes: 'open' }) +
        '<g class="driftaway">' + coin(150, 120) + coin(176, 104) + crown(150, 60) + note(210, 70) + beast(170, 200, .4, true) + '</g>' + cross(180, 130, 60, .8) + T(110, 412, sa('vairagya'), { cls: 'lbl-big', delay: 1.2 }); } },
    { c: ['The good (śreyas) or the pleasant (preyas)', 'श्रेय या प्रेय', 'શ્રેય કે પ્રેય', 'श्रेय की प्रेय'],
      d: function () { return '<path d="M200 440 C200 340 120 300 40 240" fill="none" stroke="#C9B8A0" stroke-width="40" stroke-linecap="round" opacity=".6"/><path d="M200 440 C200 330 280 260 330 120" fill="none" stroke="' + GOLD + '" stroke-width="40" stroke-linecap="round" opacity=".7"/>' +
        coin(40, 200) + note(70, 190) + T(60, 290, sa('preyas'), { cls: 'lbl-big faint' }) + halo(330, 80, 70) + T(330, 180, sa('shreyas'), { cls: 'lbl-big', delay: .4 }) + mini(250, 300, .2, { eyes: 'open' }); } }
  ]);

  var CLAY = ['clay', 'मिट्टी', 'માટી', 'माती'], SALTY = ['salty', 'नमकीन', 'ખારું', 'खारट'];
  function glass(x, y) { return '<path d="M' + (x - 50) + ' ' + (y - 90) + ' L' + (x - 40) + ' ' + (y + 70) + ' L' + (x + 40) + ' ' + (y + 70) + ' L' + (x + 50) + ' ' + (y - 90) + '" fill="none" stroke="' + LINE + '" stroke-width="4"/><path d="M' + (x - 47) + ' ' + (y - 50) + ' L' + (x - 40) + ' ' + (y + 68) + ' L' + (x + 40) + ' ' + (y + 68) + ' L' + (x + 47) + ' ' + (y - 50) + ' Z" fill="#2F86C8" opacity=".35"/>'; }
  var story_origin = story([
    { c: ['"Do you know that by which the unknown becomes known?"', '"क्या तुम वह जानते हो, जिससे अनजाना जाना हुआ हो जाता है?"', '"શું તું એ જાણે છે, જેનાથી ન જાણેલું જાણેલું થાય?"', '"ज्याने न जाणलेले जाणलेले होते, ते तू जाणतोस का?"'],
      d: function () { return guru(110, 250, .42) + mini(300, 280, .32, { eyes: 'open' }) + bub(330, 150, '?', null, .5); } },
    { c: ['One clay, many names and shapes', 'एक मिट्टी, अनेक नाम और आकार', 'એક માટી, અનેક નામ અને આકાર', 'एक माती, अनेक नावे आणि आकार'],
      d: function () { return '<g class="pop"><path d="M160 90 q-10 -50 40 -56 q50 -4 44 52 q-10 20 -84 4z" fill="#A0784E" stroke="' + LINE + '" stroke-width="3"/></g>' + T(200, 120, L(CLAY), { cls: 'lbl-big' }) +
        arrowLine(180, 140, 100, 230, LINE, .3) + arrowLine(200, 140, 200, 280, LINE, .5) + arrowLine(220, 140, 300, 230, LINE, .7) +
        pot(80, 320, .7, '#A0784E', 'pop') + '<g class="pop" style="animation-delay:.5s"><ellipse cx="200" cy="340" rx="56" ry="14" fill="#A0784E" stroke="' + LINE + '" stroke-width="3"/></g>' +
        flame(320, 300, .5) + '<g class="pop" style="animation-delay:.7s"><path d="M280 320 q40 34 80 0 z" fill="#A0784E" stroke="' + LINE + '" stroke-width="3"/></g>' +
        T(200, 410, sa('nama') + ' + ' + sa('akara'), { cls: 'faint', delay: 1 }); } },
    { c: ['Salt in water: unseen, yet everywhere', 'पानी में नमक: दिखता नहीं, फिर भी सर्वत्र', 'પાણીમાં મીઠું: દેખાતું નથી, છતાં સર્વત્ર', 'पाण्यातील मीठ: दिसत नाही, तरी सर्वत्र'],
      d: function () { var s = glass(200, 240); for (var i = 0; i < 6; i++) s += '<rect x="' + (180 + i * 7) + '" y="' + (120 + (i % 2) * 8) + '" width="8" height="8" fill="#fff" stroke="#999" class="fadeout"/>';
        [[200, 200], [200, 250], [200, 300]].forEach(function (p, i) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + GOLD + '" class="pop" style="animation-delay:' + (1.4 + i * .4) + 's"/>' + T(270, p[1] + 4, L(SALTY), { anchor: 'start', delay: 1.4 + i * .4 }); });
        return s + T(200, 400, sa('sat'), { cls: 'lbl-xl', delay: 2.6 }); } },
    { c: ['Tat tvam asi: you are That', 'तत् त्वम् असि: वह तुम हो', 'તત્ ત્વમ્ અસિ: તે તું છે', 'तत् त्वम् असि: ते तू आहेस'],
      d: function () { return halo(200, 170, 170) + mini(200, 260, .45, { eyes: 'closed' }) + big(200, 70, sa('mv3'), 'pop'); } }
  ]);

  var COW = ['cow', 'गाय', 'ગાય', 'गाय'], HORSE = ['horse', 'घोड़ा', 'ઘોડો', 'घोडा'];
  function deityOrb(x, y, k, d) {
    var g = k === 'sun' ? sun(x, y, 18) : k === 'moon' ? moon(x, y, 20) : k === 'dik' ? '<g><circle cx="' + x + '" cy="' + y + '" r="22" fill="#6C7BD9"/><path d="M' + x + ' ' + (y - 18) + ' L' + (x + 5) + ' ' + y + ' L' + x + ' ' + (y + 18) + ' L' + (x - 5) + ' ' + y + 'Z M' + (x - 18) + ' ' + y + ' L' + x + ' ' + (y - 5) + ' L' + (x + 18) + ' ' + y + ' L' + x + ' ' + (y + 5) + 'Z" fill="#fff"/></g>' :
      k === 'death' ? '<circle cx="' + x + '" cy="' + y + '" r="22" fill="' + DARK + '" stroke="#8C7BB0" stroke-width="3"/>' : k === 'plant' ? '<g><circle cx="' + x + '" cy="' + y + '" r="22" fill="#6FAE4E"/><path d="M' + (x - 10) + ' ' + (y + 10) + ' q2 -24 20 -22 q0 20 -20 22z" fill="#DFF2C8"/></g>' :
      K.orb(x, y, 22, PK.ELEMENTS.filter(function (e) { return e.id === k; })[0]);
    return '<g class="pop" style="animation-delay:' + (d || 0) + 's">' + g + '</g>';
  }
  function enter(from, to, color, d, label, k) {
    return deityOrb(from[0], from[1], k, d) + K.flow('M' + from[0] + ' ' + from[1] + ' Q ' + ((from[0] + to[0]) / 2) + ' ' + (Math.min(from[1], to[1]) - 30) + ', ' + to[0] + ' ' + to[1], color, d + .3, { cls: 'draw' }) +
      K.marker(to[0], to[1], color, d + 1) + T(from[0], from[1] + 40, label, { delay: d });
  }
  var story_subtle = story([
    { c: ['The world-guardians ask for a home', 'लोकपाल घर माँगते हैं', 'લોકપાલો ઘર માગે છે', 'लोकपाल घर मागतात'],
      d: function () { var s = halo(200, 200, 80) + T(200, 206, sa('atman'), { cls: 'lbl-big' });
        [['agni', 'd_agni'], ['vayu', 'd_vayu'], ['sun', 'd_surya'], ['dik', 'd_dik'], ['moon', 'd_chandra']].forEach(function (g, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = 200 + Math.cos(a) * 150, y = 200 + Math.sin(a) * 150; s += deityOrb(x, y, g[0], i * .25) + T(x, y + 42, sa(g[1]).split(' ')[0], { delay: i * .25 }); });
        return s; } },
    { c: ['A cow? Not enough. A horse? Not enough. A human: well made!', 'गाय? पर्याप्त नहीं। घोड़ा? पर्याप्त नहीं। मनुष्य: सुंदर बना!', 'ગાય? પૂરતું નથી. ઘોડો? પૂરતું નથી. મનુષ્ય: સુંદર બન્યું!', 'गाय? पुरेसे नाही. घोडा? पुरेसे नाही. माणूस: सुंदर बनला!'],
      d: function () { return beast(70, 150, .7, true) + T(70, 210, L(COW)) + cross(70, 140, 34, .4) + beast(70, 330, .7, false) + T(70, 392, L(HORSE)) + cross(70, 320, 34, .9) +
        '<g class="pop" style="animation-delay:1.3s">' + mini(290, 240, .55, { eyes: 'open' }) + '</g>' + tick(290, 20, 1.8); } },
    { c: ['Fire → speech · Wind → breath · Sun → sight · Directions → hearing', 'अग्नि → वाणी · वायु → प्राण · सूर्य → दृष्टि · दिशाएँ → श्रवण', 'અગ્નિ → વાણી · વાયુ → પ્રાણ · સૂર્ય → દૃષ્ટિ · દિશાઓ → શ્રવણ', 'अग्नी → वाणी · वायू → प्राण · सूर्य → दृष्टी · दिशा → श्रवण'],
      d: function () { var P = K.P; return K.figure({ eyes: 'open' }) + enter([30, 160], P.mouth, '#E0702E', 0, sa('vak'), 'agni') + enter([30, 20], P.nose, '#3BA99C', .7, sa('prana'), 'vayu') +
        enter([370, 10], P.eyeR, '#F4B740', 1.4, sa('chakshu'), 'sun') + enter([370, 170], P.earR, '#6C7BD9', 2.1, sa('shrotra'), 'dik'); } },
    { c: ['Plants → hair · Moon → mind · Death → apāna · Waters → seed', 'औषधि → रोम · चंद्र → मन · मृत्यु → अपान · जल → वीर्य', 'ઔષધિ → રોમ · ચંદ્ર → મન · મૃત્યુ → અપાન · જળ → વીર્ય', 'औषधी → रोम · चंद्र → मन · मृत्यू → अपान · जल → वीर्य'],
      d: function () { var P = K.P; return K.figure({}) + enter([30, 120], P.armL, '#6FAE4E', 0, sa('roma'), 'plant') + enter([370, 60], P.heart, '#8FA3CF', .7, sa('manas'), 'moon') +
        enter([370, 250], P.navel, '#6A5F80', 1.4, sa('apana'), 'death') + enter([30, 290], P.base, '#2F86C8', 2.1, sa('shukra'), 'jala'); } },
    { c: ['Organ · its object · presiding deity, all lit by the Self', 'इंद्रिय · विषय · देवता, सब आत्मा से प्रकाशित', 'ઇન્દ્રિય · વિષય · દેવતા, બધું આત્માથી પ્રકાશિત', 'इंद्रिय · विषय · देवता, सर्व आत्म्याने प्रकाशित'],
      d: function () { return halo(200, 330, 120) + '<circle cx="200" cy="330" r="12" fill="#FFF8D6" filter="url(#glow)"/>' + T(200, 420, sa('atman'), { cls: 'lbl-big', delay: 1.4 }) +
        '<g class="pop"><ellipse cx="60" cy="120" rx="44" ry="26" fill="#fff" stroke="' + LINE + '" stroke-width="4"/><circle cx="60" cy="120" r="14" fill="#5A4636"/></g>' + T(60, 186, sa('adhyatma')) +
        '<g class="pop" style="animation-delay:.4s"><circle cx="200" cy="120" r="30" fill="#D2553A"/><path d="M200 90 q12 -20 28 -12 q-10 14 -28 12z" fill="#6FAE4E"/></g>' + T(200, 186, sa('adhibhuta'), { delay: .4 }) +
        '<g class="pop" style="animation-delay:.8s">' + sun(340, 120, 26) + '</g>' + T(340, 186, sa('adhidaiva'), { delay: .8 }) +
        [60, 200, 340].map(function (x, i) { return K.flow('M200 310 L' + x + ' 210', GOLD, 1 + i * .15, { cls: 'draw' }); }).join(''); } }
  ]);

  function horse(x, y, s, cls) {
    return at(x, y, s, '<g fill="#C9A27A" stroke="' + LINE + '" stroke-width="3" stroke-linejoin="round"><ellipse cx="0" cy="0" rx="34" ry="16"/><path d="M-26 -8 L-44 -36 L-62 -30 L-52 -20 L-38 4 Z"/><path d="M-22 12 v24 M-8 14 v22 M12 14 v22 M26 12 v24" fill="none" stroke-width="5" stroke-linecap="round"/><path d="M34 -4 q14 4 12 22" fill="none" stroke-width="4"/></g>', cls);
  }
  function chariot(taut) {
    var s = '<path d="M-20 250 L60 250" stroke="#C9B8A0" stroke-width="3" stroke-dasharray="8 8"/>';
    s += '<g><rect x="230" y="200" width="120" height="70" rx="10" fill="#B07A4A" stroke="' + LINE + '" stroke-width="4"/><circle cx="290" cy="290" r="42" fill="none" stroke="' + LINE + '" stroke-width="6"/>' +
      '<path d="M290 248 v84 M248 290 h84 M260 260 l60 60 M320 260 l-60 60" stroke="' + LINE + '" stroke-width="3"/><path d="M230 240 L150 250" stroke="' + LINE + '" stroke-width="5"/></g>';
    s += halo(310, 150, 46) + mini(310, 190, .2, { fill: '#F3D9B1' }) + mini(248, 186, .17, { eyes: 'open' });
    var hy = [180, 220, 260, 300, 340];
    hy.forEach(function (y, i) {
      var x = 100 - (i % 2) * 18;
      s += horse(x, y, .65, taut ? '' : 'sway');
      s += '<path d="M240 172 ' + (taut ? 'L' : 'Q 170 ' + (y + 50) + ',') + ' ' + (x - 30) + ' ' + (y - 18) + '" fill="none" stroke="#7A5A3A" stroke-width="2"/>';
    });
    return s;
  }
  var story_inner = story([
    { c: ['The Self is the rider; the body is the chariot', 'आत्मा रथी है; शरीर रथ', 'આત્મા રથી છે; શરીર રથ', 'आत्मा रथी; शरीर रथ'],
      d: function () { return chariot(true) + T(310, 90, sa('atman'), { cls: 'lbl-big', delay: .3 }) + T(290, 362, sa('sthula'), { cls: 'lbl-big', delay: .6 }); } },
    { c: ['Intellect = charioteer · mind = reins · senses = horses · objects = roads', 'बुद्धि = सारथी · मन = लगाम · इंद्रियाँ = घोड़े · विषय = मार्ग', 'બુદ્ધિ = સારથિ · મન = લગામ · ઇન્દ્રિયો = ઘોડા · વિષયો = માર્ગ', 'बुद्धी = सारथी · मन = लगाम · इंद्रिये = घोडे · विषय = मार्ग'],
      d: function () { return chariot(true) + T(236, 120, sa('buddhi'), { cls: 'lbl-big' }) + T(170, 150, sa('manas'), { cls: 'lbl-big', delay: .4 }) + T(80, 400, sa('jnanendriya'), { cls: 'lbl-big', delay: .8 }) + T(20, 230, sa('vishaya'), { anchor: 'start', delay: 1.2 }); } },
    { c: ['Slack reins: the horses run wild', 'ढीली लगाम: घोड़े बेकाबू', 'ઢીલી લગામ: ઘોડા બેકાબૂ', 'सैल लगाम: घोडे बेफाम'],
      d: function () { return chariot(false) + cross(60, 60, 30, .6); } },
    { c: ['Firm reins: the rider reaches the goal', 'दृढ़ लगाम: रथी लक्ष्य तक पहुँचता है', 'મજબૂત લગામ: રથી લક્ષ્ય સુધી પહોંચે છે', 'घट्ट लगाम: रथी ध्येयापर्यंत पोहोचतो'],
      d: function () { return halo(40, 30, 70) + T(0, 120, L(['the highest goal', 'परम पद', 'પરમ પદ', 'परम पद']), { cls: 'lbl-big', anchor: 'start' }) + chariot(true) + tick(330, 40, .6); } }
  ]);

  var SENSES = [['vak', [70, 120]], ['manas', [330, 70]], ['chakshu', [340, 170]], ['shrotra', [60, 230]]];
  var story_pranas = story([
    { c: ['Each power: "I hold up this body!"', 'हर शक्ति: "इस शरीर को मैं धारण करती हूँ!"', 'દરેક શક્તિ: "આ શરીરને હું ધારણ કરું છું!"', 'प्रत्येक शक्ती: "हे शरीर मी धारण करते!"'],
      d: function () { var s = K.figure({ eyes: 'open' }); SENSES.forEach(function (p, i) { s += bub(p[1][0], p[1][1], '!', '#D2553A', i * .3) + T(p[1][0], p[1][1] + 46, sa(p[0]), { delay: i * .3 }); }); return s; } },
    { c: ['Prāṇa: "It is I, in five ways"', 'प्राण: "मैं ही, पाँच रूपों में"', 'પ્રાણ: "હું જ, પાંચ રૂપે"', 'प्राण: "मीच, पाच रूपांत"'],
      d: function () { var s = K.figure({}) + K.glowAt(200, 192, 34, '#3BA99C', 'pulse'); var cols = ['#3BA99C', '#9A6B3F', '#6C7BD9', '#E0702E', '#D2553A'], ends = [[200, 100], [200, 320], [110, 300], [200, 30], [280, 260]];
        ends.forEach(function (e, i) { s += K.flow('M200 192 L' + e[0] + ' ' + e[1], cols[i], i * .2, { cls: 'draw' }); }); return s + T(250, 200, sa('prana'), { cls: 'lbl-big', anchor: 'start' }); } },
    { c: ['Prāṇa rises: all follow, like bees after their queen', 'प्राण उठा: सब पीछे, जैसे रानी के पीछे मधुमक्खियाँ', 'પ્રાણ ઊઠ્યો: બધા પાછળ, જેમ રાણી પાછળ મધમાખીઓ', 'प्राण उठला: सर्व मागे, जशा राणीमागे मधमाश्या'],
      d: function () { var s = '<g opacity=".3">' + K.figure({}) + '</g>'; var paths = ['M200 192 C200 120 220 60 260 -10', 'M200 112 C190 60 230 20 260 -10', 'M210 89 C240 60 250 20 260 -10', 'M232 92 C270 60 270 20 260 -10', 'M200 248 C150 150 200 40 260 -10'];
        s += '<circle r="10" fill="' + GOLD + '" stroke="#B8860B" stroke-width="2"><animateMotion dur="2.4s" repeatCount="indefinite" path="M200 192 C210 120 230 50 260 -10"/></circle>';
        paths.forEach(function (d) { s += K.particles(d, '#E8B93C', 3, 2.4, 4); }); return s + T(330, 40, sa('prana'), { cls: 'lbl-big' }); } },
    { c: ['All the senses praise prāṇa', 'सब इंद्रियाँ प्राण की स्तुति करती हैं', 'બધી ઇન્દ્રિયો પ્રાણની સ્તુતિ કરે છે', 'सर्व इंद्रिये प्राणाची स्तुती करतात'],
      d: function () { var s = K.figure({ eyes: 'closed' }) + K.glowAt(200, 192, 40, '#3BA99C', 'pulse') + T(200, 260, sa('prana'), { cls: 'lbl-big' }); SENSES.forEach(function (p, i) { s += T(p[1][0], p[1][1], sa(p[0]), { delay: i * .2 }) + arrowLine(p[1][0] + (p[1][0] < 200 ? 30 : -30), p[1][1] + 10, 200 + (p[1][0] < 200 ? -40 : 40), 192, '#3BA99C', i * .2); }); return s; } }
  ]);

  function rings(lit, d) {
    var s = '', R = [190, 152, 114, 76, 38, 0];
    PK.KOSHAS.forEach(function (k, i) {
      var on = lit.indexOf(i) >= 0, inner = i === 4;
      var r = inner ? R[4] : (R[i] + R[i + 1]) / 2, w = inner ? 0 : R[i] - R[i + 1];
      s += '<circle cx="200" cy="215" r="' + r + '" fill="' + (inner ? k.color : 'none') + '" stroke="' + k.color + '" stroke-width="' + w + '" opacity="' + (on ? .9 : .14) + '"' + (on && d ? ' class="pop" style="animation-delay:' + (d * lit.indexOf(i)) + 's"' : '') + '/>';
    });
    return s;
  }
  var KOSHA_Y = [45, 83, 121, 159, 215];
  function koshaLabels(list, d) { return list.map(function (i, j) { return T(200, KOSHA_Y[i] + 6, sa(PK.KOSHAS[i].id).split(' ')[0], { cls: 'lbl-big', delay: (d || 0) * j }); }).join(''); }
  var story_koshas = story([
    { c: ['"Sir, teach me Brahman"', '"भगवन्, मुझे ब्रह्म सिखाइए"', '"ભગવન્, મને બ્રહ્મ શીખવો"', '"भगवन्, मला ब्रह्म शिकवा"'],
      d: function () { return guru(300, 240, .42) + T(300, 410, L(['Varuṇa', 'वरुण', 'વરુણ', 'वरुण']), { cls: 'lbl-big' }) + mini(90, 290, .3, { eyes: 'open' }) + T(90, 410, L(['Bhṛgu', 'भृगु', 'ભૃગુ', 'भृगु']), { cls: 'lbl-big' }) + bub(120, 150, '?', null, .5); } },
    { c: ['Food is Brahman? "Reflect again."', 'अन्न ब्रह्म है? "फिर विचार करो।"', 'અન્ન બ્રહ્મ છે? "ફરી વિચાર કર."', 'अन्न ब्रह्म आहे? "पुन्हा विचार कर."'],
      d: function () { return rings([0]) + koshaLabels([0]) + T(360, 40, '↺', { cls: 'lbl-xl', delay: .8 }); } },
    { c: ['Prāṇa? Mind? Understanding? Again and again.', 'प्राण? मन? विज्ञान? बार-बार।', 'પ્રાણ? મન? વિજ્ઞાન? વારંવાર.', 'प्राण? मन? विज्ञान? पुन्हा पुन्हा.'],
      d: function () { return rings([1, 2, 3], .8) + koshaLabels([1, 2, 3], .8) + T(360, 40, '↺ ↺ ↺', { cls: 'lbl-xl', delay: 2.4 }); } },
    { c: ['Ānanda is Brahman', 'आनंद ब्रह्म है', 'આનંદ બ્રહ્મ છે', 'आनंद ब्रह्म आहे'],
      d: function () { return rings([]) + halo(200, 215, 120) + '<circle cx="200" cy="215" r="18" fill="#FFF8D6" filter="url(#glow)" class="pop"/>' + T(200, 300, sa('ananda') + ' = ' + sa('brahman'), { cls: 'lbl-xl', delay: .6 }); } },
    { c: ['Bhṛgu\'s five steps = the five sheaths', 'भृगु के पाँच चरण = पाँच कोश', 'ભૃગુનાં પાંચ પગલાં = પાંચ કોશ', 'भृगूंच्या पाच पायऱ्या = पाच कोश'],
      d: function () { return rings([0, 1, 2, 3, 4], .25) + koshaLabels([0, 1, 2, 3], .25) + '<circle cx="200" cy="215" r="14" fill="#FFF8D6" filter="url(#glow)"/>' + T(200, 440, sa('ananda') + ' ≠ ' + sa('anandamaya'), { cls: 'lbl-big', delay: 1.4 }); } }
  ]);

  var INDRA = { fill: '#F2D16B' }, VIRO = { fill: '#9C6BB0', line: '#5B3B6E' };
  var story_bodies = story([
    { c: ['Indra and Virochana come, fuel in hand', 'इंद्र और विरोचन, हाथ में समिधा', 'ઇન્દ્ર અને વિરોચન, હાથમાં સમિધ', 'इंद्र आणि विरोचन, हातात समिधा'],
      d: function () { return guru(200, 140, .34) + T(200, 236, L(['Prajāpati', 'प्रजापति', 'પ્રજાપતિ', 'प्रजापती']), { cls: 'lbl-big' }) +
        mini(80, 330, .28, INDRA) + sticks(100, 352) + T(80, 420, L(['Indra', 'इंद्र', 'ઇન્દ્ર', 'इंद्र']), { cls: 'lbl-big' }) +
        mini(320, 330, .28, VIRO) + sticks(340, 352) + T(320, 420, L(['Virochana', 'विरोचन', 'વિરોચન', 'विरोचन']), { cls: 'lbl-big' }) + T(200, 300, '32', { cls: 'lbl-xl', delay: .6 }); } },
    { c: ['Virochana: "the body is the Self"', 'विरोचन: "शरीर ही आत्मा है"', 'વિરોચન: "શરીર જ આત્મા છે"', 'विरोचन: "शरीर हाच आत्मा"'],
      d: function () { return '<ellipse cx="200" cy="330" rx="150" ry="50" fill="#2F86C8" opacity=".4" stroke="' + LINE + '" stroke-width="3"/>' +
        mini(200, 190, .4, Object.assign({ eyes: 'open' }, VIRO)) + crown(200, 120) +
        '<g class="o0" transform="translate(200 330) scale(.4 -.22) translate(-200 -200)" opacity=".45">' + K.figure(VIRO) + '</g>' +
        T(200, 420, sa('sthula') + ' = ' + sa('atman') + ' ?', { cls: 'lbl-big', delay: .8 }) + tick(320, 120, 1.2); } },
    { c: ['Indra doubts. "The dreamer is the Self"?', 'इंद्र का संशय। "स्वप्न देखने वाला आत्मा है"?', 'ઇન્દ્રની શંકા. "સ્વપ્ન જોનાર આત્મા છે"?', 'इंद्राला शंका. "स्वप्न पाहणारा आत्मा"?'],
      d: function () { return K.sky(1) + mini(130, 260, .45, INDRA) + bub(60, 140, '?', null, .5) + T(300, 200, sa('taijasa'), { cls: 'lbl-big', delay: .8 }); } },
    { c: ['The deep sleeper? He knows nothing at all.', 'सुषुप्त? वह कुछ भी नहीं जानता।', 'સુષુપ્ત? તે કંઈ જ જાણતો નથી.', 'सुषुप्त? तो काहीच जाणत नाही.'],
      d: function () { return K.sky(2) + mini(200, 250, .45, { outlineOnly: true, dash: true, line: '#6A5F80' }) + '<circle cx="200" cy="232" r="14" fill="url(#g-seed)" class="pulse"/>' + bub(330, 120, '?', null, .5) + T(200, 400, sa('prajna'), { cls: 'lbl-big' }); } },
    { c: ['The Self behind all three, touched by none', 'तीनों के पीछे आत्मा, किसी से अछूता', 'ત્રણેયની પાછળ આત્મા, કોઈથી અસ્પૃષ્ટ', 'तिन्हींच्या मागे आत्मा, कशानेही अस्पर्शित'],
      d: function () { var s = '';
        [0, 1, 2].forEach(function (i) { s += mini(60 + i * 140, 220, .3, { eyes: i === 0 ? 'open' : 'closed', fill: ['#EAD8C0', 'url(#g-subtle)', '#4A4060'][i] }) + T(60 + i * 140, 300, sa(['jagrat', 'svapna', 'sushupti'][i])); });
        return s + '<path d="M-10 200 L410 200" stroke="' + GOLD + '" stroke-width="8" stroke-linecap="round" opacity=".85" class="fadein"/>' + T(200, 380, sa('atman') + ' · 101', { cls: 'lbl-xl', delay: .8 }); } }
  ]);

  var story_satchit = story([
    { c: ['The gods: "This victory is ours"', 'देवता: "यह विजय हमारी है"', 'દેવતાઓ: "આ વિજય અમારો છે"', 'देवता: "हा विजय आमचा"'],
      d: function () { return mini(80, 260, .3, { fill: '#F2A36B' }) + mini(200, 250, .32, INDRA) + mini(320, 260, .3, { fill: '#9FD8CF' }) + crown(200, 160) + bub(200, 70, '!', '#D2553A', .4) +
        T(80, 360, sa('d_agni').split(' ')[0]) + T(200, 360, sa('d_indra')) + T(320, 360, sa('d_vayu').split(' ')[0]); } },
    { c: ['Agni cannot burn a single blade of grass', 'अग्नि एक तिनका भी नहीं जला सके', 'અગ્નિ એક તણખલું પણ બાળી ન શક્યા', 'अग्नी एक काडीही जाळू शकले नाहीत'],
      d: function () { return halo(330, 120, 110, 'pulse') + T(330, 250, L(['yakṣa', 'यक्ष', 'યક્ષ', 'यक्ष']), { cls: 'lbl-big' }) + grass(200, 380) + deityOrb(70, 250, 'agni') +
        '<g class="flicker">' + flame(130, 330, .6) + flame(160, 350, .5) + '</g>' + cross(200, 300, 30, 1.2) + T(70, 300, sa('d_agni').split(' ')[0]); } },
    { c: ['Vāyu cannot move it', 'वायु उसे हिला न सके', 'વાયુ તેને હલાવી ન શક્યા', 'वायू ती हलवू शकले नाहीत'],
      d: function () { var s = halo(330, 120, 110, 'pulse') + grass(200, 380) + deityOrb(60, 250, 'vayu') + T(60, 300, sa('d_vayu').split(' ')[0]);
        ['M70 280 C120 300 160 330 196 330', 'M70 260 C120 270 170 300 200 310', 'M70 300 C110 330 150 350 196 350'].forEach(function (d) { s += K.particles(d, '#3BA99C', 4, 1.2, 3.5); });
        return s + cross(200, 300, 30, 1.2); } },
    { c: ['Umā: "That was Brahman"', 'उमा: "वह ब्रह्म था"', 'ઉમા: "તે બ્રહ્મ હતું"', 'उमा: "ते ब्रह्म होते"'],
      d: function () { return '<g class="fadeout">' + halo(330, 120, 110) + '</g>' + guru(250, 250, .46, { fill: '#F2C6D3' }) + T(250, 410, L(['Umā Haimavatī', 'उमा हैमवती', 'ઉમા હૈમવતી', 'उमा हैमवती']), { cls: 'lbl-big' }) + mini(70, 320, .26, INDRA) + T(250, 30, sa('brahman'), { cls: 'lbl-xl', delay: 1 }); } },
    { c: ['That by which the mind thinks: Chit', 'जिससे मन सोचता है: चित्', 'જેનાથી મન વિચારે છે: ચિત્', 'ज्यामुळे मन विचार करते: चित्'],
      d: function () { var s = halo(200, 210, 110) + '<circle cx="200" cy="210" r="16" fill="#FFF8D6" filter="url(#glow)"/>' + T(200, 260, sa('chit'), { cls: 'lbl-xl' });
        var items = [[50, 60, 'agni', 'd_agni'], [350, 60, 'vayu', 'd_vayu'], [50, 370, 'eye', 'chakshu'], [350, 370, 'mind', 'manas']];
        items.forEach(function (it, i) {
          var g = it[2] === 'eye' ? '<g class="pop" style="animation-delay:' + (i * .3) + 's"><ellipse cx="' + it[0] + '" cy="' + it[1] + '" rx="30" ry="18" fill="#fff" stroke="' + LINE + '" stroke-width="3"/><circle cx="' + it[0] + '" cy="' + it[1] + '" r="9" fill="#5A4636"/></g>' :
            it[2] === 'mind' ? '<g class="pop" style="animation-delay:' + (i * .3) + 's">' + K.cloud(it[0] - 10, it[1]).replace('class="bubble pop"', 'class="bubble"') + '</g>' : deityOrb(it[0], it[1], it[2], i * .3);
          s += g + K.flow('M200 210 L' + it[0] + ' ' + it[1], GOLD, .4 + i * .3, { cls: 'draw' }) + T(it[0], it[1] + (it[1] < 200 ? 46 : -36), sa(it[3]).split(' ')[0], { delay: i * .3 });
        });
        return s; } }
  ]);

  function tenMen(nums, leaderGlow) {
    var s = waves(-20, 70, 440, 3) + '<rect x="-20" y="40" width="440" height="80" fill="#2F86C8" opacity=".15"/>';
    for (var i = 0; i < 10; i++) {
      var x = 20 + i * 40;
      if (i === 0 && leaderGlow) s += halo(x, 300, 46);
      s += mini(x, 330, .13, { eyes: 'open', fill: i === 0 ? '#F2D16B' : undefined });
      if (nums && nums[i]) s += T(x, 270, nums[i], { cls: i === 0 ? 'lbl-big' : '', delay: (nums[i] === '10' ? 9 : i) * .18 });
    }
    return s;
  }
  var NINE = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var story_witness = story([
    { c: ['"Only nine! One of us has drowned!"', '"केवल नौ! हम में से एक डूब गया!"', '"માત્ર નવ! આપણામાંથી એક ડૂબી ગયો!"', '"फक्त नऊ! आपल्यापैकी एक बुडाला!"'],
      d: function () { return tenMen(NINE) + bub(20, 200, '9?', '#D2553A', 2); } },
    { c: ['Each one counts everyone except himself', 'हर एक अपने सिवा सबको गिनता है', 'દરેક પોતાના સિવાય બધાને ગણે છે', 'प्रत्येकजण स्वतःशिवाय सर्वांना मोजतो'],
      d: function () { return tenMen(NINE) + '<circle cx="20" cy="320" r="34" fill="none" stroke="#D2553A" stroke-width="4" stroke-dasharray="6 6" class="pop"/>' + T(20, 400, '✕', { cls: 'lbl-xl', delay: .4 }); } },
    { c: ['A passer-by: "You are the tenth"', 'राहगीर: "दसवें तुम हो"', 'વટેમાર્ગુ: "દસમો તું છે"', 'वाटसरू: "दहावा तू आहेस"'],
      d: function () { return guru(330, 200, .24) + tenMen(NINE.slice(0, 10).map(function (n, i) { return i === 0 ? '10' : n; })) + arrowLine(300, 220, 40, 290, GOLD, 1.6); } },
    { c: ['Never lost, only overlooked', 'कभी खोया नहीं, केवल भूला गया', 'ક્યારેય ખોવાયો નહીં, માત્ર ભુલાયો', 'कधी हरवला नाही, फक्त विसरला गेला'],
      d: function () { return tenMen(null, true) + T(20, 200, '10', { cls: 'lbl-xl' }) + T(220, 420, '10 = ' + sa('atman'), { cls: 'lbl-big', delay: .6 }); } }
  ]);

  function spacePot(x, inside) {
    return at(x, 230, 2.4, POT.replace('FILL', '#C77B4A')) + '<ellipse cx="' + x + '" cy="240" rx="110" ry="96" fill="' + (inside || '#DCEFFB') + '"/>';
  }
  var story_return = story([
    { c: ['Space inside a pot', 'घड़े के भीतर आकाश', 'ઘડાની અંદર આકાશ', 'घड्यातील आकाश'],
      d: function () { return SKY_SPACE + spacePot(200) + T(200, 246, sa('akasha'), { cls: 'lbl-big' }); } },
    { c: ['The pot moves; the space does not', 'घड़ा चलता है; आकाश नहीं', 'ઘડો ચાલે છે; આકાશ નહીં', 'घडा हलतो; आकाश नाही'],
      d: function () { return SKY_SPACE + '<g class="slide">' + spacePot(200, '#E4E4E4') + '<circle cx="180" cy="230" r="20" fill="#999" opacity=".5"/><circle cx="215" cy="250" r="26" fill="#999" opacity=".45"/></g>' + T(200, 420, sa('akasha') + ' ✓', { cls: 'lbl-big', delay: .8 }); } },
    { c: ['The pot breaks: it was always one space', 'घड़ा फूटा: वह सदा एक ही आकाश था', 'ઘડો ફૂટ્યો: તે સદા એક જ આકાશ હતું', 'घडा फुटला: ते नेहमीच एकच आकाश होते'],
      d: function () { var s = SKY_SPACE + '<circle cx="200" cy="230" r="40" fill="#BFE0F5" class="expand-soft"/>';
        [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1.3]].forEach(function (v, i) { s += '<g class="shard" style="--dx:' + (v[0] * 160) + 'px;--dy:' + (v[1] * 140) + 'px"><path d="M' + (190 + i * 4) + ' 220 l30 -10 l-8 36 z" fill="#C77B4A" stroke="' + LINE + '" stroke-width="2"/></g>'; });
        return s + T(200, 420, sa('akasha'), { cls: 'lbl-xl', delay: 1.2 }); } },
    { c: ['The wave was water all along', 'लहर आरंभ से जल ही थी', 'મોજું શરૂઆતથી પાણી જ હતું', 'लाट सुरुवातीपासून पाणीच होती'],
      d: function () { return '<rect x="-20" y="250" width="440" height="200" fill="#2F86C8" opacity=".5"/>' + '<g class="bob"><path d="M100 252 C150 252 160 150 210 150 C250 150 250 210 300 252 Z" fill="#2F86C8" opacity=".85"/></g>' + waves(-20, 280, 440, 3, '#BFE0F5') +
        T(205, 130, L(['wave', 'लहर', 'મોજું', 'लाट']), { cls: 'lbl-big' }) + T(200, 400, sa('jala') + ' = ' + sa('atman'), { cls: 'lbl-xl', delay: .8 }); } }
  ]);

  Object.assign(S, {
    seeker: seeker, satchit: satchit, omtatsat: omtatsat,
    story_seeker: story_seeker, story_origin: story_origin, story_subtle: story_subtle, story_inner: story_inner, story_pranas: story_pranas,
    story_koshas: story_koshas, story_bodies: story_bodies, story_satchit: story_satchit, story_witness: story_witness, story_return: story_return
  });
})();
