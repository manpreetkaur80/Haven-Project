
const API_URL = "http://localhost:5000/api";

const AUTH_URL = `${API_URL}/auth`;
const PROFILE_URL = `${API_URL}/profile`;

// ==============================
// PRODUCTS
// ==============================

// Fetch all published products
export async function getProducts() {
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
        throw new Error("Failed to fetch products.");
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

// ==============================
// AUTHENTICATION
// ==============================

// Register a new user
export async function signupUser(formData) {
    const response = await fetch(`${AUTH_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Unable to create account.");
    }

    return data;
}

// Log in an existing user
export async function loginUser(credentials) {
    const response = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Unable to log in.");
    }

    return data;
}

// Get the currently authenticated user
export async function getCurrentUser(token) {
    if (!token) {
        throw new Error("Please log in to access your account.");
    }

    const response = await fetch(`${AUTH_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to retrieve your account."
        );
    }

    return data.user;
}

// ==============================
// ORDERS
// ==============================

// Create an order in MongoDB
export async function createOrder(orderData, token) {
    if (!token) {
        throw new Error("Please log in before placing an order.");
    }

    const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to place your order. Please try again."
        );
    }

    return data;
}

// ==============================
// PROFILE REQUEST HELPER
// ==============================

async function profileRequest(path, token, options = {}) {
    if (!token) {
        throw new Error("Please log in to access your profile.");
    }

    const response = await fetch(`${PROFILE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}

// ==============================
// PROFILE
// ==============================

// Get the user's profile
export function getMyProfile(token) {
    return profileRequest("/", token);
}

// Update the user's profile
export function updateMyProfile(token, profile) {
    return profileRequest("/", token, {
        method: "PATCH",
        body: JSON.stringify(profile),
    });
}

// Get the user's order history
export function getMyOrders(token) {
    return profileRequest("/orders", token);
}

// ==============================
// SAVED ADDRESSES
// ==============================

// Add a new address
export function addMyAddress(token, address) {
    return profileRequest("/addresses", token, {
        method: "POST",
        body: JSON.stringify(address),
    });
}

// Update an existing address
export function updateMyAddress(token, addressId, address) {
    return profileRequest(`/addresses/${addressId}`, token, {
        method: "PATCH",
        body: JSON.stringify(address),
    });
}

// Delete an address
export function deleteMyAddress(token, addressId) {
    return profileRequest(`/addresses/${addressId}`, token, {
        method: "DELETE",
    });
}
