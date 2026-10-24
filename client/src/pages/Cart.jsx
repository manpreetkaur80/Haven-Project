
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/cart.css";

function Cart() {
    const {
        cartItems,
        cartCount,
        subtotal,
        updateQuantity,
        removeFromCart
    } = useCart();

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);

    // Display an empty-cart page
    if (cartItems.length === 0) {
        return (
            <main className="cart-page">
                <div className="cart-empty">
                    <p className="cart-eyebrow">YOUR HAVEN BAG</p>

                    <h1>Your bag is waiting.</h1>

                    <p>
                        Looks like you haven't found your next favourite
                        piece yet.
                    </p>

                    <Link to="/products" className="cart-shop-btn">
                        EXPLORE COLLECTION
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="cart-container">

                {/* Cart heading */}
                <div className="cart-heading">
                    <div>
                        <p className="cart-eyebrow">YOUR HAVEN BAG</p>
                        <h1>Shopping Bag</h1>
                    </div>

                    <p className="cart-item-count">
                        {cartCount} {cartCount === 1 ? "item" : "items"}
                    </p>
                </div>

                <div className="cart-layout">

                    {/* Shopping cart items */}
                    <section className="cart-items">
                        {cartItems.map((item) => (
                            <article
                                className="cart-item"
                                key={item.cartKey}
                            >
                                <Link to={`/products/${item.productId}`}>
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="cart-item-image"
                                        />
                                    ) : (
                                        <div className="cart-image-placeholder">
                                            HAVEN
                                        </div>
                                    )}
                                </Link>

                                <div className="cart-item-info">
                                    <div className="cart-item-top">
                                        <div>
                                            <h2>{item.name}</h2>

                                            {item.size && (
                                                <p>Size: {item.size}</p>
                                            )}

                                            {item.color && (
                                                <p>Colour: {item.color}</p>
                                            )}
                                        </div>

                                        <p className="cart-item-price">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>

                                    <div className="cart-item-bottom">
                                        {/* Quantity controls */}
                                        <div className="cart-quantity">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.cartKey,
                                                        item.quantity - 1
                                                    )
                                                }
                                                disabled={item.quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.cartKey,
                                                        item.quantity + 1
                                                    )
                                                }
                                                disabled={
                                                    item.quantity >= item.stock
                                                }
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Remove item */}
                                        <button
                                            type="button"
                                            className="cart-remove"
                                            onClick={() =>
                                                removeFromCart(item.cartKey)
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}

                        <Link to="/products" className="cart-continue">
                            ← Continue shopping
                        </Link>
                    </section>

                    {/* Order summary */}
                    <aside className="cart-summary">
                        <h2>Order Summary</h2>

                        <div className="cart-summary-row">
                            <span>Subtotal ({cartCount} items)</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <div className="cart-summary-row">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>

                        <div className="cart-summary-total">
                            <span>Total</span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>

                        <p className="cart-shipping-note">
                            Shipping charges, if applicable, will be
                            confirmed at checkout.
                        </p>

                        {/* Navigate to checkout */}
                        <Link
                            to="/checkout"
                            className="cart-checkout-btn"
                        >
                            PROCEED TO CHECKOUT
                        </Link>

                        <p className="cart-secure-note">
                            A little something for your everyday.
                        </p>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default Cart;
