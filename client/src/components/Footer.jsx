import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/footer.css";

function Footer() {
    const { user, token } = useAuth();
    const loggedIn = Boolean(token && user);

    return (
        <footer className="haven-footer">
            <div className="haven-footer-main">
                <div className="haven-footer-brand">
                    <Link to="/" className="haven-footer-logo">
                        HAVEN
                    </Link>
                    <p>Everyday, in your element.</p>
                </div>

                <nav className="haven-footer-col" aria-label="Shop">
                    <h2>Shop</h2>
                    <ul>
                        <li><Link to="/female">Women</Link></li>
                        <li><Link to="/male">Men</Link></li>
                        <li><Link to="/products">Collections</Link></li>
                        <li><Link to="/new-arrivals">New arrivals</Link></li>
                    </ul>
                </nav>

                <nav className="haven-footer-col" aria-label="Account">
                    <h2>Account</h2>
                    <ul>
                        <li>
                            <Link to={loggedIn ? "/profile" : "/login"}>
                                {loggedIn ? "My account" : "Log in"}
                            </Link>
                        </li>
                        {!loggedIn && (
                            <li><Link to="/signup">Create account</Link></li>
                        )}
                        <li><Link to="/wishlist">Wishlist</Link></li>
                        <li><Link to="/cart">Shopping bag</Link></li>
                    </ul>
                </nav>
            </div>

            <div className="haven-footer-base">
                <p>© {new Date().getFullYear()} HAVEN. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
