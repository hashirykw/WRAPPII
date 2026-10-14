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
const NF = new Intl.NumberFormat(LANG === 'no' ? 'nb-NO' : 'en-GB', { maximumFractionDigits: 0 });
const nf = n => NF.format(Math.round(n));
const nok = n => 'NOK ' + nf(n);
const wa = t => `https://wa.me/${WRAPPI.wa}?text=${encodeURIComponent(t)}`;
const R = k => WR.routes[k] || './';
const own = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);

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
  const close = () => { el.classList.remove('is-on'); document.body.classList.remove('note-on'); try { sessionStorage.setItem('wrappi-langnote', '1'); } catch (e) {} };
  el.querySelector('button').addEventListener('click', close);
  el.querySelector('a').addEventListener('click', () => { try { localStorage.setItem('wrappi-lang', el.querySelector('a').dataset.setlang); } catch (e) {} });
  setTimeout(() => { el.classList.add('is-on'); document.body.classList.add('note-on'); }, 2600);
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

/* ---------- cookie bar + what we remember (only with a yes) ---------- */
const STORE = (() => {
  const K = { consent: 'wrappi-consent', build: 'wrappi-build', quote: 'wrappi-quote' };
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const del = k => { try { localStorage.removeItem(k); } catch (e) {} };
  const ok = () => get(K.consent) === 'yes';
  return {
    ok, answered: () => !!get(K.consent),
    setConsent(v) { set(K.consent, v ? 'yes' : 'no'); if (!v) { del(K.build); del(K.quote); } dispatchEvent(new CustomEvent('wr-consent', { detail: v })); },
    save(name, obj) { if (!ok() || !K[name]) return; try { set(K[name], JSON.stringify({ v: 1, t: Date.now(), d: obj })); } catch (e) {} },
    load(name) { if (!ok() || !K[name]) return null; try { const o = JSON.parse(get(K[name]) || 'null'); return o && o.v === 1 && o.d && typeof o.d === 'object' ? o.d : null; } catch (e) { return null; } }
  };
})();
window.wrStore = STORE;

/* ---------- menu + services dropdown ---------- */
const burger = $('.nav__burger'), menu = $('#menu'), scrim = $('#menuScrim');
function setMenu(open) {
  if (!burger) return;
  burger.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open);
  burger.setAttribute('aria-label', open ? tx('Close menu', 'Lukk meny') : tx('Open menu', 'Åpne meny'));
  if (scrim) { if (open) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('is-on')); } else { scrim.classList.remove('is-on'); setTimeout(() => { if (!menu.classList.contains('is-open')) scrim.hidden = true; }, 300); } }
  const nav = $('#nav'); if (nav && open) nav.classList.remove('is-hidden');
  if (window.lenis) open ? lenis.stop() : lenis.start();
}
if (burger) {
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  if (scrim) scrim.addEventListener('click', () => setMenu(false));
  addEventListener('resize', () => { if (innerWidth > 1180 && menu.classList.contains('is-open')) setMenu(false); });
}

/* ---------- light / dark theme: the visitor's own choice, remembered on this device ---------- */
const themeBtns = $$('[data-theme-toggle]');
const themeLabel = () => { const light = document.documentElement.dataset.theme === 'light'; $$('[data-theme-toggle][data-l]').forEach(b => b.setAttribute('aria-label', light ? b.dataset.d : b.dataset.l)); };
themeLabel();
themeBtns.forEach(b => b.addEventListener('click', () => {
  const html = document.documentElement, next = html.dataset.theme === 'light' ? 'dark' : 'light';
  html.classList.add('theme-anim'); html.dataset.theme = next;
  const mc = $('#themeColor'); if (mc) mc.setAttribute('content', next === 'light' ? '#f3f2ee' : '#0b0c0e');
  try { localStorage.setItem('wrappi-theme', next); } catch (e) {}
  themeLabel(); setTimeout(() => html.classList.remove('theme-anim'), 520);
  dispatchEvent(new CustomEvent('wr-theme', { detail: next }));
}));
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
  const pre = new URLSearchParams(location.search).get('svc'); if (own(WRAPPI.services, pre)) Q.svc.add(pre);
  /* with a yes in the cookie bar, the builder opens the way the visitor left it (each field checked before use) */
  const saved = STORE.load('quote');
  if (saved) {
    if (own(WRAPPI.sizes, saved.size)) Q.size = saved.size;
    if (!pre && Array.isArray(saved.svc)) saved.svc.filter(k => own(WRAPPI.services, k)).slice(0, 6).forEach(k => Q.svc.add(k));
    if (Number.isInteger(saved.when) && saved.when >= 0 && saved.when < 3) Q.when = saved.when;
    if (typeof saved.car === 'string') $('#qCar').value = saved.car.slice(0, 50);
    if (typeof saved.name === 'string') $('#qName').value = saved.name.slice(0, 40);
  }
  let saveT; const saveQuote = () => { clearTimeout(saveT); saveT = setTimeout(() => STORE.save('quote', { size: Q.size, svc: [...Q.svc], when: Q.when, car: $('#qCar').value.trim().slice(0, 50), name: $('#qName').value.trim().slice(0, 40) }), 400); };
  addEventListener('wr-consent', e => { if (e.detail) saveQuote(); });
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
    saveQuote();
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
/* the floating assistant steps aside at the very bottom so it never covers the footer's last line */
const footLegal = $('.foot__legal'); if (footLegal) new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle('foot-on', e.isIntersecting))).observe(footLegal);

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
  const toggle = open => { box.classList.toggle('is-open', open); document.body.classList.toggle('bot-on', open); fab.setAttribute('aria-expanded', open); if (open) { if (!started) { started = true; say(tx('Hi! Ask me about PPF, Color PPF, film colours, prices or where we are.', 'Hei! Spør meg om PPF, farget PPF, foliefarger, priser eller hvor vi er.')); } setTimeout(() => $('#botIn').focus(), 200); } else fab.focus(); };
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
  /* batched: reset every heading, read them all in one go, measure the words off-screen, then write the new sizes */
  const root = document.documentElement, hs = $$(FIT_SEL); if (!hs.length) return;
  root.classList.add('is-fitting');
  hs.forEach(h => { if (h.dataset.fs === undefined) h.dataset.fs = h.style.fontSize; h.style.fontSize = h.dataset.fs; });
  const K = ['fontFamily', 'fontWeight', 'fontSize', 'fontStretch', 'fontStyle', 'letterSpacing', 'textTransform', 'fontVariationSettings'];
  const info = hs.map(h => { const cs = getComputedStyle(h), room = h.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); if (room <= 0) return null;
    const c = h.cloneNode(true); $$('small,.kicker', c).forEach(x => x.remove());
    return { room, fs: parseFloat(cs.fontSize), st: K.map(k => cs[k]), words: c.textContent.split(/[\s ]+/).flatMap(w => w.replace(/([-–])/g, '$1\n').split('\n')).filter(Boolean) }; });
  const out = info.map(o => { if (!o) return null; K.forEach((k, i) => fitM.style[k] = o.st[i]); let widest = 0; o.words.forEach(w => { fitM.textContent = w; widest = Math.max(widest, fitM.getBoundingClientRect().width); }); return widest > o.room ? (o.fs * o.room / widest * .97).toFixed(2) + 'px' : null; });
  hs.forEach((h, i) => { if (out[i]) h.style.fontSize = out[i]; });
  void root.offsetWidth; root.classList.remove('is-fitting');
}
/* headings are sized once the fonts are in (see the motion start below); later font loads (rare) size them again */
let refitT = 0; const refit = () => { clearTimeout(refitT); refitT = setTimeout(() => { fitHeads(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 80); };
{ let fT, fW = innerWidth; addEventListener('resize', () => { if (innerWidth === fW) return; fW = innerWidth; clearTimeout(fT); fT = setTimeout(fitHeads, 150); }); }

/* ---------- detail pop-ups: long card content opens in a sheet (phones) instead of stretching the page ---------- */
(() => {
  const pop = $('#pop'); if (!pop) return;
  const body = $('#popB'), head = $('#popH'), kick = $('#popK'), box = $('.pop__box', pop);
  let from = null, src = null, anim = null, closing = false;
  const phone = () => matchMedia('(max-width: 760px)').matches;
  const SHEET = 'cubic-bezier(.32,.72,0,1)';   /* the curve phones use for sheets: quick off the mark, long soft landing */
  const stop = () => { if (anim) { anim.forEach(a => a.cancel()); anim = null; } };
  const open = (card, trigger) => {
    from = document.activeElement; src = trigger || card; stop(); closing = false;
    const h = card.querySelector('h1,h2,h3,h4');
    const hc = h ? h.cloneNode(true) : null; if (hc) $$('small,.sr-only', hc).forEach(x => x.remove());
    head.textContent = card.dataset.popTitle || (hc ? hc.textContent.replace(/\s+/g, ' ').trim() : '');
    const k = card.querySelector('.step__n,.founder__role,.covx__head .mono,.tag');
    kick.textContent = card.dataset.popKicker || (k ? k.textContent.trim() : '');
    body.textContent = '';
    $$('[data-more]', card).forEach(n => { const c = n.cloneNode(true); c.removeAttribute('data-more'); c.removeAttribute('id'); $$('[id]', c).forEach(x => x.removeAttribute('id')); c.classList.remove('rv'); c.style.removeProperty('opacity'); c.style.removeProperty('transform'); body.appendChild(c); });
    if (card.classList.contains('tier')) { const pr = card.querySelector('.tier__p'); if (pr) { const d = document.createElement('p'); d.className = 'pop__price'; d.textContent = [...pr.childNodes].map(n => n.textContent.trim()).filter(Boolean).join(' '); body.prepend(d); } }
    /* the next step, right in the sheet: ask about it on WhatsApp, or try it on a car in 3D */
    const foot = $('#popF');
    if (foot) {
      foot.textContent = '';
      const t = head.textContent.trim(), founder = !!card.closest('.founder');
      const mk = (cls, href, label, icon, ext) => { const a = document.createElement('a'); a.className = 'btn btn--sm ' + cls; a.href = href; if (ext) { a.target = '_blank'; a.rel = 'noopener'; } a.innerHTML = (icon === 'wa' ? '<svg><use href="#i-wa"/></svg>' : '') + '<span></span>' + (icon === 'arrow' ? '<svg><use href="#i-arrow"/></svg>' : ''); a.querySelector('span').textContent = label; foot.appendChild(a); return a; };
      mk('btn--wa', wa(founder ? hi : tx(`Hi Wrappi! I have a question about: ${t}`, `Hei Wrappi! Jeg har et spørsmål om: ${t}`)), founder ? tx('Say hello', 'Si hei') : tx('WhatsApp us', 'Send melding'), 'wa', true);
      if (!founder) mk('btn--solid', R('studio') + (card.closest('#color-ppf,.covx,.board') || /ppf/i.test(t) ? '?mode=ppf' : ''), tx('Try it in 3D', 'Prøv i 3D'), 'arrow');
    }
    [...head.parentNode.parentNode.children, ...body.children].forEach((n, i) => n.style.setProperty('--i', i));
    if (foot) foot.style.setProperty('--i', body.children.length + 2);
    pop.hidden = false; pop.classList.add('is-on'); box.style.transform = '';
    document.documentElement.classList.add('pop-open'); if (window.lenis) lenis.stop();
    if (!RM && box.animate) {
      const scrim = $('.pop__scrim', pop);
      let k;
      if (phone()) k = [{ transform: 'translateY(105%)' }, { transform: 'none' }];
      else {   /* larger screens: the sheet grows out of the button that opened it */
        const r = src.getBoundingClientRect(), b = box.getBoundingClientRect();
        const dx = (r.left + r.width / 2) - (b.left + b.width / 2), dy = (r.top + r.height / 2) - (b.top + b.height / 2);
        k = [{ transform: `translate(${dx}px,${dy}px) scale(.35)`, opacity: 0 }, { opacity: 1, offset: .35 }, { transform: 'none', opacity: 1 }];
      }
      anim = [box.animate(k, { duration: phone() ? 560 : 620, easing: phone() ? SHEET : 'cubic-bezier(.2,.95,.25,1)' }), scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' })];
      anim[0].onfinish = () => { anim = null; };
    }
    setTimeout(() => $('.pop__x', pop).focus({ preventScroll: true }), 30);
  };
  const close = (fromY = 0) => {
    if (pop.hidden || closing) return; closing = true; stop();
    document.documentElement.classList.remove('pop-open'); if (window.lenis) lenis.start();
    const end = () => { pop.hidden = true; pop.classList.remove('is-on'); body.textContent = ''; box.style.transform = ''; anim = null; closing = false; };
    if (RM || !box.animate) end();
    else {
      const scrim = $('.pop__scrim', pop);
      const k = phone() ? [{ transform: `translateY(${fromY}px)` }, { transform: 'translateY(105%)' }] : [{ transform: 'none', opacity: 1 }, { transform: 'translateY(14px) scale(.96)', opacity: 0 }];
      anim = [box.animate(k, { duration: phone() ? 340 : 240, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }), scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-in', fill: 'forwards' })];
      anim[0].onfinish = end;
    }
    if (from && from.focus) from.focus({ preventScroll: true });
  };
  window.wrPop = { open, close };
  $$('[data-pop-close]', pop).forEach(b => b.addEventListener('click', () => close()));
  pop.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') { const f = $$('button,a[href],input,summary,[tabindex]:not([tabindex="-1"])', box).filter(x => x.offsetParent); if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  /* drag the sheet down to close it: it follows the finger (with a little resistance upwards), a quick flick is enough */
  let dg = null;
  $$('.pop__grab,.pop__head', pop).forEach(h => {
    h.addEventListener('pointerdown', e => { if (e.target.closest('button') || !phone()) return; stop(); dg = { y: e.clientY, t: performance.now(), v: 0, d: 0 }; h.setPointerCapture(e.pointerId); });
    h.addEventListener('pointermove', e => { if (!dg) return; const d = e.clientY - dg.y, t = performance.now(); dg.v = (d - dg.d) / Math.max(1, t - dg.t); dg.d = d; dg.t = t; box.style.transform = `translateY(${d > 0 ? d : d / 4}px)`; });
    const end = () => { if (!dg) return; const { d, v } = dg; dg = null;
      if (d > 110 || v > .55) close(Math.max(0, d));
      else if (!RM && box.animate) { box.style.transform = ''; anim = [box.animate([{ transform: `translateY(${d > 0 ? d : d / 4}px)` }, { transform: 'none' }], { duration: 420, easing: SHEET })]; }
      else box.style.transform = ''; };
    h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
  });
  $$('[data-pop]').forEach(card => {
    const more = $('[data-more]', card); if (!more) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pop-btn'; b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-controls', 'pop');
    const sp = document.createElement('span'); sp.textContent = card.dataset.popLabel || tx('Details', 'Detaljer'); b.appendChild(sp);
    b.insertAdjacentHTML('beforeend', '<svg aria-hidden="true"><use href="#i-plus"/></svg>');
    more.before(b);
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); open(card, b); });
    if (card.hasAttribute('data-pop-tap')) card.addEventListener('click', e => { if (e.target.closest('a,button,input,summary')) return; if (getComputedStyle(b).display === 'none') return; open(card, b); });
  });
})();


(() => {
  const bar = $('#consent'); if (!bar) return;
  const show = () => { bar.hidden = false; document.body.classList.add('consent-on'); requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('is-on'))); };
  const hide = () => { bar.classList.remove('is-on'); document.body.classList.remove('consent-on'); setTimeout(() => { bar.hidden = true; }, 500); };
  $$('[data-consent]', bar).forEach(b => b.addEventListener('click', () => { STORE.setConsent(b.dataset.consent === 'yes'); hide(); if (window.wrToast) wrToast(b.dataset.consent === 'yes' ? tx('Done — your next build will be waiting for you.', 'Greit — neste bygg venter på deg.') : tx('Okay — nothing is saved.', 'Greit — ingenting lagres.')); }));
  $$('[data-consent-open]').forEach(b => b.addEventListener('click', show));
  if (!STORE.answered()) setTimeout(show, 1800);
})();

/* ---------- home: the 3D engine loads once the page is up, so the first view is instant ---------- */
(() => {
  const src = document.body.dataset.lazy3d; if (!src) return;
  const go = () => { if (go.done) return; go.done = true; const s = document.createElement('script'); s.src = src; s.async = true; document.body.appendChild(s); };
  const idle = window.requestIdleCallback || (f => setTimeout(f, 300));
  const start = () => idle(go, { timeout: 1500 });
  document.readyState === 'complete' ? start() : addEventListener('load', start, { once: true });
  ['pointerdown', 'keydown', 'scroll'].forEach(t => addEventListener(t, () => setTimeout(go, 200), { once: true, passive: true }));
})();

/* ---------- labels always fit their buttons: if the words are longer than the button, the type steps down a little,
   then (only if it must) wraps to two lines. Re-checked whenever a button changes size or its words change. ---------- */
(() => {
  const SEL = '.btn,.pop-btn,.resume,.chip,.carpick,.fb,.tool,.spin360,.pick,.deck__btn,.menu__grid > a,.bay__views .chip,[data-v3],.seg button,.nav__cta';
  const texts = b => { const out = [], tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); while (tw.nextNode()) if (tw.currentNode.textContent.trim()) out.push(tw.currentNode); return out; };
  const holders = b => [...new Set(texts(b).map(n => n.parentElement))].filter(e => !e.closest('svg'));
  const rg = document.createRange();
  function over(b) {
    const r = b.getBoundingClientRect(); if (r.width < 4) return false;
    const sl = parseFloat(getComputedStyle(b).getPropertyValue("--sl")) || 0, pad = Math.min(sl * .5, 6) + 4;
    for (const n of texts(b)) {
      const e = n.parentElement;
      if (e !== b && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible') return true;   // cut off with "…"
      rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) if (q.width && (q.left < r.left + pad - .5 || q.right > r.right - pad + .5)) return true;
    }
    return false;
  }
  const last = new WeakMap();
  function fit(b) {
    if (!b.isConnected || !b.offsetWidth) return;
    const key = b.offsetWidth + '|' + b.textContent; if (last.get(b) === key) return;
    const hs = holders(b);
    b.classList.add('fit-now');   /* no transitions while measuring, or a size change would still be "on its way" when read */
    hs.forEach(e => e.style.removeProperty('font-size')); b.classList.remove('fit-wrap'); b.style.removeProperty('--fit-h');
    if (over(b)) {
      /* never below ~9.5px: small type stays readable, and the label wraps instead */
      const h = b.offsetHeight, base = hs.map(e => parseFloat(getComputedStyle(e).fontSize));
      const size = k => hs.forEach((e, i) => e.style.fontSize = Math.max(Math.min(base[i], 9.5), base[i] * k).toFixed(2) + 'px');
      let ok = false;
      for (const k of [.94, .88]) { size(k); if (!over(b)) { ok = true; break; } }
      if (!ok) { b.style.setProperty('--fit-h', h + 'px'); b.classList.add('fit-wrap'); if (over(b)) size(.8); }
    }
    void b.offsetWidth; b.classList.remove('fit-now');
    last.set(b, b.offsetWidth + '|' + b.textContent);
  }
  const queue = new Set(); let raf = 0;
  const flush = () => { raf = 0; const list = [...queue]; queue.clear(); list.forEach(fit); };
  const want = b => { queue.add(b); if (!raf) raf = requestAnimationFrame(flush); };
  const ro = window.ResizeObserver ? new ResizeObserver(es => es.forEach(e => want(e.target))) : null;
  const seen = new WeakSet();
  const watch = (root, now) => { const list = (root.matches && root.matches(SEL) ? [root] : []).concat($$(SEL, root)).filter(b => !seen.has(b)); list.forEach(b => { seen.add(b); if (ro) ro.observe(b); });
    if (now) { const bad = list.filter(b => b.offsetWidth && over(b)); bad.forEach(fit); list.forEach(b => { if (!bad.includes(b) && b.offsetWidth) last.set(b, b.offsetWidth + '|' + b.textContent); }); } else list.forEach(want); };
  watch(document, true);
  new MutationObserver(ms => ms.forEach(m => {
    const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (!t) return;
    const b = t.closest(SEL); if (b) { last.delete(b); want(b); }
    m.addedNodes.forEach(n => { if (n.nodeType === 1) watch(n); });
  })).observe(document.body, { childList: true, subtree: true, characterData: true });
  const all = () => $$(SEL).forEach(b => { last.delete(b); want(b); });
  if (document.fonts) document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', () => setTimeout(all, 30));
  addEventListener('load', () => { setTimeout(all, 60); setTimeout(all, 900); setTimeout(all, 2600); });
  window.wrFit = all;
})();

/* ---------- wrap wipe: a studio car (a real render) re-wrapped in one real film after another — 3D band, last job card, nudge.
   The next film is laid over the current one behind a squeegee line, left to right, like it's done in the bay. ---------- */
function wipeCar(root, every = 3800) {
  if (!root || root._wipe) return; root._wipe = true;
  const box = root.classList.contains('wcar') ? root : $('.wcar', root); if (!box) return;
  const imgs = $$('img', box), n = imgs.length; if (n < 2) return;
  const sq = $('.wcar__sq', box), sws = $$('.sband__sw button', root), film = $('.sband__film', root);
  const code = $('[data-wipe-code]', root), name = $('[data-wipe-name]', root), fin = $('[data-wipe-fin]', root);
  const links = $$('[data-wipe-go]', root), q = root.dataset.q || '', carKey = root.dataset.car, carName = root.dataset.carname || '';
  let i = 0, busy = false, timer = 0, vis = false, hold = false;
  /* only the first film loads with the page; the others are fetched once the car is (nearly) on screen */
  const fetchAll = () => imgs.forEach(im => { if (!im.getAttribute('src') && im.dataset.src) im.src = im.dataset.src; });
  const ready = im => { fetchAll(); return (im.complete && im.naturalWidth) ? Promise.resolve() : new Promise(r => { im.loading = 'eager'; im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); }); };
  const label = j => {
    const d = imgs[j].dataset;
    sws.forEach((b, k) => b.setAttribute('aria-pressed', k === j));
    if (carKey) links.forEach(a => a.href = `${R('studio')}?car=${carKey}&film=${encodeURIComponent(d.film)}${q}`);
    const set = () => { if (code) code.textContent = d.code; if (name) name.textContent = d.name; if (fin) fin.textContent = d.fin + (carName ? ' · ' + carName : ''); };
    if (!film || RM) return set();
    film.classList.add('is-swap'); setTimeout(() => { set(); film.classList.remove('is-swap'); }, 300);
  };
  const go = async j => {
    j = (j + n) % n; if (busy || j === i) return; busy = true;
    const a = imgs[i], b = imgs[j]; await ready(b);
    label(j);
    const done = () => { b.classList.add('is-on'); b.classList.remove('is-next'); a.classList.remove('is-on'); i = j; busy = false; };
    if (RM || !b.animate) { done(); return; }
    b.classList.add('is-next');
    const o = { duration: 1250, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' };
    const an = b.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], o);
    if (sq) sq.animate([{ left: '0%', opacity: 0 }, { left: '4%', opacity: 1, offset: .06 }, { left: '96%', opacity: 1, offset: .94 }, { left: '100%', opacity: 0 }], o);
    an.onfinish = () => { done(); an.cancel(); };
  };
  const tick = () => { clearTimeout(timer); if (RM || !vis) return; timer = setTimeout(() => { if (!hold && !document.hidden) go(i + 1); tick(); }, every); };
  sws.forEach((b, k) => b.addEventListener('click', () => { go(k); tick(); }));
  root.addEventListener('pointerenter', () => hold = true); root.addEventListener('pointerleave', () => hold = false);
  root.addEventListener('focusin', () => hold = true); root.addEventListener('focusout', () => hold = false);
  new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis) { fetchAll(); tick(); } else clearTimeout(timer); }), { rootMargin: '200px 0px' }).observe(root);
}
$$('[data-wipe]').forEach(r => wipeCar(r, r.classList.contains('card') ? 3200 : 3800));


/* ---------- nudge: after a couple of seconds of scrolling, a quiet invitation to build the car in 3D (once per visit) ---------- */
(() => {
  if (WR.page === 'studio' || WR.page === '404' || !R('studio')) return;
  try { if (sessionStorage.getItem('wrappi-nudge')) return; } catch (e) {}
  let acc = 0, lastT = 0, done = false, el = null, hideT = 0;
  const busy = () => document.documentElement.classList.contains('pop-open') || (menu && menu.classList.contains('is-open')) || document.body.classList.contains('bot-on') || document.body.classList.contains('consent-on') || (lb && !lb.hidden) || !!$('.modal:not([hidden])');
  const onScroll = () => {
    const t = performance.now();
    if (lastT && t - lastT < 800) acc += Math.min(t - lastT, 400);
    lastT = t;
    if (acc > 2000 && scrollY > innerHeight * .6) show();
  };
  addEventListener('scroll', onScroll, { passive: true });
  const remember = () => { try { sessionStorage.setItem('wrappi-nudge', '1'); } catch (e) {} };
  function close() { if (!el) return; el.classList.remove('is-on'); clearTimeout(hideT); setTimeout(() => { if (el) { el.remove(); el = null; } }, 700); }
  function show() {
    if (done) return;
    if (busy()) { acc = 1400; return; }
    done = true; removeEventListener('scroll', onScroll); remember();
    el = document.createElement('aside'); el.className = 'nudge'; el.setAttribute('aria-label', tx('Wrap studio', 'Wrap-studio'));
    const href = R('studio');
    el.innerHTML = `<a class="nudge__vis" href="${href}" tabindex="-1" aria-hidden="true"></a>
      <div class="nudge__t"><span class="mono">${tx('Wrap studio · 3D', 'Wrap-studio · 3D')}</span><b>${tx('See your car get wrapped.', 'Se bilen din bli foliert.')}</b><p>${tx('Pick a car and a real film colour, then watch it go on in 3D.', 'Velg bil og en ekte foliefarge, og se den bli lagt på i 3D.')}</p></div>
      <div class="nudge__acts"><a class="btn btn--solid btn--sm" href="${href}"><span>${tx('Build it in 3D', 'Design den i 3D')}</span><svg><use href="#i-arrow"/></svg></a><button type="button" class="nudge__no">${tx('Not now', 'Ikke nå')}</button></div>
      <button type="button" class="nudge__x" aria-label="${tx('Close', 'Lukk')}"><svg><use href="#i-x"/></svg></button><i class="nudge__time" aria-hidden="true"></i>`;
    const tpl = $('#tplCar'); if (tpl) $('.nudge__vis', el).appendChild(tpl.content.cloneNode(true));
    document.body.appendChild(el);
    $$('.nudge__x,.nudge__no', el).forEach(b => b.addEventListener('click', close));
    el.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    wipeCar($('.nudge__vis .wcar', el), 2600);
    requestAnimationFrame(() => requestAnimationFrame(() => el && el.classList.add('is-on')));
    const arm = () => { clearTimeout(hideT); hideT = setTimeout(close, 16000); };
    arm(); el.addEventListener('pointerenter', () => clearTimeout(hideT)); el.addEventListener('pointerleave', arm);
    el.addEventListener('focusin', () => clearTimeout(hideT));
  }
})();

/* ---------- story deck: stacked cards; swipe / drag the top card away (or use the arrows) to bring up the next ---------- */
$$('[data-deck]').forEach(root => {
  const stack = $('.deck__stack', root); if (!stack) return;
  const cards = $$('.deck__card', stack), n = cards.length; if (n < 2) return;
  const idx = $('.deck__index', root), count = $('.deck__count', root), prog = $('.deck__prog', root);
  const pad = v => String(v).padStart(2, '0');
  if (prog) prog.innerHTML = cards.map(() => '<i></i>').join('');
  if (idx) idx.innerHTML = cards.map((c, j) => `<li><button type="button" data-go="${j}"><i>${pad(j + 1)}</i><span>${c.dataset.title || ''}</span></button></li>`).join('');
  let i = 0, busy = false;
  const lay = skip => {
    cards.forEach((c, j) => {
      if (c === skip) return;
      const k = (j - i + n) % n;
      c.style.setProperty('--k', Math.min(k, 3)); c.style.zIndex = n - k; c.style.opacity = k > 2 ? 0 : '';
      c.classList.toggle('is-top', k === 0);
      if (k === 0) { c.removeAttribute('aria-hidden'); c.inert = false; } else { c.setAttribute('aria-hidden', 'true'); c.inert = true; }
      c.setAttribute('aria-roledescription', tx('card', 'kort')); c.setAttribute('aria-label', `${j + 1} / ${n}`);
    });
    if (count) count.innerHTML = `<b>${pad(i + 1)}</b> / ${pad(n)}`;
    if (prog) $$('i', prog).forEach((x, j) => { x.classList.toggle('is-on', j < i); x.classList.toggle('is-now', j === i); });
    if (idx) $$('button', idx).forEach(b => b.setAttribute('aria-current', +b.dataset.go === i));
  };
  /* d = +1: the top card flies off and goes to the back · d = -1: the card at the back flies back on top */
  const go = (d, dir) => {
    if (busy) return; busy = true;
    const ms = RM ? 0 : 520;
    if (d > 0) {
      const out = cards[i]; out.style.setProperty('--dir', dir || -1); out.classList.add('is-out');
      i = (i + 1) % n; lay(out); out.style.zIndex = n + 1; out.inert = true; out.setAttribute('aria-hidden', 'true');
      setTimeout(() => { out.classList.add('no-tr'); out.classList.remove('is-out', 'is-drag'); out.style.transform = ''; lay(); void out.offsetWidth; out.classList.remove('no-tr'); busy = false; }, ms);
    } else {
      const back = cards[(i - 1 + n) % n]; back.style.setProperty('--dir', dir || -1);
      back.classList.add('no-tr', 'is-out'); back.style.zIndex = n + 1; void back.offsetWidth; back.classList.remove('no-tr');
      i = (i - 1 + n) % n; requestAnimationFrame(() => { back.classList.remove('is-out'); lay(); setTimeout(() => { busy = false; }, ms); });
    }
  };
  const jump = j => { if (j === i || busy) return; i = j; cards.forEach(c => c.classList.add('no-tr')); lay(); void stack.offsetWidth; cards.forEach(c => c.classList.remove('no-tr')); const top = cards[i]; if (!RM && top.animate) top.animate([{ opacity: 0, transform: 'translateY(14px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' }); };
  $('[data-deck-next]', root) && $('[data-deck-next]', root).addEventListener('click', () => go(1, -1));
  $('[data-deck-prev]', root) && $('[data-deck-prev]', root).addEventListener('click', () => go(-1, -1));
  if (idx) idx.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) jump(+b.dataset.go); });
  stack.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1, -1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1, -1); } });
  /* drag: horizontal moves only (vertical swipes keep scrolling the page) */
  let dr = null;
  stack.addEventListener('pointerdown', e => { if (busy || e.button > 0 || e.target.closest('a,button')) return; dr = { x: e.clientX, y: e.clientY, dx: 0, on: false, id: e.pointerId, t: performance.now() }; });
  stack.addEventListener('pointermove', e => {
    if (!dr) return; const dx = e.clientX - dr.x, dy = e.clientY - dr.y;
    if (!dr.on) { if (Math.abs(dx) < 8) return; if (Math.abs(dy) > Math.abs(dx)) { dr = null; return; } dr.on = true; stack.setPointerCapture(dr.id); cards[i].classList.add('is-drag'); }
    dr.dx = dx; cards[i].style.transform = `translate3d(${dx}px,${Math.abs(dx) * -.04}px,0) rotate(${dx * .025}deg)`;
  });
  const end = () => {
    if (!dr) return; const d = dr; dr = null; if (!d.on) return;
    const top = cards[i], v = Math.abs(d.dx) / Math.max(1, performance.now() - d.t);
    top.classList.remove('is-drag');
    if (Math.abs(d.dx) > Math.min(120, stack.clientWidth * .28) || v > .6) { top.style.transform = ''; go(1, d.dx < 0 ? -1 : 1); }
    else top.style.transform = '';
  };
  stack.addEventListener('pointerup', end); stack.addEventListener('pointercancel', end);
  lay();
  /* once, when the deck comes into view, the top card nods to show it can be swiped */
  if (!RM) new IntersectionObserver((es, o) => es.forEach(e => { if (!e.isIntersecting) return; o.disconnect(); setTimeout(() => { const c = cards[i]; if (c.animate && !busy) c.animate([{ transform: 'none' }, { transform: 'translate3d(-26px,-2px,0) rotate(-1.6deg)' }, { transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.65,0,.35,1)' }); }, 700); }), { threshold: .6 }).observe(stack);
});

/* ════════ motion (GSAP + Lenis). Without them the page still works, just still. ════════ */
const pre = () => document.documentElement.classList.remove('wr-pre');
const fontsIn = new Promise(r => { if (!document.fonts || document.fonts.status === 'loaded') return r(); document.fonts.ready.then(r); setTimeout(r, 700); });
fontsIn.then(() => { fitHeads(); motion(); if (document.fonts) { if (document.fonts.status !== 'loaded') document.fonts.ready.then(refit); document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', refit); } });
function motion() {
  const isHome = !!$('.hero');
  const heroGo = () => { const h = $('.hero'); if (h) h.classList.add('is-lit'); window.wrHeroReady = true; if (window.wrHeroStart) window.wrHeroStart(); };
  /* desktop: the studio light and the big WRAPPI follow the pointer a little */
  const heroEl = $('.hero');
  if (heroEl && matchMedia('(hover: hover) and (pointer: fine)').matches && !RM) {
    let tx0 = 0, ty0 = 0, raf = 0, ev = null;
    heroEl.addEventListener('pointermove', e => { ev = e; if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const r = heroEl.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
      heroEl.style.setProperty('--mx', x + 'px'); heroEl.style.setProperty('--my', y + 'px');
      tx0 = (x / r.width - .5) * 2; ty0 = (y / r.height - .5) * 2; heroEl.style.setProperty('--px', tx0.toFixed(3)); heroEl.style.setProperty('--py', ty0.toFixed(3)); }); }, { passive: true });
    heroEl.addEventListener('pointerleave', () => { heroEl.style.setProperty('--px', 0); heroEl.style.setProperty('--py', 0); });
  }
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
    gsap.fromTo('.hero__title .ch', { yPercent: 115, rotate: 7 }, { yPercent: 0, rotate: 0, duration: 1.15, stagger: .024, ease: 'expo.out', delay: .1 });
    gsap.fromTo(['.hero__eyebrow', '.hero__kicker', '.hero__motto', '.hero__sub', '.hero__ctas', '.hero__now'], { autoAlpha: 0, y: 22, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: .07, ease: 'expo.out', delay: .25, clearProps: 'filter' });
    gsap.fromTo('.hero__stage', { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 1.6, ease: 'expo.out', delay: .15, clearProps: 'transform' });
  }
  const ph = $('.phead'); if (ph) gsap.fromTo($$('.phead__crumbs,.phead .tag,.phead h1 .h-line > span,.phead__lead,.phead .acts,.phead__media figure', ph), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .05, ease: 'expo.out', delay: .1 });

  /* featured jobs: the section holds still and the row of cards slides sideways as you scroll down.
     A sideways swipe on the cards still works: it simply scrolls the page by the same amount. */
  $$('.tour').forEach(sec => {
    const track = $('.tour__track', sec); if (!track || track.children.length < 3) return;
    sec.classList.add('is-scrub');
    const vw = () => document.documentElement.clientWidth;
    const dist = () => Math.max(0, track.scrollWidth - vw());
    const bar = $('.tour__bar i', sec); let ends = null;
    const st = ScrollTrigger.create({
      trigger: sec, start: () => sec.offsetHeight > innerHeight - 40 ? 'bottom bottom' : 'center center', end: () => '+=' + dist(),
      pin: true, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1,
      animation: gsap.fromTo(track, { x: 0 }, { x: () => -dist(), ease: 'none' }), scrub: .6,
      onUpdate: s => { if (bar) bar.style.setProperty('--tp', s.progress.toFixed(3)); if (ends) ends(); }
    });
    const to = y => window.lenis ? lenis.scrollTo(y, { duration: .9 }) : scrollTo({ top: y, behavior: 'smooth' });
    /* arrows: one card at a time */
    const nav = $('.tour__nav', sec);
    if (nav) { const [p, n] = $$('button', nav).map(b => { const c = b.cloneNode(true); b.replaceWith(c); return c; });
      const step = d => { const c = $('.card', track), w = (c ? c.offsetWidth : 320) + 16; to(Math.min(st.end, Math.max(st.start, st.scroll() + d * w))); };
      p.addEventListener('click', () => step(-1)); n.addEventListener('click', () => step(1));
      ends = () => { p.disabled = st.progress < .005; n.disabled = st.progress > .995; }; ends(); }
    /* sideways drag / swipe → page scroll */
    let dx0 = null, dy0 = 0, on = false;
    track.addEventListener('pointerdown', e => { if (e.button > 0) return; dx0 = e.clientX; dy0 = e.clientY; on = false; }, { passive: true });
    track.addEventListener('pointermove', e => {
      if (dx0 === null) return; const dx = e.clientX - dx0, dy = e.clientY - dy0;
      if (!on) { if (Math.abs(dx) < 8) return; if (Math.abs(dy) > Math.abs(dx)) { dx0 = null; return; } on = true; track.classList.add('is-dragging'); }
      dx0 = e.clientX; const y = st.scroll() - dx;
      if (window.lenis) lenis.scrollTo(y, { immediate: true }); else scrollTo(0, y);
    }, { passive: true });
    const up = () => { dx0 = null; if (on) setTimeout(() => track.classList.remove('is-dragging'), 50); on = false; };
    track.addEventListener('pointerup', up); track.addEventListener('pointercancel', up);
    track.addEventListener('click', e => { if (track.classList.contains('is-dragging')) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* nav hide/show + reading progress */
  const nav = $('#nav'); let lastY = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { const y = s.scroll(); nav.classList.toggle('is-hidden', y > 300 && y > lastY + 2 && !(menu && menu.classList.contains('is-open'))); if (Math.abs(y - lastY) > 2) lastY = y; nav.style.setProperty('--np', s.progress.toFixed(3)); } });

  if (isHome) {
    gsap.fromTo('.hero__inner', { yPercent: 0, autoAlpha: 1 }, { yPercent: -16, autoAlpha: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: st => $('.hero').style.setProperty('--hs', st.progress.toFixed(3)) });
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
}
})();
