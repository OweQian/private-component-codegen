import { RefObject, useEffect } from 'react';

export const useAutoScroll = (
  scrollContainerRef: RefObject<HTMLDivElement>,
  dependencies: unknown[]
) => {
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceFromBottom <= 100) {
        scrollContainer.scrollTop = scrollHeight;
      }
    }
  }, dependencies);
};
