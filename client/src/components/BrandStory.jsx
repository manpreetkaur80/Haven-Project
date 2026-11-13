import { Link } from "react-router-dom";
import "../styles/brand-story.css";

/* Replace /media/haven-story.jpg with your own editorial photograph. */
const IMAGE = "/media/haven-story.jpg";

function BrandStory() {
    return (
        <section className="haven-story" aria-labelledby="story-title">
            <div
                className="haven-story-media"
                style={{ backgroundImage: `url(${IMAGE})` }}
                role="img"
                aria-label="HAVEN editorial photograph"
            />
            <div className="haven-story-copy">
                <p className="haven-story-eyebrow">About HAVEN</p>
                <h2 id="story-title">Effortless, everyday style.</h2>
                <p className="haven-story-text">
                    HAVEN is contemporary clothing for women and men: timeless
                    essentials you reach for every day, alongside a curated edit
                    of the season’s trends. Considered fabrics, easy silhouettes,
                    and pieces that simply feel like you.
                </p>
                <Link to="/products" className="haven-story-link">
                    Explore collections <span aria-hidden="true">↗</span>
                </Link>
            </div>
        </section>
    );
}

export default BrandStory;
