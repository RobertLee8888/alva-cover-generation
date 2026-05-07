import { useMemo, useState } from 'react';
import { PLAYBOOKS } from './data/playbooks';
import { PlaybookCard } from './components/PlaybookCard';
import type { Template } from '@skill/types';

type TabKey = 'all' | Template;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'screener', label: 'Screener' },
  { key: 'thesis', label: 'Thesis' },
  { key: 'what-if', label: 'What-If' },
  { key: 'general', label: 'General' },
];

export function App() {
  const [active, setActive] = useState<TabKey>('all');

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: PLAYBOOKS.length, screener: 0, thesis: 0, 'what-if': 0, general: 0 };
    for (const p of PLAYBOOKS) c[p.cover.template]++;
    return c;
  }, []);

  const filtered = useMemo(
    () => active === 'all' ? PLAYBOOKS : PLAYBOOKS.filter(p => p.cover.template === active),
    [active],
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>Alva · Playbook Cover Showcase</h1>
        <p>
          Live grid of {PLAYBOOKS.length} playbook covers — every card rendered
          by the cover-generation skill in this repo. Edit{' '}
          <code>src/cover-gen.ts</code> (or any file under <code>src/</code>) and
          rebuild to see the change ripple through every card.
        </p>
        <div className="meta">
          <a href="https://github.com/RobertLee8888/alva-cover-generation" target="_blank" rel="noreferrer">GitHub →</a>
          <a href="https://github.com/RobertLee8888/alva-cover-generation/blob/main/SKILL.md" target="_blank" rel="noreferrer">SKILL.md →</a>
          <a href="https://www.alva.baby/#explore-2" target="_blank" rel="noreferrer">alva.baby →</a>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Filter by template">
        {TABS.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            className={`tab ${active === t.key ? 'is-active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            <span>{t.label}</span>
            <span className="tab-count">{counts[t.key]}</span>
          </button>
        ))}
      </nav>

      <section className="grid">
        {filtered.map(p => (
          <PlaybookCard key={p.id} p={p} />
        ))}
      </section>
    </div>
  );
}
