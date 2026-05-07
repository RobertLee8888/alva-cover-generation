// Periodic perturbation of CoverInput so the grid feels alive.
//
// Mirrors src/lib/playbook-cover/PlaybookCover.tsx in alva-freshman:
// after `staggerMs` initial delay, re-jitters every LIVE_INTERVAL_MS.
// What it touches:
//   - thesis:  signed % in `kind` body text (±range)
//   - what-if: signed % in `anchor` hero + every value in `whatIfBars`
//   - general: signed % in `anchor` (e.g. "−0.04%"), or a small drift
//              on integer-like anchors ("14 active" → "13 active" / etc.)
//
// Background bg/icon/colors are derived from title+tickers and stay stable
// across ticks — only numerical content moves.

import { useEffect, useMemo, useState } from 'react';
import type { CoverInput } from '@skill/types';

const LIVE_INTERVAL_MS = 10_000;

export function useLiveInput(input: CoverInput, staggerMs: number): CoverInput {
  const isLive =
    input.template === 'thesis' ||
    input.template === 'what-if' ||
    input.template === 'general';
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLive) return;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startId = setTimeout(() => {
      setTick(t => t + 1);
      intervalId = setInterval(() => setTick(t => t + 1), LIVE_INTERVAL_MS);
    }, staggerMs);
    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLive, staggerMs]);

  return useMemo(() => {
    if (!isLive || tick === 0) return input;
    return perturb(input, tick);
  }, [input, tick, isLive]);
}

function perturb(input: CoverInput, tick: number): CoverInput {
  if (input.template === 'thesis') {
    return {
      ...input,
      kind: input.kind ? jitterPercents(input.kind, 0.6, tick) : input.kind,
    };
  }
  if (input.template === 'what-if') {
    const newBars = input.whatIfBars?.map((v, i) => {
      const offset = pseudoRandom(tick * 9301 + i * 49297) * 0.7;
      return Number((v + offset).toFixed(1));
    });
    return {
      ...input,
      anchor: input.anchor ? jitterPercents(input.anchor, 0.8, tick) : input.anchor,
      whatIfBars: newBars,
    };
  }
  if (input.template === 'general') {
    return {
      ...input,
      anchor: input.anchor ? jitterAnchor(input.anchor, tick) : input.anchor,
    };
  }
  return input;
}

/** Replace each signed percentage in `s` with a jittered version. */
function jitterPercents(s: string, range: number, tick: number): string {
  let i = 0;
  return s.replace(/([+\-−])(\d+\.\d+)%/g, (_, sign, num) => {
    const offset = pseudoRandom(tick * 1009 + (++i) * 7919) * range;
    let next = parseFloat(num) + offset;
    if (next < 0.1) next = 0.1;
    return `${sign}${next.toFixed(1)}%`;
  });
}

/** General anchors: jitter signed %, OR drift integer-prefixed strings ("14 active" → "15 active"). */
function jitterAnchor(s: string, tick: number): string {
  // Signed % first (e.g. "−0.04%")
  if (/[+\-−]\d+\.\d+%/.test(s)) return jitterPercents(s, 0.4, tick);
  // Plain integer prefix (e.g. "14 active", "47 emergent", "8 holdings")
  return s.replace(/^(\d+)(\s)/, (_, num, sp) => {
    const drift = Math.round(pseudoRandom(tick * 1031) * 3);
    const next = Math.max(1, parseInt(num, 10) + drift);
    return `${next}${sp}`;
  });
}

/** Deterministic pseudo-random in [-0.5, 0.5] from a seed. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10_000;
  return (x - Math.floor(x)) - 0.5;
}
