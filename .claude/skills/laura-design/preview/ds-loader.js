// Preview helper for cards and UI kits: uses the compiled bundle when present,
// otherwise compiles the component sources in the browser. Not part of the system.
(function () {
  var NAMES = ['Card', 'StatusLabel', 'CallStatus', 'AnswerCard', 'QuoteFact', 'DatedList', 'Checklist', 'FeedItem', 'QuietRow', 'StatLine', 'DoseBars'];
  var EXPORTS = NAMES.concat(['KeyValueRows']);
  function strip(src) { return src.replace(/^import .*$/gm, '').replace(/export function/g, 'function'); }
  function compile(src) { return Babel.transform(src, { presets: ['react'] }).code; }
  window.loadLaura = async function (root) {
    var ok = await fetch(root + '_ds_bundle.js', { method: 'HEAD' }).then(function (r) { return r.ok; }).catch(function () { return false; });
    if (ok) await new Promise(function (r) { var s = document.createElement('script'); s.src = root + '_ds_bundle.js'; s.onload = r; s.onerror = r; document.head.appendChild(s); });
    var ns = null;
    Object.keys(window).some(function (k) { try { var v = window[k]; if (v && typeof v === 'object' && v.AnswerCard && v.FeedItem) { ns = v; return true; } } catch (e) {} return false; });
    if (ns) return ns;
    var parts = await Promise.all(NAMES.map(function (n) { return fetch(root + 'components/core/' + n + '.jsx').then(function (r) { return r.text(); }); }));
    var code = compile(parts.map(strip).join('\n'));
    return new Function('React', code + '\nreturn {' + EXPORTS.join(',') + '};')(React);
  };
  window.loadLauraScreen = async function (path, name, L) {
    var src = await fetch(path).then(function (r) { return r.text(); });
    return new Function('React', 'L', compile(strip(src)) + '\nreturn ' + name + ';')(React, L);
  };
})();
