import { useEffect, useState } from "react";
import style from "./Pagination.module.css"
import axios from "axios";

function Pagination() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                //?limit=144
                const response = await axios.get('https://dummyjson.com/products?limit=12');
                console.log(response.data.products);
                setProducts(response.data.products);
            } catch (err) {
                setLoading(false);
                console.log(err.message);
            }
            finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    return (
        <div>
            {/* GRID To Show Products */}
            <div className="ProductsContainer">
                {
                    loading ?
                        <div className={style.loadingContainer}>
                            <h2>Loading....</h2>
                        </div>
                        :
                        <div className={style.gridProducts}>
                            {products.slice(0, 8).map((product) => (
                                <span
                                    className={style.products}
                                    key={product.id}
                                >
                                    <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                    />
                                    {product.title}
                                </span>
                            ))}
                        </div>
                }
            </div>

            {/* Display Page Numbers */}
            <div className={style.pageNumbers}>
                <span>◀️</span>
                <span>1</span>
                <span>▶️</span>
            </div>
        </div>
    );
}



export default Pagination;