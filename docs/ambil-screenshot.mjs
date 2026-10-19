import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5173';
const OUT = new URL('./screenshots', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const r = await fetch(BASE + '/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'demo@meong.test', password: 'meong123' }),
});
const { token } = await r.json();
const petsRes = await fetch(BASE + '/api/pets', { headers: { Authorization: `Bearer ${token}` } });
const { hewan } = await petsRes.json();
const mochi = hewan.find((p) => p.nama === 'Mochi');
const oreo = hewan.find((p) => p.nama === 'Oreo');
if (!mochi || !oreo) throw new Error('seed tidak lengkap');
console.log('mochi:', mochi.id, '| paspor:', mochi.token_publik);

const browser = await chromium.launch();

async function masuk(page) {
  await page.goto(BASE + '/masuk', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.fill('#email-masuk', 'demo@meong.test');
  await page.fill('#sandi-masuk', 'meong123');
  await page.click('button[type=submit]');
  await page.waitForURL('**/beranda', { timeout: 20000 });
  await page.waitForTimeout(1200);
}

async function snap(page, nama) {
  await page.waitForTimeout(950);
  await page.screenshot({ path: `${OUT}/${nama}.png` });
  console.log('snap:', nama);
}

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'id-ID',
});
const p = await mobile.newPage();

await p.goto(BASE + '/masuk', { waitUntil: 'networkidle' });
await snap(p, 'masuk');

await masuk(p);
await snap(p, 'beranda');

await p.goto(BASE + '/hewan', { waitUntil: 'networkidle' });
await snap(p, 'hewan');

await p.goto(BASE + `/hewan/${mochi.id}`, { waitUntil: 'networkidle' });
await snap(p, 'hewan-profil');

await p.getByRole('tab', { name: 'Berat' }).click();
await snap(p, 'hewan-berat');

await p.getByRole('tab', { name: 'Galeri' }).click();
await snap(p, 'hewan-galeri');

await p.getByRole('tab', { name: 'Pengingat' }).click();
await snap(p, 'hewan-tab-pengingat');

await p.getByRole('tab', { name: 'Profil' }).click();
await p.waitForTimeout(700);
await p.getByRole('button', { name: 'Paspor' }).click();
await snap(p, 'hewan-paspor-qr');

await p.goto(BASE + '/pengingat', { waitUntil: 'networkidle' });
await snap(p, 'pengingat');

await p.goto(BASE + '/pengeluaran', { waitUntil: 'networkidle' });
await snap(p, 'pengeluaran');

await p.goto(BASE + '/pengaturan', { waitUntil: 'networkidle' });
await snap(p, 'pengaturan');

const pub = await mobile.newPage();
await pub.goto(`${BASE}/passport/${mochi.token_publik}`, { waitUntil: 'networkidle' });
await snap(pub, 'paspor-publik');
await pub.close();
await mobile.close();

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: 'id-ID',
});
const d = await desktop.newPage();
await masuk(d);
await snap(d, 'desktop-beranda');

await d.goto(BASE + `/hewan/${oreo.id}`, { waitUntil: 'networkidle' });
await snap(d, 'desktop-hewan-detail');

await d.goto(BASE + '/pengeluaran', { waitUntil: 'networkidle' });
await snap(d, 'desktop-pengeluaran');
await desktop.close();

await browser.close();
console.log('SELESAI:', fs.readdirSync(OUT).join(', '));
