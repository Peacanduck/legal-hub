import { GLYPHS, GLYPH_TONES, MARK_GRID, MARK_TONES, type GlyphName } from '../art';

// One path per tone: a handful of nodes instead of a rect per pixel.
const paths = (grid: string[], tones: Record<string, string>, inset = 0) =>
  Object.entries(tones).map(([tone, fill]) => {
    const size = 1 - inset * 2;
    let d = '';
    grid.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === tone) d += `M${x + inset} ${y + inset}h${size}v${size}h${-size}z`;
      }),
    );
    return { fill, d };
  });

const MARK = paths(MARK_GRID, MARK_TONES);

/** The Py Digital mark, `size` pixels tall. */
export const Mark = ({ size = 28, className }: { size?: number; className?: string }) => (
  <svg
    className={className ? `pd-mark ${className}` : 'pd-mark'}
    width={(size * 8) / 10}
    height={size}
    viewBox="0 0 8 10"
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    {MARK.map((p) => (
      <path key={p.fill} d={p.d} fill={p.fill} />
    ))}
  </svg>
);

const GLYPH_PATHS = Object.fromEntries(
  Object.entries(GLYPHS).map(([name, grid]) => [name, paths(grid, GLYPH_TONES, 0.08)]),
) as Record<GlyphName, ReturnType<typeof paths>>;

export const Glyph = ({ name }: { name: GlyphName }) => (
  <svg className="pd-glyph" width="36" height="36" viewBox="0 0 9 9" aria-hidden="true">
    {GLYPH_PATHS[name].map((p) => (
      <path key={p.fill} d={p.d} fill={p.fill} />
    ))}
  </svg>
);
