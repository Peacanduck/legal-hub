import { useEffect } from 'react';
import { getAppById } from '../../data/apps';
import { usePageHead } from '../../hooks/usePageHead';

const DIGGLE_FAVICON = getAppById('diggle')?.favicon;

/** Sets the tab title, the Diggle tab icon and the body marker class
 *  (`dg-page`) for a Diggle page; all three reset when the page unmounts. */
export function usePageChrome(title: string) {
  usePageHead({ icon: DIGGLE_FAVICON, title });

  useEffect(() => {
    document.body.classList.add('dg-page');
    return () => {
      document.body.classList.remove('dg-page');
    };
  }, []);
}
