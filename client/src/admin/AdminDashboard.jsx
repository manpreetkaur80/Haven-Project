import "../styles/admin.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminProducts, getAdminOrders } from "../services/api";
import "../styles/admin-dashboard.css";

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
  setProducts(Array.isArray(productData) ? productData : productData.products || []);
  setOrders(Array.isArray(orderData) ? orderData : orderData.orders || []);
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

    /* ---- Last 7 days of sales (excludes cancelled / returned / refunded) ---- */
    const countedOrders = orders.filter(
        (order) => !["Cancelled", "Returned", "Refunded"].includes(order.orderStatus)
    );
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        return { date, key: date.toDateString(), total: 0, count: 0 };
    });
    countedOrders.forEach((order) => {
        const day = days.find(
            (item) => item.key === new Date(order.createdAt).toDateString()
        );
        if (day) {
            day.total += Number(order.totalAmount || 0);
            day.count += 1;
        }
    });
    const weekTotal = days.reduce((sum, day) => sum + day.total, 0);
    const weekCount = days.reduce((sum, day) => sum + day.count, 0);
    const maxDay = Math.max(...days.map((day) => day.total), 1);

    /* ---- Order status breakdown ---- */
    const statusCounts = orders.reduce((map, order) => {
        const key = order.orderStatus || "Unknown";
        map[key] = (map[key] || 0) + 1;
        return map;
    }, {});
    const statusList = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);

    /* ---- Needs attention ---- */
    const returnRequests = orders.filter(
        (order) => order.orderStatus === "Return Requested"
    ).length;
    const lowStock = products
        .filter((product) => Number(product.stock ?? 0) <= 5)
        .sort((a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0));
    const unpublished = products.length - publishedProducts;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const firstName = String(user?.fullName || user?.name || "").split(" ")[0];
    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

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

    const chart = { width: 560, height: 220, left: 8, top: 16, bottom: 34 };
    const plotH = chart.height - chart.top - chart.bottom;
    const slot = (chart.width - chart.left * 2) / days.length;

    return (
        <main className="admin-dashboard-page ad-page">
            <section className="ad-hero">
                <div className="ad-hero-copy">
                    <p className="ad-eyebrow">{today}</p>
                    <h1>
                        {greeting}
                        {firstName ? `, ${firstName}` : ""}.
                    </h1>
                    <p>Here is what is happening in your store today.</p>
                    <div className="ad-hero-actions">
                        <Link to="/admin/products/new" className="ad-btn">
                            Add a product
                        </Link>
                        <Link to="/admin/orders" className="ad-btn ad-btn-ghost">
                            View orders
                        </Link>
                    </div>
                </div>

                <div className="ad-hero-figure">
                    <span>Order value</span>
                    <strong>{formatCurrency(orderValue)}</strong>
                    <small>Excludes cancelled, returned and refunded orders</small>
                </div>
            </section>

            <section className="ad-kpis" aria-label="Store summary">
                <article className="ad-kpi">
                    <span className="ad-kpi-label">Total orders</span>
                    <strong>{orders.length}</strong>
                    <small>{deliveredOrders} delivered</small>
                </article>
                <article className="ad-kpi">
                    <span className="ad-kpi-label">Pending orders</span>
                    <strong>{pendingOrders}</strong>
                    <small>Placed, confirmed or processing</small>
                </article>
                <article className="ad-kpi">
                    <span className="ad-kpi-label">Live products</span>
                    <strong>
                        {publishedProducts}
                        <em>/ {products.length}</em>
                    </strong>
                    <small>{unpublished} hidden from the store</small>
                </article>
                <article className="ad-kpi">
                    <span className="ad-kpi-label">Last 7 days</span>
                    <strong>{formatCurrency(weekTotal)}</strong>
                    <small>{weekCount} {weekCount === 1 ? "order" : "orders"}</small>
                </article>
            </section>

            <section className="ad-grid">
                <article className="ad-card ad-card-wide">
                    <header className="ad-card-head">
                        <div>
                            <p className="ad-eyebrow">Sales</p>
                            <h2>Last 7 days</h2>
                        </div>
                        <strong className="ad-card-figure">{formatCurrency(weekTotal)}</strong>
                    </header>

                    <svg
                        className="ad-chart"
                        viewBox={`0 0 ${chart.width} ${chart.height}`}
                        role="img"
                        aria-label={`Sales for the last 7 days: ${formatCurrency(weekTotal)} from ${weekCount} orders`}
                    >
                        {[0, 0.5, 1].map((fraction) => {
                            const y = chart.top + plotH * (1 - fraction);
                            return (
                                <line
                                    key={fraction}
                                    x1={chart.left}
                                    x2={chart.width - chart.left}
                                    y1={y}
                                    y2={y}
                                    className="ad-chart-grid"
                                />
                            );
                        })}
                        {days.map((day, index) => {
                            const barH = Math.max((day.total / maxDay) * plotH, day.total ? 3 : 0);
                            const x = chart.left + index * slot + slot * 0.22;
                            const w = slot * 0.56;
                            return (
                                <g key={day.key}>
                                    <rect
                                        x={x}
                                        y={chart.top + plotH - barH}
                                        width={w}
                                        height={barH}
                                        className={day.total ? "ad-bar" : "ad-bar is-empty"}
                                    >
                                        <title>
                                            {`${day.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: ${formatCurrency(day.total)} (${day.count} ${day.count === 1 ? "order" : "orders"})`}
                                        </title>
                                    </rect>
                                    <text
                                        x={x + w / 2}
                                        y={chart.height - 12}
                                        textAnchor="middle"
                                        className="ad-chart-label"
                                    >
                                        {day.date.toLocaleDateString("en-IN", { weekday: "short" })}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </article>

                <article className="ad-card">
                    <header className="ad-card-head">
                        <div>
                            <p className="ad-eyebrow">Orders</p>
                            <h2>By status</h2>
                        </div>
                    </header>

                    {statusList.length === 0 ? (
                        <p className="ad-muted">No orders yet.</p>
                    ) : (
                        <ul className="ad-status-list">
                            {statusList.map(([status, count]) => (
                                <li key={status}>
                                    <div>
                                        <span>{status}</span>
                                        <strong>{count}</strong>
                                    </div>
                                    <span className="ad-status-track">
                                        <span style={{ width: `${(count / orders.length) * 100}%` }} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>

                <article className="ad-card">
                    <header className="ad-card-head">
                        <div>
                            <p className="ad-eyebrow">To do</p>
                            <h2>Needs attention</h2>
                        </div>
                    </header>

                    <ul className="ad-todo">
                        <li>
                            <Link to="/admin/orders">
                                <strong>{pendingOrders}</strong>
                                <span>orders waiting to be processed</span>
                                <em aria-hidden="true">→</em>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/orders">
                                <strong>{returnRequests}</strong>
                                <span>return requests to review</span>
                                <em aria-hidden="true">→</em>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/products">
                                <strong>{lowStock.length}</strong>
                                <span>products low on stock (5 or fewer)</span>
                                <em aria-hidden="true">→</em>
                            </Link>
                        </li>
                    </ul>
                </article>

                <article className="ad-card ad-card-wide">
                    <header className="ad-card-head">
                        <div>
                            <p className="ad-eyebrow">Inventory</p>
                            <h2>Low stock</h2>
                        </div>
                        <Link to="/admin/products" className="ad-link">
                            All products →
                        </Link>
                    </header>

                    {lowStock.length === 0 ? (
                        <p className="ad-muted">Every product has healthy stock.</p>
                    ) : (
                        <ul className="ad-lowstock">
                            {lowStock.slice(0, 6).map((product) => (
                                <li key={product._id}>
                                    <span className="ad-lowstock-thumb">
                                        {product.images?.[0]?.url ? (
                                            <img src={product.images[0].url} alt="" />
                                        ) : (
                                            product.name?.charAt(0)
                                        )}
                                    </span>
                                    <span className="ad-lowstock-name">
                                        <strong>{product.name}</strong>
                                        <small>
                                            {product.category}
                                            {product.subcategory ? ` · ${product.subcategory}` : ""}
                                        </small>
                                    </span>
                                    <span
                                        className={`ad-stock ${Number(product.stock ?? 0) === 0 ? "is-out" : ""}`}
                                    >
                                        {Number(product.stock ?? 0) === 0
                                            ? "Out of stock"
                                            : `${product.stock} left`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>
            </section>

            <section className="ad-card ad-recent">
                <header className="ad-card-head">
                    <div>
                        <p className="ad-eyebrow">Latest activity</p>
                        <h2>Recent orders</h2>
                    </div>
                    <Link to="/admin/orders" className="ad-link">
                        View all orders →
                    </Link>
                </header>

                {recentOrders.length === 0 ? (
                    <p className="ad-muted">
                        Customer orders will appear here when they are placed.
                    </p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
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
                                        <td className="mt-title">#{order._id.slice(-7).toUpperCase()}</td>
                                        <td data-label="Customer">
                                            {order.customer?.fullName ||
                                                order.customerId?.fullName ||
                                                "Customer"}
                                        </td>
                                        <td data-label="Date">{formatDate(order.createdAt)}</td>
                                        <td data-label="Amount">{formatCurrency(order.totalAmount)}</td>
                                        <td data-label="Payment">{order.paymentMethod || "—"}</td>
                                        <td data-label="Status">
                                            <span
                                                className={`admin-badge status-${(order.orderStatus || "unknown")
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "-")}`}
                                            >
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
