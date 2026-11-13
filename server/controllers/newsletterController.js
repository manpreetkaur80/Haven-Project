const Subscriber = require("../models/Subscriber");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Subscribe an email address (public, idempotent)
const subscribe = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();

        if (!EMAIL_PATTERN.test(email) || email.length > 254) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        await Subscriber.updateOne(
            { email },
            { $setOnInsert: { email } },
            { upsert: true }
        );

        // Same response whether new or existing: do not reveal who is subscribed
        res.status(201).json({ message: "Thank you. You're on the list." });
    } catch (error) {
        console.error("Newsletter error:", error);
        res.status(500).json({ message: "Could not subscribe right now." });
    }
};

module.exports = { subscribe };
