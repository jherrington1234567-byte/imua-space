// Client-clean pass for the IMUA book (brief's #1 hard rule).
// Applies the redaction map approved by Joshua to every .js prose file in the book.
// Run against a WORKING COPY first; review the diff before anything enters the repo.
//
//   node scripts/clean-book.mjs <book-dir>
//
// Map decisions (June 18, 2026):
//   KEEP: Holly, Harper, Evelyn, Joshua/Herrington, Tom Platz, Christopher Ward,
//         Bulova, Lafayette, Ty, Phil (Thompson), Stephen (first name), Andy (the friend)
//   DROP surname: Herrington-Vickers -> Herrington
//   Mentor gag: Ryan -> "R.E. Dacted Jr."
//   People -> distinct pseudonyms; client/company/case names -> generic.

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/clean-book.mjs <book-dir>'); process.exit(1); }

// Ordered: multi-word / specific patterns BEFORE single-word ones. Final approved map.
const RULES = [
  // self — drop the public-brand surname ("Herrington-Vickers" / "Herrington Vickers")
  [/Herrington[-\s]+Vickers/g, 'Herrington'],
  [/[-\s]*\bVickers\b/g, ''],

  // --- full names / multi-word identifiers FIRST ---
  [/\bRyan Pinney\b/g, 'R.E. Dacted Jr.'],
  [/\bJay Taras\b/g, 'Dane Maddox'],
  [/\bRobert Chan\b/g, 'Curtis'],
  [/\bStephanie Bearry\b/g, 'Renee'],
  [/\bAxonic International\b/g, 'the fund'],
  [/\bAndy Roy\b/g, 'the Roe case'],          // a case, not the friend "Andy"
  [/\bLeo Wealth\b/g, 'the firm'],
  [/\bPhoenix Life\b/g, 'the carrier'],
  [/\bIdeas\/NAP\b/g, 'the internal team'],
  [/\bIdeas Team\b/g, 'the internal team'],
  [/\bIdea Center\b/g, 'the internal team'],

  // mentor gag (Ryan Pinney handled above; drop any stray surname)
  [/\bRyan\b/g, 'R.E. Dacted Jr.'],
  [/R\.E\. Dacted Jr\.\s+Pinney/g, 'R.E. Dacted Jr.'],
  [/\bPinney\b/g, 'R.E. Dacted Jr.'],

  // --- people -> distinct first-name pseudonyms (case-sensitive; protect public-figure/brand homographs) ---
  [/\bClaire\b/g, 'Nadia'],
  [/\bMarcus\b/g, 'Elias'],
  [/\bDaniel\b/g, 'Owen'],
  [/\bMara\b/g, 'Nina'],
  [/\bKate\b/g, 'Beth'],
  [/\bGraham\b/g, 'Gavin'],
  [/\bJason\b/g, 'Dorian'],
  [/\bEmily\b/g, 'Nora'],
  [/\bRJ\b/g, 'P.J.'],
  [/\bTanja\b/g, 'Petra'],
  [/\bFaith\b/g, 'Hope'],                       // person; lowercase "faith" the concept untouched
  [/\bMatt\b/g, 'Reid'],
  [/\bNathan\b/g, 'Caleb'],
  [/\bTiffany\b/g, 'Robin'],
  [/\bHozumi\b/g, 'Mari'],
  [/\bScott\b/g, 'Wes'],
  [/\bSam\b(?! Altman)/g, 'Drew'],              // keep public figure "Sam Altman"
  [/\bJuan\b/g, 'Mateo'],
  [/\bDeAnn\b/g, 'Lorraine'],
  [/\bKay\b/g, 'June'],
  [/\bMax\b/g, 'Theo'],
  [/\bChristopher\b(?! Ward)/g, 'Cole'],        // keep watch brand "Christopher Ward"
  [/\bJay\b/g, 'Dane'],
  [/\bDoug\b/g, 'Hal'],

  // --- companies / funds / cases -> generic ---
  [/\bTPBC\b/g, 'the firm'],
  [/\bAxonic\b/gi, 'the fund'],
  [/\bSyndicated\b/g, 'the syndicate'],
  [/\bMeridian\b/g, 'the partner firm'],
  [/\bInspira\b/g, 'the partner firm'],
  [/\bTakata\b/gi, 'the Atlas case'],
  [/\bAbacus\b/gi, 'the Beacon deal'],
  [/\bRio\b/g, 'Vista'],                         // "Rio case" -> "Vista case"
  [/\bNAP\b/g, 'the program'],
  [/\bAFA\b/g, 'program'],
  // "Advantage" the company only — NOT the "Benefit, Advantage, Feature" framework
  [/\band Advantage\b/g, 'and the counterparty'],
  [/\b(from|requests from|documentation from) Advantage\b/g, '$1 the counterparty'],

  // --- cosmetic cleanup ---
  [/\bthe the\b/g, 'the'],     // "the Axonic" -> "the the fund"
  [/\bThe the\b/g, 'The'],
  [/\bJr\.\./g, 'Jr.'],
  [/([.!?]\s+)the (firm|fund|partner firm|carrier|counterparty|syndicate|internal team|program)\b/g, '$1The $2'],
  [/("|\\")the (firm|fund|partner firm|carrier|counterparty|syndicate|internal team|program)\b/g, '$1The $2'],
];

const jsFiles = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith('.js') || e.endsWith('.html')) jsFiles.push(p);
  }
})(dir);

const totals = new Map();
for (const file of jsFiles) {
  let text = readFileSync(file, 'utf8');
  let changed = 0;
  for (const [re, rep] of RULES) {
    const matches = text.match(re);
    if (matches) {
      changed += matches.length;
      totals.set(re.source, (totals.get(re.source) ?? 0) + matches.length);
      text = text.replace(re, rep);
    }
  }
  if (changed) { writeFileSync(file, text); console.log(`  ${changed.toString().padStart(3)} edits  ${file}`); }
}

console.log('\nPer-rule totals:');
for (const [src, n] of [...totals.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${n.toString().padStart(3)}  ${src}`);
}
console.log(`\n${jsFiles.length} files scanned.`);
