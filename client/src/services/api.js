
const API_URL = "http://localhost:5000/api";

// Fetch all published products
export async function getProducts() {
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}

// Fetch a single product by ID
export async function getProductById(id) {
    const response = await fetch(`${API_URL}/products/${id}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Product not found.");
        }

        throw new Error("Failed to fetch product details.");
    }

    return response.json();
}

// Create a real order in MongoDB through the backend API
export async function createOrder(orderData) {
    const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to place your order. Please try again."
        );
    }

    return data;
}

const AUTH_URL = "http://localhost:5000/api/auth";

export async function signupUser(formData) {
    const response = await fetch(`${AUTH_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Unable to create account.");
    }

    return data;
}

export async function loginUser(credentials) {
    const response = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Unable to log in.");
    }

    return data;
}

export async function getCurrentUser(token) {
    const response = await fetch(`${AUTH_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Unable to retrieve your account.");
    }

    return data.user;
}
