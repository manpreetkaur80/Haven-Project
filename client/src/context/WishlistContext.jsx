
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
    getMyWishlist,
    addWishlistItem,
    removeWishlistItem,
} from "../services/api";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { token, user, loading: authLoading } = useAuth();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadWishlist() {
            if (authLoading) return;

            if (!token) {
                setWishlistItems([]);
                setError("");
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const data = await getMyWishlist(token);

                if (active) {
                    setWishlistItems(data.wishlist || []);
                    setError("");
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Could not load wishlist.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadWishlist();

        return () => {
            active = false;
        };
    }, [token, user, authLoading]);

    async function addToWishlist(productId) {
        if (!token) {
            throw new Error("Please log in to save products.");
        }

        const data = await addWishlistItem(token, productId);
        setWishlistItems(data.wishlist || []);
        return data;
    }

    async function removeFromWishlist(productId) {
        if (!token) {
            throw new Error("Please log in to manage your wishlist.");
        }

        const data = await removeWishlistItem(token, productId);
        setWishlistItems(data.wishlist || []);
        return data;
    }

    function isWishlisted(productId) {
        return wishlistItems.some(
            (product) => product._id === productId
        );
    }

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                wishlistCount: wishlistItems.length,
                loading,
                error,
                addToWishlist,
                removeFromWishlist,
                isWishlisted,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error(
            "useWishlist must be used inside WishlistProvider"
        );
    }

    return context;
}
