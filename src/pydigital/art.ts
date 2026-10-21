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

export type GlyphName = 'scan' | 'play' | 'ring' | 'pin' | 'fair' | 'less';

/** One glyph per practice and per promise, in the mark's pixels. */
export const GLYPHS: Record<GlyphName, string[]> = {
  // A barcode, with the scanner's line across it.
  scan: [
    '2.22.2.22',
    '2.22.2.22',
    '2.22.2.22',
    '333333333',
    '2.22.2.22',
    '2.22.2.22',
    '2.22.2.22',
    '.........',
    '1.1.1.1.1',
  ],
  // A map pin, lit where it stands.
  pin: [
    '..22222..',
    '.2222222.',
    '222...222',
    '22..3..22',
    '222...222',
    '.2222222.',
    '..22222..',
    '...222...',
    '....2....',
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
  // Play.
  play: [
    '..2......',
    '..22.....',
    '..222....',
    '..2222...',
    '..22223..',
    '..2222...',
    '..222....',
    '..22.....',
    '..2......',
  ],
  // A ring with a spark dropping into its gap, after Solignition's mark.
  ring: [
    '...2.2...',
    '.22.3.22.',
    '.2..3..2.',
    '2.......2',
    '2.......2',
    '2.......2',
    '.2.....2.',
    '.22...22.',
    '...222...',
  ],
};

export const GLYPH_TONES: Record<string, string> = {
  '1': 'rgba(246, 239, 230, 0.26)',
  '2': 'rgba(246, 239, 230, 0.7)',
  '3': '#ff6a2b',
};

/** The top of a fire column, under its flame: a bronze brazier, its rim lit
 *  by the fire, standing on the column's capital. */
export const PILLAR_HEAD = [
  '556666666655',
  '.4444444444.',
  '..44444444..',
  '....4444....',
  '.....44.....',
  '...444444...',
  '333333333333',
  '222222222222',
  '.1222222221.',
  '..11111111..',
];

/** One row of the column's fluted shaft, stretched to its height. */
export const PILLAR_SHAFT = '13232321';

export const PILLAR_TONES: Record<string, string> = {
  '1': '#1d1612',
  '2': '#2e241e',
  '3': '#4a372b',
  '4': '#6b3218',
  '5': '#b9481b',
  '6': '#ff8a48',
};
