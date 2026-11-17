/* Effects Tech Studio — Malta */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }
  const lock = on => lenis && (on ? lenis.stop() : lenis.start());
  const goTo = id => lenis ? lenis.scrollTo(id, { duration: 1.6 }) : $(id).scrollIntoView({ behavior: 'smooth' });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    if (a.dataset.col) { const r = $(`input[name="col"][value="${a.dataset.col}"]`); if (r) r.checked = true; }
    goTo(id);
  }));

  /* ---------- nav ---------- */
  const nav = $('.nav'); let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-solid', y > 40);
    if (y > innerHeight * .9) reticle.classList.remove('is-on');
    nav.classList.toggle('is-hidden', y > lastY && y > innerHeight * .8);
    lastY = y;
  }, { passive: true });

  /* =========================================================
     VIEWFINDER
     ========================================================= */
  const vf = $('.vf'), frames = $$('.vf__frame'), focus = $('.vf__focus'), reticle = $('.reticle');
  let cur = 0, shots = 1;
  const pad = n => String(n).padStart(3, '0');
  const show = i => {
    frames[cur].classList.remove('is-on'); cur = i; frames[cur].classList.add('is-on');
    const f = frames[cur];
    $('.vf__exp').textContent = f.dataset.exp;
    $('.vf__loc').textContent = `${f.dataset.loc} · ${f.dataset.geo}`;
    $('.vf__count b').textContent = pad(++shots % 37 || 1);
  };
  const shutter = () => {
    if (!reduce) gsap.fromTo('.vf__flash', { opacity: .85 }, { opacity: 0, duration: .55, ease: 'power2.out' });
    focus.classList.remove('is-locked'); void focus.offsetWidth; focus.classList.add('is-locked');
    show((cur + 1) % frames.length);
    restartAuto();
  };
  let auto; const restartAuto = () => { clearInterval(auto); auto = setInterval(() => show((cur + 1) % frames.length), 6500); };
  restartAuto();
  vf.addEventListener('click', e => { if (!e.target.closest('a,button,.vf__content')) shutter(); });

  // timecode
  const tc = $('.vf__tc'), t0 = performance.now();
  const two = n => String(n).padStart(2, '0');
  (function tick() {
    const f = Math.floor((performance.now() - t0) / (1000 / 24));
    tc.textContent = `${two(Math.floor(f / 86400))}:${two(Math.floor(f / 1440) % 60)}:${two(Math.floor(f / 24) % 60)}:${two(f % 24)}`;
    requestAnimationFrame(tick);
  })();

  // focus box + reticle follow the pointer
  const fx = gsap.quickTo(focus, 'x', { duration: .6, ease: 'power3.out' });
  const fy = gsap.quickTo(focus, 'y', { duration: .6, ease: 'power3.out' });
  const ui = $('.vf__ui');
  const placeFocus = (x, y) => { const r = ui.getBoundingClientRect(); fx(x - r.left); fy(y - r.top); };
  placeFocus(innerWidth * .6, innerHeight * .45);
  addEventListener('pointermove', e => {
    reticle.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    const inVf = e.target.closest && e.target.closest('.vf') && !e.target.closest('.vf__content,a,button');
    reticle.classList.toggle('is-on', !!inVf);
    if (inVf) placeFocus(e.clientX, e.clientY);
  }, { passive: true });

  if (!reduce) {
    gsap.timeline({ delay: .2 })
      .from('.vf__title .ln > span', { yPercent: 110, duration: 1.4, stagger: .12, ease: 'expo.out' })
      .from('.kicker, .vf__lede, .vf__ctas, .vf__hint', { y: 24, opacity: 0, duration: 1.1, stagger: .08, ease: 'expo.out' }, '-=1')
      .from('.br', { scale: 1.6, opacity: 0, duration: .9, stagger: .05, ease: 'expo.out', transformOrigin: 'center' }, '-=1.2')
      .from('.vf__top, .vf__bottom, .vf__focus', { opacity: 0, duration: .8 }, '-=.6');
  }

  /* ---------- counters + reveals ---------- */
  $$('[data-count]').forEach(el => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = Math.round(o.v) });
  });
  if (!reduce) {
    $$('.h2, .statement__text, .films__title').forEach(el => gsap.from(el, { y: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    gsap.from('.pill', { width: 0, duration: 1.2, stagger: .15, ease: 'expo.out', scrollTrigger: { trigger: '.statement__text', start: 'top 75%' } });
    $$('.diff article, .col, .reel li, .pf').forEach(el => gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
  }

  /* =========================================================
     THE LIGHT MAP
     ========================================================= */
  const MOMENTS = [
    { time: '06:05', name: 'First light', place: 'MDINA · THE SILENT CITY', img: 'p18_012.jpg', sky: ['#5a4a63', '#1a1620'], sun: '#ffd2a1',
      note: 'Soft, low and empty streets. Mdina before anyone else is awake is our favourite hour for portraits of the two of you.', shoot: 'Couple portraits · getting ready' },
    { time: '11:30', name: 'Arcade shade', place: 'UPPER BARRAKKA · VALLETTA', img: 'p54_045.jpg', sky: ['#56708a', '#1b2229'], sun: '#fff6df',
      note: "Malta's midday sun is fierce. We work in arcades and loggias, where the limestone bounces back a warm, even light that flatters everyone.", shoot: 'Family formals · haldi · brunch' },
    { time: '18:40', name: 'Golden hour', place: "ST JULIAN'S SEAFRONT", img: 'p27_021.jpg', sky: ['#7a3f1d', '#1d120c'], sun: '#ffb36b',
      note: 'The sun drops into the sea and everything turns to honey. We keep twenty minutes of every wedding day free for this alone.', shoot: 'Pheras · couple film · family portraits' },
    { time: '20:05', name: 'Blue hour', place: 'VALLETTA SKYLINE', img: 'p53_044.jpg', sky: ['#1d2c52', '#0b0f1c'], sun: '#9fb6ff',
      note: 'Bastions lit gold against a deepening blue sky. The most cinematic ten minutes on the island, and we will be on the right rooftop for it.', shoot: 'Skyline portraits · drone · arrivals' },
    { time: '22:15', name: 'After dark', place: 'SALUTING BATTERY · GRAND HARBOUR', img: 'p39_031.jpg', sky: ['#1a1210', '#0d0c0b'], sun: '#ff8a5b',
      note: 'Stage light, candlelight and cannon fire. Fast lenses and cinema cameras keep the dance floor as rich as the daylight was.', shoot: 'Sangeet · first dance · cannon salute' }
  ];
  const light = $('.light'), range = $('.light__range'), sun = $('.sun'), dial = $('.light__dial');
  const photoBox = $('.light__photo');
  let stop = -1;
  const bez = (t, a, b, c, d) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
  const placeSun = v => {
    const t = .04 + (v / 400) * .92, w = dial.clientWidth, h = dial.clientHeight;
    sun.style.transform = `translate(${bez(t, 20, 250, 750, 980) / 1000 * w}px,${bez(t, 250, -60, -60, 250) / 260 * h}px)`;
  };
  const setStop = i => {
    if (i === stop) return; stop = i; const m = MOMENTS[i];
    light.style.setProperty('--sky-top', m.sky[0]); light.style.setProperty('--sky-bottom', m.sky[1]); light.style.setProperty('--sun', m.sun);
    $$('.light__ticks button').forEach((b, k) => b.classList.toggle('is-on', k === i));
    const old = $('img', photoBox), img = new Image();
    img.src = 'assets/img/' + m.img; img.alt = `${m.name} at ${m.place.toLowerCase()}`; img.style.opacity = 0;
    photoBox.appendChild(img);
    requestAnimationFrame(() => { img.style.opacity = 1; old.style.opacity = 0; setTimeout(() => old.remove(), 900); });
    const info = $('.light__info');
    if (!reduce) gsap.fromTo(info.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .05, ease: 'expo.out' });
    $('.light__time').textContent = m.time; $('.light__name').textContent = m.name; $('.light__place').textContent = m.place;
    $('.light__note').textContent = m.note; $('.light__shoot').innerHTML = `<span class="mono">WE SHOOT</span> ${m.shoot}`;
  };
  const onRange = () => { const v = +range.value; placeSun(v); setStop(Math.round(v / 100)); };
  range.addEventListener('input', onRange);
  range.addEventListener('change', () => { const o = { v: +range.value }; gsap.to(o, { v: Math.round(o.v / 100) * 100, duration: .6, ease: 'power3.out', onUpdate: () => { range.value = o.v; placeSun(o.v); } }); });
  $$('.light__ticks button').forEach(b => b.addEventListener('click', () => {
    const o = { v: +range.value }; setStop(+b.dataset.stop);
    gsap.to(o, { v: +b.dataset.stop * 100, duration: 1.1, ease: 'power3.inOut', onUpdate: () => { range.value = o.v; placeSun(o.v); } });
  }));
  addEventListener('resize', () => placeSun(+range.value));
  onRange();
  // the sun rises as you arrive
  if (!reduce) ScrollTrigger.create({ trigger: light, start: 'top 60%', once: true, onEnter: () => {
    const o = { v: 0 }; range.value = 0; onRange();
    gsap.to(o, { v: 200, duration: 2.6, ease: 'power2.inOut', onUpdate: () => { range.value = o.v; onRange(); } });
  } });

  /* =========================================================
     STORIES — contact sheets + loupe
     ========================================================= */
  const STORIES = [
    { title: 'The Harbour Mehndi', place: 'Saluting Battery · Valletta', frames: ['p08_004', 'p09_005', 'p12_007', 'p13_008', 'p22_016', 'p05_001'] },
    { title: 'Pheras by the Sea', place: "Seafront terraces · St Julian's", frames: ['p26_020', 'p27_021', 'p10_006', 'p28_022', 'p17_011', 'p15_010'] },
    { title: 'Sangeet in the Vaults', place: 'Vaulted halls · Valletta', frames: ['p41_033', 'p38_030', 'p33_027', 'p24_018', 'p52_043', 'p25_019'] },
    { title: 'Wonderland', place: 'Palazzo Parisio · Naxxar', frames: ['p46_038', 'p50_041', 'p48_039', 'p49_040', 'p31_025', 'p19_013'] },
    { title: 'Night of the Cannons', place: 'Grand Harbour · Valletta', frames: ['p07_003', 'p39_031', 'p34_028', 'p53_044', 'p20_014', 'p54_045'] }
  ];
  const src = f => `assets/img/${f}.jpg`;
  const sheets = $('.sheets');
  STORIES.forEach((s, i) => {
    const el = document.createElement('article'); el.className = 'sheet';
    el.innerHTML = `
      <div class="sheet__head"><span class="sheet__no">${String(i + 1).padStart(2, '0')}</span><h3 class="sheet__title">${s.title}</h3><span class="sheet__place">${s.place}</span><button class="sheet__open" data-story="${i}">Open story →</button></div>
      <div class="strip" data-story="${i}" role="button" tabindex="0" aria-label="Open ${s.title}">
        <div class="strip__frames">${s.frames.map(f => `<div class="strip__frame" data-src="${src(f)}" style="background-image:url(${src(f)})"></div>`).join('')}</div>
        <div class="strip__edge"><span>EFFECTS TECH 5219</span><span>▸ ${12 + i * 6}A</span><span>MALTA ${2026}</span><span>▸ ${13 + i * 6}A</span></div>
      </div>`;
    sheets.appendChild(el);
  });
  if (!reduce) gsap.from('.sheet', { y: 70, opacity: 0, duration: 1.3, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.sheets', start: 'top 85%' } });

  const loupe = $('.loupe'), limg = $('.loupe__img'), Z = 2.6, R = 115;
  if (canHover) {
    let under = null;
    $$('.strip').forEach(strip => {
      strip.addEventListener('pointermove', e => {
        loupe.style.left = e.clientX + 'px'; loupe.style.top = e.clientY + 'px';
        const fr = document.elementFromPoint(e.clientX, e.clientY)?.closest('.strip__frame');
        if (fr !== under) { under?.classList.remove('is-under'); under = fr; fr?.classList.add('is-under'); }
        if (!fr) { loupe.classList.remove('is-on'); return; }
        const r = fr.getBoundingClientRect();
        limg.style.backgroundImage = `url(${fr.dataset.src})`;
        limg.style.backgroundSize = `${r.width * Z * 2.2}px auto`;
        const bw = r.width * Z * 2.2, bh = bw * (r.height / r.width);
        limg.style.backgroundPosition = `${-((e.clientX - r.left) / r.width * bw - R)}px ${-((e.clientY - r.top) / r.height * bh - R)}px`;
        loupe.classList.add('is-on');
      });
      strip.addEventListener('pointerleave', () => { loupe.classList.remove('is-on'); under?.classList.remove('is-under'); under = null; });
    });
  }

  // story viewer
  const viewer = $('.viewer'), track = $('.viewer__track');
  const openStory = i => {
    const s = STORIES[i];
    $('.viewer__title').innerHTML = `${s.title}<span>${s.place.toUpperCase()}</span>`;
    track.innerHTML = s.frames.map((f, k) => `<figure><img src="${src(f)}" alt="${s.title}, frame ${k + 1}"><figcaption>FR ${String(k + 1).padStart(2, '0')} / ${String(s.frames.length).padStart(2, '0')}</figcaption></figure>`).join('');
    track.scrollLeft = 0;
    viewer.classList.add('is-open'); viewer.setAttribute('aria-hidden', 'false'); lock(true); loupe.classList.remove('is-on');
    if (!reduce) gsap.from($$('figure', track), { x: 120, opacity: 0, duration: 1.1, stagger: .06, ease: 'expo.out' });
    $('.viewer__close').focus();
  };
  const closeStory = () => { viewer.classList.remove('is-open'); viewer.setAttribute('aria-hidden', 'true'); lock(false); };
  $$('[data-story]').forEach(el => {
    el.addEventListener('click', () => openStory(+el.dataset.story));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStory(+el.dataset.story); } });
  });
  $('.viewer__close').addEventListener('click', closeStory);
  track.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); track.scrollLeft += e.deltaY; } }, { passive: false });
  let drag = null;
  track.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') drag = { x: e.clientX, s: track.scrollLeft }; });
  addEventListener('pointermove', e => { if (drag) track.scrollLeft = drag.s - (e.clientX - drag.x); });
  addEventListener('pointerup', () => drag = null);

  /* =========================================================
     FILMS — letterbox closes in as you scroll
     ========================================================= */
  const video = $('.films__video');
  ScrollTrigger.create({ trigger: '.films', start: 'top 80%', end: 'bottom top', onToggle: s => s.isActive ? video.play().catch(() => {}) : video.pause() });
  if (!reduce) {
    gsap.to('.films__bar', { height: '12vh', ease: 'none', scrollTrigger: { trigger: '.films', start: 'top 70%', end: 'top top', scrub: true } });
    gsap.from('.films__list li', { x: 40, opacity: 0, duration: 1.1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.films__list', start: 'top 90%' } });
  }
  const reelbox = $('.reelbox'), reelVid = $('video', reelbox);
  const openReel = () => { reelbox.classList.add('is-open'); reelbox.setAttribute('aria-hidden', 'false'); lock(true); reelVid.currentTime = 0; reelVid.play().catch(() => {}); };
  const closeReel = () => { reelbox.classList.remove('is-open'); reelbox.setAttribute('aria-hidden', 'true'); reelVid.pause(); lock(false); };
  $$('[data-play]').forEach(b => b.addEventListener('click', openReel));
  $('.reelbox__close').addEventListener('click', closeReel);
  reelbox.addEventListener('click', e => { if (e.target === reelbox) closeReel(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeStory(); closeReel(); } });

  /* =========================================================
     CHECK YOUR DATE — three frames
     ========================================================= */
  const form = $('.enquiry'), steps = $$('.step', form), dots = $$('.steps span'), err = $('.enquiry__err');
  let at = 0;
  const go = n => {
    steps[at].classList.remove('is-on'); at = n; steps[at].classList.add('is-on');
    dots.forEach((d, k) => d.classList.toggle('is-on', k <= at)); err.textContent = '';
    if (!reduce) gsap.from(steps[at].children, { y: 20, opacity: 0, duration: .7, stagger: .05, ease: 'expo.out' });
  };
  const valid = () => {
    let ok = true;
    $$('[required]', steps[at]).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.fld').classList.toggle('is-error', bad); if (bad) ok = false;
    });
    if (!ok) err.textContent = at === 0 ? 'Choose your date (an approximate one is fine).' : 'We need your names and an email to reply.';
    return ok;
  };
  $$('[data-next]', form).forEach(b => b.addEventListener('click', () => valid() && go(at + 1)));
  $$('[data-prev]', form).forEach(b => b.addEventListener('click', () => go(at - 1)));
  form.addEventListener('submit', e => {
    e.preventDefault(); if (!valid()) return;
    const d = form.elements.date.value ? new Date(form.elements.date.value + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'your date';
    $('.done__names').textContent = form.elements.name.value ? `, ${form.elements.name.value}` : '';
    $('.done__date').textContent = `${d} in ${form.elements.where.value === 'Not decided yet' ? 'Malta' : form.elements.where.value}`;
    steps.forEach(s => s.classList.remove('is-on')); dots.forEach(d => d.classList.add('is-on'));
    const done = $('.enquiry__done'); done.hidden = false;
    if (!reduce) gsap.from(done.children, { y: 24, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out' });
  });
})();
