import { useEffect } from 'react';

// Sets document.title while the component is mounted, restoring the previous title on unmount.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    return () => { document.title = previousTitle; };
  }, [title]);
}
