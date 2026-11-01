
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminProducts, getAdminOrders } from "../services/api";
import "../styles/adminDashboard.css";

function AdminDashboard() {
    const { token, user, loading: authLoading } = useAuth();

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !token || user?.role !== "admin") return;

        let active = true;

        const loadDashboard = async () => {
            setLoading(true);
            setError("");

            try {
                const [productData, orderData] = await Promise.all([
                    getAdminProducts(token),
                    getAdminOrders(token)
                ]);

                if (active) {
                    setProducts(productData);
                    setOrders(orderData);
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Unable to load dashboard data.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDashboard();

        return () => {
            active = false;
        };
    }, [authLoading, token, user]);

    if (authLoading || loading && user?.role === "admin") {
        return (
            <main className="admin-dashboard-page">
                <p>Loading HAVEN dashboard...</p>
            </main>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <main className="admin-dashboard-page">
                <h1>Administrator access required</h1>
                <Link to="/admin/login">Go to Admin Login</Link>
            </main>
        );
    }

    const publishedProducts = products.filter(
        (product) => product.isPublished
    ).length;

    const pendingOrders = orders.filter((order) =>
        ["Placed", "Confirmed", "Processing"].includes(order.orderStatus)
    ).length;

    const deliveredOrders = orders.filter(
        (order) => order.orderStatus === "Delivered"
    ).length;

    // This is order value, not a calculation of actual received payments.
    const orderValue = orders
        .filter((order) =>
            !["Cancelled", "Returned", "Refunded"].includes(order.orderStatus)
        )
        .reduce(
            (total, order) => total + Number(order.totalAmount || 0),
            0
        );

    const recentOrders = [...orders]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    if (error) {
        return (
            <main className="admin-dashboard-page">
                <div className="admin-dashboard-header">
                    <div>
                        <p className="dashboard-eyebrow">HAVEN ADMINISTRATION</p>
                        <h1>Dashboard</h1>
                    </div>
                </div>

                <p className="dashboard-error" role="alert">{error}</p>

                <button
                    type="button"
                    className="dashboard-refresh-btn"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </main>
        );
    }

    return (
        <main className="admin-dashboard-page">
            <header className="admin-dashboard-header">
                <div>
                    <p className="dashboard-eyebrow">HAVEN ADMINISTRATION</p>
                    <h1>Dashboard</h1>
                    <p>Welcome back. Here's what's happening in your store.</p>
                </div>

                <button
                    type="button"
                    className="dashboard-refresh-btn"
                    onClick={() => window.location.reload()}
                >
                    Refresh Dashboard
                </button>
            </header>

            <section className="dashboard-stats">
                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Total Products</span>
                    <strong>{products.length}</strong>
                    <small>Products in your catalogue</small>
                </article>

                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Published Products</span>
                    <strong>{publishedProducts}</strong>
                    <small>Visible in your store</small>
                </article>

                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Total Orders</span>
                    <strong>{orders.length}</strong>
                    <small>All customer orders</small>
                </article>

                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Pending Orders</span>
                    <strong>{pendingOrders}</strong>
                    <small>Placed, confirmed or processing</small>
                </article>

                <article className="dashboard-stat-card dashboard-stat-highlight">
                    <span className="dashboard-stat-label">Order Value</span>
                    <strong>{formatCurrency(orderValue)}</strong>
                    <small>Excludes cancelled, returned and refunded orders</small>
                </article>

                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Delivered Orders</span>
                    <strong>{deliveredOrders}</strong>
                    <small>Successfully delivered</small>
                </article>
            </section>

            <section className="dashboard-quick-section">
                <div className="dashboard-section-heading">
                    <div>
                        <p className="dashboard-eyebrow">SHORTCUTS</p>
                        <h2>Manage Your Store</h2>
                    </div>
                </div>

                <div className="dashboard-quick-grid">
                    <Link to="/admin/products" className="dashboard-quick-card">
                        <span className="dashboard-quick-number">01</span>
                        <h3>Manage Products</h3>
                        <p>View, edit, publish or delete products.</p>
                        <span className="dashboard-quick-link">Manage products →</span>
                    </Link>

                    <Link to="/admin/products/new" className="dashboard-quick-card">
                        <span className="dashboard-quick-number">02</span>
                        <h3>Add New Product</h3>
                        <p>Add products and upload collection images.</p>
                        <span className="dashboard-quick-link">Add product →</span>
                    </Link>

                    <Link to="/admin/orders" className="dashboard-quick-card">
                        <span className="dashboard-quick-number">03</span>
                        <h3>Manage Orders</h3>
                        <p>Review customer orders and update their status.</p>
                        <span className="dashboard-quick-link">View orders →</span>
                    </Link>
                </div>
            </section>

            <section className="dashboard-recent-section">
                <div className="dashboard-section-heading">
                    <div>
                        <p className="dashboard-eyebrow">LATEST ACTIVITY</p>
                        <h2>Recent Orders</h2>
                    </div>

                    <Link to="/admin/orders" className="dashboard-view-all">
                        View All Orders →
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="dashboard-no-orders">
                        <h3>No orders yet</h3>
                        <p>Customer orders will appear here when they are placed.</p>
                    </div>
                ) : (
                    <div className="dashboard-orders-wrapper">
                        <table className="dashboard-orders-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>
                                            #{order._id.slice(-7).toUpperCase()}
                                        </td>

                                        <td>
                                            {order.customer?.fullName ||
                                                order.customerId?.fullName ||
                                                "Customer"}
                                        </td>

                                        <td>{formatDate(order.createdAt)}</td>

                                        <td>{formatCurrency(order.totalAmount)}</td>

                                        <td>{order.paymentMethod || "—"}</td>

                                        <td>
                                            <span className={`dashboard-order-status status-${(order.orderStatus || "unknown").toLowerCase().replace(/\s+/g, "-")}`}>
                                                {order.orderStatus || "Unknown"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default AdminDashboard;
