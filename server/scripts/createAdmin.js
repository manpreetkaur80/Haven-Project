
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

async function createAdmin() {
    try {
        if (
            !process.env.MONGO_URI ||
            !process.env.ADMIN_EMAIL ||
            !process.env.ADMIN_PASSWORD ||
            !process.env.JWT_SECRET
        ) {
            throw new Error(
                "MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD and JWT_SECRET must be configured."
            );
        }

        if (process.env.ADMIN_PASSWORD.length < 12) {
            throw new Error(
                "Use an administrator password with at least 12 characters."
            );
        }

        await mongoose.connect(process.env.MONGO_URI);

        const email = process.env.ADMIN_EMAIL.trim().toLowerCase();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.role === "admin") {
                console.log("This administrator account already exists.");
            } else {
                console.log(
                    "This email already belongs to a customer account. No role was changed."
                );
            }

            return;
        }

        await User.create({
            name: process.env.ADMIN_NAME || "HAVEN Administrator",
            email,
            password: process.env.ADMIN_PASSWORD,
            role: "admin"
        });

        console.log("HAVEN administrator created successfully.");
        console.log(`Admin email: ${email}`);
    } catch (error) {
        console.error("Admin setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
}

createAdmin();
