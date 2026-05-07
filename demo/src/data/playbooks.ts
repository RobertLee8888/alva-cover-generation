// Mirrors the live alva.baby/#explore-2 right-panel grid (32 cards as of
// 2026-04-28). Each card's `cover` is a CoverInput consumed by the SKILL —
// edit src/cover-gen.ts (or any file under src/) and the rendering here
// updates automatically.
//
// All visible text (title, description, cover.kind/anchor/series) is a
// LocStr — pass `string` for locale-agnostic content, or `{ en, "zh-CN", ... }`
// for translatable strings. App.tsx resolves to plain strings via `resolveCard`.

import type { CoverInput, Template, DomainKey } from '@skill/types';
import type { LocStr } from './loc';

export interface ExplorePlaybookData {
  id: string;
  creator: string;
  title: LocStr;
  description: LocStr;
  tickers: string[];
  pulse: 'active' | 'idle';
  stars: number;
  remixes: number;
  annualizedReturn?: string;
  cover: {
    template: Template;
    title: LocStr;
    author: string;
    tickers: string[];
    domain?: DomainKey;
    kind?: LocStr;
    anchor?: LocStr;
    series?: LocStr;
    category?: 'RISK' | 'CATALYST' | 'AMBIGUOUS';
    whatIfBars?: number[];
    portrait?: NonNullable<CoverInput['portrait']>;
  };
}

// Resolved version (after locale pick) — what PlaybookCard consumes.
export interface ExplorePlaybook {
  id: string;
  creator: string;
  title: string;
  description: string;
  tickers: string[];
  pulse: 'active' | 'idle';
  stars: number;
  remixes: number;
  annualizedReturn?: string;
  cover: CoverInput;
}

export const PLAYBOOKS: ExplorePlaybookData[] = [
  {
    id: 'quality-value-screener',
    creator: 'ivan',
    title: { en: 'Quality-Value Screener', 'zh-CN': '质量价值筛选器' },
    description: {
      en: 'Large-cap US stocks combining Value, Quality, and Safety factors. Top quintile rebalanced monthly with FCF and net-debt screens.',
      'zh-CN': '结合价值、质量、安全三因子的美股大盘股筛选器。每月再平衡 Top 20%，叠加自由现金流和净负债筛选条件。',
    },
    tickers: ['PG', 'JNJ', 'KO', 'MRK'],
    pulse: 'active', stars: 101, remixes: 0,
    cover: {
      template: 'screener',
      title: { en: 'Quality-Value Screener', 'zh-CN': '质量价值筛选器' },
      author: 'ivan',
      tickers: ['PG', 'JNJ', 'KO', 'MRK'], domain: 'value',
      series: { en: 'SCORED · S&P LARGE CAP · 6H', 'zh-CN': '已评分 · 标普大盘 · 6H' },
    },
  },
  {
    id: 'ptsd-supply',
    creator: 'steven',
    title: { en: 'PTSD — Post-Traumatic Supply', 'zh-CN': 'PTSD — 创伤后供给' },
    description: {
      en: 'Identifies industries with reluctant supply expansion across five layers. 16-name long/short basket benchmarked vs SPY and XLE with daily narrative.',
      'zh-CN': '识别五个层级中扩产意愿低的行业。16 只多空对冲组合，对标 SPY 和 XLE，每日更新叙事。',
    },
    tickers: ['XOM', 'CVX', 'LNG', 'MPC'],
    pulse: 'active', stars: 278, remixes: 1,
    cover: {
      template: 'thesis',
      title: { en: 'PTSD — Post-Traumatic Supply', 'zh-CN': 'PTSD — 创伤后供给' },
      author: 'steven',
      tickers: [], domain: 'energy', anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'CATALYST',
      kind: { en: 'Long leg +4.1% vs XLE +0.3% WTD', 'zh-CN': '多腿 +4.1% vs XLE +0.3% 本周' },
    },
  },
  {
    id: 'spy-oil-hormuz',
    creator: 'terrezzaeynon897',
    title: { en: 'SPY & Oil After Hormuz Blockade', 'zh-CN': '霍尔木兹封锁后的 SPY 与原油' },
    description: {
      en: 'Historical SPY and USO movements after Strait of Hormuz blockade events. 30-day forward returns across 5 prior episodes.',
      'zh-CN': '霍尔木兹海峡封锁事件后 SPY 与 USO 的历史走势。统计过去 5 次类似事件的 30 日前瞻收益。',
    },
    tickers: ['SPY', 'USO'],
    pulse: 'idle', stars: 102, remixes: 4,
    cover: {
      template: 'what-if',
      title: { en: 'SPY & Oil After Hormuz Blockade', 'zh-CN': '霍尔木兹封锁后的 SPY 与原油' },
      author: 'terrezzaeynon897', tickers: ['SPY', 'USO'], domain: 'event_study',
      series: { en: '30D AFTER HORMUZ · 5×', 'zh-CN': '霍尔木兹后 30 日 · 5 次' },
      kind: { en: 'Historically Drops', 'zh-CN': '历史上下跌' },
      anchor: '−2.4%',
      whatIfBars: [-1.8, -3.2, 0.6, -2.1, -0.9],
    },
  },
  {
    id: 'rave-short-squeeze',
    creator: 'deepstonks',
    title: { en: 'RAVE Short Squeeze Monitor', 'zh-CN': 'RAVE 轧空监控' },
    description: {
      en: 'Real-time derivatives dashboard tracking funding rates, open interest, sentiment, and liquidations across three exchanges with 60-second auto-refresh.',
      'zh-CN': '实时衍生品看板，追踪三家交易所的资金费率、未平仓量、情绪和清算数据，每 60 秒自动刷新。',
    },
    tickers: ['RAVE'],
    pulse: 'active', stars: 353, remixes: 0,
    cover: {
      template: 'general',
      title: { en: 'RAVE Short Squeeze Monitor', 'zh-CN': 'RAVE 轧空监控' },
      author: 'deepstonks', tickers: ['RAVE'], domain: 'alerts',
      kind:   { en: 'ALERTS · LIVE · 30S',  'zh-CN': '提醒 · 实时 · 30 秒' },
      anchor: { en: '14 active',            'zh-CN': '14 个活跃' },
      series: { en: '8 RESOLVED · 6H',      'zh-CN': '8 个已解决 · 6H' },
    },
  },
  {
    id: 'congressional-buys',
    creator: 'ivan',
    title: { en: 'Congressional Conviction Buys', 'zh-CN': '国会重仓买入' },
    description: {
      en: 'US stocks ranked by congressional member purchases in the last 90 days, ordered by conviction, volume, recency, and bipartisan diversity.',
      'zh-CN': '按过去 90 天国会议员买入排序的美股，综合考量信心、量、时效与两党多样性。',
    },
    tickers: ['NVDA', 'AAPL', 'TSLA', 'MSFT'],
    pulse: 'active', stars: 291, remixes: 3,
    cover: {
      template: 'screener',
      title: { en: 'Congressional Conviction Buys', 'zh-CN': '国会重仓买入' },
      author: 'ivan',
      tickers: ['NVDA', 'AAPL', 'TSLA', 'MSFT'], domain: 'tech',
      series: { en: 'ALT DATA · 90D DISCLOSURES · DAILY', 'zh-CN': '另类数据 · 90 日披露 · 每日' },
    },
  },
  {
    id: 'buffett-13f',
    creator: 'long-us-10x',
    title: { en: "Buffett's 13F Shadow Portfolio", 'zh-CN': '巴菲特 13F 影子组合' },
    description: {
      en: "Mirrors Berkshire Hathaway's latest 13F. Auto-rebalances within 24h of SEC disclosure with size-adjusted weights and turnover dampening.",
      'zh-CN': '复制伯克希尔最新 13F 持仓。SEC 披露后 24 小时内自动再平衡，按规模调整权重并平滑换手。',
    },
    tickers: ['AAPL', 'KO', 'BAC', 'AXP'],
    pulse: 'active', stars: 286, remixes: 12,
    cover: {
      template: 'general',
      title: { en: "Buffett's 13F Shadow Portfolio", 'zh-CN': '巴菲特 13F 影子组合' },
      author: 'long-us-10x',
      tickers: ['AAPL', 'KO', 'BAC', 'AXP'],
      kind:   { en: 'PORTFOLIO · QUARTERLY',     'zh-CN': '组合 · 季度' },
      anchor: { en: '24 holdings',               'zh-CN': '24 个持仓' },
      series: { en: '$345B AUM · BERKSHIRE',     'zh-CN': '$3450 亿 AUM · 伯克希尔' },
      portrait: {
        imageHash: 'https://commons.wikimedia.org/wiki/Special:FilePath/Warren_Buffett_with_Fisher_College_of_Business_Student.jpg?width=640',
        portraitH: 30, imageAspectRatio: 1.5, subjectName: 'Warren Buffett',
        license: 'CC-BY', source: 'https://commons.wikimedia.org/wiki/File:Warren_Buffett_with_Fisher_College_of_Business_Student.jpg',
      },
    },
  },
  {
    id: 'next-ai-bottleneck',
    creator: 'steven',
    title: { en: 'The Next AI Bottleneck', 'zh-CN': '下一个 AI 瓶颈' },
    description: {
      en: 'Daily tracker of supply constraints across Power, Compute, and Deployment sectors affecting the AI buildout — fixed thesis with a daily verdict.',
      'zh-CN': '每日跟踪电力、算力、部署三个供给侧瓶颈对 AI 建设的影响 — 固定主题，每日给出判断。',
    },
    tickers: ['VST', 'TLN', 'NRG', 'ETR'],
    pulse: 'active', stars: 250, remixes: 2,
    cover: {
      template: 'thesis',
      title: { en: 'The Next AI Bottleneck', 'zh-CN': '下一个 AI 瓶颈' },
      author: 'steven',
      tickers: [], domain: 'ai', anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'AMBIGUOUS',
      kind: { en: 'Power leg +2.8% vs Compute −0.4% WTD', 'zh-CN': '电力腿 +2.8% vs 算力 −0.4% 本周' },
    },
  },
  {
    id: 'nvda-tsm',
    creator: 'Smart Jing',
    title: { en: 'NVDA +3% Triggered TSM TP/SL', 'zh-CN': 'NVDA +3% 触发 TSM 止盈止损' },
    description: {
      en: 'Buys TSM at the close when NVDA gains >3% close-to-close. Exits on +10% take-profit or −5% stop-loss across 12 historical triggers.',
      'zh-CN': 'NVDA 单日涨 >3% 时收盘买入 TSM，+10% 止盈或 −5% 止损退出。回测 12 次历史触发。',
    },
    tickers: ['NVDA', 'TSM'],
    pulse: 'active', stars: 48, remixes: 7, annualizedReturn: '+27.73%',
    cover: {
      template: 'what-if',
      title: { en: 'NVDA +3% Triggered TSM TP/SL', 'zh-CN': 'NVDA +3% 触发 TSM 止盈止损' },
      author: 'smart-jing',
      tickers: ['NVDA', 'TSM'], domain: 'event_study',
      series: { en: '30D AFTER NVDA +3% · 12×', 'zh-CN': 'NVDA +3% 后 30 日 · 12 次' },
      kind: { en: 'Historically Climbs', 'zh-CN': '历史上上涨' },
      anchor: '+27.7%',
      whatIfBars: [3.2, -1.1, 5.4, 2.8, -0.5, 4.6, 1.9, -0.8],
    },
  },
  {
    id: 'narrative-alpha',
    creator: 'leoz',
    title: { en: 'Narrative Alpha Discovery', 'zh-CN': '叙事 Alpha 发现' },
    description: {
      en: 'Agentic signal discovery mining social media, KOL tweets, news, Reddit, and podcasts for emerging investable narratives in US equities.',
      'zh-CN': '智能体挖掘社交媒体、KOL 推文、新闻、Reddit、播客中的美股新兴投资叙事。',
    },
    tickers: ['SHOP', 'PLTR', 'NET'],
    pulse: 'active', stars: 177, remixes: 5,
    cover: {
      template: 'general',
      title: { en: 'Narrative Alpha Discovery', 'zh-CN': '叙事 Alpha 发现' },
      author: 'leoz',
      tickers: [], domain: 'guide',
      kind:   { en: 'CONTEXT FEED · DAILY',         'zh-CN': '上下文流 · 每日' },
      anchor: { en: '47 emergent',                  'zh-CN': '47 个新发' },
      series: { en: 'X · SUBSTACK · PODCASTS',      'zh-CN': 'X · SUBSTACK · 播客' },
    },
  },
  {
    id: 'social-smart-money',
    creator: 'stock-king',
    title: { en: 'Social × Smart Money Consensus', 'zh-CN': '社交 × 聪明钱共识' },
    description: {
      en: 'US stocks ranked by convergence of social mention volume, insider buying, and congressional purchases. Daily post-close refresh with consensus highlights.',
      'zh-CN': '按社交提及量、内部人买入、国会买入三信号收敛度排序的美股。每日收盘后刷新并标注共识标的。',
    },
    tickers: ['META', 'GOOGL', 'AMD', 'AMZN'],
    pulse: 'active', stars: 247, remixes: 1,
    cover: {
      template: 'screener',
      title: { en: 'Social × Smart Money Consensus', 'zh-CN': '社交 × 聪明钱共识' },
      author: 'stock-king',
      tickers: ['META', 'GOOGL', 'AMD', 'AMZN'], domain: 'tech',
      series: { en: '3-SIGNAL CONVERGENCE · 4H', 'zh-CN': '三信号收敛 · 4H' },
    },
  },
  {
    id: 'space-defense',
    creator: 'siriusshen',
    title: { en: 'Space × Defense Thesis Tracker', 'zh-CN': '太空 × 国防主题追踪' },
    description: {
      en: 'Three-pillar theme tracker covering commercial launch disruption, DoD software modernization, and commercial ISR — with a daily narrative and quant feeds.',
      'zh-CN': '三支柱主题追踪：商业发射颠覆、国防部软件现代化、商业 ISR — 每日叙事 + 量化数据。',
    },
    tickers: ['LMT', 'RTX', 'RKLB', 'PLTR'],
    pulse: 'active', stars: 151, remixes: 0,
    cover: {
      template: 'thesis',
      title: { en: 'Space × Defense Thesis Tracker', 'zh-CN': '太空 × 国防主题追踪' },
      author: 'siriusshen',
      tickers: [], domain: 'defense', anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'RISK',
      kind: { en: 'Launch leg −1.6% vs ITA +0.2% WTD', 'zh-CN': '发射腿 −1.6% vs ITA +0.2% 本周' },
    },
  },
  {
    id: 'copper-gold-spx',
    creator: 'terrezzaeynon897',
    title: { en: 'Copper/Gold Ratio vs S&P 500', 'zh-CN': '铜金比 vs 标普 500' },
    description: {
      en: 'Historical analysis of forward S&P returns after copper-to-gold ratio prints a 1-year low. 60-day path across 8 prior signals.',
      'zh-CN': '铜金比创 1 年新低后标普前瞻收益的历史分析。回看 8 次信号的 60 日路径。',
    },
    tickers: ['SPY', 'HG=F', 'GC=F'],
    pulse: 'idle', stars: 88, remixes: 4,
    cover: {
      template: 'what-if',
      title: { en: 'Copper/Gold Ratio vs S&P 500', 'zh-CN': '铜金比 vs 标普 500' },
      author: 'terrezzaeynon897', tickers: ['SPY'], domain: 'macro',
      series: { en: '60D AFTER 1Y LOW · 8×', 'zh-CN': '1 年新低后 60 日 · 8 次' },
      kind: { en: 'Historically Climbs', 'zh-CN': '历史上上涨' },
      anchor: '+5.7%',
      whatIfBars: [3.2, 5.1, -1.2, 6.8, 4.1, -0.5, 7.2, 2.4],
    },
  },
  {
    id: 'kol-leaderboard',
    creator: 'inflame',
    title: { en: 'KOL Trading Leaderboard', 'zh-CN': 'KOL 交易排行榜' },
    description: {
      en: 'Tracks 20 financial influencers by composite tweet-signal performance. Weekly leaderboard with 90D rolling Sharpe.',
      'zh-CN': '追踪 20 位财经 KOL 的推文信号综合表现。每周排行榜，90 日滚动夏普。',
    },
    tickers: ['SPY', 'QQQ'],
    pulse: 'active', stars: 141, remixes: 0,
    cover: {
      template: 'general',
      title: { en: 'KOL Trading Leaderboard', 'zh-CN': 'KOL 交易排行榜' },
      author: 'inflame',
      tickers: [], domain: 'leaderboard',
      kind:   { en: 'LEADERBOARD · WEEKLY',          'zh-CN': '排行榜 · 每周' },
      anchor: { en: 'Top 20 KOLs',                   'zh-CN': 'Top 20 KOL' },
      series: { en: 'COMPOSITE SIGNAL · 90D',        'zh-CN': '综合信号 · 90 日' },
    },
  },
  {
    id: 'inflection-screener',
    creator: 'ivan',
    title: { en: 'Inflection Point Screener', 'zh-CN': '拐点筛选器' },
    description: {
      en: 'Screens 948 mid-caps daily for margin acceleration, revenue inflection, and profitability crossover. Top decile with 90-day holding period.',
      'zh-CN': '每日扫描 948 只中盘股，识别毛利加速、收入拐点、盈利反转三信号。Top 10% 持有 90 日。',
    },
    tickers: ['SHOP', 'CRWD', 'NET', 'DDOG'],
    pulse: 'active', stars: 141, remixes: 0,
    cover: {
      template: 'screener',
      title: { en: 'Inflection Point Screener', 'zh-CN': '拐点筛选器' },
      author: 'ivan',
      tickers: ['SHOP', 'CRWD', 'NET', 'DDOG'], domain: 'growth',
      series: { en: 'MARGIN ACCEL · 948 NAMES', 'zh-CN': '毛利加速 · 948 只' },
    },
  },
  {
    id: 'white-collar-crisis',
    creator: 'steven',
    title: { en: 'White-Collar Crisis Thesis Tracker', 'zh-CN': '白领危机主题追踪' },
    description: {
      en: 'Market-neutral basket tracking AI-driven compression in white-collar labor. Long staffing-disrupted vs hedged with admin-services.',
      'zh-CN': '追踪 AI 对白领岗位压缩的市场中性组合。多人力中介受冲击股，对冲行政服务股。',
    },
    tickers: ['ROL', 'WSO', 'CTAS'],
    pulse: 'active', stars: 99, remixes: 0,
    cover: {
      template: 'thesis',
      title: { en: 'White-Collar Crisis Thesis Tracker', 'zh-CN': '白领危机主题追踪' },
      author: 'steven',
      tickers: [], domain: 'macro', anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'RISK',
      kind: { en: 'Junior-analyst postings −18% YoY', 'zh-CN': '初级分析师岗位 −18% 同比' },
    },
  },
  {
    id: 'post-earnings-drift',
    creator: 'stock-king',
    title: { en: 'Post-Earnings Drift · Momentum', 'zh-CN': '财报后漂移 · 动量' },
    description: {
      en: 'US stocks that just reported strong beats with upward guidance. 5-day hold from open with stop-loss at −3% intraday.',
      'zh-CN': '刚发布超预期业绩并上调指引的美股。开盘买入持有 5 日，盘中 −3% 止损。',
    },
    tickers: ['AVGO', 'PANW', 'MU', 'ANET'],
    pulse: 'active', stars: 119, remixes: 0,
    cover: {
      template: 'screener',
      title: { en: 'Post-Earnings Drift · Momentum', 'zh-CN': '财报后漂移 · 动量' },
      author: 'stock-king',
      tickers: ['AVGO', 'PANW', 'MU', 'ANET'], domain: 'momentum',
      series: { en: 'POSITIVE GUIDANCE · 5D HOLD', 'zh-CN': '正面指引 · 持有 5 日' },
    },
  },
  {
    id: 'eight-ball-game',
    creator: 'furycom',
    title: { en: '8-Ball Pool · Casual Game', 'zh-CN': '8 号球台球 · 休闲游戏' },
    description: {
      en: 'HTML5 Canvas billiards with realistic physics, AI opponent, and async multiplayer. Top scores ranked weekly across the Alva community.',
      'zh-CN': 'HTML5 Canvas 台球游戏，真实物理引擎、AI 对手、异步多人对战。Alva 社区每周排名。',
    },
    tickers: [],
    pulse: 'active', stars: 95, remixes: 0,
    cover: {
      template: 'general',
      title: { en: '8-Ball Pool · Casual Game', 'zh-CN': '8 号球台球 · 休闲游戏' },
      author: 'furycom',
      tickers: [], domain: 'guide',
      kind:   { en: 'HIGH SCORE · GAME',     'zh-CN': '最高分 · 游戏' },
      anchor: '38,420',
      series: { en: 'CANVAS · MULTIPLAYER',  'zh-CN': 'CANVAS · 多人对战' },
    },
  },
  {
    id: 'nvda-earnings-beat',
    creator: 'dividend-ai',
    title: { en: 'NVDA Post-Beat Drift', 'zh-CN': 'NVDA 超预期后漂移' },
    description: {
      en: 'Tracks the 30-day forward path of NVDA after a positive EPS surprise + raised guidance. 11 historical triggers since 2021.',
      'zh-CN': '追踪 NVDA 在 EPS 超预期 + 上调指引后的 30 日前瞻路径。2021 年以来 11 次触发。',
    },
    tickers: ['NVDA'],
    pulse: 'active', stars: 184, remixes: 9, annualizedReturn: '+34.2%',
    cover: {
      template: 'what-if',
      title: { en: 'NVDA Post-Beat Drift', 'zh-CN': 'NVDA 超预期后漂移' },
      author: 'dividend-ai', tickers: ['NVDA'], domain: 'earnings',
      series: { en: '30D AFTER BEAT · 11×', 'zh-CN': '超预期后 30 日 · 11 次' },
      kind: { en: 'Historically Climbs', 'zh-CN': '历史上上涨' },
      anchor: '+9.2%',
      whatIfBars: [2.1, 4.8, -0.6, 6.2, 3.4, 1.5, -1.1, 5.7],
    },
  },
  {
    id: 'tsla-fsd',
    creator: 'kira-z',
    title: { en: 'TSLA FSD Catalyst Watcher', 'zh-CN': 'TSLA FSD 催化追踪' },
    description: {
      en: 'Long-running thesis tracking TSLA Full Self-Driving milestones, regulatory filings, and unsupervised-mode geofence expansion.',
      'zh-CN': '长期追踪特斯拉 FSD 里程碑、监管文件、无监督模式电子围栏扩张的主题。',
    },
    tickers: ['TSLA'],
    pulse: 'active', stars: 156, remixes: 8,
    cover: {
      template: 'thesis',
      title: { en: 'TSLA FSD Catalyst Watcher', 'zh-CN': 'TSLA FSD 催化追踪' },
      author: 'kira-z',
      tickers: ['TSLA'], domain: 'ai', anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'CATALYST',
      kind: { en: 'Robotaxi miles +38% vs prior week', 'zh-CN': 'Robotaxi 里程 +38% 较上周' },
    },
  },
  {
    id: 'aapl-buybacks',
    creator: 'capital-pulse',
    title: { en: 'AAPL Capital Return Pulse', 'zh-CN': 'AAPL 资本返还脉搏' },
    description: {
      en: 'Live feed of AAPL buyback authorizations, dividend changes, and treasury debt issuance. Surfaces material capital-allocation shifts as they hit the wire.',
      'zh-CN': '实时跟踪苹果回购授权、分红变动、债务发行。重大资本配置变化即时浮现。',
    },
    tickers: ['AAPL'],
    pulse: 'active', stars: 98, remixes: 3,
    cover: {
      template: 'general',
      title: { en: 'AAPL Capital Return Pulse', 'zh-CN': 'AAPL 资本返还脉搏' },
      author: 'capital-pulse', tickers: ['AAPL'], domain: 'alerts',
      kind:   { en: 'ALERTS · BUYBACK · LIVE',  'zh-CN': '提醒 · 回购 · 实时' },
      anchor: { en: '$110B auth',               'zh-CN': '$1100 亿授权' },
      series: { en: 'Q2 2026 · 4 EVENTS',       'zh-CN': 'Q2 2026 · 4 次事件' },
    },
  },
  {
    id: 'btc-funding',
    creator: 'derive-x',
    title: { en: 'BTC Funding Rate Squeeze', 'zh-CN': 'BTC 资金费率挤压' },
    description: {
      en: 'Cross-exchange BTC perpetual funding rate monitor. Alerts when funding turns deeply negative — historically a contrarian buy signal.',
      'zh-CN': '跨交易所 BTC 永续资金费率监控。资金费率深度转负时报警 — 历史上是反向买入信号。',
    },
    tickers: ['BTC'],
    pulse: 'active', stars: 142, remixes: 6,
    cover: {
      template: 'general',
      title: { en: 'BTC Funding Rate Squeeze', 'zh-CN': 'BTC 资金费率挤压' },
      author: 'derive-x', tickers: ['BTC'], domain: 'alerts',
      kind:   { en: 'ALERTS · LIVE · 5M',     'zh-CN': '提醒 · 实时 · 5M' },
      anchor: '−0.04%',
      series: { en: 'BINANCE · BYBIT · OKX',  'zh-CN': '币安 · BYBIT · OKX' },
    },
  },
  {
    id: 'powell-watch',
    creator: 'fomc-pulse',
    title: { en: 'Powell Speak Tracker', 'zh-CN': '鲍威尔讲话追踪' },
    description: {
      en: 'Sentiment & language-shift analysis across every Powell speech, FOMC statement, and Q&A. Surfaces hawkish/dovish tilt vs prior cycle.',
      'zh-CN': '每次鲍威尔演讲、FOMC 声明、问答的情绪和措辞迁移分析。对比上一周期鹰鸽倾向。',
    },
    tickers: [],
    pulse: 'active', stars: 211, remixes: 7,
    cover: {
      template: 'thesis',
      title: { en: 'Powell Speak Tracker', 'zh-CN': '鲍威尔讲话追踪' },
      author: 'fomc-pulse',
      tickers: [], domain: 'fed', anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'AMBIGUOUS',
      kind: { en: 'Hawkish tilt +0.6σ vs Mar FOMC', 'zh-CN': '鹰派倾向 +0.6σ 较 3 月 FOMC' },
    },
  },
  {
    id: 'meta-ai-capex',
    creator: 'capex-watch',
    title: { en: 'META AI Infra Capex Tracker', 'zh-CN': 'META AI 基建资本开支追踪' },
    description: {
      en: 'Quarterly tracking of Meta\'s AI infrastructure spend — datacenter buildout, GPU orders, and Reality Labs commitments vs analyst expectations.',
      'zh-CN': '季度追踪 Meta AI 基建支出 — 数据中心建设、GPU 订单、Reality Labs 投入对比分析师预期。',
    },
    tickers: ['META'],
    pulse: 'active', stars: 132, remixes: 4,
    cover: {
      template: 'thesis',
      title: { en: 'META AI Infra Capex Tracker', 'zh-CN': 'META AI 基建资本开支追踪' },
      author: 'capex-watch',
      tickers: ['META'], anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'CATALYST',
      kind: { en: 'Q1 capex $9.7B vs $8.2B est', 'zh-CN': 'Q1 资本支出 $97 亿 vs 预期 $82 亿' },
    },
  },
  {
    id: 'msft-azure',
    creator: 'cloud-pulse',
    title: { en: 'MSFT Azure Backlog Pulse', 'zh-CN': 'MSFT Azure 待履约订单脉搏' },
    description: {
      en: 'Tracks Azure remaining performance obligations (RPO), AI-workload share, and OpenAI compute reservations from earnings calls and 10-Q filings.',
      'zh-CN': '追踪 Azure 待履约订单（RPO）、AI 工作负载占比、OpenAI 算力预订，数据来自财报和 10-Q。',
    },
    tickers: ['MSFT'],
    pulse: 'active', stars: 167, remixes: 5,
    cover: {
      template: 'general',
      title: { en: 'MSFT Azure Backlog Pulse', 'zh-CN': 'MSFT Azure 待履约订单脉搏' },
      author: 'cloud-pulse', tickers: ['MSFT'],
      kind:   { en: 'BACKLOG · QUARTERLY',          'zh-CN': '待履约 · 季度' },
      anchor: { en: '$298B RPO',                    'zh-CN': '$2980 亿 RPO' },
      series: { en: '+24% YoY · AI MIX 38%',        'zh-CN': '+24% 同比 · AI 占比 38%' },
    },
  },
  {
    id: 'googl-antitrust',
    creator: 'reg-watch',
    title: { en: 'GOOGL Antitrust Catalyst Map', 'zh-CN': 'GOOGL 反垄断催化地图' },
    description: {
      en: 'Live map of all GOOGL DOJ / EU / state-AG cases. Court calendar, ruling dates, and historical price reactions to similar tech-antitrust events.',
      'zh-CN': '实时图谱：谷歌所有 DOJ / 欧盟 / 州检方案件。庭审日历、裁决日期、类似科技反垄断事件的历史价格反应。',
    },
    tickers: ['GOOGL'],
    pulse: 'active', stars: 89, remixes: 2,
    cover: {
      template: 'thesis',
      title: { en: 'GOOGL Antitrust Catalyst Map', 'zh-CN': 'GOOGL 反垄断催化地图' },
      author: 'reg-watch',
      tickers: ['GOOGL'], anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'RISK',
      kind: { en: 'DOJ remedy hearing in 12 days', 'zh-CN': 'DOJ 救济措施听证会 12 日后' },
    },
  },
  {
    id: 'ackman-activism',
    creator: 'activist-watch',
    title: { en: 'Ackman Activist Position Tracker', 'zh-CN': '艾克曼维权仓位追踪' },
    description: {
      en: 'Live monitor of Pershing Square 13D/13F filings, public letters, and proxy fights. Surfaces concentrated activist positions before they become consensus.',
      'zh-CN': '实时监控潘兴广场 13D/13F 文件、公开信、代理权之争。在共识形成前浮现集中维权仓位。',
    },
    tickers: ['CMG', 'HHC', 'GOOGL'],
    pulse: 'active', stars: 174, remixes: 6,
    cover: {
      template: 'general',
      title: { en: 'Ackman Activist Position Tracker', 'zh-CN': '艾克曼维权仓位追踪' },
      author: 'activist-watch',
      tickers: ['CMG', 'HHC', 'GOOGL'],
      kind:   { en: 'PORTFOLIO · CONCENTRATED',       'zh-CN': '组合 · 集中持仓' },
      anchor: { en: '8 holdings',                     'zh-CN': '8 个持仓' },
      series: { en: '$15B AUM · PERSHING SQUARE',     'zh-CN': '$150 亿 AUM · 潘兴广场' },
      portrait: {
        imageHash: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bill_Ackman_(26410186110)_(cropped).jpg?width=640',
        portraitH: 28, imageAspectRatio: 1.5, subjectName: 'Bill Ackman',
        license: 'CC-BY', source: 'https://commons.wikimedia.org/wiki/File:Bill_Ackman_(26410186110)_(cropped).jpg',
      },
    },
  },
  {
    id: 'dalio-macro',
    creator: 'all-weather',
    title: { en: 'Dalio Macro Cycle Tracker', 'zh-CN': '达里奥宏观周期追踪' },
    description: {
      en: "Tracks Ray Dalio's published macro framework — debt cycles, productivity gaps, and reserve-currency rotation signals. Auto-tags Bridgewater letters and posts.",
      'zh-CN': '追踪达里奥公开宏观框架 — 债务周期、生产力差距、储备货币轮换信号。自动标注桥水信件和推文。',
    },
    tickers: [],
    pulse: 'active', stars: 198, remixes: 4,
    cover: {
      template: 'thesis',
      title: { en: 'Dalio Macro Cycle Tracker', 'zh-CN': '达里奥宏观周期追踪' },
      author: 'all-weather',
      tickers: [], anchor: { en: 'APR 27', 'zh-CN': '4月27' }, category: 'AMBIGUOUS',
      kind: { en: 'Late long-term debt cycle · risk-off bias', 'zh-CN': '长期债务周期晚期 · 风险偏好下行' },
      portrait: {
        imageHash: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ray_Dalio_Sept_23_2017_NYC.jpg?width=640',
        portraitH: 25, imageAspectRatio: 1.78, subjectName: 'Ray Dalio',
        license: 'CC-BY-SA', source: 'https://commons.wikimedia.org/wiki/File:Ray_Dalio_Sept_23_2017_NYC.jpg',
      },
    },
  },
  {
    id: 'btc-contrarian',
    creator: 'furycom',
    title: { en: 'BTC Contrarian Crowd Reversal', 'zh-CN': 'BTC 反向人群反转' },
    description: {
      en: 'Mean-reversion strategy that fades crowd consensus using funding rates, long/short ratios, RSI, and Bollinger Bands to identify reversal entries.',
      'zh-CN': '均值回归策略，反向操作人群共识。使用资金费率、多空比、RSI、布林带识别反转入场。',
    },
    tickers: ['BTC'],
    pulse: 'active', stars: 181, remixes: 1,
    cover: {
      template: 'thesis',
      title: { en: 'BTC Contrarian Crowd Reversal', 'zh-CN': 'BTC 反向人群反转' },
      author: 'furycom',
      tickers: ['BTC'], anchor: { en: 'APR 28', 'zh-CN': '4月28' }, category: 'AMBIGUOUS',
      kind: { en: 'Funding −0.06% vs L/S 1.78x crowded', 'zh-CN': '资金费率 −0.06% vs 多空比 1.78x 拥挤' },
    },
  },
  {
    id: 'citrini-context',
    creator: 'harryzz',
    title: { en: 'Citrini Context', 'zh-CN': 'Citrini 上下文' },
    description: {
      en: 'Curated direct content from Citrini and team — X posts, Substack articles, and subscriber chat threads aggregated into a single chronological feed.',
      'zh-CN': 'Citrini 团队精选直接内容 — X 推文、Substack 文章、订阅者聊天串聚合成单一时序流。',
    },
    tickers: [],
    pulse: 'active', stars: 155, remixes: 0,
    cover: {
      template: 'general',
      title: { en: 'Citrini Context', 'zh-CN': 'Citrini 上下文' },
      author: 'harryzz',
      tickers: [], domain: 'guide',
      kind:   { en: 'CONTEXT FEED · DAILY',     'zh-CN': '上下文流 · 每日' },
      anchor: { en: '12 new posts',             'zh-CN': '12 篇新帖' },
      series: { en: 'X · SUBSTACK · CHAT',      'zh-CN': 'X · SUBSTACK · 聊天' },
    },
  },
  {
    id: 'defense-tech-space',
    creator: 'syeveline9',
    title: { en: 'Defense Tech and Space Stocks Tracker', 'zh-CN': '国防科技与航天股追踪' },
    description: {
      en: 'Three-pillar theme tracker covering commercial launch disruption, DoD software modernization, and commercial space-ISR across a 17-name universe.',
      'zh-CN': '三支柱主题追踪：商业发射颠覆、国防部软件现代化、商业航天 ISR，覆盖 17 只股票池。',
    },
    tickers: ['RKLB', 'PLTR', 'LMT', 'BA'],
    pulse: 'active', stars: 124, remixes: 2,
    cover: {
      template: 'thesis',
      title: { en: 'Defense Tech and Space Stocks Tracker', 'zh-CN': '国防科技与航天股追踪' },
      author: 'syeveline9',
      tickers: ['RKLB', 'PLTR', 'LMT', 'BA'], domain: 'defense',
      anchor: { en: 'APR 28', 'zh-CN': '4月28' }, category: 'CATALYST',
      kind: { en: 'Launch leg +2.4% vs ITA +0.6% WTD', 'zh-CN': '发射腿 +2.4% vs ITA +0.6% 本周' },
    },
  },
  {
    id: 'inflection-screener-v2',
    creator: 'ivan',
    title: { en: 'Inflection Point Screener', 'zh-CN': '拐点筛选器' },
    description: {
      en: 'US mid-caps where gross margins accelerate, revenue re-accelerates, and operating profitability turns. Top decile rebalanced weekly.',
      'zh-CN': '毛利加速、收入再加速、经营盈利反转的美股中盘股。Top 10% 每周再平衡。',
    },
    tickers: ['CRWD', 'NET', 'DDOG', 'SNOW'],
    pulse: 'active', stars: 118, remixes: 2,
    cover: {
      template: 'screener',
      title: { en: 'Inflection Point Screener', 'zh-CN': '拐点筛选器' },
      author: 'ivan',
      tickers: ['CRWD', 'NET', 'DDOG', 'SNOW'], domain: 'growth',
      series: { en: 'GROSS MARGIN ACCEL · WEEKLY', 'zh-CN': '毛利加速 · 每周' },
    },
  },
  {
    id: 'btc-crashed-46',
    creator: 'long-us-10x',
    title: { en: 'BTC Crashed 46% — Time to Buy?', 'zh-CN': 'BTC 跌 46% — 该买了吗？' },
    description: {
      en: 'Real-time 7-indicator scoring system using on-chain and derivatives data, auto-updated every 4 hours. Historical avg return 200%+ from prior bottom signals.',
      'zh-CN': '实时 7 指标打分系统，使用链上和衍生品数据，每 4 小时自动更新。历史底部信号后平均回报 200%+。',
    },
    tickers: ['BTC'],
    pulse: 'active', stars: 110, remixes: 1, annualizedReturn: '+200%',
    cover: {
      template: 'what-if',
      title: { en: 'BTC Crashed 46% — Time to Buy?', 'zh-CN': 'BTC 跌 46% — 该买了吗？' },
      author: 'long-us-10x', tickers: ['BTC'], domain: 'event_study',
      series: { en: 'BOTTOM SIGNAL · 7/7 BUY · 4H', 'zh-CN': '底部信号 · 7/7 买入 · 4H' },
      kind: { en: 'Historically Climbs', 'zh-CN': '历史上上涨' },
      anchor: '+182%',
      whatIfBars: [12, 28, 45, 38, 52, 41, 65, 58],
    },
  },
];

import type { Locale } from '@skill/types';
import { loc } from './loc';

/** Pick localized strings, returning a renderable card. */
export function resolveCard(d: ExplorePlaybookData, locale: Locale): ExplorePlaybook {
  const cover: CoverInput = {
    template: d.cover.template,
    title:   loc(d.cover.title, locale)!,
    author:  d.cover.author,
    tickers: d.cover.tickers,
    domain:  d.cover.domain,
    kind:    loc(d.cover.kind, locale),
    anchor:  loc(d.cover.anchor, locale),
    series:  loc(d.cover.series, locale),
    category: d.cover.category,
    whatIfBars: d.cover.whatIfBars,
    portrait: d.cover.portrait,
    locale,
  };
  return {
    id: d.id,
    creator: d.creator,
    title: loc(d.title, locale)!,
    description: loc(d.description, locale)!,
    tickers: d.tickers,
    pulse: d.pulse,
    stars: d.stars,
    remixes: d.remixes,
    annualizedReturn: d.annualizedReturn,
    cover,
  };
}
