# alva-cover-generation

Production-ready skill for generating Alva Explore playbook covers.

## What this is

A self-contained skill package that generates deterministic, brand-coherent
cover designs for Alva's Explore grid. Handles the full pipeline:

- **Input** → `{ template, title, author, tickers, domain?, portrait? }`
- **Output** → a complete `CoverOutput` (bg gradient, icon spec, text palette,
  archetype content) ready to apply to Figma via the Plugin API, or render
  to SVG/PNG via any other renderer.

## Quick start

Read `SKILL.md` end-to-end first. Then:

```ts
import { generateCover, applyCoverToFigma } from "./src/cover-gen";

const spec = generateCover({
  template: "what-if",
  title:    "SPY & Oil After Hormuz Blockade",
  author:   "terrezzaeynon897",
  tickers:  ["SPY", "USO"],
});

// Inside a Figma plugin:
await applyCoverToFigma(spec, {
  card: figma.getNodeByIdAsync("3780:11877"),
  input: { template, title, author, tickers },
});
```

## Files in this skill

- `SKILL.md` — entry point. Covers the full rule system: taxonomy, geometry,
  color system, layer stack, anti-patterns, integration. Read this first.
- `README.md` — this file.
- `src/` — TypeScript implementation, runnable out of the box.
- `references/` — detailed sub-specs (palette, registry, icons, image pipe,
  anti-patterns, iteration log).
- `examples/` — 12 worked samples.

## Integrating into Alva's production system

1. **Import the pure functions.** `src/cover-gen.ts` exports `generateCover()`
   as a pure `(CoverInput) => CoverOutput` function with no side effects. Can
   be used by any renderer: Figma plugin, server-side image gen, client-side
   preview.
2. **For Figma plugin use**, `src/figma-apply.ts` provides the Figma Plugin
   API applicator. Requires 2024+ Plugin API.
3. **For server-side rendering**, consume `CoverOutput` with any SVG/Canvas
   library. The shape is deliberately renderer-agnostic.
4. **Data tables** (`palette.ts`, `brand-registry.ts`, `icon-mapping.ts`)
   are plain TypeScript modules — tree-shakeable and swappable.

## Extending

- **Add a new brand** → append to `src/brand-registry.ts`; place logo SVG in
  a shared assets folder; see `references/brand-registry.md` for sourcing.
- **Add a new domain** → append to `src/icon-mapping.ts`; add domain to its
  template's allowed-list; update the inference keyword dictionary.
- **Add a new template** → define palette band, content skeleton, and icon
  override in the appropriate src/ modules. Update `references/anti-patterns.md`
  for template-specific anti-patterns.
- **Tune a palette band** → edit `src/palette.ts`; run `scripts/palette-audit.ts`
  to check for adjacent-hue collisions (TBD).

## Three-way sync discipline

Every rule change must land in all three of:

1. **SKILL** (this folder's SKILL.md + SUMMARY.md + references/)
2. **Figma example cards** (re-render the rule on the sample deck)
3. **In-canvas spec panel** (the `D · 设计规范` review panel)

Updating any two of three without the third creates silent drift. See
`SKILL.md` §The three-way sync discipline for full rationale.

## Versioning

Current: **1.0.0** — 2026-04-24

Change log: `references/iteration-log.md`.

## License

Alva internal. For external questions contact legal@alva.xyz.
