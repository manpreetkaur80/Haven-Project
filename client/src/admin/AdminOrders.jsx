
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api";

const ORDER_STATUSES = [
    "Placed",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Return Requested",
    "Returned",
    "Refunded",
];

function AdminOrders() {
    const { token, user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Fetch all orders
    const fetchOrders = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/admin/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not fetch orders.");
            }

            setOrders(data.orders || []);

            // Keep selected order updated after refreshing
            if (selectedOrder) {
                const updatedSelected = (data.orders || []).find(
                    (order) => order._id === selectedOrder._id
                );

                setSelectedOrder(updatedSelected || null);

                if (updatedSelected) {
                    setSelectedStatus(updatedSelected.orderStatus);
                }
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && user?.role === "admin") {
            fetchOrders();
        }
    }, [token, user]);

    // Select an order
    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
        setSelectedStatus(order.orderStatus || "Placed");
        setMessage("");
        setError("");
    };

    // Update order status
    const handleUpdateStatus = async () => {
        if (!selectedOrder || !selectedStatus) return;

        setUpdating(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/admin/orders/${selectedOrder._id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderStatus: selectedStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not update order.");
            }

            setOrders((previous) =>
                previous.map((order) =>
                    order._id === data.order._id ? data.order : order
                )
            );

            setSelectedOrder(data.order);
            setSelectedStatus(data.order.orderStatus);
            setMessage("Order status updated successfully.");
        } catch (err) {
            setError(err.message || "Could not update order.");
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount || 0);

    const formatDate = (date) =>
        new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    if (loading) {
        return <main><p>Loading orders...</p></main>;
    }

    return (
        <main style={{ padding: "30px" }}>
            <h1>Manage Orders</h1>
            <p>View customer orders and update their status.</p>

            {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
            {message && <p role="status" style={{ color: "green" }}>{message}</p>}

            <button type="button" onClick={fetchOrders}>
                Refresh Orders
            </button>

            <h2>All Orders ({orders.length})</h2>

            {orders.length === 0 ? (
                <p>No orders have been placed yet.</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table
                        border="1"
                        cellPadding="12"
                        cellSpacing="0"
                        width="100%"
                    >
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Payment</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>#{order._id.slice(-8).toUpperCase()}</td>
                                    <td>{order.customer?.fullName || "Customer"}</td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                    <td>{order.orderStatus}</td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectOrder(order)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <section style={{ marginTop: "40px" }}>
                    <h2>
                        Order #{selectedOrder._id.slice(-8).toUpperCase()}
                    </h2>

                    <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                    >
                        Close Details
                    </button>

                    <h3>Customer Details</h3>
                    <p><strong>Name:</strong> {selectedOrder.customer?.fullName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>

                    <h3>Shipping Address</h3>
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>
                        {selectedOrder.shippingAddress?.city},{" "}
                        {selectedOrder.shippingAddress?.state}
                    </p>
                    <p>PIN: {selectedOrder.shippingAddress?.pincode}</p>

                    <h3>Products Ordered</h3>

                    {selectedOrder.items?.map((item, index) => (
                        <div
                            key={`${item.product || item.name}-${index}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                                marginBottom: "15px",
                            }}
                        >
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    width="70"
                                    height="85"
                                    style={{ objectFit: "cover" }}
                                />
                            )}

                            <div>
                                <strong>{item.name}</strong>
                                <p>Quantity: {item.quantity}</p>
                                <p>Size: {item.size || "N/A"}</p>
                                <p>Color: {item.color || "N/A"}</p>
                                <p>Price: {formatCurrency(item.price)}</p>
                            </div>
                        </div>
                    ))}

                    <h3>Payment Summary</h3>
                    <p>Subtotal: {formatCurrency(selectedOrder.subtotal)}</p>
                    <p>Shipping: {formatCurrency(selectedOrder.shippingFee)}</p>
                    <p>
                        <strong>Total: {formatCurrency(selectedOrder.totalAmount)}</strong>
                    </p>
                    <p>Payment Method: {selectedOrder.paymentMethod}</p>
                    <p>Payment Status: {selectedOrder.paymentStatus}</p>

                    <h3>Update Order Status</h3>

                    <select
                        value={selectedStatus}
                        onChange={(event) => setSelectedStatus(event.target.value)}
                    >
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={
                            updating ||
                            selectedStatus === selectedOrder.orderStatus
                        }
                    >
                        {updating ? "Updating..." : "Update Status"}
                    </button>
                </section>
            )}
        </main>
    );
}

export default AdminOrders;
