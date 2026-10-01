/**
 * Planly — buradan çalıştırılabilen smoke testleri (cihaz gerektirmeyen kısım).
 * Telefon testleri (UI, reklam, mağaza) hâlâ manuel.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
let failed = 0;

function pass(label) {
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  failed += 1;
  console.error(`  ✗ ${label}${detail ? `: ${detail}` : ''}`);
}

function assert(cond, label, detail) {
  if (cond) pass(label);
  else fail(label, detail);
}

function runCmd(name, cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' });
  if (r.status === 0) pass(name);
  else {
    fail(name, (r.stderr || r.stdout || '').trim().slice(0, 200));
  }
}

async function loadSrc(rel) {
  return import(pathToFileURL(path.join(root, rel)).href);
}

function simulateTaskPersistence() {
  const tasks = [
    { id: 't1', title: 'Kalıcılık testi', time: '09:00', dateKey: '2026-09-23', done: false, priority: 'medium', updatedAt: new Date().toISOString() },
    { id: 't2', title: 'Silinecek', time: '10:00', dateKey: '2026-09-23', done: false, priority: 'low', updatedAt: new Date().toISOString() },
  ];
  const afterDelete = tasks.filter((t) => t.id !== 't2');
  const serialized = JSON.stringify(afterDelete);
  const reloaded = JSON.parse(serialized);
  assert(afterDelete.length === 1 && afterDelete[0].id === 't1', 'A — görev silme (mantık)');
  assert(reloaded.length === 1 && reloaded[0].title === 'Kalıcılık testi', 'A — JSON kaydet/yükle (kalıcılık simülasyonu)');
}

async function main() {
  console.log('\nPlanly smoke regression (PC)\n');

  console.log('Kurulum / derleme');
  runCmd('expo-doctor', 'npx', ['expo-doctor']);
  runCmd('i18n:check', 'npm', ['run', 'i18n:check']);

  const exportDir = path.join(root, '.expo-smoke-export');
  const ex = spawnSync('npx', ['expo', 'export', '--platform', 'android', '--output-dir', exportDir], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    timeout: 120000,
  });
  if (ex.status === 0) pass('Android JS bundle export');
  else fail('Android JS bundle export', (ex.stderr || ex.stdout || '').trim().slice(0, 200));

  const exportDirIos = path.join(root, '.expo-smoke-export-ios');
  const exIos = spawnSync('npx', ['expo', 'export', '--platform', 'ios', '--output-dir', exportDirIos], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    timeout: 180000,
  });
  if (exIos.status === 0) pass('iOS JS bundle export');
  else fail('iOS JS bundle export', (exIos.stderr || exIos.stdout || '').trim().slice(0, 200));

  console.log('\nB — günlük hedef / ilerleme');
  const progress = await loadSrc('src/utils/dailyPlanProgress.js');
  const threeTasks = [{ id: '1' }, { id: '2' }, { id: '3' }];
  assert(progress.getCombinedDailyProgress([], 3) === 0, 'B — 0 görev → %0');
  assert(progress.getCombinedDailyProgress(threeTasks, 3) === 100, 'B — 3/3 hedef → %100');
  assert(progress.getCombinedDailyProgress(threeTasks, 5) === 60, 'B — 3/5 hedef → %60');
  assert(progress.isDailyPlanProgressComplete(threeTasks, 3) === true, 'B — plan tamam (3/3)');
  assert(progress.isDailyPlanProgressComplete(threeTasks, 5) === false, 'B — plan tamam değil (3/5)');

  console.log('\nA — görev silme / kalıcılık (simülasyon)');
  simulateTaskPersistence();

  console.log('\nD — bulut / offline (mantık simülasyonu)');
  function lwwTitle(local, remoteRow) {
    const localMs = Date.parse(local.updatedAt || '');
    const remoteMs = Date.parse(remoteRow.updated_at || '');
    return localMs >= remoteMs ? local.title : String(remoteRow.title ?? '');
  }
  assert(
    lwwTitle(
      { title: 'Yerel', updatedAt: '2026-09-23T12:00:00.000Z' },
      { title: 'Sunucu', updated_at: '2026-09-23T10:00:00.000Z' },
    ) === 'Yerel',
    'D — daha yeni yerel kayıt korunur (LWW)',
  );
  let outbox = [{ type: 'upsert', taskId: 'o1' }, { type: 'delete', taskId: 'o2' }];
  outbox = outbox.slice(1);
  assert(outbox.length === 1 && outbox[0].type === 'delete', 'D — outbox sıra (senkron sonrası kuyruk)');

  console.log('\nC — dil dosyaları (TR/EN örnek anahtar)');
  const tr = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/locales/tr.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/locales/en.json'), 'utf8'));
  assert(tr.tabs.home === 'Ana sayfa' && en.tabs.home === 'Home', 'C — TR/EN sekme etiketleri');
  assert(Boolean(tr.settings.languageReloadBody) && Boolean(en.settings.languageReloadBody), 'C — yeni dil metinleri mevcut');

  console.log('\nYapılandırma (F kısmi)');
  const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert(appJson.expo.version === '1.0.6', 'F — app.json version 1.0.6');
  assert(Number(appJson.expo.android.versionCode) >= 9, 'F — Android versionCode tanımlı');
  assert(
    appJson.expo.ios?.bundleIdentifier === 'com.abdullahbekir.DailyscheduleApp',
    'F — iOS bundleIdentifier App Store ile uyumlu',
  );
  assert(Number(appJson.expo.ios?.buildNumber) >= 1, 'F — iOS buildNumber tanımlı');
  assert(fs.existsSync(path.join(root, 'eas.json')), 'F — eas.json mevcut');
  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    assert(/EXPO_PUBLIC_SUPABASE_URL=/.test(env), 'D — .env Supabase URL');
    assert(/EXPO_PUBLIC_SUPABASE_ANON_KEY=/.test(env), 'D — .env Supabase anon key');
    const rcIos = env.match(/^\s*EXPO_PUBLIC_REVENUECAT_IOS_KEY=(.+)$/m);
    const rcIosVal = rcIos?.[1]?.trim();
    if (rcIosVal && rcIosVal !== '' && !rcIosVal.startsWith('#')) {
      pass('F — .env RevenueCat iOS key (App Store abonelik)');
    } else {
      console.log('  ○ F — EXPO_PUBLIC_REVENUECAT_IOS_KEY yok (build olur; Premium iOS’ta kapalı kalır)');
    }
  } else {
    fail('D — .env dosyası', 'bulunamadı (telefonda bulut testi için gerekli)');
  }

  console.log('\nCihaz gerektiren (atlandı — adb boş)');
  console.log('  ○ UI: görev sil, kapat-aç, tema, paywall, reklamlar');
  console.log('  ○ EAS production build / OTA — eas login + cihaz gerekir\n');

  if (failed > 0) {
    console.error(`Sonuç: ${failed} başarısız\n`);
    process.exit(1);
  }
  console.log('Sonuç: PC tarafı smoke testleri geçti.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
