/* Panchikarana — app shell, router, widgets, practice. No build step. */
(function () {
  'use strict';
  var PK = window.PK, I = window.I18N;
  var TERMS = PK.TERMS;

  /* ---------- Persistent settings (per viewer, best-effort) ---------- */
  function load(k, d) { try { var v = localStorage.getItem('pk.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('pk.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }

  function guessLang() {
    var n = ((navigator.language || 'en') + '').slice(0, 2);
    return I.IDX[n] !== undefined ? n : 'en';
  }
  var S = {
    lang: load('lang', guessLang()),
    roman: load('roman', true),
    theme: load('theme', 'auto'),
    visited: load('visited', {}),
    quizBest: load('quizBest', 0),
    boxes: load('boxes', {})
  };
  if (I.IDX[S.lang] === undefined) S.lang = 'en';

  /* ---------- Text helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tx(arr) { if (!arr) return ''; var v = arr[I.IDX[S.lang]]; return v === undefined || v === null ? arr[0] : v; }
  function ui(k) { return tx(I.UI[k]) || k; }
  function script(s) { return S.lang === 'gu' ? I.toGujarati(s) : s; }
  function saOf(key) { return script(TERMS[key].sa); }
  function glossOf(key) { var t = TERMS[key]; return t.gloss ? tx(t.gloss) : ''; }
  function norm(s) { return String(s).replace(/[\s()\/\-]/g, ''); }

  // Rich term: Sanskrit in the reader's script + transliteration + meaning
  function term(key, cls) {
    var t = TERMS[key]; if (!t) return esc(key);
    var sa = saOf(key), g = glossOf(key);
    var h = '<span class="term ' + (cls || '') + '"><span class="sa">' + esc(sa) + '</span>';
    if (S.roman) h += '<span class="ro">' + esc(t.ro) + '</span>';
    if (g && norm(g) !== norm(sa)) h += '<span class="gl">' + esc(g) + '</span>';
    return h + '</span>';
  }
  // One-line plain label (used in quiz options)
  function termPlain(key) {
    var sa = saOf(key), g = glossOf(key);
    var s = sa;
    if (S.roman && S.lang === 'en') s += ' (' + TERMS[key].ro + ')';
    if (g && norm(g) !== norm(sa)) s += ' · ' + g;
    return s;
  }
  function el(id) { for (var i = 0; i < PK.ELEMENTS.length; i++) if (PK.ELEMENTS[i].id === id) return PK.ELEMENTS[i]; return null; }
  function chapterIndex(id) { for (var i = 0; i < PK.CHAPTERS.length; i++) if (PK.CHAPTERS[i].id === id) return i; return -1; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  window.PKH = { esc: esc, tx: tx, ui: ui, saOf: saOf, glossOf: glossOf, term: term, script: script };

  /* ---------- Shell ---------- */
  var $main = document.getElementById('main');
  var $nav = document.getElementById('nav');
  var $lang = document.getElementById('lang');
  var $theme = document.getElementById('themeBtn');
  var $title = document.getElementById('appTitle');

  function applyTheme() {
    var r = document.documentElement;
    if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme);
    $theme.textContent = S.theme === 'dark' ? '☾' : S.theme === 'light' ? '☀' : 'A';
    $theme.setAttribute('aria-label', ui('theme') + ': ' + S.theme);
  }
  function renderShell() {
    document.documentElement.lang = S.lang;
    $title.textContent = ui('appName');
    document.title = ui('appName');
    $lang.innerHTML = I.LANGS.map(function (l) {
      return '<option value="' + l.code + '"' + (l.code === S.lang ? ' selected' : '') + '>' + esc(l.label) + '</option>';
    }).join('');
    var route = (location.hash || '#/').split('/')[1] || '';
    var items = [['', 'navLearn', '☰'], ['map', 'navMap', '◎'], ['practice', 'navPractice', '✦'], ['glossary', 'navGlossary', '⌕']];
    $nav.innerHTML = items.map(function (it) {
      var active = (route === it[0]) || (it[0] === '' && route === 'c');
      return '<a href="#/' + it[0] + '" class="' + (active ? 'on' : '') + '"' + (active ? ' aria-current="page"' : '') + '><span class="ic" aria-hidden="true">' + it[2] + '</span><span>' + esc(ui(it[1])) + '</span></a>';
    }).join('');
  }
  $lang.addEventListener('change', function () { S.lang = $lang.value; save('lang', S.lang); render(); });
  $theme.addEventListener('click', function () {
    S.theme = S.theme === 'auto' ? 'light' : S.theme === 'light' ? 'dark' : 'auto';
    save('theme', S.theme); applyTheme();
  });

  /* ---------- Router ---------- */
  var widgetState = {};
  function render() {
    renderShell();
    var parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    var html;
    if (parts[0] === 'c' && chapterIndex(parts[1]) >= 0) html = viewChapter(parts[1], parts[2] === 'hide');
    else if (parts[0] === 'map') html = viewMap();
    else if (parts[0] === 'practice' && parts[1] === 'cards') html = viewCards();
    else if (parts[0] === 'practice' && parts[1] === 'quiz') html = viewQuiz();
    else if (parts[0] === 'practice') html = viewPractice();
    else if (parts[0] === 'glossary') html = viewGlossary();
    else html = viewHome();
    $main.innerHTML = html;
    if (parts[0] === 'glossary') bindGlossary();
    if (parts[0] === 'c' && chapterIndex(parts[1]) >= 0) startPlayer(parts[1], parts[2] === 'hide');
  }
  window.addEventListener('hashchange', function () { closeZoom(); if (typeof stopPlayer === 'function') stopPlayer(); widgetState = {}; quiz = null; deck = null; render(); window.scrollTo(0, 0); });

  /* ---------- Home ---------- */
  function viewHome() {
    var nextIdx = 0;
    for (var i = 0; i < PK.CHAPTERS.length; i++) if (!S.visited[PK.CHAPTERS[i].id]) { nextIdx = i; break; }
    var doneCount = Object.keys(S.visited).filter(function (k) { return chapterIndex(k) >= 0; }).length;
    var h = '<section class="hero"><div class="hero-fig">' + window.SCENES.hero() + '</div>' +
      '<h1>' + esc(ui('appName')) + '</h1><p>' + esc(ui('tagline')) + '</p>' +
      '<a class="btn primary" href="#/c/' + PK.CHAPTERS[nextIdx].id + '">' + esc(doneCount ? ui('continueL') : ui('start')) + ' →</a></section>';
    h += '<div class="progress"><span>' + esc(ui('progress')) + '</span><div class="bar"><i style="width:' + Math.round(100 * doneCount / PK.CHAPTERS.length) + '%"></i></div><b>' + doneCount + ' ' + esc(ui('of')) + ' ' + PK.CHAPTERS.length + '</b></div>';
    h += '<ol class="tiles">' + PK.CHAPTERS.map(function (c, i) {
      return '<li><a href="#/c/' + c.id + '"><span class="thumb">' + window.SCENES[c.widget].render(window.SCENES[c.widget].steps - 1).svg + '</span>' +
        '<span class="tt"><span class="num">' + (i + 1) + '</span>' + esc(tx(c.title)) + (S.visited[c.id] ? ' <span class="tick" aria-label="' + esc(ui('done')) + '">✓</span>' : '') + '</span></a></li>';
    }).join('') + '</ol>';
    h += settingsBlock();
    h += '<p class="note">' + esc(ui('note')) + '</p>';
    return h;
  }
  function settingsBlock() {
    return '<section class="card settings"><div class="row"><span>' + esc(ui('language')) + '</span><div class="seg">' +
      I.LANGS.map(function (l) { return '<button data-act="lang" data-v="' + l.code + '" class="' + (l.code === S.lang ? 'on' : '') + '">' + esc(l.short) + '</button>'; }).join('') +
      '</div></div><label class="row"><span>' + esc(ui('roman')) + '</span><input type="checkbox" data-act="roman"' + (S.roman ? ' checked' : '') + '></label></section>';
  }

  /* ---------- Chapter ---------- */
  var TABLE_WIDGETS = { seeker: 1, gross: 1, subtle: 1, pranas: 1, bodies: 1, panchikarana: 1, inner: 1 };
  function viewChapter(id, hide) {
    var i = chapterIndex(id), c = PK.CHAPTERS[i], sc = window.SCENES[c.widget];
    S.visited[id] = 1; save('visited', S.visited);
    var h = '<article class="chapter"><p class="eyebrow">' + esc(ui('chapter')) + ' ' + (i + 1) + ' / ' + PK.CHAPTERS.length + '</p>' +
      '<h1>' + esc(tx(c.title)) + '</h1>';
    if (c.story) {
      h += '<div class="ptabs" role="tablist"><button role="tab" class="on" data-act="ptab" data-v="0">' + esc(ui('explain')) + '</button>' +
        '<button role="tab" data-act="ptab" data-v="1"><span class="st-ic">❖</span> ' + esc(ui('story')) + ': ' + esc(tx(c.story.title)) + '</button></div>';
    }
    h += '<div class="player" id="player"><button class="zclose round" data-act="zclose" aria-label="Close">✕</button>' +
      '<div class="stagewrap" id="stagewrap"><div class="stage" id="stage"></div><button class="zbtn" data-act="zopen" aria-label="' + esc(ui('zoom')) + '">⤢</button>' +
      '<button class="startov" data-act="pplay"><span class="pbig">▶</span><span>' + esc(ui('listen')) + '</span></button></div>' +
      '<div class="zhint">' + esc(ui('zoomHint')) + '</div><div class="cap" id="cap" aria-live="polite"></div><p class="sub" id="sub"></p>' +
      '<div class="pctl"><button class="round" data-act="pprev" aria-label="' + esc(ui('prev')) + '">‹</button>' +
      '<div class="dots" id="dots"></div>' +
      '<button class="round" id="pvoice" data-act="voice" aria-label="' + esc(ui('voice')) + '"></button>' +
      '<button class="round" id="pplay" data-act="pplay" aria-label="' + esc(ui('play')) + '">▶</button>' +
      '<button class="round primary" data-act="pnext" aria-label="' + esc(ui('next')) + '">›</button></div></div>';
    h += '<p class="storysrc" id="storysrc" hidden></p>';
    if (c.verse) {
      h += '<figure class="verse"><blockquote lang="sa">' + esc(script(c.verse.sa)) + '</blockquote>' + (S.roman ? '<p class="ro">' + esc(c.verse.ro) + '</p>' : '') +
        '<figcaption><span>' + esc(tx(c.verse.mean)) + '</span><cite>' + esc(c.verse.src) + '</cite></figcaption></figure>';
    }
    if (TABLE_WIDGETS[c.widget]) {
      h += '<details class="more"' + (hide ? ' open' : '') + '><summary>▦ ' + esc(ui('table')) + '</summary><div class="widget" data-widget="' + c.widget + '">' + WIDGETS[c.widget](hide) + '</div></details>';
    }
    h += '<details class="more"><summary>¶ ' + esc(ui('read')) + '</summary><p class="lead">' + esc(tx(c.intro)) + '</p>';
    if (c.remember && c.remember.length) {
      h += '<aside class="remember"><h2>' + esc(ui('remember')) + '</h2><ul>' + c.remember.map(function (r) { return '<li>' + esc(tx(r)) + '</li>'; }).join('') + '</ul></aside>';
    }
    h += '</details>';
    h += '<nav class="pager">' +
      (i > 0 ? '<a class="btn" href="#/c/' + PK.CHAPTERS[i - 1].id + '">← ' + esc(ui('prev')) + '</a>' : '<span></span>') +
      (i < PK.CHAPTERS.length - 1 ? '<a class="btn primary" href="#/c/' + PK.CHAPTERS[i + 1].id + '">' + esc(ui('next')) + ' →</a>' : '<a class="btn primary" href="#/practice">' + esc(ui('navPractice')) + ' →</a>') +
      '</nav></article>';
    return h;
  }

  /* ---------- Zoom: full-screen picture with pinch, drag, double-tap ---------- */
  var Z = { on: false, s: 1, x: 0, y: 0 }, ptrs = {}, pinch = null, lastTap = 0, drag = null;
  function zApply() {
    var st = document.getElementById('stage'); if (!st) return;
    st.style.transform = Z.on ? 'translate(' + Z.x + 'px,' + Z.y + 'px) scale(' + Z.s + ')' : '';
  }
  function zAt(px, py, ns) { // zoom keeping point (px,py) of the wrapper fixed
    ns = Math.max(1, Math.min(6, ns));
    Z.x = px - (px - Z.x) * (ns / Z.s); Z.y = py - (py - Z.y) * (ns / Z.s); Z.s = ns;
    if (Z.s <= 1.001) { Z.s = 1; Z.x = 0; Z.y = 0; }
    zApply();
  }
  function openZoom() {
    var pl = document.getElementById('player'); if (!pl) return;
    Z.on = true; Z.s = 1; Z.x = 0; Z.y = 0;
    pl.classList.add('zoomed'); document.body.classList.add('noscroll'); zApply();
  }
  function closeZoom() {
    var pl = document.getElementById('player');
    Z.on = false; Z.s = 1; Z.x = 0; Z.y = 0;
    if (pl) pl.classList.remove('zoomed'); document.body.classList.remove('noscroll'); zApply();
  }
  function rel(e) { var r = document.getElementById('stagewrap').getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  document.addEventListener('pointerdown', function (e) {
    if (!Z.on || !e.target.closest('#stagewrap')) return;
    ptrs[e.pointerId] = rel(e);
    var ids = Object.keys(ptrs);
    if (ids.length === 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: Z.s, x: Z.x, y: Z.y, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      drag = null;
    } else if (ids.length === 1) {
      var now = Date.now(), p = ptrs[ids[0]];
      if (now - lastTap < 300) { zAt(p.x, p.y, Z.s > 1.5 ? 1 : 2.5); lastTap = 0; }
      else lastTap = now;
      drag = { x: p.x, y: p.y, zx: Z.x, zy: Z.y };
    }
  });
  document.addEventListener('pointermove', function (e) {
    if (!Z.on || !(e.pointerId in ptrs)) return;
    ptrs[e.pointerId] = rel(e);
    var ids = Object.keys(ptrs);
    if (ids.length === 2 && pinch) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
      var ns = Math.max(1, Math.min(6, pinch.s * d / pinch.d));
      Z.x = pinch.mx - (pinch.mx - pinch.x) * (ns / pinch.s) + ((a.x + b.x) / 2 - pinch.mx);
      Z.y = pinch.my - (pinch.my - pinch.y) * (ns / pinch.s) + ((a.y + b.y) / 2 - pinch.my);
      Z.s = ns; zApply();
    } else if (ids.length === 1 && drag && Z.s > 1) {
      var q = ptrs[ids[0]]; Z.x = drag.zx + q.x - drag.x; Z.y = drag.zy + q.y - drag.y; zApply();
    }
  });
  function ptrEnd(e) {
    if (!(e.pointerId in ptrs)) return;
    delete ptrs[e.pointerId];
    if (Object.keys(ptrs).length < 2) pinch = null;
    if (!Object.keys(ptrs).length) { drag = null; if (Z.s <= 1.01) zAt(0, 0, 1); }
  }
  document.addEventListener('pointerup', ptrEnd); document.addEventListener('pointercancel', ptrEnd);
  document.addEventListener('wheel', function (e) {
    if (!Z.on || !e.target.closest('#stagewrap')) return;
    e.preventDefault(); var p = rel(e); zAt(p.x, p.y, Z.s * Math.exp(-e.deltaY * 0.0025));
  }, { passive: false });
  // tap the picture (not zoomed) to open it full screen
  document.addEventListener('click', function (e) {
    if (!Z.on && e.target.closest && e.target.closest('#stage')) openZoom();
  });

  /* ---------- Narration: recorded audio when present, else the device voice ---------- */
  var VOICE = { on: load('voice', true), audio: null, cues: null, token: 0, src: '' };
  var LANGTAG = { en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN', mr: 'mr-IN' };
  var MALE = /(male|madhur|prabhat|niranjan|manohar|rishi|hemant|ravi|kunal|aarav|arjun|prakash|rahul)/i;
  try { fetch('audio/cues.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { VOICE.cues = j; }).catch(function () {}); } catch (e) { /* offline */ }
  function narrText() { var n = window.NARR && window.NARR[PL.key]; return n && n[PL.step] ? tx(n[PL.step]) : ''; }
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    var tag = LANGTAG[S.lang], base = tag.slice(0, 2);
    var vs = speechSynthesis.getVoices().filter(function (v) { return (v.lang || '').replace('_', '-').toLowerCase().indexOf(base) === 0; });
    if (!vs.length) return null;
    vs.sort(function (a, b) {
      function score(v) { return (MALE.test(v.name) ? 4 : 0) + ((v.lang || '').replace('_', '-').toLowerCase() === tag.toLowerCase() ? 2 : 0) + (v.localService ? 0 : 1); }
      return score(b) - score(a);
    });
    return vs[0];
  }
  if ('speechSynthesis' in window) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = function () {}; } catch (e) { /* ignore */ } }
  function hush() {
    VOICE.token++;
    if (VOICE.audio) { try { VOICE.audio.pause(); } catch (e) { /* ignore */ } }
    if ('speechSynthesis' in window) { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  }
  // Speak the current step; call done() when finished (or after a reading pause when silent).
  function speak(done) {
    hush();
    var my = VOICE.token, text = narrText();
    function fin() { if (my === VOICE.token && done) done(); }
    function silent() { setTimeout(fin, Math.max(4200, text.length * 55)); }
    if (!VOICE.on || !text) return silent();
    var cue = VOICE.cues && VOICE.cues[S.lang] && VOICE.cues[S.lang][PL.key];
    if (cue && cue.t && cue.t[PL.step] !== undefined) {
      if (!VOICE.audio) VOICE.audio = new Audio();
      var au = VOICE.audio, src = 'audio/' + S.lang + '/' + PL.key + '.mp3?v=' + (VOICE.cues.v || 1);
      var start = cue.t[PL.step], end = cue.e[PL.step];
      var go2 = function () {
        try { au.currentTime = start; } catch (e) { /* not seekable yet */ }
        au.ontimeupdate = function () { if (my !== VOICE.token) return; if (au.currentTime >= end) { au.pause(); au.ontimeupdate = null; fin(); } };
        au.onended = fin;
        var pr = au.play(); if (pr && pr.catch) pr.catch(function () { silent(); });
      };
      if (VOICE.src !== src) { VOICE.src = src; au.src = src; au.preload = 'auto'; au.addEventListener('loadedmetadata', function h() { au.removeEventListener('loadedmetadata', h); if (my === VOICE.token) go2(); }); au.load(); }
      else go2();
      return;
    }
    var v = pickVoice();
    if (!v) return silent();
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang; u.rate = 0.92;
      u.onend = fin; u.onerror = function () { silent(); };
      speechSynthesis.speak(u);
    } catch (e) { silent(); }
  }

  /* ---------- Player: steps through a scene with narration ---------- */
  var PL = { id: null, key: null, sc: null, step: 0, playing: false, started: false };
  function scene() { return PL.sc; }
  function setScene(story) {
    var c = PK.CHAPTERS[chapterIndex(PL.id)];
    PL.key = story && c.story ? c.story.id : c.id;
    PL.sc = window.SCENES[story && c.story ? c.story.id : c.widget];
    PL.step = 0; PL.started = false; PL._ended = false;
    var dots = document.getElementById('dots');
    if (dots) dots.innerHTML = Array.apply(null, Array(PL.sc.steps)).map(function (_, k) { return '<button data-act="pdot" data-v="' + k + '" aria-label="' + (k + 1) + '"></button>'; }).join('');
    var tabs = document.querySelectorAll('.ptabs button');
    for (var i = 0; i < tabs.length; i++) { var on = (i === 1) === !!story; tabs[i].classList.toggle('on', on); tabs[i].setAttribute('aria-selected', on ? 'true' : 'false'); }
    var src = document.getElementById('storysrc');
    if (src) { src.hidden = !(story && c.story); if (story && c.story) src.textContent = ui('source') + ': ' + c.story.src; }
    var pl = document.getElementById('player'); if (pl) pl.classList.toggle('isstory', !!story);
  }
  function drawStep() {
    var st = document.getElementById('stage'), cp = document.getElementById('cap'); if (!st) return;
    var r = scene().render(PL.step);
    st.innerHTML = r.svg; cp.innerHTML = r.cap; zApply();
    var sb = document.getElementById('sub'); if (sb) sb.textContent = narrText();
    var dots = document.querySelectorAll('#dots button');
    for (var k = 0; k < dots.length; k++) dots[k].className = k === PL.step ? 'on' : k < PL.step ? 'past' : '';
    var pb = document.getElementById('pplay');
    if (pb) { pb.textContent = PL.playing ? '❚❚' : (PL.step >= scene().steps - 1 && PL.started ? '↺' : '▶'); pb.setAttribute('aria-label', ui(PL.playing ? 'pause' : 'play')); }
    var vb = document.getElementById('pvoice');
    if (vb) { vb.innerHTML = speakerIcon(VOICE.on); vb.classList.toggle('off', !VOICE.on); vb.setAttribute('aria-pressed', VOICE.on ? 'true' : 'false'); }
    var pl = document.getElementById('player'); if (pl) pl.classList.toggle('started', PL.started);
  }
  function speakerIcon(on) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>' +
      (on ? '<path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>' : '<path d="M17 9l5 6M22 9l-5 6"/>') + '</svg>';
  }
  function startPlayer(id) {
    stopPlayer(); PL.id = id; setScene(false); drawStep();
  }
  function play() {
    hush(); PL.playing = true; PL.started = true;
    if (PL.step >= scene().steps - 1 && PL._ended) PL.step = 0;
    PL._ended = false;
    step();
    function step() {
      if (!PL.playing || !document.getElementById('stage')) return;
      drawStep();
      speak(function () {
        setTimeout(function () {
          if (!PL.playing) return;
          if (PL.step >= scene().steps - 1) { PL.playing = false; PL._ended = true; drawStep(); return; }
          PL.step++; step();
        }, 700);
      });
    }
  }
  function stopPlayer() { PL.playing = false; hush(); }
  // Manual move: show that step and read it once
  function go(n) {
    stopPlayer(); PL.started = true; PL.step = Math.max(0, Math.min(scene().steps - 1, n)); drawStep();
    speak(null);
  }
  // swipe on the stage
  var touchX = null;
  document.addEventListener('touchstart', function (e) { if (e.target.closest && e.target.closest('#stage')) touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (touchX === null) return; var dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Z.s > 1.05) return;
    if (Math.abs(dx) > 40) go(PL.step + (dx < 0 ? 1 : -1));
  }, { passive: true });

  function rerenderWidget(name) {
    var box = document.querySelector('.widget[data-widget="' + name + '"]');
    if (box) box.innerHTML = WIDGETS[name](box.querySelector('.memo.hiding') !== null);
  }

  // A table that can be hidden and revealed cell by cell
  function memo(tableHtml, hide) {
    return '<div class="memo' + (hide ? ' hiding' : '') + '"><div class="memo-bar"><button class="btn small" data-act="memo">' +
      esc(hide ? ui('showAll') : ui('hideTest')) + '</button><span class="hint">' + esc(ui('tapReveal')) + '</span></div><div class="scroll">' + tableHtml + '</div></div>';
  }
  function dot(color) { return '<i class="dot" style="background:' + color + '"></i>'; }

  /* ---------- Widgets ---------- */
  var WIDGETS = {};

  WIDGETS.seeker = function (hide) {
    var t = '<table class="grid wide"><thead><tr><th></th><th>' + esc(ui('meaning')) + '</th><th>' + esc(ui('image')) + '</th></tr></thead><tbody>';
    var last = 0;
    PK.SADHANA.forEach(function (q) {
      if (q.n !== last) { last = q.n; if (q.n === 3) t += '<tr class="grp"><th colspan="3">3 · ' + term('shatsampatti') + '</th></tr>'; }
      t += '<tr><th>' + (q.n !== 3 ? q.n + ' · ' : '') + term(q.id) + '</th><td class="m">' + esc(tx(q.mean)) + '</td><td class="m">' + esc(tx(q.img)) + '</td></tr>';
    });
    return memo(t + '</tbody></table>', hide);
  };
  WIDGETS.origin = function () {
    var h = '<div class="chain"><div class="src">' + esc(ui('fromBrahman')) + '</div>';
    PK.ELEMENTS.forEach(function (e) {
      h += '<div class="arrow" aria-hidden="true">↓</div><div class="link" style="--c:' + e.color + '"><div class="badge">' + e.icon + '</div><div class="body">' +
        term(e.id, 'big') + '<div class="quals"><span class="lbl">' + esc(ui('qualities')) + ':</span> ' +
        e.qualities.map(function (q) { return '<span class="chip' + (q === e.quality ? ' own' : '') + '">' + esc(saOf(q)) + (glossOf(q) && norm(glossOf(q)) !== norm(saOf(q)) ? ' <small>' + esc(glossOf(q)) + '</small>' : '') + '</span>'; }).join('') +
        '</div></div><div class="count">' + e.qualities.length + '</div></div>';
    });
    return h + '</div>';
  };

  WIDGETS.gunas = function () {
    var sel = widgetState.gunas || 0, e = PK.ELEMENTS[sel];
    var h = '<p class="pick">' + esc(ui('pickElement')) + '</p><div class="pills">' + PK.ELEMENTS.map(function (x, i) {
      return '<button data-act="gunas" data-v="' + i + '" class="pill' + (i === sel ? ' on' : '') + '" style="--c:' + x.color + '">' + esc(saOf(x.id)) + '</button>';
    }).join('') + '</div>';
    h += '<div class="tree" style="--c:' + e.color + '"><div class="root">' + term(e.id, 'big') + '<div class="sub">' + esc(saOf('tanmatra')) + '</div></div><div class="branches">';
    var rows = [
      ['sattva', term(e.jnan), term('antahkarana'), 'jnan'],
      ['rajas', term(e.karm), PK.PRANAS.map(function (p) { return esc(saOf(p.id)); }).join(' · '), 'karm'],
      ['tamas', '<a href="#/c/panchikarana">' + esc(saOf('panchikarana')) + '</a> → ' + esc(ui('grossEl')), null, null]
    ];
    rows.forEach(function (r) {
      h += '<div class="branch g-' + r[0] + '"><div class="gname">' + term(r[0]) + '</div>' +
        '<div class="out">' + (r[3] ? '<span class="lbl">' + esc(ui('individually')) + '</span>' : '') + r[1] + '</div>' +
        (r[2] ? '<div class="out"><span class="lbl">' + esc(ui('together')) + '</span>' + r[2] + '</div>' : '') + '</div>';
    });
    return h + '</div></div>';
  };

  WIDGETS.panchikarana = function () {
    var st = widgetState.pk || 0, sel = widgetState.pkSel === undefined ? 4 : widgetState.pkSel;
    var h = '<div class="pk-controls"><div class="steps">' + [0, 1, 2, 3].map(function (s) {
      return '<button data-act="pkstep" data-v="' + s + '" class="stepb' + (s === st ? ' on' : '') + '">' + (s + 1) + '</button>';
    }).join('') + '</div><button class="btn small" data-act="pkplay">▶ ' + esc(ui('play')) + '</button></div>';
    h += '<p class="caption" aria-live="polite">' + esc(ui('pk' + st)) + '</p><div class="pk st' + st + '">';
    PK.ELEMENTS.forEach(function (e, i) {
      var others = PK.ELEMENTS.filter(function (x) { return x !== e; });
      h += '<button class="pk-row' + (i === sel ? ' on' : '') + '" data-act="pksel" data-v="' + i + '"><span class="pk-name">' + esc(saOf(e.id)) + '</span><span class="pk-bar">';
      for (var k = 0; k < 8; k++) {
        var col = (st === 3 && k >= 4) ? others[k - 4].color : e.color;
        h += '<i class="seg s' + k + '" style="background:' + col + '"></i>';
      }
      h += '</span></button>';
    });
    h += '</div>';
    // recipe of the selected gross element
    var e = PK.ELEMENTS[sel], others2 = PK.ELEMENTS.filter(function (x) { return x !== e; });
    var stops = [e.color + ' 0 50%'], a = 50;
    others2.forEach(function (o) { stops.push(o.color + ' ' + a + '% ' + (a + 12.5) + '%'); a += 12.5; });
    h += '<div class="recipe"><div class="pie" style="background:conic-gradient(' + stops.join(',') + ')" role="img" aria-label="' + esc(ui('recipe')) + ' ' + esc(saOf(e.id)) + '"></div><div><h3>' + esc(ui('recipe')) + ': ' + term(e.id) + '</h3><ul class="legend">' +
      '<li>' + dot(e.color) + '<b>½</b> ' + esc(saOf(e.id)) + '</li>' +
      others2.map(function (o) { return '<li>' + dot(o.color) + '<b>⅛</b> ' + esc(saOf(o.id)) + '</li>'; }).join('') + '</ul></div></div>';
    return h;
  };

  WIDGETS.gross = function (hide) {
    var t = '<table class="grid"><thead><tr><th>' + esc(ui('element')) + '</th><th colspan="5">25</th></tr></thead><tbody>';
    PK.ELEMENTS.forEach(function (e) {
      t += '<tr><th style="--c:' + e.color + '" class="elh">' + term(e.id) + '</th>' + e.gross.map(function (g) { return '<td class="m">' + term(g) + '</td>'; }).join('') + '</tr>';
    });
    return memo(t + '</tbody></table>', hide);
  };

  WIDGETS.subtle = function (hide) {
    var t = '<table class="grid wide"><thead><tr><th>' + esc(ui('element')) + '</th><th>' + esc(ui('quality')) + '</th><th>' + esc(ui('jnan')) + '</th><th>' + esc(ui('deity')) + '</th><th>' + esc(ui('karm')) + '</th><th>' + esc(ui('fn')) + '</th><th>' + esc(ui('deity')) + '</th></tr></thead><tbody>';
    PK.ELEMENTS.forEach(function (e) {
      t += '<tr><th class="elh" style="--c:' + e.color + '">' + term(e.id) + '</th><td class="m">' + term(e.quality) + '</td><td class="m">' + term(e.jnan) + '</td><td class="m">' + term(e.jnanDeity) + '</td><td class="m">' + term(e.karm) + '</td><td class="m">' + esc(tx(e.karmFn)) + '</td><td class="m">' + term(e.karmDeity) + '</td></tr>';
    });
    t += '</tbody></table>';
    var count = '<div class="sum"><span class="chip">5 ' + esc(saOf('jnanendriya')) + '</span>+<span class="chip">5 ' + esc(saOf('karmendriya')) + '</span>+<span class="chip">5 ' + esc(saOf('prana')) + '</span>+<span class="chip">' + esc(saOf('manas')) + '</span>+<span class="chip">' + esc(saOf('buddhi')) + '</span>=<b>17</b></div>';
    return count + memo(t, hide);
  };

  WIDGETS.inner = function () {
    return '<div class="cards4">' + PK.ANTAH.map(function (a, i) {
      return '<div class="icard n' + i + '">' + term(a.id, 'big') + '<div class="fn"><span class="sa">' + esc(script(a.fnSa)) + '</span>' + (S.roman ? ' <span class="ro">' + esc(a.fnRo) + '</span>' : '') + '</div><p>' + esc(tx(a.fn)) + '</p>' +
        '<dl><dt>' + esc(ui('deity')) + '</dt><dd>' + term(a.deity) + '</dd><dt>' + esc(ui('belongsTo')) + '</dt><dd>' + term(a.kosha) + '</dd></dl></div>';
    }).join('') + '</div>';
  };

  WIDGETS.pranas = function (hide) {
    var sel = widgetState.prana === undefined ? 0 : widgetState.prana;
    var pos = { prana: [100, 128], apana: [100, 232], udana: [100, 92], samana: [100, 180] };
    var p = PK.PRANAS[sel];
    var svg = '<svg viewBox="0 0 200 300" class="bodysvg" role="img" aria-label="' + esc(saOf(p.id)) + '">' +
      '<g class="silhouette' + (p.id === 'vyana' ? ' glow' : '') + '"><circle cx="100" cy="45" r="28"/><rect x="88" y="70" width="24" height="18" rx="6"/>' +
      '<rect x="58" y="84" width="84" height="160" rx="34"/><rect x="62" y="236" width="30" height="58" rx="12"/><rect x="108" y="236" width="30" height="58" rx="12"/>' +
      '<rect x="30" y="92" width="24" height="120" rx="12"/><rect x="146" y="92" width="24" height="120" rx="12"/></g>';
    PK.PRANAS.forEach(function (q, i) {
      if (!pos[q.id]) return;
      svg += '<g tabindex="0" class="mk' + (i === sel ? ' on' : '') + '" data-act="prana" data-v="' + i + '"><circle cx="' + pos[q.id][0] + '" cy="' + pos[q.id][1] + '" r="11"/><text x="' + (pos[q.id][0] + 18) + '" y="' + (pos[q.id][1] + 5) + '">' + esc(saOf(q.id)) + '</text></g>';
    });
    svg += '</svg>';
    var h = '<div class="pranas"><div>' + svg + '</div><div><div class="pills col">' + PK.PRANAS.map(function (q, i) {
      return '<button data-act="prana" data-v="' + i + '" class="pill' + (i === sel ? ' on' : '') + '">' + esc(saOf(q.id)) + '</button>';
    }).join('') + '</div><div class="detail">' + term(p.id, 'big') + '<dl><dt>' + esc(ui('seat')) + '</dt><dd>' + esc(tx(p.seat)) + '</dd><dt>' + esc(ui('fn')) + '</dt><dd>' + esc(tx(p.fn)) + '</dd></dl></div></div></div>';
    var t = '<table class="grid"><thead><tr><th>' + esc(saOf('prana')) + '</th><th>' + esc(ui('seat')) + '</th><th>' + esc(ui('fn')) + '</th></tr></thead><tbody>' +
      PK.PRANAS.map(function (q) { return '<tr><th>' + term(q.id) + '</th><td class="m">' + esc(tx(q.seat)) + '</td><td class="m">' + esc(tx(q.fn)) + '</td></tr>'; }).join('') + '</tbody></table>';
    h += memo(t, hide);
    h += '<h3 class="sub-h">' + esc(ui('minorPranas')) + '</h3><div class="minor">' + PK.UPAPRANAS.map(function (k) { return '<div>' + term(k) + '</div>'; }).join('') + '</div>';
    return h;
  };

  WIDGETS.bodies = function (hide) {
    var t = '<table class="grid wide bodies"><thead><tr><th></th>' + PK.BODIES.map(function (b) { return '<th>' + term(b) + '</th>'; }).join('') + '</tr></thead><tbody>';
    PK.BODY_ROWS.forEach(function (r) {
      t += '<tr><th>' + esc(tx(r.label)) + '</th>';
      for (var i = 0; i < 3; i++) {
        var c = r.terms ? term(r.terms[i]) : r.cells ? esc(tx(r.cells[i])) : r.kosh[i].map(function (k) { return term(k); }).join('');
        t += '<td class="m">' + c + '</td>';
      }
      t += '</tr>';
    });
    return memo(t + '</tbody></table>', hide);
  };

  WIDGETS.koshas = function () {
    var sel = widgetState.kosha === undefined ? 0 : widgetState.kosha;
    var svg = '<svg viewBox="0 0 320 320" class="rings" role="img" aria-label="' + esc(tx(PK.CHAPTERS[chapterIndex('koshas')].title)) + '">';
    PK.KOSHAS.forEach(function (k, i) {
      var r = 150 - i * 25;
      svg += '<g tabindex="0" class="ring' + (i === sel ? ' on' : '') + '" data-act="kosha" data-v="' + i + '"><circle cx="160" cy="160" r="' + r + '" style="fill:' + k.color + '"/><text x="160" y="' + (160 - r + 16) + '" text-anchor="middle">' + esc(saOf(k.id).replace(/\s.*$/, '')) + '</text></g>';
    });
    svg += '<g class="core"><circle cx="160" cy="160" r="25"/><text x="160" y="166" text-anchor="middle">' + esc(saOf('atman')) + '</text></g></svg>';
    var k = PK.KOSHAS[sel];
    var d = '<div class="detail" style="--c:' + k.color + '">' + term(k.id, 'big') + '<dl><dt>' + esc(ui('madeOf')) + '</dt><dd>' + esc(tx(k.made)) + '</dd><dt>' + esc(ui('belongsTo')) + '</dt><dd>' + term(k.body) + '</dd></dl>' +
      (k.parts.length ? '<div class="parts">' + k.parts.map(function (p) { return '<span class="chip">' + esc(saOf(p)) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="navk"><button class="btn small" data-act="kosha" data-v="' + Math.max(0, sel - 1) + '"' + (sel === 0 ? ' disabled' : '') + '>← </button><span>' + (sel + 1) + ' / 5</span><button class="btn small" data-act="kosha" data-v="' + Math.min(4, sel + 1) + '"' + (sel === 4 ? ' disabled' : '') + '> →</button></div></div>';
    return '<div class="koshas">' + svg + d + '</div>';
  };

  WIDGETS.witness = function () {
    var sel = widgetState.state === undefined ? 0 : widgetState.state;
    var states = ['jagrat', 'svapna', 'sushupti'], jivas = ['vishva', 'taijasa', 'prajna'];
    var active = [[1, 1, 1], [0, 1, 1], [0, 0, 1]][sel];
    var h = '<div class="pills">' + states.map(function (s, i) { return '<button class="pill' + (i === sel ? ' on' : '') + '" data-act="state" data-v="' + i + '">' + esc(saOf(s)) + ' · ' + esc(glossOf(s)) + '</button>'; }).join('') + '</div>';
    h += '<div class="stage"><div class="witness-light">' + term('sakshi', 'big') + '<small>' + esc(ui('alwaysLit')) + '</small></div><div class="layers">';
    PK.BODIES.forEach(function (b, i) {
      h += '<div class="layer' + (active[i] ? ' act' : '') + '">' + term(b) + '<span class="st">' + esc(active[i] ? ui('stateActive') : ui('stateResting')) + '</span></div>';
    });
    h += '</div><p class="jiva">"' + esc(saOf('atman')) + '" → ' + term(jivas[sel]) + '</p></div>';
    return h;
  };

  WIDGETS.laya = function () {
    var st = widgetState.laya || 0;
    var levels = [['sthula', 'vishva', 'virat', 'a'], ['sukshma', 'taijasa', 'hiranyagarbha', 'u'], ['karana', 'prajna', 'ishvara', 'm']];
    var h = '<div class="laya st' + st + '"><div class="omline">' + levels.map(function (l, i) {
      return '<span class="letter' + (i < st ? ' gone' : '') + '">' + esc(saOf(l[3])) + '</span>';
    }).join('') + '<span class="letter silence' + (st === 3 ? ' on' : '') + '">' + esc(script('ॐ')) + '</span></div><div class="lvls">';
    levels.forEach(function (l, i) {
      h += '<div class="lvl' + (i < st ? ' gone' : '') + (i === st ? ' cur' : '') + '">' + term(l[0]) + '<span>' + esc(saOf(l[1])) + ' = ' + esc(saOf(l[2])) + '</span></div>';
    });
    h += '<div class="lvl self' + (st === 3 ? ' cur' : '') + '">' + term('sakshi') + ' = ' + term('brahman') + '</div></div>';
    h += '<p class="caption" aria-live="polite">' + esc(ui('laya' + st)) + '</p><div class="pk-controls">' +
      (st < 3 ? '<button class="btn primary" data-act="laya">' + esc(ui('resolve')) + ' ↓</button>' : '<button class="btn" data-act="layareset">' + esc(ui('reset')) + '</button>') + '</div></div>';
    return h;
  };

  /* ---------- Map ---------- */
  function viewMap() {
    var sel = widgetState.map === undefined ? 5 : widgetState.map;
    var bodyOf = ['sthula', 'sukshma', 'sukshma', 'sukshma', 'karana'];
    var d;
    if (sel === 5) {
      d = term('atman', 'big') + ' = ' + term('sakshi') + ' = ' + term('brahman') + '<div class="maplinks"><a class="btn small" href="#/c/witness">' + esc(tx(PK.CHAPTERS[chapterIndex('witness')].title)) + ' →</a></div>';
    } else {
      var k = PK.KOSHAS[sel];
      d = term(k.id, 'big') + '<dl><dt>' + esc(ui('madeOf')) + '</dt><dd>' + esc(tx(k.made)) + '</dd><dt>' + esc(ui('belongsTo')) + '</dt><dd>' + term(bodyOf[sel]) + '</dd></dl>' +
        (k.parts.length ? '<div class="parts">' + k.parts.map(function (p) { return '<span class="chip">' + esc(saOf(p)) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="maplinks"><a class="btn small" href="#/c/koshas">' + esc(tx(PK.CHAPTERS[chapterIndex('koshas')].title)) + ' →</a></div>';
    }
    return '<h1>' + esc(ui('navMap')) + '</h1><p class="muted">' + esc(ui('mapIntro')) + '</p><div class="mapwrap">' + window.SCENES.map(sel) + '</div><div class="detail" style="--c:' + (sel === 5 ? '#F4C430' : PK.KOSHAS[sel].color) + '">' + d + '</div>';
  }

  /* ---------- Practice: facts ---------- */
  function buildFacts() {
    var F = [];
    var E = PK.ELEMENTS;
    var deities = []; E.forEach(function (e) { deities.push(e.jnanDeity, e.karmDeity); });
    var elIds = E.map(function (e) { return e.id; });
    function add(rel, subj, ans, pool) { F.push({ id: rel + ':' + subj, rel: rel, subj: subj, ans: ans, pool: pool }); }
    E.forEach(function (e, i) {
      add('q_quality', e.id, { k: e.quality }, E.map(function (x) { return { k: x.quality }; }));
      add('q_jnan', e.id, { k: e.jnan }, E.map(function (x) { return { k: x.jnan }; }));
      add('q_karm', e.id, { k: e.karm }, E.map(function (x) { return { k: x.karm }; }));
      add('q_elOfJnan', e.jnan, { k: e.id }, elIds.map(function (x) { return { k: x }; }));
      add('q_elOfJnan', e.karm, { k: e.id }, elIds.map(function (x) { return { k: x }; }));
      add('q_deity', e.jnan, { k: e.jnanDeity }, deities.map(function (x) { return { k: x }; }));
      add('q_deity', e.karm, { k: e.karmDeity }, deities.map(function (x) { return { k: x }; }));
      e.gross.forEach(function (g) { add('q_grossOf', g, { k: e.id }, elIds.map(function (x) { return { k: x }; })); });
      if (i < 4) add('q_order', e.id, { k: E[i + 1].id }, elIds.map(function (x) { return { k: x }; }));
    });
    PK.ANTAH.forEach(function (a) {
      add('q_antahFn', a.id, { t: a.fn }, PK.ANTAH.map(function (x) { return { t: x.fn }; }));
      add('q_deity', a.id, { k: a.deity }, PK.ANTAH.map(function (x) { return { k: x.deity }; }));
    });
    PK.SADHANA.forEach(function (q) { add('q_means', q.id, { t: q.mean }, PK.SADHANA.map(function (x) { return { t: x.mean }; })); });
    [['asti', 'sat'], ['bhati', 'chit'], ['priya', 'ananda']].forEach(function (p) { add('q_abp', p[0], { k: p[1] }, [{ k: 'sat' }, { k: 'chit' }, { k: 'ananda' }]); });
    PK.PRANAS.forEach(function (p) { add('q_pranaSeat', p.id, { t: p.seat }, PK.PRANAS.map(function (x) { return { t: x.seat }; })); });
    PK.KOSHAS.forEach(function (k) { add('q_koshaBody', k.id, { k: k.body }, PK.BODIES.map(function (x) { return { k: x }; })); });
    var states = ['jagrat', 'svapna', 'sushupti'], jivas = ['vishva', 'taijasa', 'prajna'], cosmic = ['virat', 'hiranyagarbha', 'ishvara'], om = ['a', 'u', 'm'];
    PK.BODIES.forEach(function (b, i) {
      add('q_bodyState', b, { k: states[i] }, states.concat(['turiya']).map(function (x) { return { k: x }; }));
      add('q_bodyJiva', b, { k: jivas[i] }, jivas.map(function (x) { return { k: x }; }));
      add('q_jivaCosmic', jivas[i], { k: cosmic[i] }, cosmic.map(function (x) { return { k: x }; }));
      add('q_stateOm', states[i], { k: om[i] }, om.map(function (x) { return { k: x }; }));
    });
    return F;
  }
  function ansText(a) { return a.k ? termPlain(a.k) : tx(a.t); }
  function ansHtml(a) { return a.k ? term(a.k, 'big') : '<span class="term big"><span class="gl solo">' + esc(tx(a.t)) + '</span></span>'; }
  function options(f) {
    var right = ansText(f.ans), seen = {}, opts = [right]; seen[right] = 1;
    shuffle(f.pool).forEach(function (p) { var s = ansText(p); if (!seen[s] && opts.length < 4) { seen[s] = 1; opts.push(s); } });
    return shuffle(opts);
  }

  function viewPractice() {
    var h = '<h1>' + esc(ui('navPractice')) + '</h1><div class="pcards">' +
      '<a class="pcard" href="#/practice/cards"><span class="ic">⧉</span><h2>' + esc(ui('flashcards')) + '</h2><p>' + esc(ui('flashDesc')) + '</p></a>' +
      '<a class="pcard" href="#/practice/quiz"><span class="ic">?</span><h2>' + esc(ui('quiz')) + '</h2><p>' + esc(ui('quizDesc')) + '</p>' + (S.quizBest ? '<span class="best">' + esc(ui('best')) + ': ' + S.quizBest + '/10</span>' : '') + '</a></div>';
    h += '<h2 class="sub-h">' + esc(ui('tables')) + '</h2><p class="muted">' + esc(ui('tablesDesc')) + '</p><div class="tablelinks">' +
      ['seeker', 'subtle', 'gross', 'pranas', 'bodies'].map(function (id) { return '<a class="btn" href="#/c/' + id + '/hide">' + esc(tx(PK.CHAPTERS[chapterIndex(id)].title)) + '</a>'; }).join('') + '</div>';
    return h;
  }

  /* Flashcards: a simple Leitner deck, lowest box first */
  var deck = null;
  function newDeck() {
    var F = shuffle(buildFacts());
    F.sort(function (a, b) { return (S.boxes[a.id] || 0) - (S.boxes[b.id] || 0); });
    deck = { queue: F.slice(0, 12), flipped: false, done: 0 };
  }
  function viewCards() {
    if (!deck) newDeck();
    var h = '<h1>' + esc(ui('flashcards')) + '</h1>';
    if (!deck.queue.length) {
      return h + '<div class="card center"><h2>' + esc(ui('roundDone')) + ' ✓</h2><button class="btn primary" data-act="newdeck">' + esc(ui('again')) + '</button></div>';
    }
    var f = deck.queue[0];
    h += '<p class="muted">' + deck.queue.length + ' ' + esc(ui('left')) + '</p><div class="flash' + (deck.flipped ? ' flipped' : '') + '"><div class="q">' + term(f.subj, 'big') + '<p class="rel">' + esc(ui(f.rel)) + '</p></div>';
    if (deck.flipped) {
      h += '<div class="a">' + ansHtml(f.ans) + '</div><div class="rate"><button class="btn" data-act="again">↺ ' + esc(ui('again')) + '</button><button class="btn primary" data-act="knew">✓ ' + esc(ui('knew')) + '</button></div>';
    } else {
      h += '<button class="btn primary wide" data-act="flip">' + esc(ui('flip')) + '</button>';
    }
    return h + '</div>';
  }

  /* Quiz: 10 multiple-choice questions */
  var quiz = null;
  function newQuiz() {
    var F = shuffle(buildFacts()).slice(0, 10);
    quiz = { items: F.map(function (f) { return { f: f, opts: options(f), picked: null }; }), i: 0, score: 0 };
  }
  function viewQuiz() {
    if (!quiz) newQuiz();
    var h = '<h1>' + esc(ui('quiz')) + '</h1>';
    if (quiz.i >= quiz.items.length) {
      if (quiz.score > S.quizBest) { S.quizBest = quiz.score; save('quizBest', S.quizBest); }
      return h + '<div class="card center"><div class="bigscore">' + quiz.score + '<small>/10</small></div><p>' + esc(ui('best')) + ': ' + S.quizBest + '/10</p><button class="btn primary" data-act="newquiz">' + esc(ui('tryAgain')) + '</button></div>';
    }
    var it = quiz.items[quiz.i], right = ansText(it.f.ans);
    h += '<div class="qhead"><span>' + esc(ui('question')) + ' ' + (quiz.i + 1) + ' / 10</span><span>' + esc(ui('score')) + ': ' + quiz.score + '</span></div>';
    h += '<div class="card quizq">' + term(it.f.subj, 'big') + '<p class="rel">' + esc(ui(it.f.rel)) + '</p><div class="opts">';
    it.opts.forEach(function (o, i) {
      var cls = '';
      if (it.picked !== null) { if (o === right) cls = ' right'; else if (i === it.picked) cls = ' wrong'; }
      h += '<button class="opt' + cls + '" data-act="pick" data-v="' + i + '"' + (it.picked !== null ? ' disabled' : '') + '>' + esc(o) + '</button>';
    });
    h += '</div>';
    if (it.picked !== null) {
      var ok = it.opts[it.picked] === right;
      h += '<p class="fb ' + (ok ? 'ok' : 'no') + '" aria-live="polite">' + (ok ? '✓ ' + esc(ui('correct')) : esc(ui('wrongWas')) + ': <b>' + esc(right) + '</b>') + '</p><button class="btn primary wide" data-act="qnext">' + esc(ui('next')) + ' →</button>';
    }
    return h + '</div>';
  }

  /* ---------- Glossary ---------- */
  function viewGlossary() {
    return '<h1>' + esc(ui('navGlossary')) + '</h1><input type="search" id="gq" class="search" placeholder="' + esc(ui('search')) + '" autocomplete="off"><div id="glist" class="glist"></div>';
  }
  function bindGlossary() {
    var q = document.getElementById('gq'), list = document.getElementById('glist');
    var keys = Object.keys(TERMS).filter(function (k) { return TERMS[k].gloss; });
    function hay(k) { var t = TERMS[k]; return (t.sa + ' ' + I.toGujarati(t.sa) + ' ' + t.ro + ' ' + t.ro.normalize('NFD').replace(/[̀-ͯ]/g, '') + ' ' + t.gloss.join(' ')).toLowerCase(); }
    function draw() {
      var s = q.value.trim().toLowerCase();
      var hits = keys.filter(function (k) { return !s || hay(k).indexOf(s) >= 0; });
      list.innerHTML = hits.length ? hits.map(function (k) {
        var t = TERMS[k];
        return '<div class="gitem"><div class="gsa">' + esc(saOf(k)) + '</div><div><div class="ro">' + esc(t.ro) + '</div><div>' + esc(glossOf(k)) + (S.lang !== 'en' ? ' <span class="muted">· ' + esc(t.gloss[0]) + '</span>' : '') + '</div></div></div>';
      }).join('') : '<p class="muted">' + esc(ui('noResults')) + '</p>';
    }
    q.addEventListener('input', draw); draw();
  }

  /* ---------- Events (delegated) ---------- */
  var playTimer = null;
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act]'); if (!t) {
      var cell = ev.target.closest('.memo.hiding td.m'); if (cell) cell.classList.toggle('shown');
      return;
    }
    var act = t.getAttribute('data-act'), v = parseInt(t.getAttribute('data-v'), 10);
    switch (act) {
      case 'lang': S.lang = t.getAttribute('data-v'); save('lang', S.lang); render(); break;
      case 'memo': {
        var m = t.closest('.memo'); var on = !m.classList.contains('hiding');
        m.classList.toggle('hiding', on);
        m.querySelectorAll('td.shown').forEach(function (c) { c.classList.remove('shown'); });
        t.textContent = on ? ui('showAll') : ui('hideTest');
        break;
      }
      case 'gunas': widgetState.gunas = v; rerenderWidget('gunas'); break;
      case 'pkstep': clearInterval(playTimer); widgetState.pk = v; rerenderWidget('panchikarana'); break;
      case 'pksel': widgetState.pkSel = v; rerenderWidget('panchikarana'); break;
      case 'pkplay':
        clearInterval(playTimer); widgetState.pk = 0; rerenderWidget('panchikarana');
        playTimer = setInterval(function () {
          if ((widgetState.pk || 0) >= 3 || !document.querySelector('.widget[data-widget="panchikarana"]')) { clearInterval(playTimer); return; }
          widgetState.pk = (widgetState.pk || 0) + 1; rerenderWidget('panchikarana');
        }, 1600);
        break;
      case 'prana': widgetState.prana = v; rerenderWidget('pranas'); break;
      case 'kosha': widgetState.kosha = v; rerenderWidget('koshas'); break;
      case 'state': widgetState.state = v; rerenderWidget('witness'); break;
      case 'laya': widgetState.laya = Math.min(3, (widgetState.laya || 0) + 1); rerenderWidget('laya'); break;
      case 'layareset': widgetState.laya = 0; rerenderWidget('laya'); break;
      case 'map': widgetState.map = v; render(); break;
      case 'pnext': go(PL.step + 1); break;
      case 'ptab': stopPlayer(); setScene(v === 1); drawStep(); break;
      case 'zopen': openZoom(); break;
      case 'zclose': closeZoom(); break;
      case 'pprev': go(PL.step - 1); break;
      case 'pdot': go(v); break;
      case 'pplay': if (PL.playing) { stopPlayer(); drawStep(); } else play(); break;
      case 'voice': VOICE.on = !VOICE.on; save('voice', VOICE.on); if (!VOICE.on) hush(); else if (!PL.playing) speak(null); drawStep(); if (PL.playing) { stopPlayer(); play(); } break;
      case 'flip': deck.flipped = true; render(); break;
      case 'knew': { var f = deck.queue.shift(); S.boxes[f.id] = Math.min(5, (S.boxes[f.id] || 0) + 1); save('boxes', S.boxes); deck.flipped = false; render(); break; }
      case 'again': { var g = deck.queue.shift(); S.boxes[g.id] = 0; save('boxes', S.boxes); deck.queue.push(g); deck.flipped = false; render(); break; }
      case 'newdeck': newDeck(); render(); break;
      case 'pick': {
        var it = quiz.items[quiz.i]; if (it.picked !== null) break;
        it.picked = v; if (it.opts[v] === ansText(it.f.ans)) quiz.score++; render(); break;
      }
      case 'qnext': quiz.i++; render(); window.scrollTo(0, 0); break;
      case 'newquiz': newQuiz(); render(); break;
    }
  });
  document.addEventListener('change', function (ev) {
    if (ev.target.matches('[data-act="roman"]')) { S.roman = ev.target.checked; save('roman', S.roman); render(); }
  });
  document.addEventListener('keydown', function (ev) {
    if (!document.getElementById('stage') || /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName)) return;
    if (ev.key === 'ArrowRight') go(PL.step + 1); else if (ev.key === 'ArrowLeft') go(PL.step - 1); else if (ev.key === 'Escape') closeZoom();
  });
  // keyboard access for SVG targets
  document.addEventListener('keydown', function (ev) {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('g[data-act]')) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });

  applyTheme();
  render();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
