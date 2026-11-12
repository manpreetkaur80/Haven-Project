import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import LogoutButton from "./LogoutButton";
import "./Header.css";

/* ---------- Thin, consistent line icons (1.25 stroke, 24px grid) ---------- */
const iconProps = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: "false",
};

const SearchIcon = () => (
    <svg {...iconProps}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2" />
    </svg>
);
const HeartIcon = () => (
    <svg {...iconProps}>
        <path d="M12 20.2s-7.5-4.5-7.5-10.1A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 7.5 2.6c0 5.6-7.5 10.1-7.5 10.1Z" />
    </svg>
);
const UserIcon = () => (
    <svg {...iconProps}>
        <circle cx="12" cy="8.5" r="3.6" />
        <path d="M4.8 20c.6-3.6 3.4-5.6 7.2-5.6s6.6 2 7.2 5.6" />
    </svg>
);
const BagIcon = () => (
    <svg {...iconProps}>
        <path d="M5.2 8.2h13.6l.9 11.3H4.3L5.2 8.2Z" />
        <path d="M8.8 8.2V7a3.2 3.2 0 0 1 6.4 0v1.2" />
    </svg>
);
const MenuIcon = () => (
    <svg {...iconProps}>
        <path d="M4 8h16M4 16h16" />
    </svg>
);
const CloseIcon = () => (
    <svg {...iconProps}>
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);

const NAV_LINKS = [
    { to: "/female", label: "Women" },
    { to: "/male", label: "Men" },
    { to: "/products", label: "Collections" },
];

const POPULAR_SEARCHES = ["Linen shirts", "Knitwear", "Denim", "Outerwear"];

function Header() {
    const { user, token } = useAuth();
    const { cartItems } = useCart();
    const { wishlistCount } = useWishlist();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const isHome = pathname === "/";

    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const accountRef = useRef(null);

    const cartCount = Array.isArray(cartItems)
        ? cartItems.reduce(
              (total, item) => total + Number(item.quantity || 1),
              0
          )
        : 0;

    const loggedIn = Boolean(token && user);

    /* Solid once the user has scrolled past the hero (home only). */
    useEffect(() => {
        if (!isHome) {
            return undefined;
        }

        let frame = 0;

        const update = () => {
            frame = 0;
            const threshold = Math.max(window.innerHeight - 96, 200);
            setScrolled(window.scrollY > threshold);
        };

        const onScroll = () => {
            if (!frame) {
                frame = window.requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (frame) {
                window.cancelAnimationFrame(frame);
            }
        };
    }, [isHome]);

    /* Close any open panel when the route changes. */
    useEffect(() => {
        setMenuOpen(false);
        setSearchOpen(false);
        setAccountOpen(false);
    }, [pathname]);

    /* Lock page scroll while the drawer / search overlay is open. */
    useEffect(() => {
        if (!menuOpen && !searchOpen) {
            return undefined;
        }
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [menuOpen, searchOpen]);

    /* Escape closes panels; click outside closes the account menu. */
    useEffect(() => {
        const onKey = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                setSearchOpen(false);
                setAccountOpen(false);
            }
        };
        const onPointer = (event) => {
            if (
                accountRef.current &&
                !accountRef.current.contains(event.target)
            ) {
                setAccountOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onPointer);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onPointer);
        };
    }, []);

    const runSearch = useCallback(
        (term) => {
            const query = term.trim();
            if (!query) {
                return;
            }
            setSearchOpen(false);
            setSearchTerm("");
            navigate(`/products?search=${encodeURIComponent(query)}`);
        },
        [navigate]
    );

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        runSearch(searchTerm);
    };

    const solid = !isHome || scrolled || menuOpen;

    const headerClass = [
        "haven-header",
        isHome ? "is-overlay" : "",
        solid ? "is-solid" : "is-clear",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <>
            <header className={headerClass}>
                <nav className="haven-nav" aria-label="Primary">
                    {/* Left — desktop links / mobile menu toggle */}
                    <div className="haven-nav-left">
                        <button
                            type="button"
                            className="haven-icon-btn haven-menu-toggle"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>

                        <ul className="haven-links">
                            {NAV_LINKS.map((link) => (
                                <li key={link.to}>
                                    <NavLink to={link.to}>{link.label}</NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Centre — wordmark, centred in the viewport */}
                    <Link to="/" className="haven-logo" aria-label="HAVEN home">
                        HAVEN
                    </Link>

                    {/* Right — icons */}
                    <div className="haven-nav-right">
                        <button
                            type="button"
                            className="haven-icon-btn"
                            onClick={() => setSearchOpen(true)}
                            aria-label="Search"
                            aria-haspopup="dialog"
                        >
                            <SearchIcon />
                        </button>

                        <Link
                            to="/wishlist"
                            className="haven-icon-btn haven-hide-mobile"
                            aria-label={`Wishlist, ${wishlistCount || 0} items`}
                        >
                            <HeartIcon />
                            {wishlistCount > 0 && (
                                <span className="haven-count">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <div
                            className="haven-account haven-hide-mobile"
                            ref={accountRef}
                        >
                            {loggedIn ? (
                                <>
                                    <button
                                        type="button"
                                        className="haven-icon-btn"
                                        onClick={() =>
                                            setAccountOpen((open) => !open)
                                        }
                                        aria-label="Account menu"
                                        aria-expanded={accountOpen}
                                        aria-haspopup="menu"
                                    >
                                        <UserIcon />
                                    </button>
                                    {accountOpen && (
                                        <div
                                            className="haven-dropdown"
                                            role="menu"
                                        >
                                            <Link to="/profile" role="menuitem">
                                                My account
                                            </Link>
                                            {user?.role === "admin" && (
                                                <Link
                                                    to="/admin"
                                                    role="menuitem"
                                                >
                                                    Admin
                                                </Link>
                                            )}
                                            <LogoutButton />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="haven-icon-btn"
                                    aria-label="Log in"
                                >
                                    <UserIcon />
                                </Link>
                            )}
                        </div>

                        <Link
                            to="/cart"
                            className="haven-icon-btn"
                            aria-label={`Shopping bag, ${cartCount} items`}
                        >
                            <BagIcon />
                            {cartCount > 0 && (
                                <span className="haven-count">{cartCount}</span>
                            )}
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Mobile drawer */}
            <div
                className={`haven-drawer ${menuOpen ? "is-open" : ""}`}
                aria-hidden={!menuOpen}
            >
                <button
                    type="button"
                    className="haven-drawer-scrim"
                    tabIndex={menuOpen ? 0 : -1}
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                />
                <div className="haven-drawer-panel">
                    <ul>
                        {NAV_LINKS.map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    tabIndex={menuOpen ? 0 : -1}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="haven-drawer-secondary">
                        <Link
                            to="/wishlist"
                            tabIndex={menuOpen ? 0 : -1}
                            onClick={() => setMenuOpen(false)}
                        >
                            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
                        </Link>
                        <Link
                            to={loggedIn ? "/profile" : "/login"}
                            tabIndex={menuOpen ? 0 : -1}
                            onClick={() => setMenuOpen(false)}
                        >
                            {loggedIn ? "My account" : "Log in"}
                        </Link>
                        {loggedIn && user?.role === "admin" && (
                            <Link
                                to="/admin"
                                tabIndex={menuOpen ? 0 : -1}
                                onClick={() => setMenuOpen(false)}
                            >
                                Admin
                            </Link>
                        )}
                        {loggedIn && <LogoutButton />}
                    </div>
                </div>
            </div>

            {/* Search overlay */}
            {searchOpen && (
                <div
                    className="haven-search-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Search HAVEN"
                >
                    <div className="haven-search-inner">
                        <button
                            type="button"
                            className="haven-icon-btn haven-search-close"
                            onClick={() => setSearchOpen(false)}
                            aria-label="Close search"
                        >
                            <CloseIcon />
                        </button>

                        <form
                            className="haven-search-form"
                            onSubmit={handleSearchSubmit}
                            role="search"
                        >
                            <SearchIcon />
                            <input
                                type="search"
                                placeholder="Search HAVEN"
                                aria-label="Search products"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                autoFocus
                            />
                        </form>

                        <div className="haven-search-suggest">
                            <p>Popular</p>
                            <ul>
                                {POPULAR_SEARCHES.map((term) => (
                                    <li key={term}>
                                        <button
                                            type="button"
                                            onClick={() => runSearch(term)}
                                        >
                                            {term}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="haven-search-scrim"
                        tabIndex={-1}
                        aria-label="Close search"
                        onClick={() => setSearchOpen(false)}
                    />
                </div>
            )}
        </>
    );
}

export default Header;
