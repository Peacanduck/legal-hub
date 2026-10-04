import { useEffect } from 'react';

/** Sets the tab title and the body marker class (`dg-page`) for a Diggle
 *  page, restoring both when the page unmounts. */
export function usePageChrome(title: string) {
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
