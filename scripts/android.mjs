// Builds the Android app (APK) with Capacitor. Needs: Node 18+, Java 17, Android SDK (ANDROID_HOME).
// GitHub Actions runs this automatically; locally: `npm run android:apk`.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AND = path.join(ROOT, 'android');
const run = (cmd, cwd = ROOT) => { console.log('> ' + cmd); execSync(cmd, { cwd, stdio: 'inherit' }); };

if (!fs.existsSync(AND)) run('npx cap add android');

// launcher icons (normal, round and adaptive) + background colour
fs.cpSync(path.join(ROOT, 'assets', 'android-res'), path.join(AND, 'app', 'src', 'main', 'res'), { recursive: true });

// manifest: camera for "photo" upload, large memory for OCR of big scans
const mf = path.join(AND, 'app', 'src', 'main', 'AndroidManifest.xml');
let x = fs.readFileSync(mf, 'utf8');
if (!x.includes('android.permission.CAMERA')) x = x.replace('<application', '<uses-permission android:name="android.permission.CAMERA" />\n    <application');
if (!x.includes('android:largeHeap')) x = x.replace('<application', '<application\n        android:largeHeap="true"');
fs.writeFileSync(mf, x);

// version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const gradle = path.join(AND, 'app', 'build.gradle');
let g = fs.readFileSync(gradle, 'utf8');
const [ma, mi, pa] = pkg.version.split('.').map((n) => parseInt(n, 10) || 0);
g = g.replace(/versionCode\s+\d+/, 'versionCode ' + (ma * 10000 + mi * 100 + pa)).replace(/versionName\s+"[^"]*"/, 'versionName "' + pkg.version + '"');
fs.writeFileSync(gradle, g);

run('npx cap sync android');
const gw = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
if (process.platform !== 'win32') fs.chmodSync(path.join(AND, 'gradlew'), 0o755);
run(gw + ' assembleDebug --no-daemon', AND);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
const apk = path.join(AND, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const out = path.join(ROOT, 'dist', `SarvKhoj-${pkg.version}-android.apk`);
fs.copyFileSync(apk, out);
console.log('\nAndroid app ready: ' + path.relative(ROOT, out));
