import { useId } from 'react';
import badge from '../assets/google-play-badge.png';
import type { FeatureIcon as FeatureIconName } from '../content';
import { TAU, createRng } from '../game/math';
import { hex, type PlayerShape, type Skin } from '../game/skins';

// Seeded once at load, so the sky is the same on every render and every visit.
const STARS = (() => {
  const rng = createRng(20260904);
  return Array.from({ length: 90 }, () => ({
    x: rng.next() * 1600,
    y: rng.next() * 1000,
    r: 0.4 + rng.next() * rng.next() * 1.5,
    o: 0.15 + rng.next() * 0.55,
  }));
})();

export const Starfield = () => (
  <svg className="vt-stars" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {STARS.map((s, i) => (
      <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} opacity={s.o.toFixed(2)} />
    ))}
  </svg>
);

/** The game's polar grid at page scale, turning slowly behind the content. */
export const OrbitGrid = ({ className }: { className?: string }) => (
  <svg className={`vt-orbit-grid${className ? ` ${className}` : ''}`} viewBox="-500 -500 1000 1000" aria-hidden="true">
    {[90, 170, 250, 330, 410, 490].map((r) => (
      <circle key={r} r={r} />
    ))}
    {Array.from({ length: 24 }, (_, i) => {
      const a = (TAU / 24) * i;
      return (
        <line
          key={i}
          x1={(Math.cos(a) * 60).toFixed(1)}
          y1={(Math.sin(a) * 60).toFixed(1)}
          x2={(Math.cos(a) * 500).toFixed(1)}
          y2={(Math.sin(a) * 500).toFixed(1)}
        />
      );
    })}
  </svg>
);

/** Small line drawings for the three pillars: tap, thread, miss. */
export const PillarGlyph = ({ index }: { index: number }) => (
  <svg className="vt-pillar-glyph" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
    {index === 0 && (
      <>
        <circle cx="28" cy="28" r="22" fill="none" stroke="#4de8ff" strokeOpacity="0.18" />
        <circle cx="28" cy="28" r="14" fill="none" stroke="#4de8ff" strokeOpacity="0.4" />
        <circle cx="28" cy="28" r="5.5" fill="#4de8ff" />
      </>
    )}
    {index === 1 && (
      <>
        <path d="M37.4 9.7A21 21 0 1 1 18.6 9.7" fill="none" stroke="#8b6bff" strokeWidth="4" strokeLinecap="round" />
        <path d="M22 26.5 28 9" stroke="#ffc53d" strokeWidth="1.5" strokeDasharray="2 3" strokeLinecap="round" />
        <circle cx="28" cy="7" r="4" fill="#4de8ff" />
        <circle cx="28" cy="28" r="5" fill="#6c5ce7" />
      </>
    )}
    {index === 2 && (
      <>
        <path d="M46.2 37.5A21 21 0 1 1 46.2 18.5" fill="none" stroke="#8b6bff" strokeWidth="4" strokeLinecap="round" />
        <path d="M48 28h6M45.5 21l4.5-3M45.5 35l4.5 3" stroke="#ff3d6e" strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="28" r="5" fill="#6c5ce7" />
      </>
    )}
  </svg>
);

/** The launcher icon as a glyph: a ring with its gap at the top, the player in it. */
export const Mark = ({ size = 28 }: { size?: number }) => (
  <svg className="vt-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="4.6" fill="#6c5ce7" />
    <path d="M21.75 6.04A11.5 11.5 0 1 1 10.25 6.04" fill="none" stroke="#8b6bff" strokeWidth="3.4" strokeLinecap="round" />
    <circle cx="16" cy="4.5" r="2.9" fill="#4de8ff" />
    <circle cx="15.3" cy="3.8" r="1" fill="#fff" opacity="0.85" />
  </svg>
);

/**
 * The official badge, used unmodified (only its transparent margin is
 * cropped) as Google's badge guidelines require. A restyled "Get it on
 * Google Play" button would breach them.
 */
export const PlayBadge = ({ href, className }: { href: string; className?: string }) => (
  <a className={`vt-badge${className ? ` ${className}` : ''}`} href={href}>
    <img src={badge} alt="Get it on Google Play" width={564} height={168} />
  </a>
);

const shapePath = (shape: PlayerShape, r: number) => {
  switch (shape) {
    case 'dart':
      return `M${1.5 * r} 0L${-0.9 * r} ${0.95 * r}L${-0.4 * r} 0L${-0.9 * r} ${-0.95 * r}Z`;
    case 'diamond':
      return `M${1.35 * r} 0L0 ${r}L${-1.35 * r} 0L0 ${-r}Z`;
    case 'blade':
      return `M${1.8 * r} 0Q0 ${0.85 * r} ${-1.3 * r} 0Q0 ${-0.85 * r} ${1.8 * r} 0Z`;
    default:
      return null;
  }
};

/** A skin in miniature: its sky, its ring, its core and the shape you fly. */
export const SkinEmblem = ({ skin, size = 44 }: { skin: Skin; size?: number }) => {
  const id = useId();
  const path = shapePath(skin.shape, 2.6);
  return (
    <svg className="vt-emblem" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={hex(skin.backgroundInner)} />
          <stop offset="1" stopColor={hex(skin.backgroundOuter)} />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill={`url(#${id})`} />
      <circle cx="20" cy="20" r="4" fill={hex(skin.core)} stroke={hex(skin.ring)} strokeOpacity="0.5" strokeWidth="0.8" />
      <path d="M25.4 10.6A11 11 0 1 1 14.6 10.6" fill="none" stroke={hex(skin.ring)} strokeWidth="2.6" strokeLinecap="round" />
      <g transform="translate(20 9)" fill={hex(skin.player)}>
        {skin.shape === 'orb' && <circle r="2.6" />}
        {skin.shape === 'ring' && <circle r="2.2" fill="none" stroke={hex(skin.player)} strokeWidth="1.4" />}
        {path && <path d={path} />}
      </g>
    </svg>
  );
};

const FEATURE_PATHS: Record<FeatureIconName, string> = {
  // Wi-Fi, struck through.
  offline: 'M2.5 8.8a13.5 13.5 0 0 1 19 0M5.6 12.2a9 9 0 0 1 12.8 0M8.8 15.5a4.6 4.6 0 0 1 6.4 0M12 19h.01M3.5 3.5l17 17',
  // A person, crossed out: nothing to sign up for.
  account: 'M12 12.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM5 20c.6-3.4 3.4-5.6 7-5.6s6.4 2.2 7 5.6M4 4l16 16',
  // A podium.
  ranks: 'M3.5 20.5h17M9 20.5V9.5h6v11M3.5 20.5v-6.5H9M15 20.5V12.5h5.5v8',
  // A trophy.
  trophy: 'M7.5 4.5h9v4.6a4.5 4.5 0 0 1-9 0zM7.5 6.5H4.6c0 2.6 1.3 4.2 3.3 4.6M16.5 6.5h2.9c0 2.6-1.3 4.2-3.3 4.6M12 13.6v3.4M8.5 20.5h7M9.5 20.5c0-2 1.1-3.5 2.5-3.5s2.5 1.5 2.5 3.5',
  // A cloud with an arrow up into it.
  cloud: 'M7 18.5a4.5 4.5 0 0 1-.4-9A5.6 5.6 0 0 1 17.3 8a4.3 4.3 0 0 1-.3 10.5M12 20.5v-7.5M9 15.8l3-3 3 3',
  // A frame with a slash through it.
  noads: 'M3.5 6.5h17v11h-17zM4 4l16 16',
};

export const FeatureIcon = ({ name }: { name: FeatureIconName }) => (
  <svg className="vt-feature-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path
      d={FEATURE_PATHS[name]}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
