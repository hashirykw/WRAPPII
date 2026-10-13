/* ════════════════════════════════════════════════════════════════
   Wrappi — 3D wrap studio (hero car on the home page + the full studio page)
   One WebGL canvas, one car at a time. Cars: sedan, sports car, SUV.
   Every car is prepared the same way (front at −Z, tyres on y = 0, real length in metres,
   parts named paint / glass / rim / tyre / caliper / chrome / lens / light_front / light_rear),
   so the paint shader, skins, decal, PPF zones and camera framing work on all of them.
   ════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const H = document.documentElement;
const LANG = H.lang === 'nb' ? 'no' : 'en';
const tx = (en, no) => LANG === 'no' ? no : en;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const W8 = window.WRAPPI || {};
const nf = n => Math.round(n).toLocaleString(LANG === 'no' ? 'nb-NO' : 'en-GB');
const nok = n => 'NOK ' + nf(n);
const wa = t => `https://wa.me/${W8.wa || '4746228133'}?text=${encodeURIComponent(t)}`;
const toast = window.wrToast || (() => {});

/* ───────── cars ───────── */
const CARS = {
  sedan:  { file: 'car-sedan.glb',  en: 'Sedan',      no: 'Sedan',     model: 'Tesla Model 3', size: 'mid', ok: true },
  sports: { file: 'car-sports.glb', en: 'Sports car', no: 'Sportsbil', model: 'Porsche 911',   size: 'mid', ok: true },
  suv:    { file: 'car-suv.glb',    en: 'SUV',        no: 'SUV',       model: 'Tesla Model Y', size: 'suv', ok: false }
};
document.querySelectorAll("[data-carcount]").forEach(e => e.textContent = Object.values(CARS).filter(c => c.ok).length);

/* ───────── finishes (roughness, metalness, clearcoat, clearcoat roughness, flake) ───────── */
const FIN = {
  gloss: [.3, .06, 1, .03, 0], metallic: [.34, .62, 1, .03, .36], pearl: [.3, .32, 1, .03, .18],
  satin: [.55, .14, .25, .55, 0], satinMetal: [.48, .5, .3, .5, .22],
  matte: [.86, .04, 0, 1, 0], matteMetal: [.7, .45, 0, 1, .18],
  chrome: [.05, 1, 1, .02, 0], diamond: [.28, .6, 1, .03, .75], brushed: [.38, .85, 0, 1, .12]
};
const FINISH = { // custom colour finishes shown in the picker
  gloss: { en: 'Gloss', no: 'Blank' }, metallic: { en: 'Metallic', no: 'Metallic' }, satin: { en: 'Satin', no: 'Satin' },
  matte: { en: 'Matte', no: 'Matt' }, chrome: { en: 'Chrome', no: 'Krom' }
};
const SKINS = {
  solid:      { id: 0, en: 'Solid', no: 'Ensfarget', pv: 'linear-gradient(160deg,#5b5e64,#2b2d31)', acc: 0 },
  stripes:    { id: 1, en: 'Twin stripes', no: 'Doble striper', pv: 'linear-gradient(90deg,#d9dadc 0 30%,#d6343c 30% 44%,#d9dadc 44% 56%,#d6343c 56% 70%,#d9dadc 70%)', acc: 1 },
  bands:      { id: 2, en: 'Side bands', no: 'Sidestriper', pv: 'linear-gradient(180deg,#e9e9e6 0 48%,#4092ce 48% 58%,#173e5f 58% 64%,#d6343c 64% 74%,#e9e9e6 74%)', acc: 2 },
  contrast:   { id: 3, en: 'Contrast roof & hood', no: 'Kontrast tak og panser', pv: 'linear-gradient(180deg,#111214 0 34%,#e3e3e0 34%)', acc: 1 },
  split:      { id: 4, en: 'Wrappi split', no: 'Wrappi-split', pv: 'linear-gradient(110deg,#d6343c 0 46%,#f6f6f4 46% 54%,#4092ce 54%)', acc: 2 },
  carbon:     { id: 5, en: 'Carbon', no: 'Karbon', pv: 'repeating-linear-gradient(45deg,#1b1c1f 0 4px,#2c2e33 4px 8px),#1b1c1f', acc: 0 },
  camo:       { id: 6, en: 'Pixel camo', no: 'Pikselkamo', pv: 'conic-gradient(from 90deg at 30% 40%,#4a5a3a 0 25%,#2b2f2a 0 50%,#7d8a62 0 75%,#2b2f2a 0) 0 0/18px 18px', acc: 2 },
  distressed: { id: 7, en: 'Distressed', no: 'Slitt', pv: 'radial-gradient(circle at 30% 40%,#5d6066 0 18%,transparent 19%),radial-gradient(circle at 70% 65%,#3f4246 0 14%,transparent 15%),#d8d8d4', acc: 1 },
  fade:       { id: 8, en: 'Colour fade', no: 'Fargeovergang', pv: 'linear-gradient(90deg,#d6343c,#4092ce)', acc: 1 }
};
const PRESETS = [
  { k: 'taycan', th: 'th-taycan.webp', car: 'Porsche Taycan', en: 'Teal chrome', no: 'Turkis krom', b: { c: '#0fa89c', f: 'chrome' } },
  { k: 'urus', th: 'th-urus.webp', car: 'Lamborghini Urus', en: 'Midnight purple', no: 'Midnattslilla', b: { c: '#140f22', f: 'satin', fl: '#4a2d80' } },
  { k: 'lime', th: 'th-lime.webp', car: 'Tesla Model Y', en: 'Lime, gold flip', no: 'Lime, gullskimmer', b: { c: '#6cc824', f: 'metallic', fl: '#d8c21a' } },
  { k: 'rose', th: 'th-rose.webp', car: 'Nissan Leaf', en: 'Rose gold satin', no: 'Rosegull satin', b: { c: '#c4846a', f: 'satinMetal' } },
  { k: 'grey', th: 'th-grey.webp', car: 'Tesla Model Y', en: 'Satin titanium', no: 'Satin titan', b: { c: '#86898e', f: 'satinMetal' } },
  { k: 'red', th: 'th-red.webp', car: 'Tesla', en: 'Satin red', no: 'Satin rød', b: { c: '#a3101a', f: 'satin' } },
  { k: 'martini', th: 'th-martini.webp', car: 'VW Touareg', en: 'Side bands', no: 'Sidestriper', b: { c: '#e9e9e6', f: 'gloss', s: 'bands', a1: '#2f9ad8', a2: '#d6262f' } },
  { k: 'gladiator', th: 'th-gladiator.webp', car: 'Jeep Gladiator', en: 'White, black roof & hood', no: 'Hvit, svart tak og panser', b: { c: '#e4e4e1', f: 'satin', s: 'contrast', a1: '#121315' } },
  { k: 'bmw', th: 'th-bmw.webp', car: 'BMW 3 Series', en: 'Twin stripes', no: 'Doble striper', b: { c: '#ececea', f: 'gloss', s: 'stripes', a1: '#111214', a2: '#111214' } }
];
const RIMS = { silver: { en: 'Silver', no: 'Sølv', v: ['#c7cad0', .95, .26] }, gloss: { en: 'Gloss black', no: 'Blank svart', v: ['#0b0c0e', .55, .12] }, satin: { en: 'Satin black', no: 'Satin svart', v: ['#1b1c1f', .35, .55] }, bronze: { en: 'Bronze', no: 'Bronse', v: ['#8a6a3e', .9, .3] } };
const CALS = { red: { en: 'Red', no: 'Rød', c: '#c41f28' }, yellow: { en: 'Yellow', no: 'Gul', c: '#e6b400' }, blue: { en: 'Blue', no: 'Blå', c: '#2f6fd6' }, black: { en: 'Black', no: 'Svart', c: '#151618' } };
const TINTS = { none: { en: 'Factory', no: 'Fabrikk', v: ['#1a1e24', .55] }, t35: { en: '35 %', no: '35 %', v: ['#0d0f12', .78] }, t20: { en: '20 %', no: '20 %', v: ['#08090b', .9] }, t5: { en: '5 %', no: '5 %', v: ['#040405', .97] } };
const PPF = {
  front: { en: 'Front PPF', no: 'Front PPF', s: 'ppfFront', c: [['Whole bonnet', 'Hele panseret'], ['Front bumper', 'Frontfanger'], ['Both front wings', 'Begge forskjermene'], ['Both A-pillars', 'Begge A-stolpene'], ['Both side mirrors', 'Begge sidespeilene'], ['Headlights', 'Frontlyktene']] },
  full:  { en: 'Full car', no: 'Hel bil', s: 'ppfFull', c: [['Every painted panel', 'Alle lakkerte paneler'], ['Self-healing film all round', 'Selvhelende film hele veien rundt'], ['Up to 10-year warranty', 'Opptil 10 års garanti'], ['Also as Color PPF', 'Også som farget PPF']] }
};
const HEX = /^#[0-9a-f]{6}$/i;
const FILMS = window.FILMS || { brands: [], finishes: {} };
const filmBy = id => { if (!id) return null; const [b, code] = id.split(':'); const br = FILMS.brands.find(x => x.k === b); if (!br) return null; const r = br.list.find(x => x[0] === code); return r ? { brand: br, code: r[0], name: r[1], fin: r[2], c: r[3], fl: r[4] || null } : null; };
const filmBuild = f => { const fi = FILMS.finishes[f.fin] || {}; return { c: f.c, f: fi.pbr || 'gloss', fl: f.fl, s: fi.skin || 'solid' }; };

/* ════════ drawn SVG car — shown when WebGL isn't available ════════ */
const BODY = 'M58 262C50 245 48 228 56 214C64 200 92 188 140 182L330 168C360 165 380 160 405 150C450 120 500 92 560 84C640 76 720 82 770 100C830 122 880 140 920 150C945 156 955 168 955 190L952 238C950 256 940 266 920 268L850 268A60 60 0 0 0 730 268L270 268A60 60 0 0 0 150 268L80 268C68 268 60 266 58 262Z';
const WIN = 'M440 150C478 122 518 101 566 94C636 87 704 90 750 104C782 114 808 128 828 141C800 146 760 148 700 149Z';
const SPEC = 'M122 195C300 179 520 171 700 167C800 165 880 163 932 161L933 166C880 168 800 170 700 172C520 176 300 184 123 200ZM562 90C640 82 720 86 768 102L762 108C716 94 640 91 566 98Z';
function wheelSVG(u, cx) {
  let spokes = ''; for (let k = 0; k < 5; k++) spokes += `<path d="M-5 -35L5 -35L3.5 -10L-3.5 -10Z" fill="#c4c7cc" transform="rotate(${k * 72})"/>`;
  return `<g transform="translate(${cx} 268)"><circle r="54" fill="#09090a"/><circle r="49" fill="none" stroke="#1e1f22" stroke-width="3"/><circle r="38" fill="url(#${u}-rim)"/><path class="brake" d="M-31 -12A34 34 0 0 1 -12 -31L-8 -23A25 25 0 0 0 -23 -8Z"/><g class="rimrot">${spokes}<circle r="38" fill="none" stroke="#5c6066" stroke-width="2"/></g><circle r="9" fill="#232428" stroke="#8b8d92" stroke-width="1.5"/></g>`;
}
function carSVG(u, label) {
  return `<svg class="car" id="car-${u}" viewBox="0 40 1000 410" data-finish="gloss" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}><defs>
  <clipPath id="${u}-b"><path d="${BODY}"/></clipPath><clipPath id="${u}-w"><rect id="${u}-wipe" x="0" y="0" width="0" height="460"/></clipPath>
  <linearGradient id="${u}-sh" x1="0" y1="80" x2="0" y2="272" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".32" stop-color="#fff" stop-opacity=".06"/><stop offset=".52" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".38"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></linearGradient>
  <linearGradient id="${u}-cr" x1="0" y1="80" x2="0" y2="272" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#a2a7ae"/><stop offset=".36" stop-color="#1c1e22"/><stop offset=".5" stop-color="#eef0f2"/><stop offset=".64" stop-color="#555a61"/><stop offset=".8" stop-color="#d4d7db"/><stop offset="1" stop-color="#2a2d31"/></linearGradient>
  <linearGradient id="${u}-gl" x1="0" y1="88" x2="0" y2="152" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4a5262"/><stop offset=".45" stop-color="#14171c"/><stop offset="1" stop-color="#050607"/></linearGradient>
  <radialGradient id="${u}-rim"><stop offset="0" stop-color="#3c3f45"/><stop offset="1" stop-color="#121315"/></radialGradient>
  <filter id="${u}-blur" x="-10%" y="-80%" width="120%" height="260%"><feGaussianBlur stdDeviation="7"/></filter><filter id="${u}-glow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <ellipse cx="500" cy="323" rx="462" ry="14" fill="#000" opacity=".8"/>
  <g clip-path="url(#${u}-b)"><rect class="paint-old" x="0" y="40" width="1000" height="300" fill="#2a2c30"/><rect class="paint-new" x="0" y="40" width="1000" height="300" fill="#2a2c30" clip-path="url(#${u}-w)"/>
  <rect class="chrome" x="0" y="40" width="1000" height="300" fill="url(#${u}-cr)" style="mix-blend-mode:hard-light" opacity="0"/><rect class="shade" x="0" y="40" width="1000" height="300" fill="url(#${u}-sh)"/>
  <path class="spec-soft" d="${SPEC}" fill="#fff" filter="url(#${u}-blur)" opacity=".25"/><path class="spec" d="${SPEC}" fill="#fff" opacity=".9"/></g>
  <path d="${WIN}" fill="url(#${u}-gl)"/><path d="M62 206C96 196 140 190 184 188C166 198 120 208 70 214Z" fill="#eef4ff"/>
  <path class="tail" d="M898 154C926 160 946 170 953 184L951 194C934 180 914 170 890 163Z"/>${wheelSVG(u, 210)}${wheelSVG(u, 790)}
  <g class="sq" opacity="0"><rect x="-2" y="60" width="4" height="135" fill="var(--color-red)"/><rect x="-2" y="195" width="4" height="135" fill="var(--color-blue)"/></g></svg>`;
}
function wrapSVG(u, color, finish) {
  const svg = $('#car-' + u); if (!svg) return;
  const wipe = $('#' + u + '-wipe'), sq = $('.sq', svg), nw = $('.paint-new', svg), old = $('.paint-old', svg);
  svg.dataset.finish = /chrome/.test(finish) ? 'chrome' : /matte/.test(finish) ? 'matte' : /satin|brushed/.test(finish) ? 'satin' : 'gloss';
  cancelAnimationFrame(svg._raf); nw.setAttribute('fill', color);
  if (RM) { old.setAttribute('fill', color); return; }
  const t0 = performance.now(); sq.setAttribute('opacity', 1);
  const step = t => { const p = Math.max(0, Math.min(1, (t - t0) / 1150)), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2, x = 30 + e * 940; wipe.setAttribute('width', x); sq.setAttribute('transform', `translate(${x} 0)`); if (p < 1) svg._raf = requestAnimationFrame(step); else { old.setAttribute('fill', color); wipe.setAttribute('width', 0); sq.setAttribute('opacity', 0); } };
  wipe.setAttribute('width', 0); svg._raf = requestAnimationFrame(step);
}

/* ════════ 3D engine ════════ */
const ENGINE = (() => {
  if (!H.classList.contains('can3d')) { H.classList.add('no3d'); return null; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }); }
  catch (e) { H.classList.remove('can3d'); H.classList.add('no3d'); return null; }
  const mobile = () => innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.6 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  const canvas = renderer.domElement; canvas.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);

  /* studio reflections: long overhead softboxes, side strips, a horizon band, the logo's red + blue low on the walls */
  (() => {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(40, 16, 40), new THREE.MeshBasicMaterial({ color: 0x101114, side: THREE.BackSide })));
    const panel = (w, h, pos, rot, col, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.rotation.set(...rot); env.add(m); };
    for (let i = -2; i <= 2; i++) panel(.6, 18, [i * 2.4, 7.4, 0], [Math.PI / 2, 0, 0], '#ffffff', 6);
    panel(14, 10, [0, 7.8, 0], [Math.PI / 2, 0, 0], '#ffffff', .35);
    panel(40, 40, [0, -.02, 0], [-Math.PI / 2, 0, 0], '#2c2d31', 1);
    panel(18, 6, [-17, 3.6, 0], [0, Math.PI / 2, 0], '#ffffff', 1.6);
    panel(18, 6, [17, 3.6, 0], [0, -Math.PI / 2, 0], '#ffffff', 1.6);
    panel(12, 3.4, [0, 3.2, 17], [0, Math.PI, 0], '#ffffff', .9);
    panel(12, 3.4, [0, 3.2, -17], [0, 0, 0], '#ffffff', .9);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 15.5, .8, 64, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(1.15), side: THREE.BackSide }));
    band.position.y = 1.7; env.add(band);
    panel(24, .4, [-19.8, 1, 0], [0, Math.PI / 2, 0], '#d6343c', 6);
    panel(24, .4, [19.8, 1, 0], [0, -Math.PI / 2, 0], '#4092ce', 6);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, .02).texture; pm.dispose();
  })();

  /* floor that fades out, turntable with the red/blue ring */
  const radial = stops => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv); };
  const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 64), new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: .38, metalness: .2, envMapIntensity: .5, transparent: true, alphaMap: radial([[0, '#fff'], [.45, '#ddd'], [1, '#000']]), depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.052; scene.add(floor);
  const table = new THREE.Group(); scene.add(table);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.36, .05, 128), new THREE.MeshPhysicalMaterial({ color: 0x141518, roughness: .3, metalness: .4, clearcoat: .6, clearcoatRoughness: .2, envMapIntensity: .8 }));
  disc.position.y = -.025; table.add(disc);
  const rings = [[0, '#d6343c'], [Math.PI, '#4092ce']].map(([a, c]) => { const r = new THREE.Mesh(new THREE.RingGeometry(3.3, 3.345, 160, 1, a, Math.PI), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(1.2), toneMapped: false, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.y = .002; table.add(r); return r; });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: radial([[.6, 'rgba(255,255,255,0.08)'], [1, 'rgba(255,255,255,0)']]), transparent: true, depthWrite: false }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = -.05; scene.add(halo);

  /* body paint shader: squeegee wipe, finishes, flake, colour shift, skins, door decal, PPF zones, ceramic beading */
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); blank.needsUpdate = true;
  const C = () => ({ value: new THREE.Color() }), V4 = (...a) => ({ value: new THREE.Vector4(...a) });
  const U = {
    uOld: C(), uNew: C(), uOA1: C(), uNA1: C(), uOA2: C(), uNA2: C(), uOFl: C(), uNFl: C(),
    uFOld: V4(...FIN.gloss.slice(0, 4)), uFNew: V4(...FIN.gloss.slice(0, 4)), uXOld: V4(0, 0, 0, 0), uXNew: V4(0, 0, 0, 0),
    uP: { value: 9 }, uA: { value: 0 }, uDir: { value: -1 }, uMidY: { value: .7 }, uLen: { value: 2.3 }, uTop: { value: 1.3 },
    uPpf: { value: 1 }, uPpfA: { value: 0 }, uCer: { value: 0 }, uTime: { value: 0 }, uInv: { value: new THREE.Matrix4() },
    uDec: { value: blank }, uDecR: V4(-.2, .62, .43, .215)
  };
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: .1, roughness: .3, clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 1.35 });
  bodyMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uInv; varying vec3 vLocal; varying vec3 vLN;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvLocal = (uInv * modelMatrix * vec4(transformed, 1.0)).xyz;\nvLN = normalize(mat3(uInv) * mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform vec3 uOld; uniform vec3 uNew; uniform vec3 uOA1; uniform vec3 uNA1; uniform vec3 uOA2; uniform vec3 uNA2; uniform vec3 uOFl; uniform vec3 uNFl;
uniform vec4 uFOld; uniform vec4 uFNew; uniform vec4 uXOld; uniform vec4 uXNew;
uniform float uP; uniform float uA; uniform float uDir; uniform float uMidY; uniform float uLen; uniform float uTop;
uniform float uPpf; uniform float uPpfA; uniform float uCer; uniform float uTime;
uniform sampler2D uDec; uniform vec4 uDecR;
varying vec3 vLocal; varying vec3 vLN;
float hash(vec2 c){ return fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise3(vec3 p){ vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z); }
float fbm(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise3(p); p *= 2.03; a *= 0.5; } return v; }
float band(float x, float a, float b){ return step(a, x) * step(x, b); }
vec2 planar(vec3 p, vec3 n){ return abs(n.y) > 0.55 ? p.xz : (abs(n.x) > abs(n.z) ? p.zy : p.xy); }
/* every car is measured against a 4.5 m long, 1.24 m tall reference, so skins and PPF zones land in the same places */
float noseDist(vec3 p){ return (uLen - p.z * uDir) * (4.5 / (2.0 * uLen)); }
float normY(vec3 p){ return p.y * (1.24 / uTop); }
vec4 skinCol(vec3 base, vec3 a1, vec3 a2, float s, vec3 p, vec3 n){
  float dn = noseDist(p); float ax = abs(p.x); float yy = normY(p);
  if (s < 0.5) return vec4(base, 1.0);
  if (s < 1.5) { float top = step(-0.35, n.y); float st = band(ax, 0.07, 0.25) * top; float pin = band(ax, 0.29, 0.315) * top;
    vec3 c = mix(base, a1, st); c = mix(c, a2, pin); return vec4(c, 1.0 - max(st, pin)); }
  if (s < 2.5) { float side = smoothstep(0.25, 0.5, abs(n.x)); float y = yy - 0.035 * dn;
    float hood = step(0.45, n.y) * step(dn, 1.75);
    float m1 = max(band(y, 0.42, 0.50) * side, band(ax, 0.10, 0.20) * hood);
    float m2 = max(band(y, 0.50, 0.535) * side, band(ax, 0.20, 0.235) * hood);
    float m3 = max(band(y, 0.535, 0.60) * side, band(ax, 0.235, 0.33) * hood);
    vec3 c = mix(base, a1, m1); c = mix(c, a1 * 0.28, m2); c = mix(c, a2, m3); return vec4(c, 1.0 - max(m1, max(m2, m3))); }
  if (s < 3.5) { float m = max(step(1.24 - 0.33, yy), step(0.55, n.y) * step(dn, 1.45) * step(ax, 0.78)); return vec4(mix(base, a1, m), 1.0 - m); }
  if (s < 4.5) { float t = dn / 4.5 + (yy - 0.6) * 0.22; float r = step(t, 0.47); float b = step(0.53, t);
    vec3 c = mix(base, a1, r); c = mix(c, a2, b); return vec4(c, 1.0 - max(r, b)); }
  if (s < 5.5) { vec2 q = planar(p, n) * 46.0; vec2 cl = floor(q); vec2 f = fract(q); float w = mod(cl.x + cl.y, 2.0) > 0.5 ? f.x : f.y;
    float sh = 0.55 + 0.45 * sin(w * 3.14159); return vec4(base * (0.45 + 0.75 * sh) + vec3(0.012), 0.0); }
  if (s < 6.5) { vec2 q = planar(p, n); float h = hash(floor(q * 5.0)); float h2 = hash(floor(q * 11.0) + 7.0);
    vec3 c = h < 0.36 ? base : (h < 0.7 ? a1 : a2); c = mix(c, base * 0.25, step(0.86, h2)); return vec4(c, step(h, 0.36)); }
  if (s < 7.5) { float nn = fbm(p * 2.6); float fine = fbm(p * 11.0); float pt = smoothstep(0.52, 0.62, nn + fine * 0.25); float sp = step(0.74, fine) * 0.6;
    return vec4(mix(base, a1, clamp(pt * 0.85 + sp * 0.5, 0.0, 1.0)), 1.0 - pt); }
  float t = smoothstep(0.2, 0.85, dn / 4.5 + (hash(floor(p.xz * 140.0)) - 0.5) * 0.04);
  return vec4(mix(base, a1, t), 1.0 - t);
}
vec4 decal(vec3 p, vec3 n){
  if (abs(n.x) < 0.45) return vec4(0.0);
  float u = (p.x > 0.0 ? (uDecR.x - p.z) : (p.z - uDecR.x)) / (2.0 * uDecR.z) + 0.5;
  float v = (p.y - uDecR.y) / (2.0 * uDecR.w) + 0.5;
  if (u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0) return vec4(0.0);
  return texture2D(uDec, vec2(u, v));
}
float ppfZone(vec3 p){
  if (uPpf > 3.5) return 1.0;
  float dn = noseDist(p); float ax = abs(p.x); float yy = normY(p);
  float z = step(dn, 1.55);
  z = max(z, step(dn, 2.5) * step(1.4, dn) * step(0.86, yy) * step(0.45, ax));
  z = max(z, step(dn, 2.1) * step(1.5, dn) * step(0.95, ax) * step(0.7, yy));
  return z;
}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
float wT = step(0.0, (vLocal.z - uP) * uDir);
vec3 nL = normalize(vLN);
float facing = clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0);
float shiftK = smoothstep(0.12, 0.85, facing);
vec4 skO = skinCol(uOld, uOA1, uOA2, uXOld.z, vLocal, nL);
vec4 skN = skinCol(uNew, uNA1, uNA2, uXNew.z, vLocal, nL);
skO.rgb = mix(skO.rgb, mix(uOFl, skO.rgb, shiftK), uXOld.x * skO.a);
skN.rgb = mix(skN.rgb, mix(uNFl, skN.rgb, shiftK), uXNew.x * skN.a);
vec4 dc = decal(vLocal, nL);
skO.rgb = mix(skO.rgb, dc.rgb, dc.a * uXOld.w);
skN.rgb = mix(skN.rgb, dc.rgb, dc.a * uXNew.w);
diffuseColor.rgb = mix(skO.rgb, skN.rgb, wT);
float flakeK = mix(uXOld.y, uXNew.y, wT);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(uFOld.x, uFNew.x, wT);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(uFOld.y, uFNew.y, wT);')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
if (flakeK > 0.001) { vec3 fc = floor(vLocal * 260.0); vec3 rn = vec3(hash3(fc), hash3(fc + 13.1), hash3(fc + 27.7)) - 0.5; normal = normalize(normal + rn * flakeK * 0.42); }`)
      .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat = mix(uFOld.z, uFNew.z, wT);\nmaterial.clearcoatRoughness = clamp(mix(uFOld.w, uFNew.w, wT), 0.0525, 1.0);\n#endif')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
float ln = smoothstep(0.06, 0.0, abs(vLocal.z - uP)) * uA;
float dp = (vLocal.z - uP) * uDir;
float tr = step(0.0, dp) * exp(-dp * 5.0) * uA;
vec3 lc = vLocal.y > uMidY ? vec3(0.84, 0.2, 0.24) : vec3(0.25, 0.57, 0.81);
totalEmissiveRadiance += lc * ln * 7.0 + vec3(pow(ln, 3.0) * 2.2) + vec3(0.22) * tr;
if (uPpfA > 0.001) {
  float zp = ppfZone(vLocal) * uPpfA;
  float hatch = smoothstep(0.40, 0.48, abs(fract((vLocal.x * 0.5 + vLocal.y + vLocal.z) * 7.0) - 0.5));
  float dnn = noseDist(vLocal);
  float sw = exp(-pow(dnn - mod(uTime * 1.8, 7.5) + 1.0, 2.0) * 5.0);
  totalEmissiveRadiance += zp * (vec3(0.45, 0.68, 0.95) * 0.09 + vec3(0.10) * hatch + vec3(0.6, 0.82, 1.0) * 0.4 * sw);
}
if (uCer > 0.001) {
  vec2 q = abs(nL.y) > 0.55 ? vLocal.xz : (abs(nL.x) > abs(nL.z) ? vLocal.zy : vLocal.xy);
  vec2 g = q * 24.0; vec2 c = floor(g); vec2 f = fract(g);
  float h = hash(c); float h2 = hash(c + 17.3);
  vec2 o = vec2(h, h2) * 0.5 + 0.25; float r = 0.1 + 0.16 * h2;
  float on = step(0.52, h) * smoothstep(-0.3, 0.3, nL.y + 0.25);
  float rim = smoothstep(r, r * 0.8, length(f - o)) - smoothstep(r * 0.8, r * 0.55, length(f - o));
  float hl = smoothstep(r * 0.42, 0.0, length(f - o + vec2(r * 0.32, -r * 0.32)));
  totalEmissiveRadiance += uCer * on * (vec3(0.05) * rim + vec3(0.55) * hl);
}`);
  };

  /* detail materials */
  const rimMat = new THREE.MeshPhysicalMaterial({ color: '#c7cad0', metalness: .95, roughness: .26, clearcoat: .6, envMapIntensity: 1.25 });
  const calMat = new THREE.MeshPhysicalMaterial({ color: '#c41f28', metalness: .2, roughness: .35, clearcoat: 1, clearcoatRoughness: .1 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#1a1e24', metalness: .1, roughness: .02, transparent: true, opacity: .55, envMapIntensity: 1.8, clearcoat: 1, depthWrite: false });
  const chromeMat = new THREE.MeshStandardMaterial({ color: '#e8e8e8', metalness: 1, roughness: .06, envMapIntensity: 1.2 });
  function details(st) {
    const r = (RIMS[st.rim] || RIMS.silver).v; rimMat.color.set(r[0]); rimMat.metalness = r[1]; rimMat.roughness = r[2];
    calMat.color.set(st.cal || '#c41f28');
    const t = (TINTS[st.tint] || TINTS.none).v; glassMat.color.set(t[0]); glassMat.opacity = t[1];
    if (st.chrome) { chromeMat.color.set('#0c0d0f'); chromeMat.metalness = .55; chromeMat.roughness = .22; } else { chromeMat.color.set('#e8e8e8'); chromeMat.metalness = 1; chromeMat.roughness = .06; }
  }

  /* soft contact shadow, rendered once per car from underneath and blurred */
  const shadow = (() => {
    const RT = 512;
    const rtB = new THREE.WebGLRenderTarget(RT, RT);
    const depth = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { uH: { value: .6 } },
      vertexShader: 'varying float vY; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vY = w.y; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform float uH; varying float vY; void main(){ float a = clamp(1.0 - vY / uH, 0.0, 1.0); gl_FragColor = vec4(0.0, 0.0, 0.0, a * a); }' });
    const blur = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uDir; varying vec2 vUv;
void main(){ vec4 s = vec4(0.0); float w[5]; w[0]=0.227027; w[1]=0.1945946; w[2]=0.1216216; w[3]=0.054054; w[4]=0.016216;
 s += texture2D(tDiffuse, vUv) * w[0];
 for (int i = 1; i < 5; i++) { s += texture2D(tDiffuse, vUv + uDir * float(i)) * w[i]; s += texture2D(tDiffuse, vUv - uDir * float(i)) * w[i]; }
 gl_FragColor = s; }` });
    const quad = new FullScreenQuad(blur);
    const mat = new THREE.MeshBasicMaterial({ map: rtB.texture, transparent: true, depthWrite: false, toneMapped: false, color: 0x000000 });
    mat.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', 'vec4 sm = texture2D(map, vMapUv); diffuseColor = vec4(0.0, 0.0, 0.0, sm.a * opacity);'); };
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); plane.rotation.x = -Math.PI / 2; plane.position.y = .004; plane.renderOrder = 1;
    /* each car keeps its own blurred shadow texture, so switching cars is instant */
    function bake(car, box) {
      const rtA = new THREE.WebGLRenderTarget(RT, RT);
      const w = box.max.x - box.min.x + 1.4, l = box.max.z - box.min.z + 1.4, h = box.max.y - box.min.y;
      const cam = new THREE.OrthographicCamera(-w / 2, w / 2, l / 2, -l / 2, 0, h);
      cam.position.set(0, -.001, 0); cam.up.set(0, 0, 1); cam.lookAt(0, 1, 0); cam.updateMatrixWorld();
      depth.uniforms.uH.value = h * .42;
      const tmp = new THREE.Scene(); tmp.add(car); tmp.overrideMaterial = depth;
      const prevT = renderer.getRenderTarget(), prevC = renderer.getClearAlpha(), prevAuto = renderer.autoClear;
      renderer.setRenderTarget(rtA); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(tmp, cam);
      for (const [rad, pass] of [[3, 0], [2, 1]]) {
        blur.uniforms.tDiffuse.value = rtA.texture; blur.uniforms.uDir.value.set(rad / RT, 0); renderer.setRenderTarget(rtB); renderer.clear(); quad.render(renderer);
        blur.uniforms.tDiffuse.value = rtB.texture; blur.uniforms.uDir.value.set(0, rad / RT); renderer.setRenderTarget(rtA); renderer.clear(); quad.render(renderer);
      }
      renderer.setRenderTarget(prevT); renderer.setClearColor(0x000000, prevC); renderer.autoClear = prevAuto;
      tmp.remove(car); tmp.overrideMaterial = null;
      return { tex: rtA.texture, scale: new THREE.Vector3(w, l, 1) };
    }
    function show(entry) { mat.map = entry.sh; mat.opacity = .92; mat.needsUpdate = true; plane.scale.copy(entry.shScale); }
    return { bake, plane, show };
  })();

  /* views: direction from the target; 'spin' views are framed so the car fits at any turn */
  const VIEW = {
    hero:   { d: [-.74, .2, -.64], spin: true, fill: .94 },
    threeq: { d: [-.7, .26, -.68], spin: true, fill: .9 },
    front:  { d: [0, .16, -1], fill: .82 },
    side:   { d: [1, .12, 0], fill: .9 },
    rear:   { d: [0, .2, 1], fill: .82 },
    top:    { d: [.36, .93, .38], spin: true, fill: .9 }
  };
  const base = c => ({ c, f: 'gloss', fl: null, s: 'solid', a1: '#d6343c', a2: '#4092ce', dec: false });
  const M = {};
  const mountEl = { h: $('#hero3d'), s: $('#bay3d') };
  Object.entries(mountEl).forEach(([u, el]) => { if (el) M[u] = { el, view: u === 'h' ? 'hero' : 'threeq', rot: u === 'h' ? -.35 : 0, spin: u === 'h' && !RM, scroll: 0, st: { mode: 'wrap', b: base('#2a2c30'), ppf: 1, cer: 0, rim: 'silver', cal: '#c41f28', tint: 'none', chrome: false } }; });
  let active = null, car = null, carKey = null, bound = null, wipe = null, camTween = null, drag = null, idleAt = 0, inertia = 0, decalTex = null, loading = null;
  const target = new THREE.Vector3(0, .6, 0);
  const cache = {};

  /* framing: a thinned point cloud of the car itself, so every view fills the stage with the car — not its bounding box */
  function cloud(g) {
    const pts = []; g.updateMatrixWorld(true); let total = 0;
    g.traverse(o => { if (o.isMesh && o.geometry.attributes.position) total += o.geometry.attributes.position.count; });
    const step = Math.max(1, Math.floor(total / 2600)), v = new THREE.Vector3();
    g.traverse(o => { if (!o.isMesh || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position; for (let i = 0; i < pa.count; i += step) pts.push(v.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld).toArray()); });
    return pts;
  }
  let pcloud = null;
  function placeCamera(u, snap) {
    const m = M[u]; if (!m || !bound || !pcloud) return;
    const el = m.el, W = el.clientWidth, Ht = el.clientHeight, v = VIEW[m.view];
    if (!W || !Ht) return;
    renderer.setSize(W, Ht, false); camera.aspect = W / Ht; camera.fov = mobile() ? 34 : 30;
    let sx = W / 2, sy = Ht / 2, sw = W, sh = Ht;
    const stage = u === 'h' && $('.hero__stage');
    if (stage) { const st = stage.getBoundingClientRect(), hr = el.getBoundingClientRect(); sw = st.width; sh = st.height; sx = st.left - hr.left + sw / 2; sy = st.top - hr.top + sh / 2; }
    camera.setViewOffset(W, Ht, -(sx - W / 2), -(sy - Ht / 2), W, Ht);
    camera.updateProjectionMatrix();
    const Hc = bound.max.y - bound.min.y;
    target.set(0, Hc * (m.view === 'top' ? .3 : .42), 0);
    const dir = new THREE.Vector3(...v.d).normalize(), f = dir.clone().negate();
    const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(r, f);
    const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), th = tv * camera.aspect;
    const fill = (u === 'h' && mobile()) ? .98 : v.fill, kx = fill * sw / W * th, ky = fill * sh / Ht * tv;
    const spinning = v.spin && (u === 'h' || m.spin);
    const angles = spinning ? [0, .39, .785, 1.18, 1.571, 1.96, 2.356, 2.75, 3.142, 3.53, 3.927, 4.32, 4.712, 5.11, 5.498, 5.89] : [v.spin ? m.rot + m.scroll : 0];
    let D = .5;
    for (const a of angles) {
      const c = Math.cos(a), sn = Math.sin(a);
      for (const p of pcloud) {
        const x = p[0] * c + p[2] * sn - target.x, y = p[1] - target.y, z = -p[0] * sn + p[2] * c - target.z;
        const pa = x * r.x + y * r.y + z * r.z, pb = x * up.x + y * up.y + z * up.z, pc = x * f.x + y * f.y + z * f.z;
        const need = Math.max(Math.abs(pa) / kx, Math.abs(pb) / ky) - pc;
        if (need > D) D = need;
      }
    }
    const to = dir.multiplyScalar(D).add(target);
    if (snap) { camera.position.copy(to); camTween = null; camera.lookAt(target); }
    else camTween = { from: camera.position.clone(), to, t0: performance.now(), ms: 1200, r0: m.rot, r1: v.spin ? m.rot : Math.round(m.rot / (Math.PI * 2)) * Math.PI * 2 };
  }
  function layer(N, b) {
    const f = FIN[b.f] || FIN.gloss;
    U[N ? 'uNew' : 'uOld'].value.set(b.c); U[N ? 'uNA1' : 'uOA1'].value.set(b.a1 || '#d6343c'); U[N ? 'uNA2' : 'uOA2'].value.set(b.a2 || '#4092ce'); U[N ? 'uNFl' : 'uOFl'].value.set(b.fl || b.c);
    U[N ? 'uFNew' : 'uFOld'].value.set(f[0], f[1], f[2], f[3]);
    U[N ? 'uXNew' : 'uXOld'].value.set(b.fl ? 1 : 0, f[4], (SKINS[b.s] || SKINS.solid).id, b.dec ? 1 : 0);
  }
  function oldFromNew() { ['Old', 'OA1', 'OA2', 'OFl'].forEach((k, i) => U['u' + k].value.copy(U['u' + ['New', 'NA1', 'NA2', 'NFl'][i]].value)); U.uFOld.value.copy(U.uFNew.value); U.uXOld.value.copy(U.uXNew.value); }
  function applyState(u) { const s = M[u].st; layer(true, s.b); oldFromNew(); U.uPpf.value = s.ppf; U.uPpfA.value = s.mode === 'ppf' ? 1 : 0; U.uCer.value = s.cer; U.uP.value = -U.uDir.value * 9; U.uA.value = 0; wipe = null; details(s); }
  function wrap(u, b) {
    if (!M[u]) return; M[u].st.b = b;
    if (u !== active || !car) return;
    oldFromNew(); layer(true, b);
    if (RM) { oldFromNew(); return; }
    wipe = { t0: performance.now(), dur: 1600 };
  }
  function setState(u, st) { if (!M[u]) return; Object.assign(M[u].st, st); if (u === active) { details(M[u].st); } }

  /* load (and cache) a car, put it on the table */
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  function prepare(gltf) {
    const g = gltf.scene;
    g.traverse(o => {
      if (!o.isMesh) return;
      const n = (o.material && o.material.name) || '';
      o.frustumCulled = false;
      if (n === 'paint') o.material = bodyMat;
      else if (n === 'rim') { const m = rimMat.clone(); m.map = o.material.map || null; o.material = m; o.userData.rim = true; }
      else if (n === 'caliper') o.material = calMat;
      else if (n === 'glass') o.material = glassMat;
      else if (n === 'chrome') o.material = chromeMat;
      else if (n === 'tyre') { o.material.envMapIntensity = .4; o.material.roughness = Math.max(.75, o.material.roughness); }
      else if (n === 'light_rear') { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#ff1a1a'); o.material.emissiveIntensity = 1.2; }
      else if (n === 'clearlens') { o.material = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: .04, transparent: true, opacity: .16, envMapIntensity: 1.6, clearcoat: 1, depthWrite: false }); }
      else if (n === 'light_front' || n === 'lens') { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#dfe9ff'); o.material.emissiveIntensity = .35; }
      else if (o.material) { o.material.envMapIntensity = Math.max(o.material.envMapIntensity || 1, 1); }
      if (o.material && o.material.transparent) o.renderOrder = 2;
    });
    return g;
  }
  const rimMats = () => { const out = []; if (car) car.traverse(o => { if (o.userData.rim) out.push(o.material); }); return out; };
  const _details = details;
  function detailsAll(st) { _details(st); const r = (RIMS[st.rim] || RIMS.silver).v; rimMats().forEach(m => { m.color.set(r[0]); m.metalness = r[1]; m.roughness = r[2]; }); }

  function setCar(key, cb) {
    const def = CARS[key]; if (!def || !def.ok) return;
    if (carKey === key && car) { cb && cb(); return; }
    carKey = key; H.classList.add('car-loading');
    const use = entry => {
      if (carKey !== key) return;
      if (car) { table.remove(car); table.remove(shadow.plane); }
      car = entry.g; bound = entry.box; pcloud = entry.pts;
      table.add(car); table.add(shadow.plane); shadow.show(entry);
      const b = bound, L = b.max.z - b.min.z, Hc = b.max.y - b.min.y;
      U.uLen.value = L / 2; U.uMidY.value = Hc * .5; U.uTop.value = Hc;
      U.uDecR.value.set(-L * .03, Hc * .44, L * .095, L * .0475);
      if (window.wrDecalScale) window.wrDecalScale();
      H.classList.remove('car-loading'); H.classList.add('is-3d');
      if (active) { applyState(active); detailsAll(M[active].st); placeCamera(active, true); }
      cb && cb();
    };
    if (cache[key]) return use(cache[key]);
    if (loading === key) return;
    loading = key;
    loader.load(def.file, gltf => {
      loading = null;
      const g = prepare(gltf), box = new THREE.Box3().setFromObject(g);
      const sh = shadow.bake(g, box);
      cache[key] = { g, box, sh: sh.tex, shScale: sh.scale, pts: cloud(g) };
      use(cache[key]);
    }, undefined, () => { loading = null; H.classList.remove('car-loading'); if (!car) { H.classList.remove('can3d'); H.classList.add('no3d'); } });
  }

  function activate(u) {
    if (active === u) return;
    active = u;
    if (!u || !car) { renderer.setAnimationLoop(null); return; }
    M[u].el.appendChild(canvas);
    applyState(u); detailsAll(M[u].st); placeCamera(u, true);
    renderer.setAnimationLoop(loop);
  }

  /* drag sideways to spin (vertical swipes still scroll the page) */
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, v: 0 }; canvas.setPointerCapture(e.pointerId); camTween = null; $$('[data-v3]').forEach(b => b.setAttribute('aria-pressed', 'false')); const hint = $('.bay__hint'); if (hint) hint.style.opacity = 0; });
  canvas.addEventListener('pointermove', e => { if (!drag || !active) return; const dx = e.clientX - drag.x; drag.x = e.clientX; drag.v = dx * .009; M[active].rot += drag.v; });
  const endDrag = () => { if (!drag) return; inertia = drag.v; drag = null; idleAt = performance.now(); };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);

  const clock = new THREE.Clock();
  function loop(now) {
    const dt = Math.min(clock.getDelta(), .05), m = M[active];
    U.uTime.value += dt;
    if (!drag) {
      if (Math.abs(inertia) > .0004) { m.rot += inertia; inertia *= .94; }
      else if (m.spin && !camTween && now - idleAt > 1800) m.rot += dt * (Math.PI * 2 / 28);
    }
    if (camTween) {
      const p = Math.min(1, (now - camTween.t0) / camTween.ms), e = 1 - Math.pow(1 - p, 4);
      camera.position.lerpVectors(camTween.from, camTween.to, e); camera.lookAt(target);
      m.rot = camTween.r0 + (camTween.r1 - camTween.r0) * e;
      if (p >= 1) camTween = null;
    }
    table.rotation.y = m.rot + m.scroll;
    if (wipe) {
      const p = Math.min(1, (now - wipe.t0) / wipe.dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      U.uP.value = U.uLen.value * U.uDir.value - U.uDir.value * e * U.uLen.value * 2.1;
      U.uA.value = Math.min(1, Math.sin(Math.PI * p) * 3);
      if (p >= 1) { oldFromNew(); U.uP.value = -U.uDir.value * 9; U.uA.value = 0; wipe = null; }
    }
    const s = m.st;
    U.uPpf.value = s.ppf;
    U.uPpfA.value += ((s.mode === 'ppf' ? 1 : 0) - U.uPpfA.value) * Math.min(1, dt * 6);
    U.uCer.value += (s.cer - U.uCer.value) * Math.min(1, dt * 4);
    table.updateMatrixWorld(); U.uInv.value.copy(table.matrixWorld).invert();
    renderer.render(scene, camera);
  }

  const vis = {};
  function watch() {
    const io = new IntersectionObserver(es => {
      es.forEach(e => { const u = Object.keys(M).find(k => M[k].el === e.target); vis[u] = e.isIntersecting ? e.intersectionRatio : 0; });
      const best = Object.keys(M).filter(k => vis[k] > 0).sort((a, b) => vis[b] - vis[a])[0] || null;
      activate(best);
    }, { threshold: [0, .05, .2, .4, .6, .8, 1] });
    Object.values(M).forEach(m => io.observe(m.el));
  }
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.6 : 2)); if (active) placeCamera(active, true); }, 120); });
  document.addEventListener('visibilitychange', () => { clock.getDelta(); });

  return {
    M, wrap, setState: (u, st) => { if (!M[u]) return; Object.assign(M[u].st, st); if (u === active) detailsAll(M[u].st); },
    setMode: (u, mode, ppf, cer) => { if (!M[u]) return; Object.assign(M[u].st, { mode, ppf, cer }); },
    view: (u, v) => { if (!M[u]) return; M[u].view = v; if (u === active) placeCamera(u, false); },
    spin: (u, on) => { if (M[u]) M[u].spin = on; },
    heroScroll: p => { if (M.h) M.h.scroll = p * Math.PI * .9; },
    setCar, get car() { return carKey; },
    start: key => { setCar(key, () => { if (!active) watch(); }); },
    decal(cv, scale) {
      if (!decalTex) { decalTex = new THREE.CanvasTexture(cv); decalTex.colorSpace = THREE.SRGBColorSpace; decalTex.anisotropy = renderer.capabilities.getMaxAnisotropy(); U.uDec.value = decalTex; }
      decalTex.needsUpdate = true;
      const L = bound ? bound.max.z - bound.min.z : 4.5, hw = L * .135 * (scale || .7); U.uDecR.value.z = hw; U.uDecR.value.w = hw / 2;
    },
    snapshot() { if (!car || active !== 's') return null; if (wipe) { oldFromNew(); wipe = null; U.uA.value = 0; U.uP.value = -U.uDir.value * 9; } renderer.render(scene, camera); return canvas.toDataURL('image/png'); }
  };
})();
window.CAR3D = ENGINE;

/* ════════ HOME: the hero car keeps getting re-wrapped in builds from Wrappi's own jobs ════════ */
(() => {
  const hero = $('.hero'); if (!hero || !$('#hero3d')) return;
  const svgHost = $('#heroCar'); if (svgHost) svgHost.innerHTML = carSVG('h');
  let i = -1, timer = null, on = true;
  const next = () => {
    i = (i + 1) % PRESETS.length; const p = PRESETS[i];
    wrapSVG('h', p.b.c, p.b.f);
    if (ENGINE) ENGINE.wrap('h', { c: p.b.c, f: p.b.f, fl: p.b.fl || null, s: p.b.s || 'solid', a1: p.b.a1 || '#d6343c', a2: p.b.a2 || '#4092ce', dec: false });
    const th = $('#heroThumb'), lb = $('#heroLbl'); if (th) th.src = p.th; if (lb) lb.textContent = `${tx(p.en, p.no)} · ${tx("from a", "fra en")} ${p.car}`;
  };
  window.wrHeroStart = () => { if (timer) return; next(); if (RM) return; timer = setInterval(() => { if (on && !document.hidden) next(); }, 4200); };
  new IntersectionObserver(es => es.forEach(e => on = e.isIntersecting)).observe(hero);
  if (ENGINE) { const go = () => setTimeout(() => ENGINE.start('sports'), 250); document.readyState === 'complete' ? go() : addEventListener('load', go); }
  if (window.wrHeroReady) window.wrHeroStart();
})();

/* ════════ STUDIO PAGE ════════ */
(() => {
  const bay = $('.bay'); if (!bay) return;
  const svgHost = $('#studioCar'); if (svgHost) svgHost.innerHTML = carSVG('s', tx('Preview of the car with the chosen wrap', 'Forhåndsvisning av bilen med valgt folie'));
  const S = { car: 'sedan', mode: 'wrap', preset: 'taycan', film: null, c: '#0fa89c', f: 'chrome', fl: null, s: 'solid', a1: '#d6343c', a2: '#4092ce', dt: '', dc: '#f6f6f4', ds: 70, rim: 'silver', cal: 'red', tint: 'none', chrome: false, ppf: 'front', cer: false };
  let decalImg = null, fBrand = '3m', fFin = 'all', fQuery = '';

  /* incoming: a shared build (#build=…) or a film picked on another page (?film=3m:G13, ?preset=urus, ?car=suv, ?mode=ppf) */
  let FROM_LINK = false;
  (() => {
    const q = new URLSearchParams(location.search);
    if (q.get('car') && CARS[q.get('car')] && CARS[q.get('car')].ok) S.car = q.get('car');
    if (q.get('preset') && PRESETS.some(p => p.k === q.get('preset'))) { const p = PRESETS.find(x => x.k === q.get('preset')); Object.assign(S, { preset: p.k, c: p.b.c, f: p.b.f, fl: p.b.fl || null, s: p.b.s || 'solid' }); FROM_LINK = true; }
    if (q.get('film') && filmBy(q.get('film'))) { const f = filmBy(q.get('film')); Object.assign(S, filmBuild(f), { film: q.get('film'), preset: null }); fBrand = f.brand.k; FROM_LINK = true; }
    if (['wrap', 'skin', 'detail', 'ppf'].includes(q.get('mode'))) { S.mode = q.get('mode'); FROM_LINK = true; }
    if (q.get('ceramic') === '1') { S.cer = true; FROM_LINK = true; }
    const m = location.hash.match(/^#build=([\w-]+)/); if (!m) return;
    try {
      const o = JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')))));
      const ok = { car: v => v in CARS && CARS[v].ok, mode: v => ['wrap', 'skin', 'detail', 'ppf'].includes(v), preset: v => v === null || PRESETS.some(p => p.k === v), film: v => v === null || !!filmBy(v), c: v => HEX.test(v), f: v => v in FIN, fl: v => v === null || HEX.test(v), s: v => v in SKINS, a1: v => HEX.test(v), a2: v => HEX.test(v), dt: v => typeof v === 'string' && v.length <= 22, dc: v => HEX.test(v), ds: v => v >= 40 && v <= 100, rim: v => v in RIMS, cal: v => v in CALS, tint: v => v in TINTS, chrome: v => typeof v === 'boolean', ppf: v => v in PPF, cer: v => typeof v === 'boolean' };
      Object.keys(ok).forEach(k => { if (k in o && ok[k](o[k])) S[k] = o[k]; });
      if (S.film) fBrand = S.film.split(':')[0];
      FROM_LINK = true;
    } catch (e) {}
  })();

  const build = st => ({ c: st.c, f: st.f, fl: st.fl, s: st.s, a1: st.a1, a2: st.a2, dec: !!(st.dt || decalImg) });
  const film = () => filmBy(S.film);
  const colorName = () => { const f = film(); if (f) return `${f.brand.short} ${f.code} ${f.name}`; const p = PRESETS.find(p => p.k === S.preset); if (p) return tx(p.en, p.no); return S.c.toUpperCase(); };
  const finLabel = () => { const f = film(); if (f) return tx(FILMS.finishes[f.fin].en, FILMS.finishes[f.fin].no); const k = Object.keys(FINISH).find(k => k === S.f) || (S.f === 'satinMetal' ? 'satin' : S.f === 'matteMetal' ? 'matte' : 'metallic'); return tx(FINISH[k].en, FINISH[k].no); };
  function buildText() {
    const cer = S.cer ? tx(' + ceramic coating', ' + keramisk coating') : '';
    const carT = `${tx(CARS[S.car].en, CARS[S.car].no)} (${CARS[S.car].model})`;
    if (S.mode === 'ppf') return `PPF ${tx(PPF[S.ppf].en, PPF[S.ppf].no).toLowerCase()}${cer} · ${carT}`;
    const sk = S.s !== 'solid' && !(film() && FILMS.finishes[film().fin].skin) ? ` · ${tx(SKINS[S.s].en, SKINS[S.s].no).toLowerCase()}` : '';
    const fl = S.fl && !film() ? tx(' with colour shift', ' med fargeskift') : '';
    const det = [S.chrome ? 'chrome delete' : '', S.rim !== 'silver' ? tx(RIMS[S.rim].en, RIMS[S.rim].no).toLowerCase() + tx(' wheels', ' felger') : '', S.tint !== 'none' ? tx('tint ', 'vindusfilm ') + TINTS[S.tint].en : ''].filter(Boolean);
    return `${film() || S.preset ? colorName() : finLabel() + ' ' + colorName()}${fl}${sk}${S.dt ? ` · “${S.dt}”` : ''}${det.length ? ' · ' + det.join(', ') : ''}${cer} · ${carT}`;
  }
  function stateLink() {
    const o = {}; ['car', 'mode', 'preset', 'film', 'c', 'f', 'fl', 's', 'a1', 'a2', 'dt', 'dc', 'ds', 'rim', 'cal', 'tint', 'chrome', 'ppf', 'cer'].forEach(k => o[k] = S[k]);
    const enc = btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return location.origin + location.pathname + '#build=' + enc;
  }

  /* door decal: typed text or an uploaded logo, drawn to a canvas for the shader */
  const decalCv = document.createElement('canvas'); decalCv.width = 1024; decalCv.height = 512;
  async function drawDecal() {
    const g = decalCv.getContext('2d'); g.clearRect(0, 0, 1024, 512);
    if (decalImg) { const r = Math.min(1000 / decalImg.width, 500 / decalImg.height), w = decalImg.width * r, h = decalImg.height * r; g.drawImage(decalImg, (1024 - w) / 2, (512 - h) / 2, w, h); }
    else if (S.dt) {
      try { await document.fonts.load('900 120px Archivo'); } catch (e) {}
      let size = 200; g.font = `900 ${size}px Archivo, Arial Black, sans-serif`; if ('fontStretch' in g) g.fontStretch = 'expanded';
      const tw = () => g.measureText(S.dt.toUpperCase()).width;
      while (tw() > 990 && size > 40) { size -= 6; g.font = `900 ${size}px Archivo, Arial Black, sans-serif`; }
      g.fillStyle = S.dc; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(S.dt.toUpperCase(), 512, 262);
    }
    if (ENGINE) ENGINE.decal(decalCv, S.ds / 100);
  }
  window.wrDecalScale = () => { if (S.dt || decalImg) drawDecal(); };

  /* ── UI ── */
  const swatchHTML = (c, fl, label, attrs, pressed) => `<button class="sw" style="--sw:${c}${fl ? `;--fl:${fl}` : ''}" ${attrs} aria-pressed="${pressed}" aria-label="${label}" title="${label}"${fl ? ' data-flip' : ''}></button>`;
  function renderFilms() {
    const br = FILMS.brands.find(b => b.k === fBrand) || FILMS.brands[0];
    $('#filmBrands').innerHTML = FILMS.brands.map(b => `<button class="fb" data-fb="${b.k}" aria-pressed="${b.k === br.k}"><b>${b.name}</b><small>${b.range}</small></button>`).join('');
    const used = [...new Set(br.list.map(r => r[2]))];
    $('#filmFin').innerHTML = `<button class="pick" data-ff="all" aria-pressed="${fFin === 'all'}">${tx('All', 'Alle')} <small>${br.list.length}</small></button>` + Object.entries(FILMS.finishes).filter(([k]) => used.includes(k)).map(([k, v]) => `<button class="pick" data-ff="${k}" aria-pressed="${fFin === k}">${tx(v.en, v.no)}</button>`).join('');
    const q = fQuery.trim().toLowerCase();
    const rows = br.list.filter(r => (fFin === 'all' || r[2] === fFin) && (!q || (r[0] + ' ' + r[1]).toLowerCase().includes(q)));
    $('#filmGrid').innerHTML = !br.list.length
      ? `<p class="film-empty">${tx('The Hexis range is on its way to the site. Ask us for the Hexis colour card on', 'Hexis-utvalget kommer snart på nettsiden. Spør oss om Hexis-fargekartet på')} <a href="${wa(tx('Hi Wrappi! Could I see the Hexis colour card?', 'Hei Wrappi! Kan jeg få se Hexis-fargekartet?'))}" target="_blank" rel="noopener">WhatsApp</a>.</p>`
      : rows.length ? rows.map(r => swatchHTML(r[3], r[4], `${r[1]} · ${r[0]}`, `data-film="${br.k}:${r[0]}"`, S.film === `${br.k}:${r[0]}`)).join('') : `<p class="film-empty">${tx('No colours match.', 'Ingen farger passer.')}</p>`;
    $('#filmCount').textContent = br.list.length ? `${rows.length} / ${br.list.length}` : '';
  }
  function studioUI() {
    $('#carPicks').innerHTML = Object.entries(CARS).map(([k, v]) => `<button class="carpick" data-car="${k}" aria-pressed="${k === S.car}"${v.ok ? '' : ' disabled aria-disabled="true"'}><b>${tx(v.en, v.no)}</b><small>${v.ok ? v.model : tx('Coming soon', 'Kommer snart')}</small></button>`).join('');
    $('#presets').innerHTML = PRESETS.map(p => `<button class="preset" data-p="${p.k}" aria-pressed="${p.k === S.preset}" style="--sw:${p.b.c}"><img src="${p.th}" alt="" loading="lazy" width="120" height="90"><i></i><span>${tx(p.en, p.no)}<small>${p.car}</small></span></button>`).join('');
    $('#finishPicks').innerHTML = Object.entries(FINISH).map(([k, v]) => `<button class="pick" data-f="${k}" aria-pressed="false">${tx(v.en, v.no)}</button>`).join('');
    $('#skins').innerHTML = Object.entries(SKINS).map(([k, v]) => `<button class="skin" data-s="${k}" aria-pressed="false"><em style="--pv:${v.pv}"></em>${tx(v.en, v.no)}</button>`).join('');
    $('#rimPicks').innerHTML = Object.entries(RIMS).map(([k, v]) => `<button class="pick" data-rim="${k}" aria-pressed="false">${tx(v.en, v.no)}</button>`).join('');
    $('#calPicks').innerHTML = Object.entries(CALS).map(([k, v]) => `<button class="pick" data-cal="${k}" aria-pressed="false"><span style="display:inline-block;width:10px;height:10px;margin-right:8px;background:${v.c}"></span>${tx(v.en, v.no)}</button>`).join('');
    $('#tintPicks').innerHTML = Object.entries(TINTS).map(([k, v]) => `<button class="pick" data-tint="${k}" aria-pressed="false">${tx(v.en, v.no)}</button>`).join('');
    $('#ppfPicks').innerHTML = Object.entries(PPF).map(([k, v]) => `<button class="pick" data-pp="${k}" aria-pressed="false">${tx(v.en, v.no)}<small>${v.s === 'ppfFront' ? tx('from NOK ', 'fra NOK ') + nf(12900) : 'NOK ' + nf(30000) + ' – ' + nf(45000)}</small></button>`).join('');
    renderFilms(); renderBay(false);
  }
  const priceOf = (s, size) => s.p === 'size:ppf' ? W8.sizes[size].ppf : s.p === 'size:color' ? W8.sizes[size].color : s.p;
  function buildServices() {
    if (S.mode === 'ppf') return [PPF[S.ppf].s].concat(S.cer ? ['ceramic'] : []);
    const out = [S.f === 'chrome' || S.s !== 'solid' || S.dt || decalImg || S.film ? 'wrap' : 'colorPpf'];
    if (S.chrome) out.push('details'); if (S.tint !== 'none') out.push('tint'); if (S.cer) out.push('ceramic');
    return out;
  }
  function renderBay(paint) {
    ['wrap', 'skin', 'detail', 'ppf'].forEach(k => $('#pane-' + k).hidden = S.mode !== k);
    $$('[data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === S.mode));
    $$('[data-car]').forEach(b => b.setAttribute('aria-pressed', b.dataset.car === S.car));
    $$('[data-p]').forEach(b => b.setAttribute('aria-pressed', b.dataset.p === S.preset));
    $$('[data-f]').forEach(b => b.setAttribute('aria-pressed', !S.film && !S.preset && b.dataset.f === S.f));
    $$('[data-film]').forEach(b => b.setAttribute('aria-pressed', b.dataset.film === S.film));
    $$('[data-s]').forEach(b => b.setAttribute('aria-pressed', b.dataset.s === S.s));
    $$('[data-rim]').forEach(b => b.setAttribute('aria-pressed', b.dataset.rim === S.rim));
    $$('[data-cal]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cal === S.cal));
    $$('[data-tint]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tint === S.tint));
    $$('[data-pp]').forEach(b => b.setAttribute('aria-pressed', b.dataset.pp === S.ppf));
    const fo = $('#flipOff'); if (fo) fo.setAttribute('aria-pressed', !S.fl);
    const fs = $('#flipSw'); if (fs) fs.style.setProperty('--sw', S.fl || '#2a6bff');
    $('#customSw').style.setProperty('--sw', S.c); $('#customPick').value = S.c;
    $('#a1Sw').style.setProperty('--sw', S.a1); $('#a2Sw').style.setProperty('--sw', S.a2); $('#dcSw').style.setProperty('--sw', S.dc);
    $('#a1Pick').value = S.a1; $('#a2Pick').value = S.a2; $('#dcPick').value = S.dc; $('#decalSize').value = S.ds;
    if ($('#decalTxt').value !== S.dt) $('#decalTxt').value = S.dt;
    $('#ctrlAcc').hidden = !SKINS[S.s].acc; $('#a2Pick').closest('.acc').hidden = SKINS[S.s].acc < 2;
    $('#ppfList').innerHTML = PPF[S.ppf].c.map(x => `<li>${tx(x[0], x[1])}</li>`).join('');
    const f = film();
    $('#filmName').innerHTML = f ? `<b>${f.brand.short} · ${f.code}</b> ${f.name}` : (S.preset ? `${tx('From our bay', 'Fra verkstedet')} · <b>${colorName()}</b>` : `${tx('Custom', 'Egen farge')} · <b>${finLabel()} ${S.c.toUpperCase()}</b>`);
    $('#skinName').textContent = tx(SKINS[S.s].en, SKINS[S.s].no);
    $('#chromeSw').setAttribute('aria-checked', S.chrome); $('#ceramicSw').setAttribute('aria-checked', S.cer);
    const sCar = $('#car-s'); if (sCar && paint) wrapSVG('s', S.mode === 'ppf' ? '#17181b' : S.c, S.mode === 'ppf' ? 'gloss' : S.f);
    const txt = buildText();
    $('#bayName').textContent = S.mode === 'ppf' ? `PPF · ${tx(PPF[S.ppf].en, PPF[S.ppf].no)}` : (f ? `${f.brand.short} ${f.code}` : (PRESETS.some(p => p.k === S.preset) ? colorName() : `${finLabel()} · ${colorName()}`));
    $('#bayCar').textContent = `${tx(CARS[S.car].en, CARS[S.car].no)} · ${CARS[S.car].model}`;
    $('#buildTxt').textContent = txt.charAt(0).toUpperCase() + txt.slice(1);
    if (W8.sizes) {
      const svc = buildServices(), size = CARS[S.car].size, sz = W8.sizes[size];
      const priced = svc.map(k => W8.services[k]).filter(s => s.p !== null);
      $('#buildEst').textContent = priced.length ? `${tx('Price list', 'Prisliste')} (${tx(sz.en, sz.no).toLowerCase()}): ${tx('from', 'fra')} ${nok(priced.reduce((a, s) => a + priceOf(s, size), 0))}${priced.length < svc.length ? tx(' + on request', ' + på forespørsel') : ''}` : tx('Price on request — we price wraps after seeing the car', 'Pris på forespørsel — folie prises etter at vi har sett bilen');
    }
    $('#buildWa').href = wa(tx(`Hi Wrappi! I built this on your website: ${txt}.\nSee it: ${stateLink()}\nMy car: \nCould I get a price?`, `Hei Wrappi! Jeg laget dette på nettsiden deres: ${txt}.\nSe det her: ${stateLink()}\nMin bil: \nKan jeg få en pris?`));
    if (ENGINE) {
      ENGINE.setState('s', { mode: S.mode === 'ppf' ? 'ppf' : 'wrap', ppf: S.ppf === 'front' ? 1 : 4, cer: S.cer ? 1 : 0, rim: S.rim, cal: CALS[S.cal].c, tint: S.tint, chrome: S.chrome });
      const key = JSON.stringify(S.mode === 'ppf' ? { p: 1 } : build(S));
      if (paint || key !== renderBay._k) { renderBay._k = key; ENGINE.wrap('s', S.mode === 'ppf' ? { c: '#141518', f: 'gloss', s: 'solid', dec: false } : build(S)); }
    }
  }
  function setMode(m) { const was = S.mode; S.mode = m; renderBay(was !== m && (m === 'ppf' || was === 'ppf')); }

  /* wiring */
  $$('[data-m]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
  $('#carPicks').addEventListener('click', e => { const b = e.target.closest('[data-car]'); if (!b || b.disabled) return; S.car = b.dataset.car; renderBay(false); if (ENGINE) ENGINE.setCar(S.car, () => renderBay(true)); });
  $('#presets').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; const p = PRESETS.find(x => x.k === b.dataset.p); Object.assign(S, { preset: p.k, film: null, c: p.b.c, f: p.b.f, fl: p.b.fl || null, s: p.b.s || 'solid', a1: p.b.a1 || S.a1, a2: p.b.a2 || S.a2 }); if (S.mode === 'ppf') S.mode = 'wrap'; renderBay(true); });
  $('#filmBrands').addEventListener('click', e => { const b = e.target.closest('[data-fb]'); if (!b) return; fBrand = b.dataset.fb; fFin = 'all'; renderFilms(); });
  $('#filmFin').addEventListener('click', e => { const b = e.target.closest('[data-ff]'); if (!b) return; fFin = b.dataset.ff; renderFilms(); });
  let qT; $('#filmSearch').addEventListener('input', e => { clearTimeout(qT); qT = setTimeout(() => { fQuery = e.target.value; renderFilms(); }, 120); });
  $('#filmGrid').addEventListener('click', e => { const b = e.target.closest('[data-film]'); if (!b) return; const f = filmBy(b.dataset.film); Object.assign(S, filmBuild(f), { film: b.dataset.film, preset: null }); if (S.mode === 'ppf') S.mode = 'wrap'; renderBay(true); });
  $('#finishPicks').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; S.f = b.dataset.f; S.preset = null; S.film = null; if (S.s === 'carbon') S.s = 'solid'; renderBay(true); });
  $('#customPick').addEventListener('input', e => { S.c = e.target.value; S.preset = null; S.film = null; if (!(S.f in FINISH)) S.f = 'gloss'; renderBay(true); });
  $('#ctrlFlip').addEventListener('click', e => { if (e.target.closest('#flipOff')) { S.fl = null; S.preset = null; S.film = null; renderBay(true); } });
  $('#flipPick').addEventListener('input', e => { S.fl = e.target.value; S.preset = null; S.film = null; renderBay(true); });
  $('#skins').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; S.s = b.dataset.s; S.preset = null; if (S.film && FILMS.finishes[film().fin].skin) S.film = null; if (S.s === 'carbon' && !['#101113', '#1b1c1f', '#17181b'].includes(S.c)) S.c = '#17181b'; renderBay(true); });
  [['#a1Pick', 'a1'], ['#a2Pick', 'a2']].forEach(([id, k]) => $(id).addEventListener('input', e => { S[k] = e.target.value; S.preset = null; renderBay(true); }));
  $('#dcPick').addEventListener('input', e => { S.dc = e.target.value; renderBay(false); drawDecal(); });
  let dT; $('#decalTxt').addEventListener('input', e => { S.dt = e.target.value.slice(0, 22); decalImg = null; clearTimeout(dT); dT = setTimeout(() => { renderBay(true); drawDecal(); }, 250); });
  $('#decalSize').addEventListener('input', e => { S.ds = +e.target.value; drawDecal(); });
  $('#decalFile').addEventListener('change', e => { const f = e.target.files[0]; if (!f || f.size > 8e6) return; const im = new Image(); im.onload = () => { decalImg = im; S.dt = ''; renderBay(true); drawDecal(); }; im.src = URL.createObjectURL(f); });
  $('#decalClear').addEventListener('click', () => { decalImg = null; S.dt = ''; $('#decalFile').value = ''; renderBay(true); drawDecal(); });
  $('#rimPicks').addEventListener('click', e => { const b = e.target.closest('[data-rim]'); if (b) { S.rim = b.dataset.rim; renderBay(false); } });
  $('#calPicks').addEventListener('click', e => { const b = e.target.closest('[data-cal]'); if (b) { S.cal = b.dataset.cal; renderBay(false); } });
  $('#tintPicks').addEventListener('click', e => { const b = e.target.closest('[data-tint]'); if (b) { S.tint = b.dataset.tint; renderBay(false); } });
  $('#chromeSw').addEventListener('click', () => { S.chrome = !S.chrome; renderBay(false); });
  $('#ppfPicks').addEventListener('click', e => { const b = e.target.closest('[data-pp]'); if (b) { S.ppf = b.dataset.pp; renderBay(false); } });
  $('#ceramicSw').addEventListener('click', () => { S.cer = !S.cer; renderBay(false); });
  $$('[data-v3]').forEach(b => b.addEventListener('click', () => { $$('[data-v3]').forEach(x => x.setAttribute('aria-pressed', x === b)); if (ENGINE) { ENGINE.spin('s', false); ENGINE.view('s', b.dataset.v3); } $('#bay3dSpin').setAttribute('aria-pressed', 'false'); }));
  $('#bay3dSpin').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); if (ENGINE) { ENGINE.spin('s', on); if (on) ENGINE.view('s', 'threeq'); } });
  $('#shareBtn').addEventListener('click', async () => { const link = stateLink(); try { await navigator.clipboard.writeText(link); toast(tx('Link copied — it opens this exact build', 'Lenke kopiert — den åpner akkurat dette bygget')); } catch (e) { prompt(tx('Copy this link', 'Kopier denne lenken'), link); } });
  $('#snapBtn').addEventListener('click', openPoster);

  /* build poster: the visitor's car as a branded image to save or share */
  async function openPoster() {
    const shot = ENGINE ? ENGINE.snapshot() : null;
    const W = 1080, Hh = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; const g = cv.getContext('2d');
    try { await Promise.all([document.fonts.load('900 60px Archivo'), document.fonts.load('400 20px "Geist Mono"')]); } catch (e) {}
    const bg = g.createLinearGradient(0, 0, 0, Hh); bg.addColorStop(0, '#17181b'); bg.addColorStop(.55, '#0f1012'); bg.addColorStop(1, '#0b0c0e'); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
    const fl = g.createRadialGradient(W / 2, 900, 40, W / 2, 900, 620); fl.addColorStop(0, 'rgba(255,255,255,.12)'); fl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = fl; g.fillRect(0, 300, W, 900);
    g.fillStyle = 'rgba(246,246,244,.75)'; [260, 420, 580, 740].forEach(x => g.fillRect(x - 60, 70, 120, 4));
    const logo = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = 'logo.png'; });
    if (logo) { const lw = 300, lh = logo.height * lw / logo.width; g.drawImage(logo, 80, 130, lw, lh); }
    g.fillStyle = '#d6343c'; g.fillRect(80, 210, 220, 4); g.fillStyle = '#4092ce'; g.fillRect(340, 210, 220, 4);
    if (shot) { const im = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = shot; }); const s = Math.min(W / im.width, 640 / im.height), w = im.width * s, h = im.height * s; g.drawImage(im, (W - w) / 2, 270 + (640 - h) / 2, w, h); }
    const ex = t => { if ('fontStretch' in g) g.fontStretch = t; };
    g.fillStyle = '#f6f6f4'; ex('expanded'); g.font = '900 64px Archivo, Arial Black, sans-serif';
    const f = film(), name = (S.mode === 'ppf' ? 'PPF · ' + tx(PPF[S.ppf].en, PPF[S.ppf].no) : f ? f.name : colorName()).toUpperCase();
    let fs = 64; while (g.measureText(name).width > W - 160 && fs > 30) { fs -= 4; g.font = `900 ${fs}px Archivo, Arial Black, sans-serif`; }
    g.fillText(name, 80, 1000);
    ex('normal'); g.font = '400 22px "Geist Mono", ui-monospace, monospace'; g.fillStyle = '#c9cacd';
    const lines = [`${tx(CARS[S.car].en, CARS[S.car].no).toUpperCase()} · ${CARS[S.car].model.toUpperCase()}`];
    if (S.mode !== 'ppf') { lines.push(f ? `${f.brand.name.toUpperCase()} ${f.brand.range.toUpperCase()} · ${f.code}` : `FINISH  ${finLabel().toUpperCase()}${S.fl ? tx(' · COLOUR SHIFT', ' · FARGESKIFT') : ''}`); if (S.s !== 'solid' && !(f && FILMS.finishes[f.fin].skin)) lines.push(`SKIN  ${tx(SKINS[S.s].en, SKINS[S.s].no).toUpperCase()}`); }
    lines.push(`${tx('WHEELS', 'FELGER')}  ${tx(RIMS[S.rim].en, RIMS[S.rim].no).toUpperCase()}${S.tint !== 'none' ? ' · TINT ' + TINTS[S.tint].en : ''}${S.chrome ? ' · CHROME DELETE' : ''}${S.cer ? tx(' · CERAMIC', ' · KERAMISK') : ''}`);
    lines.forEach((l, i) => g.fillText(l, 80, 1050 + i * 34));
    g.fillStyle = 'rgba(246,246,244,.14)'; g.fillRect(80, 1196, W - 160, 1);
    g.fillStyle = '#f6f6f4'; g.font = '400 20px "Geist Mono", ui-monospace, monospace'; g.fillText('WRAPPI · WRAPPING ART DESIGN · DRIVE DIFFERENT', 80, 1238);
    g.fillStyle = '#8b8d92'; g.fillText('STRØMSVEIEN 324, OSLO · +47 462 28 133 · @WRAPPI__', 80, 1274);
    const url = cv.toDataURL('image/png'); $('#posterImg').src = url; $('#posterDl').href = url;
    const sh = $('#posterShare');
    try { const file = new File([await (await fetch(url)).blob()], 'wrappi-build.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { sh.hidden = false; sh.onclick = () => navigator.share({ files: [file], text: stateLink() }).catch(() => {}); } } catch (e) {}
    const m = $('#poster'); m._from = document.activeElement; m.hidden = false; $('#posterX').focus(); if (window.lenis) lenis.stop();
  }
  const closePoster = () => { const m = $('#poster'); if (m.hidden) return; m.hidden = true; if (window.lenis) lenis.start(); if (m._from) m._from.focus(); };
  $('#posterX').addEventListener('click', closePoster);
  $('#poster').addEventListener('click', e => { if (e.target.id === 'poster') closePoster(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closePoster(); });

  studioUI();
  if (FROM_LINK && (S.dt)) drawDecal();
  if (ENGINE) { const go = () => setTimeout(() => ENGINE.start(S.car), 120); document.readyState === 'complete' ? go() : addEventListener('load', go); }
  let painted = false;
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting && !painted) { painted = true; renderBay(true); o.disconnect(); } }), { threshold: .2 }).observe(bay);
})();
