/* Wrappi — boot (runs first, in <head>). Reads the page's settings, flags JS + WebGL support,
   and makes clean links work when the site is opened from disk or a plain local server. */
(function () {
  var html = document.documentElement;
  html.classList.add('js', 'wr-pre');
  setTimeout(function () { html.classList.remove('wr-pre'); }, 2500);

  var cfg = document.getElementById('wr-data');
  try { window.WR = JSON.parse(cfg ? cfg.textContent : '{}'); } catch (e) { window.WR = { lang: 'no', routes: {} }; }

  try {
    var cv = document.createElement('canvas'), nc = navigator.connection;
    if ((cv.getContext('webgl2') || cv.getContext('webgl')) && !(nc && (nc.saveData || /2g/.test(nc.effectiveType || '')))) html.classList.add('can3d');
  } catch (e) {}

  /* links are written clean (ppf, en-ppf, ./). Hosts with clean URLs serve them as they are;
     from disk or a plain local server we add ".html" the moment a link is used. */
  var l = location, h = l.hostname;
  if (!(l.protocol === 'file:' || /\.html$/.test(l.pathname) || !h || /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.)/.test(h))) return;
  function fx(e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-fx')) return;
    a.setAttribute('data-fx', '');
    var v = a.getAttribute('href');
    if (/^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(v)) return;
    var m = v.match(/^([^?#]*)(.*)$/), p = m[1];
    if (!p || /\.[a-z0-9]{2,5}$/i.test(p)) return;
    p = (p === './' || p === '.' || p === '/') ? 'index.html' : p.replace(/\/$/, '') + '.html';
    a.setAttribute('href', p + m[2]);
  }
  ['pointerdown', 'click', 'auxclick', 'focusin', 'contextmenu'].forEach(function (t) { document.addEventListener(t, fx, true); });
})();
