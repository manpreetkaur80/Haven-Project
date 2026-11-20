import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import "../styles/admin.css";

const icon = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
};

const ICONS = {
    dashboard: (
        <svg {...icon}>
            <rect x="3.5" y="3.5" width="7" height="8" />
            <rect x="13.5" y="3.5" width="7" height="5" />
            <rect x="13.5" y="11.5" width="7" height="9" />
            <rect x="3.5" y="14.5" width="7" height="6" />
        </svg>
    ),
    products: (
        <svg {...icon}>
            <path d="M4 7.5 12 3.5l8 4v9l-8 4-8-4v-9Z" />
            <path d="m4 7.5 8 4 8-4M12 11.5v9" />
        </svg>
    ),
    add: (
        <svg {...icon}>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 8v8M8 12h8" />
        </svg>
    ),
    orders: (
        <svg {...icon}>
            <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17Z" />
            <path d="M9 8.5h6M9 12h6" />
        </svg>
    ),
    store: (
        <svg {...icon}>
            <path d="M4 9.5 5.5 4h13L20 9.5M4 9.5v10h16v-10M4 9.5h16M9.5 19.5v-5h5v5" />
        </svg>
    ),
};

const ADMIN_LINKS = [
    { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
    { to: "/admin/products", label: "Products", icon: "products", end: true },
    { to: "/admin/products/new", label: "Add product", icon: "add", end: true },
    { to: "/admin/orders", label: "Orders", icon: "orders", end: true },
];

function AdminLayout({ children }) {
    const { user } = useAuth();
    const name = user?.fullName || user?.name || "Administrator";

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <Link to="/admin" className="admin-brand" aria-label="HAVEN admin">
                    <span>HAVEN</span>
                    <small>Administration</small>
                </Link>

                <nav className="admin-nav" aria-label="Admin">
                    {ADMIN_LINKS.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end}>
                            {ICONS[link.icon]}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-foot">
                    <div className="admin-user">
                        <span className="admin-avatar" aria-hidden="true">
                            {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="admin-user-text">
                            <strong>{name}</strong>
                            <small>Administrator</small>
                        </span>
                    </div>
                    <Link to="/" className="admin-foot-link">
                        {ICONS.store}
                        <span>View store</span>
                    </Link>
                    <LogoutButton />
                </div>
            </aside>

            <div className="admin-content">{children}</div>
        </div>
    );
}

export default AdminLayout;
