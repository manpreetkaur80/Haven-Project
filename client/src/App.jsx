
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Checkout from "./pages/Checkout";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import OrderConfirmation from "./pages/OrderConfirmation";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

import Header from "./components/Header";
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

function CustomerLayout({ children }) {
    return (
        <>
            <Header />
            {children}
        </>
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
                            element={
                                <CustomerLayout>
                                    <ComingSoon title="HAVEN Home" />
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
                            path="/products/:id"
                            element={
                                <CustomerLayout>
                                    <ProductDetails />
                                </CustomerLayout>
                            }
                        />

                        <Route
                            path="/female"
                            element={
                                <CustomerLayout>
                                    <ComingSoon title="Women's Collection" />
                                </CustomerLayout>
                            }
                        />

                        <Route
                            path="/male"
                            element={
                                <CustomerLayout>
                                    <ComingSoon title="Men's Collection" />
                                </CustomerLayout>
                            }
                        />

                        <Route
                            path="/new-arrivals"
                            element={
                                <CustomerLayout>
                                    <ComingSoon title="New Arrivals" />
                                </CustomerLayout>
                            }
                        />

                        {/* Customer Profile */}
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

                        {/* Admin login: separate from customer layout */}
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
                            element={
                                <CustomerLayout>
                                    <ComingSoon title="Page Not Found" />
                                </CustomerLayout>
                            }
                        />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
