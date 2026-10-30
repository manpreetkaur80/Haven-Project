
// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { getProductById } from "../services/api";
// import { useCart } from "../context/CartContext";
// import "../styles/product-details.css";
// import { useWishlist } from "../context/WishlistContext";
// function ProductDetails() {
//     const { id } = useParams();
//     const { addToCart } = useCart();
//     const {
//     addToWishlist,
//     removeFromWishlist,
//     isWishlisted,
// } = useWishlist();

// const [wishlistMessage, setWishlistMessage] = useState("");
//     const [product, setProduct] = useState(null);
//     const [selectedImage, setSelectedImage] = useState(0);
//     const [selectedSize, setSelectedSize] = useState("");
//     const [selectedColor, setSelectedColor] = useState("");
//     const [quantity, setQuantity] = useState(1);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [message, setMessage] = useState("");

//     useEffect(() => {
//         setLoading(true);
//         setError("");
//         setProduct(null);
//         setSelectedImage(0);
//         setSelectedSize("");
//         setSelectedColor("");
//         setQuantity(1);
//         setMessage("");

//         getProductById(id)
//             .then((data) => {
//                 setProduct(data);
//                 setSelectedSize(data.sizes?.[0] || "");
//                 setSelectedColor(data.colors?.[0] || "");
//             })
//             .catch((err) => {
//                 setError(err.message || "Could not load product.");
//             })
//             .finally(() => setLoading(false));
//     }, [id]);

//     if (loading) {
//         return <main className="detail-message">Loading product...</main>;
//     }

//     if (error || !product) {
//         return (
//             <main className="detail-message">
//                 <h1>Product unavailable</h1>
//                 <p>{error || "This product could not be found."}</p>
//                 <Link to="/products">Back to HAVEN Collection</Link>
//             </main>
//         );
//     }

//     const images = product.images || [];
//     const currentImage = images[selectedImage];
//     const outOfStock = product.stock <= 0;

//    const handleAddToBag = () => {
//     if (outOfStock) {
//         setMessage("This product is currently out of stock.");
//         return;
//     }

//     if (product.sizes?.length && !selectedSize) {
//         setMessage("Please select a size.");
//         return;
//     }

//     if (product.colors?.length && !selectedColor) {
//         setMessage("Please select a color.");
//         return;
//     }

//     addToCart(product, selectedSize, selectedColor, quantity);

//     setMessage("Added to your bag successfully!");
// };
//     return (
//         <main className="product-details-page">
//             <nav className="detail-breadcrumb" aria-label="Breadcrumb">
//                 <Link to="/">Home</Link>
//                 <span>/</span>
//                 <Link to="/products">Collection</Link>
//                 <span>/</span>
//                 <span>{product.name}</span>
//             </nav>

//             <div className="product-details-layout">
//                 <section className="detail-gallery">
//                     <div className="detail-thumbnails">
//                         {images.map((image, index) => (
//                             <button
//                                 type="button"
//                                 key={image.publicId || image.url}
//                                 className={`detail-thumbnail ${
//                                     selectedImage === index
//                                         ? "active"
//                                         : ""
//                                 }`}
//                                 onClick={() => setSelectedImage(index)}
//                                 aria-label={`View product image ${index + 1}`}
//                                 aria-pressed={selectedImage === index}
//                             >
//                                 <img
//                                     src={image.url}
//                                     alt={`${product.name} view ${index + 1}`}
//                                 />
//                             </button>
//                         ))}
//                     </div>

//                     <div className="detail-main-image">
//                         {currentImage?.url ? (
//                             <img
//                                 src={currentImage.url}
//                                 alt={product.name}
//                             />
//                         ) : (
//                             <div className="detail-no-image">
//                                 Product image coming soon
//                             </div>
//                         )}
//                     </div>
//                 </section>

//                 <section className="detail-information">
//                     <p className="detail-category">
//                         {product.category} / {product.subcategory}
//                     </p>

//                     <h1>{product.name}</h1>

//                     <p className="detail-price">
//                         ₹{product.price.toLocaleString("en-IN")}
//                     </p>

//                     <p className="detail-description">
//                         {product.description}
//                     </p>

//                     <div className="detail-divider" />

//                     {product.sizes?.length > 0 && (
//                         <section className="detail-option">
//                             <div className="detail-option-heading">
//                                 <span>Size</span>
//                                 <span>{selectedSize}</span>
//                             </div>

//                             <div className="detail-size-list">
//                                 {product.sizes.map((size) => (
//                                     <button
//                                         type="button"
//                                         key={size}
//                                         className={`detail-size-button ${
//                                             selectedSize === size
//                                                 ? "selected"
//                                                 : ""
//                                         }`}
//                                         onClick={() => {
//                                             setSelectedSize(size);
//                                             setMessage("");
//                                         }}
//                                         aria-pressed={selectedSize === size}
//                                     >
//                                         {size}
//                                     </button>
//                                 ))}
//                             </div>
//                         </section>
//                     )}

//                     {product.colors?.length > 0 && (
//                         <section className="detail-option">
//                             <div className="detail-option-heading">
//                                 <span>Color</span>
//                                 <span>{selectedColor}</span>
//                             </div>

//                             <div className="detail-color-list">
//                                 {product.colors.map((color) => (
//                                     <button
//                                         type="button"
//                                         key={color}
//                                         className={`detail-color-button ${
//                                             selectedColor === color
//                                                 ? "selected"
//                                                 : ""
//                                         }`}
//                                         onClick={() => {
//                                             setSelectedColor(color);
//                                             setMessage("");
//                                         }}
//                                         aria-pressed={selectedColor === color}
//                                     >
//                                         {color}
//                                     </button>
//                                 ))}
//                             </div>
//                         </section>
//                     )}

//                     <section className="detail-option">
//                         <div className="detail-option-heading">
//                             <span>Quantity</span>
//                             <span>{product.stock} available</span>
//                         </div>

//                         <div className="detail-quantity">
//                             <button
//                                 type="button"
//                                 onClick={() =>
//                                     setQuantity((previous) =>
//                                         Math.max(1, previous - 1)
//                                     )
//                                 }
//                                 disabled={quantity <= 1}
//                                 aria-label="Decrease quantity"
//                             >
//                                 −
//                             </button>

//                             <span>{quantity}</span>

//                             <button
//                                 type="button"
//                                 onClick={() =>
//                                     setQuantity((previous) =>
//                                         Math.min(
//                                             product.stock,
//                                             previous + 1
//                                         )
//                                     )
//                                 }
//                                 disabled={
//                                     outOfStock || quantity >= product.stock
//                                 }
//                                 aria-label="Increase quantity"
//                             >
//                                 +
//                             </button>
//                         </div>
//                     </section>

//                     <p className={`detail-stock ${
//                         outOfStock ? "out-of-stock" : ""
//                     }`}>
//                         {outOfStock
//                             ? "Currently out of stock"
//                             : "In stock"}
//                     </p>

//                     <button
//                         type="button"
//                         className="detail-add-button"
//                         onClick={handleAddToBag}
//                         disabled={outOfStock}
//                     >
//                         {outOfStock ? "Out of Stock" : "Add to Bag"}
//                     </button>

//                     {message && (
//                         <p className="detail-message-text" role="status">
//                             {message}
//                         </p>
//                     )}

//                     <div className="detail-extra-info">
//                         <p>Thoughtfully selected for everyday wear.</p>
//                         <p>Category: {product.category}</p>
//                         <p>Product type: {product.subcategory}</p>
//                     </div>
//                 </section>
//             </div>
//         </main>
//     );
// }

// export default ProductDetails;

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import "../styles/product-details.css";

function ProductDetails() {
    const { id } = useParams();
    const { addToCart } = useCart();

    const {
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
    } = useWishlist();

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [wishlistMessage, setWishlistMessage] = useState("");

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");
        setProduct(null);
        setSelectedImage(0);
        setSelectedSize("");
        setSelectedColor("");
        setQuantity(1);
        setMessage("");
        setWishlistMessage("");

        getProductById(id)
            .then((data) => {
                if (!active) return;

                setProduct(data);
                setSelectedSize(data.sizes?.[0] || "");
                setSelectedColor(data.colors?.[0] || "");
            })
            .catch((err) => {
                if (active) {
                    setError(
                        err.message || "Could not load product."
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    async function handleWishlistClick() {
        if (!product) return;

        setWishlistMessage("");

        try {
            if (isWishlisted(product._id)) {
                await removeFromWishlist(product._id);
                setWishlistMessage("Removed from your wishlist.");
            } else {
                await addToWishlist(product._id);
                setWishlistMessage("Saved to your wishlist.");
            }
        } catch (err) {
            setWishlistMessage(
                err.message || "Could not update your wishlist."
            );
        }
    }

    function handleAddToBag() {
        if (outOfStock) {
            setMessage("This product is currently out of stock.");
            return;
        }

        if (product.sizes?.length && !selectedSize) {
            setMessage("Please select a size.");
            return;
        }

        if (product.colors?.length && !selectedColor) {
            setMessage("Please select a color.");
            return;
        }

        addToCart(
            product,
            selectedSize,
            selectedColor,
            quantity
        );

        setMessage("Added to your bag successfully!");
    }

    if (loading) {
        return (
            <main className="detail-message">
                Loading product...
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="detail-message">
                <h1>Product unavailable</h1>
                <p>
                    {error || "This product could not be found."}
                </p>
                <Link to="/products">
                    Back to HAVEN Collection
                </Link>
            </main>
        );
    }

    const images = product.images || [];
    const currentImage = images[selectedImage];
    const outOfStock = Number(product.stock) <= 0;
    const saved = isWishlisted(product._id);

    return (
        <main className="product-details-page">
            <nav
                className="detail-breadcrumb"
                aria-label="Breadcrumb"
            >
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/products">Collection</Link>
                <span>/</span>
                <span>{product.name}</span>
            </nav>

            <div className="product-details-layout">
                {/* Product images */}
                <section className="detail-gallery">
                    <div className="detail-thumbnails">
                        {images.map((image, index) => (
                            <button
                                type="button"
                                key={image.publicId || image.url || index}
                                className={`detail-thumbnail ${
                                    selectedImage === index
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setSelectedImage(index)
                                }
                                aria-label={`View product image ${index + 1}`}
                                aria-pressed={
                                    selectedImage === index
                                }
                            >
                                <img
                                    src={image.url}
                                    alt={`${product.name} view ${index + 1}`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="detail-main-image">
                        {currentImage?.url ? (
                            <img
                                src={currentImage.url}
                                alt={product.name}
                            />
                        ) : (
                            <div className="detail-no-image">
                                Product image coming soon
                            </div>
                        )}
                    </div>
                </section>

                {/* Product information */}
                <section className="detail-information">
                    <p className="detail-category">
                        {product.category}
                        {product.subcategory
                            ? ` / ${product.subcategory}`
                            : ""}
                    </p>

                    <h1>{product.name}</h1>

                    <p className="detail-price">
                        ₹
                        {Number(product.price || 0).toLocaleString(
                            "en-IN"
                        )}
                    </p>

                    <p className="detail-description">
                        {product.description}
                    </p>

                    <div className="detail-divider" />

                    {/* Size selection */}
                    {product.sizes?.length > 0 && (
                        <section className="detail-option">
                            <div className="detail-option-heading">
                                <span>Size</span>
                                <span>{selectedSize}</span>
                            </div>

                            <div className="detail-size-list">
                                {product.sizes.map((size) => (
                                    <button
                                        type="button"
                                        key={size}
                                        className={`detail-size-button ${
                                            selectedSize === size
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setSelectedSize(size);
                                            setMessage("");
                                        }}
                                        aria-pressed={
                                            selectedSize === size
                                        }
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Color selection */}
                    {product.colors?.length > 0 && (
                        <section className="detail-option">
                            <div className="detail-option-heading">
                                <span>Color</span>
                                <span>{selectedColor}</span>
                            </div>

                            <div className="detail-color-list">
                                {product.colors.map((color) => (
                                    <button
                                        type="button"
                                        key={color}
                                        className={`detail-color-button ${
                                            selectedColor === color
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setSelectedColor(color);
                                            setMessage("");
                                        }}
                                        aria-pressed={
                                            selectedColor === color
                                        }
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Quantity */}
                    <section className="detail-option">
                        <div className="detail-option-heading">
                            <span>Quantity</span>
                            <span>
                                {Number(product.stock) || 0} available
                            </span>
                        </div>

                        <div className="detail-quantity">
                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((previous) =>
                                        Math.max(1, previous - 1)
                                    )
                                }
                                disabled={quantity <= 1}
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>

                            <span>{quantity}</span>

                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((previous) =>
                                        Math.min(
                                            Number(product.stock) || 0,
                                            previous + 1
                                        )
                                    )
                                }
                                disabled={
                                    outOfStock ||
                                    quantity >= Number(product.stock)
                                }
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </section>

                    <p
                        className={`detail-stock ${
                            outOfStock ? "out-of-stock" : ""
                        }`}
                    >
                        {outOfStock
                            ? "Currently out of stock"
                            : "In stock"}
                    </p>

                    {/* Add to bag */}
                    <button
                        type="button"
                        className="detail-add-button"
                        onClick={handleAddToBag}
                        disabled={outOfStock}
                    >
                        {outOfStock ? "Out of Stock" : "Add to Bag"}
                    </button>

                    {message && (
                        <p
                            className="detail-message-text"
                            role="status"
                        >
                            {message}
                        </p>
                    )}

                    {/* Wishlist */}
                    <button
                        type="button"
                        className={`detail-wishlist-button ${
                            saved ? "is-saved" : ""
                        }`}
                        onClick={handleWishlistClick}
                        aria-pressed={saved}
                    >
                        {saved
                            ? "♥ Saved to Wishlist"
                            : "♡ Add to Wishlist"}
                    </button>

                    {wishlistMessage && (
                        <p
                            className="detail-message-text"
                            role="status"
                        >
                            {wishlistMessage}
                        </p>
                    )}

                    <div className="detail-extra-info">
                        <p>
                            Thoughtfully selected for everyday wear.
                        </p>
                        <p>Category: {product.category}</p>
                        <p>
                            Product type: {product.subcategory}
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default ProductDetails;
