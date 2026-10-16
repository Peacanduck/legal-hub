import { useEffect } from 'react';
import { getAppById } from '../../data/apps';
import { useFavicon } from '../../hooks/useFavicon';

const DIGGLE_FAVICON = getAppById('diggle')?.favicon;

/** Sets the tab title, the Diggle tab icon and the body marker class
 *  (`dg-page`) for a Diggle page, restoring all three when the page unmounts. */
export function usePageChrome(title: string) {
  useFavicon(DIGGLE_FAVICON);

  useEffect(() => {
    const previous = document.title;
    document.title = title;
    document.body.classList.add('dg-page');
    return () => {
      document.title = previous;
      document.body.classList.remove('dg-page');
    };
  }, [title]);
}
