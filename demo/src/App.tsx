import { useMemo, useState } from 'react';
import { PLAYBOOKS } from './data/playbooks';
import { PlaybookCard } from './components/PlaybookCard';
import { LocaleSwitcher } from './components/LocaleSwitcher';
import { STRINGS } from './i18n';
import type { Locale, Template } from '@skill/types';

type TabKey = 'all' | Template;

export function App() {
  const [active, setActive] = useState<TabKey>('all');
  const [locale, setLocale] = useState<Locale>('en');
  const t = STRINGS[locale];

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: PLAYBOOKS.length, screener: 0, thesis: 0, 'what-if': 0, general: 0 };
    for (const p of PLAYBOOKS) c[p.cover.template]++;
    return c;
  }, []);

  const filtered = useMemo(
    () => active === 'all' ? PLAYBOOKS : PLAYBOOKS.filter(p => p.cover.template === active),
    [active],
  );

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'all',      label: t.tabAll },
    { key: 'screener', label: t.tabScreener },
    { key: 'thesis',   label: t.tabThesis },
    { key: 'what-if',  label: t.tabWhatIf },
    { key: 'general',  label: t.tabGeneral },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <h1>{t.pageTitle}</h1>
          <LocaleSwitcher value={locale} onChange={setLocale} label={t.langLabel} />
        </div>
        <p>{t.intro(PLAYBOOKS.length)}</p>
        <div className="meta">
          <a href="https://github.com/RobertLee8888/alva-cover-generation" target="_blank" rel="noreferrer">{t.linkSource}</a>
          <a href="https://github.com/RobertLee8888/alva-cover-generation/blob/main/SKILL.md" target="_blank" rel="noreferrer">{t.linkSkill}</a>
          <a href="https://www.alva.baby/#explore-2" target="_blank" rel="noreferrer">{t.linkAlva}</a>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label={t.filterLabel}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            className={`tab ${active === tab.key ? 'is-active' : ''}`}
            onClick={() => setActive(tab.key)}
          >
            <span>{tab.label}</span>
            <span className="tab-count">{counts[tab.key]}</span>
          </button>
        ))}
      </nav>

      <section className="grid">
        {filtered.map(p => (
          <PlaybookCard
            key={p.id + locale}
            p={{ ...p, cover: { ...p.cover, locale } }}
          />
        ))}
      </section>
    </div>
  );
}
