// ⚠️ Open SKILL gaps — values the demo can't get from SKILL output yet.
//
// All others (gap A: brand logoSlug + fallbackSymbol; gap B: per-element
// typography + colors; gap C: cover canvas dimensions; gap D: delta
// category colors) are now closed — read directly from SKILL output.
//
// Remaining open gaps:
//
//   1. WHAT-IF DISTRIBUTION BARS — input mechanism missing.
//      `CoverInput` no longer has `whatIfBars: number[]`. The SKILL's
//      buildWhatIfContent always emits `bars: []`. Needs: re-add
//      `whatIfBars?: number[]` to CoverInput, populate in buildWhatIfContent
//      via the existing scale-and-color logic.
//
//   2. THESIS CATEGORY — input mechanism missing / coupled to wrong field.
//      `CoverInput` lacks `category`. SKILL reads `(input.series as any)`
//      to get RISK/CATALYST/AMBIGUOUS, which conflicts with `series`'s real
//      role (caps label text). All thesis cards therefore fall back to
//      AMBIGUOUS. Needs: add `category?: "RISK"|"CATALYST"|"AMBIGUOUS"`
//      to CoverInput, read from there in buildThesisContent.
//
//   3. DELTA CATEGORY LOCALIZED LABEL — minor.
//      Delta element exposes the canonical key (RISK/CATALYST/AMBIGUOUS)
//      but not the localized text. Renderer currently calls
//      localizeCategory(el.category, cover.locale) — fine but ideally the
//      SKILL pre-resolves it on the element (e.g. `categoryLabel: string`).
