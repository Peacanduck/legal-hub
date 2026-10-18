// The page's pixel art, as grids: one character per pixel, '.' for none and
// a digit for a tone.

/** The Py Digital mark: an ember in pixels, throwing off a spark. The studio
 *  started out as Pyrolabs, and makes its games out of pixels and light.
 *  public/pydigital-mark.svg is drawn from this grid; keep the two in step. */
export const MARK_GRID = [
  '....1...',
  '...11...',
  '...121..',
  '..1221.2',
  '..12321.',
  '.123321.',
  '.1234321',
  '12344321',
  '12333321',
  '.122221.',
];

export const MARK_TONES: Record<string, string> = {
  '1': '#e2461a',
  '2': '#ff6a2b',
  '3': '#ffa047',
  '4': '#ffd88a',
};

export type GlyphName = 'one' | 'fair' | 'less';

/** One glyph per principle, in the mark's pixels. */
export const GLYPHS: Record<GlyphName, string[]> = {
  // One lit pixel in a field of dim ones.
  one: [
    '1.1.1.1.1',
    '.........',
    '1.1.1.1.1',
    '.........',
    '1.1.3.1.1',
    '.........',
    '1.1.1.1.1',
    '.........',
    '1.1.1.1.1',
  ],
  // A balance, level.
  fair: [
    '....3....',
    '.........',
    '222222222',
    '2...2...2',
    '2...2...2',
    '33..2..33',
    '....2....',
    '....2....',
    '..22222..',
  ],
  // A shield, with one pixel kept inside it.
  less: [
    '.2222222.',
    '2.......2',
    '2.......2',
    '2...3...2',
    '2.......2',
    '.2.....2.',
    '..2...2..',
    '...2.2...',
    '....2....',
  ],
};

export const GLYPH_TONES: Record<string, string> = {
  '1': 'rgba(246, 239, 230, 0.26)',
  '2': 'rgba(246, 239, 230, 0.7)',
  '3': '#ff6a2b',
};
