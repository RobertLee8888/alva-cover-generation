# SKILL gaps 修复对照 — 给 code 团队

最新 commit：`be6d3e3` (2026-04-28)
之前在 `demo/src/components/skill-gaps.ts` 里的 8 条 gap **全部已在 SKILL 内解决**。这份文档逐条对照：每个 gap 在 SKILL 哪个文件/字段、demo 端要改什么、要删什么。

---

## 0. 上手最快路径

```bash
cd ~/Desktop/alva-cover-generation   # 或者 git pull 最新
git log --oneline | head -5
```

确认能看到 `be6d3e3 Consolidate design tokens into dimensions.ts (canonical home)`。如果没看到，**先 pull**——这是导致以为"还没改"的最常见原因。

---

## 1. 状态总览（8 条 gap）

| # | 来源 | 类别 | SKILL 端状态 | demo 端动作 |
|---|---|---|---|---|
| A1 | `BrandEntry` add `logoSlug` + `fallbackSymbol` | 类型 | ✅ `src/types.ts` | 改 import |
| A2 | `brand-registry.ts` 给 67 个 entry 填满 | 数据 | ✅ `src/brand-registry.ts` | 删手工 ticker→logo 映射 |
| A3 | `IconSpec.brand` add `fallbackSymbol` | 类型 | ✅ `src/types.ts` | 删硬编码 `"memory"` fallback |
| B1 | `ContentElement` add `fontWeight` / `letterSpacing` / `paletteRole` | 类型 + 输出 | ✅ `src/types.ts` + `src/cover-gen.ts` | 删 `TYPOGRAPHY` 表，render 从字段读 |
| B2 | `delta` add `bodyColor` + `categoryColor` + 字重等 | 类型 + 输出 | ✅ `src/types.ts` + `src/cover-gen.ts` | 删 `CATEGORY_COLORS` 表 |
| B3 | `peer-chips` add `chipBg` + `chipTextColor` + 字重等 | 类型 + 输出 | ✅ `src/types.ts` + `src/cover-gen.ts` | 删 `CHIP_STYLE` 表 |
| B4 | `bars` add `zeroLine` + `barOpacity` | 类型 + 输出 | ✅ `src/types.ts` + `src/cover-gen.ts` | 删 `BARS_STYLE` 表 |
| C1 | `dimensions.ts` + `FONT_FAMILY` | 常量 | ✅ `src/dimensions.ts` | 改 import |
| D  | `delta` 的 `CATEGORY_COLORS` | 常量 | ✅ `src/dimensions.ts` | 同 B2，删 demo 端的表 |

每条都带 SKILL 字段路径 + demo 改动示例，下面逐项展开。

---

## 2. A 类（brand 相关）

### A1 — `BrandEntry.logoSlug` + `fallbackSymbol`

**SKILL 在哪：** `src/types.ts`，`BrandEntry` 上加了两个字段：

```ts
export type BrandEntry = {
  color:    RGB | string;
  logoSvg:  string;             // 旧字段保留
  logoSlug?:        string;     // ← NEW: simpleicons.org slug
  fallbackSymbol?:  string;     // ← NEW: Material Symbol on fetch fail
  mono:     boolean;
  source:   string;
  lastVerified: string;
  fallbacks?: string[];
};
```

**demo 端做什么：**

```ts
// 之前：手工映射表
const TICKER_TO_SLUG = { AAPL: "apple", MSFT: "microsoft", ... };

// 之后：直接读 SKILL 里的字段
import { BRAND_REGISTRY } from "@alva/cover-skill";
const slug = BRAND_REGISTRY[ticker].logoSlug;          // 67 个 entry 都已填
const fallbackIcon = BRAND_REGISTRY[ticker].fallbackSymbol;
```

### A2 — 67 个 brand entry 填满

**SKILL 在哪：** `src/brand-registry.ts`。所有 entry 都在原行末尾追加了 `logoSlug` + `fallbackSymbol`：

```ts
AAPL: { color: "#000000", logoSvg: "AAPL.svg", mono: true, source: "...", lastVerified: "...",
        logoSlug: "apple",  fallbackSymbol: "smartphone" },
NVDA: { ..., logoSlug: "nvidia",  fallbackSymbol: "memory" },
TSLA: { ..., logoSlug: "tesla",   fallbackSymbol: "directions_car" },
JPM:  { ..., logoSlug: "jpmorganchase", fallbackSymbol: "account_balance" },
KO:   { ..., logoSlug: "coca-cola",     fallbackSymbol: "local_drink" },
// ... 全部 67 个
```

**demo 端做什么：** 删掉 `skill-gaps.ts` 里的 `TICKER_TO_SLUG` / `TICKER_TO_FALLBACK` 表（如果有）。

### A3 — `IconSpec.brand` 变体加 `fallbackSymbol`

**SKILL 在哪：** `src/types.ts`，`IconSpec` 联合类型的 `kind: "brand"` 分支：

```ts
{
  kind: "brand";
  ticker: string;
  color:  RGB;
  opacity: number;
  x: number; y: number;
  size: number;
  logoSvg: string;
  logoSlug: string;          // ← NEW（必有）
  fallbackSymbol: string;    // ← NEW（必有，从 BrandEntry 透传或 ticker.toLowerCase）
  mono: boolean;
}
```

`generateCover()` 已经在 `cover-gen.ts:buildBrandIcon` 里把 `BrandEntry.logoSlug` / `fallbackSymbol` 透传到输出。

**demo 端做什么：**

```tsx
// 之前
<Icon symbol={ticker === "AAPL" ? "smartphone" : "memory"} ... />

// 之后
{output.icon?.kind === "brand" ? (
  <BrandLogo slug={output.icon.logoSlug}
             onError={() => <Icon symbol={output.icon.fallbackSymbol} />} />
) : output.icon?.kind === "material" ? (
  <Icon symbol={output.icon.symbol} />
) : null}
```

---

## 3. B 类（ContentElement 样式）

**核心规则**：每个 text-bearing ContentElement 现在带完整样式信息，render 不要再查任何外部表。每个元素的字段：

```ts
type TextStyleFields = {
  fontSize: number;          // 9 / 10 / 18 / 28 / 34 / 40
  fontWeight: number;        // 400 / 500 / 600 / 700 (用 FONT_WEIGHTS 常量)
  letterSpacing: number;     // em 单位；caps tracked = 0.16，普通 = 0
  paletteRole: "hero" | "support" | "label" | "base";   // 取 output.text[paletteRole] 当 fill
};
```

### B1 — label / ticker / verb / hero-pct / hero-pulse / series

**SKILL 在哪：** 上面这五种 `ContentElement.kind` 现在都带 `TextStyleFields`。看 `src/types.ts` 的联合类型；具体值在 `cover-gen.ts` 各 builder 里已经填。

**demo 端做什么：**

```tsx
// 之前 — 自己查 TYPOGRAPHY 表
const TYPOGRAPHY = {
  label: { weight: 600, tracking: 0.16, color: "label" },
  ticker: { weight: 600, tracking: 0, color: "hero" },
  ...
};
const style = TYPOGRAPHY[c.kind];
<text fontWeight={style.weight} letterSpacing={`${style.tracking}em`}
      fill={textColors[style.color]}>...</text>

// 之后 — 字段直接在元素上
<text fontSize={c.fontSize}
      fontWeight={c.fontWeight}
      letterSpacing={`${c.letterSpacing}em`}
      fill={rgbCss(output.text[c.paletteRole])}>
  {c.text}
</text>
```

`rgbCss` 是 `src/svg-helpers.ts` 里的辅助。

### B2 — thesis delta（body + category 样式）

**SKILL 在哪：** `delta` ContentElement 字段（`src/types.ts`，`cover-gen.ts:buildThesisContent`）：

```ts
{
  kind: "delta";
  text: string;                  // splitDelta 已插入 \n
  category: "RISK" | "CATALYST" | "AMBIGUOUS";
  x, y: number;                  // body cap-top
  fontSize: number;              // 18
  lineHeight: number;            // 22 (tspan dy)
  fontWeight: number;            // 600
  letterSpacing: number;         // 0
  bodyColor: RGB;                // ← NEW: 已 resolve（textBase @ hero opacity）
  categoryX, categoryY: number;
  categoryFontSize: number;      // 10
  categoryFontWeight: number;    // 600
  categoryLetterSpacing: number; // 0.16 caps
  categoryDotSize: number;       // 4
  categoryColor: RGB;            // ← NEW: 已从 CATEGORY_COLORS[category] resolve
}
```

**demo 端做什么：**

```tsx
// 之前
const COLOR = CATEGORY_COLORS[delta.category];   // demo 自己的表
<circle fill={COLOR} ... />
<text fontWeight={600} fill={textColors.hero}>{delta.text}</text>

// 之后
<text fontSize={delta.fontSize}
      fontWeight={delta.fontWeight}
      fill={rgbCss(delta.bodyColor)}>
  {tspanLines(delta.text, delta.x, delta.lineHeight).map((l, i) =>
    <tspan key={i} x={l.x} dy={l.dy}>{l.text}</tspan>)}
</text>
<circle cx={delta.categoryX} cy={delta.categoryY}
        r={delta.categoryDotSize / 2}
        fill={rgbCss(delta.categoryColor)} />
<text fontSize={delta.categoryFontSize}
      fontWeight={delta.categoryFontWeight}
      letterSpacing={`${delta.categoryLetterSpacing}em`}
      fill={rgbCss(delta.categoryColor)}>
  {/* category 文本内容 — 用 localizeCategory(delta.category, output.locale) */}
</text>
```

### B3 — peer-chips（pill 背景 + 文字色）

**SKILL 在哪：** `peer-chips` ContentElement 字段：

```ts
{
  kind: "peer-chips";
  tickers: string[];
  x, y: number;
  chipHeight: number;            // 20
  chipPaddingX: number;          // 8
  chipGap: number;               // 4
  chipFontSize: number;          // 10
  chipFontWeight: number;        // 600 (NEW)
  chipLetterSpacing: number;     // 0.04 (NEW)
  chipBorderRadius: number;      // 4
  chipBg: { color: RGB; opacity: number };  // ← NEW: textBase @ 0.10
  chipTextColor: RGB;                       // ← NEW: textBase @ 0.70 (support)
  textBaselineY: number;
}
```

**demo 端做什么：**

```tsx
// 之前 — 用自己的 CHIP_STYLE 表
const bg = CHIP_STYLE.bg;
const fg = CHIP_STYLE.fg;

// 之后
<rect x={chipX} y={c.y} width={chipW} height={c.chipHeight}
      rx={c.chipBorderRadius}
      fill={rgbCss(c.chipBg.color, c.chipBg.opacity)} />
<text x={chipX + chipW/2} y={c.textBaselineY}
      textAnchor="middle" dominantBaseline="middle"
      fontSize={c.chipFontSize}
      fontWeight={c.chipFontWeight}
      letterSpacing={`${c.chipLetterSpacing}em`}
      fill={rgbCss(c.chipTextColor)}>
  {ticker}
</text>
```

### B4 — bars（zero-line 样式 + barOpacity）

**SKILL 在哪：** `bars` ContentElement 字段：

```ts
{
  kind: "bars";
  bars: BarSpec[];
  zeroLineY: number;
  barOpacity: number;            // ← NEW: 0.55
  zeroLine: {                    // ← NEW
    x1: number;                  // 184
    x2: number;                  // 292
    color: RGB;                  // textBase
    opacity: number;             // 0.15
    strokeWidth: number;         // 1
  };
}
```

**demo 端做什么：**

```tsx
// 之前
const ZERO_LINE_COLOR = "rgba(0,0,0,0.15)";
<line stroke={ZERO_LINE_COLOR} ... />

// 之后
<line x1={bars.zeroLine.x1} x2={bars.zeroLine.x2}
      y1={bars.zeroLineY} y2={bars.zeroLineY}
      stroke={rgbCss(bars.zeroLine.color, bars.zeroLine.opacity)}
      strokeWidth={bars.zeroLine.strokeWidth} />
{bars.bars.map((b, i) => (
  <rect key={i} x={b.x} y={b.y} width={b.width} height={b.height}
        fill={rgbCss(b.color, bars.barOpacity)} />
))}
```

---

## 4. C 类（dimensions + FONT_FAMILY）

### C1 — 几何常量 + FONT_FAMILY 字符串

**SKILL 在哪：** `src/dimensions.ts` 现在是 design-token 的 canonical 文件。所有常量都从这里 export：

```ts
// 几何
export const COVER_W = 320, COVER_H = 140;
export const SAFE_LEFT = 28, SAFE_RIGHT = 292, SAFE_TOP = 20, SAFE_BOTTOM = 120;
export const SAFE_W = 264, SAFE_H = 100;
export const BARS_LEFT = 184, BARS_RIGHT = 292, BARS_W = 108, BAR_GAP = 3;
export const FG_X = 28, FG_Y = 20, FG_W = 264, FG_H = 100;
export const CARD_W_DESIGN = 328, CARD_H_DESIGN = 302;
export const CARD_INSET = 4, CARD_RADIUS = 12, COVER_RADIUS = 8;

// 响应式
export const RESPONSIVE_SMALL = { minCardWidth: 260, maxCardWidth: 340, gap: 12 };
export const RESPONSIVE_LARGE = { minCardWidth: 328, maxCardWidth: 400, gap: 12 };

// 图标位置
export const DEFAULT_ICON_GEOM = { x: 192, y: 22, size: 100 };
export const WHATIF_ICON_GEOM  = { x: 240, y: 12, size: 64  };

// Type-scale floors
export const TYPE_FLOORS = { hero: 32, verb: 14, pulse: 22, delta: 14, label: 9 };

// 字体（plain CSS 字符串）
export const FONT_FAMILY_COVER    = '"Delight", -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif';
export const FONT_FAMILY_METADATA = '"Inter", -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif';

// 字重 + tracking
export const FONT_WEIGHTS = { regular: 400, medium: 500, semiBold: 600, bold: 700 };
export const TRACKED_CAPS = 0.16;

// 类别色
export const CATEGORY_COLORS = {
  RISK:      { r: 0.86, g: 0.15, b: 0.15 },
  CATALYST:  { r: 0.09, g: 0.64, b: 0.29 },
  AMBIGUOUS: { r: 0.85, g: 0.47, b: 0.02 },
};
```

**demo 端做什么：** 一行 import 替换所有原来的本地常量：

```ts
// 之前 — skill-gaps.ts 里
const COVER_W = 320, COVER_H = 140, SAFE_LEFT = 28, SAFE_RIGHT = 292;
const FONT_FAMILY = "'Delight', sans-serif";
const TYPOGRAPHY = { /* ... */ };
const CHIP_STYLE = { /* ... */ };
const BARS_STYLE = { /* ... */ };
const CATEGORY_COLORS = { /* ... */ };

// 之后
import {
  COVER_W, COVER_H, SAFE_LEFT, SAFE_RIGHT, SAFE_TOP, SAFE_BOTTOM,
  BARS_LEFT, BARS_RIGHT, BARS_W,
  RESPONSIVE_SMALL, RESPONSIVE_LARGE,
  DEFAULT_ICON_GEOM, WHATIF_ICON_GEOM, TYPE_FLOORS,
  FONT_FAMILY_COVER, FONT_FAMILY_METADATA,
  FONT_WEIGHTS, TRACKED_CAPS,
  CATEGORY_COLORS,
} from "@alva/cover-skill/dimensions";   // 或 "../skill/src/dimensions"，看你的 import 配置
```

> **locale-aware 字体（中文界面用）：** 用 `getCoverFontStack(locale)` + `fontStackToCss()` 从 `@alva/cover-skill/i18n`，会带上 PingFang SC / Noto Sans CJK 等 fallback。

---

## 5. D 类（delta `CATEGORY_COLORS`）

跟 B2 同源。`CATEGORY_COLORS` 的 canonical 位置是 **`src/dimensions.ts`**（不是 `cover-gen.ts`，那里只是 backward-compat 的 re-export）。`generateCover()` 已经把 RGB 直接 resolve 到 `delta.categoryColor` 字段，**所以最佳做法是 render 直接读 `delta.categoryColor`，根本不用 import `CATEGORY_COLORS`**。

只有在 metadata chip / 其它跟 `output.content` 无关的 UI 元素需要按 category 上色时，才 import `CATEGORY_COLORS`。

---

## 6. demo 端要删的文件 / 代码段

**整体删除：**

```
demo/src/components/skill-gaps.ts        ← 整个文件
```

**从 demo 里删除（如果还有的话）：**

```ts
// 任何形式的本地映射表
const TICKER_TO_SLUG     = { ... };
const TICKER_TO_FALLBACK = { ... };
const CATEGORY_COLORS    = { ... };
const TYPOGRAPHY         = { ... };
const CHIP_STYLE         = { ... };
const BARS_STYLE         = { ... };
const FONT_FAMILY        = "...";
const COVER_W = 320, COVER_H = 140 /* ... */;

// 任何按 c.kind 分支的样式查表
function getStyleFor(kind) { /* ... */ }    // 改读 c.fontWeight / c.paletteRole 等

// 任何写死的 fallback 图标
return <Icon symbol="memory" />;             // 改读 output.icon.fallbackSymbol
```

**from demo 改 import：**

```diff
- import { ... } from "./skill-gaps";
+ import { ... } from "@alva/cover-skill/dimensions";
```

---

## 7. 验证清单（demo 端 review 前 6 分钟跑完）

```bash
# 1. SKILL 端确认拉到最新
cd ~/Desktop/alva-cover-generation && git log --oneline | head -3
# 应该看到 be6d3e3 / 9c952c2 / ee3a669

# 2. demo 端 grep 0 hits
grep -rn "memory" demo/src/components/CoverRenderer*    # 不应该有 hardcoded "memory" fallback
grep -rn "TYPOGRAPHY\|CHIP_STYLE\|BARS_STYLE" demo/src/  # 这些表应该全删
grep -rn "from.*skill-gaps" demo/src/                    # 应该 0 行
ls demo/src/components/skill-gaps.ts                     # 应该 No such file
```

跑完都 0 hit / 0 file 就是迁移完成。

---

## 8. 还有疑问？

- **类型对不上**：先 `npm install` / 重 build 确保 `node_modules/@alva/cover-skill` 是最新的。`types.ts` 里的字段都是 required（除 `?:` 标了的），TS 会立刻报哪个字段没填。
- **找不到某个常量**：所有 design token 都在 `src/dimensions.ts`。其他 export 在 `src/i18n.ts` / `src/svg-helpers.ts` / `src/cover-gen.ts`。看 `README.md` Public API 表。
- **`CATEGORY_COLORS` 在 `cover-gen.ts` 还能 import 吗？** 能，是 backward-compat re-export。但 canonical 位置是 `dimensions.ts`，新代码请从那里 import。

---

*问题反馈：robert@alva.xyz / #cover-system Slack*
