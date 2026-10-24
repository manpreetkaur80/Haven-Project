
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/api";
import "../styles/checkout.css";

function Checkout() {
    const {
        cartItems,
        cartCount,
        subtotal,
        clearCart
    } = useCart();

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        paymentMethod: "COD"
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: ""
        }));
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) return;

        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Please enter your full name.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
            newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Please enter your delivery address.";
        }

        if (!formData.city.trim()) {
            newErrors.city = "Please enter your city.";
        }

        if (!formData.state.trim()) {
            newErrors.state = "Please enter your state.";
        }

        if (!/^\d{6}$/.test(formData.pincode.trim())) {
            newErrors.pincode = "Enter a valid 6-digit PIN code.";
        }

        if (cartItems.length === 0) {
            setSubmitError("Your bag is empty. Add a product before checkout.");
            return;
        }

        setErrors(newErrors);
        setSubmitError("");

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                customer: {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim()
                },

                shippingAddress: {
                    address: formData.address.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim()
                },

                paymentMethod: formData.paymentMethod,

                // Send identifiers and selections, never trust client prices.
                items: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size || "",
                    color: item.color || ""
                }))
            };

            const result = await createOrder(orderData);

            // Clear the bag only after the backend confirms order creation.
            clearCart();

            navigate(`/order-confirmation/${result.order._id}`, {
                state: { order: result.order }
            });
        } catch (error) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <main className="checkout-page">
                <div className="checkout-empty">
                    <h1>Your bag is empty</h1>
                    <p>Add something you love before checking out.</p>
                    <Link to="/products" className="checkout-button">
                        EXPLORE COLLECTION
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="checkout-container">
                <header className="checkout-header">
                    <Link to="/" className="checkout-logo">HAVEN</Link>
                    <p>SECURE CHECKOUT</p>
                </header>

                <div className="checkout-title">
                    <p className="checkout-eyebrow">ALMOST YOURS</p>
                    <h1>Checkout</h1>
                    <p>Where should we deliver your pieces?</p>
                </div>

                <div className="checkout-layout">
                    <form
                        className="checkout-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <section className="checkout-section">
                            <h2>01. Contact information</h2>

                            <div className="checkout-field">
                                <label htmlFor="fullName">Full name</label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    autoComplete="name"
                                />
                                {errors.fullName && (
                                    <p className="checkout-error">{errors.fullName}</p>
                                )}
                            </div>

                            <div className="checkout-field">
                                <label htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <p className="checkout-error">{errors.email}</p>
                                )}
                            </div>

                            <div className="checkout-field">
                                <label htmlFor="phone">Mobile number</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength={10}
                                    autoComplete="tel"
                                />
                                {errors.phone && (
                                    <p className="checkout-error">{errors.phone}</p>
                                )}
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h2>02. Delivery address</h2>

                            <div className="checkout-field">
                                <label htmlFor="address">Street address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
                                    autoComplete="street-address"
                                />
                                {errors.address && (
                                    <p className="checkout-error">{errors.address}</p>
                                )}
                            </div>

                            <div className="checkout-two-columns">
                                <div className="checkout-field">
                                    <label htmlFor="city">City</label>
                                    <input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        autoComplete="address-level2"
                                    />
                                    {errors.city && (
                                        <p className="checkout-error">{errors.city}</p>
                                    )}
                                </div>

                                <div className="checkout-field">
                                    <label htmlFor="state">State</label>
                                    <input
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        autoComplete="address-level1"
                                    />
                                    {errors.state && (
                                        <p className="checkout-error">{errors.state}</p>
                                    )}
                                </div>
                            </div>

                            <div className="checkout-field">
                                <label htmlFor="pincode">PIN code</label>
                                <input
                                    id="pincode"
                                    name="pincode"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    autoComplete="postal-code"
                                />
                                {errors.pincode && (
                                    <p className="checkout-error">{errors.pincode}</p>
                                )}
                            </div>
                        </section>

                        <section className="checkout-section">
                            <h2>03. Payment method</h2>

                            <label className="checkout-payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={formData.paymentMethod === "COD"}
                                    onChange={handleChange}
                                />
                                <span>
                                    <strong>Cash on Delivery</strong>
                                    <small>Pay when your order arrives.</small>
                                </span>
                            </label>
                        </section>

                        {submitError && (
                            <p className="checkout-error" role="alert">
                                {submitError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="checkout-button checkout-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "PLACING YOUR ORDER..."
                                : "PLACE ORDER"}
                        </button>

                        <Link to="/cart" className="checkout-back">
                            ← Return to shopping bag
                        </Link>
                    </form>

                    <aside className="checkout-summary">
                        <h2>Your order</h2>

                        {cartItems.map((item) => (
                            <div className="checkout-product" key={item.cartKey}>
                                {item.image ? (
                                    <img src={item.image} alt={item.name} />
                                ) : (
                                    <div className="checkout-product-placeholder">
                                        HAVEN
                                    </div>
                                )}

                                <div className="checkout-product-info">
                                    <h3>{item.name}</h3>
                                    {item.size && <p>Size: {item.size}</p>}
                                    {item.color && <p>Colour: {item.color}</p>}
                                    <p>Qty: {item.quantity}</p>
                                </div>

                                <strong>
                                    {formatPrice(item.price * item.quantity)}
                                </strong>
                            </div>
                        ))}

                        <div className="checkout-summary-row">
                            <span>Subtotal ({cartCount} items)</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <div className="checkout-summary-row">
                            <span>Shipping</span>
                            <span>Calculated later</span>
                        </div>

                        <div className="checkout-total">
                            <span>Estimated total</span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>

                        <p className="checkout-note">
                            The final order total is calculated by the server.
                            Shipping charges may apply according to the store's
                            delivery policy.
                        </p>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default Checkout;
