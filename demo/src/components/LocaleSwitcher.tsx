import type { Locale } from '@skill/types';
import { SUPPORTED_LOCALES } from '@skill/i18n';
import { LOCALE_LABELS } from '../i18n';

export function LocaleSwitcher({
  value, onChange, label,
}: {
  value: Locale;
  onChange: (l: Locale) => void;
  label: string;
}) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 12, color: 'rgba(0,0,0,0.55)',
    }}>
      {label}
      <select
        value={value}
        onChange={e => onChange(e.target.value as Locale)}
        style={{
          appearance: 'none',
          background: '#fff',
          border: '0.5px solid rgba(0,0,0,0.2)',
          borderRadius: 6,
          padding: '6px 28px 6px 10px',
          fontSize: 13,
          color: 'rgba(0,0,0,0.85)',
          cursor: 'pointer',
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(0,0,0,0.5)\' stroke-width=\'2\'><polyline points=\'6 9 12 15 18 9\'/></svg>")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
        }}
      >
        {SUPPORTED_LOCALES.map(l => (
          <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
        ))}
      </select>
    </label>
  );
}
