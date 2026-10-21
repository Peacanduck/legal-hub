import { useEffect, useState, type RefObject } from 'react';

const THEME_COLOR = '#0b0908';

/**
 * The body marker class (`pd-page`) that gives overscroll the page's colour,
 * and the browser-chrome colour on Android. Both reset when the page
 * unmounts. The title and tab icon are the site defaults from index.html, so
 * there is nothing to set for those.
 */
export function usePageChrome() {
  useEffect(() => {
    document.body.classList.add('pd-page');
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    const previous = meta.content;
    meta.content = THEME_COLOR;
    return () => {
      document.body.classList.remove('pd-page');
      if (created) meta.remove();
      else meta.content = previous;
    };
  }, []);
}

/** Fades each `.pd-reveal` in as it enters the viewport. CSS skips the
 *  transition entirely under prefers-reduced-motion. */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('.pd-reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [root]);
}

/** True once the page has scrolled off the top, for the top bar's glass. */
export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > threshold);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [threshold]);
  return scrolled;
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Runs `frame` on every animation frame while the element is on screen and
 * the tab is visible, and stops otherwise, so a scene nobody can see costs
 * nothing. `frame` gets the seconds since its last call, capped so a long
 * pause resumes smoothly instead of jumping.
 */
export function watchVisibility(el: Element, frame: (dt: number) => void) {
  let onScreen = false;
  let raf = 0;
  let last = 0;

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    frame(dt);
  };

  const sync = () => {
    const run = onScreen && !document.hidden;
    if (run && !raf) {
      last = 0;
      raf = requestAnimationFrame(loop);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    },
    { threshold: 0.02 },
  );
  io.observe(el);
  document.addEventListener('visibilitychange', sync);

  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', sync);
    cancelAnimationFrame(raf);
    raf = 0;
  };
}
