// dimensions.ts — canonical cover geometry + typography constants.
// Renderers MUST import these instead of hardcoding the literal numbers.

// ---------- Cover canvas ----------

export const COVER_W = 320;
export const COVER_H = 140;

// ---------- Card frame ----------

export const CARD_W_DESIGN = 328;       // baseline (production min)
export const CARD_H_DESIGN = 302;
export const CARD_INSET    = 4;         // margin between card edge and cover edge
export const CARD_RADIUS   = 12;
export const COVER_RADIUS  = 8;

// ---------- Safe zone (foreground content bounds) ----------

export const SAFE_LEFT   = 28;
export const SAFE_RIGHT  = 292;
export const SAFE_TOP    = 20;
export const SAFE_BOTTOM = 120;
export const SAFE_W      = SAFE_RIGHT - SAFE_LEFT;     // 264
export const SAFE_H      = SAFE_BOTTOM - SAFE_TOP;     // 100

// ---------- Distribution-bars zone (what-if only) ----------

export const BARS_LEFT   = 184;
export const BARS_RIGHT  = 292;
export const BARS_W      = BARS_RIGHT - BARS_LEFT;     // 108
export const BAR_GAP     = 3;

// ---------- Responsive grid ----------

export const RESPONSIVE_SMALL = { minCardWidth: 260, maxCardWidth: 340, gap: 12 } as const;
export const RESPONSIVE_LARGE = { minCardWidth: 328, maxCardWidth: 400, gap: 12 } as const;

// ---------- Foreground container (Layer A) ----------

export const FG_X       = 28;
export const FG_Y       = 20;
export const FG_W       = 264;
export const FG_H       = 100;

// ---------- Layer A type-scale floors ----------

export const TYPE_FLOORS = {
  hero:  32,
  verb:  14,
  pulse: 22,
  delta: 14,
  label:  9,
} as const;

// ---------- Cover icon placement ----------

export const DEFAULT_ICON_GEOM = { x: 192, y: 22, size: 100 } as const;
export const WHATIF_ICON_GEOM  = { x: 240, y: 12, size: 64  } as const;
