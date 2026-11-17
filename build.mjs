// Effects Tech Studio — static site builder.
// Content lives here and in src/home.html; run `node build.mjs` to regenerate site/*.html.
import { readFileSync, writeFileSync } from 'node:fs';

const LOGO = cls => `<svg class="logo-mark ${cls}" viewBox="0 0 460 305" fill="none" stroke="currentColor" stroke-width="15" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M452 72V8H7v289h253v-57H76v-55h144v-60H7"/><path d="M72 70h298v227h-70V128"/></svg>`;
const img = f => `assets/img/${f}`;
const BUILD = Date.now().toString(36);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* ---------------------------------------------------------------- data */
const PAGES = [
  ['index.html', 'Home'],
  ['stories.html', 'Stories'],
  ['experiences.html', 'Experiences'],
  ['studio.html', 'The Studio'],
  ['enquire.html', 'Enquire'],
];

const CHAPTERS = [
  ['ch1', 'I', 'The Arrival'], ['ch2', 'II', 'Mehndi on the Bastions'], ['ch3', 'III', 'The Sangeet'],
  ['ch4', 'IV', 'Vows by the Sea'], ['ch5', 'V', 'Wonderland'], ['ch6', 'VI', 'The Farewell'],
];

const TIERS = [
  { key: 'Silver', no: 'I', for: 'An intimate island wedding', img: 'p13_008.jpg',
    lede: 'For couples who want one perfect day on the island, photographed with the same care as our grandest celebrations.',
    inc: ['Lead and second photographer', 'One wedding day, full coverage', 'Golden-hour portrait session in Mdina or Valletta', 'Hand-edited gallery in our signature tone', 'Private online gallery for your families'] },
  { key: 'Gold', no: 'II', for: 'The classic three-day celebration', img: 'p34_028.jpg', feature: true,
    lede: 'Our most chosen experience: photography and film for the celebration most families imagine when they picture Malta.',
    inc: ['Everything in Silver', 'Two-person cinema crew', 'Four to six minute feature film', 'Teaser film within two weeks', 'Drone coverage where permitted', 'Coverage of up to three functions'] },
  { key: 'Platinum', no: 'III', for: 'An island-wide spectacle', img: 'p50_041.jpg',
    lede: 'Every function, every venue, every guest. For celebrations that take over the island and deserve a full documentary.',
    inc: ['Everything in Gold', 'Photo and cinema crews for every function', 'Same-day edit screened at your reception', 'Twenty to thirty minute documentary film', 'A pair of hand-bound heirloom albums', 'Dedicated producer on the ground'] },
];

const FAQ = [
  ['How far in advance should we enquire?', 'Malta weddings cluster in late spring and early autumn, and we take a small number each season. Most couples reach us twelve to eighteen months ahead; shorter timelines are often possible, so do ask.'],
  ['Does your team travel to Malta for the wedding?', 'Yes. Our photographers, cinematographers and producer arrive before your first function so we can walk every venue in the light we will be shooting in.'],
  ['Can you fly drones over Valletta and the Grand Harbour?', 'Drone coverage is subject to Maltese aviation rules and venue permissions. We handle the applications and only promise aerial shots where they are permitted.'],
  ['When do we receive our photographs and films?', 'A teaser within two weeks, your full gallery within six to eight weeks, and feature films and albums shortly after. Platinum couples see a same-day edit at their reception.'],
  ['Do you cover Gozo and other venues outside Valletta?', 'Of course. Mdina, St Julian\'s, Naxxar, Gozo and private villas across the island are all part of our Malta work.'],
  ['How do we reserve our date?', 'Tell us about your celebration through the enquiry form. Once we confirm availability, a signed agreement and booking retainer secure your date.'],
];

const STORIES = [
  {
    slug: 'the-grand-harbour-wedding', title: 'The Grand Harbour Wedding', short: 'The Grand Harbour',
    kicker: 'A real Malta wedding · Three days', place: 'Valletta · Saluting Battery · Upper Barrakka',
    video: 'malta-wedding-film.mp4', poster: 'film-poster.jpg', cover: 'still-portrait.jpg',
    lead: 'Three days on Valletta\'s bastions: a baraat to the beat of Maltese pipes and drums, pheras under white flowers, a sangeet that ran until dawn and a cannon salute over the harbour.',
    body: 'We photographed and filmed every function, from the garden brunch in the fortress to the final dance. These are frames from the film and the photographs that followed.',
    meta: [['Where', 'Valletta, Malta'], ['Celebration', 'Three days, five functions'], ['Coverage', 'Photography & film'], ['Experience', 'Platinum']],
    photos: [['still-baraat.jpg', 'The walk in'], ['still-embrace.jpg', 'Beneath the mandap'], ['p08_004.jpg', 'Mehndi among the cannons'], ['still-aerial.jpg', 'Valletta, from above'], ['still-pheras.jpg', 'Family, laughing'], ['p09_005.jpg', 'The harbour lounge'], ['still-bride.jpg', 'The bride, at the sangeet'], ['still-music.jpg', 'Music in the fortress garden'], ['p39_031.jpg', 'The cannon salute'], ['still-guests.jpg', 'The garden brunch'], ['p07_003.jpg', 'The last song']],
    pull: 'A baraat with Maltese pipes and drums. <em>Only on this island.</em>',
  },
  {
    slug: 'wonderland-at-palazzo-parisio', title: 'Wonderland at Palazzo Parisio', short: 'Wonderland',
    kicker: 'A masked gala · Naxxar', place: 'Palazzo Parisio · Naxxar',
    hero: 'p50_041.jpg', cover: 'p46_038.jpg',
    lead: 'A baroque palace turned into a dream: living statues in the gilded salon, masked performers in the gardens and a banquet that looked like a Renaissance painting.',
    body: 'The final night of a three-day celebration, and the one where our cinematographers did their most extravagant work.',
    meta: [['Where', 'Palazzo Parisio, Naxxar'], ['Celebration', 'Farewell gala'], ['Coverage', 'Photography & film'], ['Theme', 'Wonderland']],
    photos: [['p46_038.jpg', 'Living statues'], ['p48_039.jpg', 'Masquerade'], ['p49_040.jpg', 'The banquet'], ['p31_025.jpg', 'After dark in Valletta'], ['p30_024.jpg', 'Performers in the square'], ['p24_018.jpg', 'The lounge'], ['p38_030.jpg', 'The vaults, lit for the night'], ['p52_043.jpg', 'Candlelight'], ['p29_023.jpg', 'The church, lit gold']],
    pull: 'Performers who don\'t blink. <em>Guests who couldn\'t stop.</em>',
  },
  {
    slug: 'pheras-by-the-sea', title: 'Pheras by the Sea', short: 'By the Sea',
    kicker: 'A seafront ceremony · St Julian\'s', place: 'Seafront terraces · St Julian\'s',
    hero: 'p27_021.jpg', cover: 'p26_020.jpg',
    lead: 'White-flowered mandaps on a seafront terrace, the last phera timed to the sunset, and moonrise over the Mediterranean before dinner under the palms.',
    body: 'A ceremony planned around the light: every moment placed where the sun would flatter it most.',
    meta: [['Where', 'St Julian\'s, Malta'], ['Celebration', 'Ceremony & dinner'], ['Coverage', 'Photography & film'], ['Golden hour', '18:40']],
    photos: [['p27_021.jpg', 'The mandaps'], ['p26_020.jpg', 'Moonrise'], ['p14_009.jpg', 'The tablescape'], ['p17_011.jpg', 'Dinner under the palms'], ['p15_010.jpg', 'Sunset over the terraces'], ['p28_022.jpg', 'Fire on the water'], ['p25_019.jpg', 'The dance floor'], ['p10_006.jpg', 'Husband and wife']],
    pull: 'We time the last phera to the sunset. <em>To the minute.</em>',
  },
];

const LOCATIONS = [
  ['Valletta', 'Bastions, baroque streets and the Grand Harbour', 'p53_044.jpg'],
  ['Mdina', 'The Silent City on its hill', 'p18_012.jpg'],
  ['St Julian\'s', 'Seafront terraces and five-star resorts', 'p27_021.jpg'],
  ['Naxxar', 'Palazzo Parisio and its gardens', 'p50_041.jpg'],
  ['The Three Cities', 'Across the harbour from Valletta', 'p12_007.jpg'],
];

/* ---------------------------------------------------------------- partials */
const head = (title, desc) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="assets/img/favicon.png">
<link rel="stylesheet" href="assets/css/style.css?v=${BUILD}">
</head>`;

const nav = current => `
<header class="nav">
  <button class="nav__chapters" aria-expanded="false" aria-controls="index">Menu</button>
  <a href="index.html" class="nav__brand" aria-label="Effects Tech Studio, home">${LOGO('nav__logo')}<span class="nav__words"><span>Effects Tech</span><em>studio · malta</em></span></a>
  <a href="enquire.html" class="nav__enquire">Enquire</a>
</header>

<nav class="index" id="index" aria-label="Site">
  <div class="menu">
    <div class="menu__pages">
      ${PAGES.map(([href, label], i) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}><i>0${i + 1}</i>${label}</a>`).join('\n      ')}
    </div>
    <div class="menu__side">
      <p class="menu__label">The story, in six chapters</p>
      ${CHAPTERS.map(([id, no, name]) => `<a href="index.html#${id}"><i>${no}</i>${name}</a>`).join('\n      ')}
      <p class="menu__label">Stories</p>
      ${STORIES.map(s => `<a href="story-${s.slug}.html">${s.title}</a>`).join('\n      ')}
    </div>
  </div>
</nav>`;

const footer = () => `
<footer class="footer">
  <div class="footer__close">
    <p class="footer__kicker">Malta, with love</p>
    <p class="footer__line-big">Every wedding we photograph begins with <em>one conversation.</em></p>
    <a href="enquire.html" class="footer__btn">Enquire about your date</a>
  </div>

  <div class="footer__gallery" aria-hidden="true">
    ${['p26_020.jpg', 'p46_038.jpg', 'still-embrace.jpg', 'p27_021.jpg', 'p18_012.jpg'].map(f => `<figure><img src="${img(f)}" alt="" loading="lazy"></figure>`).join('\n    ')}
  </div>

  <div class="footer__main">
    <div class="footer__id">
      ${LOGO('footer__logo')}
      <p class="footer__name">Effects Tech</p>
      <p class="footer__sub">Studio · Malta</p>
    </div>
    <div class="footer__col"><h4>Explore</h4>${PAGES.slice(1).map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</div>
    <div class="footer__col"><h4>Stories</h4>${STORIES.map(s => `<a href="story-${s.slug}.html">${s.short}</a>`).join('')}</div>
    <div class="footer__col"><h4>Studio</h4><p>Valletta, Malta<br>Mumbai, India</p><a href="https://effectstech.in" target="_blank" rel="noopener">effectstech.in ↗</a></div>
  </div>

  <div class="footer__base">
    <span>© 2026 Effects Tech · Wedding photography &amp; films</span>
    <a href="#top">Back to the top ↑</a>
  </div>
</footer>`;

const overlays = () => `
<div class="lightbox" aria-hidden="true" role="dialog" aria-label="Photograph">
  <button class="lightbox__close" aria-label="Close">Close</button>
  <button class="lightbox__prev" aria-label="Previous photograph">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lightbox__next" aria-label="Next photograph">›</button>
</div>
<div class="reelbox" aria-hidden="true" role="dialog" aria-label="Wedding film">
  <button class="reelbox__close">Close</button>
  <p class="reelbox__title">A wedding in Malta <em>· Effects Tech Studio</em></p>
  <video src="assets/video/malta-wedding-film.mp4" poster="assets/img/film-poster.jpg" controls playsinline preload="none"></video>
</div>
<div class="cursor" aria-hidden="true"><span>View</span></div>
<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/vendor/ScrollTrigger.min.js"></script>
<script src="assets/vendor/lenis.min.js"></script>
<script src="assets/js/main.js?v=${BUILD}"></script>`;

const loader = () => `
<div class="loader" aria-hidden="true">
  ${LOGO('loader__logo')}
  <p class="loader__line">Effects Tech Studio · Malta</p>
</div>`;

const page = ({ file, title, desc, body, cls = '', withLoader = false, rail = false }) =>
  `${head(title, desc)}
<body class="page-${cls}${withLoader ? ' is-loading' : ''}">
${withLoader ? loader() : ''}${nav(file)}
${rail ? `<aside class="rail" aria-hidden="true"><span class="rail__no">I</span><span class="rail__bar"><i></i></span><span class="rail__name">The Arrival</span></aside>` : ''}
<main id="top">
${body}
</main>
${footer()}
${overlays()}
</body>
</html>
`;

const phero = ({ eyebrow, title, sub, image, short = false }) => `
<section class="phero${short ? ' phero--short' : ''}">
  <div class="phero__img" style="background-image:url(${img(image)})"></div>
  <div class="phero__text">
    <p class="eyebrow eyebrow--light">${eyebrow}</p>
    <h1 class="phero__title">${title}</h1>
    ${sub ? `<p class="phero__sub">${sub}</p>` : ''}
  </div>
</section>`;

const cta = (line = 'Tell us about <em>your Malta wedding.</em>') => `
<section class="cta">
  <p class="eyebrow">Your date</p>
  <p class="cta__line">${line}</p>
  <a href="enquire.html" class="cta__btn">Begin your enquiry</a>
</section>`;

const tierCard = t => `<article class="col${t.feature ? ' col--mid' : ''}" data-metal="${t.key.toLowerCase()}"><p class="col__no">${t.no}</p><h3 class="metal">${t.key}</h3><p class="col__sub">Celebration Experience</p><p>${t.for}.</p><a href="experiences.html#${t.key.toLowerCase()}">Discover ${t.key}</a></article>`;

/* ---------------------------------------------------------------- pages */
const out = {};

// HOME
out['index.html'] = page({
  file: 'index.html', cls: 'home', withLoader: true, rail: true,
  title: 'Effects Tech Studio — Wedding Photography & Films in Malta',
  desc: 'Fine-art wedding photography and films in Malta by Effects Tech Studio. See how your wedding in Malta will unfold, chapter by chapter.',
  body: readFileSync('src/home.html', 'utf8')
    .replace(/href="#enquire"/g, 'href="enquire.html"') + `
<!-- ================= FEATURED STORY ================= -->
<section class="feature">
  <a href="story-${STORIES[0].slug}.html" class="feature__link">
    <figure class="feature__img"><img src="${img('still-embrace.jpg')}" alt="The couple embrace beneath a floral mandap at night" loading="lazy"></figure>
    <div class="feature__text">
      <p class="eyebrow">Featured story</p>
      <h2 class="h2">${STORIES[0].title}</h2>
      <p>${STORIES[0].lead}</p>
      <span class="feature__more">Read the story &amp; watch the film →</span>
    </div>
  </a>
</section>

<!-- ================= EXPERIENCES TEASER ================= -->
<section class="collections">
  <p class="eyebrow">Now launching</p>
  <h2 class="h2">Exclusive celebration <em>experiences</em></h2>
  <div class="cols">${TIERS.map(tierCard).join('')}</div>
  <p class="collections__note">Every experience is tailored to your celebration. Investment is shared on enquiry.</p>
</section>
${cta()}`,
});

// STORIES INDEX
out['stories.html'] = page({
  file: 'stories.html', cls: 'stories',
  title: 'Stories — Effects Tech Studio, Malta',
  desc: 'Wedding stories photographed and filmed in Malta by Effects Tech Studio.',
  body: `${phero({ eyebrow: 'Stories', title: 'Weddings we have <em>told</em>', sub: 'Celebrations in Malta, photographed and filmed by our studio.', image: 'p05_001.jpg', short: true })}
<section class="slist">
  ${STORIES.map((s, i) => `
  <a href="story-${s.slug}.html" class="sitem${i % 2 ? ' sitem--flip' : ''}">
    <figure class="sitem__img ph"><img src="${img(s.cover)}" alt="${esc(s.title)}" loading="lazy"></figure>
    <div class="sitem__text">
      <p class="sitem__no">0${i + 1}</p>
      <p class="eyebrow">${s.kicker}</p>
      <h2 class="sitem__title">${s.title}</h2>
      <p>${s.lead}</p>
      <span class="sitem__more">${s.video ? 'Read the story &amp; watch the film' : 'Read the story'} →</span>
    </div>
  </a>`).join('')}
</section>
${cta()}`,
});

// STORY PAGES
STORIES.forEach((s, i) => {
  const next = STORIES[(i + 1) % STORIES.length];
  const hero = s.video
    ? `<section class="phero phero--video">
  <video class="phero__video" src="assets/video/${s.video}" poster="${img(s.poster)}" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video>
  <div class="phero__text"><p class="eyebrow eyebrow--light">${s.kicker}</p><h1 class="phero__title">${s.title}</h1><p class="phero__sub">${s.place}</p></div>
</section>`
    : phero({ eyebrow: s.kicker, title: s.title, sub: s.place, image: s.hero });
  out[`story-${s.slug}.html`] = page({
    file: 'stories.html', cls: 'story',
    title: `${s.title} — Effects Tech Studio, Malta`,
    desc: s.lead,
    body: `${hero}
<section class="sintro">
  <dl class="sintro__meta">${s.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
  <div class="sintro__text"><p class="lead">${s.lead}</p><p class="body">${s.body}</p></div>
</section>
${s.video ? `<section class="sfilm">
  <div class="sfilm__frame">
    <video src="assets/video/${s.video}" poster="${img(s.poster)}" playsinline preload="none"></video>
    <button class="sfilm__play" aria-label="Play the film"><span>▶</span><em>Watch the film · 3 min · sound on</em></button>
  </div>
</section>` : ''}
<section class="sgal">
  ${s.photos.map(([f, cap], k) => `<figure class="ph sg sg--${k % 5}" data-reveal><img src="${img(f)}" alt="${esc(cap)}" loading="lazy"><figcaption>${cap}</figcaption></figure>`).join('\n  ')}
</section>
<p class="pull">${s.pull}</p>
<a href="story-${next.slug}.html" class="snext">
  <div class="snext__img" style="background-image:url(${img(next.cover)})"></div>
  <div class="snext__text"><p class="eyebrow eyebrow--light">Next story</p><p class="snext__title">${next.title} →</p></div>
</a>`,
  });
});

// EXPERIENCES
out['experiences.html'] = page({
  file: 'experiences.html', cls: 'experiences',
  title: 'Silver, Gold & Platinum Celebration Experiences — Effects Tech Studio',
  desc: 'Exclusive wedding photography and film experiences in Malta: Silver, Gold and Platinum.',
  body: `${phero({ eyebrow: 'Now launching', title: 'Exclusive celebration <em>experiences</em>', sub: 'Silver · Gold · Platinum', image: 'p14_009.jpg', short: true })}
<section class="tiers">
  ${TIERS.map((t, i) => `
  <article class="tier${t.feature ? ' tier--dark' : ''}${i % 2 ? ' tier--flip' : ''}" id="${t.key.toLowerCase()}" data-metal="${t.key.toLowerCase()}">
    <figure class="tier__img ph" data-reveal><img src="${img(t.img)}" alt="" loading="lazy"></figure>
    <div class="tier__text">
      <p class="col__no">${t.no}${t.feature ? ' · Most chosen' : ''}</p>
      <h2 class="metal tier__name">${t.key}</h2>
      <p class="tier__sub">Celebration Experience · ${t.for}</p>
      <p class="tier__lede">${t.lede}</p>
      <ul>${t.inc.map(x => `<li>${x}</li>`).join('')}</ul>
      <a href="enquire.html?exp=${t.key}" class="tier__btn">Enquire about ${t.key}</a>
    </div>
  </article>`).join('')}
</section>

<section class="keep">
  <div class="keep__head"><p class="eyebrow">What you keep</p><h2 class="h2">Long after the flowers, <em>these remain.</em></h2></div>
  <div class="keep__grid">
    <article><figure class="ph" data-reveal><img src="${img('still-baraat.jpg')}" alt="A bride and groom walk arm in arm through their families" loading="lazy"></figure><h3>The Gallery</h3><p>Every chapter, edited by hand in our signature tone, in a private gallery your whole family can share.</p></article>
    <article><figure class="ph" data-reveal><img src="${img('still-embrace.jpg')}" alt="The couple embrace beneath a floral mandap at night" loading="lazy"></figure><h3>The Film</h3><p>A cinematic feature of your celebration, plus a teaser within two weeks and, with Platinum, a same-day edit.</p></article>
    <article><figure class="ph" data-reveal><img src="${img('still-portrait.jpg')}" alt="The couple laugh together against Valletta at night" loading="lazy"></figure><h3>The Heirloom Album</h3><p>Hand-bound in linen and leather on archival paper: the book your grandchildren will take down from the shelf.</p></article>
  </div>
</section>

<section class="steps">
  <p class="eyebrow">From first call to final frame</p>
  <ol>
    <li><span>01</span><h4>A conversation</h4><p>Your families, your traditions, the photographs you already know you want.</p></li>
    <li><span>02</span><h4>The light plan</h4><p>A minute-by-minute plan built around Malta's sun and your venues.</p></li>
    <li><span>03</span><h4>A portrait session</h4><p>A pre-wedding shoot in Mdina or Valletta, so you meet the lens first.</p></li>
    <li><span>04</span><h4>The celebration</h4><p>Quiet, invisible crews. You remember the day, not the cameras.</p></li>
    <li><span>05</span><h4>The reveal</h4><p>Teaser in two weeks, gallery in six to eight, films and albums soon after.</p></li>
  </ol>
</section>

<section class="faq">
  <div class="faq__head"><p class="eyebrow">Questions</p><h2 class="h2">Before you <em>ask</em></h2></div>
  <div class="faq__list">
    ${FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n    ')}
  </div>
</section>
${cta('Which experience is <em>yours?</em>')}`,
});

// STUDIO
out['studio.html'] = page({
  file: 'studio.html', cls: 'studio',
  title: 'The Studio — Effects Tech Studio, Malta',
  desc: 'Effects Tech Studio: wedding photographers and filmmakers from the house that produces India\'s grandest celebrations, now in Malta.',
  body: `${phero({ eyebrow: 'The Studio', title: 'We were behind the lights <em>long before</em> the lens', sub: 'Effects Tech Studio · Malta', image: 'p38_030.jpg', short: true })}
<section class="manifesto">
  <p class="manifesto__text">Effects Tech has spent years designing and producing some of India's most celebrated weddings and events. Our studio photographs and films them the way only a production house can: <em>knowing every cue before it happens.</em></p>
</section>

<section class="pillars">
  <article><figure class="ph" data-reveal><img src="${img('p09_005.jpg')}" alt="Lounges among the cannons of the Saluting Battery" loading="lazy"></figure><p class="pillars__no">I</p><h3>We know the cue sheet</h3><p>When the lights drop for the first dance or the cannons fire over the harbour, we are already in position, because we know the running order as well as the producers do.</p></article>
  <article><figure class="ph" data-reveal><img src="${img('still-portrait.jpg')}" alt="The couple laughing together at night" loading="lazy"></figure><p class="pillars__no">II</p><h3>Quiet, invisible crews</h3><p>Small, discreet teams who move with the celebration. Your guests will remember the evening, not the cameras.</p></article>
  <article><figure class="ph" data-reveal><img src="${img('p53_044.jpg')}" alt="Valletta lit gold at blue hour" loading="lazy"></figure><p class="pillars__no">III</p><h3>Planned around the light</h3><p>Malta's light moves fast. We build every wedding day around it, from first light in Mdina to blue hour over Valletta.</p></article>
</section>

<section class="places">
  <div class="places__head"><p class="eyebrow">Where we work</p><h2 class="h2">The whole island is <em>a stage</em></h2></div>
  <div class="places__list">
    ${LOCATIONS.map(([n, d, f]) => `<a class="place" href="enquire.html" data-img="${img(f)}"><span class="place__name">${n}</span><span class="place__desc">${d}</span><span class="place__arrow">→</span></a>`).join('\n    ')}
  </div>
  <div class="place__float" aria-hidden="true"><img alt=""></div>
</section>
${cta()}`,
});

// ENQUIRE
out['enquire.html'] = page({
  file: 'enquire.html', cls: 'enquire-page',
  title: 'Enquire — Effects Tech Studio, Malta',
  desc: 'Enquire about wedding photography and films in Malta with Effects Tech Studio.',
  body: `<section class="enquire enquire--page" id="enquire">
  <figure class="enquire__img"><img src="${img('p10_006.jpg')}" alt="A bride and groom walking through their guests"></figure>
  <div class="enquire__box">
    <p class="eyebrow">Enquire</p>
    <h1 class="h2">Tell us about <em>your Malta wedding</em></h1>
    <p class="enquire__lede">We take a small number of weddings on the island each season, so that every one receives our full attention. We reply within one day.</p>
    <form class="form" novalidate>
      <div class="row">
        <label class="f"><input name="name" required placeholder=" " autocomplete="name"><span>Your names</span></label>
        <label class="f"><input name="email" type="email" required placeholder=" " autocomplete="email"><span>Email</span></label>
      </div>
      <div class="row">
        <label class="f"><input name="date" placeholder=" "><span>Wedding date or season</span></label>
        <label class="f"><input name="guests" inputmode="numeric" placeholder=" "><span>Number of guests</span></label>
      </div>
      <fieldset class="opts">
        <legend>Celebration experience</legend>
        ${TIERS.map(t => `<label><input type="radio" name="col" value="${t.key}"${t.key === 'Gold' ? ' checked' : ''}><span>${t.key}</span></label>`).join('\n        ')}
        <label><input type="radio" name="col" value="Not sure yet"><span>Not sure yet</span></label>
      </fieldset>
      <label class="f f--area"><textarea name="msg" rows="3" placeholder=" "></textarea><span>Tell us your story</span></label>
      <button class="send" type="submit">Send enquiry</button>
      <p class="form__note" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
<section class="next">
  <p class="eyebrow">What happens next</p>
  <ol>
    <li><span>I</span><h4>We reply within a day</h4><p>With availability for your date and a few questions about your celebration.</p></li>
    <li><span>II</span><h4>A conversation</h4><p>A call with our producer to hear your story and recommend the right experience.</p></li>
    <li><span>III</span><h4>Your date is held</h4><p>A signed agreement and booking retainer secure the date. Then we begin planning around the light.</p></li>
  </ol>
</section>`,
});

for (const [f, html] of Object.entries(out)) writeFileSync(`site/${f}`, html);
console.log('built', Object.keys(out).length, 'pages:', Object.keys(out).join(', '));
