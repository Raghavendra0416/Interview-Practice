import { useState } from "react";
import style from "./Virtualization.module.css";

// Create 10,000 products
const products = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Product ${i}`,
}));

// Virtualization Constants
const ITEM_HEIGHT = 40;
const CONTAINER_HEIGHT = 400;
const OVERSCAN = 5;
// Overscan renders a few extra items above and below the visible viewport to prevent flickering during fast scrolling.

function Virtualization() {
  // Track scroll position
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate first visible item
  // const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  // OVERSCAN: Start rendering a few items before the first visible item.
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);

  // Calculate how many items fit in viewport
  const visibleItemsCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT);

  // Calculate last visible item
  // const endIndex = startIndex + visibleItemsCount;
  // OVERSCAN: Render extra items after the last visible item.
  const endIndex = Math.min(products.length, startIndex + visibleItemsCount + OVERSCAN * 2);

  // Fake height for scrollbar
  const totalHeight = products.length * ITEM_HEIGHT;

  // Position rendered items at their correct location inside the virtual container.
  const translateY = startIndex * ITEM_HEIGHT;

  return (
    <div>
      <h1 className={style.heading}>
        Displaying {products.length} Products
      </h1>

      {/* Scrollable Container */}
      <div
        className={style.container}
        onScroll={(e) =>
          setScrollTop(e.currentTarget.scrollTop)
        }
      >
        {/* Fake Height Container */}
        <div
          style={{
            height: `${totalHeight}px`,
            position: "relative",
          }}
        >
          {/* Move visible items to correct position */}
          <div
            style={{
              transform: `translateY(${translateY}px)`,
            }}
          >
            {products
              .slice(startIndex, endIndex)
              .map((product) => (
                <div
                  key={product.id}
                  className={style.item}
                >
                  {product.name}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className={style.debug}>
        <p>scrollTop: {scrollTop}</p>
        <p>startIndex: {startIndex}</p>
        <p>endIndex: {endIndex}</p>
        <p>translateY: {translateY}</p>
      </div>
    </div>
  );
}

export default Virtualization;



// Overscan Changes:
// 1. Subtract OVERSCAN from startIndex.
// 2. Add OVERSCAN * 2 to endIndex.
// 3. Keep translateY unchanged.