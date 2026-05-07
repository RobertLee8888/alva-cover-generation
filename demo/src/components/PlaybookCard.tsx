// Mirrors src/app/components/shared/PlaybookCard.tsx in the alva web app:
// 4px cover inset, tag row, title (Inter 16/22 600), description (12/20),
// creator avatar + ★/⤴ stat row at the bottom.

import { useState, useMemo } from 'react';
import { CoverRenderer } from './CoverRenderer';
import { PlaybookTags, buildTags } from './PlaybookTags';
import { Avatar } from './Avatar';
import { CdnIcon } from './CdnIcon';
import { useLiveInput } from './useLiveInput';
import { generateCover } from '@skill/cover-gen';
import { hslToRgb } from '@skill/color';
import { rgbToCss } from './color-utils';
import type { ExplorePlaybook } from '../data/playbooks';

export function PlaybookCard({ p, staggerMs = 0 }: { p: ExplorePlaybook; staggerMs?: number }) {
  const tags = buildTags({
    template: p.cover.template,
    domain: p.cover.domain,
    tickers: p.tickers,
  });

  const [hovered, setHovered] = useState(false);

  // Live perturbation: re-jitters numerical content every 10s.
  // bg/icon stay stable (derived from title+tickers, not from jittered numbers).
  const liveInput = useLiveInput(p.cover, staggerMs);
  const cover = useMemo(() => generateCover(liveInput), [liveInput]);
  const shadowColor = useMemo(() => {
    const { H, S } = cover.bg.hsl;
    return rgbToCss(hslToRgb(H, Math.min(S + 0.10, 0.40), 0.30), 0.14);
  }, [cover]);
  // SKILL-driven font stack — primary (e.g. Delight) + locale-aware CJK fallbacks.
  const metaFontFamily = useMemo(
    () => [cover.fonts.metadata.primary, ...cover.fonts.metadata.fallbacks]
      .map(f => /[ ]/.test(f) && !f.startsWith('"') ? `"${f}"` : f)
      .join(', '),
    [cover.fonts.metadata],
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 4px 12px -2px ${shadowColor}` : '0 0 0 0 transparent',
        // Match alva-freshman: lift smoothly on enter, snap back on leave.
        transition: hovered
          ? 'transform 130ms cubic-bezier(0.2, 0, 0, 1), box-shadow 130ms cubic-bezier(0.2, 0, 0, 1)'
          : 'none',
      }}
    >
      <div style={{
        margin: '4px 4px 0 4px',
        width: 'calc(100% - 8px)',
        aspectRatio: '320 / 140',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <CoverRenderer input={liveInput} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 12px' }}>
        <PlaybookTags tags={tags} locale={p.cover.locale ?? 'en'} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{
            fontSize: 16, lineHeight: '22px', fontWeight: 600,
            fontFamily: metaFontFamily,
            color: 'rgba(0,0,0,0.9)', letterSpacing: '0.16px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            margin: 0,
          }}>
            {p.title}
          </p>
          <p style={{
            fontSize: 12, lineHeight: '20px',
            fontFamily: metaFontFamily,
            color: 'rgba(0,0,0,0.5)', letterSpacing: '0.12px',
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {p.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, height: 22 }}>
            <Avatar name={p.creator} size={22} />
            <span style={{
              fontSize: 14, lineHeight: '22px',
              color: 'rgba(0,0,0,0.9)', letterSpacing: '0.14px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {p.creator}
            </span>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            color: 'rgba(0,0,0,0.9)',
          }}>
            <Stat icon="show-l" value={p.stars} />
            <Stat icon="remix-l" value={p.remixes} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value }: { icon: string; value: number }) {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 4,
      fontSize: 14, lineHeight: '22px', letterSpacing: '0.14px',
    }}>
      <CdnIcon name={icon} size={16} />
      {value}
    </span>
  );
}
