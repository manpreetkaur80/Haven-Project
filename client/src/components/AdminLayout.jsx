import { Link, NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import "../styles/admin.css";

const ADMIN_LINKS = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/products", label: "Products", end: true },
    { to: "/admin/products/new", label: "Add product", end: true },
    { to: "/admin/orders", label: "Orders", end: true },
];

function AdminLayout({ children }) {
    return (
        <div className="admin-shell">
            <header className="admin-topbar">
                <Link to="/admin" className="admin-brand" aria-label="HAVEN admin">
                    <span>HAVEN</span>
                    <small>Admin</small>
                </Link>

                <nav className="admin-nav" aria-label="Admin">
                    
                    {ADMIN_LINKS.map((link) => (
                    
                    <NavLink key={link.to} to={link.to} end={link.end}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-topbar-actions">
                    <Link to="/">View store</Link>
                    <LogoutButton />
                </div>
            </header>

            <div className="admin-content">{children}</div>
        </div>
    );
}

export default AdminLayout;
