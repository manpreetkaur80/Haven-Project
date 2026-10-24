
// import { useEffect, useState } from "react";
// import { getProducts } from "../services/api";
// import "../styles/products.css";

// function Products() {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         getProducts()
//             .then(setProducts)
//             .catch(() =>
//                 setError("Could not load products. Please try again.")
//             )
//             .finally(() => setLoading(false));
//     }, []);

//     if (loading) {
//         return <p>Loading HAVEN products...</p>;
//     }

//     if (error) {
//         return <p>{error}</p>;
//     }

//     return (
//         <main>
//             <h1>HAVEN Collection</h1>

//             <div className="product-grid">
//                 {products.map((product) => (
//                     <article className="product-card" key={product._id}>
//                         <div className="product-image-placeholder">
//                             {product.images?.[0]?.url ? (
//                                 <img
//                                     src={product.images[0].url}
//                                     alt={product.name}
//                                     className="product-image"
//                                     loading="lazy"
//                                 />
//                             ) : (
//                                 <span>Product image coming soon</span>
//                             )}
//                         </div>

//                         <h2>{product.name}</h2>
//                         <p>{product.description}</p>
//                         <p>
//                             ₹{product.price.toLocaleString("en-IN")}
//                         </p>
//                         <p>
//                             {product.category} · {product.subcategory}
//                         </p>
//                     </article>
//                 ))}
//             </div>

//             {products.length === 0 && (
//                 <p>No products available yet.</p>
//             )}
//         </main>
//     );
// }

// export default Products;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";
import "../styles/products.css";

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getProducts()
            .then(setProducts)
            .catch(() =>
                setError("Could not load products. Please try again.")
            )
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading HAVEN products...</p>;
    if (error) return <p>{error}</p>;

    return (
        <main className="products-page">
            <h1>HAVEN Collection</h1>

            <div className="product-grid">
                {products.map((product) => (
                    <Link
                        to={`/products/${product._id}`}
                        className="product-card-link"
                        key={product._id}
                    >
                        <article className="product-card">
                            <div className="product-image-placeholder">
                                {product.images?.[0]?.url ? (
                                    <img
                                        src={product.images[0].url}
                                        alt={product.name}
                                        className="product-image"
                                        loading="lazy"
                                    />
                                ) : (
                                    <span>Image coming soon</span>
                                )}
                            </div>

                            <h2>{product.name}</h2>
                            <p>{product.description}</p>

                            <p className="product-price">
                                ₹{product.price.toLocaleString("en-IN")}
                            </p>

                            <p>
                                {product.category} · {product.subcategory}
                            </p>
                        </article>
                    </Link>
                ))}
            </div>

            {products.length === 0 && (
                <p>No products available yet.</p>
            )}
        </main>
    );
}

export default Products;
