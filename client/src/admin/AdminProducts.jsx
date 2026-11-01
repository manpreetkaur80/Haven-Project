
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getAdminProducts,
    updateAdminProduct,
    deleteAdminProduct
} from "../services/api";
import "../styles/adminProducts.css";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "Women",
    subcategory: "",
    sizes: "",
    colors: "",
    stock: "",
    isFeatured: false,
    isPublished: true
};

function AdminProducts() {
    const { token, user, loading: authLoading, logout } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const fetchProducts = async () => {
        if (!token) return;

        setLoading(true);
        setError("");

        try {
            const data = await getAdminProducts(token);
            setProducts(data);
        } catch (err) {
            if (err.message?.toLowerCase().includes("token") ||
                err.message?.toLowerCase().includes("log in")) {
                // The server may have rejected an expired session.
                // The user can sign in again.
            }
            setError(err.message || "Unable to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user?.role === "admin") {
            fetchProducts();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [authLoading, token, user]);

    // Create and clean up local image previews
    useEffect(() => {
        const urls = images.map((file) => URL.createObjectURL(file));
        setPreviews(urls);

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);

        setError("");
        setImages([]);

        if (selectedFiles.length > 5) {
            setError("Please select a maximum of 5 additional images.");
            e.target.value = "";
            return;
        }

        const invalidFile = selectedFiles.find(
            (file) => !file.type.startsWith("image/")
        );

        if (invalidFile) {
            setError("Please select image files only.");
            e.target.value = "";
            return;
        }

        const oversizedFile = selectedFiles.find(
            (file) => file.size > 5 * 1024 * 1024
        );

        if (oversizedFile) {
            setError("Each image must be 5 MB or smaller.");
            e.target.value = "";
            return;
        }

        setImages(selectedFiles);
    };

    const openEditForm = (product) => {
        setEditingProduct(product);

        setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price ?? "",
            category: product.category || "Women",
            subcategory: product.subcategory || "",
            sizes: (product.sizes || []).join(", "),
            colors: (product.colors || []).join(", "),
            stock: product.stock ?? 0,
            isFeatured: Boolean(product.isFeatured),
            isPublished: Boolean(product.isPublished)
        });

        setImages([]);
        setError("");
        setMessage("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const closeEditForm = () => {
        setEditingProduct(null);
        setFormData(emptyForm);
        setImages([]);
        setError("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingProduct) return;

        const price = Number(formData.price);
        const stock = Number(formData.stock);

        if (!Number.isFinite(price) || price < 0) {
            setError("Enter a valid product price.");
            return;
        }

        if (!Number.isInteger(stock) || stock < 0) {
            setError("Stock must be a whole number greater than or equal to zero.");
            return;
        }

        const data = new FormData();

        data.append("name", formData.name.trim());
        data.append("description", formData.description.trim());
        data.append("price", String(price));
        data.append("category", formData.category);
        data.append("subcategory", formData.subcategory.trim());
        data.append("sizes", formData.sizes);
        data.append("colors", formData.colors);
        data.append("stock", String(stock));
        data.append("isFeatured", String(formData.isFeatured));
        data.append("isPublished", String(formData.isPublished));

        images.forEach((image) => {
            data.append("images", image);
        });

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const result = await updateAdminProduct(
                token,
                editingProduct._id,
                data
            );

            setMessage(result.message || "Product updated successfully.");
            setEditingProduct(null);
            setFormData(emptyForm);
            setImages([]);

            await fetchProducts();
        } catch (err) {
            setError(err.message || "Unable to update product.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            const result = await deleteAdminProduct(token, product._id);

            setProducts((previous) =>
                previous.filter((item) => item._id !== product._id)
            );

            if (editingProduct?._id === product._id) {
                closeEditForm();
            }

            setMessage(result.message || "Product deleted successfully.");
        } catch (err) {
            setError(err.message || "Unable to delete product.");
        }
    };

    const filteredProducts = products.filter((product) =>
        `${product.name} ${product.category} ${product.subcategory}`
            .toLowerCase()
            .includes(search.toLowerCase().trim())
    );

    if (authLoading || loading && !user) {
        return (
            <main className="admin-products-page">
                <p>Verifying administrator access...</p>
            </main>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <main className="admin-products-page">
                <h1>Administrator access required</h1>
                <Link to="/admin/login">Go to Admin Login</Link>
            </main>
        );
    }

    return (
        <main className="admin-products-page">
            <div className="admin-products-heading">
                <div>
                    <p className="admin-eyebrow">HAVEN ADMINISTRATION</p>
                    <h1>Product Management</h1>
                    <p>Manage your store's products and collections.</p>
                </div>

                <Link
                    to="/admin/products/new"
                    className="admin-add-product-btn"
                >
                    + Add Product
                </Link>
            </div>

            {message && (
                <p className="admin-message" role="status">
                    {message}
                </p>
            )}

            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}

            {editingProduct && (
                <section className="admin-edit-section">
                    <div className="admin-section-heading">
                        <div>
                            <p className="admin-eyebrow">PRODUCT DETAILS</p>
                            <h2>Edit Product</h2>
                        </div>

                        <button
                            type="button"
                            className="admin-cancel-btn"
                            onClick={closeEditForm}
                        >
                            Cancel
                        </button>
                    </div>

                    <form className="admin-edit-form" onSubmit={handleUpdate}>
                        <div className="admin-form-grid">
                            <div className="admin-form-field">
                                <label htmlFor="edit-name">Product Name</label>
                                <input
                                    id="edit-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="edit-category">Category</label>
                                <select
                                    id="edit-category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleFormChange}
                                >
                                    <option value="Women">Women</option>
                                    <option value="Men">Men</option>
                                </select>
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="edit-subcategory">Subcategory</label>
                                <input
                                    id="edit-subcategory"
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="edit-price">Price (₹)</label>
                                <input
                                    id="edit-price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="edit-stock">Stock</label>
                                <input
                                    id="edit-stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.stock}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="edit-sizes">Sizes</label>
                                <input
                                    id="edit-sizes"
                                    name="sizes"
                                    value={formData.sizes}
                                    onChange={handleFormChange}
                                    placeholder="S, M, L, XL"
                                    required
                                />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="edit-colors">Colors</label>
                                <input
                                    id="edit-colors"
                                    name="colors"
                                    value={formData.colors}
                                    onChange={handleFormChange}
                                    placeholder="White, Black, Beige"
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form-field">
                            <label htmlFor="edit-description">Description</label>
                            <textarea
                                id="edit-description"
                                name="description"
                                rows="5"
                                value={formData.description}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="admin-current-images">
                            <h3>Current Images</h3>

                            <div className="admin-image-grid">
                                {(editingProduct.images || []).map((image, index) => (
                                    <img
                                        key={image.publicId || index}
                                        src={image.url}
                                        alt={`${editingProduct.name} ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <p>Existing images are retained when you save changes.</p>
                        </div>

                        <div className="admin-form-field">
                            <label htmlFor="edit-images">Add More Images</label>
                            <input
                                id="edit-images"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                            />
                            <small>
                                Select up to 5 additional images. Each image must
                                be 5 MB or smaller.
                            </small>
                        </div>

                        {previews.length > 0 && (
                            <div className="admin-image-grid">
                                {previews.map((preview, index) => (
                                    <img
                                        key={preview}
                                        src={preview}
                                        alt={`New image preview ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="admin-checkboxes">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleFormChange}
                                />
                                Featured Product
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleFormChange}
                                />
                                Published on Store
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="admin-save-btn"
                            disabled={saving}
                        >
                            {saving ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </form>
                </section>
            )}

            <section className="admin-product-list-section">
                <div className="admin-section-heading">
                    <div>
                        <p className="admin-eyebrow">YOUR CATALOGUE</p>
                        <h2>All Products ({products.length})</h2>
                    </div>

                    <button
                        type="button"
                        className="admin-refresh-btn"
                        onClick={fetchProducts}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                <input
                    className="admin-product-search"
                    type="search"
                    placeholder="Search by product name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {loading ? (
                    <p className="admin-empty-message">Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                    <div className="admin-empty-message">
                        <h3>No products found</h3>
                        <p>Try another search or add a new product.</p>
                    </div>
                ) : (
                    <div className="admin-product-table-wrapper">
                        <table className="admin-product-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="admin-product-info">
                                                {product.images?.[0]?.url ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                    />
                                                ) : (
                                                    <div className="admin-no-image">
                                                        No image
                                                    </div>
                                                )}

                                                <div>
                                                    <strong>{product.name}</strong>
                                                    <small>{product.subcategory}</small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{product.category}</td>

                                        <td>
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </td>

                                        <td>{product.stock}</td>

                                        <td>
                                            <span className={
                                                product.isPublished
                                                    ? "admin-status published"
                                                    : "admin-status unpublished"
                                            }>
                                                {product.isPublished
                                                    ? "Published"
                                                    : "Unpublished"}
                                            </span>

                                            {product.isFeatured && (
                                                <small className="admin-featured-label">
                                                    Featured
                                                </small>
                                            )}
                                        </td>

                                        <td>
                                            <div className="admin-product-actions">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditForm(product)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-delete-btn"
                                                    onClick={() => handleDelete(product)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default AdminProducts;
