// cover-gen.ts — main cover generation pipeline
//
// Pure functions with no side effects. Takes a CoverInput, returns a
// CoverOutput. The Figma applicator is in figma-apply.ts and consumes
// this output.

import {
  CoverInput, CoverOutput, Template, RGB, HSL,
  BgSpec, IconSpec, TextPalette, ContentElement, BarSpec, BrandEntry, PaletteBand,
} from "./types";
import {
  fnv1a, hslToRgb, hexToRgb, clampPaperRegime,
  textBaseFor, deriveTextPalette, alphaOnWhite,
  iconColorFor, barColorFor, slotToHue,
} from "./color";
import { PALETTE } from "./palette";
import { BRAND_REGISTRY } from "./brand-registry";
import { DOMAIN_TO_SYMBOL, resolveDomain } from "./icon-mapping";
import { lookupPerson, PERSON_REGISTRY } from "./person-registry";
import {
  METADATA_LAYOUT,
  TITLE_STYLE,
  SUBTITLE_STYLE,
  CHIP_STYLE,
  FIGMA_TITLE_LAYOUT,
  FIGMA_SUBTITLE_LAYOUT,
} from "./metadata-layout";

// ================================================================
// Main entry
// ================================================================

/**
 * Pure, deterministic cover generator. Same input → identical output (cacheable).
 * Calls `validatePortrait()` first — throws on bad portrait input (intake guard).
 */
export function generateCover(input: CoverInput): CoverOutput {
  if (input.portrait) validatePortrait(input);

  const band = PALETTE[input.template];
  const brand = getBrand(input.tickers);
  const isPortrait = !!input.portrait;

  // ---- Layer 1: background ----
  const bgHsl: HSL = isPortrait
    ? { H: input.portrait!.portraitH, S: band.S, L: band.L }
    : brand && !brand.mono
      ? brandBgHsl(brand, band)          // alpha-on-white averaged back to HSL
      : hashedBgHsl(input.title, input.tickers, band);

  const bg: BgSpec = isPortrait
    ? withPortraitRender(buildGradient(bgHsl, "portrait"), input.portrait!)
    : brand && !brand.mono
      ? buildBrandBg(brand, band)
      : buildGradient(bgHsl, "hashed");

  // ---- Layer 2: icon ----
  const icon: IconSpec = isPortrait
    ? null
    : brand
      ? buildBrandIcon(input.tickers[0]!, brand, input.template)
      : buildMaterialIcon(
          resolveDomain(input.template, input.title, input.tickers, input.domain) ?? fallbackDomain(input.template),
          input.template,
          bgHsl,
        );

  // ---- Text palette ----
  const text: TextPalette = deriveTextPalette(
    brand && !brand.mono
      ? colorToHsl(brand.color)          // brand override: text derives from brand hue
      : bgHsl,
  );

  // ---- Content (per-archetype) ----
  const content = buildContent(input, bgHsl);

  return {
    bg,
    icon,
    text,
    content,
    meta: buildMetaLayout(),
    debug: {
      hashSlot: !brand && !isPortrait ? hashSlot(input.title, input.tickers) : undefined,
      inferredDomain: !input.domain && !isPortrait && !brand
        ? resolveDomain(input.template, input.title, input.tickers) ?? undefined
        : undefined,
      path: isPortrait ? "portrait" : brand ? "brand" : "default",
    },
  };
}

/** Pack the metadata-layout constants onto the output so production reads from a single shape. */
function buildMetaLayout() {
  return {
    title: {
      maxLines:   METADATA_LAYOUT.title.maxLines,
      fontSize:   METADATA_LAYOUT.title.fontSize,
      lineHeight: METADATA_LAYOUT.title.lineHeight,
      fontWeight: METADATA_LAYOUT.title.fontWeight,
      fontFamily: METADATA_LAYOUT.title.fontFamily,
      style: { ...TITLE_STYLE },
      figma: { ...FIGMA_TITLE_LAYOUT },
    },
    subtitle: {
      maxLines:   METADATA_LAYOUT.subtitle.maxLines,
      fontSize:   METADATA_LAYOUT.subtitle.fontSize,
      lineHeight: METADATA_LAYOUT.subtitle.lineHeight,
      fontWeight: METADATA_LAYOUT.subtitle.fontWeight,
      fontFamily: METADATA_LAYOUT.subtitle.fontFamily,
      height:     METADATA_LAYOUT.subtitle.height,
      style: { ...SUBTITLE_STYLE },
      figma: {
        textAutoResize: FIGMA_SUBTITLE_LAYOUT.textAutoResize,
        maxLines:       FIGMA_SUBTITLE_LAYOUT.maxLines,
        textTruncation: FIGMA_SUBTITLE_LAYOUT.textTruncation,
        lockedHeight:   FIGMA_SUBTITLE_LAYOUT.lockedHeight,
      },
    },
    chip: {
      maxLines:   METADATA_LAYOUT.chip.maxLines,
      fontSize:   METADATA_LAYOUT.chip.fontSize,
      lineHeight: METADATA_LAYOUT.chip.lineHeight,
      fontWeight: METADATA_LAYOUT.chip.fontWeight,
      fontFamily: METADATA_LAYOUT.chip.fontFamily,
      style: { ...CHIP_STYLE },
      figma: {
        textAutoResize: "WIDTH_AND_HEIGHT" as const,
        maxLines: 1,
        textTruncation: "DISABLED" as const,
      },
    },
    author: {
      maxLines:   METADATA_LAYOUT.author.maxLines,
      fontSize:   METADATA_LAYOUT.author.fontSize,
      lineHeight: METADATA_LAYOUT.author.lineHeight,
      fontWeight: METADATA_LAYOUT.author.fontWeight,
      fontFamily: METADATA_LAYOUT.author.fontFamily,
      style: {
        fontSize: METADATA_LAYOUT.author.fontSize,
        lineHeight: `${METADATA_LAYOUT.author.lineHeight}px`,
        fontWeight: METADATA_LAYOUT.author.fontWeight,
        fontFamily: METADATA_LAYOUT.author.fontFamily,
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis" as const,
      },
      figma: {
        textAutoResize: "TRUNCATE" as const,
        maxLines: 1,
        textTruncation: "ENDING" as const,
      },
    },
  };
}

// ================================================================
// Background
// ================================================================

function hashSlot(title: string, tickers: string[]): number {
  const key = `${title}|${tickers.join(",")}`;
  return fnv1a(key) % 12;
}

function hashedBgHsl(title: string, tickers: string[], band: PaletteBand): HSL {
  const slot = hashSlot(title, tickers);
  const H = slotToHue(slot, band.baseH, band.range);
  return clampPaperRegime({ H, S: band.S, L: band.L });
}

function buildGradient(hsl: HSL, path: "hashed" | "portrait"): BgSpec {
  const top = hslToRgb(hsl.H, hsl.S, hsl.L);
  const bot = hslToRgb(
    hsl.H,
    Math.min(hsl.S * 1.25, 0.28),
    Math.max(hsl.L - 0.04, 0.92),
  );
  return { type: "gradient", top, bot, hsl, path };
}

/**
 * Augment a portrait BgSpec with renderer hints (crop directive + filters)
 * so consumers don't re-derive from docs. Read on `output.bg.portraitRender`.
 */
function withPortraitRender(
  bg: BgSpec,
  portrait: { imageHash: string; imageTransform?: number[][]; subjectName?: string },
): BgSpec {
  // Resolve href via PERSON_REGISTRY when the subject is curated. The
  // registry's URL takes priority over the input's imageHash because:
  //   1. The registry is the source of truth for "who is X" — guarantees
  //      the photo IS that person, not a stock photo of someone else
  //   2. The registry includes fallback URLs for resilience
  //   3. Production data may drift; the registry stays canonical
  // Fallback to input.imageHash only when subject isn't in the registry
  // (one-off portraits, novel subjects in flight before adding to registry).
  const personEntry = portrait.subjectName ? lookupPerson(portrait.subjectName) : null;
  const href = personEntry?.imageHref ?? portrait.imageHash;
  const fallbacks = personEntry?.fallbacks;

  return {
    ...bg,
    portraitRender: {
      href,
      ...(fallbacks && fallbacks.length > 0 ? { fallbacks } : {}),
      opacity: 0.18,
      crop: {
        svgPreserveAspectRatio: "xMidYMin slice",
        figmaImageTransform: portrait.imageTransform ?? [[1, 0, 0], [0, 0.62, 0.13]],
        cssBackgroundPosition: "center top",
        cssBackgroundSize: "cover",
      },
      filters: {
        saturation:  -0.55,
        exposure:     0.22,
        contrast:     0.05,
        temperature:  0,
        tint:         0,
        highlights:   0.10,
        shadows:      0.15,
      },
    },
  };
}

/**
 * Brand bg: alpha-on-white at 0.18 (top) and 0.38 (bottom).
 * Result sits at L ≈ 0.95 naturally.
 */
function buildBrandBg(brand: BrandEntry, band: PaletteBand): BgSpec {
  const rgb = colorToRgb(brand.color);
  const top = alphaOnWhite(rgb, 0.18);
  const bot = alphaOnWhite(rgb, 0.38);
  const hsl = colorToHsl(brand.color);
  return { type: "gradient", top, bot, hsl, path: "brand" };
}

function brandBgHsl(brand: BrandEntry, band: PaletteBand): HSL {
  // For text derivation, treat effective bg as at the brand's H, with
  // the general paper-weight S/L (what's actually rendered is close to white).
  const brandHsl = colorToHsl(brand.color);
  return { H: brandHsl.H, S: band.S, L: band.L };
}

// ================================================================
// Icon
// ================================================================

function buildMaterialIcon(domain: string, template: Template, bgHsl: HSL): IconSpec {
  const symbol = DOMAIN_TO_SYMBOL[domain as keyof typeof DOMAIN_TO_SYMBOL] ?? "menu_book";
  const color = iconColorFor(bgHsl);
  const geom = iconGeometryFor(template);
  return {
    kind: "material",
    symbol,
    color,
    // 0.7 — bg-derived watermark, secondary to foreground.
    // Brand logos use calibrated 0.40/0.50 (see buildBrandIcon) — different role.
    opacity: 0.7,
    x: geom.x,
    y: geom.y,
    size: geom.size,
  };
}

function buildBrandIcon(ticker: string, brand: BrandEntry, template: Template): IconSpec {
  const geom = iconGeometryFor(template);
  // Calibration: brand inner vector at 80% of frame (centered), opacity tuned
  // for visual-weight match with bg-derived icons @ 1.0 in the same template.
  //   100×100 brand → inner 80×80 at (10,10), opacity 0.40
  //   64×64  brand → inner 51×51 at (6.4,6.4), opacity 0.50
  const opacity = geom.size === 64 ? 0.50 : 0.40;
  return {
    kind: "brand",
    ticker,
    color: colorToRgb(brand.color),
    opacity,
    x: geom.x,
    y: geom.y,
    size: geom.size,
    logoSvg: brand.logoSvg,
    mono: brand.mono,
  };
}

// ================================================================
// validatePortrait — intake-time guard for portrait covers
// ================================================================

/** Whole-word case-insensitive match list — names hitting these aren't real persons. */
export const GENERIC_PERSONA_KEYWORDS: readonly string[] = [
  "trader", "investor", "quant", "analyst", "manager", "advisor",
  "whale", "shadow", "guru", "wizard", "ninja", "pro", "legend",
  "the ai", "the quant", "the trader", "the investor", "the bull",
  "the bear", "the king", "the queen", "the master",
];

/**
 * Intake guard — throws on orientation / scope / license / hue violation.
 * Pure function; safe to call multiple times.
 */
export function validatePortrait(input: CoverInput): void {
  const p = input.portrait;
  if (!p) return; // not a portrait cover; nothing to validate

  const t = input.title;

  // 1. Orientation — ≥ 3:2 landscape required
  if (typeof p.imageAspectRatio !== "number" || !isFinite(p.imageAspectRatio)) {
    throw new Error(`Portrait "${t}": missing portrait.imageAspectRatio (got ${p.imageAspectRatio}). Required ≥ 1.5.`);
  }
  if (p.imageAspectRatio < 1.5) {
    throw new Error(`Portrait "${t}": source aspect ${p.imageAspectRatio.toFixed(2)} is vertical/square — required ≥ 1.5 (landscape). Find a landscape source or use a non-portrait template.`);
  }

  // 2. Scope — generic-persona detection
  if (typeof p.subjectName !== "string" || p.subjectName.trim().length === 0) {
    throw new Error(`Portrait "${t}": missing portrait.subjectName. Required: specific named real-world public figure (e.g. "Warren Buffett").`);
  }
  const lcSubject = p.subjectName.toLowerCase();
  const matchedKeyword = GENERIC_PERSONA_KEYWORDS.find(
    (kw) => new RegExp(`\\b${kw}\\b`, "i").test(lcSubject),
  );
  if (matchedKeyword) {
    throw new Error(`Portrait "${t}": subjectName "${p.subjectName}" matches generic persona keyword "${matchedKeyword}". Use a non-portrait template with a domain icon.`);
  }

  // 3. License
  if (p.license === "unknown") {
    throw new Error(`Portrait "${t}": license is "unknown". Required: PD / CC0 / CC-BY / CC-BY-SA / official.`);
  }

  // 4. Hue range
  if (typeof p.portraitH !== "number" || !isFinite(p.portraitH) || p.portraitH < 0 || p.portraitH > 360) {
    throw new Error(`Portrait "${t}": portraitH ${p.portraitH} out of [0, 360].`);
  }
}

type IconGeom = { x: number; y: number; size: number };
function iconGeometryFor(template: Template): IconGeom {
  // What-if: frame at (237, 15) intentionally overflows safe-zone top-left.
  // Material Symbols / brand 80%-inset SVGs both have ~5px internal padding,
  // so the *visible* glyph's top-right lands at (296, 20) — exactly at the
  // safe-zone corner. Aligning the FRAME to (232, 28) leaves the visible
  // glyph 5–6 px indented from the corner — the bug the user reported.
  // What-if frame at (240, 12) — visible glyph floats past safe-zone
  // top-right by ~5 px, reading as decisively corner-anchored. Frame
  // right x=304 still inside cover (320).
  if (template === "what-if") return { x: 240, y: 12, size: 64 };
  return { x: 192, y: 22, size: 100 };
}

// ================================================================
// Content per archetype
// ================================================================

function buildContent(input: CoverInput, bgHsl: HSL): ContentElement[] {
  switch (input.template) {
    case "screener":  return buildScreenerContent(input);
    case "thesis":    return buildThesisContent(input);
    case "what-if":   return buildWhatIfContent(input, bgHsl);
    case "general":   return buildGeneralContent(input);
  }
}

function buildScreenerContent(input: CoverInput): ContentElement[] {
  // Caller must provide a contextLabel/leadTicker/peers via the `tickers` array.
  // Convention: tickers[0] = lead, tickers[1..3] = peer chips (up to 3).
  // contextLabel is fabricated here as a placeholder — in production, the caller
  // should pass a pre-built label via input.series (or an extended input type).
  const lead  = input.tickers[0] ?? "";
  const peers = input.tickers.slice(1, 4);
  return [
    { kind: "label",  text: input.series ?? "SCORED · DAILY · 6H", x: 28, y: 24, fontSize: 9, caps: true },
    { kind: "ticker", text: lead, x: 28, y: 48, fontSize: 34 },
    {
      kind: "peer-chips",
      tickers: peers,
      x: 28,
      y: 100,                    // chip top — bottom-anchored, chipBottom = 100+20 = 120 (safe-zone bottom)
      chipHeight: 20,            // taller pill (was 18) — vertical center looks right for Delight metrics
      chipPaddingX: 8,           // L/R padding inside each chip (was ~3 — visually too tight)
      chipGap: 4,
      chipFontSize: 10,
      chipBorderRadius: 4,
      textBaselineY: 110,        // = y + chipHeight/2 — set as `y` on <text dominant-baseline="middle">
    },
  ];
}

function buildThesisContent(input: CoverInput): ContentElement[] {
  // Caller passes today's delta via input.series or an extended input.
  // `anchor` holds the date stamp; `kind` here is repurposed as the delta body.
  return [
    { kind: "label",  text: `TODAY'S DELTA · ${(input.anchor ?? "TBD").toUpperCase()}`, x: 28, y: 24, fontSize: 9, caps: true },
    {
      kind: "delta",
      text: splitDelta(input.kind ?? ""),
      category: (input.series as any) ?? "AMBIGUOUS",
      x: 28, y: 72,              // body cap-top (was conceptually y=44 = stack base; now explicit body y)
      fontSize: 18,
      lineHeight: 22,            // tspan dy for line 2 — keep tight, don't push delta past safe-zone bottom
      categoryX: 28,
      categoryY: 60,             // badge y (was 54 — moved down 6 to sit closer to delta body, gap reduced 18→12)
      categoryFontSize: 10,
      categoryDotSize: 4,
    },
    // Delta body rendered via content composition in figma-apply.ts
  ];
}

/**
 * Insert `\n` at the natural semantic break in a thesis delta string.
 * First-match priority: vs > · > — > : > sign-boundary > mid-space fallback (>25 chars).
 * Returns input unchanged if nothing matches. See SKILL.md §thesis for details.
 */
export function splitDelta(text: string): string {
  if (!text || text.includes("\n")) return text; // already split or empty

  // Priority 1: " vs "
  const vsIdx = text.search(/\s+vs\s+/i);
  if (vsIdx > 0) {
    return text.slice(0, vsIdx) + "\n" + text.slice(vsIdx + 1).replace(/^\s+/, "");
  }

  // Priority 2: " · "  (middle dot / interpunct, U+00B7 — common in editorial copy)
  // " · " is exactly 3 characters; slice(dotIdx + 3) drops separator + both spaces.
  const dotIdx = text.indexOf(" · ");
  if (dotIdx > 0) {
    return text.slice(0, dotIdx) + "\n" + text.slice(dotIdx + 3);
  }

  // Priority 3: " — " (em-dash, U+2014, with surrounding spaces)
  // Drop the em-dash on split — it was a separator, not content. Leaving it
  // on the new line ("— pivot delayed") looks like a typographical hiccup.
  const emIdx = text.indexOf(" — ");
  if (emIdx > 0) {
    return text.slice(0, emIdx) + "\n" + text.slice(emIdx + 3);
  }

  // Priority 4: ":" (break AFTER the colon)
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx < text.length - 1) {
    return text.slice(0, colonIdx + 1) + "\n" + text.slice(colonIdx + 1).replace(/^\s+/, "");
  }

  // Priority 5: signed-number boundary " −" or " +"
  const signIdx = text.search(/\s[−+]/);
  if (signIdx > 0) {
    return text.slice(0, signIdx) + "\n" + text.slice(signIdx + 1);
  }

  // Priority 6 (fallback): split at the whitespace closest to the middle,
  // but only when the string is long enough that single-line rendering
  // would overflow. Catches editorial copy with no priority hook (e.g.
  // "Late long-term debt cycle revisits 1980" — no vs / dot / dash).
  if (text.length > 25) {
    const mid = Math.floor(text.length / 2);
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === " ") {
        const dist = Math.abs(i - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
    }
    if (bestIdx > 0) {
      return text.slice(0, bestIdx) + "\n" + text.slice(bestIdx + 1);
    }
  }

  // No-break fallback: keep as single line.
  return text;
}

function buildWhatIfContent(input: CoverInput, bgHsl: HSL): ContentElement[] {
  // Stub: caller passes verb/number/bars-set via extended input. This base
  // stub just lays out the skeleton.
  const bars: BarSpec[] = [];
  return [
    { kind: "label",    text: input.series ?? "", x: 28, y: 20, fontSize: 9, caps: true },
    { kind: "verb",     text: input.kind ?? "", x: 28, y: 64, fontSize: 9 },        // re-uses caps-small style; authored uppercase
    { kind: "hero-pct", text: input.anchor ?? "", x: 28, y: 80, fontSize: 40 },
    { kind: "bars",     bars, zeroLineY: 112 },
  ];
}

function buildGeneralContent(input: CoverInput): ContentElement[] {
  return [
    { kind: "label",      text: input.kind ?? "", x: 28, y: 24, fontSize: 9, caps: true },
    { kind: "hero-pulse", text: input.anchor ?? "", x: 28, y: 66, fontSize: 28 },   // bottom-grouped with series
    { kind: "series",     text: input.series ?? "", x: 28, y: 106 },
  ];
}

// ================================================================
// Helpers
// ================================================================

function getBrand(tickers: string[]): BrandEntry | null {
  if (tickers.length !== 1) return null;
  return BRAND_REGISTRY[tickers[0]!] ?? null;
}

function fallbackDomain(template: Template): string {
  return template === "general" ? "guide" : "guide";
}

function colorToRgb(c: RGB | string): RGB {
  if (typeof c === "string") return hexToRgb(c);
  return c;
}

function colorToHsl(c: RGB | string): HSL {
  const rgb = colorToRgb(c);
  // Inline rgbToHsl (avoid circular import)
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const L = (max + min) / 2;
  let H = 0, S = 0;
  if (max !== min) {
    const d = max - min;
    S = L > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rgb.r: H = ((rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6 : 0)) * 60; break;
      case rgb.g: H = ((rgb.b - rgb.r) / d + 2) * 60; break;
      case rgb.b: H = ((rgb.r - rgb.g) / d + 4) * 60; break;
    }
  }
  return { H, S, L };
}

// Re-export barColorFor for consumers building their own bars
export { barColorFor };
