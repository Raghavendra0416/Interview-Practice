import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─────────────────────────────────────────────
// STEP 1: The core hook — all the math lives here
// ─────────────────────────────────────────────
function useVirtualList({ itemCount, itemHeight, containerHeight, overscan = 3 }) {
    const [scrollTop, setScrollTop] = useState(0);

    // First visible row index (clamped to 0)
    const startIndex = useMemo(
        () => Math.max(0, Math.floor(scrollTop / itemHeight) - overscan),
        [scrollTop, itemHeight, overscan]
    );

    // Last visible row index (clamped to last item)
    const endIndex = useMemo(
        () =>
            Math.min(
                itemCount - 1,
                Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
            ),
        [scrollTop, containerHeight, itemHeight, itemCount, overscan]
    );

    return {
        startIndex,
        endIndex,
        totalHeight: itemCount * itemHeight, // height of the invisible spacer div
        offsetY: startIndex * itemHeight,    // top offset of the first rendered row
        setScrollTop,
        visibleCount: endIndex - startIndex + 1,
    };
}

// ─────────────────────────────────────────────
// STEP 2: The VirtualList component
// ─────────────────────────────────────────────
export function VirtualList({
    items,
    itemHeight,
    containerHeight,
    overscan = 3,
    renderItem,
    onLoadMore,   // optional: called when user scrolls near the bottom
    isLoading,    // optional: true while a fetch is in flight
    hasMore,      // optional: false when all data is loaded
}) {
    const containerRef = useRef(null);
    const sentinelRef = useRef(null);

    const { startIndex, endIndex, totalHeight, setScrollTop, visibleCount } =
        useVirtualList({ itemCount: items.length, itemHeight, containerHeight, overscan });

    // ── Scroll handler ──────────────────────────
    const handleScroll = useCallback(
        (e) => setScrollTop(e.target.scrollTop),
        [setScrollTop]
    );

    // ── Infinite scroll via IntersectionObserver ─
    // Watch a 1px invisible "sentinel" div at the bottom of the list.
    // When it scrolls into view, fire onLoadMore().
    useEffect(() => {
        if (!sentinelRef.current || !onLoadMore || !hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading) {
                    onLoadMore();
                }
            },
            {
                root: containerRef.current, // watch inside our scroll container
                threshold: 0.1,
            }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [onLoadMore, isLoading, hasMore]);

    // ── Render only the visible slice ────────────
    const visibleRows = [];
    for (let i = startIndex; i <= endIndex; i++) {
        visibleRows.push(
            <div
                key={i}
                style={{
                    position: "absolute",
                    top: i * itemHeight,  // place each row at its exact Y position
                    left: 0,
                    right: 0,
                    height: itemHeight,
                }}
            >
                {renderItem(items[i], i)}
            </div>
        );
    }

    return (
        // Outer container: fixed height, scrollable
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ height: containerHeight, overflow: "auto", position: "relative" }}
        >
            {/* Spacer div: full virtual height so the scrollbar is accurate */}
            <div style={{ height: totalHeight, position: "relative" }}>

                {/* Only the visible rows, absolutely positioned */}
                {visibleRows}

                {/* Sentinel: a tiny invisible div at the bottom that triggers loading */}
                {onLoadMore && hasMore && (
                    <div
                        ref={sentinelRef}
                        style={{ position: "absolute", bottom: 0, height: 1, width: "100%" }}
                    />
                )}

                {/* Loading indicator: shown while fetching the next page */}
                {isLoading && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            padding: "12px",
                            fontSize: 13,
                            color: "#888",
                            background: "#fff",
                        }}
                    >
                        Loading more…
                    </div>
                )}

                {/* End of list message */}
                {!hasMore && items.length > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            padding: "12px",
                            fontSize: 13,
                            color: "#aaa",
                        }}
                    >
                        All {items.length} items loaded
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// STEP 3: A minimal usage example
// ─────────────────────────────────────────────
function generatePage(startId, count) {
    return Array.from({ length: count }, (_, i) => ({
        id: startId + i,
        name: `Item #${startId + i + 1}`,
        description: `Description for item ${startId + i + 1}`,
    }));
}

export default function VirtualizationClaude() {
    const [items, setItems] = useState(() => generatePage(0, 50));
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Simulate an async data fetch (replace with your real API call)
    const loadMore = useCallback(() => {
        if (isLoading) return;
        setIsLoading(true);

        setTimeout(() => {
            setItems((prev) => {
                const next = [...prev, ...generatePage(prev.length, 50)];
                if (next.length >= 500) setHasMore(false); // stop after 500 items
                return next;
            });
            setIsLoading(false);
        }, 800); // simulate network delay
    }, [isLoading]);

    return (
        <div style={{ padding: 24, maxWidth: 600 }}>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
                {items.length} items loaded · {hasMore ? "scroll to load more" : "all loaded"}
            </p>

            <VirtualList
                items={items}
                itemHeight={64}
                containerHeight={400}
                overscan={3}
                onLoadMore={loadMore}
                isLoading={isLoading}
                hasMore={hasMore}
                renderItem={(item, index) => (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            padding: "0 16px",
                            borderBottom: "1px solid #f0f0f0",
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "#f0eeff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#534AB7",
                                marginRight: 12,
                                flexShrink: 0,
                            }}
                        >
                            {item.id % 100}
                        </div>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: "#888" }}>{item.description}</div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}