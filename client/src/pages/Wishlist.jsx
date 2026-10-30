
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import "../styles/wishlist.css";

function Wishlist() {
    const {
        wishlistItems,
        loading,
        error,
        removeFromWishlist,
    } = useWishlist();

    async function handleRemove(productId) {
        try {
            await removeFromWishlist(productId);
        } catch (err) {
            window.alert(err.message || "Could not remove this product.");
        }
    }

    if (loading) {
        return (
            <main className="wishlist-page">
                <p>Loading your wishlist...</p>
            </main>
        );
    }

    return (
        <main className="wishlist-page">
            <header className="wishlist-heading">
                <p className="wishlist-eyebrow">YOUR PERSONAL EDIT</p>
                <h1>Wishlist</h1>
                <p>
                    {wishlistItems.length}{" "}
                    {wishlistItems.length === 1 ? "item" : "items"} saved
                </p>
            </header>

            {error && (
                <p className="wishlist-error" role="alert">
                    {error}
                </p>
            )}

            {wishlistItems.length === 0 ? (
                <section className="wishlist-empty">
                    <h2>Keep the pieces you love.</h2>
                    <p>Your wishlist is waiting for something special.</p>
                    <Link to="/products" className="wishlist-shop-button">
                        Explore the collection
                    </Link>
                </section>
            ) : (
                <div className="wishlist-grid">
                    {wishlistItems.map((product) => (
                        <article
                            className="wishlist-card"
                            key={product._id}
                        >
                            <Link
                                to={`/products/${product._id}`}
                                className="wishlist-image-link"
                            >
                                {product.images?.[0]?.url ? (
                                    <img
                                        src={product.images[0].url}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div className="wishlist-no-image">
                                        Image coming soon
                                    </div>
                                )}
                            </Link>

                            <div className="wishlist-card-info">
                                <div>
                                    <h2>
                                        <Link to={`/products/${product._id}`}>
                                            {product.name}
                                        </Link>
                                    </h2>
                                    <p>
                                        {product.category}
                                        {product.subcategory
                                            ? ` · ${product.subcategory}`
                                            : ""}
                                    </p>
                                    <p className="wishlist-price">
                                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="wishlist-remove-button"
                                    onClick={() => handleRemove(product._id)}
                                    aria-label={`Remove ${product.name} from wishlist`}
                                >
                                    Remove
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default Wishlist;
