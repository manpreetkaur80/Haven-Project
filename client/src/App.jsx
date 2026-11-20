
import { useEffect } from "react";
import { useLocation, BrowserRouter, Routes, Route } from "react-router-dom";

import Checkout from "./pages/Checkout";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import OrderConfirmation from "./pages/OrderConfirmation";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import AdminOrders from "./admin/AdminOrders";
import AdminLayout from "./components/AdminLayout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AddProduct from "./admin/AddProduct";
import AdminProducts from "./admin/AdminProducts";
import AdminDashboard from "./admin/AdminDashboard";
import AdminCoupons from "./admin/AdminCoupons";
import Orders from "./pages/Orders";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";

import ProtectedRoute from "./components/ProtectedRoute";

const PAGE_TITLES = {
    "/": "HAVEN — Everyday, in your element",
    "/products": "Collection",
    "/female": "Women",
    "/male": "Men",
    "/new-arrivals": "New arrivals",
    "/wishlist": "Wishlist",
    "/cart": "Shopping bag",
    "/checkout": "Checkout",
    "/login": "Log in",
    "/signup": "Create account",
    "/profile": "My account",
    "/orders": "My orders",
};

/* Sets the browser-tab title for each page. */
function useDocumentTitle() {
    const { pathname } = useLocation();

    /* Every new page opens at the top (React Router keeps the old scroll). */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        let title = PAGE_TITLES[pathname];
        if (!title) {
            if (pathname.startsWith("/admin")) title = "Admin";
            else if (pathname.startsWith("/products/")) title = "Product";
            else if (pathname.startsWith("/order-confirmation")) title = "Order placed";
            else if (pathname.startsWith("/orders/")) title = "Track order";
            else title = "Page not found";
        }
        document.title = pathname === "/" ? title : `${title} — HAVEN`;
    }, [pathname]);
}

function CustomerLayout({ children }) {
    const { pathname } = useLocation();
    useDocumentTitle();

    return (
        <>
            <Header />
            {children}
            {pathname !== "/" && <Footer />}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <Routes>
                            {/* Home */}
                            <Route
                                path="/"
                                element={
                                    <CustomerLayout>
                                        <Home />
                                    </CustomerLayout>
                                }
                            />

                            {/* Shopping */}
                            <Route
                                path="/products"
                                element={
                                    <CustomerLayout>
                                        <Products />
                                    </CustomerLayout>
                                }
                            />
                            <Route
                                path="/admin/products"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminLayout>
<AdminProducts />
</AdminLayout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/orders"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminLayout>
<AdminOrders />
</AdminLayout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/products/:id"
                                element={
                                    <CustomerLayout>
                                        <ProductDetails />
                                    </CustomerLayout>
                                }
                            />

                            <Route
                                path="/wishlist"
                                element={
                                    <CustomerLayout>
                                        <Wishlist />
                                    </CustomerLayout>
                                }
                            />

                            <Route
                                path="/female"
                                element={
                                    <CustomerLayout>
                                        <Products category="Women" />
                                    </CustomerLayout>
                                }
                            />

                            <Route
                                path="/male"
                                element={
                                    <CustomerLayout>
                                        <Products category="Men" />
                                    </CustomerLayout>
                                }
                            />

                            <Route
                                path="/new-arrivals"
                                element={
                                    <CustomerLayout>
                                        <Products title="New Arrivals" />
                                    </CustomerLayout>
                                }
                            />

                            {/* Customer profile */}
                            <Route
                                path="/profile"
                                element={
                                    <CustomerLayout>
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    </CustomerLayout>
                                }
                            />

                            <Route
                                path="/orders"
                                element={
                                    <CustomerLayout>
                                        <ProtectedRoute>
                                            <Orders />
                                        </ProtectedRoute>
                                    </CustomerLayout>
                                }
                            />
                            <Route
                                path="/orders/:id"
                                element={
                                    <CustomerLayout>
                                        <ProtectedRoute>
                                            <Orders />
                                        </ProtectedRoute>
                                    </CustomerLayout>
                                }
                            />

                            {/* Cart and checkout */}
                            <Route
                                path="/cart"
                                element={
                                    <CustomerLayout>
                                        <Cart />
                                    </CustomerLayout>
                                }
                            />

                            <Route
                                path="/checkout"
                                element={
                                    <CustomerLayout>
                                        <Checkout />
                                    </CustomerLayout>
                                }
                            />

                            <Route
                                path="/order-confirmation/:id"
                                element={
                                    <CustomerLayout>
                                        <OrderConfirmation />
                                    </CustomerLayout>
                                }
                            />

                            {/* Customer authentication */}
                            <Route
                                path="/login"
                                element={
                                    <CustomerLayout>
                                        <Login />
                                    </CustomerLayout>
                                }
                            />

                            <Route
                                path="/signup"
                                element={
                                    <CustomerLayout>
                                        <Signup />
                                    </CustomerLayout>
                                }
                            />

                            {/* Admin login */}
                            <Route
                                path="/admin/login"
                                element={<Login adminOnly />}
                            />

                            {/* Protected admin pages */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminLayout>
<AdminDashboard />
</AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin/products/new"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminLayout>
<AddProduct />
</AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin/coupons"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminLayout>
                                            <AdminCoupons />
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Fallback */}
                            <Route
                                path="*"
                                element={
                                    <CustomerLayout>
                                        <NotFound />
                                    </CustomerLayout>
                                }
                            />
                        </Routes>
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
