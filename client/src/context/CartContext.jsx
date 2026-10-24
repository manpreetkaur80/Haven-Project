
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const CartContext = createContext(null);

const getInitialCart = () => {
    try {
        const savedCart = localStorage.getItem("haven-cart");
        return savedCart ? JSON.parse(savedCart) : [];
    } catch {
        return [];
    }
};

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(getInitialCart);

    useEffect(() => {
        localStorage.setItem("haven-cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, size, color, quantity = 1) => {
        setCartItems((previousItems) => {
            const existingItem = previousItems.find(
                (item) =>
                    item.productId === product._id &&
                    item.size === size &&
                    item.color === color
            );

            if (existingItem) {
                return previousItems.map((item) =>
                    item.cartKey === existingItem.cartKey
                        ? {
                            ...item,
                            quantity: Math.min(
                                item.quantity + quantity,
                                product.stock
                            )
                        }
                        : item
                );
            }

            return [
                ...previousItems,
                {
                    cartKey: `${product._id}-${size}-${color}`,
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0]?.url || "",
                    size,
                    color,
                    quantity: Math.min(quantity, product.stock),
                    stock: product.stock
                }
            ];
        });
    };

    const updateQuantity = (cartKey, quantity) => {
        setCartItems((previousItems) =>
            previousItems.map((item) =>
                item.cartKey === cartKey
                    ? {
                        ...item,
                        quantity: Math.max(
                            1,
                            Math.min(Number(quantity), item.stock)
                        )
                    }
                    : item
            )
        );
    };

    const removeFromCart = (cartKey) => {
        setCartItems((previousItems) =>
            previousItems.filter((item) => item.cartKey !== cartKey)
        );
    };

    const clearCart = () => setCartItems([]);

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                subtotal,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}
