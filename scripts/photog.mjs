// Curate + convert the personal/portfolio photos, best-first, into WebP (thumb + full)
// and write src/data/photography.json for the gallery.
//   node scripts/photog.mjs
import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PHOTOS = resolve(ROOT, '..', 'Photos');
const OUT = join(ROOT, 'public', 'images', 'photog');
mkdirSync(join(OUT, 'thumb'), { recursive: true });
mkdirSync(join(OUT, 'full'), { recursive: true });

// Curated order (best + most personal first). Captions are client-clean; no third-party names.
const PICKS = [
  ['Fur Baby/Juno 1.jpg', 'Juno, off the leash'],
  ['IMG_7908.JPEG', 'Good boy'],
  ['IMG_9136.JPEG', 'New pup'],
  ['edit - mamo-6853.JPEG', 'Lift'],
  ['edit-5431.JPEG', 'Harvest'],
  ['edit - mamo-6907.JPEG', 'Radial'],
  ['evelynphotos-4180-2.JPEG', 'Sun, and a small dog'],
  ['Paris-4837.JPEG', 'Still'],
  ['IMG_1424.JPEG', 'Self-portrait'],
  ['IMG_7928.JPEG', 'Commencement'],
  ['IMG_4328.JPEG', 'Leaves'],
  ['edit - mamo-6766 (1).JPEG', 'Dawn patrol'],
  ['edit - mamo-6892.JPEG', 'Warbird'],
  ['edit-5655.JPEG', 'Far, far away'],
  ['edit-5795.JPEG', 'Send it'],
  ['IMG_1605.PNG', 'Two generations'],
  ['Fur Baby/Juno 3.jpg', 'Trail dog'],
  ['IMG_6471.JPEG', 'Still water'],
  ['DSC_4598.jpg', 'Black tie'],
  ['edit - mamo-6905.JPEG', 'Spitfire'],
  // --- load more below ---
  ['IMG_0836.JPEG', 'Eighteen'],
  ['Fur Baby/Kira 1.jpg', 'Kira rides'],
  ['edit - mamo-6818-2.JPEG', 'Ascend'],
  ['edit-5634.JPEG', 'Rust'],
  ['IMG_9763.JPEG', 'Game day'],
  ['edit-5591.JPEG', 'Castle'],
  ['edit - mamo-6766.JPEG', 'Color in the sky'],
  ['edit - mamo-6931.JPEG', 'On the tarmac'],
  ['edit-5716.JPEG', 'Brass'],
  ['IMG_7930.JPEG', 'Pomp, with dogs'],
  ['edit-5661-2.JPEG', 'Cockpit'],
  ['edit-5712.JPEG', 'Vessel'],
  ['IMG_9766.JPEG', 'Stands'],
  ['edit-5587.JPEG', 'First visit'],
  ['edit - mamo-6887.JPEG', 'Drift'],
  ['Fur Baby/Juno 2.jpg', 'Field'],
  ['DSC_1793.jpg', 'Candid'],
  ['IMG_7572.JPEG', 'Dusk'],
];

const manifest = [];
let i = 0;
for (const [rel, caption] of PICKS) {
  const src = join(PHOTOS, rel);
  if (!existsSync(src)) { console.warn(`  ⚠ missing: ${rel}`); continue; }
  const id = `p${String(++i).padStart(2, '0')}`;
  await sharp(src).rotate().resize(600, 600, { fit: 'cover' }).webp({ quality: 74 }).toFile(join(OUT, 'thumb', `${id}.webp`));
  await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(join(OUT, 'full', `${id}.webp`));
  manifest.push({ thumb: `/images/photog/thumb/${id}.webp`, full: `/images/photog/full/${id}.webp`, caption });
  console.log(`  ✓ ${id}  ${caption}`);
}

writeFileSync(join(ROOT, 'src', 'data', 'photography.json'), JSON.stringify({ images: manifest }, null, 2) + '\n');
console.log(`\n${manifest.length} photos -> src/data/photography.json`);
