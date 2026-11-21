
const express = require("express");

const {
    signup,
    login,
    getMe,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticate, getMe);

module.exports = router;

