import { Link } from "react-router-dom";
import "../styles/category-cards.css";

const CARDS = [
    { key: "Women", to: "/female", label: "Women", cta: "Shop women" },
    { key: "Men", to: "/male", label: "Men", cta: "Shop men" },
];

/* Two large editorial cards. Imagery comes from the newest real product in
   each category; a quiet tonal block shows if there is no photo yet. */
function CategoryCards({ products }) {
    function imageFor(category) {
        const match = products.find(
            (product) => product.category === category && product.images?.[0]?.url
        );
        return match?.images?.[0]?.url || "";
    }

    return (
        <section className="haven-cats" aria-labelledby="cats-title">
            <header className="haven-cats-head">
                <p className="haven-cats-eyebrow">Departments</p>
                <h2 id="cats-title">Shop by department</h2>
            </header>

            <div className="haven-cats-grid">
            {CARDS.map((card) => {
                const image = imageFor(card.key);

                return (
                    <Link
                        to={card.to}
                        className={`haven-cat is-${card.key.toLowerCase()}`}
                        key={card.key}
                    >
                        <div className="haven-cat-media">
                            {image && <img src={image} alt="" loading="lazy" />}
                        </div>
                        <div className="haven-cat-copy">
                            <h2>{card.label}</h2>
                            <span className="haven-cat-cta">
                                {card.cta}
                                <span aria-hidden="true"> ↗</span>
                            </span>
                        </div>
                    </Link>
                );
            })}
            </div>
        </section>
    );
}

export default CategoryCards;
