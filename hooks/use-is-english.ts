import { useState, useEffect } from 'react';

export function useIsEnglish() {
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEnglish(window.navigator?.language?.startsWith('en'));
    }
  }, []);

  return isEnglish;
}