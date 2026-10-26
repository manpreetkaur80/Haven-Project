
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
};

const safeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
});

// Public signup always creates a customer.
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || cleanName.length > 100) {
            return res.status(400).json({
                message: "Please enter a valid name."
            });
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                message: "Password must be between 8 and 128 characters."
            });
        }

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password,
            role: "customer"
        });

        const token = createToken(user);

        return res.status(201).json({
            message: "Account created successfully.",
            token,
            user: safeUser(user)
        });
    } catch (error) {
        // Also handles a duplicate email if two requests race.
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        console.error("Signup error:", error.message);

        return res.status(500).json({
            message: "Unable to create your account."
        });
    }
};

// Login for both customer and administrator accounts.
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = createToken(user);

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: safeUser(user)
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Unable to log in right now."
        });
    }
};

// Return the logged-in user's latest profile from MongoDB.
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User account not found."
            });
        }

        return res.status(200).json({
            user: safeUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch your profile."
        });
    }
};

module.exports = { signup, login, getMe };
