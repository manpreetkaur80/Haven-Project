
// const API_URL = "http://localhost:5000/api";

// const AUTH_URL = `${API_URL}/auth`;
// const PROFILE_URL = `${API_URL}/profile`;

// // ==============================
// // PRODUCTS
// // ==============================

// // Fetch all published products
// export async function getProducts() {
//     const response = await fetch(`${API_URL}/products`);

//     if (!response.ok) {
//         throw new Error("Failed to fetch products.");
//     }

//     return response.json();
// }

// // Fetch a single product by ID
// export async function getProductById(id) {
//     const response = await fetch(`${API_URL}/products/${id}`);

//     if (!response.ok) {
//         if (response.status === 404) {
//             throw new Error("Product not found.");
//         }

//         throw new Error("Failed to fetch product details.");
//     }

//     return response.json();
// }

// // ==============================
// // AUTHENTICATION
// // ==============================

// // Register a new user
// export async function signupUser(formData) {
//     const response = await fetch(`${AUTH_URL}/signup`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//         throw new Error(data.message || "Unable to create account.");
//     }

//     return data;
// }

// // Log in an existing user
// export async function loginUser(credentials) {
//     const response = await fetch(`${AUTH_URL}/login`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(credentials),
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//         throw new Error(data.message || "Unable to log in.");
//     }

//     return data;
// }

// // Get the currently authenticated user
// export async function getCurrentUser(token) {
//     if (!token) {
//         throw new Error("Please log in to access your account.");
//     }

//     const response = await fetch(`${AUTH_URL}/me`, {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//         throw new Error(
//             data.message || "Unable to retrieve your account."
//         );
//     }

//     return data.user;
// }

// // ==============================
// // ORDERS
// // ==============================

// // Create an order in MongoDB
// export async function createOrder(orderData, token) {
//     if (!token) {
//         throw new Error("Please log in before placing an order.");
//     }

//     const response = await fetch(`${API_URL}/orders`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(orderData),
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//         throw new Error(
//             data.message || "Unable to place your order. Please try again."
//         );
//     }

//     return data;
// }

// // ==============================
// // PROFILE REQUEST HELPER
// // ==============================

// async function profileRequest(path, token, options = {}) {
//     if (!token) {
//         throw new Error("Please log in to access your profile.");
//     }

//     const response = await fetch(`${PROFILE_URL}${path}`, {
//         ...options,
//         headers: {
//             "Content-Type": "application/json",
//             ...options.headers,
//             Authorization: `Bearer ${token}`,
//         },
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//         throw new Error(data.message || "Request failed.");
//     }

//     return data;
// }

// // ==============================
// // PROFILE
// // ==============================

// // Get the user's profile
// export function getMyProfile(token) {
//     return profileRequest("/", token);
// }

// // Update the user's profile
// export function updateMyProfile(token, profile) {
//     return profileRequest("/", token, {
//         method: "PATCH",
//         body: JSON.stringify(profile),
//     });
// }

// // Get the user's order history
// export function getMyOrders(token) {
//     return profileRequest("/orders", token);
// }

// // ==============================
// // SAVED ADDRESSES
// // ==============================

// // Add a new address
// export function addMyAddress(token, address) {
//     return profileRequest("/addresses", token, {
//         method: "POST",
//         body: JSON.stringify(address),
//     });
// }

// // Update an existing address
// export function updateMyAddress(token, addressId, address) {
//     return profileRequest(`/addresses/${addressId}`, token, {
//         method: "PATCH",
//         body: JSON.stringify(address),
//     });
// }

// // Delete an address
// export function deleteMyAddress(token, addressId) {
//     return profileRequest(`/addresses/${addressId}`, token, {
//         method: "DELETE",
//     });
// }

// const WISHLIST_URL = `${API_URL}/wishlist`;

// async function wishlistRequest(path, token, options = {}) {
//     if (!token) {
//         throw new Error("Please log in to access your wishlist.");
//     }

//     const response = await fetch(`${WISHLIST_URL}${path}`, {
//         ...options,
//         headers: {
//             ...options.headers,
//             Authorization: `Bearer ${token}`,
//         },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(data.message || "Wishlist request failed.");
//     }

//     return data;
// }

// export function getMyWishlist(token) {
//     return wishlistRequest("", token);
// }

// export function addWishlistItem(token, productId) {
//     return wishlistRequest(`/${productId}`, token, {
//         method: "POST",
//     });
// }

// export function removeWishlistItem(token, productId) {
//     return wishlistRequest(`/${productId}`, token, {
//         method: "DELETE",
//     });
// }

// // ==============================
// // ADMIN PRODUCT MANAGEMENT
// // ==============================

// const ADMIN_PRODUCTS_URL = `${API_URL}/products/admin`;

// async function adminProductRequest(path, token, options = {}) {
//     if (!token) {
//         throw new Error("Please log in as an administrator.");
//     }

//     const response = await fetch(`${ADMIN_PRODUCTS_URL}${path}`, {
//         ...options,
//         headers: {
//             ...options.headers,
//             Authorization: `Bearer ${token}`,
//         },
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//         throw new Error(data.message || "Admin product request failed.");
//     }

//     return data;
// }

// // Get all products, including unpublished products
// export async function getAdminProducts(token) {
//     const data = await adminProductRequest("/all", token);
//     return data.products || data;
// }

// // Update product details and optionally add images
// export async function updateAdminProduct(token, productId, formData) {
//     return adminProductRequest(`/${productId}`, token, {
//         method: "PATCH",
//         body: formData,
//     });
// }

// // Delete a product
// export async function deleteAdminProduct(token, productId) {
//     return adminProductRequest(`/${productId}`, token, {
//         method: "DELETE",
//     });
// }

// // ==============================
// // ADMIN ORDER MANAGEMENT
// // ==============================

// export async function getAdminOrders(token) {
//     if (!token) {
//         throw new Error("Please log in as an administrator.");
//     }

//     const response = await fetch(`${API_URL}/admin/orders`, {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     });

//     const data = await response.json().catch(() => ({}));

//     if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch admin orders.");
//     }

//     return data.orders || [];
// }

// // ==============================
// // CUSTOMER RETURN REQUESTS
// // ==============================

// export function requestOrderReturn(token, orderId, reason) {
//     return profileRequest(`/../orders/${orderId}/return`, token, {
//         method: "POST",
//         body: JSON.stringify({ reason }),
//     });
// }
const API_URL = "http://localhost:5000/api";
const AUTH_URL = `${API_URL}/auth`;
const PROFILE_URL = `${API_URL}/profile`;

// ========================================
// COMMON API HELPER
// ========================================

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

function authHeaders(token, extraHeaders = {}) {
    return {
        ...extraHeaders,
        Authorization: `Bearer ${token}`,
    };
}

function jsonHeaders(token) {
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ========================================
// PRODUCTS
// ========================================

export function getProducts() {
    return apiRequest(`${API_URL}/products`);
}

export function getProductById(productId) {
    return apiRequest(`${API_URL}/products/${productId}`);
}

// ========================================
// AUTHENTICATION
// ========================================

export function signupUser(userData) {
    return apiRequest(`${AUTH_URL}/signup`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(userData),
    });
}

export function loginUser(credentials) {
    return apiRequest(`${AUTH_URL}/login`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(credentials),
    });
}
export async function getCurrentUser(token) {
    const data = await apiRequest(`${AUTH_URL}/me`, {
        headers: authHeaders(token),
    });

    return data.user || data;
}

// ========================================
// CUSTOMER ORDERS
// ========================================

export function createOrder(orderData, token) {
    return apiRequest(`${API_URL}/orders`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(orderData),
    });
}

// ========================================
// PROFILE
// ========================================

async function profileRequest(path, token, options = {}) {
    return apiRequest(`${PROFILE_URL}${path}`, {
        ...options,
        headers: {
            ...jsonHeaders(token),
            ...options.headers,
        },
    });
}

export function getMyProfile(token) {
    return profileRequest("", token);
}

export function updateMyProfile(token, profileData) {
    return profileRequest("", token, {
        method: "PATCH",
        body: JSON.stringify(profileData),
    });
}

export function getMyOrders(token) {
    return profileRequest("/orders", token);
}

// ========================================
// SAVED ADDRESSES
// ========================================

export function addMyAddress(token, addressData) {
    return profileRequest("/addresses", token, {
        method: "POST",
        body: JSON.stringify(addressData),
    });
}

export function updateMyAddress(token, addressId, addressData) {
    return profileRequest(`/addresses/${addressId}`, token, {
        method: "PATCH",
        body: JSON.stringify(addressData),
    });
}

export function deleteMyAddress(token, addressId) {
    return profileRequest(`/addresses/${addressId}`, token, {
        method: "DELETE",
    });
}

// ========================================
// CUSTOMER WISHLIST
// ========================================

export function getMyWishlist(token) {
    return apiRequest(`${API_URL}/wishlist`, {
        headers: authHeaders(token),
    });
}

export function addWishlistItem(token, productId) {
    return apiRequest(`${API_URL}/wishlist`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ productId }),
    });
}

export function removeWishlistItem(token, productId) {
    return apiRequest(`${API_URL}/wishlist/${productId}`, {
        method: "DELETE",
        headers: authHeaders(token),
    });
}

// ========================================
// ADMIN PRODUCTS
// ========================================

export function getAdminProducts(token) {
    return apiRequest(`${API_URL}/products/admin/all`, {
        headers: authHeaders(token),
    });
}

export function createAdminProduct(token, productData) {
    return apiRequest(`${API_URL}/products`, {
        method: "POST",
        headers: authHeaders(token),
        body: productData,
    });
}

export function updateAdminProduct(token, productId, productData) {
    return apiRequest(`${API_URL}/products/admin/${productId}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: productData,
    });
}

export function deleteAdminProduct(token, productId) {
    return apiRequest(`${API_URL}/products/admin/${productId}`, {
        method: "DELETE",
        headers: authHeaders(token),
    });
}
// ========================================
// ADMIN ORDERS
// ========================================

export function getAdminOrders(token) {
    return apiRequest(`${API_URL}/admin/orders`, {
        headers: authHeaders(token),
    });
}

// ========================================
// CUSTOMER RETURN REQUESTS
// ========================================

export function requestOrderReturn(token, orderId, reason) {
    return apiRequest(`${API_URL}/orders/${orderId}/return`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ reason }),
    });
}

// ========================================
// ADMIN RETURN MANAGEMENT
// ========================================

async function adminOrderRequest(path, token, options = {}) {
    return apiRequest(`${API_URL}/admin/orders${path}`, {
        ...options,
        headers: {
            ...jsonHeaders(token),
            ...options.headers,
        },
    });
}

export function reviewReturnRequest(
    token,
    orderId,
    decision,
    adminNote = ""
) {
    return adminOrderRequest(`/${orderId}/return/review`, token, {
        method: "PATCH",
        body: JSON.stringify({ decision, adminNote }),
    });
}

export function markOrderReturned(token, orderId) {
    return adminOrderRequest(`/${orderId}/returned`, token, {
        method: "PATCH",
    });
}

export function markOrderRefunded(token, orderId) {
    return adminOrderRequest(`/${orderId}/refund`, token, {
        method: "PATCH",
    });
}
// ========================================
// REVIEWS
// ========================================

export function getLatestReviews() {
    return apiRequest(`${API_URL}/reviews/latest`);
}

export function getProductReviews(productId) {
    return apiRequest(`${API_URL}/reviews/product/${productId}`);
}

export function createProductReview(token, productId, review) {
    return apiRequest(`${API_URL}/reviews/product/${productId}`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(review),
    });
}

// ========================================
// NEWSLETTER
// ========================================

export function subscribeToNewsletter(email) {
    return apiRequest(`${API_URL}/newsletter`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ email }),
    });
}
