import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getAdminCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from "../services/api";

const emptyForm = {
    code: "",
    description: "",
    discountType: "percent",
    value: "",
    maxDiscount: "",
    minOrderAmount: "",
    usageLimit: "",
    expiresAt: "",
};

function formatRupees(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function describeOffer(coupon) {
    if (coupon.discountType === "percent") {
        return `${coupon.value}% off${
            coupon.maxDiscount > 0 ? ` (up to ${formatRupees(coupon.maxDiscount)})` : ""
        }`;
    }
    return `${formatRupees(coupon.value)} off`;
}

function couponState(coupon) {
    if (!coupon.isActive) return { label: "Paused", tone: "muted" };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
        return { label: "Expired", tone: "bad" };
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
        return { label: "Used up", tone: "bad" };
    return { label: "Live", tone: "good" };
}

function AdminCoupons() {
    const { token } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function load() {
        setLoading(true);
        try {
            const result = await getAdminCoupons(token);
            setCoupons(Array.isArray(result.coupons) ? result.coupons : []);
        } catch (err) {
            setError(err.message || "Unable to load discount codes.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function setField(name, value) {
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            await createCoupon(token, form);
            setMessage(`Code ${form.code.trim().toUpperCase()} created.`);
            setForm(emptyForm);
            await load();
        } catch (err) {
            setError(err.message || "Unable to create the code.");
        } finally {
            setSaving(false);
        }
    }

    async function toggle(coupon) {
        setError("");
        setMessage("");
        try {
            await updateCoupon(token, coupon._id, { isActive: !coupon.isActive });
            await load();
        } catch (err) {
            setError(err.message || "Unable to update the code.");
        }
    }

    async function remove(coupon) {
        if (!window.confirm(`Delete ${coupon.code}? Past orders keep their discount.`)) return;
        setError("");
        setMessage("");
        try {
            await deleteCoupon(token, coupon._id);
            setMessage(`Code ${coupon.code} deleted.`);
            await load();
        } catch (err) {
            setError(err.message || "Unable to delete the code.");
        }
    }

    const isPercent = form.discountType === "percent";

    return (
        <main className="admin-coupons-page">
            <header className="admin-page-head">
                <div>
                    <p className="admin-eyebrow">Promotions</p>
                    <h1>Discount codes</h1>
                    <p>Create codes customers can enter at checkout.</p>
                </div>
            </header>

            {error && (
                <p role="alert" className="admin-alert admin-alert-error">
                    {error}
                </p>
            )}
            {message && (
                <p role="status" className="admin-alert admin-alert-ok">
                    {message}
                </p>
            )}

            <form className="coupon-form" onSubmit={handleSubmit}>
                <h2 className="admin-h2">New code</h2>

                <div className="coupon-grid">
                    <label>
                        Code
                        <input
                            required
                            value={form.code}
                            onChange={(e) => setField("code", e.target.value.toUpperCase())}
                            placeholder="WELCOME10"
                            maxLength={30}
                        />
                    </label>

                    <label>
                        Type
                        <select
                            value={form.discountType}
                            onChange={(e) => setField("discountType", e.target.value)}
                        >
                            <option value="percent">Percentage off</option>
                            <option value="flat">Fixed amount off (₹)</option>
                        </select>
                    </label>

                    <label>
                        {isPercent ? "Percent (1–90)" : "Amount off (₹)"}
                        <input
                            required
                            type="number"
                            min="1"
                            max={isPercent ? 90 : undefined}
                            value={form.value}
                            onChange={(e) => setField("value", e.target.value)}
                        />
                    </label>

                    {isPercent && (
                        <label>
                            Max discount (₹, optional)
                            <input
                                type="number"
                                min="0"
                                value={form.maxDiscount}
                                onChange={(e) => setField("maxDiscount", e.target.value)}
                                placeholder="No cap"
                            />
                        </label>
                    )}

                    <label>
                        Minimum order (₹, optional)
                        <input
                            type="number"
                            min="0"
                            value={form.minOrderAmount}
                            onChange={(e) => setField("minOrderAmount", e.target.value)}
                            placeholder="None"
                        />
                    </label>

                    <label>
                        Total uses (optional)
                        <input
                            type="number"
                            min="0"
                            value={form.usageLimit}
                            onChange={(e) => setField("usageLimit", e.target.value)}
                            placeholder="Unlimited"
                        />
                    </label>

                    <label>
                        Expires on (optional)
                        <input
                            type="date"
                            value={form.expiresAt}
                            onChange={(e) => setField("expiresAt", e.target.value)}
                        />
                    </label>

                    <label className="coupon-wide">
                        Note for you (optional)
                        <input
                            value={form.description}
                            onChange={(e) => setField("description", e.target.value)}
                            placeholder="Diwali campaign"
                            maxLength={120}
                        />
                    </label>
                </div>

                <button type="submit" className="admin-btn" disabled={saving}>
                    {saving ? "Saving…" : "Create code"}
                </button>
            </form>

            <h2 className="admin-h2">
                All codes <span>({coupons.length})</span>
            </h2>

            {loading ? (
                <p className="admin-loading">Loading…</p>
            ) : coupons.length === 0 ? (
                <p className="admin-loading">No codes yet. Create your first one above.</p>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Offer</th>
                                <th>Min order</th>
                                <th>Used</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => {
                                const state = couponState(coupon);
                                return (
                                    <tr key={coupon._id}>
                                        <td>
                                            <strong>{coupon.code}</strong>
                                            {coupon.description && (
                                                <div className="coupon-note">{coupon.description}</div>
                                            )}
                                        </td>
                                        <td>{describeOffer(coupon)}</td>
                                        <td>{coupon.minOrderAmount > 0 ? formatRupees(coupon.minOrderAmount) : "—"}</td>
                                        <td>
                                            {coupon.usedCount}
                                            {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ""}
                                        </td>
                                        <td>
                                            {coupon.expiresAt
                                                ? new Date(coupon.expiresAt).toLocaleDateString("en-IN")
                                                : "Never"}
                                        </td>
                                        <td>
                                            <span className={`coupon-state coupon-state-${state.tone}`}>
                                                {state.label}
                                            </span>
                                        </td>
                                        <td className="coupon-actions">
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn-ghost admin-btn-sm"
                                                onClick={() => toggle(coupon)}
                                            >
                                                {coupon.isActive ? "Pause" : "Resume"}
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn-ghost admin-btn-sm"
                                                onClick={() => remove(coupon)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

export default AdminCoupons;
