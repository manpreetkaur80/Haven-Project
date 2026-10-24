
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Checkout from "./pages/Checkout";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import AddProduct from "./admin/AddProduct";
import { CartProvider } from "./context/CartContext";
import OrderConfirmation from "./pages/OrderConfirmation";
import Cart from "./pages/Cart";
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
            <CartProvider>
                <Routes>
                    <Route
                        path="/"
                        element={<ComingSoon title="HAVEN Home" />}
                    />

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
                        element={<ComingSoon title="Women's Collection" />}
                    />

                    <Route
                        path="/male"
                        element={<ComingSoon title="Men's Collection" />}
                    />

                    <Route
                        path="/new-arrivals"
                        element={<ComingSoon title="New Arrivals" />}
                    />

                    <Route
                        path="/admin"
                        element={<ComingSoon title="HAVEN Admin Dashboard" />}
                    />

                    <Route
                        path="/admin/products/new"
                        element={<AddProduct />}
                    />

                    <Route
                        path="*"
                        element={<ComingSoon title="Page Not Found" />}
                    />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route
    path="/order-confirmation/:id"
    element={<OrderConfirmation />}
/>
                </Routes>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;
