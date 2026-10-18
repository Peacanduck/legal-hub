import { useEffect, useState, type RefObject } from 'react';
import { getAppById } from '../../data/apps';
import { usePageHead } from '../../hooks/usePageHead';

const VORTA_FAVICON = getAppById('vorta')?.favicon;
const THEME_COLOR = '#05040f';

/**
 * Tab title and icon, the body marker class (`vt-page`) that gives overscroll
 * the page's colour, and the browser-chrome colour on Android. All of it
 * resets when the page unmounts, so the rest of the hub is untouched.
 */
export function usePageChrome(title: string) {
  usePageHead({ icon: VORTA_FAVICON, title });

  useEffect(() => {
    document.body.classList.add('vt-page');
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
      document.body.classList.remove('vt-page');
      if (created) meta.remove();
      else meta.content = previous;
    };
  }, []);
}

/** Fades each `.vt-reveal` in as it enters the viewport. CSS skips the
 *  transition entirely under prefers-reduced-motion. */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('.vt-reveal');
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
