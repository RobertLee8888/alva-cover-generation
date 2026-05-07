// Demo's own UI strings (header, tabs, footer). Cover content is localized
// by the SKILL via input.locale. Keeping the locale type aligned with SKILL's.

import type { Locale } from '@skill/types';

export const LOCALE_LABELS: Record<Locale, string> = {
  'en':    'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
};

type DemoStrings = {
  pageTitle:   string;
  intro:       (n: number) => string;
  linkSource:  string;
  linkSkill:   string;
  linkAlva:    string;
  filterLabel: string;
  tabAll:      string;
  tabScreener: string;
  tabThesis:   string;
  tabWhatIf:   string;
  tabGeneral:  string;
  langLabel:   string;
};

// Tag-pill translations (template + domain). Used by PlaybookTags.
// SKILL doesn't ship translations for these — they're card chrome, not cover content.
export const TEMPLATE_LABELS: Record<Locale, Record<'screener'|'thesis'|'what-if'|'general', string>> = {
  'en':    { screener: 'Screener', thesis: 'Thesis',  'what-if': 'What-If',  general: 'General' },
  'zh-CN': { screener: '筛选器',    thesis: '主题',    'what-if': '事件研究',  general: '通用' },
  'zh-TW': { screener: '篩選器',    thesis: '主題',    'what-if': '事件研究',  general: '通用' },
  'ja-JP': { screener: 'スクリーナー', thesis: 'テーマ', 'what-if': 'イベント',  general: '一般' },
  'ko-KR': { screener: '스크리너',   thesis: '테마',    'what-if': '이벤트',    general: '일반' },
};

const DOMAIN_EN: Record<string, string> = {
  tech: 'Tech', software: 'Software', ai: 'AI', crypto: 'Crypto',
  dividend: 'Dividend', value: 'Value', growth: 'Growth', momentum: 'Momentum',
  defense: 'Defense', energy: 'Energy', renewables: 'Renewables', biotech: 'Biotech',
  healthcare: 'Healthcare', retail: 'Retail', consumer_staples: 'Staples',
  real_estate: 'REIT', banks: 'Banks', fed: 'Fed', macro: 'Macro', rates: 'Rates',
  fx: 'FX', commodities: 'Commodities', trend_up: 'Bullish', trend_down: 'Bearish',
  trend_flat: 'Flat', event_study: 'Event Study', earnings: 'Earnings',
  guide: 'Guide', weekly: 'Weekly', review: 'Review', watchlist: 'Watchlist',
  alerts: 'Alerts', leaderboard: 'Leaderboard',
};
const DOMAIN_CN: Record<string, string> = {
  tech: '科技', software: '软件', ai: '人工智能', crypto: '加密',
  dividend: '红利', value: '价值', growth: '成长', momentum: '动量',
  defense: '国防', energy: '能源', renewables: '新能源', biotech: '生物科技',
  healthcare: '医疗', retail: '零售', consumer_staples: '日用消费',
  real_estate: '地产', banks: '银行', fed: '美联储', macro: '宏观', rates: '利率',
  fx: '外汇', commodities: '大宗', trend_up: '看多', trend_down: '看空',
  trend_flat: '震荡', event_study: '事件研究', earnings: '财报',
  guide: '指南', weekly: '周报', review: '复盘', watchlist: '观察清单',
  alerts: '提醒', leaderboard: '排行榜',
};
const DOMAIN_TW: Record<string, string> = {
  tech: '科技', software: '軟體', ai: '人工智慧', crypto: '加密',
  dividend: '股息', value: '價值', growth: '成長', momentum: '動量',
  defense: '國防', energy: '能源', renewables: '新能源', biotech: '生技',
  healthcare: '醫療', retail: '零售', consumer_staples: '日用消費',
  real_estate: '不動產', banks: '銀行', fed: '聯準會', macro: '總體', rates: '利率',
  fx: '外匯', commodities: '原物料', trend_up: '看多', trend_down: '看空',
  trend_flat: '震盪', event_study: '事件研究', earnings: '財報',
  guide: '指南', weekly: '週報', review: '回顧', watchlist: '觀察清單',
  alerts: '警示', leaderboard: '排行榜',
};
const DOMAIN_JP: Record<string, string> = {
  tech: 'テック', software: 'ソフトウェア', ai: 'AI', crypto: 'クリプト',
  dividend: '配当', value: 'バリュー', growth: 'グロース', momentum: 'モメンタム',
  defense: '防衛', energy: 'エネルギー', renewables: '再エネ', biotech: 'バイオ',
  healthcare: 'ヘルスケア', retail: '小売', consumer_staples: '日用品',
  real_estate: '不動産', banks: '銀行', fed: 'FRB', macro: 'マクロ', rates: '金利',
  fx: 'FX', commodities: '商品', trend_up: '強気', trend_down: '弱気',
  trend_flat: 'レンジ', event_study: 'イベント研究', earnings: '決算',
  guide: 'ガイド', weekly: 'ウィークリー', review: 'レビュー', watchlist: 'ウォッチ',
  alerts: 'アラート', leaderboard: 'ランキング',
};
const DOMAIN_KR: Record<string, string> = {
  tech: '테크', software: '소프트웨어', ai: 'AI', crypto: '암호화폐',
  dividend: '배당', value: '가치', growth: '성장', momentum: '모멘텀',
  defense: '방산', energy: '에너지', renewables: '신재생', biotech: '바이오',
  healthcare: '헬스케어', retail: '소매', consumer_staples: '필수소비재',
  real_estate: '부동산', banks: '은행', fed: '연준', macro: '거시', rates: '금리',
  fx: 'FX', commodities: '원자재', trend_up: '강세', trend_down: '약세',
  trend_flat: '횡보', event_study: '이벤트 연구', earnings: '실적',
  guide: '가이드', weekly: '주간', review: '리뷰', watchlist: '관심',
  alerts: '알림', leaderboard: '순위',
};

export const DOMAIN_LABELS: Record<Locale, Record<string, string>> = {
  'en': DOMAIN_EN, 'zh-CN': DOMAIN_CN, 'zh-TW': DOMAIN_TW, 'ja-JP': DOMAIN_JP, 'ko-KR': DOMAIN_KR,
};

export const STRINGS: Record<Locale, DemoStrings> = {
  'en': {
    pageTitle:   'Alva · Playbook Cover Showcase',
    intro:       (n) => `Live grid of ${n} playbook covers — every card rendered by the cover-generation skill in this repo. Edit src/cover-gen.ts (or any file under src/) and rebuild to see the change ripple through every card.`,
    linkSource:  'GitHub →',
    linkSkill:   'SKILL.md →',
    linkAlva:    'alva.baby →',
    filterLabel: 'Filter by template',
    tabAll:      'All',
    tabScreener: 'Screener',
    tabThesis:   'Thesis',
    tabWhatIf:   'What-If',
    tabGeneral:  'General',
    langLabel:   'Language',
  },
  'zh-CN': {
    pageTitle:   'Alva · Playbook 封面展示',
    intro:       (n) => `${n} 张封面的实时网格，每张都由本仓库的 cover-generation skill 渲染。修改 src/cover-gen.ts（或 src/ 下任意文件）后重新构建，所有卡片即刻同步更新。`,
    linkSource:  'GitHub →',
    linkSkill:   'SKILL.md →',
    linkAlva:    'alva.baby →',
    filterLabel: '按模板筛选',
    tabAll:      '全部',
    tabScreener: '筛选器',
    tabThesis:   '主题',
    tabWhatIf:   '事件研究',
    tabGeneral:  '通用',
    langLabel:   '语言',
  },
  'zh-TW': {
    pageTitle:   'Alva · Playbook 封面展示',
    intro:       (n) => `${n} 張封面的即時網格，每張都由本倉庫的 cover-generation skill 渲染。修改 src/cover-gen.ts（或 src/ 下任意檔案）後重新建置，所有卡片即刻同步更新。`,
    linkSource:  'GitHub →',
    linkSkill:   'SKILL.md →',
    linkAlva:    'alva.baby →',
    filterLabel: '依範本篩選',
    tabAll:      '全部',
    tabScreener: '篩選器',
    tabThesis:   '主題',
    tabWhatIf:   '事件研究',
    tabGeneral:  '通用',
    langLabel:   '語言',
  },
  'ja-JP': {
    pageTitle:   'Alva · Playbook カバー ショーケース',
    intro:       (n) => `${n} 枚のカバーをリアルタイム表示。すべて本リポジトリの cover-generation skill で生成。src/cover-gen.ts （または src/ 配下のファイル）を編集すれば全カードに反映されます。`,
    linkSource:  'GitHub →',
    linkSkill:   'SKILL.md →',
    linkAlva:    'alva.baby →',
    filterLabel: 'テンプレートで絞り込み',
    tabAll:      'すべて',
    tabScreener: 'スクリーナー',
    tabThesis:   'テーマ',
    tabWhatIf:   'イベント',
    tabGeneral:  '一般',
    langLabel:   '言語',
  },
  'ko-KR': {
    pageTitle:   'Alva · Playbook 커버 쇼케이스',
    intro:       (n) => `${n} 개의 커버를 실시간으로 표시합니다. 모두 본 저장소의 cover-generation skill 로 생성. src/cover-gen.ts (또는 src/ 하위 파일)을 수정하면 모든 카드에 반영됩니다.`,
    linkSource:  'GitHub →',
    linkSkill:   'SKILL.md →',
    linkAlva:    'alva.baby →',
    filterLabel: '템플릿으로 필터',
    tabAll:      '전체',
    tabScreener: '스크리너',
    tabThesis:   '테마',
    tabWhatIf:   '이벤트',
    tabGeneral:  '일반',
    langLabel:   '언어',
  },
};
