import { useEffect, useState } from "react";
import style from "../Pagination.module.css"
import axios from "axios";

function Pagination() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                //?limit=144
                const response = await axios.get(`https://dummyjson.com/products?limit=8&skip=${(page - 1) * 8}`);

                if (response && response.data && response.data.products) {
                    console.log(response.data.products);
                    setProducts(response.data.products);
                    setTotalPages(Math.ceil(response.data.total / 8));
                }
            } catch (err) {
                console.log(err.message);
            }
            finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [page]);

    function selectPageHandler(selectedPage) {
        if (
            selectedPage >= 1 &&
            selectedPage <= totalPages &&
            selectedPage !== page
        )
            setPage(selectedPage);
    }

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
                            {
                                // if need to handle in frontend:
                                // products.slice(page * 8 - 8, page * 8).map((product) => (
                                // If Backend handled the number of pages we can get by using skip in url
                                products.map((product) => (
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
                <span onClick={() => page > 1 && selectPageHandler(page - 1)}
                    className={`${style.number} ${page === 1 ? style.disabled : ""}`}>◀</span>
                {
                    // If need to handle by frontend:
                    // [...Array(Math.ceil(products.length / 10))].map((_, i) => {
                    // If Backend handled the number of pages we can get by using skip in url
                    [...Array(totalPages)].map((_, i) => {
                        return (
                            <span onClick={() => selectPageHandler(i + 1)}
                                className={`${style.number} ${page === i + 1 ? style.active : ""}`}
                                key={i}>
                                {i + 1}
                            </span>
                        )
                    })
                }
                <span onClick={() => page < totalPages && selectPageHandler(page + 1)}
                    className={`${style.number} ${page === totalPages ? style.disabled : ""}`}>▶</span>
            </div>
        </div>
    );
}



export default Pagination;

//◀️ ▶️