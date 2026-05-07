# SKILL v2 改动 — 给 code 团队（第二轮）

第一轮 8 条 gap 见 `MIGRATION.md`。这一份只覆盖 **2026-04-28 第二轮反馈的 3 条新 gap**，commit `bc6b79f`。

---

## TL;DR

3 处改动，**只增不减**——demo 端原有调用不会被破坏（向后兼容），但要补两个 input 字段 + 改一行 render：

| # | 改动 | demo 需要 |
|---|---|---|
| 1 | `CoverInput.whatIfBars: number[]` 新增 | what-if 卡 caller 传柱状图原始数值 |
| 2 | `CoverInput.category: "RISK" \| "CATALYST" \| "AMBIGUOUS"` 新增 | thesis 卡 caller 传专用字段（不要再用 `series`） |
| 3 | `delta.categoryLabel: string` 输出新增 | renderer 改读 `{delta.categoryLabel}`，不用再调 `localizeCategory()` |

跑这一份不需要重读 `MIGRATION.md` v1，但前提是 v1 的 8 条已经合过。

---

## 1. 上手最快路径

```bash
cd ~/Desktop/alva-cover-generation && git pull
git log --oneline | head -3
# 应该看到 bc6b79f Close 3 new gaps from code team
```

确认能看到 `bc6b79f` 这个 commit。如果没有，**先 pull**。

---

## 2. Gap #1 — what-if 柱状图终于能渲染

### 之前的现象

```ts
// src/cover-gen.ts buildWhatIfContent
const bars: BarSpec[] = [];   // ← 永远空数组
return [..., { kind: "bars", bars, zeroLineY: 112, ... }];
```

`CoverInput` 没有 `whatIfBars`，buildWhatIfContent 内部把 `bars` 写死空数组。结果：what-if 卡的 K 线柱状图永远不画，只能看到一条 zero-line。

### SKILL 端修法

**新 input 字段**（types.ts）：

```ts
type CoverInput = {
  // ... existing fields ...
  /** What-if-only: signed % values (e.g. [-2.4, 1.1, -0.8, 0.3, -1.5]).
   *  Skill computes BarSpec[] (positions, widths, heights, colors).
   *  Empty/missing → no bars. */
  whatIfBars?: number[];
};
```

**新内部函数**（cover-gen.ts，导出供单测/调试用）：

```ts
function computeWhatIfBars(values: number[], bgHsl: HSL):
    { bars: BarSpec[]; zeroLineY: number } {
  if (!values.length) return { bars: [], zeroLineY: 112 };
  const N        = values.length;
  const w        = (BARS_RIGHT - BARS_LEFT - BAR_GAP * (N - 1)) / N;
  const maxAbs   = Math.max(...values.map(v => Math.abs(v)), 0.0001);
  const heights  = values.map(v => Math.max(Math.abs(v) * (28 / maxAbs), 4));
  const maxNegH  = values.reduce((a, v, i) => v < 0 ? Math.max(a, heights[i]!) : a, 0);
  const zeroLineY = 120 - maxNegH;
  // ... build BarSpec[] with x/y/width/height/color/isPositive
}
```

逻辑：
- bar 宽 = 安全区均分（`(BARS_RIGHT − BARS_LEFT − BAR_GAP*(N−1)) / N`）
- bar 高 = `|v| / maxAbs * 28`（最大 28px，最小 4px floor 防小柱看不见）
- zero-line y = `120 − 最高负柱`（最高负柱底贴 y=120）
- 正柱：`y = zeroLineY − height`（向上长）
- 负柱：`y = zeroLineY`（向下长）
- color: `barColorFor(bgH, isPos)` 复用现有色相 blend 算法

### demo 端改动

**caller**（构造 CoverInput 的代码）：

```ts
// 之前：what-if 卡传不进柱状图数据
generateCover({
  template: "what-if",
  title: "SPY & Oil After Hormuz Blockade",
  ...,
  kind: "HISTORICALLY DROPS",
  anchor: "−2.4%",
});

// 之后：补 whatIfBars
generateCover({
  template: "what-if",
  title: "SPY & Oil After Hormuz Blockade",
  ...,
  kind: "HISTORICALLY DROPS",
  anchor: "−2.4%",
  whatIfBars: [-2.4, 1.1, -0.8, 0.3, -1.5],   // ← 这次的数据来源（5 个事件的回报）
});
```

**renderer**（消费 `bars` ContentElement）：**完全无需改动**——你之前怎么读 `bars.bars[]` / `bars.zeroLineY` / `bars.zeroLine` / `bars.barOpacity`，现在还是怎么读。skill 把空数组换成了真值，渲染端无感。

---

## 3. Gap #2 — Thesis category 字段错位

### 之前的现象

```ts
// src/cover-gen.ts buildThesisContent
const category = (input.series as any) ?? "AMBIGUOUS";
// ↑ 错的：series 是 caps label 文本（"TODAY'S DELTA · APR 23"），不是 category
//   caller 永远不会传 series="RISK"，所以永远 fallback 到 "AMBIGUOUS"（金色）
```

结果：所有 thesis 卡显示金色 AMBIGUOUS dot，跟实际 category 无关。

### SKILL 端修法

**新 input 字段**（types.ts）：

```ts
type CoverInput = {
  // ... existing fields ...
  /** Thesis-only: canonical key for the category badge.
   *  Caller passes "RISK" / "CATALYST" / "AMBIGUOUS"; skill resolves
   *  color (CATEGORY_COLORS) and locale label (localizeCategory). */
  category?: "RISK" | "CATALYST" | "AMBIGUOUS";
};
```

**buildThesisContent**：

```ts
// 之前
const category = (input.series as any) ?? "AMBIGUOUS";

// 之后
const category = input.category ?? "AMBIGUOUS";
```

### demo 端改动

**caller**：

```ts
// 之前 — 错的
generateCover({
  template: "thesis",
  kind:   "Late long-term debt cycle · risk-off bias",   // delta body
  series: "AMBIGUOUS",                                    // ← 用错字段，是 caps label 才对
});

// 之后 — 正确
generateCover({
  template: "thesis",
  kind:     "Late long-term debt cycle · risk-off bias", // delta body
  category: "AMBIGUOUS",                                  // ← 专用字段
  // series 不要再传 category 值；如果要自定义 caps label 才用
});
```

如果 demo 之前有 hack 把 category 塞 `series` 里的代码，要清掉：

```ts
// ❌ 删掉这种代码
const seriesText = isThesisCard ? coverData.category : coverData.label;
generateCover({ ..., series: seriesText });

// ✅ 改成
generateCover({
  ...,
  series:   coverData.label,        // caps 标签文本（可选）
  category: coverData.category,     // RISK / CATALYST / AMBIGUOUS
});
```

---

## 4. Gap #3 — Delta 类别本地化文本

### 之前的现象

```ts
// renderer 自己调 i18n
import { localizeCategory } from "@alva/cover-skill/i18n";
<text>{localizeCategory(delta.category, cover.locale)}</text>
```

skill 输出 `delta.category = "RISK"` 这种 canonical key，renderer 必须自己拿 locale 调一次 `localizeCategory` 才能显示"风险/リスク/리스크"。这跟 100%-data-driven 原则冲突——renderer 应该 0 业务逻辑。

### SKILL 端修法

**新 output 字段**（types.ts ContentElement.delta）：

```ts
{
  kind: "delta",
  category:      "RISK" | "CATALYST" | "AMBIGUOUS",   // canonical key（保留，给业务逻辑用）
  categoryLabel: string,                              // ← NEW: 已 resolve 完的本地化文本
  // ... 其它字段
}
```

**buildThesisContent**：

```ts
// 之前
{ kind: "delta", category, ... }

// 之后
{ kind: "delta", category, categoryLabel: localizeCategory(category, locale), ... }
```

### demo 端改动

**renderer**：

```tsx
// 之前 — renderer 自己调 i18n
import { localizeCategory } from "@alva/cover-skill/i18n";
<text>{localizeCategory(delta.category, cover.locale)}</text>

// 之后 — 一行 read
<text>{delta.categoryLabel}</text>
```

**对应 5 个 locale 的输出**：

| `locale` | `delta.categoryLabel`（category=RISK） |
|---|---|
| `en` | `RISK` |
| `zh-CN` | `风险` |
| `zh-TW` | `風險` |
| `ja-JP` | `リスク` |
| `ko-KR` | `리스크` |

CATALYST / AMBIGUOUS 同理。

---

## 5. 完整的 thesis CoverInput 例子（修完后）

```ts
generateCover({
  // 通用
  template: "thesis",
  title:    "Dalio Macro Cycle Tracker",
  author:   "all-weather",
  tickers:  [],

  // thesis 内容
  anchor:   "Apr 27",                                          // 日期戳，进 caps label "TODAY'S DELTA · APR 27"
  kind:     "Late long-term debt cycle · risk-off bias",      // delta body（splitDelta 自动折行）
  category: "AMBIGUOUS",                                       // ← Gap #2 新字段，决定 dot 颜色 + categoryLabel

  // i18n
  locale:   "zh-CN",                                           // → label="今日变化 · APR 27", categoryLabel="不明朗"
});
```

## 6. 完整的 what-if CoverInput 例子（修完后）

```ts
generateCover({
  // 通用
  template: "what-if",
  title:    "SPY & Oil After Hormuz Blockade",
  author:   "terrezzaeynon897",
  tickers:  ["SPY", "USO"],
  domain:   "fed",

  // what-if 内容
  series:      "30D AFTER HORMUZ · 5×",                       // caps label
  kind:        "HISTORICALLY DROPS",                          // verb
  anchor:      "−2.4%",                                       // hero %
  whatIfBars:  [-2.4, 1.1, -0.8, 0.3, -1.5],                  // ← Gap #1 新字段，5 根柱子的原始 % 数值

  // i18n
  locale:      "en",
});
```

---

## 7. 验证清单（demo 端跑一遍）

```bash
# 1. SKILL 端确认拉到 bc6b79f
cd ~/Desktop/alva-cover-generation && git log --oneline | head -3

# 2. demo 端 grep 检查
grep -rn "localizeCategory" demo/src/components/CoverRenderer*    # 不应该有了（用 categoryLabel 字段）
grep -rn "input.series.*RISK\|input.series.*CATALYST" demo/src/   # 不应该有了（用 input.category）

# 3. 视觉验证
# Open Explore page, check:
#   - thesis 卡的 dot 颜色按 input.category 显示（RISK 红 / CATALYST 绿 / AMBIGUOUS 金）
#   - 切换 locale 后 categoryLabel 跟着变（"RISK" / "风险" / "リスク" / "리스크"）
#   - what-if 卡能看到柱状图（不再只有 zero-line 一条线）
```

3 项都通过 = 跟 `alva.baby` 一致了。

---

## 8. Gap #4 — 无 CDN logo 的 brand path 渲染又小又重的 fallback icon

### 之前的现象

SPY / QQQ / JPM / IBM / LMT 等 30+ brand entry 在 `BRAND_REGISTRY` 里 (`logoSlug` 设置了，但 simpleicons.org 没收录)，单 ticker 走 brand path 时：
1. `buildBrandIcon` 返回 `{ kind: "brand", color: brand.color }`
2. Renderer fetch `cdn.simpleicons.org/spy` 失败
3. 走 `fallbackSymbol`（之前默认 `"memory"`）
4. 用 brand 色（黑/暗）+ brand 不透明度（0.40/0.50）渲染 Material Symbol
5. 视觉效果：又小又暗的 chip，跟其它 brand 卡格格不入

Demo 端不能在渲染层做"哪些 ticker 有 logo"的业务判断（每张卡在 React 组件里独立渲染）。SKILL 端必须 own 这个分支。

### SKILL 端修法

**新 BrandEntry 字段**（types.ts）：

```ts
type BrandEntry = {
  // ... existing ...
  hasCdnLogo: boolean;   // ← NEW: true 仅当 simpleicons CDN 真有 logo
  fallbackSymbol?: string;
  // ...
};
```

**brand-registry.ts** — 67 个 entry 全部标了：

```ts
AAPL: { ..., hasCdnLogo: true,  logoSlug: "apple",  fallbackSymbol: "smartphone" },
NVDA: { ..., hasCdnLogo: true,  logoSlug: "nvidia", fallbackSymbol: "memory" },
SPY:  { ..., hasCdnLogo: false, logoSlug: "spy",    fallbackSymbol: "public" },
JPM:  { ..., hasCdnLogo: false, logoSlug: "jpmorganchase", fallbackSymbol: "account_balance" },
LMT:  { ..., hasCdnLogo: false, logoSlug: "lmt",    fallbackSymbol: "security" },
ARKK: { ..., hasCdnLogo: false, logoSlug: "arkk",   fallbackSymbol: "trending_up" },
// ... 18 个 hasCdnLogo: true（AAPL, AMZN, GOOGL, META, MSFT, NVDA, TSLA,
// AMD, INTC, PANW, CRM, ORCL, ADBE, NFLX, V, MA, NKE, SBUX）
// ... 49 个 hasCdnLogo: false（其余 ETF + 工业/金融/消费/能源等）
```

**`generateCover` icon 分支**（cover-gen.ts）：

```ts
const icon: IconSpec = isPortrait
  ? null
  : brand && brand.hasCdnLogo
    ? buildBrandIcon(input.tickers[0]!, brand, input.template)         // 真有 CDN logo
    : brand
      ? buildMaterialIcon(brand.fallbackSymbol ?? "memory", template, bgHsl)  // 无 CDN，走 material
      : buildMaterialIcon(symbolForDomain(...), template, bgHsl);       // 无 brand，原 domain 路径
```

**关键**：bg path 不变。`brand && !brand.mono` 仍然走 brand bg-tinting，所以 JPM 卡的 JPM-蓝 bg 完整保留，只是 icon 从黑色 brand-path memory 换成 bg-derived `account_balance`，视觉上从"又小又重"变成"轻盈的二级图层"。

### demo 端要做什么

**完全无需改动**——`generateCover` 输出的 `IconSpec` 联合类型不变：
- `kind: "brand"` 时 → 走 brand logo 渲染（CDN fetch / fallback Material Symbol）
- `kind: "material"` 时 → 直接渲染 Material Symbol

renderer 的现有 `output.icon.kind === "brand" ? <BrandLogo /> : <MaterialIcon />` 分支已经处理两种情况。skill 内部把 SPY/JPM 这类从 brand 切到 material，渲染端直接看到 `kind: "material"`，正常画 Material Symbol。

唯一的"间接好处"：`<BrandLogo onError={fallback}>` 那个 fallback 分支基本不会再触发了（没有 CDN logo 的根本不走 brand path），可以保留作为最后防线但实际不会跑到。

### 视觉效果

| Brand | 之前 icon | 之后 icon | bg 不变 |
|---|---|---|---|
| AAPL | apple logo（黑/CDN） | apple logo（黑/CDN） | 不 tint（mono） |
| NVDA | nvidia logo（绿/CDN） | nvidia logo（绿/CDN） | 绿 tint |
| SPY  | 黑色 memory chip | bg 浅灰色 public 球 | 不 tint（mono） |
| JPM  | 蓝色 account_balance | bg 浅蓝 account_balance | **蓝 tint 保留** |
| LMT  | 蓝色 memory chip | bg 浅蓝 security 盾 | 蓝 tint 保留 |
| MCD  | 黄色 memory chip | bg 浅黄 restaurant | 黄 tint 保留 |

---

## 9. 完整 commit 链（截至这次）

```
bc6b79f Close 3 new gaps from code team — whatIfBars, category, categoryLabel  ← 这次
7707bc2 demo: full locale switching + renderer is now 100% SKILL-driven
be400f1 Add MIGRATION.md — handoff doc for code team
be6d3e3 Consolidate design tokens into dimensions.ts (canonical home)
9c952c2 demo: consume new SKILL fields (logoSlug + fallbackSymbol)
ee3a669 Fill 8 SKILL gaps — eliminate demo's skill-gaps.ts
9199c6e Add i18n support — Locale type, 5 locales
```

---

*问题反馈：robert@alva.xyz / #cover-system Slack*
