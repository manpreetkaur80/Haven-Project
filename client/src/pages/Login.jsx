
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Login({ adminOnly = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const result = await loginUser({ email, password });

            if (adminOnly && result.user.role !== "admin") {
                setError("You do not have administrator access.");
                return;
            }

            login(result);

            if (result.user.role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate(location.state?.from || "/", { replace: true });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <Link to="/" className="auth-brand">HAVEN</Link>

                <p className="auth-eyebrow">
                    {adminOnly ? "ADMINISTRATION" : "WELCOME BACK"}
                </p>

                <h1>{adminOnly ? "Admin sign in" : "Log in to HAVEN"}</h1>

                <p className="auth-description">
                    {adminOnly
                        ? "Sign in with your administrator account."
                        : "Sign in to continue your HAVEN experience."}
                </p>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />

                <button className="auth-button" disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign in"}
                </button>

                {!adminOnly && (
                    <p className="auth-switch">
                        New to HAVEN? <Link to="/signup">Create an account</Link>
                    </p>
                )}

                {adminOnly && (
                    <p className="auth-switch">
                        Authorized administrators only.
                    </p>
                )}
            </form>
        </main>
    );
}

export default Login;
