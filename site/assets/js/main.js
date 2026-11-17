/* Effects Tech Studio — Malta · a wedding in six chapters */
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
    lenis.stop();
    window.lenis = lenis;
  }
  const lock = on => lenis && (on ? lenis.stop() : lenis.start());
  const goTo = id => lenis ? lenis.scrollTo(id, { duration: 2 }) : $(id).scrollIntoView({ behavior: 'smooth' });

  /* ---------- wrap every photograph for cropping + reveal ---------- */
  $$('.ph img').forEach(img => {
    const crop = document.createElement('div'); crop.className = 'ph__crop';
    img.parentNode.insertBefore(crop, img); crop.appendChild(img);
  });

  /* ---------- loader → hero ---------- */
  const intro = () => {
    const done = () => { document.body.classList.remove('is-loading'); $('.loader')?.remove(); lock(false); ScrollTrigger.refresh(); };
    if (reduce) { done(); return; }
    gsap.timeline({ onComplete: done })
      .from('.loader__logo path', { strokeDasharray: 1600, strokeDashoffset: 1600, duration: 1.6, stagger: .2, ease: 'power2.inOut' })
      .from('.loader__line', { opacity: 0, y: 10, duration: .8 }, '-=.7')
      .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.inOut', delay: .3 })
      .from('.hero__title span, .hero__title em', { y: 80, opacity: 0, duration: 1.6, stagger: .15, ease: 'expo.out' }, '-=.6')
      .from('.hero .eyebrow, .hero__sub, .hero__scroll, .nav', { opacity: 0, y: 20, duration: 1.2, stagger: .1, ease: 'expo.out' }, '-=1.2');
  };
  if (document.readyState === 'complete') intro(); else addEventListener('load', intro);

  /* ---------- nav + chapters index ---------- */
  const nav = $('.nav'), index = $('#index'), idxBtn = $('.nav__chapters');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-light', y > innerHeight * .85);
    // over dark photographs and noir sections the bar turns dark too
    const under = document.elementsFromPoint(innerWidth / 2, nav.offsetHeight + 2).find(el => !nav.contains(el));
    nav.classList.toggle('is-dark', !!under?.closest('.opener, .chapter--dark, .film, .footer, .hero'));
    nav.classList.toggle('is-hidden', y > lastY && y > innerHeight && !index.classList.contains('is-open'));
    lastY = y;
  }, { passive: true });
  const setIndex = open => { index.classList.toggle('is-open', open); idxBtn.setAttribute('aria-expanded', open); lock(open); };
  idxBtn.addEventListener('click', () => setIndex(!index.classList.contains('is-open')));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    if (index.classList.contains('is-open')) setIndex(false);
    if (a.dataset.col) { const r = $(`input[name="col"][value="${a.dataset.col}"]`); if (r) r.checked = true; }
    goTo(id);
  }));

  /* ---------- hero slideshow ---------- */
  const heroImgs = $$('.hero__img'); let h = 0;
  setInterval(() => { heroImgs[h].classList.remove('is-on'); h = (h + 1) % heroImgs.length; heroImgs[h].classList.add('is-on'); }, 5500);

  if (!reduce) {
    /* the hero photograph settles into a print as you scroll */
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__frame', { clipPath: 'inset(9% 12% 9% 12%)', ease: 'none' }, 0)
      .to('.hero__text', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
      .to('.hero__scroll', { opacity: 0, ease: 'none' }, 0);

    /* chapter openers: slow zoom + title rise */
    $$('.opener').forEach(op => {
      gsap.fromTo($('.opener__img', op), { scale: 1.28, yPercent: -6 }, { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: op, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from($('.opener__text', op).children, { y: 70, opacity: 0, duration: 1.6, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: op, start: 'top 45%' } });
    });

    /* photographs develop into view */
    $$('[data-reveal] .ph__crop, .reel .ph__crop').forEach(crop => {
      gsap.timeline({ scrollTrigger: { trigger: crop, start: 'top 90%' } })
        .from(crop, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
        .from($('img', crop), { scale: 1.3, duration: 2, ease: 'expo.out' }, '-=1.2');
    });
    $$('.copy, .prologue__text, .keep__head, .keep article h3, .col, .pull, .collections .h2').forEach(el =>
      gsap.from(el, { y: 50, opacity: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    gsap.from('.film__text > *', { y: 50, opacity: 0, duration: 1.4, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.film', start: 'top 55%' } });
  }

  /* ---------- chapter rail ---------- */
  const rail = $('.rail'), railBar = $('.rail__bar i');
  $$('.chapter').forEach(ch => {
    ScrollTrigger.create({
      trigger: ch, start: 'top 50%', end: 'bottom 50%',
      onToggle: s => {
        if (s.isActive) {
          rail.classList.add('is-on');
          rail.classList.toggle('is-dark', ch.classList.contains('chapter--dark'));
          $('.rail__no').textContent = ch.dataset.no; $('.rail__name').textContent = ch.dataset.name;
        } else if (!$$('.chapter').some(c => ScrollTrigger.isInViewport(c, .5))) rail.classList.remove('is-on');
      },
      onUpdate: s => { railBar.style.transform = `scaleY(${s.progress})`; }
    });
  });
  // the openers are dark photographs: let the rail read in light
  $$('.opener').forEach(op => ScrollTrigger.create({ trigger: op, start: 'top 50%', end: 'bottom 50%', onToggle: s => s.isActive && rail.classList.add('is-dark'), onLeave: () => !op.closest('.chapter--dark') && rail.classList.remove('is-dark'), onLeaveBack: () => !op.closest('.chapter--dark') && rail.classList.remove('is-dark') }));

  /* ---------- the sangeet reel: drag sideways ---------- */
  const reel = $('[data-drag]'); let drag = null, dragged = false;
  if (reel) {
    reel.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, s: reel.scrollLeft }; dragged = false; reel.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 5) dragged = true; reel.scrollLeft = drag.s - dx; });
    addEventListener('pointerup', () => { drag = null; reel.classList.remove('is-drag'); });
  }

  /* ---------- cursor ---------- */
  const cursor = $('.cursor'); let cx = -200, cy = -200, tx = -200, ty = -200, on = false;
  if (canHover) {
    cursor.style.transition = 'none';
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; on = !!e.target.closest?.('.ph__crop'); }, { passive: true });
    addEventListener('scroll', () => { const el = document.elementFromPoint(tx, ty); on = !!el?.closest('.ph__crop'); }, { passive: true });
    let s = 0;
    (function loop() {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2; s += ((on ? 1 : 0) - s) * .18;
      cursor.style.transform = `translate(${cx}px,${cy}px) scale(${s.toFixed(3)})`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- lightbox ---------- */
  const lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  const all = $$('.ph__crop img'); let li = 0;
  const showLb = i => { li = (i + all.length) % all.length; const im = all[li]; lbImg.src = im.src; lbImg.alt = im.alt; lbCap.textContent = im.closest('.ph').querySelector('figcaption')?.textContent || im.alt; };
  const openLb = i => { showLb(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lock(true); };
  const closeLb = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lock(false); };
  all.forEach((im, i) => {
    const crop = im.parentNode; crop.tabIndex = 0; crop.setAttribute('role', 'button'); crop.setAttribute('aria-label', 'View photograph: ' + im.alt);
    crop.addEventListener('click', () => { if (!dragged) openLb(i); });
    crop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); } });
  });
  $('.lightbox__close').addEventListener('click', closeLb);
  $('.lightbox__prev').addEventListener('click', () => showLb(li - 1));
  $('.lightbox__next').addEventListener('click', () => showLb(li + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  /* ---------- film ---------- */
  const fv = $('.film__video');
  ScrollTrigger.create({ trigger: '.film', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? fv.play().catch(() => {}) : fv.pause() });
  const rb = $('.reelbox'), rv = $('video', rb);
  const openReel = () => { rb.classList.add('is-open'); rb.setAttribute('aria-hidden', 'false'); lock(true); rv.currentTime = 0; rv.play().catch(() => {}); };
  const closeReel = () => { rb.classList.remove('is-open'); rb.setAttribute('aria-hidden', 'true'); rv.pause(); lock(false); };
  $$('[data-play]').forEach(b => b.addEventListener('click', openReel));
  $('.reelbox__close').addEventListener('click', closeReel);
  rb.addEventListener('click', e => { if (e.target === rb) closeReel(); });

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLb(); closeReel(); if (index.classList.contains('is-open')) setIndex(false); }
    if (lb.classList.contains('is-open') && e.key === 'ArrowRight') showLb(li + 1);
    if (lb.classList.contains('is-open') && e.key === 'ArrowLeft') showLb(li - 1);
  });

  /* ---------- enquiry ---------- */
  const form = $('.form'), note = $('.form__note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ['name', 'email'].forEach(n => {
      const f = form.elements[n], bad = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.f').classList.toggle('is-error', bad); if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Kindly share your names and an email.'; return; }
    const names = form.elements.name.value.trim();
    note.textContent = `Thank you, ${names}. We will write to you within a day about your Malta wedding.`;
    form.reset(); form.elements.col[1].checked = true;
  });
})();
