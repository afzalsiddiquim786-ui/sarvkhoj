// Builds www/ : the app page + every library and OCR language file it needs, so the
// desktop and Android apps work fully OFFLINE (no CDN needed after install).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NM = path.join(ROOT, 'node_modules');
const WWW = path.join(ROOT, 'www');
const V = path.join(WWW, 'vendor');
const strict = process.argv.includes('--strict');
const missing = [];

fs.rmSync(WWW, { recursive: true, force: true });
for (const d of [WWW, V, path.join(V, 'core'), path.join(V, 'lang')]) fs.mkdirSync(d, { recursive: true });

const firstExisting = (cands) => cands.map((c) => path.join(NM, c)).find((p) => fs.existsSync(p));
function vend(target, cands) {
  const src = firstExisting(cands);
  if (!src) { missing.push(target + '  (looked for ' + cands.join(' | ') + ')'); return; }
  fs.copyFileSync(src, path.join(V, target));
  console.log('  vendor/' + target.padEnd(28) + ' <- ' + path.relative(ROOT, src));
}

// 1) App page. The packaged app uses the local vendor/ folder by default (CDN stays as fallback).
let html = fs.readFileSync(path.join(ROOT, 'src', 'SarvKhoj.html'), 'utf8');
const DEF = "approx:'exact',base:'',textLayer:'use',enh:'auto',engine:'auto'}";
if (!html.includes(DEF)) throw new Error('Settings default not found in src/SarvKhoj.html');
html = html.replace(DEF, "approx:'exact',base:'vendor/',textLayer:'use',enh:'auto',engine:'auto'}");
// settings saved by an older build without a library folder must not hide the bundled one
html = html.replace("JSON.parse(localStorage.getItem('vps.settings')||'{}'))};",
  "JSON.parse(localStorage.getItem('vps.settings')||'{}'))};if(!S.settings.base)S.settings.base='vendor/';");
const SW = `<script>if('serviceWorker' in navigator&&location.protocol==='https:'&&!window.Capacitor&&!/Electron/.test(navigator.userAgent))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>\n</body>`;
html = html.replace('</body>', SW);
fs.writeFileSync(path.join(WWW, 'index.html'), html);

// 2) Icons, manifest, service worker (installable web app / PWA)
fs.cpSync(path.join(ROOT, 'src', 'icons'), path.join(WWW, 'icons'), { recursive: true });
for (const f of ['favicon.ico', 'browserconfig.xml']) fs.copyFileSync(path.join(ROOT, 'src', f), path.join(WWW, f));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
fs.writeFileSync(path.join(WWW, 'site.webmanifest'), JSON.stringify({
  name: 'SarvKhoj — सर्वखोज', short_name: 'SarvKhoj', description: pkg.description,
  id: './', start_url: './index.html', scope: './', display: 'standalone',
  background_color: '#16305a', theme_color: '#10233f',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));
fs.writeFileSync(path.join(WWW, 'sw.js'), `/* SarvKhoj offline cache v${pkg.version} */
const C='sarvkhoj-${pkg.version}';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','site.webmanifest','icons/icon-192.png','icons/icon-512.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>hit);return hit||net}))});
`);

// 3) Libraries
console.log('Bundling libraries:');
vend('pdf.min.js', ['pdfjs-dist/build/pdf.min.js']);
vend('pdf.worker.min.js', ['pdfjs-dist/build/pdf.worker.min.js']);
vend('tesseract.min.js', ['tesseract.js/dist/tesseract.min.js']);
vend('worker.min.js', ['tesseract.js/dist/worker.min.js']);
vend('xlsx.full.min.js', ['xlsx/dist/xlsx.full.min.js']);
vend('jszip.min.js', ['jszip/dist/jszip.min.js']);
vend('pako.min.js', ['pako/dist/pako.min.js']);
vend('UTIF.js', ['utif/UTIF.js']);
const coreDir = path.join(NM, 'tesseract.js-core');
if (fs.existsSync(coreDir)) {
  const files = fs.readdirSync(coreDir).filter((f) => /^tesseract-core.*\.(js|wasm)$/.test(f));
  files.forEach((f) => fs.copyFileSync(path.join(coreDir, f), path.join(V, 'core', f)));
  console.log('  vendor/core/                   <- ' + files.length + ' OCR engine files');
  if (!files.length) missing.push('core/ (tesseract.js-core has no engine files)');
} else missing.push('core/ (tesseract.js-core not installed)');

// 4) OCR language data (Hindi + English). Taken from node_modules if present, else downloaded once.
async function lang(code) {
  const out = path.join(V, 'lang', code + '.traineddata.gz');
  const local = firstExisting([`@tesseract.js-data/${code}/4.0.0_best_int/${code}.traineddata.gz`]);
  if (local) { fs.copyFileSync(local, out); console.log('  vendor/lang/' + code + '.traineddata.gz (node_modules)'); return; }
  const urls = [
    `https://cdn.jsdelivr.net/npm/@tesseract.js-data/${code}/4.0.0_best_int/${code}.traineddata.gz`,
    `https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/${code}.traineddata`,
    `https://raw.githubusercontent.com/tesseract-ocr/tessdata/main/${code}.traineddata`
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      let buf = Buffer.from(await r.arrayBuffer());
      if (!(buf[0] === 0x1f && buf[1] === 0x8b)) buf = zlib.gzipSync(buf);
      if (buf.length < 100000) throw new Error('file too small');
      fs.writeFileSync(out, buf);
      console.log('  vendor/lang/' + code + '.traineddata.gz <- ' + u + ' (' + (buf.length / 1048576).toFixed(1) + ' MB)');
      return;
    } catch (e) { console.log('    could not download ' + u + ': ' + e.message); }
  }
  missing.push('lang/' + code + '.traineddata.gz');
}
await lang('hin');
await lang('eng');

// 5) PaddleOCR on-device deep-learning OCR: onnxruntime-web + detection / orientation / English / Hindi models
fs.mkdirSync(path.join(V, 'ort'), { recursive: true });fs.mkdirSync(path.join(V, 'ppocr'), { recursive: true });
const ortDir = path.join(NM, 'onnxruntime-web', 'dist');
if (fs.existsSync(ortDir)) {
  const f = fs.readdirSync(ortDir).filter((x) => x === 'ort.min.js' || /^ort-wasm.*\.(wasm|mjs)$/.test(x));
  f.forEach((x) => fs.copyFileSync(path.join(ortDir, x), path.join(V, 'ort', x)));
  console.log('  vendor/ort/                    <- ' + f.length + ' onnxruntime-web files');
} else missing.push('ort/ (onnxruntime-web not installed)');
async function dl(urls, min) {
  for (const u of urls) { try { const r = await fetch(u, { redirect: 'follow' }); if (!r.ok) throw new Error('HTTP ' + r.status); const b = Buffer.from(await r.arrayBuffer()); if (b.length < (min || 1)) throw new Error('too small'); return { b, u }; } catch (e) { console.log('    could not download ' + u + ': ' + e.message); } }
  return null;
}
const HFX = 'https://huggingface.co/xberg-io/paddleocr-onnx-models/resolve/main/', HFM = 'https://huggingface.co/monkt/paddleocr-onnx/resolve/main/', PPD = 'https://raw.githubusercontent.com/PaddlePaddle/PaddleOCR/main/ppocr/utils/';
async function model(out, urls, min) { const r = await dl(urls, min); if (!r) { missing.push('ppocr/' + out); return false; } fs.writeFileSync(path.join(V, 'ppocr', out), r.b); console.log('  vendor/ppocr/' + out.padEnd(18) + ' <- ' + r.u + ' (' + (r.b.length / 1048576).toFixed(1) + ' MB)'); return true; }
async function pair(code, pairs) { // a recogniser and its own character list must come together
  for (const [m, d] of pairs) { const mb = await dl([m], 100000); if (!mb) continue; const db = await dl([d], 50); if (!db) continue;
    fs.writeFileSync(path.join(V, 'ppocr', code + '.onnx'), mb.b); fs.writeFileSync(path.join(V, 'ppocr', code + '.txt'), db.b);
    console.log('  vendor/ppocr/' + code + '.onnx + ' + code + '.txt <- ' + mb.u + ' (' + (mb.b.length / 1048576).toFixed(1) + ' MB)'); return; }
  missing.push('ppocr/' + code + '.onnx');
}
console.log('Bundling PaddleOCR models:');
await model('det.onnx', [HFX + 'ch_PP-OCRv4_det_infer.onnx', HFM + 'detection/v3/det.onnx'], 500000);
await model('cls.onnx', [HFX + 'ch_ppocr_mobile_v2.0_cls_infer.onnx'], 100000);
await pair('en', [[HFM + 'languages/english/rec.onnx', HFM + 'languages/english/dict.txt'], [HFX + 'en_PP-OCRv4_rec_infer.onnx', PPD + 'en_dict.txt']]);
await pair('hi', [[HFM + 'languages/hindi/rec.onnx', HFM + 'languages/hindi/dict.txt'], [HFM + 'languages/hindi/rec.onnx', PPD + 'dict/devanagari_dict.txt']]);

if (missing.length) {
  console.log('\nNot bundled (the app will load these from the internet instead):\n  - ' + missing.join('\n  - '));
  if (strict) { console.error('\n--strict: failing because files are missing.'); process.exit(1); }
} else console.log('\nwww/ ready — everything bundled for offline use.');
