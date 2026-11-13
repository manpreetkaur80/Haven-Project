import { useState } from "react";
import { subscribeToNewsletter } from "../services/api";
import "../styles/newsletter.css";

function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle | sending | done | error
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setStatus("sending");
        setMessage("");

        try {
            const result = await subscribeToNewsletter(email);
            setStatus("done");
            setMessage(result.message || "Thank you. You're on the list.");
            setEmail("");
        } catch (error) {
            setStatus("error");
            setMessage(error.message || "Could not subscribe right now.");
        }
    }

    return (
        <section className="haven-news" aria-labelledby="news-title">
            <div className="haven-news-inner">
                <div>
                    <p className="haven-news-eyebrow">Stay in touch</p>
                    <h2 id="news-title">New pieces, first.</h2>
                    <p className="haven-news-text">
                        Be the first to hear about new arrivals and seasonal edits.
                    </p>
                </div>

                <form className="haven-news-form" onSubmit={handleSubmit} noValidate>
                    <label htmlFor="news-email" className="haven-news-sr">
                        Email address
                    </label>
                    <div className="haven-news-field">
                        <input
                            id="news-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="Your email address"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                        <button type="submit" disabled={status === "sending"}>
                            {status === "sending" ? "Sending" : "Subscribe"}
                        </button>
                    </div>
                    <p
                        className={`haven-news-message ${status === "error" ? "is-error" : ""}`}
                        role="status"
                    >
                        {message}
                    </p>
                </form>
            </div>
        </section>
    );
}

export default Newsletter;
