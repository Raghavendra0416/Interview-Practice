import style from './WithoutVirtualization.module.css'

// Function to create Dummy 10000 Products Names
const products = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Product ${i}`
}));


export default function WithoutVirtualization() {
    return <div>
        <h1 className={style.heading}>Displaying {products.length}:</h1>
        <div className={style.container} onScroll={(e) => { console.log('Scrolling:', e.currentTarget.scrollTop) }}>
            {
                products.map(product => (
                    <div key={product.id}>{product.name}</div>
                ))
            }
        </div>
    </div>
}

// When the page first loads, can the user see all 10,000 rows?
// No. They are visible. The remaining 9, 994 rows are below the screen.
// But React still rendered all 10,000. That is waste.
//Huge latency