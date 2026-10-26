
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Checkout from "./pages/Checkout";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import OrderConfirmation from "./pages/OrderConfirmation";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import AddProduct from "./admin/AddProduct";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function ComingSoon({ title }) {
    return (
        <main style={{ padding: "40px" }}>
            <h1>{title}</h1>
            <p>This HAVEN page is coming soon.</p>
        </main>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        {/* Home */}
                        <Route
                            path="/"
                            element={<ComingSoon title="HAVEN Home" />}
                        />

                        {/* Shopping */}
                        <Route
                            path="/products"
                            element={<Products />}
                        />

                        <Route
                            path="/products/:id"
                            element={<ProductDetails />}
                        />

                        <Route
                            path="/female"
                            element={
                                <ComingSoon title="Women's Collection" />
                            }
                        />

                        <Route
                            path="/male"
                            element={
                                <ComingSoon title="Men's Collection" />
                            }
                        />

                        <Route
                            path="/new-arrivals"
                            element={
                                <ComingSoon title="New Arrivals" />
                            }
                        />

                        {/* Cart and checkout */}
                        <Route
                            path="/cart"
                            element={<Cart />}
                        />

                        <Route
                            path="/checkout"
                            element={<Checkout />}
                        />

                        <Route
                            path="/order-confirmation/:id"
                            element={<OrderConfirmation />}
                        />

                        {/* Customer authentication */}
                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/signup"
                            element={<Signup />}
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
                                    <ComingSoon title="HAVEN Admin Dashboard" />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/products/new"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AddProduct />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback */}
                        <Route
                            path="*"
                            element={<ComingSoon title="Page Not Found" />}
                        />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
