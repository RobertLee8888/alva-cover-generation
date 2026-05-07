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

## 8. 完整 commit 链（截至这次）

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
