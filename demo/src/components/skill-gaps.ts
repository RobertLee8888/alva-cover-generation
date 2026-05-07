// ⚠️ TEMPORARY — values that should be emitted by the SKILL but aren't yet.
//
// Each entry below is a SKILL gap. When the SKILL exposes the value
// directly (in CoverOutput, ContentElement, BrandEntry, etc.), delete the
// entry here and read from the SKILL output instead.
//
// See README of this demo for the full gap list.

// ----- Cover canonical dimensions (gap C) -----
export const COVER_W = 320;
export const COVER_H = 140;
export const FONT_FAMILY = "'Delight', Inter, sans-serif";

// ----- Delta category colors (gap D) -----
// Should come from cover-gen.ts as CATEGORY_COLORS, attached to each
// delta ContentElement output.
export const CATEGORY_COLORS = {
  RISK:      '#C0392B',
  CATALYST:  '#1F8754',
  AMBIGUOUS: '#9A7B2E',
} as const;

// ----- Per-element typography (gap B) -----
// Each ContentElement should carry its own fontWeight + letterSpacing +
// palette role. Until then we map by `kind` here.
export const TYPOGRAPHY = {
  // Caps labels (small uppercase headers): label, verb, series
  caps:        { fontWeight: 600, letterSpacing: '0.16em', paletteRole: 'label' as const },
  // Body / hero text: ticker, delta body, hero-pulse
  hero:        { fontWeight: 600, letterSpacing: '0',      paletteRole: 'hero'  as const },
  // What-if hero number — slightly tightened tracking
  heroPct:     { fontWeight: 600, letterSpacing: '-0.02em',paletteRole: 'hero'  as const },
  // Peer-chip text
  chipText:    { fontWeight: 600, letterSpacing: '0.10em', paletteRole: 'support' as const },
} as const;

// ----- Peer-chip pill styling (gap B) -----
// Should come from peer-chips ContentElement.
export const CHIP_STYLE = {
  bgRole:      'base' as const,  // chip bg derived from text.base × bgOpacity
  bgOpacity:   0.10,
} as const;

// ----- Bars zero-line + bar opacity (gap B) -----
// Should come from bars ContentElement.
export const BARS_STYLE = {
  zoneX1:      184,
  zoneX2:      292,
  zeroLineColor:   'base' as const,  // text.base
  zeroLineOpacity: 0.15,
  zeroLineStroke:  0.5,
  barOpacity:  0.55,
} as const;

// ✅ Gap A closed: BrandEntry now has `logoSlug` + `fallbackSymbol` and
// IconSpec brand variant exposes them too — read from SKILL output directly.
