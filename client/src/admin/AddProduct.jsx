
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/products.css";

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
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const urls = images.map((image) => URL.createObjectURL(image));
        setPreviews(urls);

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);

        setError("");
        setMessage("");

        if (selectedFiles.length > 5) {
            setImages([]);
            setError("Please select a maximum of 5 images.");
            e.target.value = "";
            return;
        }

        const invalidFile = selectedFiles.find(
            (file) => !file.type.startsWith("image/")
        );

        if (invalidFile) {
            setImages([]);
            setError("Please select image files only.");
            e.target.value = "";
            return;
        }

        const oversizedFile = selectedFiles.find(
            (file) => file.size > 5 * 1024 * 1024
        );

        if (oversizedFile) {
            setImages([]);
            setError("Each image must be 5 MB or smaller.");
            e.target.value = "";
            return;
        }

        setImages(selectedFiles);
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

            const fileInput = document.getElementById("images");

            if (fileInput) {
                fileInput.value = "";
            }
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
            <h1>Add New Product</h1>
            <p>Enter the details for your HAVEN collection.</p>

            {message && (
                <p role="status" style={{ color: "green" }}>
                    {message}
                </p>
            )}

            {error && (
                <p role="alert" style={{ color: "crimson" }}>
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
                <input
                    id="sizes"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    placeholder="S, M, L, XL"
                    required
                />

                <label htmlFor="colors">Colors</label>
                <input
                    id="colors"
                    name="colors"
                    value={formData.colors}
                    onChange={handleChange}
                    placeholder="White, Black, Beige"
                    required
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

                <label htmlFor="images">Product Images</label>
                <input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                />

                <p className="image-field-help">
                    Select up to 5 images. Each image must be 5 MB or smaller.
                </p>

                {previews.length > 0 && (
                    <div className="image-preview-grid">
                        {previews.map((preview, index) => (
                            <img
                                key={preview}
                                src={preview}
                                alt={`Product preview ${index + 1}`}
                                className="product-image-preview"
                            />
                        ))}
                    </div>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Uploading Product..." : "Save Product"}
                </button>
            </form>
        </main>
    );
}

export default AddProduct;
