
import { Link, useLocation, useParams } from "react-router-dom";
import "../styles/order-confirmation.css";

function OrderConfirmation() {
    const { state } = useLocation();
    const { id } = useParams();

    const order = state?.order;

    if (!order) {
        return (
            <main className="confirmation-page">
                <div className="confirmation-card">
                    <p className="confirmation-eyebrow">HAVEN ORDERS</p>
                    <h1>Order details unavailable</h1>
                    <p>
                        Your order reference is:
                    </p>
                    <p className="confirmation-order-id">{id}</p>
                    <p>
                        This page was opened without the order details from
                        checkout. Keep your order reference for future support.
                    </p>
                    <Link to="/products" className="confirmation-button">
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="confirmation-page">
            <section className="confirmation-card">
                <div className="confirmation-check">✓</div>

                <p className="confirmation-eyebrow">THANK YOU FOR CHOOSING HAVEN</p>

                <h1>Your order is placed.</h1>

                <p className="confirmation-description">
                    Thank you for shopping with us. We’ll take it from here.
                </p>

                <div className="confirmation-order-box">
                    <div>
                        <span>Order reference</span>
                        <strong>{order._id || id}</strong>
                    </div>

                    <div>
                        <span>Order status</span>
                        <strong>{order.orderStatus}</strong>
                    </div>

                    <div>
                        <span>Payment method</span>
                        <strong>
                            {order.paymentMethod === "COD"
                                ? "Cash on Delivery"
                                : order.paymentMethod}
                        </strong>
                    </div>
                </div>

                <div className="confirmation-items">
                    <h2>Order summary</h2>

                    {order.items?.map((item, index) => (
                        <div
                            className="confirmation-item"
                            key={`${item.product || item._id || item.name}-${index}`}
                        >
                            {item.image ? (
                                <img src={item.image} alt={item.name} />
                            ) : (
                                <div className="confirmation-image-placeholder">
                                    HAVEN
                                </div>
                            )}

                            <div className="confirmation-item-info">
                                <strong>{item.name}</strong>
                                <span>
                                    {item.size && `Size: ${item.size}`}
                                    {item.size && item.color && " · "}
                                    {item.color && `Color: ${item.color}`}
                                </span>
                                <span>Quantity: {item.quantity}</span>
                            </div>

                            <strong>
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </strong>
                        </div>
                    ))}
                </div>

                <div className="confirmation-total">
                    <span>Total amount</span>
                    <strong>
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </strong>
                </div>

                <p className="confirmation-payment-note">
                    {order.paymentMethod === "COD"
                        ? "Payment is due when your order is delivered."
                        : "Your payment status will be updated as your order progresses."}
                </p>

                <Link to="/products" className="confirmation-button">
                    Continue Shopping
                </Link>

                <Link to="/" className="confirmation-home-link">
                    Back to Home
                </Link>
            </section>
        </main>
    );
}

export default OrderConfirmation;
