/* Effects Tech Studio — Malta · shared behaviour for every page */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ duration: 1.35, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }
  const lock = on => lenis && (on ? lenis.stop() : lenis.start());
  const goTo = target => lenis ? lenis.scrollTo(target, { duration: 2 }) : $(target)?.scrollIntoView({ behavior: 'smooth' });

  /* ---------- wrap every photograph for cropping + reveal ---------- */
  $$('.ph img').forEach(img => {
    const crop = document.createElement('div'); crop.className = 'ph__crop';
    img.parentNode.insertBefore(crop, img); crop.appendChild(img);
  });

  /* ---------- loader (home) ---------- */
  const loader = $('.loader');
  const intro = () => {
    const done = () => { document.body.classList.remove('is-loading'); loader?.remove(); lock(false); ScrollTrigger.refresh(); };
    if (!loader) { if (!reduce && $('.phero__text')) gsap.from('.phero__text > *', { y: 50, opacity: 0, duration: 1.5, stagger: .12, ease: 'expo.out' }); return; }
    if (reduce) { done(); return; }
    lock(true);
    const tl = gsap.timeline({ onComplete: done })
      .from('.loader__logo path', { strokeDasharray: 1600, strokeDashoffset: 1600, duration: 1.6, stagger: .2, ease: 'power2.inOut' })
      .from('.loader__line', { opacity: 0, y: 10, duration: .8 }, '-=.7')
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.inOut', delay: .3 });
    if ($('.hero__title')) tl
      .from('.hero__title span, .hero__title em', { y: 80, opacity: 0, duration: 1.6, stagger: .15, ease: 'expo.out' }, '-=.6')
      .from('.hero .eyebrow, .hero__sub, .hero__scroll', { opacity: 0, y: 20, duration: 1.2, stagger: .1, ease: 'expo.out' }, '-=1.2');
  };
  if (document.readyState === 'complete') intro(); else addEventListener('load', intro);

  /* ---------- nav + menu ---------- */
  const nav = $('.nav'), menu = $('#index'), menuBtn = $('.nav__chapters');
  const solidNav = !$('.hero, .phero'); // pages without a photo hero keep a solid bar
  const DARK = '.opener, .chapter--dark, .film, .footer, .hero, .phero, .snext, .tier--dark, .places';
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-light', solidNav || y > 60);
    const under = document.elementsFromPoint(innerWidth / 2, nav.offsetHeight + 2).find(el => !nav.contains(el));
    nav.classList.toggle('is-dark', !!under?.closest(DARK));
    nav.classList.toggle('is-hidden', y > lastY && y > innerHeight && !menu.classList.contains('is-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const setMenu = open => { menu.classList.toggle('is-open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.textContent = open ? 'Close' : 'Menu'; lock(open); };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  // in-page anchors (and index.html#chX when already on the home page)
  $$('a[href*="#"]').forEach(a => a.addEventListener('click', e => {
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    const target = $(url.hash); if (!target) return;
    e.preventDefault();
    if (menu.classList.contains('is-open')) setMenu(false);
    goTo(target);
  }));
  // arriving at index.html#chX from another page
  if (location.hash && $(location.hash)) addEventListener('load', () => setTimeout(() => goTo($(location.hash)), loader ? 3600 : 300));

  /* ---------- page curtain: lifts on arrival, falls before leaving ---------- */
  const curtain = $('.curtain');
  if (curtain && !reduce) {
    $$('a[href]').forEach(a => a.addEventListener('click', e => {
      const url = new URL(a.href, location.href);
      if (a.target === '_blank' || url.origin !== location.origin || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (url.pathname === location.pathname) return; // in-page anchors are handled above
      e.preventDefault();
      curtain.style.display = 'grid'; curtain.classList.add('is-closing');
      setTimeout(() => { location.href = url.href; }, 650);
    }));
    addEventListener('pageshow', ev => { if (ev.persisted) curtain.classList.remove('is-closing'); });
  }

  /* ---------- home hero film: loop a calm passage of the wedding film ---------- */
  const hv = $('.hero__video');
  if (hv) {
    const [a, b] = (hv.dataset.loop || '0,0').split(',').map(Number);
    // only reveal the film once it has really jumped to the calm passage;
    // if the server can't seek, the photo slideshow underneath simply stays.
    hv.addEventListener('seeked', () => { if (hv.currentTime >= a - .5 && hv.currentTime < b) { hv.play().catch(() => {}); hv.classList.add('is-playing'); } });
    const start = () => { hv.pause(); hv.currentTime = a; };
    if (hv.readyState >= 1) start(); else hv.addEventListener('loadedmetadata', start, { once: true });
    hv.addEventListener('timeupdate', () => { if (hv.currentTime >= b || hv.currentTime < a - 1) hv.currentTime = a; });
  }

  /* ---------- home hero ---------- */
  const heroImgs = $$('.hero__img');
  if (heroImgs.length > 1) { let h = 0; setInterval(() => { heroImgs[h].classList.remove('is-on'); h = (h + 1) % heroImgs.length; heroImgs[h].classList.add('is-on'); }, 5500); }

  if (!reduce) {
    if ($('.hero')) gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__frame', { clipPath: 'inset(9% 12% 9% 12%)', ease: 'none' }, 0)
      .to('.hero__text', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
      .to('.hero__scroll', { opacity: 0, ease: 'none' }, 0);

    $$('.phero').forEach(p => {
      const bg = $('.phero__img', p);
      if (bg) gsap.fromTo(bg, { scale: 1.15 }, { scale: 1, yPercent: 10, ease: 'none', scrollTrigger: { trigger: p, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to($('.phero__text', p), { yPercent: -25, opacity: 0, ease: 'none', scrollTrigger: { trigger: p, start: 'top top', end: 'bottom top', scrub: true } });
    });

    $$('.opener').forEach(op => {
      gsap.fromTo($('.opener__img', op), { scale: 1.28, yPercent: -6 }, { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: op, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from($('.opener__text', op).children, { y: 70, opacity: 0, duration: 1.6, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: op, start: 'top 45%' } });
    });

    $$('[data-reveal] .ph__crop, .reel .ph__crop, .sitem .ph__crop').forEach(crop => {
      gsap.timeline({ scrollTrigger: { trigger: crop, start: 'top 90%' } })
        .from(crop, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
        .from($('img', crop), { scale: 1.3, duration: 2, ease: 'expo.out' }, '-=1.2');
    });
    $$('.copy, .prologue__text, .keep__head, .keep article h3, .col, .pull, .collections .h2, .cta > *, .sintro > *, .sitem__text, .tier__text, .steps li, .next li, .faq__list details, .manifesto__text, .pillars h3, .place, .feature__text, .places__head, .faq__head').forEach(el =>
      gsap.from(el, { y: 50, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    if ($('.film')) gsap.from('.film__text > *', { y: 50, opacity: 0, duration: 1.4, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.film', start: 'top 55%' } });
  }

  /* ---------- chapter rail (home) ---------- */
  const rail = $('.rail');
  if (rail) {
    const railBar = $('.rail__bar i'), chapters = $$('.chapter');
    chapters.forEach(ch => ScrollTrigger.create({
      trigger: ch, start: 'top 50%', end: 'bottom 50%',
      onToggle: s => {
        if (s.isActive) {
          rail.classList.add('is-on'); rail.classList.toggle('is-dark', ch.classList.contains('chapter--dark'));
          $('.rail__no').textContent = ch.dataset.no; $('.rail__name').textContent = ch.dataset.name;
        } else if (!chapters.some(c => ScrollTrigger.isInViewport(c, .5))) rail.classList.remove('is-on');
      },
      onUpdate: s => { railBar.style.transform = `scaleY(${s.progress})`; }
    }));
    $$('.opener').forEach(op => ScrollTrigger.create({ trigger: op, start: 'top 50%', end: 'bottom 50%',
      onToggle: s => s.isActive && rail.classList.add('is-dark'),
      onLeave: () => !op.closest('.chapter--dark') && rail.classList.remove('is-dark'),
      onLeaveBack: () => !op.closest('.chapter--dark') && rail.classList.remove('is-dark') }));
  }

  /* ---------- draggable reel ---------- */
  const reel = $('[data-drag]'); let drag = null, dragged = false;
  if (reel) {
    reel.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, s: reel.scrollLeft }; dragged = false; reel.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 5) dragged = true; reel.scrollLeft = drag.s - dx; });
    addEventListener('pointerup', () => { drag = null; reel.classList.remove('is-drag'); });
  }

  /* ---------- cursor ---------- */
  const cursor = $('.cursor');
  if (canHover && cursor) {
    let cx = -200, cy = -200, tx = -200, ty = -200, on = false, s = 0;
    const isView = el => !!el?.closest?.('.ph__crop') && !el.closest('.sitem');
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; on = isView(e.target); }, { passive: true });
    addEventListener('scroll', () => { on = isView(document.elementFromPoint(tx, ty)); }, { passive: true });
    (function loop() {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2; s += ((on ? 1 : 0) - s) * .18;
      cursor.style.transform = `translate(${cx}px,${cy}px) scale(${s.toFixed(3)})`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- floating image over the places list (studio) ---------- */
  const pf = $('.place__float');
  if (pf && canHover) {
    const pimg = $('img', pf); let px = 0, py = 0, fx = 0, fy = 0;
    $$('.place').forEach(p => {
      p.addEventListener('pointerenter', () => { pimg.src = p.dataset.img; pf.classList.add('is-on'); });
      p.addEventListener('pointerleave', () => pf.classList.remove('is-on'));
    });
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; }, { passive: true });
    (function loop() { fx += (px - fx) * .12; fy += (py - fy) * .12; pf.style.transform = `translate(${fx + 30}px,${fy - 180}px) rotate(${(px - fx) * .03}deg)`; requestAnimationFrame(loop); })();
  }

  /* ---------- lightbox (photographs that aren't links) ---------- */
  const lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  const all = $$('.ph__crop img').filter(im => !im.closest('a')); let li = 0;
  const showLb = i => { li = (i + all.length) % all.length; const im = all[li]; lbImg.src = im.src; lbImg.alt = im.alt; lbCap.textContent = im.closest('.ph')?.querySelector('figcaption')?.textContent || im.alt; };
  const openLb = i => { showLb(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lock(true); };
  const closeLb = () => { if (!lb.classList.contains('is-open')) return; lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lock(false); };
  all.forEach((im, i) => {
    const crop = im.parentNode; crop.tabIndex = 0; crop.setAttribute('role', 'button'); crop.setAttribute('aria-label', 'View photograph: ' + im.alt);
    crop.addEventListener('click', () => { if (!dragged) openLb(i); });
    crop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); } });
  });
  $('.lightbox__close').addEventListener('click', closeLb);
  $('.lightbox__prev').addEventListener('click', () => showLb(li - 1));
  $('.lightbox__next').addEventListener('click', () => showLb(li + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  /* ---------- films ---------- */
  const fv = $('.film__video');
  if (fv) ScrollTrigger.create({ trigger: '.film', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? fv.play().catch(() => {}) : fv.pause() });
  const rb = $('.reelbox'), rv = $('video', rb);
  const openReel = () => { rb.classList.add('is-open'); rb.setAttribute('aria-hidden', 'false'); lock(true); rv.currentTime = 0; rv.play().catch(() => {}); };
  const closeReel = () => { if (!rb.classList.contains('is-open')) return; rb.classList.remove('is-open'); rb.setAttribute('aria-hidden', 'true'); rv.pause(); lock(false); };
  $$('[data-play]').forEach(b => b.addEventListener('click', openReel));
  $('.reelbox__close').addEventListener('click', closeReel);
  rb.addEventListener('click', e => { if (e.target === rb) closeReel(); });
  // inline film on story pages
  const sf = $('.sfilm__frame');
  if (sf) {
    const v = $('video', sf);
    $('.sfilm__play', sf).addEventListener('click', () => { sf.classList.add('is-playing'); v.controls = true; v.currentTime = 0; v.play().catch(() => {}); });
    $('.phero__video')?.play().catch(() => {});
  }

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLb(); closeReel(); if (menu.classList.contains('is-open')) setMenu(false); }
    if (lb.classList.contains('is-open') && e.key === 'ArrowRight') showLb(li + 1);
    if (lb.classList.contains('is-open') && e.key === 'ArrowLeft') showLb(li - 1);
  });

  /* ---------- enquiry ---------- */
  const form = $('.form');
  if (form) {
    const exp = new URLSearchParams(location.search).get('exp');
    if (exp) { const r = $(`input[name="col"][value="${CSS.escape(exp)}"]`); if (r) r.checked = true; }
    const note = $('.form__note');
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      ['name', 'email'].forEach(n => {
        const f = form.elements[n], bad = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.closest('.f').classList.toggle('is-error', bad); if (bad) ok = false;
      });
      if (!ok) { note.textContent = 'Kindly share your names and an email.'; return; }
      note.textContent = `Thank you, ${form.elements.name.value.trim()}. We will write to you within a day about your Malta wedding.`;
      form.reset(); const g = $('input[name="col"][value="Gold"]'); if (g) g.checked = true;
    });
  }
})();
