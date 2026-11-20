
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ImageDropzone from "../components/ImageDropzone";
import TagInput from "../components/TagInput";
import "../styles/admin.css";

const SIZE_SUGGESTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_SUGGESTIONS = ["Black", "White", "Beige", "Navy", "Brown", "Olive"];

const initialFormData = {
    name: "",
    description: "",
    price: "",
    category: "Women",
    subcategory: "",
    sizes: "",
    colors: "",
    stock: ""
};

function AddProduct() {
    const navigate = useNavigate();
    const { token, user, loading: authLoading, logout } = useAuth();

    const [formData, setFormData] = useState(initialFormData);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        if (authLoading) {
            setError("Please wait while your account is verified.");
            setLoading(false);
            return;
        }

        if (!token || user?.role !== "admin") {
            setError("Administrator login is required to add products.");
            setLoading(false);
            return;
        }

        const price = Number(formData.price);
        const stock = Number(formData.stock);

        if (
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            setError("Enter a valid price and a whole-number stock quantity.");
            setLoading(false);
            return;
        }

        if (!formData.sizes.trim() || !formData.colors.trim()) {
            setError("Add at least one size and one colour.");
            setLoading(false);
            return;
        }

        const productData = new FormData();

        productData.append("name", formData.name.trim());
        productData.append("description", formData.description.trim());
        productData.append("price", formData.price);
        productData.append("category", formData.category);
        productData.append("subcategory", formData.subcategory.trim());
        productData.append("sizes", formData.sizes);
        productData.append("colors", formData.colors);
        productData.append("stock", formData.stock);

        images.forEach((image) => {
            productData.append("images", image);
        });

        try {
            const response = await fetch(
                "http://localhost:5000/api/products",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: productData
                }
            );

            const result = await response.json().catch(() => ({}));

            if (response.status === 401) {
                logout();
                navigate("/admin/login", { replace: true });
                return;
            }

            if (response.status === 403) {
                throw new Error(
                    "You don't have permission to add products."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Could not save the product."
                );
            }

            setMessage(
                result.message || "Product saved successfully!"
            );

            setFormData({ ...initialFormData });
            setImages([]);

        } catch (err) {
            setError(
                err.message ||
                "Could not connect to the server. Check that your backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <main className="admin-product-page">
                <p>Verifying administrator access...</p>
            </main>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <main className="admin-product-page">
                <h1>Administrator access required</h1>
                <p>Please sign in with your HAVEN administrator account.</p>
                <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                >
                    Go to Admin Login
                </button>
            </main>
        );
    }

    return (
        <main className="admin-product-page">
            <header className="admin-page-head">
                <div>
                    <p className="admin-eyebrow">Catalogue</p>
                    <h1>Add new product</h1>
                    <p>Enter the details for your HAVEN collection.</p>
                </div>
            </header>

            {message && (
                <p role="status" className="admin-alert admin-alert-ok">
                    {message}
                </p>
            )}

            {error && (
                <p role="alert" className="admin-alert admin-alert-error">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="product-form">
                <label htmlFor="name">Product Name</label>
                <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="price">Price (₹)</label>
                <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                </select>

                <label htmlFor="subcategory">Subcategory</label>
                <input
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    placeholder="e.g. Shirts, T-Shirts, Trousers"
                    required
                />

                <label htmlFor="sizes">Sizes</label>
                <TagInput
                    id="sizes"
                    value={formData.sizes}
                    onChange={(value) =>
                        setFormData((previous) => ({ ...previous, sizes: value }))
                    }
                    placeholder="Type a size and press Enter"
                    suggestions={SIZE_SUGGESTIONS}
                />

                <label htmlFor="colors">Colours</label>
                <TagInput
                    id="colors"
                    value={formData.colors}
                    onChange={(value) =>
                        setFormData((previous) => ({ ...previous, colors: value }))
                    }
                    placeholder="Type a colour and press Enter"
                    suggestions={COLOR_SUGGESTIONS}
                />

                <label htmlFor="stock">Stock Quantity</label>
                <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                />

                <ImageDropzone
                    label="Product images — the first one is the main photo"
                    files={images}
                    onChange={setImages}
                    onError={setError}
                />

                <button type="submit" className="admin-btn" disabled={loading}>
                    {loading ? "Uploading Product..." : "Save Product"}
                </button>
            </form>
        </main>
    );
}

export default AddProduct;
