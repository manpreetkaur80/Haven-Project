import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/api";
import "../styles/auth.css";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("The two passwords don’t match.");
            return;
        }

        setSubmitting(true);
        try {
            await resetPassword(token, password);
            setDone(true);
            setTimeout(() => navigate("/login", { replace: true }), 2500);
        } catch (err) {
            setError(err.message || "Unable to reset your password.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <Link to="/" className="auth-brand">HAVEN</Link>

                <p className="auth-eyebrow">ACCOUNT HELP</p>
                <h1>Choose a new password</h1>

                {done ? (
                    <>
                        <p className="auth-description">
                            Your password has been updated. Taking you to log in…
                        </p>
                        <p className="auth-switch">
                            <Link to="/login">Log in now</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <p className="auth-description">
                            Use at least 8 characters.
                        </p>

                        {error && (
                            <p className="auth-error" role="alert">
                                {error}{" "}
                                {error.includes("expired") && (
                                    <Link to="/forgot-password">Request a new link</Link>
                                )}
                            </p>
                        )}

                        <label htmlFor="password">New password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label htmlFor="confirm">Confirm password</label>
                        <input
                            id="confirm"
                            type="password"
                            autoComplete="new-password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />

                        <button className="auth-button" disabled={submitting}>
                            {submitting ? "Saving..." : "Update password"}
                        </button>
                    </>
                )}
            </form>
        </main>
    );
}

export default ResetPassword;
