import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/api";
import "../styles/orders.css";

const STEPS = [
    ["Placed", "Order placed"],
    ["Confirmed", "Confirmed"],
    ["Processing", "Being prepared"],
    ["Shipped", "On its way"],
    ["Delivered", "Delivered"],
];

const SPECIAL = {
    Cancelled: "This order was cancelled.",
    "Return Requested": "A return has been requested and is being reviewed.",
    Returned: "This order has been returned.",
    Refunded: "This order has been returned and refunded.",
};

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const shortId = (id) => String(id).slice(-8).toUpperCase();
const longDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

function Timeline({ status }) {
    const current = STEPS.findIndex(([key]) => key === status);

    if (current === -1) {
        const returned = ["Return Requested", "Returned", "Refunded"].includes(status);
        return (
            <div className={`ord-special ${returned ? "" : "ord-special-bad"}`}>
                <strong>{status}</strong>
                <p>{SPECIAL[status] || "Status updated."}</p>
            </div>
        );
    }

    return (
        <ol className="ord-timeline">
            {STEPS.map(([key, label], index) => (
                <li
                    key={key}
                    className={
                        index < current ? "done" : index === current ? "current" : ""
                    }
                >
                    <span className="ord-dot" />
                    <span className="ord-step-label">{label}</span>
                </li>
            ))}
        </ol>
    );
}

function Orders() {
    const { token } = useAuth();
    const { id } = useParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        getMyOrders(token)
            .then((result) => {
                if (!cancelled) setOrders(Array.isArray(result.orders) ? result.orders : []);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || "Unable to load your orders.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [token]);

    const order = id ? orders.find((o) => o._id === id) : null;

    let body;
    if (loading) {
        body = <p className="ord-empty">Loading your orders…</p>;
    } else if (error) {
        body = <p className="ord-empty ord-error">{error}</p>;
    } else if (id) {
        body = order ? (
            <article className="ord-detail">
                <Link to="/orders" className="ord-back">
                    ← All orders
                </Link>

                <div className="ord-detail-head">
                    <div>
                        <p className="ord-label">Order</p>
                        <h2>#{shortId(order._id)}</h2>
                        <p className="ord-date">Placed on {longDate(order.createdAt)}</p>
                    </div>
                    <span className="ord-status">{order.orderStatus || "Placed"}</span>
                </div>

                <Timeline status={order.orderStatus || "Placed"} />

                <div className="ord-grid">
                    <section>
                        <h3>Items</h3>
                        {(order.items || []).map((item, index) => (
                            <div className="ord-item" key={index}>
                                {item.image ? (
                                    <img src={item.image} alt={item.name || "Product"} />
                                ) : (
                                    <div className="ord-item-ph">H</div>
                                )}
                                <div>
                                    <strong>{item.name}</strong>
                                    <p>
                                        Qty {item.quantity}
                                        {item.size ? ` · Size ${item.size}` : ""}
                                        {item.color ? ` · ${item.color}` : ""}
                                    </p>
                                </div>
                                <span>{money(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </section>

                    <section>
                        <h3>Delivery</h3>
                        <p className="ord-addr">
                            {order.customer?.fullName}
                            <br />
                            {order.shippingAddress?.address}
                            <br />
                            {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode]
                                .filter(Boolean)
                                .join(", ")}
                        </p>

                        <h3>Payment</h3>
                        <div className="ord-row">
                            <span>Subtotal</span>
                            <span>{money(order.subtotal)}</span>
                        </div>
                        {Number(order.discountAmount) > 0 && (
                            <div className="ord-row">
                                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                                <span>− {money(order.discountAmount)}</span>
                            </div>
                        )}
                        <div className="ord-row">
                            <span>Shipping</span>
                            <span>{Number(order.shippingFee) > 0 ? money(order.shippingFee) : "Free"}</span>
                        </div>
                        <div className="ord-row ord-total">
                            <span>Total · {order.paymentMethod || "COD"}</span>
                            <strong>{money(order.totalAmount)}</strong>
                        </div>
                    </section>
                </div>

                <p className="ord-help">
                    Need to cancel or return something? Manage it from{" "}
                    <Link to="/profile">your account</Link>.
                </p>
            </article>
        ) : (
            <div className="ord-empty">
                <p>We couldn’t find that order.</p>
                <Link to="/orders" className="ord-btn">
                    View all orders
                </Link>
            </div>
        );
    } else if (orders.length === 0) {
        body = (
            <div className="ord-empty">
                <p>No orders yet. Orders placed while signed in will appear here.</p>
                <Link to="/products" className="ord-btn">
                    Start shopping
                </Link>
            </div>
        );
    } else {
        body = (
            <div className="ord-list">
                {orders.map((o) => (
                    <Link to={`/orders/${o._id}`} className="ord-card" key={o._id}>
                        <div className="ord-card-top">
                            <div>
                                <p className="ord-label">Order</p>
                                <strong>#{shortId(o._id)}</strong>
                            </div>
                            <span className="ord-status">{o.orderStatus || "Placed"}</span>
                        </div>
                        <p className="ord-date">{longDate(o.createdAt)}</p>
                        <div className="ord-thumbs">
                            {(o.items || []).slice(0, 4).map((item, i) =>
                                item.image ? (
                                    <img key={i} src={item.image} alt="" />
                                ) : (
                                    <div key={i} className="ord-item-ph">H</div>
                                )
                            )}
                        </div>
                        <div className="ord-card-foot">
                            <span>
                                {(o.items || []).reduce((n, i) => n + (i.quantity || 0), 0)} items
                            </span>
                            <strong>{money(o.totalAmount)}</strong>
                        </div>
                        <span className="ord-track">Track order →</span>
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <>
            <PageBanner
                eyebrow="Your purchases"
                title={id ? "Track order" : "My orders"}
                meta={id ? "" : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
            />
            <main className="orders-page">{body}</main>
        </>
    );
}

export default Orders;
