import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/api";
import "../styles/auth.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await requestPasswordReset(email);
            setSent(true);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <Link to="/" className="auth-brand">HAVEN</Link>

                <p className="auth-eyebrow">ACCOUNT HELP</p>
                <h1>Forgot your password?</h1>

                {sent ? (
                    <>
                        <p className="auth-description">
                            If an account exists for <b>{email}</b>, a reset link
                            is on its way. It works for 30 minutes — check your
                            spam folder too.
                        </p>
                        <p className="auth-switch">
                            <Link to="/login">Back to log in</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <p className="auth-description">
                            Enter your email and we’ll send you a link to choose a
                            new password.
                        </p>

                        {error && <p className="auth-error" role="alert">{error}</p>}

                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button className="auth-button" disabled={submitting}>
                            {submitting ? "Sending..." : "Send reset link"}
                        </button>

                        <p className="auth-switch">
                            Remembered it? <Link to="/login">Log in</Link>
                        </p>
                    </>
                )}
            </form>
        </main>
    );
}

export default ForgotPassword;
