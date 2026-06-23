import { useEffect, useState } from "react";
import style from "./Pagination.module.css"
import axios from "axios";

function Pagination() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                //?limit=10
                const response = await axios.get('https://dummyjson.com/products?limit=100');
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
        <div className="container">
            {
                loading ?
                    // If Loading True 
                    <div>
                        <h2>Loading....</h2>
                    </div > :
                    // If Loading is false
                    (<div className={style.gridProducts}>
                        {
                            products.map((product) => {
                                return <span className={style.products} key={product.id}>
                                    <img src={product.thumbnail} alt={product.title} />
                                    {product.title}
                                </span>
                            })
                        }
                    </div>)
            }
        </div>
    )
}

export default Pagination;