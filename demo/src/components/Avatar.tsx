// Initial-letter avatar with deterministic color. Mirrors alva-freshman's
// Avatar (without the optional CDN-hosted creator headshots).

const PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

export function Avatar({ name, size }: { name: string; size: number }) {
  const initial = name.trim().charAt(0).toUpperCase();
  const sum = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  const color = PALETTE[sum % PALETTE.length]!;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: size * 0.44, color: '#fff', lineHeight: 1,
        fontFamily: 'Inter, sans-serif', fontWeight: 600,
      }}>
        {initial}
      </span>
    </div>
  );
}
