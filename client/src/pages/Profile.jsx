import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyProfile,
  updateMyProfile,
  getMyOrders,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
} from "../services/api";
import "../styles/profile.css";

const emptyAddress = {
  label: "Home",
  recipientName: "",
  phone: "",
  addressLine: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

function Profile() {
  const { token, user, logout } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    addresses: [],
  });
  const [orders, setOrders] = useState([]);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleError = (err) => {
    if (/session|log in|token|unauthorized/i.test(err.message)) {
      logout();
      return;
    }
    setError(err.message);
  };

  const loadProfile = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [profileResult, orderResult] = await Promise.all([
        getMyProfile(token),
        getMyOrders(token),
      ]);

      setProfile(profileResult.user);
      setProfileForm({
        name: profileResult.user.name || "",
        email: profileResult.user.email || "",
        phone: profileResult.user.phone || "",
      });
      setOrders(orderResult.orders || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChange = (event) => {
    setProfileForm({
      ...profileForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await updateMyProfile(token, profileForm);
      setProfile(result.user);
      setProfileForm({
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || "",
      });
      setNotice("Your account details have been updated.");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId(null);
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = editingAddressId
        ? await updateMyAddress(token, editingAddressId, addressForm)
        : await addMyAddress(token, addressForm);

      setProfile((previous) => ({
        ...previous,
        addresses: result.addresses,
      }));

      resetAddressForm();
      setNotice("Your address has been saved.");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const startAddressEdit = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || "Home",
      recipientName: address.recipientName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      isDefault: Boolean(address.isDefault),
    });
    setError("");
    setNotice("");
    document.getElementById("address-editor")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAddressDelete = async (addressId) => {
    if (!window.confirm("Delete this saved address?")) return;

    setError("");
    setNotice("");

    try {
      const result = await deleteMyAddress(token, addressId);
      setProfile((previous) => ({
        ...previous,
        addresses: result.addresses,
      }));
      if (editingAddressId === addressId) resetAddressForm();
      setNotice("Address deleted.");
    } catch (err) {
      handleError(err);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  if (loading) {
    return <main className="profile-page"><p>Loading your HAVEN account…</p></main>;
  }

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <div>
          <p className="profile-eyebrow">YOUR HAVEN</p>
          <h1>My account</h1>
          <p className="profile-intro">
            Your details, your addresses, your orders — all in one place.
          </p>
        </div>
        <Link className="profile-shop-link" to="/products">
          Continue shopping →
        </Link>
      </header>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            {(profile.name || user?.name || "H").charAt(0).toUpperCase()}
          </div>
          <p className="profile-sidebar-name">{profile.name || user?.name}</p>
          <p className="profile-sidebar-email">{profile.email || user?.email}</p>

          <nav className="profile-nav" aria-label="Account sections">
            <button
              className={activeTab === "account" ? "active" : ""}
              onClick={() => setActiveTab("account")}
            >
              Account details
            </button>
            <button
              className={activeTab === "addresses" ? "active" : ""}
              onClick={() => setActiveTab("addresses")}
            >
              Saved addresses
            </button>
            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              My orders <span>{orders.length}</span>
            </button>
          </nav>
        </aside>

        <section className="profile-content">
          {error && <p className="profile-message error">{error}</p>}
          {notice && <p className="profile-message success">{notice}</p>}

          {activeTab === "account" && (
            <section>
              <div className="profile-section-heading">
                <p className="profile-eyebrow">PERSONAL INFORMATION</p>
                <h2>Account details</h2>
                <p>Keep your contact information up to date.</p>
              </div>

              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <label>
                  Full name
                  <input
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    required
                  />
                </label>
                <label>
                  Phone number
                  <input
                    name="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    maxLength={20}
                  />
                </label>
                <button className="profile-primary-button" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </form>
            </section>
          )}

          {activeTab === "addresses" && (
            <section>
              <div className="profile-section-heading">
                <p className="profile-eyebrow">DELIVERY DETAILS</p>
                <h2>Saved addresses</h2>
                <p>Manage where your HAVEN orders should arrive.</p>
              </div>

              {profile.addresses?.length > 0 ? (
                <div className="address-list">
                  {profile.addresses.map((address) => (
                    <article className="address-card" key={address._id}>
                      <div className="address-card-top">
                        <strong>{address.label || "Address"}</strong>
                        {address.isDefault && (
                          <span className="default-address">DEFAULT</span>
                        )}
                      </div>
                      <p>{address.recipientName}</p>
                      <p>{address.addressLine}</p>
                      {address.landmark && <p>{address.landmark}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      <p>{address.phone}</p>
                      <div className="address-actions">
                        <button type="button" onClick={() => startAddressEdit(address)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-link"
                          onClick={() => handleAddressDelete(address._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty">
                  <h3>No saved addresses yet</h3>
                  <p>Add an address to make future checkouts easier.</p>
                </div>
              )}

              <form
                id="address-editor"
                className="profile-form address-form"
                onSubmit={handleAddressSubmit}
              >
                <h3>{editingAddressId ? "Edit address" : "Add a new address"}</h3>

                <label>
                  Address label
                  <select name="label" value={addressForm.label} onChange={handleAddressChange}>
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Recipient name
                  <input name="recipientName" value={addressForm.recipientName} onChange={handleAddressChange} required />
                </label>

                <label>
                  Phone number
                  <input name="phone" type="tel" value={addressForm.phone} onChange={handleAddressChange} required />
                </label>

                <label>
                  Address
                  <textarea name="addressLine" value={addressForm.addressLine} onChange={handleAddressChange} required rows={3} />
                </label>

                <label>
                  Landmark (optional)
                  <input name="landmark" value={addressForm.landmark} onChange={handleAddressChange} />
                </label>

                <div className="profile-form-grid">
                  <label>
                    City
                    <input name="city" value={addressForm.city} onChange={handleAddressChange} required />
                  </label>
                  <label>
                    State
                    <input name="state" value={addressForm.state} onChange={handleAddressChange} required />
                  </label>
                  <label>
                    Postal code
                    <input name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} required />
                  </label>
                  <label>
                    Country
                    <input name="country" value={addressForm.country} onChange={handleAddressChange} required />
                  </label>
                </div>

                <label className="profile-checkbox">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressChange}
                  />
                  Set as my default address
                </label>

                <div className="profile-button-row">
                  <button className="profile-primary-button" disabled={saving}>
                    {saving ? "Saving…" : editingAddressId ? "Update address" : "Save address"}
                  </button>
                  {editingAddressId && (
                    <button type="button" className="profile-secondary-button" onClick={resetAddressForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          {activeTab === "orders" && (
            <section>
              <div className="profile-section-heading">
                <p className="profile-eyebrow">YOUR PURCHASES</p>
                <h2>My orders</h2>
                <p>Your recent orders placed while signed in.</p>
              </div>

              {orders.length === 0 ? (
                <div className="profile-empty">
                  <h3>Your story with HAVEN starts here.</h3>
                  <p>Your account-linked orders will appear here after you place an order while logged in.</p>
                  <Link className="profile-primary-button" to="/products">
                    Explore the collection
                  </Link>
                </div>
              ) : (
                <div className="order-list">
                  {orders.map((order) => (
                    <article className="order-card" key={order._id}>
                      <div className="order-card-heading">
                        <div>
                          <p className="order-label">ORDER</p>
                          <strong>#{String(order._id).slice(-8).toUpperCase()}</strong>
                        </div>
                        <span className="order-status">
                          {order.orderStatus || "Placed"}
                        </span>
                      </div>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="order-items">
                        {(order.items || []).map((item, index) => (
                          <div className="order-item" key={`${item.product || item.name}-${index}`}>
                            {item.image ? (
                              <img src={item.image} alt={item.name || "Product"} />
                            ) : (
                              <div className="order-image-placeholder">H</div>
                            )}
                            <div>
                              <strong>{item.name}</strong>
                              <p>Qty: {item.quantity}{item.size ? ` · Size ${item.size}` : ""}</p>
                            </div>
                            <span>{formatCurrency((item.price || 0) * (item.quantity || 0))}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-card-footer">
                        <span>{order.paymentMethod || "COD"}</span>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;