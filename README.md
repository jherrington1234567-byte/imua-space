# imua.space

The personal-brand site for **Joshua Herrington** — Court of the Table advisor, compulsive
builder, writer. Astro + Markdown, deployed to Netlify. The IMUA book nests inside this
master site; the PPVA demo is a **separate** project (sanitized, synthetic data).

## Two hard rules (govern everything)
1. **Client-clean** — no client/case/partner names or data, anywhere, ever. Feature the
   method and the build, never the client. (Mentor gag: Ryan & Stephen → "R.E. Dacted".)
2. **Data-preservation** — anything from work product is shown only as a sanitized version
   Joshua owns, on synthetic/demo data. Never live company systems or real records.

## Run it
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/  (what Netlify publishes)
npm run images   # regenerate WebP from the asset library (../Photos)
```

## Edit content without code
- **Hero, mission band, credentials, personal cards, nav** → `src/data/site.json`
- **Build Lab cards** → one Markdown file each in `src/content/buildlab/`
- **Essays ("News from the Desk")** → `src/content/essays/*.md` (set `featured: true` to surface on the home page)
- **Section copy tied to specific photos** (mission scroll, photography labels) → the array at the top of the matching component in `src/components/`

## Design system
`src/styles/tokens.css` holds the approved palette: pink + blue pastel section
backgrounds, cream base. **Brown is reserved for the spine (nav/footer) and the book
section only.** Buttons are deep brown. Ported 1:1 from the approved `imua-space-preview.html`.

## Images
`npm run images` converts curated sources from `../Photos` → `public/images/*.webp`.
For the MDRT "Find Yourself" gallery, extract `../MDRT.zip` and run:
```bash
npm run images -- --mdrt path/to/extracted-stills
```
This writes thumbs + full WebP and populates `src/data/mdrt.json`. sharp's HEIC decode is
platform-dependent; any frame that won't decode is logged and skipped (convert it with an
external tool and re-run). **Exclude `Mission/1.jpg`** (watermarked, not Joshua's).

## Deploy (Netlify — Joshua's "Idea Center" team)
`netlify.toml` is set: build `npm run build`, publish `dist`, Node 22. Contact form uses
**Netlify Forms** (registered via `public/__forms.html`). Newsletter is **Substack**
(`substackUrl` in `site.json`). Point `imua.space` at this build once content is approved.

## Status / next steps (per the brief's build sequence)
- [x] v1 scaffold: home page, all 8 sections in approved order, brand tokens, build verified
- [ ] **Systematic client-clean pass** — book (6 vols), PPVA demo, the 5 decks, essays
- [ ] MDRT gallery: convert the 173 stills + tag day/session
- [ ] Stand up the sanitized **PPVA — demo** as a separate Netlify project; link + screenshots
- [ ] Photo curation/retouch from the 173 MDRT + portfolio selects
- [ ] Final logo exports (PNG + vertical lockup) from `brand/` SVGs
- [ ] Verify bio details before publish (ranch location/dates)

**IMUA — move forward.**
