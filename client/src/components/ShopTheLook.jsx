import { Link } from "react-router-dom";
import "../styles/shop-the-look.css";

/* Replace /media/haven-look.jpg with your lookbook photograph. */
const IMAGE = "/media/haven-look.jpg";
const MAX_ITEMS = 3;

/* Picks up to three real products from different subcategories
   (featured first) so the look reads as a complete outfit. */
function pickLook(products) {
    const ordered = [
        ...products.filter((product) => product.isFeatured),
        ...products.filter((product) => !product.isFeatured),
    ];
    const seen = new Set();
    const picked = [];

    ordered.forEach((product) => {
        const key = (product.subcategory || "").toLowerCase();
        if (picked.length < MAX_ITEMS && !seen.has(key)) {
            seen.add(key);
            picked.push(product);
        }
    });

    return picked;
}

function ShopTheLook({ products }) {
    const items = pickLook(products);

    if (items.length < 2) return null;

    return (
        <section className="haven-look" aria-labelledby="look-title">
            <div
                className="haven-look-media"
                style={{ backgroundImage: `url(${IMAGE})` }}
                role="img"
                aria-label="HAVEN lookbook photograph"
            />

            <div className="haven-look-copy">
                <p className="haven-look-eyebrow">The look</p>
                <h2 id="look-title">Shop the look</h2>

                <ul>
                    {items.map((product) => (
                        <li key={product._id}>
                            <Link to={`/products/${product._id}`}>
                                <span className="haven-look-thumb">
                                    {product.images?.[0]?.url && (
                                        <img src={product.images[0].url} alt="" loading="lazy" />
                                    )}
                                </span>
                                <span className="haven-look-info">
                                    <span className="haven-look-name">{product.name}</span>
                                    <span className="haven-look-price">
                                        ₹{Number(product.price).toLocaleString("en-IN")}
                                    </span>
                                </span>
                                <span className="haven-look-arrow" aria-hidden="true">↗</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default ShopTheLook;
