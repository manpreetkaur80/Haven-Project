import { Link } from "react-router-dom";
import "../styles/not-found.css";

function NotFound() {
    return (
        <main className="not-found">
            <p className="not-found-eyebrow">Error 404</p>
            <h1>This page has wandered off.</h1>
            <p>The page you’re looking for doesn’t exist or has moved.</p>
            <div className="not-found-actions">
                <Link to="/">Back to home</Link>
                <Link to="/products">Shop the collection</Link>
            </div>
        </main>
    );
}

export default NotFound;
