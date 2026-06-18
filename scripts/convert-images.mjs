// Image pipeline for imua.space
// Converts curated source photos → optimized WebP in public/images.
//
//   node scripts/convert-images.mjs            # hero + mission + photog selects
//   node scripts/convert-images.mjs --mdrt DIR # also build the MDRT gallery from a folder of stills
//
// Sources live one level up in the asset library (../Photos, MDRT extracted from MDRT.zip).
// HARD RULES: exclude Mission/1.jpg (watermarked, not Joshua's); keep captions client-clean.

import sharp from 'sharp';
import heicConvert from 'heic-convert';
import { existsSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ASSETS = resolve(ROOT, '..'); // the "Joshua Website Builder" folder
const PHOTOS = join(ASSETS, 'Photos');
const OUT = join(ROOT, 'public', 'images');

const ensure = (p) => { if (!existsSync(p)) mkdirSync(p, { recursive: true }); };

// sharp's Windows build can't decode iOS HEVC-encoded HEIC, so route .heic/.heif
// through heic-convert (pure-JS HEVC decoder) into a JPEG buffer first.
const isHeic = (p) => /\.(heic|heif)$/i.test(p);
async function loadInput(src) {
  if (!isHeic(src)) return src; // sharp reads JPG/PNG directly
  const buffer = await heicConvert({ buffer: readFileSync(src), format: 'JPEG', quality: 0.92 });
  return Buffer.from(buffer);
}

async function toWebp(input, outRel, { width, height, quality = 78, fit = 'cover' } = {}) {
  const out = join(OUT, outRel);
  ensure(dirname(out));
  let img = sharp(input).rotate(); // respect EXIF orientation
  if (width || height) img = img.resize({ width, height, fit, withoutEnlargement: true });
  await img.webp({ quality }).toFile(out);
  console.log(`  ✓ ${outRel}`);
  return true;
}

// hero + mission scroll + becoming + photog — fixed, curated mapping
const FIXED = [
  ['Mission/00000.jpg', 'hero/kyrgyzstan.webp', { width: 1000, height: 1250 }],
  ['Mission/3.jpg', 'mission/chase-plane.webp', { width: 640, height: 420 }],
  ['Mission/5.jpg', 'mission/formation.webp', { width: 640, height: 420 }],
  ['Mission/j.jpg', 'mission/kitchen.webp', { width: 640, height: 420 }],
  ['Mission/0.jpg', 'mission/deployed.webp', { width: 640, height: 420 }],
  ['Mission/000.jpg', 'mission/eighteen.webp', { width: 640, height: 800 }],
  ['Mission/00.jpg', 'mission/blues.webp', { width: 640, height: 420 }],
  ['Mission/5.jpg', 'photog/aviation.webp', { width: 600, height: 750 }],
  ['Fur Baby/Juno 1.jpg', 'photog/juno.webp', { width: 600, height: 750 }],
];

async function buildFixed() {
  console.log('Hero / mission / photog selects:');
  for (const [src, out, opts] of FIXED) {
    const full = join(PHOTOS, src);
    if (!existsSync(full)) { console.warn(`  ⚠ missing source: ${src}`); continue; }
    await toWebp(await loadInput(full), out, opts);
  }
}

// MDRT "Find Yourself" gallery — pass --mdrt <dir> with the extracted stills.
// sharp's HEIC decode depends on the platform build of libheif; if a file fails to
// decode, it's logged and skipped (convert those with an external tool, then re-run).
async function buildMdrt(dir) {
  const srcDir = resolve(dir);
  if (!existsSync(srcDir)) { console.error(`MDRT dir not found: ${srcDir}`); return; }
  console.log(`\nMDRT gallery from ${srcDir}:`);
  ensure(join(OUT, 'mdrt', 'thumb'));
  ensure(join(OUT, 'mdrt', 'full'));

  const files = readdirSync(srcDir)
    .filter((f) => /\.(heic|heif|jpe?g|png)$/i.test(f))
    .sort();

  const manifest = [];
  let done = 0;
  for (const f of files) {
    const id = basename(f, extname(f)).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const src = join(srcDir, f);
    try {
      const input = await loadInput(src); // decode HEIC once, reuse for both sizes
      await toWebp(input, `mdrt/thumb/${id}.webp`, { width: 480, height: 480, quality: 72 });
      await toWebp(input, `mdrt/full/${id}.webp`, { width: 1600, quality: 80, fit: 'inside' });
      // Day from the iOS filename timestamp (YYYYMMDD...), if present.
      const ymd = f.match(/^(\d{4})(\d{2})(\d{2})/);
      manifest.push({
        thumb: `/images/mdrt/thumb/${id}.webp`,
        full: `/images/mdrt/full/${id}.webp`,
        alt: 'MDRT 2026',
        date: ymd ? `${ymd[1]}-${ymd[2]}-${ymd[3]}` : '',
        day: '',      // tag later: "Day 1" / "Day 2"
        session: '',  // tag later: "Main stage" / "The floor" / "After hours"
      });
      console.log(`  (${++done}/${files.length})`);
    } catch (err) {
      console.warn(`  ⚠ skipped ${f}: ${err.message}`);
    }
  }

  // merge into src/data/mdrt.json (keep the filters)
  const dataPath = join(ROOT, 'src', 'data', 'mdrt.json');
  const current = JSON.parse(readFileMaybe(dataPath) ?? '{}');
  const merged = {
    filters: current.filters ?? ['All', 'Day 1', 'Day 2', 'Main stage', 'The floor', 'After hours'],
    images: manifest,
  };
  writeFileSync(dataPath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`\n  ✓ wrote ${manifest.length} images to src/data/mdrt.json`);
}

function readFileMaybe(p) {
  try { return existsSync(p) ? readFileSync(p, 'utf8') : null; } catch { return null; }
}

async function main() {
  ensure(OUT);
  await buildFixed();
  const mIdx = process.argv.indexOf('--mdrt');
  if (mIdx !== -1 && process.argv[mIdx + 1]) {
    await buildMdrt(process.argv[mIdx + 1]);
  } else {
    console.log('\n(MDRT skipped — pass --mdrt <dir> with the extracted 173 stills to build the gallery.)');
  }
  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
