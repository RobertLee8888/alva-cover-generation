// Renders the SKILL's CoverOutput as SVG.
//
// CONSTRAINT: every visible value (color, opacity, position, font size, ...)
// must come from the SKILL output OR from `skill-gaps.ts` — which is a
// transitional file that lists values the SKILL should expose but doesn't yet.
// No constants live in this file.
//
// To change cover behavior: edit src/cover-gen.ts (or, where the gap requires
// it, the corresponding entry in skill-gaps.ts AND open a SKILL gap to
// migrate it). Never edit this file with new values.

import { useMemo } from 'react';
import type { CoverInput, CoverOutput, ContentElement, RGB, TextPalette } from '@skill/types';
import { generateCover } from '@skill/cover-gen';
import { materialSymbolUrl } from '@skill/icon-mapping';
import { rgbToCss } from './color-utils';
import { BrandLogo } from './BrandLogo';
import {
  COVER_W, COVER_H, FONT_FAMILY,
  CATEGORY_COLORS, TYPOGRAPHY, CHIP_STYLE, BARS_STYLE,
} from './skill-gaps';

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
              WebkitMaskImage: `url(${materialSymbolUrl(icon.symbol)})`,
              maskImage: `url(${materialSymbolUrl(icon.symbol)})`,
              WebkitMaskSize: 'contain', maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center', maskPosition: 'center',
            }}
          />
        </foreignObject>
      )}

      {icon?.kind === 'brand' && (
        <BrandLogo
          slug={icon.logoSlug}
          color={rgbToCssHex(icon.color)}
          size={icon.size} opacity={icon.opacity}
          x={icon.x} y={icon.y}
          fallbackSymbol={icon.fallbackSymbol}
        />
      )}

      {content.map((el, i) => (
        <ContentEl key={i} el={el} text={text} />
      ))}
    </svg>
  );
}

function paletteColor(text: TextPalette, role: keyof TextPalette): string {
  return rgbToCss(text[role]);
}

function ContentEl({ el, text }: { el: ContentElement; text: TextPalette }) {
  switch (el.kind) {
    case 'label': {
      const t = TYPOGRAPHY.caps;
      return (
        <text
          x={el.x} y={el.y}
          fill={paletteColor(text, t.paletteRole)}
          fontFamily={FONT_FAMILY} fontSize={el.fontSize} fontWeight={t.fontWeight}
          letterSpacing={t.letterSpacing} dominantBaseline="hanging"
        >
          {el.text.toUpperCase()}
        </text>
      );
    }

    case 'verb': {
      const t = TYPOGRAPHY.caps;
      return (
        <text
          x={el.x} y={el.y}
          fill={paletteColor(text, t.paletteRole)}
          fontFamily={FONT_FAMILY} fontSize={el.fontSize} fontWeight={t.fontWeight}
          letterSpacing={t.letterSpacing} dominantBaseline="hanging"
        >
          {el.text.toUpperCase()}
        </text>
      );
    }

    case 'series': {
      const t = TYPOGRAPHY.caps;
      return (
        <text
          x={el.x} y={el.y}
          fill={paletteColor(text, t.paletteRole)}
          fontFamily={FONT_FAMILY} fontSize={9} fontWeight={t.fontWeight}
          letterSpacing={t.letterSpacing} dominantBaseline="hanging"
        >
          {el.text.toUpperCase()}
        </text>
      );
    }

    case 'ticker':
    case 'hero-pulse': {
      const t = TYPOGRAPHY.hero;
      return (
        <text
          x={el.x} y={el.y}
          fill={paletteColor(text, t.paletteRole)}
          fontFamily={FONT_FAMILY} fontSize={el.fontSize} fontWeight={t.fontWeight}
          letterSpacing={t.letterSpacing} dominantBaseline="hanging"
        >
          {el.text}
        </text>
      );
    }

    case 'hero-pct': {
      const t = TYPOGRAPHY.heroPct;
      return (
        <text
          x={el.x} y={el.y}
          fill={paletteColor(text, t.paletteRole)}
          fontFamily={FONT_FAMILY} fontSize={el.fontSize} fontWeight={t.fontWeight}
          letterSpacing={t.letterSpacing} dominantBaseline="hanging"
        >
          {el.text}
        </text>
      );
    }

    case 'peer-chips': {
      const t = TYPOGRAPHY.chipText;
      const bgRgba = rgbToCss(text[CHIP_STYLE.bgRole], CHIP_STYLE.bgOpacity);
      const fg = paletteColor(text, t.paletteRole);
      let cursor = el.x;
      const chips = el.tickers.map((tk, i) => {
        const w = el.chipPaddingX * 2 + tk.length * (el.chipFontSize * 0.62);
        const chip = (
          <g key={i}>
            <rect
              x={cursor} y={el.y - 1}
              width={w} height={el.chipHeight}
              rx={el.chipBorderRadius}
              fill={bgRgba}
            />
            <text
              x={cursor + w / 2} y={el.textBaselineY}
              fill={fg}
              fontFamily={FONT_FAMILY} fontSize={el.chipFontSize}
              fontWeight={t.fontWeight} letterSpacing={t.letterSpacing}
              textAnchor="middle" dominantBaseline="middle"
            >
              {tk}
            </text>
          </g>
        );
        cursor += w + el.chipGap;
        return chip;
      });
      return <>{chips}</>;
    }

    case 'delta': {
      const t = TYPOGRAPHY.hero;
      const catColor = CATEGORY_COLORS[el.category];
      const lines = el.text.split('\n');
      const bodyColor = paletteColor(text, t.paletteRole);
      return (
        <>
          <g>
            <circle cx={el.categoryX + 3} cy={el.categoryY} r={el.categoryDotSize / 2} fill={catColor} />
            <text
              x={el.categoryX + 10} y={el.categoryY}
              fill={catColor}
              fontFamily={FONT_FAMILY} fontSize={el.categoryFontSize}
              fontWeight={t.fontWeight} letterSpacing={TYPOGRAPHY.caps.letterSpacing}
              dominantBaseline="middle"
            >
              {el.category}
            </text>
          </g>
          {lines.map((line, i) => (
            <text
              key={i}
              x={el.x} y={el.y + i * el.lineHeight}
              fill={bodyColor}
              fontFamily={FONT_FAMILY} fontSize={el.fontSize}
              fontWeight={t.fontWeight} letterSpacing={t.letterSpacing}
              dominantBaseline="hanging"
            >
              {line}
            </text>
          ))}
        </>
      );
    }

    case 'bars': {
      const lineColor = rgbToCss(text[BARS_STYLE.zeroLineColor], BARS_STYLE.zeroLineOpacity);
      return (
        <>
          {el.bars.length > 0 && (
            <line
              x1={BARS_STYLE.zoneX1} x2={BARS_STYLE.zoneX2}
              y1={el.zeroLineY} y2={el.zeroLineY}
              stroke={lineColor} strokeWidth={BARS_STYLE.zeroLineStroke}
            />
          )}
          {el.bars.map((b, i) => (
            <rect
              key={i}
              x={b.x} y={b.y} width={b.width} height={b.height}
              fill={rgbToCss(b.color, BARS_STYLE.barOpacity)} rx={1}
            />
          ))}
        </>
      );
    }

    case 'chip':
    case 'delta-badge':
    case 'delta-stack':
      // The SKILL's current cover-gen.ts doesn't emit these for our inputs.
      // If/when it does, render here.
      return null;

    default:
      return null;
  }
}

function rgbToCssHex({ r, g, b }: RGB): string {
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}
