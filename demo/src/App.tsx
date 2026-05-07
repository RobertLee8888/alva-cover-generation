import { PLAYBOOKS } from './data/playbooks';
import { PlaybookCard } from './components/PlaybookCard';

export function App() {
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
          <a href="https://github.com/RobertLee8888/alva-cover-generation" target="_blank" rel="noreferrer">
            GitHub →
          </a>
          <a href="https://github.com/RobertLee8888/alva-cover-generation/blob/main/SKILL.md" target="_blank" rel="noreferrer">
            SKILL.md →
          </a>
          <a href="https://www.alva.baby/#explore-2" target="_blank" rel="noreferrer">
            alva.baby →
          </a>
        </div>
      </header>

      <section className="grid">
        {PLAYBOOKS.map(p => (
          <PlaybookCard key={p.id} p={p} />
        ))}
      </section>
    </div>
  );
}
