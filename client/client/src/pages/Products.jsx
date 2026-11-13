
// // import { useEffect, useState } from "react";
// // import { getProducts } from "../services/api";
// // import "../styles/products.css";

// // function Products() {
// //     const [products, setProducts] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState("");

// //     useEffect(() => {
// //         getProducts()
// //             .then(setProducts)
// //             .catch(() =>
// //                 setError("Could not load products. Please try again.")
// //             )
// //             .finally(() => setLoading(false));
// //     }, []);

// //     if (loading) {
// //         return <p>Loading HAVEN products...</p>;
// //     }

// //     if (error) {
// //         return <p>{error}</p>;
// //     }

// //     return (
// //         <main>
// //             <h1>HAVEN Collection</h1>

// //             <div className="product-grid">
// //                 {products.map((product) => (
// //                     <article className="product-card" key={product._id}>
// //                         <div className="product-image-placeholder">
// //                             {product.images?.[0]?.url ? (
// //                                 <img
// //                                     src={product.images[0].url}
// //                                     alt={product.name}
// //                                     className="product-image"
// //                                     loading="lazy"
// //                                 />
// //                             ) : (
// //                                 <span>Product image coming soon</span>
// //                             )}
// //                         </div>

// //                         <h2>{product.name}</h2>
// //                         <p>{product.description}</p>
// //                         <p>
// //                             ₹{product.price.toLocaleString("en-IN")}
// //                         </p>
// //                         <p>
// //                             {product.category} · {product.subcategory}
// //                         </p>
// //                     </article>
// //                 ))}
// //             </div>

// //             {products.length === 0 && (
// //                 <p>No products available yet.</p>
// //             )}
// //         </main>
// //     );
// // }

// // export default Products;

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
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

//     if (loading) return <p>Loading HAVEN products...</p>;
//     if (error) return <p>{error}</p>;

//     return (
//         <main className="products-page">
//             <h1>HAVEN Collection</h1>

//             <div className="product-grid">
//                 {products.map((product) => (
//                     <Link
//                         to={`/products/${product._id}`}
//                         className="product-card-link"
//                         key={product._id}
//                     >
//                         <article className="product-card">
//                             <div className="product-image-placeholder">
//                                 {product.images?.[0]?.url ? (
//                                     <img
//                                         src={product.images[0].url}
//                                         alt={product.name}
//                                         className="product-image"
//                                         loading="lazy"
//                                     />
//                                 ) : (
//                                     <span>Image coming soon</span>
//                                 )}
//                             </div>

//                             <h2>{product.name}</h2>
//                             <p>{product.description}</p>

//                             <p className="product-price">
//                                 ₹{product.price.toLocaleString("en-IN")}
//                             </p>

//                             <p>
//                                 {product.category} · {product.subcategory}
//                             </p>
//                         </article>
//                     </Link>
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
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../services/api";
import { useWishlist } from "../context/WishlistContext";
import "../styles/products.css";

/* Optional `category` ("Women" | "Men") and `title` props let the same page
   serve /female, /male and /new-arrivals. ?search= and ?subcategory= filter too. */
function Products({ category, title }) {
    const [searchParams] = useSearchParams();
    const searchTerm = (searchParams.get("search") || "").trim().toLowerCase();
    const subcategory = (searchParams.get("subcategory") || "").trim().toLowerCase();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [wishlistMessage, setWishlistMessage] = useState("");

    const {
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
    } = useWishlist();

    useEffect(() => {
        getProducts()
            .then(setProducts)
            .catch(() =>
                setError("Could not load products. Please try again.")
            )
            .finally(() => setLoading(false));
    }, []);

    async function handleWishlistClick(event, product) {
        event.preventDefault();
        event.stopPropagation();
        setWishlistMessage("");

        try {
            if (isWishlisted(product._id)) {
                await removeFromWishlist(product._id);
            } else {
                await addToWishlist(product._id);
            }
        } catch (err) {
            setWishlistMessage(
                err.message || "Could not update your wishlist."
            );
        }
    }

    if (loading) return <p>Loading HAVEN products...</p>;
    if (error) return <p>{error}</p>;

    const visibleProducts = products.filter((product) => {
        if (category && product.category !== category) return false;
        if (subcategory && (product.subcategory || "").toLowerCase() !== subcategory) {
            return false;
        }
        if (searchTerm) {
            const haystack = [
                product.name,
                product.description,
                product.category,
                product.subcategory,
            ]
                .join(" ")
                .toLowerCase();
            return searchTerm.split(/\s+/).every((word) => haystack.includes(word));
        }
        return true;
    });

    return (
        <main className="products-page">
            <h1>
                {title ||
                    (category ? `${category}'s Collection` : "HAVEN Collection")}
            </h1>

            {wishlistMessage && (
                <p className="product-wishlist-message" role="status">
                    {wishlistMessage}
                </p>
            )}

            <div className="product-grid">
                {visibleProducts.map((product) => {
                    const saved = isWishlisted(product._id);

                    return (
                        <article className="product-card" key={product._id}>
                            <div className="product-card-image-wrap">
                                <Link
                                    to={`/products/${product._id}`}
                                    className="product-card-link"
                                >
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
                                </Link>

                                <button
                                    type="button"
                                    className={`product-wishlist-button ${
                                        saved ? "is-saved" : ""
                                    }`}
                                    onClick={(event) =>
                                        handleWishlistClick(event, product)
                                    }
                                    aria-label={
                                        saved
                                            ? `Remove ${product.name} from wishlist`
                                            : `Add ${product.name} to wishlist`
                                    }
                                    aria-pressed={saved}
                                >
                                    {saved ? "♥" : "♡"}
                                </button>
                            </div>

                            <Link
                                to={`/products/${product._id}`}
                                className="product-card-link product-card-text-link"
                            >
                                <h2>{product.name}</h2>
                                <p>{product.description}</p>

                                <p className="product-price">
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </p>

                                <p>
                                    {product.category} · {product.subcategory}
                                </p>
                            </Link>
                        </article>
                    );
                })}
            </div>

            {visibleProducts.length === 0 && (
                <p>
                    {products.length === 0
                        ? "No products available yet."
                        : "No products match your selection."}
                </p>
            )}
        </main>
    );
}

export default Products;

