const express = require("express");
const {
    validateCoupon,
    listCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} = require("../controllers/couponController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Customer: check a code against their bag.
const customerRouter = express.Router();
customerRouter.post("/validate", authenticate, validateCoupon);

// Admin: manage codes.
const adminRouter = express.Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get("/", listCoupons);
adminRouter.post("/", createCoupon);
adminRouter.patch("/:id", updateCoupon);
adminRouter.delete("/:id", deleteCoupon);

module.exports = { customerRouter, adminRouter };
