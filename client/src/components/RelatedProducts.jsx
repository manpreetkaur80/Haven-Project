import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";
import ProductCard from "./ProductCard";
import "../styles/related-products.css";

/* "You may also like": other pieces from the same category. */
function RelatedProducts({ product }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        let active = true;
        getProducts()
            .then((all) => {
                if (!active || !Array.isArray(all)) return;
                const same = all.filter(
                    (item) => item._id !== product._id && item.category === product.category
                );
                const others = all.filter(
                    (item) => item._id !== product._id && item.category !== product.category
                );
                setItems([...same, ...others].slice(0, 4));
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [product._id, product.category]);

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="related" aria-labelledby="related-title">
            <div className="related-head">
                <h2 id="related-title">You may also like</h2>
                <Link to={product.category === "Men" ? "/male" : "/female"}>
                    View all <span aria-hidden="true">↗</span>
                </Link>
            </div>
            <div className="related-grid">
                {items.map((item) => (
                    <ProductCard key={item._id} product={item} />
                ))}
            </div>
        </section>
    );
}

export default RelatedProducts;
