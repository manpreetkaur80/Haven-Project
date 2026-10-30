
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import LogoutButton from "./LogoutButton";
import "./Header.css";
import { useWishlist } from "../context/WishlistContext";
function Header() {
    const { user, token } = useAuth();
    const { cartItems } = useCart();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { wishlistCount } = useWishlist();
    const cartCount = Array.isArray(cartItems)
        ? cartItems.reduce(
              (total, item) => total + Number(item.quantity || 1),
              0
          )
        : 0;

    function handleSearch(event) {
        event.preventDefault();

        const query = searchTerm.trim();

        if (query) {
            window.location.href =
                `/products?search=${encodeURIComponent(query)}`;
        }
    }

    return (
        <header className="haven-header">
            <nav className="haven-nav">
                <div className="haven-nav-left">
                    <NavLink to="/female">Women</NavLink>
                    <NavLink to="/male">Men</NavLink>
                    <NavLink to="/new-arrivals">New Arrivals</NavLink>
                    <NavLink to="/products">Collections</NavLink>
                </div>

                <Link to="/" className="haven-logo">
                    HAVEN
                </Link>

                <div className="haven-nav-right">
                    <Link to="/wishlist">
    Wishlist ({wishlistCount})
</Link>
                    <button
                        type="button"
                        className="haven-nav-button"
                        onClick={() => setSearchOpen(!searchOpen)}
                        aria-label="Search products"
                    >
                        Search
                    </button>

                    {token && user ? (
                        <Link to="/profile">Account</Link>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}

                    <Link to="/cart">
                        Bag ({cartCount})
                    </Link>

                    {token && (
                        <LogoutButton />
                    )}
                </div>
            </nav>

            {searchOpen && (
                <form
                    className="haven-search"
                    onSubmit={handleSearch}
                >
                    <input
                        type="search"
                        placeholder="Search clothing..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        autoFocus
                    />

                    <button type="submit">Search</button>

                    <button
                        type="button"
                        onClick={() => setSearchOpen(false)}
                    >
                        Close
                    </button>
                </form>
            )}
        </header>
    );
}

export default Header;
