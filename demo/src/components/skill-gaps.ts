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

// ----- Brand registry slug + fallback symbol (gap A) -----
// Should be on the SKILL's BrandEntry: logoSlug + fallbackSymbol.
// Until then, this map fills in for the tickers we display.
// Mirrors alva-freshman's src/lib/playbook-cover/brand-registry.ts.
export const BRAND_LOGO_SLUG: Record<string, { logoSlug: string; fallbackSymbol: string }> = {
  AAPL:  { logoSlug: 'apple',      fallbackSymbol: 'phone_iphone' },
  AMZN:  { logoSlug: 'amazon',     fallbackSymbol: 'shopping_cart' },
  GOOGL: { logoSlug: 'google',     fallbackSymbol: 'search' },
  META:  { logoSlug: 'meta',       fallbackSymbol: 'groups' },
  MSFT:  { logoSlug: 'microsoft',  fallbackSymbol: 'window' },
  NVDA:  { logoSlug: 'nvidia',     fallbackSymbol: 'memory' },
  TSLA:  { logoSlug: 'tesla',      fallbackSymbol: 'directions_car' },
  AMD:   { logoSlug: 'amd',        fallbackSymbol: 'memory' },
  INTC:  { logoSlug: 'intel',      fallbackSymbol: 'memory' },
  ORCL:  { logoSlug: 'oracle',     fallbackSymbol: 'database' },
  ADBE:  { logoSlug: 'adobe',      fallbackSymbol: 'brush' },
  CRM:   { logoSlug: 'salesforce', fallbackSymbol: 'cloud' },
  NFLX:  { logoSlug: 'netflix',    fallbackSymbol: 'movie' },
  SHOP:  { logoSlug: 'shopify',    fallbackSymbol: 'shopping_bag' },
  COIN:  { logoSlug: 'coinbase',   fallbackSymbol: 'currency_bitcoin' },
  PLTR:  { logoSlug: 'palantir',   fallbackSymbol: 'shield' },
  SNOW:  { logoSlug: 'snowflake',  fallbackSymbol: 'ac_unit' },
  UBER:  { logoSlug: 'uber',       fallbackSymbol: 'local_taxi' },
  ABNB:  { logoSlug: 'airbnb',     fallbackSymbol: 'home' },
  SPOT:  { logoSlug: 'spotify',    fallbackSymbol: 'music_note' },
  BTC:   { logoSlug: 'bitcoin',    fallbackSymbol: 'currency_bitcoin' },
  ETH:   { logoSlug: 'ethereum',   fallbackSymbol: 'currency_bitcoin' },
  SOL:   { logoSlug: 'solana',     fallbackSymbol: 'currency_bitcoin' },
};
