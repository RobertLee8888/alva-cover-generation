// Pure SVG renderer for the SKILL's CoverOutput. Every visible glyph and
// shape comes from data the SKILL produced — no hardcoded layout here.
// To change cover behavior, edit src/cover-gen.ts (NOT this file).

import { useMemo } from 'react';
import type { CoverInput, CoverOutput, ContentElement, RGB } from '@skill/types';
import { generateCover } from '@skill/cover-gen';
import { rgbToCss } from './color-utils';
import { BrandLogo } from './BrandLogo';

const COVER_W = 320;
const COVER_H = 140;
const FONT = 'Inter, system-ui, sans-serif';

export function CoverRenderer({ input }: { input: CoverInput }) {
  const cover: CoverOutput = useMemo(() => generateCover(input), [input]);
  const { bg, icon, text, content } = cover;
  const uid = useMemo(() => `cv${Math.random().toString(36).slice(2, 9)}`, []);
  const gradId = `${uid}-bg`;
  const portrait = bg.portraitRender;

  return (
    <svg
      viewBox={`0 0 ${COVER_W} ${COVER_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={rgbToCss(bg.top)} />
          <stop offset="100%" stopColor={rgbToCss(bg.bot)} />
        </linearGradient>
      </defs>

      <rect width={COVER_W} height={COVER_H} fill={`url(#${gradId})`} />

      {portrait && (
        <image
          href={portrait.href}
          x={0} y={0} width={COVER_W} height={COVER_H}
          preserveAspectRatio={portrait.crop.svgPreserveAspectRatio}
          opacity={portrait.opacity}
          style={{ filter: `saturate(${1 + portrait.filters.saturation}) contrast(${1 + portrait.filters.contrast}) brightness(${1 + portrait.filters.exposure})` }}
        />
      )}

      {icon?.kind === 'material' && (
        <foreignObject x={icon.x} y={icon.y} width={icon.size} height={icon.size}>
          <div
            // @ts-expect-error xmlns required for foreignObject children
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: '100%', height: '100%',
              backgroundColor: rgbToCss(icon.color),
              opacity: icon.opacity,
              WebkitMaskImage: `url(${materialUrl(icon.symbol)})`,
              maskImage: `url(${materialUrl(icon.symbol)})`,
              WebkitMaskSize: 'contain', maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center', maskPosition: 'center',
            }}
          />
        </foreignObject>
      )}

      {icon?.kind === 'brand' && (
        <BrandLogo
          slug={icon.ticker.toLowerCase()}
          color={rgbToCssHex(icon.color)}
          size={icon.size} opacity={icon.opacity}
          x={icon.x} y={icon.y}
          fallbackSymbol="memory"
        />
      )}

      {content.map((el, i) => (
        <ContentEl key={i} el={el} text={text} />
      ))}
    </svg>
  );
}

function ContentEl({ el, text }: { el: ContentElement; text: { base: RGB; hero: RGB; support: RGB; label: RGB } }) {
  const baseCss = rgbToCss(text.base);
  const heroCss = rgbToCss(text.hero);

  switch (el.kind) {
    case 'label':
      return (
        <text
          x={el.x} y={el.y}
          fill={baseCss} fillOpacity={0.55}
          fontFamily={FONT} fontSize={el.fontSize} fontWeight={600}
          letterSpacing="0.16em" dominantBaseline="hanging"
        >
          {el.text.toUpperCase()}
        </text>
      );

    case 'ticker':
      return (
        <text
          x={el.x} y={el.y}
          fill={baseCss} fillOpacity={0.92}
          fontFamily={FONT} fontSize={el.fontSize} fontWeight={600}
          dominantBaseline="hanging"
        >
          {el.text}
        </text>
      );

    case 'peer-chips': {
      let cursor = el.x;
      const chips = el.tickers.map((t, i) => {
        const w = el.chipPaddingX * 2 + t.length * (el.chipFontSize * 0.62);
        const chip = (
          <g key={i}>
            <rect
              x={cursor} y={el.y - 1}
              width={w} height={el.chipHeight}
              rx={el.chipBorderRadius}
              fill={baseCss} fillOpacity={0.10}
            />
            <text
              x={cursor + w / 2} y={el.textBaselineY}
              fill={baseCss} fillOpacity={0.72}
              fontFamily={FONT} fontSize={el.chipFontSize} fontWeight={600}
              letterSpacing="0.10em"
              textAnchor="middle" dominantBaseline="middle"
            >
              {t}
            </text>
          </g>
        );
        cursor += w + el.chipGap;
        return chip;
      });
      return <>{chips}</>;
    }

    case 'delta': {
      const cat = el.category;
      const catColor = cat === 'RISK' ? '#C0392B' : cat === 'CATALYST' ? '#1F8754' : '#9A7B2E';
      const lines = el.text.split('\n');
      return (
        <>
          <g>
            <circle cx={el.categoryX + 3} cy={el.categoryY} r={el.categoryDotSize / 2} fill={catColor} />
            <text
              x={el.categoryX + 10} y={el.categoryY}
              fill={catColor}
              fontFamily={FONT} fontSize={el.categoryFontSize} fontWeight={600}
              letterSpacing="0.16em" dominantBaseline="middle"
            >
              {cat}
            </text>
          </g>
          {lines.map((line, i) => (
            <text
              key={i}
              x={el.x} y={el.y + i * el.lineHeight}
              fill={baseCss} fillOpacity={0.92}
              fontFamily={FONT} fontSize={el.fontSize} fontWeight={600}
              dominantBaseline="hanging"
            >
              {line}
            </text>
          ))}
        </>
      );
    }

    case 'verb':
      return (
        <text
          x={el.x} y={el.y}
          fill={baseCss} fillOpacity={0.55}
          fontFamily={FONT} fontSize={el.fontSize} fontWeight={600}
          letterSpacing="0.16em" dominantBaseline="hanging"
        >
          {el.text.toUpperCase()}
        </text>
      );

    case 'hero-pct':
      return (
        <text
          x={el.x} y={el.y}
          fill={heroCss}
          fontFamily={FONT} fontSize={el.fontSize} fontWeight={600}
          letterSpacing="-0.02em" dominantBaseline="hanging"
        >
          {el.text}
        </text>
      );

    case 'hero-pulse':
      return (
        <text
          x={el.x} y={el.y}
          fill={baseCss} fillOpacity={0.92}
          fontFamily={FONT} fontSize={el.fontSize} fontWeight={600}
          dominantBaseline="hanging"
        >
          {el.text}
        </text>
      );

    case 'series':
      return (
        <text
          x={el.x} y={el.y}
          fill={baseCss} fillOpacity={0.55}
          fontFamily={FONT} fontSize={9} fontWeight={600}
          letterSpacing="0.16em" dominantBaseline="hanging"
        >
          {el.text.toUpperCase()}
        </text>
      );

    case 'bars':
      return (
        <>
          {el.bars.length > 0 && (
            <line
              x1={184} x2={292} y1={el.zeroLineY} y2={el.zeroLineY}
              stroke={baseCss} strokeOpacity={0.15} strokeWidth={0.5}
            />
          )}
          {el.bars.map((b, i) => (
            <rect
              key={i}
              x={b.x} y={b.y} width={b.width} height={b.height}
              fill={rgbToCss(b.color)} fillOpacity={0.55} rx={1}
            />
          ))}
        </>
      );

    case 'chip':
    case 'delta-badge':
    case 'delta-stack':
      return null; // not currently emitted by the SKILL for our inputs

    default:
      return null;
  }
}

function materialUrl(name: string): string {
  // Google Material Symbols static SVG endpoint — same one src/icon-mapping.ts
  // returns. Inlined here so the renderer doesn't need a build step on the URL.
  return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`;
}

function rgbToCssHex({ r, g, b }: RGB): string {
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}
