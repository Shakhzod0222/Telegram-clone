import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseVirtualListOptions {
  itemsCount: number;
  estimateSize: number;
  overscan?: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

export function useVirtualList({
  itemsCount,
  estimateSize,
  overscan = 12,
  containerRef,
}: UseVirtualListOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [measuredSizes, setMeasuredSizes] = useState<Map<number, number>>(() => new Map());

  // Handle scroll and viewport resizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
      const threshold = 180;
      const near = container.scrollHeight - (container.scrollTop + container.clientHeight) < threshold;
      setIsNearBottom(near);
    };

    const handleResize = () => {
      setViewportHeight(container.clientHeight);
    };

    handleResize();
    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Dynamic measurement callback for variable height message bubbles
  const measureElement = useCallback((index: number, node: HTMLElement | null) => {
    if (!node) return;
    const height = node.getBoundingClientRect().height;
    if (height) {
      setMeasuredSizes((prev) => {
        if (prev.get(index) === height) return prev;
        const next = new Map(prev);
        next.set(index, height);
        return next;
      });
    }
  }, []);

  // Compute item offsets and total height
  const { offsets, totalHeight } = useMemo(() => {
    const offs: number[] = new Array(itemsCount);
    let currentOffset = 0;

    for (let i = 0; i < itemsCount; i++) {
      offs[i] = currentOffset;
      const size = measuredSizes.get(i) ?? estimateSize;
      currentOffset += size;
    }

    return { offsets: offs, totalHeight: currentOffset };
  }, [itemsCount, estimateSize, measuredSizes]);

  // Binary search to find start index
  const startIndex = useMemo(() => {
    if (itemsCount === 0) return 0;
    let low = 0;
    let high = itemsCount - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const offset = offsets[mid];

      if (offset < scrollTop) {
        low = mid + 1;
      } else if (offset > scrollTop) {
        high = mid - 1;
      } else {
        return mid;
      }
    }

    return Math.max(0, low - 1);
  }, [itemsCount, offsets, scrollTop]);

  // Find end index
  const endIndex = useMemo(() => {
    if (itemsCount === 0) return 0;
    const visibleBottom = scrollTop + viewportHeight;
    let idx = startIndex;

    while (idx < itemsCount && offsets[idx] < visibleBottom) {
      idx++;
    }

    return Math.min(itemsCount - 1, idx);
  }, [itemsCount, offsets, scrollTop, viewportHeight, startIndex]);

  // Buffered slice
  const bufferedStart = Math.max(0, startIndex - overscan);
  const bufferedEnd = Math.min(itemsCount - 1, endIndex + overscan);

  const virtualItems = useMemo<VirtualItem[]>(() => {
    if (itemsCount === 0) return [];
    const items: VirtualItem[] = [];

    for (let i = bufferedStart; i <= bufferedEnd; i++) {
      const size = measuredSizes.get(i) ?? estimateSize;
      items.push({
        index: i,
        start: offsets[i],
        size,
      });
    }

    return items;
  }, [itemsCount, bufferedStart, bufferedEnd, offsets, estimateSize, measuredSizes]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current;
      if (!container || index < 0 || index >= itemsCount) return;

      const targetOffset = offsets[index];
      container.scrollTo({ top: targetOffset, behavior });
    },
    [containerRef, itemsCount, offsets]
  );

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current;
      if (!container) return;
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    },
    [containerRef]
  );

  return {
    virtualItems,
    totalHeight,
    startIndex: bufferedStart,
    endIndex: bufferedEnd,
    measureElement,
    scrollToIndex,
    scrollToBottom,
    isNearBottom,
    scrollTop,
  };
}
