// Build numbered contact sheets of the personal/portfolio photos so they can be
// reviewed quickly (and a stable index -> filename map printed for curation).
//   node scripts/contact-sheet.mjs
import sharp from 'sharp';
import { readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PHOTOS = resolve(ROOT, '..', 'Photos');
const OUT = join(ROOT, 'scripts', '_contact');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

// Personal/portfolio candidates only (exclude named-industry networking, headshots, junk, Mission).
const EXCLUDE = /rate|logo|branding|COI|knighthead|2025\.png|TPBC|Carson|David Wen|Kevin Mayeux|Bryon Holz|Cheryll|Morris|Max and Josh|NAIFA|Networking|pacific_bridge_headshots/i;
const isImg = (f) => /\.(jpe?g|png)$/i.test(f);

const top = readdirSync(PHOTOS).filter((f) => isImg(f) && !EXCLUDE.test(f)).map((f) => ({ rel: f, abs: join(PHOTOS, f) }));
const fur = existsSync(join(PHOTOS, 'Fur Baby'))
  ? readdirSync(join(PHOTOS, 'Fur Baby')).filter(isImg).map((f) => ({ rel: `Fur Baby/${f}`, abs: join(PHOTOS, 'Fur Baby', f) }))
  : [];
const files = [...top, ...fur].sort((a, b) => a.rel.localeCompare(b.rel));

const COLS = 4, ROWS = 4, PER = COLS * ROWS, TILE = 300, PAD = 8, LABEL = 22;
const cellH = TILE + LABEL;

async function tile(f, idx) {
  const img = await sharp(f.abs).rotate().resize(TILE, TILE, { fit: 'cover' }).toBuffer();
  const label = Buffer.from(
    `<svg width="${TILE}" height="${cellH}"><rect width="${TILE}" height="${LABEL}" fill="#2c1f0e"/><text x="6" y="16" font-family="sans-serif" font-size="14" fill="#fff">#${idx} ${f.rel.slice(0, 30)}</text></svg>`
  );
  return sharp({ create: { width: TILE, height: cellH, channels: 4, background: '#fff' } })
    .composite([{ input: img, top: LABEL, left: 0 }, { input: label, top: 0, left: 0 }])
    .png().toBuffer();
}

const map = [];
let sheet = 0;
for (let i = 0; i < files.length; i += PER) {
  const batch = files.slice(i, i + PER);
  const tiles = await Promise.all(batch.map((f, j) => tile(f, i + j)));
  const W = COLS * TILE + (COLS + 1) * PAD;
  const H = ROWS * cellH + (ROWS + 1) * PAD;
  const composites = tiles.map((buf, k) => ({
    input: buf,
    top: PAD + Math.floor(k / COLS) * (cellH + PAD),
    left: PAD + (k % COLS) * (TILE + PAD),
  }));
  const name = `sheet-${String(sheet).padStart(2, '0')}.png`;
  await sharp({ create: { width: W, height: H, channels: 4, background: '#efe7d8' } })
    .composite(composites).png().toFile(join(OUT, name));
  batch.forEach((f, j) => map.push({ idx: i + j, rel: f.rel, sheet: name }));
  console.log(`  ${name}: #${i}–#${i + batch.length - 1}`);
  sheet++;
}
writeFileSync(join(OUT, 'map.json'), JSON.stringify(map, null, 2));
console.log(`\n${files.length} photos, ${sheet} sheets. Map -> scripts/_contact/map.json`);
