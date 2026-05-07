// Mirrors alva-freshman's CdnIcon — same alva-ai static CDN, same names.
// Use to render any of alva.baby's named icons (star-l, remix-l, etc.)
// in 1:1 fidelity with the production explore page.

const CDN = 'https://alva-ai-static.b-cdn.net/icons';

export function CdnIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const url = name.startsWith('/') || name.startsWith('http') ? name : `${CDN}/${name}.svg`;
  if (color) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: size, height: size,
          flexShrink: 0,
          backgroundColor: color,
          WebkitMaskImage: `url(${url})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url(${url})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }}
      />
    );
  }
  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size, display: 'inline-block', flexShrink: 0 }}
    />
  );
}
