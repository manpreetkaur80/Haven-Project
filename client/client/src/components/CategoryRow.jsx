import { Link } from "react-router-dom";
import "../styles/category-row.css";

const MAX_TILES = 4;

/* Builds tiles from the subcategories that really exist in the catalogue. */
function buildTiles(products) {
    const groups = new Map();

    products.forEach((product) => {
        const name = (product.subcategory || "").trim();
        if (!name) return;

        const key = name.toLowerCase();
        const group = groups.get(key) || { name, count: 0, image: "" };
        group.count += 1;
        if (!group.image && product.images?.[0]?.url) {
            group.image = product.images[0].url; // API is newest-first
        }
        groups.set(key, group);
    });

    return [...groups.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_TILES);
}

function CategoryRow({ products }) {
    const tiles = buildTiles(products);

    if (tiles.length < 2) return null;

    return (
        <section className="haven-crow" aria-labelledby="crow-title">
            <header className="haven-crow-head">
                <div>
                    <p className="haven-crow-eyebrow">Browse</p>
                    <h2 id="crow-title">Shop by category</h2>
                </div>
                <Link to="/products" className="haven-crow-all">
                    All products
                </Link>
            </header>

            <ul className="haven-crow-grid">
                {tiles.map((tile) => (
                    <li key={tile.name}>
                        <Link
                            to={`/products?subcategory=${encodeURIComponent(tile.name)}`}
                            className="haven-crow-tile"
                        >
                            <div className="haven-crow-media">
                                {tile.image && (
                                    <img src={tile.image} alt="" loading="lazy" />
                                )}
                            </div>
                            <div className="haven-crow-label">
                                <span>{tile.name}</span>
                                <span className="haven-crow-count">
                                    {tile.count} {tile.count === 1 ? "piece" : "pieces"}
                                </span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default CategoryRow;
