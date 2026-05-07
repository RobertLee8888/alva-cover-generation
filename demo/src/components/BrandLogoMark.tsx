// 10×10 inline brand mark for tag pills. HTML <span>, same fallback chain
// as <BrandLogo> but smaller and inline (not inside <foreignObject>).

import { useEffect, useRef, useState } from 'react';

const JSDELIVR = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
const SIMPLEICONS_BLACK = (slug: string) =>
  `https://cdn.simpleicons.org/${slug}/000000`;
const MATERIAL = (name: string) =>
  `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`;

export function BrandLogoMark({
  slug, color, fallbackSymbol, size = 10,
}: {
  slug: string;
  color: string;
  fallbackSymbol: string;
  size?: number;
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
    img.onload = () => { if (!cancelled && img.naturalWidth === 0) setAttempt(a => a + 1); };
    img.onerror = () => { if (!cancelled) setAttempt(a => a + 1); };
    img.src = list[attempt]!;
    return () => { cancelled = true; };
  }, [attempt, slug]);

  const colorCss = color.startsWith('#') ? color : `#${color}`;
  const url = attempt < sources.length ? sources[attempt]! : MATERIAL(fallbackSymbol);

  return (
    <span style={{
      display: 'inline-block', width: size, height: size, flexShrink: 0,
      backgroundColor: colorCss,
      WebkitMaskImage: `url(${url})`, maskImage: `url(${url})`,
      WebkitMaskSize: 'contain', maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center', maskPosition: 'center',
    }} />
  );
}
