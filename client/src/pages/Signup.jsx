
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signupUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (form.password.length < 8) {
            setError("Your password must contain at least 8 characters.");
            return;
        }

        setSubmitting(true);

        try {
            const result = await signupUser(form);
            login(result);
            navigate("/", { replace: true });
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

                <p className="auth-eyebrow">A PLACE TO FIND YOUR EVERYDAY</p>
                <h1>Create your account</h1>
                <p className="auth-description">
                    Join HAVEN and make room for your kind of style.
                </p>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <label htmlFor="name">Full name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <button className="auth-button" disabled={submitting}>
                    {submitting ? "Creating account..." : "Create account"}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </main>
    );
}

export default Signup;
