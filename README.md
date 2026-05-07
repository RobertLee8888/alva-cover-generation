# alva-cover-generation

### 👉 [**Open the live demo →**](https://robertlee8888.github.io/alva-cover-generation/)

All 32 alva.baby playbook covers, rendered live by the skill in this repo. Filter by template (Screener / Thesis / What-If / General).

---

Pure-function skill for generating every Playbook cover in Alva's Explore grid.

```ts
import { generateCover } from "./src/cover-gen";

const cover = generateCover({
  template: "what-if",
  title:    "SPY & Oil After Hormuz Blockade",
  author:   "terrezzaeynon897",
  tickers:  ["SPY", "USO"],
});
// → bg gradient + icon spec + text palette + archetype content + metadata layout
```

One sync call, every rendering rule on the output. No image rebuild, no CDN invalidation, no production-side hardcoded styles. Renders 1:1 across SVG / Figma plugin / CSS / Canvas / Native via the same `CoverOutput` shape.

---

## Why it's worth using

### Real-time, not pre-baked

Covers compute in the browser at render time (<1 ms, pure function). 10k playbook scale: **~$1.50/month CSR vs ~$770/month pre-rendered + CDN**. Data refreshes flow through automatically — no rebuild, no cache invalidation, no stale images.

### Single source of truth for the entire visual system

Every value the renderer needs — bg formula, icon position, font sizes, wrap behavior, portrait crop, metadata title style — comes from `generateCover()`'s output. Production reads `output.bg.portraitRender.crop.svgPreserveAspectRatio`, `output.meta.title.style`, `output.content[i].x` and similar; **no rule duplicated in production code**. Skill upgrade → bundle redeploy → all existing covers re-render under new rules with zero hand-edits.

### Renderer-agnostic, renderer-friendly

Same `CoverOutput` consumes cleanly in five renderers:

| Renderer | Reads | One-line wiring |
| --- | --- | --- |
| SVG `<image>` | `bg.portraitRender.crop.svgPreserveAspectRatio` | `preserveAspectRatio={...}` |
| Figma plugin | `bg.portraitRender.crop.figmaImageTransform` + `meta.title.figma.maxLines` | direct property assignment |
| CSS `background-image` | `bg.portraitRender.crop.cssBackgroundPosition` + `cssBackgroundSize` | inline style spread |
| HTML `<h3>` (metadata title) | `meta.title.style` | `<h3 style={{ ...style }}>` |
| Canvas | `content[i].x/y` + `tspanLines()` helper | manual fillText loop |

### Robustness wired into the rules

- **`validatePortrait()`** — intake guard rejects 5 silent-fail modes (vertical source, generic-persona subject, missing license, hue out of range, empty subject).
- **`fetchWithRetry / fetchWithFallback`** — image fetcher with 3-attempt exponential backoff + cascade through alternate URLs (4xx terminal, 5xx retried).
- **`PERSON_REGISTRY`** — curated Wikimedia-PD source URLs for named public figures; `subjectName` lookup overrides any stale `imageHash` so production data drift can't ship the wrong face.
- **`splitDelta()`** — six-priority semantic break (`vs > · > — > : > sign-boundary > mid-space fallback`) prevents thesis delta from overflowing the cover on any editorial copy.
- **`output.meta.title.style`** ships `WebkitLineClamp: 2` + `whiteSpace: 'normal'`, defeating any prior `nowrap` CSS in production for free.

### Auditable history

- **`SKILL.md`** — current spec, in declarative form. ~500 lines, ~21 KB.
- **`references/anti-patterns.md`** — 14 named failure modes, each with rationale and fix.
- **`references/iteration-log.md`** + **`skills-updates/SUMMARY.md`** — date-stamped changelog with the why-we-changed-it for every value tweak.

Anyone asking "why is X = Y instead of Z" finds the answer in the log, not in someone's memory.

### Lean

| | Lines | Bytes |
| --- | --- | --- |
| SKILL.md | 503 | 21 KB |
| src/ (10 modules) | 2,119 | 81 KB |
| Production package (this repo) | 14 files | **148 KB** |

Zero runtime dependencies (only `fetch`, which is global). TypeScript-strict-friendly. Tree-shakeable.

---

## Install + integrate

```bash
git clone https://github.com/alva-ai/alva-cover-generation.git
# or wire as a workspace package, npm package, or symlinked dependency
```

The minimum production integration is **one import + one call + one read per render path**:

```tsx
import { generateCover } from "@alva/cover-skill";
import { useMemo } from "react";

function PlaybookCard({ playbook }) {
  // 1. Generate — pure & cacheable
  const cover = useMemo(() => generateCover(playbook), [
    playbook.template, playbook.title,
    playbook.tickers.join(","), playbook.kind,
    playbook.anchor, playbook.series,
    playbook.portrait?.subjectName,
  ]);

  // 2. Render — read from output, never hardcode
  return (
    <article>
      <CoverSvg output={cover} />
      <h3 style={{ ...cover.meta.title.style }}>{playbook.title}</h3>
      <p  style={{ ...cover.meta.subtitle.style }}>{playbook.subtitle}</p>
    </article>
  );
}
```

Full integration walkthrough — including data fetching layers, image-resource caching, and refresh edge cases — is in **`INTEGRATION_GUIDE.docx`** (alongside this README).

---

## Public API

| Export | Type | Purpose |
| --- | --- | --- |
| `generateCover(input)` | function | Main entry. Pure, deterministic. Returns `CoverOutput`. |
| `validatePortrait(input)` | function | Intake guard. Throws on orientation / scope / license / hue violations. |
| `splitDelta(text)` | function | Insert `\n` at semantic break for thesis delta. |
| `tspanLines(text, x, lh)` | function | Split content text on `\n` into `Array<{text, x, dy}>` for SVG `<tspan>`. |
| `rgbCss(rgb, opacity?)` | function | `CoverOutput` RGB → `rgb()` / `rgba()` CSS string. |
| `fetchWithRetry(url, policy?)` | function | Single URL with exp backoff, 4xx terminal. |
| `fetchWithFallback(primary, fallbacks[])` | function | Primary + cascade. Returns `{ok, blob, url, fromFallback, attempts}`. |
| `fetchBrandLogo(brand)` / `fetchPersonPortrait(person)` | function | Convenience wrappers. |
| `lookupPerson(name)` | function | Case-insensitive `PERSON_REGISTRY` lookup. |
| `applyCoverToFigma(cover, target)` | function | Figma Plugin API applicator. |
| `tryLoadCoverFont()` | function | Returns true if Delight loadable; false → falls back to Inter. |
| `PERSON_REGISTRY` / `BRAND_REGISTRY` | const | Curated data tables. |
| `GENERIC_PERSONA_KEYWORDS` | const | Persona-rejection vocabulary. |
| `METADATA_LAYOUT` / `TITLE_STYLE` / `SUBTITLE_STYLE` / `CHIP_STYLE` | const | Direct-import alternative to `output.meta.*`. |
| `FIGMA_TITLE_LAYOUT` / `FIGMA_SUBTITLE_LAYOUT` | const | Figma TEXT-node settings. |

`CoverOutput` shape and full `ContentElement` union: `src/types.ts`.

---

## Files

```
alva-cover-generation/
├── README.md                 ← this file
├── SKILL.md                  ← spec (501 lines, 21 KB)
├── INTEGRATION_GUIDE.docx    ← frontend integration walkthrough
├── package.json · tsconfig.json
└── src/
    ├── cover-gen.ts          ← generateCover, splitDelta, validatePortrait, GENERIC_PERSONA_KEYWORDS
    ├── types.ts              ← CoverInput, CoverOutput, BgSpec, IconSpec, ContentElement, MetaTextRole, …
    ├── color.ts              ← FNV-1a, HSL ↔ RGB, textBase, blendHue, alphaOnWhite, iconColorFor
    ├── palette.ts            ← per-template HSL bands
    ├── brand-registry.ts     ← ticker → brand color/logo/fallbacks (67 entries)
    ├── person-registry.ts    ← named persons → Wikimedia URL + fallbacks
    ├── icon-mapping.ts       ← domain → Material Symbol
    ├── metadata-layout.ts    ← title / subtitle / chip / author layout constants
    ├── image-fetcher.ts      ← fetchWithRetry, fetchWithFallback, fetchBrandLogo, fetchPersonPortrait
    ├── svg-helpers.ts        ← tspanLines, rgbCss
    └── figma-apply.ts        ← Figma Plugin API applicator
```

---

## Three-way sync discipline

Every rule change must land in **all three** of:

1. **SKILL** — `SKILL.md` + `references/*.md` + an entry in `skills-updates/.../SUMMARY.md` (changelog).
2. **Figma example cards** — re-apply the rule to the 12 Direction D sample cards (proof the rule renders).
3. **In-canvas spec panel** — `D · 设计规范` panel that designers see during review.

Updating any two without the third = silent drift. Some rules cascade: `bg → text + icon + bar`; `portraitH → bg + textBase`; `card width → cover internals (type-scale)`. Walk the cascade before closing.

---

## Adding things

| Adding | Where |
| --- | --- |
| A new brand | append to `src/brand-registry.ts`; logo SVG into shared assets; sourcing notes in `references/brand-registry.md` |
| A new public figure portrait | append to `src/person-registry.ts` with Wikimedia `Special:FilePath` URL + fallbacks |
| A new domain | append to `src/icon-mapping.ts`; add to template's allow-list; update inference keywords |
| A new template | define palette band + content skeleton + icon override in the relevant `src/` files; add template-specific anti-patterns to `references/anti-patterns.md` |
| A new generic-persona keyword | append to `GENERIC_PERSONA_KEYWORDS` in `src/cover-gen.ts` |

---

## Versioning

Current: **1.0.0** — 2026-04-28

Changelog: `skills-updates/alva-cover-generation/SUMMARY.md` + `references/iteration-log.md`.

---

## License

Alva internal. External questions: legal@alva.xyz.
