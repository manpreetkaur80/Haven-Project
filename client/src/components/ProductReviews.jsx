import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProductReview, getProductReviews } from "../services/api";
import Stars from "./Stars";
import "../styles/product-reviews.css";

/* Reviews list + form for the product page. Reviews are accepted only from
   customers whose order was delivered (enforced by the server). */
function ProductReviews({ productId }) {
    const { token } = useAuth();
    const [data, setData] = useState({ count: 0, average: 0, reviews: [] });
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [status, setStatus] = useState("idle"); // idle | sending | done
    const [message, setMessage] = useState("");

    const load = useCallback(() => {
        getProductReviews(productId)
            .then((result) => setData(result))
            .catch(() => {});
    }, [productId]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");

        if (!rating) {
            setMessage("Please choose a star rating.");
            return;
        }

        setStatus("sending");

        try {
            await createProductReview(token, productId, { rating, comment });
            setStatus("done");
            setMessage("Thank you for your review.");
            setComment("");
            setRating(0);
            load();
        } catch (error) {
            setStatus("idle");
            setMessage(error.message || "Could not save your review.");
        }
    }

    return (
        <section className="haven-pr" aria-labelledby="pr-title">
            <div className="haven-pr-head">
                <h2 id="pr-title">Reviews</h2>
                {data.count > 0 && (
                    <p className="haven-pr-summary">
                        <Stars value={data.average} />
                        <span>
                            {data.average.toFixed(1)} · {data.count}{" "}
                            {data.count === 1 ? "review" : "reviews"}
                        </span>
                    </p>
                )}
            </div>

            <div className="haven-pr-body">
                <ul className="haven-pr-list">
                    {data.reviews.length === 0 && (
                        <li className="haven-pr-empty">No reviews yet.</li>
                    )}
                    {data.reviews.map((review) => (
                        <li key={review._id}>
                            <Stars value={review.rating} />
                            <p className="haven-pr-comment">{review.comment}</p>
                            <p className="haven-pr-by">
                                {review.reviewerName} ·{" "}
                                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>
                        </li>
                    ))}
                </ul>

                <div className="haven-pr-form-wrap">
                    {!token ? (
                        <p className="haven-pr-note">
                            <Link to="/login">Log in</Link> to review a product you
                            have received.
                        </p>
                    ) : status === "done" ? (
                        <p className="haven-pr-note" role="status">{message}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="haven-pr-form">
                            <h3>Write a review</h3>

                            <div className="haven-pr-rate" role="radiogroup" aria-label="Rating">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        type="button"
                                        key={n}
                                        role="radio"
                                        aria-checked={rating === n}
                                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                                        className={n <= rating ? "is-on" : ""}
                                        onClick={() => setRating(n)}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24"
                                            fill={n <= rating ? "currentColor" : "none"}
                                            stroke="currentColor" strokeWidth="1.2"
                                            strokeLinejoin="round" aria-hidden="true">
                                            <path d="m12 3.2 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9L12 3.2Z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>

                            <label htmlFor="pr-comment">Your review</label>
                            <textarea
                                id="pr-comment"
                                rows={4}
                                maxLength={600}
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                required
                            />

                            <button type="submit" disabled={status === "sending"}>
                                {status === "sending" ? "Sending" : "Submit review"}
                            </button>

                            {message && (
                                <p className="haven-pr-error" role="status">{message}</p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}

export default ProductReviews;
