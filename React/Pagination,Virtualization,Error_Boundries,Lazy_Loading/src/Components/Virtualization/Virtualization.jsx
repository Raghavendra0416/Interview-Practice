// function Virtualization() {
//     return (
//         <>
//             <h1>Hello</h1>
//         </>
//     )
// }

// export default Virtualization;
import React, { useMemo, useState } from "react";

const ITEM_HEIGHT = 50;
const CONTAINER_HEIGHT = 300;
const OVERSCAN = 3;

export default function Virtualization() {
  const [scrollTop, setScrollTop] = useState(0);

  const items = useMemo(() => {
    return Array.from({ length: 10000 }, (_, index) => `Item ${index + 1}`);
  }, []);

  const totalHeight = items.length * ITEM_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      style={{
        height: CONTAINER_HEIGHT,
        overflowY: "auto",
        border: "1px solid #ccc",
        position: "relative",
        fontFamily: "sans-serif",
      }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, index) => {
          const itemIndex = startIndex + index;

          return (
            <div
              key={itemIndex}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: ITEM_HEIGHT,
                transform: `translateY(${itemIndex * ITEM_HEIGHT}px)`,
                display: "flex",
                alignItems: "center",
                paddingLeft: 12,
                borderBottom: "1px solid #eee",
                boxSizing: "border-box",
                background: itemIndex % 2 === 0 ? "#fafafa" : "#fff",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}