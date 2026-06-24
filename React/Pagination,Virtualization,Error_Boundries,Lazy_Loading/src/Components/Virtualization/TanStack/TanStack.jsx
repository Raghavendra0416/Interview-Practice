import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import style from "./TanStack.module.css";

const products = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Product ${i}`,
}));

//This is also Virtualization
function TanStack() {
    const parentRef = React.useRef(null);

    const rowVirtualizer = useVirtualizer({
        count: products.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 5,
        getItemKey: (index) => products[index].id,
    });

    return (
        <div className={style.page}>
            <h1 className={style.heading}>TanStack Virtual</h1>
            <p className={style.subheading}>Displaying {products.length} Products</p>

            <div ref={parentRef} className={style.container}>
                <div
                    className={style.inner}
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const product = products[virtualRow.index];

                        return (
                            <div
                                key={virtualRow.key}
                                className={style.item}
                                style={{
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {product.name}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default TanStack;