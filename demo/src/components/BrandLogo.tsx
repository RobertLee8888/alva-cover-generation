// Brand logo with multi-source CDN fallback chain. Mirrors the spirit of
// SKILL src/image-fetcher.ts but in a browser-friendly form (img preload).

import { useEffect, useRef, useState } from 'react';

const JSDELIVR = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
const SIMPLEICONS_BLACK = (slug: string) =>
  `https://cdn.simpleicons.org/${slug}/000000`;
const MATERIAL = (name: string) =>
  `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`;

export function BrandLogo({
  slug, color, size, opacity, fallbackSymbol, x, y,
  innerInset = 0.10,
}: {
  slug: string;
  color: string;
  size: number;
  opacity: number;
  fallbackSymbol: string;
  x: number;
  y: number;
  innerInset?: number;
}) {
  const sources = [JSDELIVR(slug), SIMPLEICONS_BLACK(slug)];
  const [attempt, setAttempt] = useState(0);
  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;

  useEffect(() => {
    const list = sourcesRef.current;
    if (attempt >= list.length) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      if (img.naturalWidth === 0) setAttempt(a => a + 1);
    };
    img.onerror = () => { if (!cancelled) setAttempt(a => a + 1); };
    img.src = list[attempt]!;
    return () => { cancelled = true; };
  }, [attempt, slug]);

  const inset = size * innerInset;
  const innerSize = size * (1 - innerInset * 2);
  const url = attempt < sources.length ? sources[attempt]! : MATERIAL(fallbackSymbol);

  return (
    <foreignObject x={x + inset} y={y + inset} width={innerSize} height={innerSize}>
      <div
        // @ts-expect-error xmlns required for foreignObject children
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          width: '100%', height: '100%',
          backgroundColor: color,
          opacity,
          WebkitMaskImage: `url(${url})`,
          maskImage: `url(${url})`,
          WebkitMaskSize: 'contain', maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center', maskPosition: 'center',
        }}
      />
    </foreignObject>
  );
}
