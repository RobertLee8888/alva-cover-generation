// Localized-string helper. A field can be a plain string (locale-agnostic,
// e.g. ticker symbols, account names) or a per-locale record. Falls back
// to `en` when the requested locale is missing.

import type { Locale } from '@skill/types';

export type LocStr = string | Partial<Record<Locale, string>>;

export function loc(s: LocStr | undefined, l: Locale): string | undefined {
  if (s === undefined) return undefined;
  if (typeof s === 'string') return s;
  return s[l] ?? s.en ?? Object.values(s)[0];
}
