// types.ts — shared types for the Alva cover generator
// Pure type declarations; no runtime deps.

export type Template = "screener" | "thesis" | "what-if" | "general";

// Re-export from i18n.ts so callers can import everything from "./types"
export type { Locale, Direction, FontStack, FontConfig, CategoryKey } from "./i18n";
import type { Locale, Direction, FontConfig } from "./i18n";

export type DomainKey =
  // universal
  | "tech" | "software" | "ai" | "crypto"
  // factor
  | "dividend" | "value" | "growth" | "momentum"
  // sector
  | "defense" | "energy" | "renewables" | "biotech" | "healthcare"
  | "retail" | "consumer_staples" | "real_estate" | "banks"
  // macro / policy
  | "fed" | "macro" | "rates" | "fx" | "commodities"
  // what-if specific
  | "trend_up" | "trend_down" | "trend_flat" | "event_study" | "earnings"
  // general-specific
  | "guide" | "weekly" | "review" | "watchlist" | "alerts" | "leaderboard";

export type License = "PD" | "CC0" | "CC-BY" | "CC-BY-SA" | "official" | "unknown";

export type RGB = { r: number; g: number; b: number };   // 0..1
export type HSL = { H: number; S: number; L: number };   // H in 0..360; S,L in 0..1

// ---------- Input ----------

export type PortraitSpec = {
  imageHash: string;          // Figma image hash (returned by figma.createImage()) OR URL for SVG/web renderers
  portraitH: number;          // 0..360, dominant hue of the image
  imageTransform?: number[][]; // optional imageTransform override (default top-anchored vertical slice)
  source:    string;          // attribution URL (stored on the image layer for audit)
  license:   License;
  capturedYear?: number;      // informational — enables recency audit

  /** width / height of source image. Must be ≥ 1.5 (landscape). */
  imageAspectRatio: number;
  /** Specific named public figure (e.g. "Warren Buffett"). Generic personas rejected. */
  subjectName: string;
};

export type CoverInput = {
  template: Template;
  title:    string;
  author:   string;
  tickers:  string[];
  domain?:  DomainKey;
  kind?:    string;
  anchor?:  string;
  series?:  string;
  portrait?: PortraitSpec;
  /** Defaults to "en". Affects category translations, default labels, font stack, splitDelta separators. */
  locale?:  Locale;
};

// ---------- Output ----------

export type BgSpec = {
  type: "gradient";
  top:  RGB;
  bot:  RGB;
  hsl:  HSL;                  // derived; useful for downstream color math
  path: "hashed" | "brand" | "portrait";

  /**
   * Populated only when `path === "portrait"`. Top-anchored crop keeps
   * heads visible (centered crop slices them off on 2.3:1 covers).
   * Production reads these fields directly — never reimplement.
   */
  portraitRender?: {
    href: string;
    fallbacks?: string[];
    opacity: 0.18;
    crop: {
      svgPreserveAspectRatio: "xMidYMin slice";
      figmaImageTransform: number[][];
      cssBackgroundPosition: "center top";
      cssBackgroundSize: "cover";
    };
    filters: {
      saturation:  -0.55;
      exposure:    0.22;
      contrast:    0.05;
      temperature: 0;       // CRITICAL — must be 0 (warm = 遗照)
      tint:        0;
      highlights:  0.10;
      shadows:     0.15;
    };
  };
};

export type IconSpec =
  | {
      kind: "material";
      symbol: string;         // e.g. "memory", "trending_up"
      color:  RGB;
      opacity: number;
      x: number; y: number;
      size: number;
    }
  | {
      kind: "brand";
      ticker: string;
      color:  RGB;
      opacity: number;
      x: number; y: number;
      size: number;
      logoSvg: string;        // relative path under a shared logos/ folder
      mono:   boolean;
    }
  | null;                     // null for portrait covers (image IS the icon layer)

export type TextPalette = {
  base:    RGB;               // the derived textBase
  hero:    RGB;               // base × 0.92 (pre-multiplied for convenience)
  support: RGB;               // base × 0.70
  label:   RGB;               // base × 0.55
};

export type ContentElement =
  | { kind: "label";     text: string; x: number; y: number; fontSize: number; caps: true }
  | { kind: "ticker";    text: string; x: number; y: number; fontSize: number }
  | { kind: "chip";      text: string; x: number; y: number }
  | { kind: "verb";      text: string; x: number; y: number; fontSize: number }
  | { kind: "hero-pct";  text: string; x: number; y: number; fontSize: number }
  | { kind: "hero-pulse";text: string; x: number; y: number; fontSize: number }
  | { kind: "delta-badge"; category: "RISK" | "CATALYST" | "AMBIGUOUS"; x: number; y: number }
  | { kind: "delta-stack"; primary: string; secondary: string | null; x: number; y: number }
  | {
      /**
       * Thesis delta — body text contains `\n` from splitDelta; renderer
       * must map to multi-line `<tspan>` (use `tspanLines()`). Category
       * fields explicit so badge layout is skill-driven, not hardcoded.
       */
      kind: "delta";
      text: string;
      category: "RISK" | "CATALYST" | "AMBIGUOUS";
      x: number; y: number;     // body cap-top
      fontSize: number;
      lineHeight: number;       // tspan dy for line 2+
      categoryX: number;
      categoryY: number;
      categoryFontSize: number;
      categoryDotSize: number;
    }
  | { kind: "series";    text: string; x: number; y: number }
  | { kind: "bars";      bars: BarSpec[]; zeroLineY: number }
  | {
      /**
       * Screener peer-chips row. `x/y` is top-left of the FIRST chip.
       * Renderer computes: chipWidth_i = textWidth(tickers[i]) + chipPaddingX*2,
       * chip_x_i = x + sum(prev widths) + chipGap*i.
       */
      kind: "peer-chips";
      tickers: string[];
      x: number; y: number;
      chipHeight: number;
      chipPaddingX: number;
      chipGap: number;
      chipFontSize: number;
      chipBorderRadius: number;
      /** y for `<text dominant-baseline="middle">` = y + chipHeight/2. */
      textBaselineY: number;
    };

export type BarSpec = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: RGB;
  isPositive: boolean;
};

export type CoverOutput = {
  bg:      BgSpec;
  icon:    IconSpec;
  text:    TextPalette;
  content: ContentElement[];

  /**
   * Metadata-frame layout. Production reads these and spreads — no separate
   * imports, no hardcoded CSS. Each role: raw constants + `style` (CSS-in-JS) + `figma` (TEXT settings).
   */
  meta: {
    title:    MetaTextRole;
    subtitle: MetaTextRole;
    chip:     MetaTextRole;
    author:   MetaTextRole;
  };

  /** Locale resolved by `generateCover` (defaults to "en" when input omits it). */
  locale: Locale;
  /** Reading direction. All currently supported locales are "ltr". */
  direction: Direction;
  /**
   * Font stacks for cover and metadata. Renderer applies as
   * `font-family: "Primary", Fallback1, Fallback2, …` so CJK glyphs fall
   * through correctly when the primary face has no CJK coverage (e.g.
   * Delight / Inter Latin-only).
   */
  fonts: FontConfig;

  // Debug trace for audits — safe to ignore in production rendering
  debug?: {
    hashSlot?: number;
    inferredDomain?: DomainKey;
    path:   "default" | "brand" | "portrait";
  };
};

export type MetaTextRole = {
  maxLines: number;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  fontFamily: string;
  /** Locked render height in px — only on subtitle (keeps grid rows aligned). */
  height?: number;
  /** Spread-ready CSS-in-JS object. Includes `whiteSpace: 'normal'` + line-clamp. */
  style: Record<string, string | number>;
  /** Figma TEXT node settings. */
  figma: {
    textAutoResize: "TRUNCATE" | "WIDTH_AND_HEIGHT" | "HEIGHT" | "NONE";
    maxLines: number;
    textTruncation: "ENDING" | "DISABLED";
    lockedHeight?: number;
  };
};

// ---------- Palette band ----------

export type PaletteBand = {
  baseH: number;    // center hue in degrees
  range: number;    // ±range spread (full range = 2×this)
  S:     number;    // saturation
  L:     number;    // lightness
};

export type Palette = Record<Template, PaletteBand>;

// ---------- Brand registry entry ----------

export type BrandEntry = {
  color:   RGB | string;     // hex string like "#76B900" or RGB
  logoSvg: string;           // path under shared logos/ (or absolute URL)
  mono:    boolean;          // true = pure B/W, skip Layer 1b bg tint
  source:  string;           // attribution URL (primary)
  lastVerified: string;      // ISO date
  /** Alternate URLs tried by `fetchBrandLogo()` on primary failure. Recommend ≥1 per brand. */
  fallbacks?: string[];
};

// ---------- Person registry entry (portrait covers) ----------

export type PersonEntry = {
  name: string;
  /** Wikimedia Commons `Special:FilePath` URL preferred (stable). PD/CC0/CC-BY/CC-BY-SA only. */
  imageHref: string;
  fallbacks?: string[];
  /** 0..360 — dominant hue. */
  portraitH: number;
  /** ≥ 1.5 (landscape). */
  imageAspectRatio: number;
  source: string;
  license: License;
  capturedYear: number;
  lastVerified: string;
};

export type PersonRegistry = Record<string, PersonEntry>;

export type BrandRegistry = Record<string, BrandEntry>;
