import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import "../styles/product-card.css";

const HeartIcon = ({ filled }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M12 20.2s-7.5-4.5-7.5-10.1A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 7.5 2.6c0 5.6-7.5 10.1-7.5 10.1Z" />
    </svg>
);

/* Editorial product tile: image, name, category, price, wishlist heart. */
function ProductCard({ product }) {
    const { token } = useAuth();
    const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
    const navigate = useNavigate();

    const saved = isWishlisted(product._id);
    const [first, second] = product.images || [];

    async function toggleWishlist(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            if (saved) {
                await removeFromWishlist(product._id);
            } else {
                await addToWishlist(product._id);
            }
        } catch {
            /* Wishlist page surfaces errors; keep the tile quiet. */
        }
    }

    return (
        <article className="haven-card">
            <Link to={`/products/${product._id}`} className="haven-card-link">
                <div className="haven-card-media">
                    {first?.url ? (
                        <>
                            <img src={first.url} alt={product.name} loading="lazy" draggable="false" />
                            {second?.url && (
                                <img className="is-alt" src={second.url} alt="" loading="lazy" draggable="false" />
                            )}
                        </>
                    ) : (
                        <span className="haven-card-empty">HAVEN</span>
                    )}
                </div>

                <div className="haven-card-info">
                    <h3>{product.name}</h3>
                    <p className="haven-card-meta">
                        {product.category}
                        {product.subcategory ? ` · ${product.subcategory}` : ""}
                    </p>
                    <p className="haven-card-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>
                </div>
            </Link>

            <button
                type="button"
                className={`haven-card-save ${saved ? "is-saved" : ""}`}
                onClick={toggleWishlist}
                aria-pressed={saved}
                aria-label={
                    saved
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                }
            >
                <HeartIcon filled={saved} />
            </button>
        </article>
    );
}

export default ProductCard;
