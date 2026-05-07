import type { ExplorePlaybook } from '../data/playbooks';
import { CoverRenderer } from './CoverRenderer';

export function PlaybookCard({ p }: { p: ExplorePlaybook }) {
  const initial = p.creator.charAt(0).toUpperCase();
  return (
    <article className="card">
      <div className="cover">
        <CoverRenderer input={p.cover} />
      </div>
      <div className="body">
        <h3 className="title">{p.title}</h3>
        <p className="description">{p.description}</p>
        <div className="footer">
          <span className="creator">
            <span className="avatar">{initial}</span>
            <span>{p.creator}</span>
          </span>
          <span className="stats">
            <span>★ {p.stars}</span>
            {p.remixes > 0 && <span>⤴ {p.remixes}</span>}
            {p.annualizedReturn && <span style={{ color: '#1F8754', fontWeight: 600 }}>{p.annualizedReturn}</span>}
          </span>
        </div>
      </div>
    </article>
  );
}
