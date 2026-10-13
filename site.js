/* ════════════════════════════════════════════════════════════════
   Wrappi — shared site script (every page)
   EDIT HERE — Wrappi's numbers, from their own Instagram posts (Sept–Oct 2026)
   ════════════════════════════════════════════════════════════════ */
window.WRAPPI = {
  wa: '4746228133',                       // WhatsApp number (no +, no spaces)
  phones: ['+47 462 28 133', '+47 463 61 675'],
  address: 'Strømsveien 324, 1081 Oslo',
  instagram: 'https://www.instagram.com/wrappi__/',
  sizes: { // full-car PPF tiers + Color PPF autumn campaign tiers
    small: { en: 'Small car', no: 'Liten bil', hint: 'ID.3, MG4, Leaf', ppf: 30000, color: 33000 },
    mid:   { en: 'Mid-size', no: 'Mellomstor', hint: 'Model 3, i4, Polestar 2', ppf: 33000, color: 33000 },
    suv:   { en: 'Large / SUV', no: 'Stor / SUV', hint: 'ID.4, Enyaq, Q4 e-tron', ppf: 36000, color: 38000 },
    xl:    { en: 'XL / van', no: 'XL / varebil', hint: 'ID. Buzz, Transporter', ppf: 45000, color: 45000, from: true }
  },
  services: { // g = only one per group · p = price (number, 'size:ppf', 'size:color') · null = on request
    ppfFull:  { g: 'ppf', en: 'PPF · full car', no: 'PPF · hel bil', p: 'size:ppf' },
    colorPpf: { g: 'ppf', en: 'Color PPF · autumn price', no: 'Farget PPF · høstpris', p: 'size:color', from: true },
    ppfFront: { g: 'ppf', en: 'Front PPF', no: 'Front PPF', p: 12900, from: true },
    shine:    { g: 'shine', en: 'Full Shine', no: 'Full Shine', p: 5999 },
    shineCer: { g: 'shine', en: 'Full Shine + ceramic', no: 'Full Shine + keramisk', p: 6999 },
    polish1:  { g: 'shine', en: '1-step polish', no: 'Polering 1-trinn', p: 2990, from: true },
    polish2:  { g: 'shine', en: '2-step polish', no: 'Polering 2-trinn', p: 4990, from: true },
    wrap:     { en: 'Colour-change wrap', no: 'Fargebytte med folie', p: null },
    details:  { en: 'Chrome delete / stripes / details', no: 'Chrome delete / striper / detaljer', p: null },
    fleet:    { en: 'Fleet graphics', no: 'Firmabil / profilering', p: null },
    tint:     { en: 'Window tint', no: 'Vindusfilm', p: null },
    ceramic:  { en: 'Ceramic coating on its own', no: 'Keramisk coating alene', p: null }
  }
};
/* ════════════════════════════════════════════════════════════════ */

(() => {
const WRAPPI = window.WRAPPI, WR = window.WR || { lang: 'no', routes: {} };
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LANG = WR.lang;
const tx = (en, no) => LANG === 'no' ? no : en;
const nf = n => Math.round(n).toLocaleString(LANG === 'no' ? 'nb-NO' : 'en-GB');
const nok = n => 'NOK ' + nf(n);
const wa = t => `https://wa.me/${WRAPPI.wa}?text=${encodeURIComponent(t)}`;
const R = k => WR.routes[k] || './';

/* language preference: remember the last choice so the home page opens in it next time */
$$('[data-setlang]').forEach(a => a.addEventListener('click', () => { try { localStorage.setItem('wrappi-lang', a.dataset.setlang); } catch (e) {} }));

/* visitors whose browser isn't Norwegian get a quiet link to the English page (no redirect — both versions stay indexable) */
(() => {
  let pref = null; try { pref = localStorage.getItem('wrappi-lang'); } catch (e) {}
  const nb = /^(nb|nn|no)\b/i.test(navigator.language || '');
  const want = pref || (nb ? 'no' : 'en');
  if (want === LANG || !WR.other) return;
  try { if (sessionStorage.getItem('wrappi-langnote')) return; } catch (e) {}
  const el = document.createElement('div'); el.className = 'langnote'; el.setAttribute('role', 'note');
  el.innerHTML = want === 'en' ? `<span>This page is in Norwegian.</span><a href="${WR.other}" data-setlang="en">English</a><button type="button" aria-label="Close"><svg><use href="#i-x"/></svg></button>` : `<span>Denne siden er på engelsk.</span><a href="${WR.other}" data-setlang="no">Norsk</a><button type="button" aria-label="Lukk"><svg><use href="#i-x"/></svg></button>`;
  document.body.appendChild(el);
  const close = () => { el.classList.remove('is-on'); try { sessionStorage.setItem('wrappi-langnote', '1'); } catch (e) {} };
  el.querySelector('button').addEventListener('click', close);
  el.querySelector('a').addEventListener('click', () => { try { localStorage.setItem('wrappi-lang', el.querySelector('a').dataset.setlang); } catch (e) {} });
  setTimeout(() => el.classList.add('is-on'), 2600);
  setTimeout(close, 16000);
})();

/* WhatsApp links carry a ready message */
$$('[data-wa]').forEach(a => a.href = wa(a.dataset.wa));
const hi = tx("Hi Wrappi! I found you on your website and I'd like to ask about my car.", 'Hei Wrappi! Jeg fant dere på nettsiden og vil gjerne spørre om bilen min.');
$$('.js-wa').forEach(a => a.href = wa(hi));
$$('.cnt').forEach(c => c.textContent = nf(+c.dataset.v));
$$('.yr').forEach(y => y.textContent = new Date().getFullYear());

/* toast */
window.wrToast = t => { const el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('is-on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('is-on'), 2600); };

/* ---------- menu + services dropdown ---------- */
const burger = $('.nav__burger'), menu = $('#menu');
function setMenu(open) {
  if (!burger) return;
  burger.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open);
  burger.setAttribute('aria-label', open ? tx('Close menu', 'Lukk meny') : tx('Open menu', 'Åpne meny'));
  if (window.lenis) open ? lenis.stop() : lenis.start();
}
if (burger) {
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
}
$$('.dd').forEach(dd => {
  const b = $('button', dd);
  const set = o => { dd.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o); };
  b.addEventListener('click', e => { e.stopPropagation(); set(!dd.classList.contains('is-open')); });
  dd.addEventListener('mouseenter', () => matchMedia('(hover: hover)').matches && set(true));
  dd.addEventListener('mouseleave', () => matchMedia('(hover: hover)').matches && set(false));
  document.addEventListener('click', e => { if (!dd.contains(e.target)) set(false); });
  dd.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); b.focus(); } });
});
addEventListener('keydown', e => { if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) setMenu(false); });

/* ---------- marquee ---------- */
const mqEl = $('#mq');
if (mqEl) {
  const words = [tx('Paint protection film', 'Lakkbeskyttelse'), tx('Color PPF', 'Farget PPF'), tx('Car wrapping', 'Bilfoliering'), tx('Ceramic coating', 'Keramisk coating'), 'Full Shine', tx('Window tint', 'Vindusfilm'), '3M 2080 · Avery Dennison · Hexis', 'Drive different', 'Strømsveien 324 · Oslo'];
  const one = words.map(w => `<span class="marquee__item">${w}<i></i></span>`).join('');
  mqEl.innerHTML = one + one + one;
}

/* ---------- lightbox (any [data-lb] photo, the gallery and the featured jobs) ---------- */
const lb = $('#lb'); let lbList = [], lbI = 0, lbFrom = null, lbCaps = {};
function lbShow() { const f = lbList[lbI]; $('#lbMedia').innerHTML = `<img src="${f}" alt="${lbCaps[f] || ''}">`; $('#lbCap').textContent = lbCaps[f] || 'Wrappi'; $('#lbNum').textContent = (lbI + 1) + ' / ' + lbList.length; $$('.lb__prev,.lb__next').forEach(b => b.hidden = lbList.length < 2); }
function lbOpen(file, list) { if (!lb) return; lbFrom = document.activeElement; lbList = list || [file]; lbI = Math.max(0, lbList.indexOf(file)); lbShow(); lb.hidden = false; $('.lb__close').focus(); if (window.lenis) lenis.stop(); }
function lbClose() { lb.hidden = true; if (window.lenis) lenis.start(); if (lbFrom) lbFrom.focus(); }
if (lb) {
  $('.lb__close').addEventListener('click', lbClose);
  $('.lb__prev').addEventListener('click', () => { lbI = (lbI - 1 + lbList.length) % lbList.length; lbShow(); });
  $('.lb__next').addEventListener('click', () => { lbI = (lbI + 1) % lbList.length; lbShow(); });
  lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowLeft') $('.lb__prev').click(); else if (e.key === 'ArrowRight') $('.lb__next').click();
    else if (e.key === 'Tab') { const f = $$('.lb__btn').filter(b => !b.hidden), a = f.indexOf(document.activeElement); e.preventDefault(); f[(a + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  $$('[data-lb]').forEach(m => { const img = $('img', m); if (img) lbCaps[m.dataset.lb] = img.alt; m.style.cursor = 'zoom-in'; m.addEventListener('click', () => lbOpen(m.dataset.lb, $$('[data-lb]', m.closest('[data-lb-group]') || m.parentNode).map(x => x.dataset.lb))); });
  const tour = $('#tour');
  if (tour) {
    $$('[data-lbf]', tour).forEach(b => { const img = $('img', b.closest('.card')); if (img) lbCaps[b.dataset.lbf] = img.alt; });
    tour.addEventListener('click', e => { const b = e.target.closest('[data-lbf]'); if (b) lbOpen(b.dataset.lbf, $$('#tour [data-lbf]').map(x => x.dataset.lbf)); });
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { $$('#tour img').forEach(i => i.loading = 'eager'); o.disconnect(); } }), { rootMargin: '600px 0px' }).observe(tour);
    /* arrows step the row one card at a time */
    const tn = $('.tour__nav'), [tp, tx2] = tn ? $$('button', tn) : [];
    const step = d => { const c = $('.card', tour); tour.scrollBy({ left: d * ((c ? c.offsetWidth : 300) + 16), behavior: RM ? 'auto' : 'smooth' }); };
    const ends = () => { if (!tp) return; tp.disabled = tour.scrollLeft < 8; tx2.disabled = tour.scrollLeft > tour.scrollWidth - tour.clientWidth - 8; };
    if (tp) { tp.addEventListener('click', () => step(-1)); tx2.addEventListener('click', () => step(1)); tour.addEventListener('scroll', ends, { passive: true }); ends(); }
  }
}

/* ---------- map: Google Maps loads only when the visitor asks for it ---------- */
$$('[data-map]').forEach(b => b.addEventListener('click', () => {
  const box = b.closest('.map'); const f = document.createElement('iframe');
  f.title = b.dataset.title || 'Map'; f.loading = 'lazy'; f.referrerPolicy = 'strict-origin-when-cross-origin'; f.src = b.dataset.map;
  box.appendChild(f); box.classList.add('is-on'); b.remove();
}));

/* ---------- before / after ---------- */
const baBox = $('#baBox');
if (baBox) {
  const BA = [
    { b: 'ba-chrome-before.webp', a: 'ba-chrome-after.webp', m: 'slide', ar: '1400/545', cap: ['Tesla Model S · chrome delete', 'Tesla Model S · chrome delete'], l: [['Before', 'Før'], ['After', 'Etter']], alt: [['Tesla rear with chrome trim', 'Tesla bakfra med kromlister'], ['The same Tesla with the chrome trim in black', 'Den samme Teslaen med listene i svart']] },
    { b: 'ba-bmw-before.webp', a: 'ba-bmw-after.webp', m: 'slide', ar: '1', cap: ['BMW 3 Series · stripes taped out, then laid', 'BMW 3-serie · striper teipet opp, så lagt'], l: [['Taped', 'Teipet'], ['Striped', 'Ferdig']], alt: [['White BMW with stripe lines taped on the bonnet', 'Hvit BMW med stripene teipet opp på panseret'], ['The same BMW with black twin stripes', 'Den samme BMW-en med doble svarte striper']] },
    { b: 'ba-explorer-before.webp', a: 'ba-explorer-after.webp', m: 'fade', ar: '1', cap: ['Ford Explorer · taped for PPF, then finished', 'Ford Explorer · teipet for PPF, så ferdig'], l: [['Taped', 'Teipet'], ['Finished', 'Ferdig']], alt: [['Black Ford Explorer with green tape around the panels', 'Svart Ford Explorer med grønn teip rundt panelene'], ['The same Ford Explorer after PPF', 'Den samme Ford Exploreren etter PPF']] },
    { b: 'hood-5050.webp', a: 'hood-5050.webp', m: 'still', ar: '1', cap: ['Left half polished · right half as it came in', 'Venstre halvdel polert · høyre som den kom inn'], l: [['Polished', 'Polert'], ['Untouched', 'Urørt']], alt: [['Black bonnet, left half polished and right half untouched', 'Svart panser, venstre halvdel polert og høyre urørt'], ['', '']] }
  ];
  const order = (baBox.dataset.ba || '0,1,2,3').split(',').map(Number);
  let baI = order[0]; const baR = $('#baRange');
  const baSet = i => {
    baI = i; const p = BA[i];
    $$('#baList [data-ba]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.ba === i));
    baBox.dataset.mode = p.m; baBox.style.setProperty('--ar', p.ar); baBox.style.setProperty('--x', '50%'); baBox.style.setProperty('--o', 0); baR.value = 50;
    $('#baB').src = p.b; $('#baB').alt = tx(...p.alt[0]); $('#baA').src = p.a; $('#baA').alt = tx(...p.alt[1]);
    $('#baLl').textContent = tx(...p.l[0]); $('#baLr').textContent = tx(...p.l[1]); $('#baCap').textContent = tx(...p.cap);
    $('#baHint').textContent = p.m === 'slide' ? tx('Drag ↔', 'Dra ↔') : p.m === 'fade' ? tx('Tap flip', 'Trykk bytt') : '';
  };
  const list = $('#baList'); if (list) list.addEventListener('click', e => { const b = e.target.closest('[data-ba]'); if (b) { baBox._touched = true; baSet(+b.dataset.ba); } });
  baR.addEventListener('input', () => { baBox._touched = true; baBox.style.setProperty('--x', baR.value + '%'); });
  $('#baFlip').addEventListener('click', () => { const on = baBox.style.getPropertyValue('--o') === '1'; baBox.style.setProperty('--o', on ? 0 : 1); $('#baLl').style.opacity = on ? 1 : .35; $('#baLr').style.opacity = on ? .35 : 1; });
  baSet(baI);
  if (!RM) new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return; o.disconnect();
    const seq = [50, 18, 82, 50]; let i = 0, from = 50, t0 = 0;
    const go = t => { if (baBox._touched || BA[baI].m !== 'slide') return; if (!t0) t0 = t; const p = Math.min(1, (t - t0) / 950), e2 = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, v = from + (seq[i + 1] - from) * e2; baBox.style.setProperty('--x', v + '%'); baR.value = v; if (p >= 1) { i++; from = seq[i]; t0 = 0; if (i >= seq.length - 1) return; } requestAnimationFrame(go); };
    setTimeout(() => requestAnimationFrame(go), 500);
  }), { threshold: .6 }).observe(baBox);
}

/* ---------- gallery ---------- */
const grid = $('#workGrid');
if (grid) {
  const CAT = { all: ['All', 'Alle'], ppf: ['PPF', 'PPF'], colour: ['Colour & Color PPF', 'Farge og farget PPF'], wrap: ['Wrap & graphics', 'Folie og grafikk'], polish: ['Polish & ceramic', 'Polering og coating'], fleet: ['Fleet', 'Firmabiler'], bay: ['In the bay', 'I verkstedet'] };
  const WORK = [
    ['taycan-teal-top.webp', 'wrap', 'Porsche Taycan · teal chrome', 'Porsche Taycan · turkis krom', 'w2 h2'],
    ['urus-purple.webp', 'colour', 'Lamborghini Urus · Color PPF', 'Lamborghini Urus · farget PPF', 'w2'],
    ['lime-mirror-before.webp', 'colour', 'Halfway: white to lime', 'Halvveis: hvit til lime', ''],
    ['lime-hood.webp', 'colour', 'Model Y · lime', 'Model Y · lime', ''],
    ['ba-explorer-before.webp', 'ppf', 'Ford Explorer · taped for PPF', 'Ford Explorer · teipet for PPF', 'h2'],
    ['red-satin-split.webp', 'colour', 'Gloss and satin, same red', 'Blank og satin, samme rød', ''],
    ['touareg-rear.webp', 'wrap', 'VW Touareg · Martini livery', 'VW Touareg · Martini-design', 'w2'],
    ['installer-front-ppf.webp', 'ppf', 'Front PPF going on', 'Front PPF på plass', 'h2'],
    ['blossom.webp', 'wrap', 'Pink, cherry-blossom art', 'Rosa, kirsebærblomster', ''],
    ['grey-modely-side.webp', 'colour', 'Model Y · satin grey', 'Model Y · satin grå', 'h2'],
    ['hood-5050.webp', 'polish', 'Half polished', 'Halvt polert', ''],
    ['dhl-van-bay.webp', 'fleet', 'DHL service-partner van', 'DHL-varebil', 'w2'],
    ['gladiator-bay.webp', 'wrap', 'Jeep Gladiator', 'Jeep Gladiator', 'h2'],
    ['ba-chrome-after.webp', 'wrap', 'Model S · chrome delete', 'Model S · chrome delete', 'w2'],
    ['installer-polish.webp', 'polish', 'Machine polish', 'Maskinpolering', ''],
    ['leaf-rose-front.webp', 'colour', 'Nissan Leaf · rose gold', 'Nissan Leaf · rosegull', 'h2'],
    ['ceramic-card.webp', 'polish', 'Koch Chemie ceramic certificate', 'Koch Chemie-sertifikat', ''],
    ['akershus-front.webp', 'fleet', 'Akershus Logistikk', 'Akershus Logistikk', ''],
    ['models-white.webp', 'wrap', 'Model S · black wheels & trim', 'Model S · svarte felger og lister', 'w2'],
    ['modely-ppf.webp', 'ppf', 'Model Y in for PPF', 'Model Y inne for PPF', 'h2'],
    ['red-satin-rear.webp', 'colour', 'Tesla · satin red', 'Tesla · satin rød', ''],
    ['akershus-rear.webp', 'fleet', 'Akershus Logistikk · rear', 'Akershus Logistikk · bak', 'h2'],
    ['mercedes-c.webp', 'wrap', 'Mercedes C-Class · black grille', 'Mercedes C-klasse · svart grill', ''],
    ['corvette.webp', 'bay', 'Corvette C7', 'Corvette C7', ''],
    ['porsche-911.webp', 'bay', 'Porsche 911', 'Porsche 911', 'w2'],
    ['solstice-rear.webp', 'bay', 'Pontiac Solstice', 'Pontiac Solstice', ''],
    ['rs5-mirror.webp', 'bay', 'Audi RS5 in the bay', 'Audi RS5 i verkstedet', 'h2'],
    ['ix-34.webp', 'bay', 'BMW iX', 'BMW iX', ''],
    ['bmw-x5.webp', 'bay', 'BMW X5', 'BMW X5', ''],
    ['akershus-side.webp', 'fleet', 'Akershus Logistikk · side', 'Akershus Logistikk · side', ''],
    ['ix-grille.webp', 'bay', 'BMW iX · grille', 'BMW iX · grill', ''],
    ['lime-mirror-close.webp', 'colour', 'Lime, up close', 'Lime, helt nært', '']
  ];
  const W_LIMIT = 8; let wCat = (location.hash.match(/^#(ppf|colour|wrap|polish|fleet|bay)$/) || [])[1] || 'all', wAll = false;
  grid.innerHTML = WORK.map((w, i) => `<figure class="shot ${w[4]}" data-cat="${w[1]}" data-i="${i}" data-cursor="view"><img src="${w[0]}" alt="${tx(w[2], w[3])}" loading="lazy"><figcaption><b>${tx(w[2], w[3])}</b><span>${tx(...CAT[w[1]])}</span></figcaption><button aria-label="${tx('Open photo', 'Åpne bilde')}: ${tx(w[2], w[3])}"></button></figure>`).join('');
  WORK.forEach(w => lbCaps[w[0]] = tx(w[2], w[3]));
  $('#workFilters').innerHTML = Object.entries(CAT).map(([k, v]) => `<button class="pick" data-w="${k}" aria-pressed="${k === wCat}">${tx(...v)}</button>`).join('');
  const filterWork = cat => {
    wCat = cat; $$('[data-w]').forEach(b => b.setAttribute('aria-pressed', b.dataset.w === cat));
    let n = 0, shown = 0, cells = 0, cut = false;
    $$('.shot', grid).forEach(s => { const on = cat === 'all' || s.dataset.cat === cat; s.classList.toggle('is-out', !on); if (on && !cut && !wAll && shown >= W_LIMIT && cells % 2 === 0) cut = true; s.classList.toggle('is-more', on && cut); if (on) { n++; if (!cut) { shown++; cells += s.classList.contains('w2') ? 2 : 1; } } });
    $('#workN').textContent = n; $('#workMore').hidden = wAll || !cut; $('#workMoreN').textContent = '· ' + n;
    if (window.gsap && !RM) gsap.fromTo($$('.shot:not(.is-out)', grid), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .025, ease: 'expo.out' });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };
  $('#workFilters').addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) { wAll = false; filterWork(b.dataset.w); } });
  $('#workMore').addEventListener('click', () => { const first = $('.shot.is-more', grid); wAll = true; filterWork(wCat); if (first) { const btn = $('button', first); if (btn) btn.focus({ preventScroll: true }); } });
  grid.addEventListener('click', e => { const s = e.target.closest('.shot'); if (s) lbOpen(WORK[+s.dataset.i][0], $$('.shot:not(.is-out)', grid).map(x => WORK[+x.dataset.i][0])); });
  filterWork(wCat);
}

/* ---------- film colour strip (service pages): every swatch opens the studio with that film ---------- */
$$('.filmstrip').forEach(el => {
  const F = window.FILMS; if (!F) return;
  const picks = (el.dataset.films || '').split(',').map(s => s.trim()).filter(Boolean);
  const rows = picks.map(id => { const [b, code] = id.split(':'); const br = F.brands.find(x => x.k === b); const r = br && br.list.find(x => x[0] === code); return r ? { id, br, r } : null; }).filter(Boolean);
  el.innerHTML = rows.map(({ id, br, r }) => `<a class="fsw" href="${R('studio')}?film=${encodeURIComponent(id)}" style="--sw:${r[3]}${r[4] ? `;--fl:${r[4]}` : ''}"${r[4] ? ' data-flip' : ''}><i></i><b>${r[1]}</b><small>${br.short} · ${r[0]}</small></a>`).join('');
});
$$('[data-filmcount]').forEach(el => { const F = window.FILMS; if (F) el.textContent = F.brands.reduce((a, b) => a + b.list.length, 0); });

/* ---------- price builder (price-list figures only) ---------- */
const qBox = $('#quote');
if (qBox) {
  const Q = { size: 'mid', svc: new Set(), when: 0 };
  const pre = new URLSearchParams(location.search).get('svc'); if (pre && WRAPPI.services[pre]) Q.svc.add(pre);
  const WHEN = [['As soon as possible', 'Så snart som mulig'], ['November or December', 'November eller desember'], ['Just checking prices', 'Sjekker bare priser']];
  const priceOf = s => s.p === 'size:ppf' ? WRAPPI.sizes[Q.size].ppf : s.p === 'size:color' ? WRAPPI.sizes[Q.size].color : s.p;
  const quoteUI = () => {
    $('#sizePicks').innerHTML = Object.entries(WRAPPI.sizes).map(([k, v]) => `<button class="pick" role="radio" data-sz="${k}" aria-checked="${k === Q.size}">${tx(v.en, v.no)}<small>${v.hint}</small></button>`).join('');
    const grp = (title, keys) => `<small>${title}</small><div class="picks">${keys.map(k => { const s = WRAPPI.services[k]; return `<button class="pick" data-v="${k}" aria-pressed="false">${tx(s.en, s.no)}<small>${s.p === null ? tx('on request', 'på forespørsel') : (s.from || (s.p === 'size:ppf' && Q.size === 'xl') ? tx('from ', 'fra ') : '') + nf(priceOf(s))}</small></button>`; }).join('')}</div>`;
    $('#svcPicks').innerHTML = grp(tx('Protection · pick one', 'Beskyttelse · velg én'), ['ppfFull', 'colorPpf', 'ppfFront']) + grp(tx('Polish · pick one', 'Polering · velg én'), ['shine', 'shineCer', 'polish1', 'polish2']) + grp(tx('Priced after we see the car', 'Prises etter at vi har sett bilen'), ['wrap', 'details', 'fleet', 'tint', 'ceramic']);
    $('#whenPicks').innerHTML = WHEN.map((w, i) => `<button class="pick" role="radio" data-n="${i}" aria-checked="${i === Q.when}">${tx(...w)}</button>`).join('');
    renderQuote();
  };
  const renderQuote = () => {
    $$('[data-sz]').forEach(b => b.setAttribute('aria-checked', b.dataset.sz === Q.size));
    $$('[data-v]').forEach(b => b.setAttribute('aria-pressed', Q.svc.has(b.dataset.v)));
    $$('[data-n]').forEach(b => b.setAttribute('aria-checked', +b.dataset.n === Q.when));
    const list = [...Q.svc].map(k => WRAPPI.services[k]), priced = list.filter(s => s.p !== null), req = list.length - priced.length;
    const from = priced.some(s => s.from || (s.p === 'size:ppf' && Q.size === 'xl')), sum = priced.reduce((a, s) => a + priceOf(s), 0);
    $('#estV').textContent = !list.length ? tx('Pick a service', 'Velg en tjeneste') : priced.length ? `${from ? tx('from ', 'fra ') : ''}${nok(sum)}${req ? ' +' : ''}` : tx('On request', 'På forespørsel');
    $('#estNote').textContent = req ? tx(`Plus ${req} item${req > 1 ? 's' : ''} priced after we've seen the car. Price depends on model and design.`, `Pluss ${req} ting som prises etter at vi har sett bilen. Pris avhenger av bilmodell og utforming.`) : tx('Price depends on the car model and design. We confirm the exact price for your car.', 'Pris avhenger av bilmodell og utforming. Vi bekrefter nøyaktig pris for din bil.');
    const car = $('#qCar').value.trim(), name = $('#qName').value.trim(), sz = WRAPPI.sizes[Q.size];
    const msg = [tx("Hi Wrappi! I'd like a price.", 'Hei Wrappi! Jeg vil gjerne ha en pris.'), `${tx('Car', 'Bil')}: ${car || tx('(make & model)', '(merke og modell)')} · ${tx(sz.en, sz.no)}`, `${tx('Services', 'Tjenester')}: ${list.length ? list.map(s => tx(s.en, s.no)).join(', ') : tx('(not sure yet)', '(usikker ennå)')}`, `${tx('When', 'Når')}: ${tx(...WHEN[Q.when])}`, name ? `— ${name}` : ''].filter(Boolean).join('\n');
    $('#bubble').textContent = msg; $('#qWa').href = $('#qbarWa').href = wa(msg); $('#qbarV').textContent = $('#estV').textContent;
  };
  $('#sizePicks').addEventListener('click', e => { const b = e.target.closest('[data-sz]'); if (b) { Q.size = b.dataset.sz; quoteUI(); } });
  $('#svcPicks').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; const v = b.dataset.v, g = WRAPPI.services[v].g; if (Q.svc.has(v)) Q.svc.delete(v); else { if (g) [...Q.svc].forEach(k => { if (WRAPPI.services[k].g === g) Q.svc.delete(k); }); Q.svc.add(v); } renderQuote(); });
  $('#whenPicks').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b) { Q.when = +b.dataset.n; renderQuote(); } });
  ['#qCar', '#qName'].forEach(s => $(s).addEventListener('input', renderQuote));
  const bar = $('#qbar'), seen = { l: false, r: false };
  const io = new IntersectionObserver(es => { es.forEach(e => seen[e.target.classList.contains('quote__l') ? 'l' : 'r'] = e.isIntersecting); const on = seen.l && !seen.r; bar.classList.toggle('is-on', on); document.body.classList.toggle('qbar-on', on); }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  io.observe($('.quote__l')); io.observe($('.quote__r'));
  quoteUI();
}
const heroCtas = $('.hero__ctas'); if (heroCtas) new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle('hero-cta', e.isIntersecting))).observe(heroCtas);

/* ---------- assistant: rule-based, Wrappi's own facts only ---------- */
(() => {
  const fab = $('#botFab'), box = $('#bot'), log = $('#botLog'); if (!fab) return;
  const A = () => [
    { k: ['price', 'cost', 'how much', 'pris', 'koster', 'kost'], a: tx(`Full-car PPF: ${nok(30000)} (small), ${nok(33000)} (mid-size), ${nok(36000)} (large/SUV), from ${nok(45000)} (XL/van). Front PPF from ${nok(12900)}. Full Shine ${nok(5999)}. See <a href="${R('prices')}">all prices</a>.`, `PPF hel bil: ${nok(30000)} (liten), ${nok(33000)} (mellomstor), ${nok(36000)} (stor/SUV), fra ${nok(45000)} (XL/varebil). Front PPF fra ${nok(12900)}. Full Shine ${nok(5999)}. Se <a href="${R('prices')}">alle priser</a>.`) },
    { k: ['color', 'colour', 'farge', 'farget', 'kampanje', 'campaign'], a: tx(`Color PPF autumn campaign: car from ${nok(33000)}, SUV from ${nok(38000)}, van from ${nok(45000)}, with a 10-year warranty. Booking now for November & December. <a href="${R('ppf')}#color-ppf">Read more</a>.`, `Høstkampanje farget PPF: personbil fra ${nok(33000)}, SUV fra ${nok(38000)}, varebil fra ${nok(45000)}, med 10 års garanti. Vi tar imot booking for november og desember. <a href="${R('ppf')}#color-ppf">Les mer</a>.`) },
    { k: ['3m', 'avery', 'hexis', '2080', 'swf'], a: tx(`We wrap with 3M 2080, Avery Dennison Supreme Wrapping Film and Hexis. <a href="${R('studio')}">Try the colours on a car</a>.`, `Vi folierer med 3M 2080, Avery Dennison Supreme Wrapping Film og Hexis. <a href="${R('studio')}">Prøv fargene på en bil</a>.`) },
    { k: ['front'], a: tx(`Front PPF from ${nok(12900)}: whole bonnet, front bumper, both front wings, both A-pillars, both side mirrors and the headlights.`, `Front PPF fra ${nok(12900)}: hele panseret, frontfanger, begge forskjermene, begge A-stolpene, begge sidespeilene og frontlyktene.`) },
    { k: ['film', 'brand', 'titanium', 'folie', 'merke', 'which'], a: tx(`Our PPF is PPF Art Design Titanium: 216 µm total, 165 µm TPU, self-healing top coat, −45 to +115 °C. <a href="${R('ppf')}#film">See the specs</a>.`, `PPF-en vår er PPF Art Design Titanium: 216 µm totalt, 165 µm TPU, selvhelende toppcoat, −45 til +115 °C. <a href="${R('ppf')}#film">Se tallene</a>.`) },
    { k: ['day', 'long', 'time', 'dager', 'lenge', 'tid'], a: tx('PPF takes 3–4 days: 20–24 working hours of fitting, then about 24 hours for the film to settle before we check every edge.', 'PPF tar 3–4 dager: 20–24 arbeidstimer montering, så ca. 24 timer for at filmen skal stabilisere seg før vi sjekker alle kanter.') },
    { k: ['wash', 'vask'], a: tx("Don't wash it for the first 48–72 hours after pick-up.", 'Ikke vask bilen de første 48–72 timene etter henting.') },
    { k: ['warranty', 'garanti', 'guarantee'], a: tx("Up to 10 years' manufacturer warranty on film and fitting.", 'Opptil 10 års produsentgaranti på film og montering.') },
    { k: ['polish', 'shine', 'swirl', 'polering', 'riper'], a: tx(`1-step polish from ${nok(2990)}, 2-step from ${nok(4990)}, Full Shine ${nok(5999)}, Full Shine + ceramic ${nok(6999)}. <a href="${R('polish')}">More</a>.`, `Polering 1-trinn fra ${nok(2990)}, 2-trinn fra ${nok(4990)}, Full Shine ${nok(5999)}, Full Shine + keramisk ${nok(6999)}. <a href="${R('polish')}">Mer</a>.`) },
    { k: ['ceramic', 'coating', 'keramisk', 'koch'], a: tx(`Koch Chemie ceramic, with checks at 12, 24 and 36 months. ${nok(6999)} together with Full Shine.`, `Koch Chemie keramisk coating, med kontroll etter 12, 24 og 36 måneder. ${nok(6999)} sammen med Full Shine.`) },
    { k: ['wrap', 'chrome', 'stripe', 'logo', 'fleet', 'striper', 'firmabil', 'foliering'], a: tx(`Full colour changes, chrome delete, stripes and fleet graphics are priced after we see the car. <a href="${R('studio')}">Build it in the studio</a> and send it to us.`, `Fargebytte, chrome delete, striper og firmabiler prises etter at vi har sett bilen. <a href="${R('studio')}">Lag det i studioet</a> og send det til oss.`) },
    { k: ['where', 'address', 'location', 'map', 'hvor', 'adresse'], a: tx(`We're at ${WRAPPI.address}, at Furuset by IKEA Furuset. <a href="${R('contact')}">Directions</a>.`, `Vi holder til i ${WRAPPI.address}, på Furuset ved IKEA Furuset. <a href="${R('contact')}">Veibeskrivelse</a>.`) },
    { k: ['open', 'hour', 'åpent', 'åpningstid'], a: tx(`Message us on <a href="${wa('Hi Wrappi! When can I come by?')}" target="_blank" rel="noopener">WhatsApp</a> and we'll find a time.`, `Send en melding på <a href="${wa('Hei Wrappi! Når kan jeg komme innom?')}" target="_blank" rel="noopener">WhatsApp</a>, så finner vi en tid.`) },
    { k: ['phone', 'call', 'number', 'ring', 'telefon'], a: tx(`Call ${WRAPPI.phones[0]} or ${WRAPPI.phones[1]}.`, `Ring ${WRAPPI.phones[0]} eller ${WRAPPI.phones[1]}.`) },
    { k: ['who', 'owner', 'team', 'hvem', 'eier', 'anestis', 'joanna'], a: tx(`Wrappi is Joanna Gonkiewicz and Anestis Lekas. <a href="${R('about')}">Meet them</a>.`, `Wrappi er Joanna Gonkiewicz og Anestis Lekas. <a href="${R('about')}">Møt dem</a>.`) },
    { k: ['book', 'booking', 'bestill'], a: tx(`Easiest is <a href="${wa("Hi Wrappi! I'd like to book.")}" target="_blank" rel="noopener">WhatsApp</a>.`, `Enklest er <a href="${wa('Hei Wrappi! Jeg vil gjerne booke.')}" target="_blank" rel="noopener">WhatsApp</a>.`) },
    { k: ['tesla', 'electric', 'ev', 'elbil'], a: tx('Yes — most cars on our price list are electric, Teslas included.', 'Ja — de fleste bilene på prislisten vår er elbiler, Tesla også.') }
  ];
  const say = (h, me) => { const d = document.createElement('div'); d.className = 'msg ' + (me ? 'msg--me' : 'msg--bot'); d[me ? 'textContent' : 'innerHTML'] = h; log.appendChild(d); log.scrollTop = log.scrollHeight; };
  const answer = q => { const s = q.toLowerCase(), hit = A().find(r => r.k.some(k => s.includes(k))); setTimeout(() => say(hit ? hit.a : tx(`Good one for the team. <a href="${wa('Hi Wrappi! ' + q)}" target="_blank" rel="noopener">Send it on WhatsApp</a>.`, `Den tar teamet. <a href="${wa('Hei Wrappi! ' + q)}" target="_blank" rel="noopener">Send den på WhatsApp</a>.`)), 350); };
  $('#botChips').innerHTML = (LANG === 'no' ? ['Priser', 'Farget PPF', 'Front PPF', 'Filmene', 'Garanti', 'Hvor er dere?'] : ['Prices', 'Color PPF', 'Front PPF', 'The films', 'Warranty', 'Where are you?']).map(c => `<button type="button">${c}</button>`).join('');
  $('#botChips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; say(b.textContent, true); answer(b.textContent); });
  $('#botForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#botIn').value.trim(); if (!v) return; say(v, true); $('#botIn').value = ''; answer(v); });
  let started = false;
  const toggle = open => { box.classList.toggle('is-open', open); fab.setAttribute('aria-expanded', open); if (open) { if (!started) { started = true; say(tx('Hi! Ask me about PPF, Color PPF, film colours, prices or where we are.', 'Hei! Spør meg om PPF, farget PPF, foliefarger, priser eller hvor vi er.')); } setTimeout(() => $('#botIn').focus(), 200); } else fab.focus(); };
  fab.addEventListener('click', () => toggle(true));
  $('#botClose').addEventListener('click', () => toggle(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('is-open')) toggle(false); });
})();

/* ---------- headings: split into lines for the reveal; scale a heading down if its longest word can't fit ---------- */
$$('.split-lines').forEach(h => { h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="h-line"><span>${l}</span></span>`).join(''); });
$$('.hero__title .split').forEach(s => { s.innerHTML = [...s.textContent].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join(''); });
const FIT_SEL = '.hero__title .line,.mosaic__title h2,.sec-head h2,.ba__copy h2,.panel h2,.film__grid h2,.faq h2,.quote__l h3,.loc h3,.step h3,.card__cap h3,.board-head h3,.tier h3,.pkg h4,.phead h1,.svc h3,.duo h2,.founder h3,.cta-band h2,.flow h2,.manifest p,.links4 b,.svc h3,.way b,.fbrand__head b,.covx__head h3,.vs__col h3,.journey h3,.how h3';
const fitM = document.createElement('span'); fitM.setAttribute('aria-hidden', 'true');
fitM.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:nowrap;visibility:hidden;pointer-events:none';
document.body.appendChild(fitM);
function fitHeads() {
  const root = document.documentElement; root.classList.add('is-fitting');
  $$(FIT_SEL).forEach(h => {
    if (h.dataset.fs === undefined) h.dataset.fs = h.style.fontSize;
    h.style.fontSize = h.dataset.fs;
    const cs = getComputedStyle(h), room = h.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (room <= 0) return;
    ['fontFamily', 'fontWeight', 'fontSize', 'fontStretch', 'fontStyle', 'letterSpacing', 'textTransform', 'fontVariationSettings'].forEach(k => fitM.style[k] = cs[k]);
    const c = h.cloneNode(true); $$('small,.kicker', c).forEach(x => x.remove());
    let widest = 0;
    c.textContent.split(/[\s ]+/).flatMap(w => w.replace(/([-–])/g, '$1\n').split('\n')).forEach(w => { if (!w) return; fitM.textContent = w; widest = Math.max(widest, fitM.getBoundingClientRect().width); });
    if (widest > room) h.style.fontSize = (parseFloat(cs.fontSize) * room / widest * .97).toFixed(2) + 'px';
  });
  void root.offsetWidth; root.classList.remove('is-fitting');
}
fitHeads();
const refit = () => { fitHeads(); if (window.ScrollTrigger) ScrollTrigger.refresh(); };
if (document.fonts) { document.fonts.ready.then(refit); document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', refit); }
addEventListener('load', refit);
{ let fT, fW = innerWidth; addEventListener('resize', () => { if (innerWidth === fW) return; fW = innerWidth; clearTimeout(fT); fT = setTimeout(fitHeads, 150); }); }

/* ════════ motion (GSAP + Lenis). Without them the page still works, just still. ════════ */
const pre = () => document.documentElement.classList.remove('wr-pre');
(() => {
  const isHome = !!$('.hero');
  const heroGo = () => { window.wrHeroReady = true; if (window.wrHeroStart) window.wrHeroStart(); };
  if (!window.gsap || !window.ScrollTrigger || RM) { heroGo(); pre(); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    window.lenis = new Lenis({ lerp: .12, wheelMultiplier: 1, touchMultiplier: 1.2 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t || !window.lenis) return; e.preventDefault(); lenis.scrollTo(t, { offset: id === '#top' ? 0 : -84, duration: 1.2 }); }));
  if (location.hash && location.hash.length > 1 && !location.hash.startsWith('#build=')) { const t = $(location.hash); if (t && window.lenis) setTimeout(() => lenis.scrollTo(t, { offset: -84, immediate: true }), 60); }

  /* arrival: the headline rises line by line, the rest follows */
  if (isHome) {
    heroGo();
    gsap.fromTo('.hero__title .ch', { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: .02, ease: 'expo.out', delay: .1 });
    gsap.fromTo(['.hero__eyebrow', '.hero__kicker', '.hero__motto', '.hero__sub', '.hero__ctas', '.hero__now'], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .9, stagger: .06, ease: 'expo.out', delay: .2 });
    gsap.fromTo('.hero__stage', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: 'expo.out', delay: .15 });
  }
  const ph = $('.phead'); if (ph) gsap.fromTo($$('.phead__crumbs,.phead .tag,.phead h1 .h-line > span,.phead__lead,.phead .acts,.phead__media figure', ph), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .05, ease: 'expo.out', delay: .1 });

  /* nav hide/show + reading progress */
  const nav = $('#nav'); let lastY = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { const y = s.scroll(); nav.classList.toggle('is-hidden', y > 300 && y > lastY + 2 && !(menu && menu.classList.contains('is-open'))); if (Math.abs(y - lastY) > 2) lastY = y; nav.style.setProperty('--np', s.progress.toFixed(3)); } });

  if (isHome) {
    gsap.fromTo('.hero__inner', { yPercent: 0, autoAlpha: 1 }, { yPercent: -16, autoAlpha: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__car', { xPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { $$('#car-h .rimrot').forEach(r => r.setAttribute('transform', `rotate(${s.progress * 540})`)); if (window.CAR3D) CAR3D.heroScroll(s.progress); } } });
  }

  $$('.split-lines').forEach(h => { if (h.closest('.phead')) return; gsap.from($$('.h-line > span', h), { yPercent: 110, duration: 1.1, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } }); });
  $$('.rv').forEach(el => gsap.fromTo(el, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  $$('.rule').forEach(el => gsap.from(el, { scaleX: 0, duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  $$('.wipe').forEach(el => {
    if (el.closest('[hidden]') || el.closest('.phead')) return;
    el.classList.add('is-pending'); const p = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(p, { v: 1, duration: 1.15, ease: 'power3.inOut', onUpdate: () => { el.style.clipPath = `inset(0 ${(100 - p.v * 100).toFixed(2)}% 0 0)`; el.style.setProperty('--bx', `calc(${(p.v * 100).toFixed(2)}% - 2px)`); el.style.setProperty('--bo', p.v < .99 ? 1 : 0); }, onComplete: () => { el.classList.remove('is-pending'); el.style.clipPath = ''; } }) });
  });
  const mm = gsap.matchMedia();
  $$('.tier').forEach(t => ScrollTrigger.create({ trigger: t, start: 'top 85%', once: true, onEnter: () => t.classList.add('is-in') }));
  if ($('.xsec')) gsap.from('.xsec .layer', { xPercent: i => (i % 2 ? 1 : -1) * 40, autoAlpha: 0, duration: 1, stagger: { each: .12, from: 'end' }, ease: 'expo.out', scrollTrigger: { trigger: '.xsec', start: 'top 80%', once: true } });
  const pics = $$('.proc__pic img'), steps = $$('.step');
  steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: st => { if (!st.isActive) return; steps.forEach((x, j) => x.classList.toggle('is-on', j === i)); pics.forEach((p, j) => p.classList.toggle('is-on', j === i)); const ch = $('#procChip'); if (ch) ch.textContent = `0${i + 1} / 0${steps.length}`; } }));
  /* the PPF → Color PPF hand-off: the clear film gets its colour as you scroll past */
  const flow = $('.flow'); if (flow) ScrollTrigger.create({ trigger: flow, start: 'top 75%', end: 'bottom 40%', scrub: true, onUpdate: s => flow.style.setProperty('--fp', s.progress.toFixed(3)) });
  /* founders: the two rules draw towards each other */
  $$('.duo__rule i').forEach((r, i) => gsap.from(r, { scaleX: 0, transformOrigin: i ? 'right' : 'left', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 85%', once: true } }));
  const fb = $('.foot__big'); if (fb) { fb.innerHTML = [...fb.textContent].map(c => `<span>${c}</span>`).join(''); gsap.from($$('span', fb), { yPercent: 100, autoAlpha: 0, duration: 1.1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: fb, start: 'top 95%', once: true } }); }
  pre();
  ScrollTrigger.refresh();
  addEventListener('load', () => ScrollTrigger.refresh());
})();
})();
