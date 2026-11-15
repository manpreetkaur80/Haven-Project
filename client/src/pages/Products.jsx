
// // import { useEffect, useState } from "react";
// // import { getProducts } from "../services/api";
import "../styles/products.css";

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

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { getProducts } from "../services/api";
import { useWishlist } from "../context/WishlistContext";
import CollectionHero from "../components/CollectionHero";
import ServiceStrip from "../components/ServiceStrip";
import "../styles/products.css";

/* Hero + copy per shop page. Replace the media files to change the visuals. */
const HERO = {
    Women: {
        eyebrow: "Women",
        title: "Soft structure, quiet colour.",
        text: "Considered pieces for every day, in natural fabrics and easy shapes.",
        media: { video: "/media/haven-women.mp4", poster: "/media/haven-women-poster.jpg" },
    },
    Men: {
        eyebrow: "Men",
        title: "Everyday, well made.",
        text: "Relaxed tailoring and honest basics, built to be worn on repeat.",
        media: { video: "/media/haven-men.mp4", poster: "/media/haven-men-poster.jpg" },
    },
    New: {
        eyebrow: "Just in",
        title: "New arrivals.",
        text: "The latest pieces to land at HAVEN, fresh for the season.",
        media: { video: "/media/haven-newarrivals.mp4", poster: "/media/haven-newarrivals-poster.jpg" },
    },
    All: {
        eyebrow: "The collection",
        title: "Everything HAVEN.",
        text: "Browse the full range: shirts, knits, trousers and everyday essentials.",
        media: { video: "/media/haven-collection.mp4", poster: "/media/haven-collection-poster.jpg" },
    },
};

const SORTS = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
];

function titleCase(text) {
    return String(text || "")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/* Optional `category` ("Women" | "Men") and `title` props let the same page
   serve /female, /male and /new-arrivals. ?search= and ?subcategory= filter too. */
function Products({ category, title }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { pathname } = useLocation();

    /* Lets the stylesheet release the global #root width cap on this page. */
    useEffect(() => {
        document.documentElement.classList.add("is-wide");
        return () => document.documentElement.classList.remove("is-wide");
    }, []);

    const searchTerm = (searchParams.get("search") || "").trim().toLowerCase();
    const subcategory = (searchParams.get("subcategory") || "").trim().toLowerCase();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [wishlistMessage, setWishlistMessage] = useState("");
    const [sort, setSort] = useState("newest");

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

    const isNewArrivals = Boolean(title) && !category;
    const heroKey = category || (isNewArrivals ? "New" : "All");
    const hero = HERO[heroKey];

    /* Everything in this section of the shop (before sub-filters). */
    const scoped = useMemo(
        () =>
            products.filter((product) => !category || product.category === category),
        [products, category]
    );

    /* Sub-categories present in this section → category tiles + filter chips. */
    const subcategories = useMemo(() => {
        const map = new Map();
        scoped.forEach((product) => {
            const name = (product.subcategory || "").trim();
            if (!name) return;
            const key = name.toLowerCase();
            if (!map.has(key)) {
                map.set(key, { key, name, count: 0, image: "" });
            }
            const entry = map.get(key);
            entry.count += 1;
            if (!entry.image && product.images?.[0]?.url) {
                entry.image = product.images[0].url;
            }
        });
        return [...map.values()];
    }, [scoped]);

    const visibleProducts = useMemo(() => {
        const list = scoped.filter((product) => {
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

        const byDate = (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

        if (sort === "price-asc") {
            return [...list].sort((a, b) => Number(a.price) - Number(b.price));
        }
        if (sort === "price-desc") {
            return [...list].sort((a, b) => Number(b.price) - Number(a.price));
        }
        return isNewArrivals || sort === "newest" ? [...list].sort(byDate) : list;
    }, [scoped, subcategory, searchTerm, sort, isNewArrivals]);

    /* Fade cards up as they enter the viewport. */
    useEffect(() => {
        if (loading || typeof IntersectionObserver === "undefined") {
            return undefined;
        }
        const cards = document.querySelectorAll(".col-grid .product-card");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-in");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
        );
        cards.forEach((card, index) => {
            card.classList.add("reveal");
            card.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
            observer.observe(card);
        });
        return () => observer.disconnect();
    }, [loading, visibleProducts]);

    function chooseSubcategory(key) {
        const next = new URLSearchParams(searchParams);
        if (key) {
            next.set("subcategory", key);
        } else {
            next.delete("subcategory");
        }
        setSearchParams(next, { replace: true });
    }

    if (loading) {
        return (
            <main className="products-page">
                <p className="products-empty">Loading HAVEN products...</p>
            </main>
        );
    }
    if (error) {
        return (
            <main className="products-page">
                <p className="products-empty">{error}</p>
            </main>
        );
    }

    const searching = Boolean(searchParams.get("search"));
    const heroTitle = searching ? `Results for “${searchParams.get("search")}”` : hero.title;
    const count = `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"}`;
    const promoAt = Math.min(8, visibleProducts.length);

    const promo = (
        <aside className="col-promo" key="promo">
            <div>
                <p className="col-promo-eyebrow">
                    {isNewArrivals ? "The full range" : "Just landed"}
                </p>
                <h2>
                    {isNewArrivals
                        ? "Looking for something specific?"
                        : "New season, new textures."}
                </h2>
                <p>
                    {isNewArrivals
                        ? "Browse every piece in the HAVEN collection."
                        : "See the latest pieces to arrive at HAVEN."}
                </p>
            </div>
            <Link
                to={isNewArrivals ? "/products" : "/new-arrivals"}
                className="col-promo-cta"
            >
                {isNewArrivals ? "Browse the collection" : "Shop new arrivals"}
                <span aria-hidden="true"> ↗</span>
            </Link>
        </aside>
    );

    const cards = visibleProducts.map((product) => {
        const saved = isWishlisted(product._id);

        return (
            <article className="product-card" key={product._id}>
                <div className="product-card-image-wrap">
                    <Link
                        to={`/products/${product._id}`}
                        className="product-card-link"
                        aria-label={product.name}
                    >
                        <div className="product-image-placeholder">
                            {product.images?.[0]?.url ? (
                                <>
                                    <img
                                        src={product.images[0].url}
                                        alt={product.name}
                                        className="product-image"
                                        loading="lazy"
                                    />
                                    {product.images?.[1]?.url && (
                                        <img
                                            src={product.images[1].url}
                                            alt=""
                                            className="product-image is-alt"
                                            loading="lazy"
                                        />
                                    )}
                                </>
                            ) : (
                                <span>HAVEN</span>
                            )}
                        </div>
                        <span className="product-card-view" aria-hidden="true">
                            View piece
                        </span>
                    </Link>

                    <button
                        type="button"
                        className={`product-wishlist-button ${saved ? "is-saved" : ""}`}
                        onClick={(event) => handleWishlistClick(event, product)}
                        aria-label={
                            saved
                                ? `Remove ${product.name} from wishlist`
                                : `Add ${product.name} to wishlist`
                        }
                        aria-pressed={saved}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={saved ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M12 20.2s-7.5-4.5-7.5-10.1A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 7.5 2.6c0 5.6-7.5 10.1-7.5 10.1Z" />
                        </svg>
                    </button>
                </div>

                <Link
                    to={`/products/${product._id}`}
                    className="product-card-link product-card-text-link"
                >
                    <h2>{product.name}</h2>
                    <p className="product-card-meta">
                        {product.category}
                        {product.subcategory ? ` · ${product.subcategory}` : ""}
                    </p>
                    <p className="product-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>
                </Link>
            </article>
        );
    });

    const gridItems = [...cards];
    if (cards.length >= 3) {
        gridItems.splice(promoAt, 0, promo);
    }

    return (
        <>
            <CollectionHero
                media={hero.media}
                eyebrow={searching ? "Search" : hero.eyebrow}
                title={heroTitle}
                text={searching ? "" : hero.text}
                count={count}
            />

            {subcategories.length > 1 && !searching && (
                <section className="col-cats" aria-label="Shop by type">
                    <div className="col-cats-inner">
                        <p className="col-cats-label">Shop by type</p>
                        <ul>
                            {subcategories.map((sub) => (
                                <li key={sub.key}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            chooseSubcategory(sub.key);
                                            document
                                                .getElementById("shop")
                                                ?.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }}
                                    >
                                        <span
                                            className="col-cat-thumb"
                                            style={
                                                sub.image
                                                    ? { backgroundImage: `url(${sub.image})` }
                                                    : undefined
                                            }
                                            aria-hidden="true"
                                        >
                                            {!sub.image && sub.name.charAt(0)}
                                        </span>
                                        <span className="col-cat-text">
                                            <strong>{titleCase(sub.name)}</strong>
                                            <small>{sub.count} {sub.count === 1 ? "piece" : "pieces"}</small>
                                        </span>
                                        <span className="col-cat-arrow" aria-hidden="true">→</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <main className="products-page" id="shop">
                <div className="col-toolbar">
                    <div className="col-chips" role="group" aria-label="Filter by type">
                        <button
                            type="button"
                            className={!subcategory ? "is-active" : ""}
                            onClick={() => chooseSubcategory("")}
                        >
                            All
                        </button>
                        {subcategories.map((sub) => (
                            <button
                                type="button"
                                key={sub.key}
                                className={subcategory === sub.key ? "is-active" : ""}
                                onClick={() => chooseSubcategory(sub.key)}
                            >
                                {titleCase(sub.name)}
                            </button>
                        ))}
                    </div>

                    <label className="col-sort">
                        <span>Sort</span>
                        <select value={sort} onChange={(event) => setSort(event.target.value)}>
                            {SORTS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {searchParams.get("search") && (
                    <p className="products-filter">
                        Showing “{searchParams.get("search")}”{" "}
                        <Link to={pathname}>Clear</Link>
                    </p>
                )}

                {wishlistMessage && (
                    <p className="product-wishlist-message" role="status">
                        {wishlistMessage}
                    </p>
                )}

                <div className="product-grid col-grid">{gridItems}</div>

                {visibleProducts.length === 0 && (
                    <p className="products-empty">
                        {products.length === 0
                            ? "No products available yet."
                            : "No products match your selection."}
                    </p>
                )}
            </main>

            <ServiceStrip />
        </>
    );
}

export default Products;
