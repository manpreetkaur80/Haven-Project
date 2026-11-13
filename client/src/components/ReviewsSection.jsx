import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestReviews } from "../services/api";
import Stars from "./Stars";
import "../styles/reviews-section.css";

/* Real reviews from verified buyers. Renders nothing until some exist. */
function ReviewsSection() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        let active = true;

        getLatestReviews()
            .then((data) => {
                if (active && Array.isArray(data)) setReviews(data);
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, []);

    if (reviews.length === 0) return null;

    return (
        <section className="haven-reviews" aria-labelledby="reviews-title">
            <header className="haven-reviews-head">
                <p className="haven-reviews-eyebrow">Reviews</p>
                <h2 id="reviews-title">Worn and loved</h2>
            </header>

            <ul className="haven-reviews-grid">
                {reviews.slice(0, 3).map((review) => (
                    <li key={review._id}>
                        <Stars value={review.rating} />
                        <blockquote>“{review.comment}”</blockquote>
                        <p className="haven-reviews-by">
                            {review.reviewerName}
                            {review.product?.name && (
                                <>
                                    {" · "}
                                    <Link to={`/products/${review.product._id}`}>
                                        {review.product.name}
                                    </Link>
                                </>
                            )}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default ReviewsSection;
