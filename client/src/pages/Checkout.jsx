
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import {
    createOrder,
    validateCoupon,
    getMyProfile,
    addMyAddress,
} from "../services/api";

import PageBanner from "../components/PageBanner";
import "../styles/checkout.css";

const emptyForm = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "COD",
};

function Checkout() {
    const { cartItems, cartCount, subtotal, clearCart } = useCart();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(emptyForm);
    const [couponInput, setCouponInput] = useState("");
    const [coupon, setCoupon] = useState(null); // { code, discountAmount }
    const [couponError, setCouponError] = useState("");
    const [couponBusy, setCouponBusy] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [saveAddress, setSaveAddress] = useState(false);
    const [addressLabel, setAddressLabel] = useState("Home");

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadCheckoutProfile() {
            if (!token) return;

            setLoadingProfile(true);

            try {
                const result = await getMyProfile(token);
                if (!active) return;

                const profile = result.user || {};
                const addresses = Array.isArray(profile.addresses)
                    ? profile.addresses
                    : [];

                setSavedAddresses(addresses);

                setFormData((previous) => ({
                    ...previous,
                    fullName: profile.name || user?.name || previous.fullName,
                    email: profile.email || user?.email || previous.email,
                    phone: profile.phone || previous.phone,
                }));

                const defaultAddress =
                    addresses.find((address) => address.isDefault) ||
                    addresses[0];

                if (defaultAddress) {
                    applyAddress(defaultAddress);
                }
            } catch (error) {
                if (active) {
                    setSubmitError(
                        `We couldn't load your saved details. You can still enter them manually. ${error.message}`
                    );
                }
            } finally {
                if (active) setLoadingProfile(false);
            }
        }

        loadCheckoutProfile();

        return () => {
            active = false;
        };
    }, [token]);

    function applyAddress(address) {
        setSelectedAddressId(address._id || "");

        setFormData((previous) => ({
            ...previous,
            fullName: address.recipientName || previous.fullName,
            phone: address.phone || previous.phone,
            address: address.addressLine || "",
            landmark: address.landmark || "",
            city: address.city || "",
            state: address.state || "",
            pincode: address.postalCode || "",
        }));

        setErrors({});
        setSubmitError("");
    }

    function handleAddressSelection(event) {
        const addressId = event.target.value;
        setSelectedAddressId(addressId);

        if (!addressId) {
            setFormData((previous) => ({
                ...previous,
                address: "",
                landmark: "",
                city: "",
                state: "",
                pincode: "",
            }));
            setSaveAddress(true);
            return;
        }

        const address = savedAddresses.find(
            (item) => item._id === addressId
        );

        if (address) {
            applyAddress(address);
            setSaveAddress(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        // Avoid overwriting a saved address when the user edits its details.
        if (
            ["address", "landmark", "city", "state", "pincode"].includes(name)
        ) {
            setSelectedAddressId("");
        }
    }

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price || 0);

    function validateForm() {
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) return;

        setSubmitError("");

        if (!token) {
            setSubmitError("Please log in to place your order.");
            return;
        }

        if (cartItems.length === 0) {
            setSubmitError("Your bag is empty. Add a product before checkout.");
            return;
        }

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Save a new address to the customer's account when requested.
            const isExistingSavedAddress = savedAddresses.some(
                (address) => address._id === selectedAddressId
            );

            if (saveAddress && !isExistingSavedAddress) {
                const addressResult = await addMyAddress(token, {
                    label: addressLabel,
                    recipientName: formData.fullName.trim(),
                    phone: formData.phone.trim(),
                    addressLine: formData.address.trim(),
                    landmark: formData.landmark.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    postalCode: formData.pincode.trim(),
                    country: "India",
                    isDefault: savedAddresses.length === 0,
                });

                if (Array.isArray(addressResult.addresses)) {
                    setSavedAddresses(addressResult.addresses);
                }
            }

            const orderData = {
                customer: {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                },
                shippingAddress: {
                    address: [
                        formData.address.trim(),
                        formData.landmark.trim(),
                    ]
                        .filter(Boolean)
                        .join(", "),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim(),
                },
                paymentMethod: formData.paymentMethod,
                couponCode: coupon ? coupon.code : "",
                items: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size || "",
                    color: item.color || "",
                })),
            };

            const result = await createOrder(orderData, token);

            if (!result?.order?._id) {
                throw new Error(
                    "The server did not return a valid order confirmation."
                );
            }

            clearCart();

            navigate(`/order-confirmation/${result.order._id}`, {
                state: { order: result.order },
            });
        } catch (error) {
            setSubmitError(
                error.message || "Unable to place your order. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    // If the bag changes after a code was applied, check it again.
    useEffect(() => {
        if (!coupon) return;
        let cancelled = false;
        validateCoupon(token, coupon.code, subtotal)
            .then((result) => {
                if (!cancelled) {
                    setCoupon({
                        code: result.code,
                        discountAmount: result.discountAmount,
                    });
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setCoupon(null);
                    setCouponError(error.message || "Code removed.");
                }
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subtotal]);

    async function applyCoupon() {
        const code = couponInput.trim();
        if (!code) return;
        setCouponBusy(true);
        setCouponError("");
        try {
            const result = await validateCoupon(token, code, subtotal);
            setCoupon({
                code: result.code,
                discountAmount: result.discountAmount,
            });
            setCouponInput("");
        } catch (error) {
            setCoupon(null);
            setCouponError(error.message || "This code is not valid.");
        } finally {
            setCouponBusy(false);
        }
    }

    function removeCoupon() {
        setCoupon(null);
        setCouponError("");
    }

    const discount = coupon ? coupon.discountAmount : 0;
    const orderTotal = Math.max(0, subtotal - discount);

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
        <>
        <PageBanner
            eyebrow="Almost yours"
            title="Checkout"
            text={loadingProfile ? "Loading your saved details…" : "Where should we deliver your pieces?"}
            meta="Secure checkout"
            image="/media/haven-story.jpg"
        />
        <main className="checkout-page">
            <div className="checkout-container">

                <div className="checkout-layout">
                    <form
                        className="checkout-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <section className="checkout-section">
                            <h2>01. Contact information</h2>

                            {[
                                {
                                    name: "fullName",
                                    label: "Full name",
                                    autoComplete: "name",
                                },
                                {
                                    name: "email",
                                    label: "Email address",
                                    type: "email",
                                    autoComplete: "email",
                                },
                                {
                                    name: "phone",
                                    label: "Mobile number",
                                    type: "tel",
                                    autoComplete: "tel",
                                },
                            ].map((field) => (
                                <div className="checkout-field" key={field.name}>
                                    <label htmlFor={field.name}>
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type || "text"}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        autoComplete={field.autoComplete}
                                        required
                                    />
                                    {errors[field.name] && (
                                        <p className="checkout-error">
                                            {errors[field.name]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </section>

                        <section className="checkout-section">
                            <h2>02. Delivery address</h2>

                            {savedAddresses.length > 0 && (
                                <div className="checkout-field">
                                    <label htmlFor="savedAddress">
                                        Choose a saved address
                                    </label>
                                    <select
                                        id="savedAddress"
                                        value={selectedAddressId}
                                        onChange={handleAddressSelection}
                                    >
                                        {savedAddresses.map((address) => (
                                            <option
                                                key={address._id}
                                                value={address._id}
                                            >
                                                {address.label || "Address"}
                                                {address.isDefault
                                                    ? " (Default)"
                                                    : ""}{" "}
                                                — {address.city},{" "}
                                                {address.state}
                                            </option>
                                        ))}
                                        <option value="">
                                            + Enter a new address
                                        </option>
                                    </select>
                                </div>
                            )}

                            <div className="checkout-field">
                                <label htmlFor="address">Street address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
                                    autoComplete="street-address"
                                    required
                                />
                                {errors.address && (
                                    <p className="checkout-error">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            <div className="checkout-field">
                                <label htmlFor="landmark">
                                    Landmark (optional)
                                </label>
                                <input
                                    id="landmark"
                                    name="landmark"
                                    value={formData.landmark}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="checkout-two-columns">
                                {[
                                    { name: "city", label: "City" },
                                    { name: "state", label: "State" },
                                ].map((field) => (
                                    <div
                                        className="checkout-field"
                                        key={field.name}
                                    >
                                        <label htmlFor={field.name}>
                                            {field.label}
                                        </label>
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors[field.name] && (
                                            <p className="checkout-error">
                                                {errors[field.name]}
                                            </p>
                                        )}
                                    </div>
                                ))}
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
                                    required
                                />
                                {errors.pincode && (
                                    <p className="checkout-error">
                                        {errors.pincode}
                                    </p>
                                )}
                            </div>

                            <label className="checkout-payment-option">
                                <input
                                    type="checkbox"
                                    checked={saveAddress}
                                    onChange={(event) =>
                                        setSaveAddress(event.target.checked)
                                    }
                                />
                                <span>Save this address to my account</span>
                            </label>

                            {saveAddress && (
                                <div className="checkout-field">
                                    <label htmlFor="addressLabel">
                                        Address label
                                    </label>
                                    <select
                                        id="addressLabel"
                                        value={addressLabel}
                                        onChange={(event) =>
                                            setAddressLabel(event.target.value)
                                        }
                                    >
                                        <option>Home</option>
                                        <option>Work</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            )}
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
                                {submitError}{" "}
                                {!token && <Link to="/login">Log in here</Link>}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="checkout-button checkout-submit"
                            disabled={isSubmitting || loadingProfile}
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
                            <div
                                className="checkout-product"
                                key={item.cartKey}
                            >
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

                        <div className="checkout-coupon">
                            {coupon ? (
                                <div className="checkout-coupon-applied">
                                    <span>
                                        <b>{coupon.code}</b> applied
                                    </span>
                                    <button type="button" onClick={removeCoupon}>
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="checkout-coupon-form">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                applyCoupon();
                                            }
                                        }}
                                        placeholder="Discount code"
                                        aria-label="Discount code"
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        onClick={applyCoupon}
                                        disabled={couponBusy || !couponInput.trim()}
                                    >
                                        {couponBusy ? "Checking" : "Apply"}
                                    </button>
                                </div>
                            )}
                            {couponError && (
                                <p className="checkout-coupon-error" role="alert">
                                    {couponError}
                                </p>
                            )}
                        </div>

                        {coupon && (
                            <div className="checkout-summary-row checkout-discount-row">
                                <span>Discount ({coupon.code})</span>
                                <span>− {formatPrice(discount)}</span>
                            </div>
                        )}

                        <div className="checkout-summary-row">
                            <span>Shipping</span>
                            <span>Calculated by server</span>
                        </div>

                        <div className="checkout-total">
                            <span>Estimated total</span>
                            <strong>{formatPrice(orderTotal)}</strong>
                        </div>

                        <p className="checkout-note">
                            The final order total and any shipping charges are
                            calculated by the server.
                        </p>
                    </aside>
                </div>
            </div>
        </main>
        </>
    );
}

export default Checkout;
